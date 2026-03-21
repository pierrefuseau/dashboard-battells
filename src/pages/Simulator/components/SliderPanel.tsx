import { formatCompact, formatEuros } from '@/lib/formatters'

export interface SimulatorInputs {
  videosPerMonth: number
  avgViewsPerVideo: number
  rpm: number
  shortsPerWeek: number
  sponsorsPerMonth: number
  avgSponsorAmount: number
}

interface SliderPanelProps {
  inputs: SimulatorInputs
  onChange: (inputs: SimulatorInputs) => void
}

interface SliderConfig {
  key: keyof SimulatorInputs
  label: string
  min: number
  max: number
  step: number
  default: number
  format: (v: number) => string
}

const SLIDERS: SliderConfig[] = [
  {
    key: 'videosPerMonth',
    label: 'Vidéos longues par mois',
    min: 0, max: 10, step: 1, default: 4,
    format: (v) => String(v),
  },
  {
    key: 'avgViewsPerVideo',
    label: 'Vues moyennes par vidéo longue',
    min: 100_000, max: 2_000_000, step: 50_000, default: 500_000,
    format: (v) => formatCompact(v),
  },
  {
    key: 'rpm',
    label: 'RPM estimé (€)',
    min: 1, max: 8, step: 0.5, default: 3.5,
    format: (v) => `${v.toFixed(1)}€`,
  },
  {
    key: 'shortsPerWeek',
    label: 'Shorts par semaine',
    min: 0, max: 14, step: 1, default: 5,
    format: (v) => String(v),
  },
  {
    key: 'sponsorsPerMonth',
    label: 'Sponsors par mois',
    min: 0, max: 5, step: 1, default: 1,
    format: (v) => String(v),
  },
  {
    key: 'avgSponsorAmount',
    label: 'Montant moyen par sponsor (€)',
    min: 500, max: 10_000, step: 500, default: 2000,
    format: (v) => formatEuros(v),
  },
]

export const DEFAULT_INPUTS: SimulatorInputs = Object.fromEntries(
  SLIDERS.map((s) => [s.key, s.default])
) as unknown as SimulatorInputs

export default function SliderPanel({ inputs, onChange }: SliderPanelProps) {
  function handleChange(key: keyof SimulatorInputs, value: number) {
    onChange({ ...inputs, [key]: value })
  }

  return (
    <div className="card p-6 flex flex-col gap-6">
      <h2 className="text-lg font-bold font-[var(--font-clash)] text-text-primary">
        Paramètres
      </h2>

      {SLIDERS.map((slider) => {
        const value = inputs[slider.key]
        const percent = ((value - slider.min) / (slider.max - slider.min)) * 100

        return (
          <div key={slider.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
                {slider.label}
              </label>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                {slider.format(value)}
              </span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={value}
              onChange={(e) => handleChange(slider.key, Number(e.target.value))}
              className="simulator-slider w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
