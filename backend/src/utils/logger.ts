const ts = () => new Date().toISOString();

export const logger = {
  info:  (...a: unknown[]) => console.log (`\x1b[36m[INFO]\x1b[0m  ${ts()}`, ...a),
  warn:  (...a: unknown[]) => console.warn(`\x1b[33m[WARN]\x1b[0m  ${ts()}`, ...a),
  error: (...a: unknown[]) => console.error(`\x1b[31m[ERROR]\x1b[0m ${ts()}`, ...a),
  debug: (...a: unknown[]) => { if (process.env.NODE_ENV !== 'production') console.log(`\x1b[90m[DEBUG]\x1b[0m ${ts()}`, ...a); },
};
