// Tests fonctionnels et de performance pour la logique ajoutée dans js/app.js
// (progression de niveau, gamification XP/série, test de placement, radar de compétences).
//
// js/app.js s'exécute normalement dans un navigateur et touche le DOM partout (document,
// localStorage, window). Pour le tester sans navigateur, on charge le vrai fichier source
// dans un bac à sable vm avec de fausses implémentations minimales de document/localStorage/
// window — les fonctions testées ci-dessous restent le vrai code de production, seul leur
// environnement est simulé.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');

const root = path.resolve(__dirname, '..');

function runFile(context, relativePath, suffix = '') {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  return vm.runInContext(`${source}\n${suffix}`, context, { filename });
}

// Élément DOM factice : accepte toute lecture/écriture (style, classList, innerHTML…)
// sans jamais planter, pour que le code de rendu de app.js s'exécute sans navigateur.
function makeFakeElement() {
  return {
    style: {},
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    dataset: {},
    innerHTML: '',
    textContent: '',
    value: '',
    title: '',
    firstChild: null,
    childNodes: [],
    addEventListener() {},
    appendChild() {},
    insertBefore() {},
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
}

function makeFakeDocument() {
  const elements = new Map();
  return {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeFakeElement());
      return elements.get(id);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    createTextNode(text) { return { textContent: text, nodeType: 3 }; }
  };
}

function makeFakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); }
  };
}

// app.js déclare son état (lvl, idx, done, gamState…) avec `let` au premier niveau du script —
// exactement comme dans un vrai navigateur, ça reste une liaison lexicale au script, PAS une
// propriété de `window`. On ne peut donc pas les lire/écrire depuis l'extérieur via `ctx.lvl = …` :
// il faut des fonctions-pont définies DANS le même script (donc avec accès à ces liaisons),
// exposées sur globalThis. Même principe déjà utilisé par test/app.test.js pour `db`.
const STATE_BRIDGE = `
  globalThis.__get = name => eval(name);
  globalThis.__set = (name, value) => { eval(name + ' = value'); };
`;
const DB_BRIDGE = `globalThis.__setDb = value => { db = value; };`;

// Charge le domaine + le lexique + le moteur SQL + app.js dans un même contexte, comme le ferait
// index.html, puis installe les ponts d'accès à l'état interne. initDB() échoue silencieusement
// (pas de vrai SQL.js hors navigateur) — sans conséquence : aucun test n'exécute de requête SQL
// réelle au démarrage ; runQuery() est testé séparément en mockant `db` via __setDb.
function makeAppContext() {
  const context = { console, Date, Set, Map, JSON, Math, Promise, RegExp };
  context.window = context;
  context.scrollTo = () => {};
  context.document = makeFakeDocument();
  context.localStorage = makeFakeLocalStorage();
  const vmContext = vm.createContext(context);
  runFile(vmContext, 'js/domains/sante-hop.js');
  runFile(vmContext, 'js/domains/sante-bi.js');
  runFile(vmContext, 'js/domains/sante-epi.js');
  runFile(vmContext, 'js/tips.js');
  runFile(vmContext, 'js/db.js', DB_BRIDGE);
  runFile(vmContext, 'js/app.js', STATE_BRIDGE);
  return vmContext;
}

// ── Fonctionnalité : progression de niveau ─────────────────────────────────

test('nextLevel() suit déb → int → avc → exp puis retourne null', () => {
  const ctx = makeAppContext();
  ctx.__set('lvl', 'd');
  assert.equal(ctx.nextLevel(), 'i');
  ctx.__set('lvl', 'i');
  assert.equal(ctx.nextLevel(), 'a');
  ctx.__set('lvl', 'a');
  assert.equal(ctx.nextLevel(), 'e');
  ctx.__set('lvl', 'e');
  assert.equal(ctx.nextLevel(), null);
});

