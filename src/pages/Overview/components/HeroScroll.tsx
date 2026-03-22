import { ContainerScroll } from '@/components/ui/ContainerScrollAnimation'
import { SparklesCore } from '@/components/ui/SparklesCore'
import { YOUTUBE_CONFIG } from '@/lib/youtube'

// Uploads playlist = channel ID with "UC" → "UU"
const UPLOADS_PLAYLIST_ID = YOUTUBE_CONFIG.channelId.replace(/^UC/, 'UU')

export default function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-5 lg:-mt-6">
      <ContainerScroll
        titleComponent={
          <div className="relative flex flex-col items-center">
            {/* Sparkles background */}
            <div className="absolute inset-0 w-full h-full">
              <SparklesCore
                id="hero-sparkles"
                background="transparent"
                minSize={0.4}
                maxSize={1.2}
                particleDensity={80}
                className="w-full h-full"
                particleColor="#FF6B00"
                speed={1.5}
              />
            </div>

            {/* Content over sparkles */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <span className="font-[var(--font-bebas)] text-sm sm:text-base tracking-[0.3em] text-text-tertiary uppercase">
                Centre de commande
              </span>
              <h1 className="font-[var(--font-clash)] text-4xl sm:text-5xl md:text-[5.5rem] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-b from-text-primary to-text-secondary">
                BATTELLS
              </h1>

              {/* Orange glow lines under title */}
              <div className="w-[30rem] max-w-full h-20 relative -mt-2">
                <div className="absolute inset-x-16 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[2px] w-3/4 blur-sm" />
                <div className="absolute inset-x-16 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-px w-3/4" />
                <div className="absolute inset-x-32 top-0 bg-gradient-to-r from-transparent via-primary-light to-transparent h-[5px] w-1/4 blur-sm" />
                <div className="absolute inset-x-32 top-0 bg-gradient-to-r from-transparent via-primary-light to-transparent h-px w-1/4" />

                {/* Extra sparkles under the glow lines */}
                <SparklesCore
                  id="hero-sparkles-sub"
                  background="transparent"
                  minSize={0.3}
                  maxSize={0.8}
                  particleDensity={600}
                  className="w-full h-full"
                  particleColor="#FF6B00"
                  speed={2}
                />

                {/* Radial mask to fade edges */}
                <div className="absolute inset-0 w-full h-full bg-page [mask-image:radial-gradient(300px_150px_at_top,transparent_20%,white)]" />
              </div>

              <div className="flex items-center gap-3 -mt-6">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <span className="font-[var(--font-satoshi)] text-sm sm:text-base text-text-secondary">
                  {YOUTUBE_CONFIG.channelHandle} — {(YOUTUBE_CONFIG.subscriberCount / 1000).toFixed(0)}K abonnés
                </span>
                <div className="h-1 w-12 bg-primary rounded-full" />
              </div>
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
