import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { GrowthAnnotation } from '../hooks/useGrowthData'
import type { YtChannelDaily } from '@/types/database'
import type { MetricKey } from './MetricToggle'
import AnnotationLayer from './AnnotationLayer'
import { formatCompact, formatEuros, formatWatchTime, formatDate } from '@/lib/formatters'

// ── Metric configuration ────────────────────────────────────────────

interface MetricCfg {
  color: string
  gradientId: string
  formatAxis: (v: number) => string
  formatValue: (v: number) => string
}

const METRIC_CONFIG: Record<MetricKey, MetricCfg> = {
  views: {
    color: '#FF6B00',
    gradientId: 'growthGradientViews',
    formatAxis: (v) => formatCompact(v),
    formatValue: (v) => `${v.toLocaleString('fr-FR')} vues`,
  },
  revenue: {
    color: '#10B981',
    gradientId: 'growthGradientRevenue',
    formatAxis: (v) => `${Math.round(v)}€`,
    formatValue: (v) => formatEuros(v),
  },
  subscribers: {
    color: '#8B5CF6',
    gradientId: 'growthGradientSubscribers',
    formatAxis: (v) => formatCompact(v),
    formatValue: (v) => `${v.toLocaleString('fr-FR')} abonnés`,
  },
  watchTime: {
    color: '#3B82F6',
    gradientId: 'growthGradientWatchTime',
    formatAxis: (v) => `${Math.round(v)}h`,
    formatValue: (v) => formatWatchTime(v * 60),
  },
}

// ── Custom Tooltip ──────────────────────────────────────────────────

interface TooltipPayloadItem {
  value: number
  dataKey: string
  payload: ChartDatum
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  metricKey: MetricKey
  annotations: GrowthAnnotation[]
}

