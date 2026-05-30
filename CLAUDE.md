# CLAUDE.md — SQLSanté

## Vision du projet

SQLSanté est une **plateforme d'apprentissage SQL interactive** qui s'adresse aux professionnels et étudiants des sciences de la santé. L'objectif n'est pas seulement d'enseigner la syntaxe SQL, mais de développer une **compétence analytique réelle** en travaillant sur des données qui reflètent leur terrain professionnel.

### Principe fondateur
> "Apprendre SQL à travers des données qu'on comprend déjà."

Un épidémiologiste apprend mieux avec des données d'incidence de maladie. Un diététicien avec des données nutritionnelles. Un analyste BI santé avec des tableaux de bord de performance hospitalière. Le même moteur SQL sert tous ces contextes — seul le **domaine** change.

### Domaines prévus
| Domaine | Description | Compétences SQL prioritaires |
|---|---|---|
| `sante-hop` | Gestion hospitalière (actuel) | SELECT, JOIN, agrégation, fenêtrage |
| `epide` | Épidémiologie | Taux, ratios, séries temporelles, cohortes |
| `bi-sante` | Intelligence d'affaire en santé | KPIs, tableaux de bord, OLAP, CTE |
| `nutrition` | Nutrition clinique | Calculs, profils, comparaisons population |
| `recherche` | Recherche clinique | Essais, cohortes, biais, données manquantes |

---

## Architecture actuelle

```
santeSQL/
  index.html          — Coquille HTML pure, aucune logique
  favicon.svg         — Logo SVG inline
  css/
    style.css         — Tous les styles (dark theme GitHub)
  js/
    db.js             — Moteur SQL.js + données du domaine actif
    curriculum.js     — Leçons (CUR), schéma (SCHEMA_DEF)
    app.js            — État, rendu, navigation, exécution
```

### Moteur SQL
- **SQL.js** (SQLite compilé en WebAssembly) — vrai SQLite, 100% navigateur
- CDN : `cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js`
- La base est créée en mémoire au chargement via `SQL_INIT` (chaîne SQL)
- `resetDB()` recrée la base depuis `SQL_INIT` — aucun état persistant côté moteur

### Persistence
- `localStorage` clé `sqlsante_v2` : `{lvl, idx, done[], exDone[]}`
- `done` = Set des IDs de leçons dont les 3 exercices sont complétés
- `exDone` = Set des clés d'exercices individuels (`'d1_0'`, `'d1_1'`, `'d1_2'`)
- Migration automatique depuis `sqlsante_v1` au premier chargement

### Progression débloquée
La leçon suivante se débloque uniquement quand les **3 exercices** de la leçon courante sont complétés. Un exercice est complété dès qu'une requête s'exécute sans erreur.

---

## Architecture cible (multi-domaines)

Le refactoring prioritaire avant d'ajouter un nouveau domaine :

```
santeSQL/
  index.html
  css/style.css
  js/
    app.js              — Moteur applicatif (inchangé pour chaque domaine)
    db.js               — Moteur SQL.js (inchangé pour chaque domaine)
    domains/
      sante-hop.js      — Domaine actuel : SQL_INIT + CUR + SCHEMA_DEF
      epide.js          — Futur
      bi-sante.js       — Futur
      nutrition.js      — Futur
      recherche.js      — Futur
```

### Structure d'un fichier domaine
Chaque fichier `domains/xxx.js` exporte exactement trois constantes :

```javascript
// Métadonnées du domaine
const DOMAIN_META = {
  id: 'epide',
  name: 'Épidémiologie',
  icon: '🦠',
  description: 'Analyse de données de surveillance épidémiologique'
};

// Données SQL (CREATE TABLE + INSERT)
const SQL_INIT = `...`;

// Leçons structurées par niveau
const CUR = { d: [...], i: [...], a: [...], e: [...] };

// Schéma pour le panneau Structure BD
const SCHEMA_DEF = [...];
```

### Règle de conception des domaines
- Chaque domaine doit couvrir les **8 catégories de compétences SQL** du SKILL_MAP (SELECT, Jointures, Agrégation, CTE, Fenêtrage, DML/DDL, Chaînes/Dates, CASE/Ensembles)
- Minimum 10 leçons par niveau, 3 exercices par leçon
- Les données doivent être **réalistes mais anonymisées** — jamais de vraies données patient
- Les exercices doivent progresser du plus simple au plus complexe dans chaque niveau

---

## Performance

### Ce qui est en place
- **Zéro backend** — fichiers statiques purs, déployables sur GitHub Pages / Netlify / Vercel
- **SQL.js chargé une seule fois** au démarrage (~1 Mo WASM, 1-2 sec selon connexion)
- **Pas de re-render global** — `execute()` met à jour uniquement les éléments DOM qui changent
- **queryCache** — la requête tapée dans l'éditeur est mémorisée par exercice, pas perdue lors de la navigation

### Règles à respecter
- Ne **jamais** appeler `renderLesson()` depuis `execute()` — trop coûteux, fait clignoter l'UI
- Garder `SQL_INIT` compact — pas de données inutiles, le WASM charge la base en mémoire
- Si un domaine a plus de 10 000 lignes de données, évaluer un chargement lazy plutôt qu'un `SQL_INIT` monolithique
- Le `localStorage` est synchrone et bloquant — `saveProgress()` doit rester minimal

