/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
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
