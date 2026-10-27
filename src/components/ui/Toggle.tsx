/**
 * @fileoverview Компонент двухпозиционного переключателя (Toggle Switch) дизайн-системы.
 */

import styles from './Toggle.module.css'

interface ToggleProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

/**
 * Интерактивный тумблер-переключатель (свитчер) с опциональной текстовой меткой.
 * 
 * @param props.label - Текстовая подпись переключателя
 * @param props.checked - Булево состояние включено/выключено
 * @param props.onChange - Обработчик изменения состояния
 * @param props.disabled - Флаг блокировки взаимодействия
 * @param props.className - Дополнительный CSS класс
 */
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
