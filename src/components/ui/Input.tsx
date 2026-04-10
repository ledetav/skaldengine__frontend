import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="ds-form-group">
        {label && <label className="ds-label">{label}</label>}
        <input
          ref={ref}
          className={`ds-input ${error ? 'ds-input--error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="ds-error-msg">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
