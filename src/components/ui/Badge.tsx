import type { ReactNode } from 'react'

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant: BadgeVariant
  size?: 'sm' | 'md'
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary',
  secondary: 'bg-secondary-50 text-secondary-dark',
  success: 'bg-success-50 text-success-dark',
  error: 'bg-error-50 text-error-dark',
  warning: 'bg-warning-50 text-warning',
  info: 'bg-info-50 text-info',
  neutral: 'bg-border-light text-text-secondary',
}

export default function Badge({ children, variant, size = 'md' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'h-5 px-2 text-[10px]' : ''

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClass}`}>
      {children}
    </span>
  )
}
