import { motion } from 'framer-motion'
import { History, ArrowUpRight } from 'lucide-react'
import type { TitleOptimization } from '@/types/database'

interface HistoryTableProps {
  history: TitleOptimization[]
  loading: boolean
  onSelect: (opt: TitleOptimization) => void
}

export default function HistoryTable({ history, loading, onSelect }: HistoryTableProps) {
  if (loading) {
    return (
      <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 p-6 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (history.length === 0) return null

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-text-tertiary" />
        <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
          Historique des optimisations
        </h2>
        <span className="text-xs text-text-tertiary">({history.length})</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Titre original
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Titre optimise
              </th>
              <th className="text-center py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Score
              </th>
              <th className="text-center py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Plateformes
              </th>
              <th className="text-right py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((opt) => (
              <motion.tr
                key={opt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => onSelect(opt)}
                className="border-b border-border/20 hover:bg-primary-50 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-3">
                  <span className="text-xs text-text-secondary font-[var(--font-satoshi)] line-clamp-1">
                    {opt.original_title}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs text-text-primary font-medium font-[var(--font-satoshi)] line-clamp-1 flex items-center gap-1">
                    {opt.optimized_title || '\u2014'}
                    <ArrowUpRight className="w-3 h-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  {opt.score !== null ? (
                    <span className={`text-xs font-bold font-[var(--font-space-grotesk)] ${
                      (opt.score ?? 0) >= 80 ? 'text-success' : (opt.score ?? 0) >= 60 ? 'text-warning' : 'text-error'
                    }`}>
                      {opt.score}
                    </span>
                  ) : '\u2014'}
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {opt.platform.map((p) => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-border/30 text-text-tertiary uppercase">
                        {p.slice(0, 2)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-xs text-text-tertiary font-[var(--font-satoshi)]">
                    {new Date(opt.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
