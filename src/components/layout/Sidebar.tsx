import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Home, Video, BarChart3, Calendar, Lightbulb, Image, Recycle,
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

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <nav
      aria-label="Navigation principale"
      className={`
        fixed left-0 top-0 h-screen w-[var(--spacing-sidebar)] bg-dark z-[var(--z-sidebar)]
        flex flex-col py-6 px-5 shadow-[var(--shadow-sidebar)]
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white lg:hidden"
        aria-label="Fermer le menu"
      >
        <X size={18} />
      </button>

      {/* Titre */}
      <div className="px-2 mb-6">
        <img 
          src="/battells_logo.png" 
          alt="BATTELLS Logo" 
          className="w-[85%] h-auto mb-2 object-contain" 
        />
        <div className="h-[3px] w-full bg-gradient-to-r from-primary to-transparent rounded-full mt-3" />
      </div>

      {/* Nav Sections */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-2 mb-2 mt-5 first:mt-0">
              <span className="text-[10px] font-[var(--font-bebas)] tracking-[0.15em] text-white/25">
                {section.label}
              </span>
            </div>
            <div className="space-y-0.5">
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
                        className="absolute inset-0 rounded-[var(--radius-nav)]"
                        style={{
                          background: 'linear-gradient(90deg, rgba(255,107,0,0.15) 0%, transparent 100%)',
                          borderLeft: '3px solid var(--color-primary)',
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <Icon
                      size={18}
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    />
                    <span
                      className={`relative z-10 ml-3 text-[13px] font-[var(--font-satoshi)] font-medium transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-white/50 group-hover:text-white/80'
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
      <div className="border-t border-white/10 pt-4 px-2 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white shrink-0">B</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">Baptiste</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-[var(--font-bebas)]">Créateur</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/70 shrink-0">P</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">Pierrot</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-[var(--font-bebas)]">Stratège</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
