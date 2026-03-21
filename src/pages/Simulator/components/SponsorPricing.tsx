import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatEuros, formatCompact } from '@/lib/formatters'
import DarkCard from '@/components/ui/DarkCard'

export default function SponsorPricing() {
  const [avgViews, setAvgViews] = useState(500_000)
  const [cpm, setCpm] = useState(15) // CPM Sponsor classique en France (10-30€)

  // Calcule le prix de base
  const suggestedPrice = useMemo(() => {
    return (avgViews / 1000) * cpm
  }, [avgViews, cpm])

  // Ajoute un premium pour l'exclusivité ou l'intégration dédiée (+30%)
  const dedicatedPrice = useMemo(() => {
    return suggestedPrice * 1.3
  }, [suggestedPrice])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Left: Configuration */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-6 flex flex-col gap-6"
      >
        <h2 className="text-lg font-bold font-[var(--font-clash)] text-text-primary">
          Calibrage Sponsor
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
                Vues moyennes garanties
              </label>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                {formatCompact(avgViews)}
              </span>
            </div>
            <input
              type="range"
              min={50_000}
              max={2_000_000}
              step={10_000}
              value={avgViews}
              onChange={(e) => setAvgViews(Number(e.target.value))}
              className="simulator-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-border/50"
              style={{
                background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${((avgViews - 50000) / (2000000 - 50000)) * 100}%, #E5E7EB ${((avgViews - 50000) / (2000000 - 50000)) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <p className="text-xs text-text-tertiary">Moyenne de vos 10 dernières vidéos.</p>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
                CPM Sponsor désiré (€)
              </label>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                {cpm}€
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={cpm}
              onChange={(e) => setCpm(Number(e.target.value))}
              className="simulator-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-border/50"
              style={{
                background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${((cpm - 5) / (40 - 5)) * 100}%, #E5E7EB ${((cpm - 5) / (40 - 5)) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <p className="text-xs text-text-tertiary">Moyenne marché fr: 10€ - 20€ selon la niche.</p>
          </div>
        </div>
      </motion.div>

      {/* Right: Devis Generator */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col gap-5"
      >
        <div className="card p-6 flex flex-col gap-4">
          <p className="text-sm font-medium font-[var(--font-satoshi)] text-text-secondary">
            Devis conseillé (Intégration 60s)
          </p>
          <p className="text-[40px] leading-none font-bold font-[var(--font-space-grotesk)] text-primary">
            {formatEuros(suggestedPrice)}
          </p>

          <div className="flex flex-col gap-2 mt-2 border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-[var(--font-satoshi)] text-text-primary">Format Dédié (Sponso pure)</span>
              <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                {formatEuros(dedicatedPrice)}
              </span>
            </div>
          </div>
        </div>

        <DarkCard
          emoji="🤝"
          title="Négociation"
          subtitle={`Ne descendez jamais sous les ${formatEuros(suggestedPrice * 0.8)}. C'est votre "Walk-away price".`}
        />
      </motion.div>
    </div>
  )
}
