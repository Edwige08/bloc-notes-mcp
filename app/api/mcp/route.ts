import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { RULES } from "@/lib/rules";
import { getNotes, appendToNotes, setNotes, addHistory } from "@/lib/store";
import { timingSafeEqual } from "node:crypto";
import { requestContext, currentAgent } from "@/lib/agent-context";


function summary(text: string) {
  return text.length > 100 ? text.slice(0, 100) + "…" : text;
}

const mcpHandler = createMcpHandler(
  (server) => {
    // ---------- get_rules ----------
    server.registerTool(
      "get_rules",
      {
        title: "Lire les règles du bloc-notes",
        description:
          "À APPELER EN PREMIER, avant toute utilisation du bloc-notes partagé. " +
          "Retourne les règles : quand lire, quoi écrire, quel format, " +
          "quelles actions demandent une confirmation.",
      },
      async () => {
        await addHistory({ date: new Date().toISOString(), agent: currentAgent(), action: "get_rules" });
        return { content: [{ type: "text", text: RULES }] };
      }
    );

    // ---------- read_notes ----------
    server.registerTool(
      "read_notes",
      {
        title: "Lire le bloc-notes",
        description:
          "Retourne le contenu complet du bloc-notes partagé entre les agents " +
          "(tâches, échéances, décisions du projet). " +
          "À utiliser avant toute écriture et pour répondre aux questions sur le projet.",
      },
      async () => {
        const notes = await getNotes();
        await addHistory({ date: new Date().toISOString(), agent: currentAgent(), action: "read_notes" });
        return { content: [{ type: "text", text: notes || "(Le bloc-notes est vide.)" }] };
      }
    );

    // ---------- append_note ----------
    server.registerTool(
      "append_note",
      {
        title: "Ajouter une note",
        description:
          "Ajoute UNE ligne à la fin du bloc-notes sans modifier le contenu existant. " +
          "Format attendu : '- [AAAA-MM-JJ] [CATÉGORIE] contenu', " +
          "avec CATÉGORIE parmi TODO, DÉCISION, ÉCHÉANCE, INFO, FAIT.",
        inputSchema: z.object({
          content: z
            .string()
            .min(1)
            .max(2000)
            .describe("La ligne à ajouter, au format décrit dans get_rules"),
        }),
      },
      async ({ content }) => {
        await appendToNotes(content);
        await addHistory({
          date: new Date().toISOString(),
          agent: currentAgent(),
          action: "append_note",
          summary: summary(content),
        });
        return { content: [{ type: "text", text: `Note ajoutée : ${content}` }] };
      }
    );

    // ---------- replace_notes ----------
    server.registerTool(
      "replace_notes",
      {
        title: "Remplacer tout le bloc-notes",
        description:
          "ACTION SENSIBLE : remplace la TOTALITÉ du bloc-notes. " +
          "N'utiliser qu'après avoir lu les notes, montré à l'utilisateur ce qui va changer, " +
          "et obtenu son accord explicite. Ne jamais l'utiliser pour un simple ajout " +
          "(utiliser append_note).",
        inputSchema: z.object({
          content: z.string().max(20000).describe("Le nouveau contenu complet du bloc-notes"),
          user_confirmed: z
            .boolean()
            .describe("true uniquement si l'utilisateur a explicitement validé ce remplacement"),
        }),
      },
      async ({ content, user_confirmed }) => {
        if (!user_confirmed) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text:
                  "Remplacement refusé : demande d'abord une confirmation explicite " +
                  "à l'utilisateur, puis rappelle l'outil avec user_confirmed = true.",
              },
            ],
          };
        }
        const previous = await setNotes(content);
        await addHistory({
          date: new Date().toISOString(),
          agent: currentAgent(),
          action: "replace_notes",
          summary: summary(content),
          previous,
        });
        return {
          content: [
            { type: "text", text: "Bloc-notes remplacé. L'ancienne version est conservée dans l'historique." },
          ],
        };
      }
    );
  },
  {
    serverInfo: { name: "bloc-notes-partage", version: "1.0.0" },
    instructions:
      "Ce serveur donne accès à un bloc-notes partagé entre plusieurs agents IA. " +
      "OBLIGATOIRE : avant toute première utilisation du bloc-notes dans une conversation, " +
      "appelle get_rules() et respecte les règles retournées.",
    verboseLogs: true,
  }
);


// ---------- Authentification par clé partagée ----------

// Comparaison en temps constant : évite de deviner la clé
// en mesurant le temps de réponse du serveur.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function isAuthorized(req: Request): boolean {
  const expected = process.env.MCP_API_KEY;
  if (!expected) return false; // pas de clé configurée → tout est refusé

  // 1. En-tête Authorization: Bearer ... (méthode recommandée)
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  // 2. Paramètre ?key=... dans l'URL (solution de repli pour le TP)
  const queryKey = new URL(req.url).searchParams.get("key");

  const provided = bearer ?? queryKey;
  return provided !== null && safeEqual(provided, expected);
}

// ---------- Identification de l'agent ----------

function getAgentName(req: Request): string {
  // En-tête X-Agent-Name, ou ?agent=... pour les clients sans en-têtes personnalisés
  const raw =
    req.headers.get("x-agent-name") ??
    new URL(req.url).searchParams.get("agent") ??
    "";
  // Nettoyage : lettres, chiffres, . _ - uniquement, 50 caractères max
  const clean = raw.trim().replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 50);
  return clean || "non-identifié";
}

async function handler(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Non autorisé : clé manquante ou invalide." },
        id: null,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const agent = getAgentName(req);
  return requestContext.run({ agent }, () => mcpHandler(req));
}

export { handler as GET, handler as POST };
