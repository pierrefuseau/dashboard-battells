import { useState } from 'react'
import { motion } from 'framer-motion'
import SliderPanel, { DEFAULT_INPUTS, type SimulatorInputs } from './components/SliderPanel'
import ProjectionPanel from './components/ProjectionPanel'

export default function Simulator() {
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h1 className="title-display text-text-primary mb-6 sm:mb-8">
        SIMULATEUR DE REVENUS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Sliders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <SliderPanel inputs={inputs} onChange={setInputs} />
        </motion.div>

        {/* Right: Projections */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ProjectionPanel inputs={inputs} />
        </motion.div>
      </div>
    </motion.div>
  )
}
