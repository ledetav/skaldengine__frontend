import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'orange' | 'fuchsia' | 'red'
}

export function Badge({ 
  children, 
  variant = 'purple', 
  className = '', 
  ...props 
}: BadgeProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'orange': return 'ds-badge--orange'
      case 'fuchsia': return 'ds-badge--fuchsia'
      case 'purple': return 'ds-badge--purple'
      case 'red': return 'ds-badge--red'
      default: return 'ds-badge'
    }
  }

  return (
    <span className={`${getVariantClass()} ${className}`} {...props}>
      {children}
    </span>
  )
}
