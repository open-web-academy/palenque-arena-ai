const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const levels: { [key: string]: number } = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export function log(msg: string, level: string = "info") {
  if (levels[level] <= levels[LOG_LEVEL]) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${level.toUpperCase()}] ${msg}`);
  }
}
