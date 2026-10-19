import { createMcpHandler } from "mcp-handler";
import { RULES } from "@/lib/rules";

let notes = "- [2026-10-19] [INFO] Bloc-notes créé.";

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_rules",
      {
        title: "Lire les règles du bloc-notes",
        description:
          "À APPELER EN PREMIER, avant toute utilisation du bloc-notes partagé. " +
          "Retourne les règles : quand lire, quoi écrire, quel format, " +
          "quelles actions demandent une confirmation.",
        // pas de paramètre → pas d'inputSchema
      },
      async () => ({ content: [{ type: "text", text: RULES }] })
    );

    server.registerTool(
      "read_notes",
      {
        title: "Lire le bloc-notes",
        description:
          "Retourne le contenu complet du bloc-notes partagé entre les agents " +
          "(tâches, échéances, décisions du projet).",
      },
      async () => ({ content: [{ type: "text", text: notes }] })
    );
  },
  { serverInfo: { name: "bloc-notes-partage", version: "1.0.0" }, verboseLogs: true }
);

export { handler as GET, handler as POST };
