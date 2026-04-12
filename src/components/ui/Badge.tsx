import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'orange' | 'fuchsia' | 'red' | 'blue' | 'teal' | 'green'
}

export function Badge({ 
  children, 
  variant = 'purple', 
  className = '', 
  ...props 
}: BadgeProps) {
  const variantClass = variant ? `ds-badge--${variant}` : ''
  
  return (
    <span 
      className={`ds-badge ${variantClass} ${className}`.trim().replace(/\s+/g, ' ')} 
      {...props}
    >
      {children}
    </span>
  )
}
