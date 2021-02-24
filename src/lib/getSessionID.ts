import { IncomingMessage } from "http";

export default function getSessionID(request: IncomingMessage): string | null {
  const auth = request.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  } else {
    return null;
  }
}
