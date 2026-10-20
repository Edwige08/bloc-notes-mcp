import { Suspense } from "react";
import { getNotes, getHistory } from "@/lib/store";
import { isValidKey } from "@/lib/auth";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
}

type SearchParams = Promise<{ key?: string }>;

// Partie fixe de la page : affichée immédiatement
export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main style={styles.main}>
      <h1>Bloc-notes partagé</h1>
      <Suspense fallback={<p>Chargement…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// Partie dynamique : lue à chaque visite (clé, notes, historique)
async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { key } = await searchParams;

  // ---------- Pas de clé valide : formulaire ----------
  if (!isValidKey(key)) {
    return (
      <>
        <p>Accès protégé. Saisis la clé pour consulter les notes.</p>
        {key && <p style={{ color: "crimson" }}>Clé invalide.</p>}
        <form method="GET" style={{ display: "flex", gap: 8 }}>
          <input type="password" name="key" placeholder="Clé d’accès" required style={styles.input} />
          <button type="submit" style={styles.button}>Accéder</button>
        </form>
      </>
    );
  }

  // ---------- Clé valide : notes + historique ----------
  const [notes, history] = await Promise.all([getNotes(), getHistory(50)]);

  return (
    <>
      <section>
        <h2>Contenu actuel</h2>
        <pre style={styles.notes}>{notes || "(Le bloc-notes est vide.)"}</pre>
      </section>

      <section>
        <h2>Dernières actions ({history.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Agent</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Détail</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, i) => (
                <tr key={i}>
                  <td style={styles.td}>{formatDate(entry.date)}</td>
                  <td style={styles.td}><code>{entry.agent}</code></td>
                  <td style={styles.td}>{entry.action}</td>
                  <td style={styles.td}>{entry.summary ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 960, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" },
  notes: { whiteSpace: "pre-wrap", padding: "1rem", border: "1px solid #8884", borderRadius: 8, lineHeight: 1.6 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: "8px", borderBottom: "2px solid #8886" },
  td: { padding: "8px", borderBottom: "1px solid #8883", verticalAlign: "top" },
  input: { flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #8888" },
  button: { padding: "8px 16px", borderRadius: 6, border: "none", background: "#2563eb", color: "white", cursor: "pointer" },
};