test('nav(1) sur la dernière leçon d\'un niveau bascule sur le niveau suivant', () => {
  const ctx = makeAppContext();
  ctx.__set('lvl', 'd');
  ctx.__set('idx', ctx.lessons().length - 1);
  ctx.__set('exIdx', 0);
  ctx.nav(1);
  assert.equal(ctx.__get('lvl'), 'i');
  assert.equal(ctx.__get('idx'), 0);
});

test('nav(1) sur la dernière leçon du dernier niveau ne fait rien', () => {
  const ctx = makeAppContext();
  ctx.__set('lvl', 'e');
  const lastIdx = ctx.lessons().length - 1;
  ctx.__set('idx', lastIdx);
  ctx.__set('exIdx', 0);
  ctx.nav(1);
  assert.equal(ctx.__get('lvl'), 'e');
  assert.equal(ctx.__get('idx'), lastIdx);
});

// ── Fonctionnalité : gamification XP / série ────────────────────────────────

test('awardXP() attribue les points une seule fois par clé', () => {
  const ctx = makeAppContext();
  const xpParExercice = ctx.__get('XP_PAR_EXERCICE');
  ctx.__set('gamState', { xp: 0, streak: 1, lastVisit: null, awarded: [] });
  ctx.awardXP('d1_0');
  assert.equal(ctx.__get('gamState').xp, xpParExercice);
  ctx.awardXP('d1_0');
  assert.equal(ctx.__get('gamState').xp, xpParExercice, 'la même clé ne doit pas payer deux fois');
  ctx.awardXP('d1_1');
  assert.equal(ctx.__get('gamState').xp, xpParExercice * 2);
});

test('loadGam() incrémente la série un jour après, la remet à 1 après un trou', () => {
  const ctx = makeAppContext();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  ctx.localStorage.setItem('sqlsante_gam', JSON.stringify({ xp: 100, streak: 4, lastVisit: yesterday, awarded: [] }));
  ctx.loadGam();
  assert.equal(ctx.__get('gamState').streak, 5, 'visite la veille -> +1');

  ctx.localStorage.setItem('sqlsante_gam', JSON.stringify({ xp: 100, streak: 5, lastVisit: today, awarded: [] }));
  ctx.loadGam();
  assert.equal(ctx.__get('gamState').streak, 5, 'déjà visité aujourd\'hui -> inchangé');

  ctx.localStorage.setItem('sqlsante_gam', JSON.stringify({ xp: 100, streak: 5, lastVisit: lastWeek, awarded: [] }));
  ctx.loadGam();
  assert.equal(ctx.__get('gamState').streak, 1, 'trou de plusieurs jours -> repart à 1');
});

// ── Fonctionnalité : radar de compétences ───────────────────────────────────

test('computeSkills() calcule le taux de maîtrise par catégorie', () => {
  const ctx = makeAppContext();
  const [firstCat, firstIds] = Object.entries(ctx.ACTIVE_DOMAIN.skillMap)[0];
  ctx.__set('done', new Set(firstIds));
  const skills = ctx.computeSkills();
  const entry = skills.find(s => s.cat === firstCat);
  assert.equal(entry.pct, 1, `${firstCat} entièrement complétée doit donner 100%`);
  assert.ok(skills.every(s => s.pct >= 0 && s.pct <= 1), 'chaque taux doit être entre 0 et 1');
});

// ── Fonctionnalité : test de placement ──────────────────────────────────────

test('extractSolutionSQL() isole la requête SQL d\'un indice avec texte introductif', () => {
  const ctx = makeAppContext();
  const sql = ctx.extractSolutionSQL(['indice 1', 'Voici la solution :\nSELECT nom FROM patients;']);
  assert.equal(sql, 'SELECT nom FROM patients;');
});

