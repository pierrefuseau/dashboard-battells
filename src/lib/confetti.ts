import confetti from 'canvas-confetti'

export function celebratePublished() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF6B00', '#FFB800', '#FF8A33', '#E05A00', '#FFCA33'],
  })
}
