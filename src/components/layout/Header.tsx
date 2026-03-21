import { Bell, Download, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-[var(--z-header)] h-[var(--spacing-header)] flex items-center justify-between px-8 backdrop-blur-[8px] bg-page/80">
      {/* Left: Page context */}
      <div />

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-60 h-10 pl-9 pr-4 rounded-[var(--radius-nav)] bg-border-light text-sm text-text-primary placeholder:text-text-tertiary border-none outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-[var(--radius-nav)] hover:bg-border-light transition-colors">
          <Bell size={20} className="text-text-secondary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Export */}
        <button className="btn-secondary flex items-center gap-2 h-9 px-4 text-sm">
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  )
}
