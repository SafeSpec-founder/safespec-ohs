const isDev = (import.meta.env as any).DEV;

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    // Errors should always be logged
    console.error(...args);
  },
};
