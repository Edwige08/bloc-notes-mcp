import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  throw new Error(
    "Variables Redis introuvables : vérifie .env.local en local, " +
      "ou Settings → Environment Variables sur Vercel."
  );
}

// Accepte les deux conventions de nommage des variables d'environnement
const redis = new Redis({ url, token, automaticDeserialization: false });
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN!,
//   automaticDeserialization: false, // on gère nous-mêmes le JSON
// });

const NOTES_KEY = "notes";
const HISTORY_KEY = "history";
const HISTORY_MAX = 200; // on garde les 200 dernières actions

export type HistoryEntry = {
  date: string;     // ISO 8601, UTC
  agent: string;
  action: string;
  summary?: string; // début du contenu écrit
  previous?: string; // ancien contenu (uniquement pour replace_notes)
};

// ---------- Notes ----------

export async function getNotes(): Promise<string> {
  const value = await redis.get<string>(NOTES_KEY);
  return (value ?? "").trim();
}

export async function appendToNotes(line: string): Promise<void> {
  // APPEND est atomique côté Redis : deux agents qui écrivent
  // en même temps ne s'écrasent pas mutuellement.
  await redis.append(NOTES_KEY, "\n" + line.trim());
}

export async function setNotes(content: string): Promise<string> {
  const previous = await getNotes();
  await redis.set(NOTES_KEY, content.trim());
  return previous;
}

// ---------- Historique ----------

export async function addHistory(entry: HistoryEntry): Promise<void> {
  await redis.lpush(HISTORY_KEY, JSON.stringify(entry));
  await redis.ltrim(HISTORY_KEY, 0, HISTORY_MAX - 1);
}

export async function getHistory(limit = 50): Promise<HistoryEntry[]> {
  const raw = await redis.lrange<string>(HISTORY_KEY, 0, limit - 1);
  return raw.map((item) => JSON.parse(item) as HistoryEntry);
}