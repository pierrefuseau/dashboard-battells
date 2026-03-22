import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useVideoIdeas } from '@/hooks'
import type { VideoIdea, DetectedVideo } from '@/types/database'
import RadarFeed from './components/RadarFeed'
import SavedIdeasVault from './components/SavedIdeasVault'
import IdeaDetailPanel from './components/IdeaDetailPanel'
import AddLinkModal from './components/AddLinkModal'

export default function Ideas() {
  const { ideas, loading, updateIdea, refetch } = useVideoIdeas()
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null)
  const [selectedDetectedVideo, setSelectedDetectedVideo] = useState<DetectedVideo | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)

  const triggerAnalysis = useCallback(async (detectedVideoId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ detected_video_id: detectedVideoId }),
      })
      if (!response.ok) {
        console.error('Analysis failed:', response.status, await response.text())
      }
      refetch()
    } catch (err) {
      console.error('Analysis trigger failed:', err)
    }
  }, [refetch])

  const handleSelectDetectedVideo = useCallback(async (video: DetectedVideo) => {
    // Reset state to avoid stale content flash
    setSelectedIdea(null)
    setSelectedDetectedVideo(video)

    const { data, error } = await supabase
      .from('video_ideas')
      .select('*')
      .eq('detected_video_id', video.id)
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch idea:', error)
      setPanelOpen(true)
      return
    }

    if (data) {
      setSelectedIdea(data as VideoIdea)
    } else {
      const { data: newIdea, error: insertError } = await supabase
        .from('video_ideas')
        .insert({
          title: video.title,
          source: 'competitor',
          detected_video_id: video.id,
          status: 'backlog',
          is_long_form: false,
        })
        .select()
        .single()

      if (insertError || !newIdea) {
        console.error('Failed to create idea:', insertError)
        setPanelOpen(true)
        return
      }

      setSelectedIdea(newIdea as VideoIdea)
      refetch()
      triggerAnalysis(video.id)
    }
    setPanelOpen(true)
  }, [triggerAnalysis, refetch])

  const handleSelectIdea = useCallback(async (idea: VideoIdea) => {
    setSelectedIdea(idea)

    if (idea.detected_video_id) {
      const { data } = await supabase
        .from('detected_videos')
        .select('*')
        .eq('id', idea.detected_video_id)
        .single()
      setSelectedDetectedVideo(data as DetectedVideo | null)
    } else {
      setSelectedDetectedVideo(null)
    }
    setPanelOpen(true)
  }, [])

  const handleApprove = useCallback(async (id: number) => {
    await updateIdea(id, { status: 'approved' })
    setSelectedIdea((prev) => prev && prev.id === id ? { ...prev, status: 'approved' } : prev)
    setPanelOpen(false)
  }, [updateIdea])


  const handleArchiveIdea = useCallback(async (id: number) => {
    // We set the status to 'rejected' to remove it from the vault
    await updateIdea(id, { status: 'rejected' })
    if (selectedIdea?.id === id) {
      setPanelOpen(false)
    }
  }, [updateIdea, selectedIdea])

  const handleUpdateNotes = useCallback(async (id: number, notes: string) => {
    await updateIdea(id, { user_notes: notes } as Partial<VideoIdea>)
  }, [updateIdea])

  const handleAddLink = useCallback(async (url: string) => {
    const platform = url.includes('tiktok') ? 'tiktok' : 'youtube'
    const { data: video, error } = await supabase
      .from('detected_videos')
      .insert({
        platform,
        video_url: url,
        title: 'Analyse en cours...',
        channel_name: 'Inconnu',
        heat_score: 0.5,
        views: 0,
        likes: 0,
        comments: 0,
        overperformance_ratio: 1,
      })
      .select()
      .single()

    if (error || !video) {
      console.error('Failed to insert video:', error)
      return
    }

    // handleSelectDetectedVideo already calls triggerAnalysis internally
    await handleSelectDetectedVideo(video as DetectedVideo)
  }, [handleSelectDetectedVideo])

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <RadarFeed
        onSelectVideo={handleSelectDetectedVideo}
        onAddLink={() => setLinkModalOpen(true)}
      />

      <SavedIdeasVault
        ideas={ideas}
        loading={loading}
        onCardClick={handleSelectIdea}
        onArchiveIdea={handleArchiveIdea}
      />

      <IdeaDetailPanel
        idea={selectedIdea}
        detectedVideo={selectedDetectedVideo}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onApprove={handleApprove}
        onReject={handleArchiveIdea} // Pass handleArchiveIdea instead of generic Reject
        onUpdateNotes={handleUpdateNotes}
      />

      <AddLinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSubmit={handleAddLink}
      />
    </motion.div>
  )
}
