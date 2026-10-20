import { Redis } from "@upstash/redis";

let client: Redis | null = null;

// Crée le client Redis au premier besoin, pas au chargement du fichier
function getRedis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Variables Redis introuvables : vérifie .env.local en local, " +
        "ou Settings → Environment Variables sur Vercel."
    );
  }

  client = new Redis({ url, token, automaticDeserialization: false });
  return client;
}

const NOTES_KEY = "notes";
const HISTORY_KEY = "history";
const HISTORY_MAX = 200;

export type HistoryEntry = {
  date: string;
  agent: string;
  action: string;
  summary?: string;
  previous?: string;
};

// ---------- Notes ----------

export async function getNotes(): Promise<string> {
  const value = await getRedis().get<string>(NOTES_KEY);
  return (value ?? "").trim();
}

export async function appendToNotes(line: string): Promise<void> {
  await getRedis().append(NOTES_KEY, "\n" + line.trim());
}

export async function setNotes(content: string): Promise<string> {
  const previous = await getNotes();
  await getRedis().set(NOTES_KEY, content.trim());
  return previous;
}

// ---------- Historique ----------

export async function addHistory(entry: HistoryEntry): Promise<void> {
  await getRedis().lpush(HISTORY_KEY, JSON.stringify(entry));
  await getRedis().ltrim(HISTORY_KEY, 0, HISTORY_MAX - 1);
}

export async function getHistory(limit = 50): Promise<HistoryEntry[]> {
  const raw = await getRedis().lrange<string>(HISTORY_KEY, 0, limit - 1);
  return raw.map((item) => JSON.parse(item) as HistoryEntry);
}