test('sameResult() ignore l\'ordre des lignes mais détecte des données différentes', () => {
  const ctx = makeAppContext();
  const a = { columns: ['nom'], rows: [['Alice'], ['Bob']] };
  const bMemeOrdre = { columns: ['nom'], rows: [['Alice'], ['Bob']] };
  const bOrdreDiff = { columns: ['nom'], rows: [['Bob'], ['Alice']] };
  const cDiff = { columns: ['nom'], rows: [['Alice'], ['Carla']] };
  assert.equal(ctx.sameResult(a, bMemeOrdre), true);
  assert.equal(ctx.sameResult(a, bOrdreDiff), true, 'l\'ordre des lignes ne doit pas compter');
  assert.equal(ctx.sameResult(a, cDiff), false);
});

test('buildPlacementQuestions() retourne des questions en lecture seule pour chaque niveau disponible', () => {
  const ctx = makeAppContext();
  for (const domainId of Object.keys(ctx.DOMAINS)) {
    ctx.__set('ACTIVE_DOMAIN', ctx.DOMAINS[domainId]);
    const qs = ctx.buildPlacementQuestions();
    assert.ok(qs.length > 0, `${domainId}: aucune question générée`);
    assert.ok(qs.length <= 8, `${domainId}: au plus 2 questions × 4 niveaux attendu`);
    for (const q of qs) {
      assert.match(q.sql, /^(SELECT|WITH)\b/i, `${domainId}: question non read-only : ${q.sql}`);
      assert.ok(q.lessonTitle && q.task, `${domainId}: question incomplète`);
      assert.ok(['d', 'i', 'a', 'e'].includes(q.lvl));
    }
  }
});

// ── Performance (mesures légères, seuils volontairement larges pour éviter
//    les faux positifs sur machine lente — ils visent à attraper une vraie
//    régression, pas à mesurer une performance absolue) ──────────────────────

test('perf: buildPlacementQuestions() sur les 3 domaines reste sous 100ms', () => {
  const ctx = makeAppContext();
  const start = performance.now();
  for (const domainId of Object.keys(ctx.DOMAINS)) {
    ctx.__set('ACTIVE_DOMAIN', ctx.DOMAINS[domainId]);
    ctx.buildPlacementQuestions();
  }
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 100, `buildPlacementQuestions trop lent : ${elapsed.toFixed(1)}ms`);
});

test('perf: 10 000 appels à computeSkills() restent sous 500ms', () => {
  const ctx = makeAppContext();
  ctx.__set('done', new Set(['d1', 'd2', 'i1']));
  const start = performance.now();
  for (let i = 0; i < 10000; i++) ctx.computeSkills();
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 500, `computeSkills trop lent sur 10 000 appels : ${elapsed.toFixed(1)}ms`);
});

test('perf: sameResult() sur 5 000 lignes reste sous 200ms', () => {
  const ctx = makeAppContext();
  const rowsA = Array.from({ length: 5000 }, (_, i) => [i, `nom-${i}`]);
  const rowsB = [...rowsA].reverse();
  const a = { columns: ['id', 'nom'], rows: rowsA };
  const b = { columns: ['id', 'nom'], rows: rowsB };
  const start = performance.now();
  const equal = ctx.sameResult(a, b);
  const elapsed = performance.now() - start;
  assert.equal(equal, true);
  assert.ok(elapsed < 200, `sameResult trop lent sur 5 000 lignes : ${elapsed.toFixed(1)}ms`);
});

test('perf: runQuery() transforme 5 000 lignes × 10 colonnes en moins de 100ms', () => {
  const ctx = makeAppContext();
  const columns = Array.from({ length: 10 }, (_, i) => `col${i}`);
  const values = Array.from({ length: 5000 }, (_, r) => columns.map((_, c) => `${r}-${c}`));
  ctx.__setDb({ exec: () => [{ columns, values }], getRowsModified: () => 0 });
  const start = performance.now();
  const result = ctx.runQuery('SELECT * FROM grosse_table');
  const elapsed = performance.now() - start;
  assert.equal(result.rows.length, 5000);
  assert.ok(elapsed < 100, `runQuery trop lent sur 5 000 lignes : ${elapsed.toFixed(1)}ms`);
});
