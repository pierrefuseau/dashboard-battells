import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Video, BarChart3, Calendar, Lightbulb, Image, Recycle,
  MessageCircle, MessageSquare, TrendingUp, Users, Handshake,
  Calculator, Upload, ScatterChart,
} from 'lucide-react'
import { NAV_SECTIONS } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  home: Home, video: Video, 'bar-chart-3': BarChart3, calendar: Calendar,
  lightbulb: Lightbulb, image: Image, recycle: Recycle,
  'message-circle': MessageCircle, 'message-square': MessageSquare,
  'trending-up': TrendingUp, users: Users, handshake: Handshake,
  calculator: Calculator, upload: Upload, 'scatter-chart': ScatterChart,
}

export default function Sidebar() {
  const location = useLocation()

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed left-0 top-0 h-screen w-[var(--spacing-sidebar)] bg-surface border-r border-border shadow-[var(--shadow-sidebar)] z-[var(--z-sidebar)] flex flex-col py-6 px-4"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-3 mb-4">
        <span className="font-[var(--font-clash)] font-bold text-xl text-text-primary tracking-tight">
          BATTELLS
        </span>
        <span className="ml-1.5 text-xs font-medium text-text-tertiary">Command Center</span>
      </div>

      {/* Nav Sections */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-2 mt-4 first:mt-0">
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-text-tertiary">
                {section.label}
              </span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon] || Home
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="relative flex items-center h-11 px-3 rounded-[var(--radius-nav)] transition-all duration-200 group"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-[var(--radius-nav)] border-l-[3px] border-primary"
                        style={{
                          background: 'linear-gradient(90deg, rgba(255,107,0,0.1) 0%, transparent 100%)',
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <Icon
                      size={20}
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                      }`}
                    />
                    <span
                      className={`relative z-10 ml-3 text-sm font-medium transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User area */}
      <div className="border-t border-border-light pt-4 px-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-sm font-bold text-primary">B</div>
          <div>
            <p className="text-sm font-medium text-text-primary">Baptiste</p>
            <p className="text-xs text-text-tertiary">Createur</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary-50 flex items-center justify-center text-sm font-bold text-secondary-dark">P</div>
          <div>
            <p className="text-sm font-medium text-text-primary">Pierrot</p>
            <p className="text-xs text-text-tertiary">Stratege</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
