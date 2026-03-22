import { ContainerScroll } from '@/components/ui/ContainerScrollAnimation'
import { YOUTUBE_CONFIG } from '@/lib/youtube'

// Uploads playlist = channel ID with "UC" → "UU"
const UPLOADS_PLAYLIST_ID = YOUTUBE_CONFIG.channelId.replace(/^UC/, 'UU')

export default function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-5 lg:-mt-6">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-3">
            <span className="font-[var(--font-bebas)] text-sm sm:text-base tracking-[0.3em] text-text-tertiary uppercase">
              Centre de commande
            </span>
            <h1 className="font-[var(--font-clash)] text-4xl sm:text-5xl md:text-[5.5rem] font-bold text-text-primary leading-none">
              BATTELLS
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-1 w-12 bg-primary rounded-full" />
              <span className="font-[var(--font-satoshi)] text-sm sm:text-base text-text-secondary">
                {YOUTUBE_CONFIG.channelHandle} — {(YOUTUBE_CONFIG.subscriberCount / 1000).toFixed(0)}K abonnés
              </span>
              <div className="h-1 w-12 bg-primary rounded-full" />
            </div>
          </div>
        }
      >
        <iframe
          src={`https://www.youtube.com/embed/videoseries?list=${UPLOADS_PLAYLIST_ID}&autoplay=0`}
          title={`Chaîne YouTube ${YOUTUBE_CONFIG.channelName}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-xl border-0"
        />
      </ContainerScroll>
    </div>
  )
}
