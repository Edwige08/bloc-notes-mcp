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
Chaque appel d'outil est journalisé automatiquement par le serveur avec :
- date : horodatage ISO 8601 en UTC (ex. 2026-10-20T14:32:10Z)
- agent : nom transmis dans l'en-tête X-Agent-Name (ou ?agent= dans l'URL),
  au format "outil-prénom" (ex. cursor-camille). Sans nom : "non-identifié".
- action : nom de l'outil appelé (get_rules, read_notes, append_note, replace_notes)
- summary : les 100 premiers caractères du contenu écrit (append_note, replace_notes)
- previous : l'ancien contenu complet, pour replace_notes uniquement (permet la restauration)
La lecture et la consultation des règles sont aussi tracées.
Après chaque écriture, indique à l'utilisateur ce que tu as ajouté ou modifié.
`;
