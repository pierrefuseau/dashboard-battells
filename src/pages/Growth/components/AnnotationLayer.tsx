import type { GrowthAnnotation } from '../hooks/useGrowthData'
import type { YtChannelDaily } from '@/types/database'
import type { MetricKey } from './MetricToggle'
import AnnotationMarker from './AnnotationMarker'

// ── Helpers ─────────────────────────────────────────────────────────

function getMetricValue(day: YtChannelDaily, metric: MetricKey): number {
  switch (metric) {
    case 'views':
      return day.views
    case 'revenue':
      return day.estimated_revenue
    case 'subscribers':
      return day.subscribers
    case 'watchTime':
      return day.watch_time_minutes / 60
  }
}

// ── Component ───────────────────────────────────────────────────────

interface AnnotationLayerProps {
  annotations: GrowthAnnotation[]
  dailyStats: YtChannelDaily[]
  activeMetric: MetricKey
  chartWidth: number
  chartHeight: number
  chartMargin: { top: number; right: number; bottom: number; left: number }
  onAnnotationNavigate?: (videoId: string) => void
}

export default function AnnotationLayer({
  annotations,
  dailyStats,
  activeMetric,
  chartWidth,
  chartHeight,
  chartMargin,
  onAnnotationNavigate,
}: AnnotationLayerProps) {
  if (dailyStats.length === 0) return null

  const plotWidth = chartWidth - chartMargin.left - chartMargin.right
  const plotHeight = chartHeight - chartMargin.top - chartMargin.bottom

  // Build a date→index map for fast lookup
  const dateIndexMap = new Map<string, number>()
  dailyStats.forEach((day, i) => {
    dateIndexMap.set(day.date, i)
  })

  // Compute min/max of active metric for y-scaling
  const values = dailyStats.map((d) => getMetricValue(d, activeMetric))
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1 // Avoid division by zero

  // Filter annotations whose date exists in dailyStats and compute positions
  const positioned = annotations
    .map((annotation) => {
      const idx = dateIndexMap.get(annotation.date)
      if (idx === undefined) return null

      const metricVal = getMetricValue(dailyStats[idx], activeMetric)

      // X: evenly spaced across plot width
      const x =
        chartMargin.left +
        (dailyStats.length > 1
          ? (idx / (dailyStats.length - 1)) * plotWidth
          : plotWidth / 2)

      // Y: scaled within plot area (inverted: top = max, bottom = min)
      const y =
        chartMargin.top + plotHeight - ((metricVal - minVal) / range) * plotHeight

      return { annotation, x, y }
    })
    .filter(Boolean) as { annotation: GrowthAnnotation; x: number; y: number }[]

  return (
    <div className="absolute inset-0 pointer-events-none">
      {positioned.map((item) => (
        <div key={`${item.annotation.date}|${item.annotation.type}`} className="pointer-events-auto">
          <AnnotationMarker
            annotation={item.annotation}
            x={item.x}
            y={item.y}
            chartHeight={chartHeight - chartMargin.top}
            onNavigate={onAnnotationNavigate}
          />
        </div>
      ))}
    </div>
  )
}
