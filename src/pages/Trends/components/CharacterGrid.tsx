import type { Character } from '../mockData'

interface CharacterGridProps {
  characters: Character[]
}

function StarRating({ score }: { score: number }) {
  return (
    <span className="text-sm tracking-wider">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < score ? '' : 'opacity-20'}>
          {'⭐'}
        </span>
      ))}
    </span>
  )
}

export default function CharacterGrid({ characters }: CharacterGridProps) {
  return (
    <div className="card p-6 h-full">
      <h2 className="text-lg font-bold font-[var(--font-clash)] text-text-primary mb-5">
        Personnages non couverts
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {characters.map((char) => (
          <div
            key={char.id}
            className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius-card)] bg-page border border-border-light"
          >
            {/* Avatar circle */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${char.color}15` }}
            >
              {char.emoji}
            </div>

            {/* Name */}
            <span className="font-[var(--font-satoshi)] font-medium text-sm text-text-primary text-center">
              {char.name}
            </span>

            {/* Stars */}
            <StarRating score={char.score} />

            {/* Action button */}
            <button className="mt-1 h-7 px-3 rounded-[var(--radius-button)] bg-primary text-white text-xs font-[var(--font-satoshi)] font-medium hover:bg-primary-light transition-colors cursor-pointer">
              Planifier
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
