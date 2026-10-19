export const RULES = `
RÈGLES D'UTILISATION DU BLOC-NOTES PARTAGÉ

1. QUAND LIRE
- Appelle read_notes avant toute écriture, pour éviter les doublons et les contradictions.
- Appelle read_notes dès que l'utilisateur pose une question sur le projet
  (échéances, tâches, décisions), même s'il ne mentionne pas les notes.

2. CE QUE TU PEUX FAIRE SEUL
- Ajouter une information avec append_note quand l'utilisateur le demande
  explicitement ("note que…", "ajoute dans les notes…").
- Ne jamais ajouter une information de ta propre initiative sans le signaler à l'utilisateur.

3. CE QUI DEMANDE UNE CONFIRMATION
- replace_notes efface tout le contenu existant. Avant de l'utiliser :
  a) lis les notes actuelles,
  b) montre à l'utilisateur ce qui sera supprimé ou modifié,
  c) attends son accord explicite.
- Ne jamais utiliser replace_notes pour simplement ajouter une information.

4. CE QUI EST INTERDIT
- Inventer, déduire ou reformuler une information au point d'en changer le sens.
- Supprimer une note parce qu'elle te semble obsolète sans accord de l'utilisateur.
- Stocker des secrets (mots de passe, clés API, données personnelles sensibles).

5. FORMAT DES NOTES
Une information par ligne, sous cette forme :
- [AAAA-MM-JJ] [CATÉGORIE] contenu court et factuel
Catégories autorisées : TODO, DÉCISION, ÉCHÉANCE, INFO.
Exemple : - [2026-10-19] [ÉCHÉANCE] Le projet doit être livré vendredi 23 octobre.
Une tâche terminée n'est pas supprimée : elle est marquée [FAIT].

6. TRAÇABILITÉ
Le serveur journalise automatiquement chaque appel avec :
date (ISO 8601, UTC), nom de l'agent (en-tête X-Agent-Name), action (nom de l'outil),
et un résumé du contenu (100 premiers caractères pour append_note / replace_notes).
Tu dois toujours t'identifier avec un nom d'agent du type "outil-prénom".
Après chaque écriture, indique à l'utilisateur ce que tu as ajouté ou modifié.
`;
