import React, { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  message?: string;
  minimal?: boolean;
  fullScreen?: boolean;
}

const atmosphericMessages = [
  'Синхронизация миров...',
  'Настройка квантовых параметров...',
  'Проверка симуляции...',
  'Загрузка атмосферы...',
  'Калибровка нейронных связей...',
  'Плетение нитей сюжета...',
  'Разогрев творческого ядра...'
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  minimal = false,
  fullScreen = false
}) => {
  const [currentMessage, setCurrentMessage] = useState(message || atmosphericMessages[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        index = (index + 1) % atmosphericMessages.length;
        setCurrentMessage(atmosphericMessages[index]);
        setFade(true);
      }, 500); // Wait for fade out
    }, 3000);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className={`
      ${styles.container} 
      ${minimal ? styles.minimal : ''} 
      ${fullScreen ? styles.fullScreen : ''}
    `}>
      <div className={styles.loaderWrapper}>
        <div className={styles.outerRing} />
        <div className={styles.innerRing} />
        <div className={styles.core} />
        
        <div className={styles.scanLine} />
      </div>
      
      <div className={`${styles.textWrapper} ${fade ? styles.fadeIn : styles.fadeOut}`}>
        <span className={styles.message}>{currentMessage}</span>
        <div className={styles.progressDots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>

      {!minimal && !fullScreen && (
        <div className={styles.ambientGlow} />
      )}
    </div>
  );
};
