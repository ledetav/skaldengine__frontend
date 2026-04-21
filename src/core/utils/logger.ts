type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class LoggerService {
  private level: number;

  constructor() {
    const envLevel = (import.meta.env.VITE_LOG_LEVEL as string)?.toUpperCase() as LogLevel;
    const defaultLevel = 'WARN';
    const activeLevel = LOG_LEVELS[envLevel] !== undefined ? envLevel : defaultLevel;

    this.level = LOG_LEVELS[activeLevel];
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.level;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): any[] {
    const timestamp = new Date().toISOString();
    return [`[${timestamp}] [${level}] ${message}`, ...args];
  }

  debug = (message: string, ...args: any[]) => {
    if (this.shouldLog('DEBUG')) {
      console.debug(...this.formatMessage('DEBUG', message, ...args));
    }
  }

  info = (message: string, ...args: any[]) => {
    if (this.shouldLog('INFO')) {
      console.info(...this.formatMessage('INFO', message, ...args));
    }
  }

  warn = (message: string, ...args: any[]) => {
    if (this.shouldLog('WARN')) {
      console.warn(...this.formatMessage('WARN', message, ...args));
    }
  }

  error = (message: string, ...args: any[]) => {
    if (this.shouldLog('ERROR')) {
      console.error(...this.formatMessage('ERROR', message, ...args));
    }
  }
}

export const logger = new LoggerService();
