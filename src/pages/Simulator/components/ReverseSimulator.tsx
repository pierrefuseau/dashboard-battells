import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { formatEuros, formatCompact } from '@/lib/formatters'
import DarkCard from '@/components/ui/DarkCard'

export default function ReverseSimulator() {
  const [targetIncome, setTargetIncome] = useState(15_000)
  const [rpm, setRpm] = useState(3.5)
  const [avgViewsPerVideo, setAvgViewsPerVideo] = useState(500_000)

  // Calculations
  const requiredViews = useMemo(() => {
    return (targetIncome / rpm) * 1000
  }, [targetIncome, rpm])

  const requiredVideos = useMemo(() => {
    return Math.ceil(requiredViews / avgViewsPerVideo)
  }, [requiredViews, avgViewsPerVideo])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Left: Targets Config */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-6 flex flex-col gap-6"
      >
        <h2 className="text-lg font-bold font-[var(--font-clash)] text-text-primary">
          Objectif de Revenus
        </h2>

        <div className="flex flex-col gap-4">
          {/* Target Income */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
                Objectif mensuel AdSense
              </label>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                {formatEuros(targetIncome)}
              </span>
            </div>
            <input
              type="range"
              min={2_000}
              max={50_000}
              step={1_000}
              value={targetIncome}
              onChange={(e) => setTargetIncome(Number(e.target.value))}
              className="simulator-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-border/50"
              style={{
                background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${((targetIncome - 2000) / (50000 - 2000)) * 100}%, #E5E7EB ${((targetIncome - 2000) / (50000 - 2000)) * 100}%, #E5E7EB 100%)`,
              }}
            />
          </div>

          {/* RPM */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
                RPM actuel (€)
              </label>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                {rpm}€
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={rpm}
              onChange={(e) => setRpm(Number(e.target.value))}
              className="simulator-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-border/50"
              style={{
                background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${((rpm - 1) / (15 - 1)) * 100}%, #E5E7EB ${((rpm - 1) / (15 - 1)) * 100}%, #E5E7EB 100%)`,
              }}
            />
          </div>

          {/* Avg Views per video */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
                Vues moy. par vidéo
              </label>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                {formatCompact(avgViewsPerVideo)}
              </span>
            </div>
            <input
              type="range"
              min={50_000}
              max={2_000_000}
              step={50_000}
              value={avgViewsPerVideo}
              onChange={(e) => setAvgViewsPerVideo(Number(e.target.value))}
              className="simulator-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-border/50"
              style={{
                background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${((avgViewsPerVideo - 50000) / (2000000 - 50000)) * 100}%, #E5E7EB ${((avgViewsPerVideo - 50000) / (2000000 - 50000)) * 100}%, #E5E7EB 100%)`,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Right: Action Plan */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col gap-5"
      >
        <div className="card p-6 flex flex-col gap-4">
          <p className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
            Vues nécessaires ce mois-ci
          </p>
          <p className="text-[40px] leading-none font-bold font-[var(--font-space-grotesk)] text-primary tabular-nums">
            {formatCompact(requiredViews)}
          </p>

          <div className="flex flex-col gap-2 mt-2 border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-[var(--font-satoshi)] text-text-primary">Plan d'action (Vidéos à publier)</span>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-primary bg-primary/10 px-2 py-1 rounded-md tabular-nums">
                {requiredVideos} vidéos
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              À condition de maintenir une moyenne de {formatCompact(avgViewsPerVideo)} vues par vidéo.
            </p>
          </div>
        </div>

        <DarkCard
          icon={Target}
          title="Stratégie"
          subtitle={
            requiredVideos > 6 
              ? "Cadence trop élevée ? Essayez de trouver un sponsor pour lisser vos revenus."
              : "C'est réalisable. Maintenez la qualité de vos concepts."
          }
        />
      </motion.div>
    </div>
  )
}
