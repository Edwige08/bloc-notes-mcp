import { createMcpHandler } from "mcp-handler";
import { RULES } from "@/lib/rules";

// Stockage TEMPORAIRE en mémoire : sera remplacé par Redis à l'étape 3
let notes = "- [2026-10-19] [INFO] Bloc-notes créé.";

const handler = createMcpHandler(
  (server) => {
    // Outil 1 : les règles
    server.registerTool(
      "get_rules",
      {
        title: "Lire les règles du bloc-notes",
        description:
          "À APPELER EN PREMIER, avant toute utilisation du bloc-notes partagé. " +
          "Retourne les règles d'utilisation : quand lire, quoi écrire, quel format, " +
          "quelles actions demandent une confirmation.",
        inputSchema: {},
      },
      async () => ({
        content: [{ type: "text", text: RULES }],
      })
    );

    // Outil 2 : lire les notes
    server.registerTool(
      "read_notes",
      {
        title: "Lire le bloc-notes",
        description:
          "Retourne le contenu complet du bloc-notes partagé entre les agents " +
          "(tâches, échéances, décisions du projet). Appeler get_rules avant la première utilisation.",
        inputSchema: {},
      },
      async () => ({
        content: [{ type: "text", text: notes }],
      })
    );
  },
  {}, // options du serveur (nom, version… facultatif)
  { basePath: "/api", maxDuration: 60, verboseLogs: true }
);

export { handler as GET, handler as POST };
