/**
 * @fileoverview Утилитарный сервис логирования клиентской части приложения.
 * Поддерживает градации уровней DEBUG, INFO, WARN, ERROR, настраиваемые через переменные окружения,
 * и форматирует сообщения с временными метками для удобной отладки в консоли браузера.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Сервис логирования клиентского приложения.
 * Поддерживает уровни DEBUG, INFO, WARN, ERROR, настраиваемые через переменную VITE_LOG_LEVEL.
 */
class LoggerService {
  private level: number;

  constructor() {
    const envLevel = (import.meta.env.VITE_LOG_LEVEL as string)?.toUpperCase() as LogLevel;
    const defaultLevel = 'WARN';
    const activeLevel = LOG_LEVELS[envLevel] !== undefined ? envLevel : defaultLevel;

    this.level = LOG_LEVELS[activeLevel];
  }

  /**
   * Проверяет, должен ли выводиться лог для указанного уровня.
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.level;
  }

  /**
   * Форматирует сообщение с добавлением временной метки и уровня логирования.
   */
  private formatMessage(level: LogLevel, message: string, ...args: any[]): any[] {
    const timestamp = new Date().toISOString();
    return [`[${timestamp}] [${level}] ${message}`, ...args];
  }

  /**
   * Отладочное сообщение.
   */
  debug = (message: string, ...args: any[]) => {
    if (this.shouldLog('DEBUG')) {
      console.debug(...this.formatMessage('DEBUG', message, ...args));
    }
  }

  /**
   * Информационное сообщение.
   */
  info = (message: string, ...args: any[]) => {
    if (this.shouldLog('INFO')) {
      console.info(...this.formatMessage('INFO', message, ...args));
    }
  }

  /**
   * Предупреждение.
   */
  warn = (message: string, ...args: any[]) => {
    if (this.shouldLog('WARN')) {
      console.warn(...this.formatMessage('WARN', message, ...args));
    }
  }

  /**
   * Сообщение об ошибке.
   */
  error = (message: string, ...args: any[]) => {
    if (this.shouldLog('ERROR')) {
      console.error(...this.formatMessage('ERROR', message, ...args));
    }
  }
}

/**
 * Синглтон логера для использования во всем клиентском приложении.
 */
export const logger = new LoggerService();
