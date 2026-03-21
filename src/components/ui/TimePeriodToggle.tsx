interface TimePeriodToggleProps {
  periods: string[]
  activePeriod: string
  onChange: (period: string) => void
}

export default function TimePeriodToggle({ periods, activePeriod, onChange }: TimePeriodToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-button)] bg-border-light p-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-3 py-1.5 rounded-[var(--radius-button)] text-xs font-medium font-[var(--font-satoshi)] transition-all duration-200 cursor-pointer ${
            period === activePeriod
              ? 'bg-primary text-white shadow-[var(--shadow-button-primary)]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  )
}
