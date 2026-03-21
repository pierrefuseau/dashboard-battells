import { motion } from 'framer-motion'

const BATTELLS_LEXICON = [
  'Dinguerie', 'Banger', 'Magnificus', 'Zinzin', 'Pépite',
  'Masterclass', 'Overpowered', 'Chef-d\'oeuvre', 'Iconique', 'Légendaire',
] as const

interface DarkCardProps {
  emoji: string
  title: string
  subtitle: string
  detail?: string
  lexiconWord?: string
}

export default function DarkCard({ emoji, title, subtitle, detail, lexiconWord }: DarkCardProps) {
  const word = lexiconWord ?? BATTELLS_LEXICON[Math.floor(Math.random() * BATTELLS_LEXICON.length)]

  return (
    <motion.div
      className="card-dark relative p-6"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Orange glow gradient */}
      <div
        className="absolute inset-0 rounded-[var(--radius-card-lg)] pointer-events-none animate-[gradient-shift_8s_linear_infinite] bg-[length:200%_200%]"
        style={{
          background: 'radial-gradient(ellipse at 10% 10%, rgba(255,107,0,0.15) 0%, transparent 60%)',
          backgroundSize: '200% 200%',
        }}
      />

      <div className="relative z-10 flex flex-col gap-2">
        <span className="text-2xl">{emoji}</span>
        <h3 className="text-lg font-bold font-[var(--font-clash)] text-white leading-snug">
          {title}
        </h3>
        <p className="text-sm text-white/70 font-[var(--font-satoshi)]">
          {subtitle}
        </p>
        {detail && (
          <p className="text-xs text-white/50 font-[var(--font-satoshi)] mt-1">
            {detail}
          </p>
        )}
        <span className="mt-3 inline-block badge bg-primary/20 text-primary-light text-[10px] uppercase tracking-widest self-start">
          {word}
        </span>
      </div>
    </motion.div>
  )
}
