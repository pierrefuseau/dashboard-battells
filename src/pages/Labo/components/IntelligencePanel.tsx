import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react'
import type { OptimizeTitleResponse } from '@/types/database'

interface IntelligencePanelProps {
  result: OptimizeTitleResponse | null
  patterns: {
    topKeywords: { word: string; avgViews: number; count: number }[]
    optimalLength: { min: number; max: number; sweetSpot: number }
    bestStructures: { type: string; avgViews: number; example: string }[]
    topTitles: { title: string; views: number; format_tag: string | null }[]
  }
  patternsLoading: boolean
  loading: boolean
}

const BREAKDOWN_LABELS: Record<string, string> = {
  length: 'Longueur',
  emotion: 'Emotion',
  curiosity: 'Curiosite',
  seo: 'SEO',
  clickbait: 'Clickbait',
  brand_coherence: 'Marque',
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error'
  const bgColor = score >= 80 ? 'bg-success/10' : score >= 60 ? 'bg-warning/10' : 'bg-error/10'
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-border/30" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
            strokeLinecap="round"
            className={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-3xl font-bold font-[var(--font-clash)] ${color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${bgColor} ${color}`}>
        {score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : 'A ameliorer'}
      </span>
    </div>
  )
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export default function IntelligencePanel({ result, patterns, patternsLoading, loading }: IntelligencePanelProps) {
  const breakdown = result?.score_breakdown
  const radarData = breakdown
    ? Object.entries(breakdown).map(([key, val]) => ({
        criterion: BREAKDOWN_LABELS[key] || key,
        score: val ?? 0,
        fullMark: 10,
      }))
    : []

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-5 overflow-y-auto max-h-[75vh]">
      <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase flex items-center gap-2">
        <Brain className="w-4 h-4" /> Intelligence
      </h2>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="flex justify-center">
            <ScoreGauge score={result.score} />
          </div>

          {radarData.length > 0 && (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-border)" strokeOpacity={0.3} />
                  <PolarAngleAxis
                    dataKey="criterion"
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                  />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2">
            {Object.entries(result.score_breakdown || {}).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary font-[var(--font-satoshi)] w-20 shrink-0">
                  {BREAKDOWN_LABELS[key] || key}
                </span>
                <div className="flex-1 h-2 bg-border/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((val ?? 0) / 10) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
                <span className="text-xs font-bold font-[var(--font-space-grotesk)] text-text-primary w-6 text-right">
                  {val ?? 0}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!patternsLoading && patterns.topKeywords.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border/30">
          <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> Patterns gagnants
          </h3>

          <div className="space-y-1.5">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
              Mots-cles performants
            </span>
            <div className="flex flex-wrap gap-1.5">
              {patterns.topKeywords.slice(0, 10).map((k) => (
                <span
                  key={k.word}
                  className="text-[11px] font-[var(--font-satoshi)] px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                  title={`${formatViews(k.avgViews)} vues moy. (${k.count}x)`}
                >
                  {k.word} <span className="text-primary/60">{formatViews(k.avgViews)}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="text-xs text-text-secondary font-[var(--font-satoshi)]">
            <span className="text-text-tertiary">Longueur ideale :</span>{' '}
            <span className="font-bold text-primary">{patterns.optimalLength.sweetSpot} chars</span>
            <span className="text-text-tertiary"> ({patterns.optimalLength.min}-{patterns.optimalLength.max})</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
              Meilleures structures
            </span>
            {patterns.bestStructures.slice(0, 4).map((s) => (
              <div key={s.type} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary capitalize">{s.type}</span>
                <span className="font-bold font-[var(--font-space-grotesk)] text-text-primary">
                  {formatViews(s.avgViews)} vues moy.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.title_gaps && result.title_gaps.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" /> Title Gaps
          </h3>
          {result.title_gaps.slice(0, 5).map((gap, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-warning-50 border border-warning/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">"{gap.keyword}"</span>
                <span className="text-[10px] font-bold text-warning">
                  Opportunite {gap.opportunity_score}/10
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{gap.video_suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {result?.pattern_insights?.competitor_titles && result.pattern_insights.competitor_titles.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-info" /> Concurrence
          </h3>
          {result.pattern_insights.competitor_titles.slice(0, 5).map((c, i) => (
            <div key={i} className="text-xs text-text-secondary">
              <span className="text-text-primary font-medium">"{c.title}"</span>
              <br />
              <span className="text-text-tertiary">{c.channel} — {formatViews(c.views)} vues</span>
            </div>
          ))}
        </div>
      )}

      {!result && !loading && !patternsLoading && patterns.topKeywords.length === 0 && (
        <div className="text-center py-16 text-text-tertiary">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-[var(--font-satoshi)]">
            Entre un titre et lance l'optimisation pour voir l'analyse
          </p>
        </div>
      )}
    </div>
  )
}
