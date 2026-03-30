import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  ThumbnailGeneration,
  GenerateThumbnailRequest,
  GenerateThumbnailResponse,
} from '@/types/thumbnails'

interface UseThumbnailGeneratorReturn {
  result: GenerateThumbnailResponse | null
  history: ThumbnailGeneration[]
  loading: boolean
  historyLoading: boolean
  error: string | null
  generate: (req: GenerateThumbnailRequest) => Promise<void>
  fetchHistory: () => Promise<void>
  toggleFavorite: (id: number, current: boolean) => Promise<void>
  deleteGeneration: (id: number) => Promise<void>
}

async function callEdgeFunction(body: object): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-thumbnail`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    },
  )
}

export function useThumbnailGenerator(): UseThumbnailGeneratorReturn {
  const [result, setResult] = useState<GenerateThumbnailResponse | null>(null)
  const [history, setHistory] = useState<ThumbnailGeneration[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (req: GenerateThumbnailRequest) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await callEdgeFunction(req)

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`)
      }

      const data: GenerateThumbnailResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('thumbnail_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('Failed to fetch history:', fetchError)
        setError(fetchError.message)
      } else {
        setHistory((data as ThumbnailGeneration[]) ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const toggleFavorite = useCallback(async (id: number, current: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('thumbnail_generations')
        .update({ is_favorite: !current })
        .eq('id', id)

      if (updateError) {
        console.error('Failed to toggle favorite:', updateError)
        setError(updateError.message)
        return
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_favorite: !current } : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite')
    }
  }, [])

  const deleteGeneration = useCallback(async (id: number) => {
    try {
      // Find the item to get image_path before deleting
      const item = history.find((h) => h.id === id)

      const { error: deleteError } = await supabase
        .from('thumbnail_generations')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Failed to delete generation:', deleteError)
        setError(deleteError.message)
        return
      }

      // Delete the file from storage if image_path exists
      if (item?.image_path) {
        const { error: storageError } = await supabase.storage
          .from('thumbnails')
          .remove([item.image_path])

        if (storageError) {
          console.error('Failed to delete storage file:', storageError)
        }
      }

      setHistory((prev) => prev.filter((h) => h.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete generation')
    }
  }, [history])

  return { result, history, loading, historyLoading, error, generate, fetchHistory, toggleFavorite, deleteGeneration }
}
