import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ErrorScreen.module.css';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backText?: string;
  backPath?: string;
  minimal?: boolean;
  showActions?: boolean;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Упс! Что-то пошло не так',
  message,
  onRetry,
  backText = 'Вернуться в дашборд',
  backPath = '/dashboard',
  minimal = false,
  showActions = true
}) => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.errorOverlay} ${minimal ? styles.minimal : ''}`}>
      <div className={styles.backgroundGlow} style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)' }} />
      
      <div className={styles.errorCard} style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
        <div className={styles.errorVisual}>
          <div className={styles.glitchContainer}>
            <span className={styles.glitchIcon}>
              {/* Заменили эмодзи на четкую красную иконку с крестиком */}
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </span>
            <div className={styles.glitchEffect} />
          </div>
          {/* Добавили красную рамку и тень для кольца */}
          <div className={styles.neonRing} style={{ borderColor: '#ef4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }} />
        </div>

        <h2 className={styles.errorTitle} style={{ color: '#ef4444' }}>{title}</h2>
        
        {message && (
          <div className={styles.messageBox}>
            <p className={styles.errorMessage}>{message}</p>
          </div>
        )}

        {showActions && (
          <div className={styles.errorActions}>
            {onRetry && (
              <button className={styles.retryBtn} onClick={onRetry}>
                Попробовать снова
              </button>
            )}
            <button 
              className={styles.backBtn} 
              onClick={() => navigate(backPath)}
            >
              {backText}
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.particleLayer}>
        <div className={styles.particle} style={{ '--top': '20%', '--left': '10%', '--size': '2px', '--speed': '15s', backgroundColor: '#ef4444' } as React.CSSProperties} />
        <div className={styles.particle} style={{ '--top': '80%', '--left': '30%', '--size': '3px', '--speed': '25s', backgroundColor: '#ef4444' } as React.CSSProperties} />
        <div className={styles.particle} style={{ '--top': '40%', '--left': '85%', '--size': '1px', '--speed': '10s', backgroundColor: '#ef4444' } as React.CSSProperties} />
      </div>
    </div>
  );
};
