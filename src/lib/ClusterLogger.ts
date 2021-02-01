export type LogSeverity = "debug" | "log" | "info" | "warn" | "error";
export type LogCategory =
  | "space"
  | "space/connection"
  | "auth"
  | "session"
  | "requests";

function base(category: string, message: any, severity: LogSeverity = "info") {
  console[severity](`[${category}] [${severity}]`, message);
}

export function getLogger(category: LogCategory) {
  return base.bind(null, category);
}
