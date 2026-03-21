import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useVideoIdeas } from '@/hooks'
import type { VideoIdea, DetectedVideo } from '@/types/database'
import RadarFeed from './components/RadarFeed'
import KanbanBoard from './components/KanbanBoard'
import IdeaDetailPanel from './components/IdeaDetailPanel'
import AddLinkModal from './components/AddLinkModal'

export default function Ideas() {
  const { updateIdea } = useVideoIdeas()
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null)
  const [selectedDetectedVideo, setSelectedDetectedVideo] = useState<DetectedVideo | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)

  const handleSelectDetectedVideo = useCallback(async (video: DetectedVideo) => {
    setSelectedDetectedVideo(video)

    const { data } = await supabase
      .from('video_ideas')
      .select('*')
      .eq('detected_video_id', video.id)
      .single()

    if (data) {
      setSelectedIdea(data as VideoIdea)
    } else {
      const { data: newIdea } = await supabase
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

      setSelectedIdea(newIdea as VideoIdea)
    }
    setPanelOpen(true)
  }, [])

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
    setPanelOpen(false)
  }, [updateIdea])

  const handleReject = useCallback(async (id: number) => {
    await updateIdea(id, { status: 'rejected' })
    setPanelOpen(false)
  }, [updateIdea])

  const handleUpdateNotes = useCallback(async (id: number, notes: string) => {
    await updateIdea(id, { user_notes: notes } as Partial<VideoIdea>)
  }, [updateIdea])

  const handleAddLink = useCallback(async (url: string) => {
    const platform = url.includes('tiktok') ? 'tiktok' : 'youtube'
    const { data: video } = await supabase
      .from('detected_videos')
      .insert({
        platform,
        video_url: url,
        title: 'Analyse en cours...',
        channel_name: 'Inconnu',
        heat_score: 0.5,
      })
      .select()
      .single()

    if (video) {
      const detected = video as DetectedVideo
      handleSelectDetectedVideo(detected)
    }
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

      <KanbanBoard onCardClick={handleSelectIdea} />

      <IdeaDetailPanel
        idea={selectedIdea}
        detectedVideo={selectedDetectedVideo}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
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
