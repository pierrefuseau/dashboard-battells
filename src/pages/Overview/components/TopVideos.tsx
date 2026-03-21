import { topVideos } from '../mockData'
import { formatCompact, formatEuros } from '@/lib/formatters'

export default function TopVideos() {
  return (
    <div className="card p-6 h-full">
      <h2 className="font-[var(--font-clash)] text-xl font-semibold text-text-primary mb-4">
        Top Vidéos
      </h2>

      <div className="flex flex-col gap-3">
        {topVideos.map((video, i) => (
          <div
            key={video.id}
            className="flex items-center gap-3 group cursor-pointer"
          >
            {/* Rank */}
            <span className="text-xs font-bold font-[var(--font-space-grotesk)] text-text-tertiary w-4 shrink-0">
              {i + 1}
            </span>

            {/* Thumbnail placeholder */}
            <div className="w-[60px] h-[34px] rounded-lg bg-border-light shrink-0 flex items-center justify-center">
              <span className="text-[10px] text-text-tertiary">▶</span>
            </div>

            {/* Title + metric */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-[var(--font-satoshi)] text-text-primary truncate group-hover:text-primary transition-colors">
                {video.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-medium font-[var(--font-space-grotesk)] text-text-secondary">
                  {formatCompact(video.views)} vues
                </span>
                <span className="text-xs text-text-tertiary">·</span>
                <span className="text-xs font-medium font-[var(--font-space-grotesk)] text-primary">
                  {formatEuros(video.revenue)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
