import { AsyncLocalStorage } from "node:async_hooks";

type RequestContext = { agent: string };

// Contexte attaché à chaque requête pendant tout son traitement
export const requestContext = new AsyncLocalStorage<RequestContext>();

// Lit le nom de l'agent de la requête en cours
export function currentAgent(): string {
  return requestContext.getStore()?.agent ?? "non-identifié";
}