function GrowthTooltip({ active, payload, metricKey, annotations }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const cfg = METRIC_CONFIG[metricKey]
  const datum = payload[0].payload
  const dayAnnotations = annotations.filter((a) => a.date === datum.date)

  return (
    <div className="bg-surface rounded-[var(--radius-tooltip)] shadow-[var(--shadow-tooltip)] px-4 py-3 border border-border-light max-w-[260px]">
      <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] mb-1">
        {formatDate(datum.date)}
      </p>
      <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">
        {cfg.formatValue(payload[0].value)}
      </p>
      {dayAnnotations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border-light">
          {dayAnnotations.map((a, i) => (
            <p key={i} className="text-xs text-text-secondary font-[var(--font-satoshi)] truncate">
              {a.title}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Chart data record ───────────────────────────────────────────────

interface ChartDatum {
  date: string
  dateLabel: string
  views: number
  revenue: number
  subscribers: number
  watchTime: number
}

// ── Chart margins ───────────────────────────────────────────────────

const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: -10 }
const CHART_MARGIN_FS = { top: 16, right: 24, bottom: 0, left: 8 }

// ── Component ───────────────────────────────────────────────────────

interface GrowthChartProps {
  dailyStats: YtChannelDaily[]
  annotations: GrowthAnnotation[]
  activeMetric: MetricKey
  externalBrushRange?: { startIndex: number; endIndex: number } | null
  onBrushChange?: (startDate: string, endDate: string) => void
}

export default function GrowthChart({
  dailyStats,
  annotations,
  activeMetric,
  externalBrushRange,
  onBrushChange,
}: GrowthChartProps) {
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [brushRange, setBrushRange] = useState<{ startIndex: number; endIndex: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleResize = useCallback((width: number, height: number) => {
    setChartSize({ width, height })
  }, [])

  // Sync external brush range (from MomentsTimeline click)
  useEffect(() => {
    if (externalBrushRange) {
      setBrushRange(externalBrushRange)
    }
  }, [externalBrushRange])

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isFullscreen])

  // Lock body scroll in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isFullscreen])

  const chartData: ChartDatum[] = useMemo(
    () =>
      dailyStats.map((s) => ({
        date: s.date,
        dateLabel: new Date(s.date + 'T00:00:00').toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        }),
        views: s.views,
        revenue: s.estimated_revenue,
        subscribers: s.subscribers,
        watchTime: s.watch_time_minutes / 60,
      })),
    [dailyStats],
  )

  const cfg = METRIC_CONFIG[activeMetric]
  const xInterval = chartData.length > 12 ? Math.floor(chartData.length / 12) : 0

  const handleBrushChange = useCallback(
    (range: { startIndex?: number; endIndex?: number }) => {
      const start = range.startIndex ?? 0
      const end = range.endIndex ?? chartData.length - 1
      setBrushRange({ startIndex: start, endIndex: end })
      if (onBrushChange && chartData[start] && chartData[end]) {
        onBrushChange(chartData[start].date, chartData[end].date)
      }
    },
    [onBrushChange, chartData],
  )

  const handleResetZoom = useCallback(() => {
    setBrushRange(null)
  }, [])

  // Click on chart point → find video annotation for that date → navigate
  const handleChartClick = useCallback(
    (data: any) => {
      if (!data?.activePayload?.length) return
      const clickedDate = data.activePayload[0].payload.date
      // Find a long_form_publish annotation for this date
      const videoAnnotation = annotations.find(
        (a) => a.date === clickedDate && a.type === 'long_form_publish' && a.videoId,
      )
      if (videoAnnotation?.videoId) {
        navigate(`/videos?video=${videoAnnotation.videoId}`)
      }
    },
    [annotations, navigate],
  )

  // Navigate to video from annotation
  const handleAnnotationNavigate = useCallback(
    (videoId: string) => {
      navigate(`/videos?video=${videoId}`)
    },
    [navigate],
  )

  const margin = isFullscreen ? CHART_MARGIN_FS : CHART_MARGIN
  const chartHeight = isFullscreen ? '100%' : 380

  const chartContent = (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-[100] bg-page flex flex-col'
          : 'card p-6'
      }
    >
      {/* Header bar */}
      <div className={`flex items-center justify-between ${isFullscreen ? 'px-8 pt-6 pb-2' : 'mb-3'}`}>
        <div className="flex items-center gap-3">
          {isFullscreen && (
            <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary">
              Croissance — {activeMetric === 'views' ? 'Vues' : activeMetric === 'revenue' ? 'Revenus' : activeMetric === 'subscribers' ? 'Abonnés' : 'Watch Time'}
            </h2>
          )}
          {brushRange && (
            <button
              onClick={handleResetZoom}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-[var(--font-satoshi)] text-text-secondary hover:text-text-primary hover:bg-border-light/50 transition-colors cursor-pointer"
              aria-label="Réinitialiser le zoom"
            >
              <RotateCcw size={13} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFullscreen((v) => !v)}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-border-light/60 transition-colors cursor-pointer"
          aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        >
          {isFullscreen ? (
            <Minimize2 size={18} className="text-text-secondary" />
          ) : (
            <Maximize2 size={18} className="text-text-secondary" />
          )}
        </button>
      </div>

      {/* Chart area */}
      <div
        className="relative flex-1"
        style={{ height: isFullscreen ? undefined : chartHeight }}
        role="img"
        aria-label={`Graphique de croissance — ${activeMetric}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeMetric}-${isFullscreen}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <ResponsiveContainer width="100%" height="100%" onResize={handleResize}>
              <AreaChart
                data={chartData}
                margin={margin}
                onClick={handleChartClick}
                style={{ cursor: 'crosshair' }}
              >
                <defs>
                  <linearGradient id={cfg.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--color-border-light)"
                  vertical={false}
                />
                <XAxis
                  dataKey="dateLabel"
                  tick={{
                    fontSize: isFullscreen ? 12 : 11,
                    fill: 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-satoshi)',
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={xInterval}
                />
                <YAxis
                  tick={{
                    fontSize: isFullscreen ? 12 : 11,
                    fill: 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-satoshi)',
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={cfg.formatAxis}
                />
                <Tooltip
                  content={<GrowthTooltip metricKey={activeMetric} annotations={annotations} />}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={cfg.color}
                  strokeWidth={2}
                  fill={`url(#${cfg.gradientId})`}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: cfg.color,
                    stroke: 'var(--color-surface)',
                    strokeWidth: 2.5,
                    cursor: 'pointer',
                  }}
                />
                <Brush
                  dataKey="dateLabel"
                  height={isFullscreen ? 36 : 28}
                  stroke="var(--color-border)"
                  fill="var(--color-page)"
                  onChange={handleBrushChange}
                  startIndex={brushRange?.startIndex}
                  endIndex={brushRange?.endIndex}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>

        <AnnotationLayer
          annotations={annotations}
          dailyStats={dailyStats}
          activeMetric={activeMetric}
          chartWidth={chartSize.width}
          chartHeight={chartSize.height}
          chartMargin={margin}
          onAnnotationNavigate={handleAnnotationNavigate}
        />
      </div>

      {/* Fullscreen hint */}
      {isFullscreen && (
        <div className="text-center pb-4 pt-2">
          <span className="text-xs text-text-tertiary font-[var(--font-satoshi)]">
            Appuie sur <kbd className="px-1.5 py-0.5 rounded bg-border-light text-text-secondary text-[10px] font-mono">Esc</kbd> pour quitter le plein écran
          </span>
        </div>
      )}
    </div>
  )

  // Render in portal when fullscreen
  if (isFullscreen) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {chartContent}
      </motion.div>,
      document.body,
    )
  }

  return chartContent
}
