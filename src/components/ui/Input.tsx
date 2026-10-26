import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', maxLength, ...props }, ref) => {
    const valueLength = props.value ? String(props.value).length : 0
    return (
      <div className="ds-form-group">
        {label && <label className="ds-label">{label}</label>}
        <input
          ref={ref}
          className={`ds-input ${error ? 'ds-input--error' : ''} ${className}`}
          maxLength={maxLength}
          {...props}
        />
        {maxLength && (
          <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            {valueLength} / {maxLength}
          </div>
        )}
        {error && <span className="ds-error-msg">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