### Indicateurs à surveiller
- Temps d'initialisation SQL.js < 3 secondes sur connexion moyenne
- Toute requête utilisateur doit répondre en < 500 ms (SQLite en mémoire est très rapide)
- Taille de `curriculum.js` par domaine : viser < 150 Ko non minifié

---

## Sécurité

### Surface d'attaque actuelle : quasi-nulle
- Aucun backend, aucune base de données serveur, aucun compte utilisateur
- Les requêtes SQL s'exécutent dans le **sandbox WebAssembly du navigateur** — elles ne peuvent pas affecter de vraies données
- Aucune donnée utilisateur n'est envoyée sur un réseau

### Règles à maintenir
- **Ne jamais introduire un backend** sans audit de sécurité complet — la valeur du projet repose sur sa nature 100% statique
- **Ne jamais utiliser `eval()`** dans le code applicatif
- **Ne jamais injecter du contenu utilisateur brut dans le DOM** sans échappement — utiliser `.textContent` plutôt que `.innerHTML` quand le contenu vient de l'utilisateur
- Les données des domaines doivent être **fictives ou publiques** — jamais de données réelles de patients même anonymisées par simple k-anonymité
- Si des comptes utilisateurs sont ajoutés à l'avenir : authentification OAuth uniquement (pas de mot de passe maison), stockage des tokens en `httpOnly cookie` uniquement

### Content Security Policy (à ajouter avant mise en production publique)
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; worker-src blob:;">
```
Le `blob:` est requis pour SQL.js qui instancie son WASM dans un Web Worker.

---

## Conventions de code

### JavaScript
- Pas de framework — JS vanilla pur, compatible avec tous les navigateurs modernes
- Les fonctions globales dans `app.js` suivent le pattern : `verb + Noun` (`renderLesson`, `saveProgress`, `goEx`)
- Chaque fonction a un commentaire d'une ligne expliquant son rôle et son contexte d'appel
- Pas de `var` — uniquement `let` et `const`
- L'état global est limité aux variables en haut de `app.js` : `lvl, idx, exIdx, done, exDone, hintC, queryCache`

### Structure d'une leçon
```javascript
{
  id: 'd1',           // Préfixe du niveau + numéro séquentiel
  title: 'Titre',
  desc: 'Description courte de la compétence visée',
  hot: true,          // Optionnel — tag "Demandé en entretien"
  concept: `...`,     // Syntaxe et exemples (texte brut, peut contenir du SQL)
  exercises: [
    { task: 'Consigne en français', hints: ['Indice 1', 'Indice 2', 'SELECT ... solution complète'] },
    { task: '...', hints: [...] },
    { task: '...', hints: [...] },
  ]
}
```

### CSS
- Thème dark inspiré de GitHub (`#0d1117` fond, `#3fb950` vert d'accentuation)
- Pas de classes utilitaires génériques — chaque classe a un rôle sémantique précis
- Pas de media queries pour l'instant — l'app est ciblée desktop

---

## Déploiement

### Prérequis
- Aucun — tous les fichiers sont statiques
- Une connexion internet est nécessaire au premier chargement pour télécharger SQL.js depuis le CDN

### Commandes
```bash
# Local (option 1 — ouvrir directement)
# Ouvrir index.html dans un navigateur (certains navigateurs bloquent les modules WASM en file://)

# Local (option 2 — serveur minimal recommandé)
npx serve .
# ou
python -m http.server 8080

# Déploiement
# Déposer le dossier santeSQL/ sur GitHub Pages, Netlify ou Vercel
# Aucune configuration de build requise
```

### Autonomie hors-ligne (optionnel)
Pour une utilisation sans internet après le premier chargement, télécharger localement :
- `sql-wasm.js` → `js/lib/sql-wasm.js`
- `sql-wasm.wasm` → `js/lib/sql-wasm.wasm`

Et modifier `locateFile` dans `db.js` :
```javascript
locateFile: file => `js/lib/${file}`
```

---

## Feuille de route

### Phase 1 — Fondations multi-domaines (prioritaire)
- [ ] Refactoring : extraire `SQL_INIT` + `CUR` + `SCHEMA_DEF` dans `js/domains/sante-hop.js`
- [ ] Créer le registre de domaines et le sélecteur UI
- [ ] Valider que le domaine actuel fonctionne à l'identique après refactoring

### Phase 2 — Nouveaux domaines
- [ ] `epide.js` — Épidémiologie : données d'incidence, cohortes, séries temporelles
- [ ] `bi-sante.js` — BI santé : KPIs, tableaux de bord, OLAP
- [ ] `nutrition.js` — Nutrition clinique : profils nutritionnels, recommandations
- [ ] `recherche.js` — Recherche clinique : essais randomisés, données manquantes

### Phase 3 — Fonctionnalités pédagogiques
- [ ] Validation sémantique des requêtes (vérifier que le résultat correspond à la solution attendue, pas seulement qu'il s'exécute)
- [ ] Mode "Défi chronométré"
- [ ] Export de la progression en PDF / certificat

### Phase 4 — Collaboration (si besoin)
- [ ] Authentification légère (OAuth GitHub / Google)
- [ ] Tableau de bord instructeur (suivi de classe)
- [ ] Partage de requêtes entre apprenants
