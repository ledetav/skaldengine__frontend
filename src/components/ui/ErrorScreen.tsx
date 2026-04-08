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
      <div className={styles.backgroundGlow} />
      
      <div className={styles.errorCard}>
        <div className={styles.errorVisual}>
          <div className={styles.glitchContainer}>
            <span className={styles.glitchIcon}>⚠️</span>
            <div className={styles.glitchEffect} />
          </div>
          <div className={styles.neonRing} />
        </div>

        <h2 className={styles.errorTitle}>{title}</h2>
        
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
        <div className={styles.particle} style={{ '--top': '20%', '--left': '10%', '--size': '2px', '--speed': '15s' } as React.CSSProperties} />
        <div className={styles.particle} style={{ '--top': '80%', '--left': '30%', '--size': '3px', '--speed': '25s' } as React.CSSProperties} />
        <div className={styles.particle} style={{ '--top': '40%', '--left': '85%', '--size': '1px', '--speed': '10s' } as React.CSSProperties} />
        <div className={styles.particle} style={{ '--top': '15%', '--left': '75%', '--size': '4px', '--speed': '20s' } as React.CSSProperties} />
      </div>
    </div>
  );
};
