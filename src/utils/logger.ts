export const logger = {
  info: (...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    // Errors should always be logged
    console.error(...args);
  },
};
