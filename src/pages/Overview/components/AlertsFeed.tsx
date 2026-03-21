import AlertRow from '@/components/ui/AlertRow'
import { recentAlerts } from '../mockData'

export default function AlertsFeed() {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 pt-5 pb-3">
        <h2 className="font-[var(--font-clash)] text-xl font-semibold text-text-primary">
          Alertes recentes
        </h2>
      </div>

      <div>
        {recentAlerts.map((alert, i) => (
          <AlertRow
            key={i}
            icon={alert.icon}
            text={alert.text}
            badgeText={alert.badgeText}
            badgeVariant={alert.badgeVariant}
            timestamp={alert.timestamp}
          />
        ))}
      </div>
    </div>
  )
}
