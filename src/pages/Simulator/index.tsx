import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SliderPanel, { DEFAULT_INPUTS, type SimulatorInputs } from './components/SliderPanel'
import ProjectionPanel from './components/ProjectionPanel'
import SponsorPricing from './components/SponsorPricing'
import ReverseSimulator from './components/ReverseSimulator'

type TabType = 'adsense' | 'sponsor' | 'reverse'

export default function Simulator() {
  const [activeTab, setActiveTab] = useState<TabType>('adsense')
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="title-display text-text-primary">
          CENTRE DE SIMULATION
        </h1>

        {/* Tabs */}
        <div className="flex bg-dark/50 p-1.5 rounded-[var(--radius-button)] border border-white/5">
          <button
            onClick={() => setActiveTab('adsense')}
            className={`px-4 py-2 text-sm font-bold font-[var(--font-clash)] rounded-md transition-all ${
              activeTab === 'adsense'
                ? 'bg-primary text-white shadow-[var(--shadow-glow)]'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            AdSense
          </button>
          <button
            onClick={() => setActiveTab('sponsor')}
            className={`px-4 py-2 text-sm font-bold font-[var(--font-clash)] rounded-md transition-all ${
              activeTab === 'sponsor'
                ? 'bg-primary text-white shadow-[var(--shadow-glow)]'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sponsor
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`px-4 py-2 text-sm font-bold font-[var(--font-clash)] rounded-md transition-all ${
              activeTab === 'reverse'
                ? 'bg-primary text-white shadow-[var(--shadow-glow)]'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Objectif
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'adsense' && (
          <motion.div
            key="adsense"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Left: Sliders */}
            <motion.div>
              <SliderPanel inputs={inputs} onChange={setInputs} />
            </motion.div>

            {/* Right: Projections */}
            <motion.div>
              <ProjectionPanel inputs={inputs} />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'sponsor' && (
          <motion.div
            key="sponsor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <SponsorPricing />
          </motion.div>
        )}

        {activeTab === 'reverse' && (
          <motion.div
            key="reverse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ReverseSimulator />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
