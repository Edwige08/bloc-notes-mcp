import { timingSafeEqual } from "node:crypto";

// Vérifie une clé fournie par l'utilisateur, en temps constant
export function isValidKey(provided: string | null | undefined): boolean {
  const expected = process.env.MCP_API_KEY;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
