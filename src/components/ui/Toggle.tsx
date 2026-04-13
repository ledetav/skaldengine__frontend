import styles from './Toggle.module.css'

interface ToggleProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Toggle({ 
  label, 
  checked, 
  onChange, 
  disabled = false,
  className = '' 
}: ToggleProps) {
  return (
    <label className={`${styles.toggleRow} ${checked ? styles.toggleActive : ''} ${disabled ? styles.isDisabled : ''} ${className}`}>
      <div className={styles.toggleSwitch}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={styles.hiddenInput}
        />
      </div>
      {label && <span className={styles.toggleLabel}>{label}</span>}
    </label>
  )
}
