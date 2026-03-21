import { Bell, Download, Search } from 'lucide-react'

const MARQUEE_ITEMS = [
  'BATTELLS', '◆', '543K ABONNÉS', '◆', 'CENTRE DE COMMANDE', '◆',
  'YOUTUBE FOOD CREATOR', '◆', 'DINGUERIE', '◆', 'BANGER MODE', '◆',
  'ANALYTICS', '◆', 'CRÉATION', '◆', 'INTELLIGENCE', '◆', 'BUSINESS', '◆',
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

export default function Header() {
  return (
    <>
      {/* Marquee ticker strip */}
      <MarqueeStrip />

      {/* Main header */}
      <header className="sticky top-[var(--spacing-marquee)] z-[var(--z-header)] h-[var(--spacing-header)] flex items-center justify-between px-8 backdrop-blur-[12px] bg-page/85 border-b border-border">
        {/* Left: empty for page context */}
        <div />

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-56 h-9 pl-9 pr-4 rounded-full bg-surface text-sm text-text-primary placeholder:text-text-tertiary border border-border outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 font-[var(--font-satoshi)]"
            />
          </div>

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors border border-border">
            <Bell size={18} className="text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* Export */}
          <button className="btn-primary flex items-center gap-2 h-9 px-4 text-sm rounded-full">
            <Download size={15} />
            Exporter
          </button>
        </div>
      </header>
    </>
  )
}
