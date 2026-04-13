import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="ds-form-group">
        {label && <label className="ds-label">{label}</label>}
        <textarea
          ref={ref}
          className={`ds-textarea ${error ? 'ds-input--error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="ds-error-msg">{error}</span>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
