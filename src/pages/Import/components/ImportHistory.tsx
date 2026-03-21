import { motion } from 'framer-motion'
import { formatDate, formatNumber } from '../../../lib/formatters'
import type { CsvImport } from '../../../types/database'

interface ImportHistoryProps {
  imports: CsvImport[]
}

export default function ImportHistory({ imports }: ImportHistoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card p-6"
    >
      <h2 className="font-[var(--font-clash)] text-xl font-semibold text-text-primary mb-4">
        Historique des imports
      </h2>

      <div className="overflow-x-auto rounded-[var(--radius-input)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-[var(--font-satoshi)] font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-4 font-[var(--font-satoshi)] font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Fichier
              </th>
              <th className="text-left py-3 px-4 font-[var(--font-satoshi)] font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Type
              </th>
              <th className="text-right py-3 px-4 font-[var(--font-satoshi)] font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Lignes importees
              </th>
              <th className="text-left py-3 px-4 font-[var(--font-satoshi)] font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Par
              </th>
            </tr>
          </thead>
          <tbody>
            {imports.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                className={`border-b border-border-light last:border-0 ${
                  i % 2 === 0 ? 'bg-page' : 'bg-surface'
                }`}
              >
                <td className="py-3 px-4 font-[var(--font-satoshi)] text-text-primary whitespace-nowrap">
                  {formatDate(row.imported_at)}
                </td>
                <td className="py-3 px-4 font-[var(--font-mono)] text-text-primary text-xs">
                  {row.filename}
                </td>
                <td className="py-3 px-4">
                  <span className="badge bg-primary-50 text-primary">
                    {row.file_type}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-[var(--font-space-grotesk)] font-medium text-text-primary">
                  {formatNumber(row.rows_imported)}
                </td>
                <td className="py-3 px-4 font-[var(--font-satoshi)] text-text-secondary">
                  {row.imported_by}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
