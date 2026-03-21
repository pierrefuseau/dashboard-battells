import { Bell, Download, Menu, Search } from 'lucide-react'

const MARQUEE_ITEMS = [
  'BATTELLS', '◆', '543K ABONNÉS', '◆', 'CENTRE DE COMMANDE', '◆',
  'CRÉATEUR FOOD YOUTUBE', '◆', 'DINGUERIE', '◆', 'MODE BANGER', '◆',
  'ANALYTICS', '◆', 'AUDIENCE', '◆', 'SIMULATEUR', '◆', 'QUADRANT', '◆',
]

function MarqueeStrip() {
  const content = MARQUEE_ITEMS.join('   ')
  return (
    <div className="marquee-strip">
      <div className="marquee-content">
        <span className="px-1">{content}</span>
        <span className="px-1">{content}</span>
      </div>
    </div>
  )
}

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <>
      {/* Marquee ticker strip */}
      <MarqueeStrip />

      {/* Main header */}
      <header className="sticky top-[28px] sm:top-[var(--spacing-marquee)] z-[var(--z-header)] h-[var(--spacing-header)] flex items-center justify-between px-4 sm:px-6 lg:px-8 backdrop-blur-[12px] bg-page/85 border-b border-border">
        {/* Left: Hamburger on mobile */}
        <button
          onClick={onMenuToggle}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors lg:hidden"
          aria-label="Menu"
        >
          <Menu size={20} className="text-text-primary" />
        </button>

        {/* Left spacer on desktop */}
        <div className="hidden lg:block" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search — hidden on very small screens, icon-only on mobile */}
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-40 md:w-56 h-9 pl-9 pr-4 rounded-full bg-surface text-sm text-text-primary placeholder:text-text-tertiary border border-border outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 font-[var(--font-satoshi)]"
            />
          </div>
          {/* Search icon only on small mobile */}
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors border border-border sm:hidden">
            <Search size={18} className="text-text-secondary" />
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors border border-border">
            <Bell size={18} className="text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* Export — hidden on mobile */}
          <button className="btn-primary hidden sm:flex items-center gap-2 h-9 px-4 text-sm rounded-full">
            <Download size={15} />
            <span className="hidden md:inline">Exporter</span>
          </button>
        </div>
      </header>
    </>
  )
}
