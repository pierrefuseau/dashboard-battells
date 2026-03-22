import { useMemo } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Rocket } from 'lucide-react'
import { formatEuros } from '@/lib/formatters'
import DarkCard from '@/components/ui/DarkCard'
import type { SimulatorInputs } from './SliderPanel'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const CURRENT_BASELINE = 19_932

interface ProjectionPanelProps {
  inputs: SimulatorInputs
}

function calculate(inputs: SimulatorInputs) {
  const yearlyLongForm = inputs.videosPerMonth * 12 * inputs.avgViewsPerVideo * (inputs.rpm / 1000)
  const yearlyShorts = inputs.shortsPerWeek * 52 * 50_000 * 0.05 / 1000
  const yearlySponsors = inputs.sponsorsPerMonth * 12 * inputs.avgSponsorAmount
  const total = yearlyLongForm + yearlyShorts + yearlySponsors
  return { yearlyLongForm, yearlyShorts, yearlySponsors, total }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark rounded-[var(--radius-tooltip)] px-3 py-2 shadow-[var(--shadow-tooltip)] border border-white/10">
      <p className="text-xs text-white/60 font-[var(--font-satoshi)]">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-sm font-bold font-[var(--font-space-grotesk)]" style={{ color: entry.color }}>
          {formatEuros(Math.round(entry.value))}
        </p>
      ))}
    </div>
  )
}

export default function ProjectionPanel({ inputs }: ProjectionPanelProps) {
  const { yearlyLongForm, yearlyShorts, yearlySponsors, total } = useMemo(() => calculate(inputs), [inputs])

  const multiplier = total / CURRENT_BASELINE
  const monthlyBaseline = CURRENT_BASELINE / 12
  const monthlyProjected = total / 12

  const chartData = useMemo(
    () =>
      MONTHS.map((month, i) => ({
        month,
        baseline: Math.round(monthlyBaseline * (i + 1)),
        projected: Math.round(monthlyProjected * (i + 1)),
      })),
    [monthlyBaseline, monthlyProjected]
  )

  const spring = useSpring({
    value: total,
    from: { value: 0 },
    config: { tension: 60, friction: 20 },
  })

  const breakdownItems = [
    { label: 'AdSense Long-form', value: yearlyLongForm },
    { label: 'AdSense Shorts', value: yearlyShorts },
    { label: 'Sponsors', value: yearlySponsors },
  ]

  function getMotivationalText(amount: number): string {
    if (amount > 200_000) return `${formatEuros(Math.round(amount))} par an, c'est le niveau des plus gros créateurs français. La machine est lancée.`
    if (amount > 100_000) return `${formatEuros(Math.round(amount))} par an, tu pourrais en vivre confortablement et investir dans ton setup.`
    if (amount > 50_000) return `${formatEuros(Math.round(amount))} par an, c'est un vrai salaire de créateur. Continue de push.`
    if (amount > 20_000) return `${formatEuros(Math.round(amount))} par an, c'est un bon complément. La régularité va tout changer.`
    return `${formatEuros(Math.round(amount))} par an pour l'instant. Chaque vidéo te rapproche du prochain palier.`
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Big number */}
      <div className="card p-6 flex flex-col gap-4">
        <p className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
          Revenu annuel projeté
        </p>
        <animated.p
          className="text-[40px] leading-none font-bold font-[var(--font-space-grotesk)] text-primary"
        >
          {spring.value.to((v: number) => formatEuros(Math.round(v)))}
        </animated.p>

        {/* Breakdown */}
        <div className="flex flex-col gap-1.5 mt-1">
          {breakdownItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-xs font-[var(--font-satoshi)] text-text-tertiary">{item.label}</span>
              <span className="text-xs font-bold font-[var(--font-space-grotesk)] text-text-secondary tabular-nums">
                {formatEuros(Math.round(item.value))}/an
              </span>
            </div>
          ))}
        </div>

        {/* Multiplier badge */}
        {multiplier > 0 && (
          <div className="mt-2">
            <span
              className={`badge text-xs font-bold font-[var(--font-space-grotesk)] ${
                multiplier >= 1
                  ? 'bg-success-50 text-success-dark'
                  : 'bg-error-50 text-error-dark'
              }`}
            >
              x{multiplier.toFixed(1)} vs revenus actuels
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="text-sm font-bold font-[var(--font-clash)] text-text-primary mb-4">
          Projection sur 12 mois (cumul)
        </h3>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-text-tertiary" />
            <span className="text-[10px] font-[var(--font-satoshi)] text-text-tertiary">Revenus actuels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-primary rounded-full" />
            <span className="text-[10px] font-[var(--font-satoshi)] text-text-tertiary">Projection simulée</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-satoshi)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'var(--font-space-grotesk)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="none"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#FF6B00"
              strokeWidth={2.5}
              fill="url(#projectedGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Motivational DarkCard */}
      <DarkCard
        icon={Rocket}
        title="Objectif revenus"
        subtitle={getMotivationalText(total)}
        lexiconWord={total > 100_000 ? 'Dinguerie' : total > 50_000 ? 'Banger' : 'Pépite'}
      />
    </div>
  )
}
