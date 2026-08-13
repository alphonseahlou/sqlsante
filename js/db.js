// Moteur SQL — SQLite via SQL.js (WebAssembly).
// _SQL  : instance de la librairie SQL.js, chargée une seule fois de manière asynchrone
// db    : base de données SQLite en mémoire, recréée à chaque resetDB()
//
// Le curriculum enseigne des fonctions MySQL (LEFT, RIGHT, YEAR, MONTH, DATE_FORMAT,
// NOW, CURDATE, DATEDIFF) absentes de SQLite nativement — elles sont ajoutées ci-dessous
// via create_function pour que les solutions des exercices s'exécutent réellement dans ce moteur.
let _SQL = null;
let db = null;

// Enregistre les équivalents MySQL manquants dans SQLite (dates stockées en 'YYYY-MM-DD').
// Appelée à chaque (re)création de la base, car create_function est attaché à l'instance db.
function _registerMySQLCompatFunctions() {
  db.create_function('LEFT', (str, n) => str === null || n === null ? null : String(str).substring(0, Number(n)));
  db.create_function('RIGHT', (str, n) => {
    if (str === null || n === null) return null;
    const s = String(str);
    return s.substring(Math.max(0, s.length - Number(n)));
  });
  db.create_function('YEAR', (d) => {
    const m = d === null ? null : /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d));
    return m ? parseInt(m[1], 10) : null;
  });
  db.create_function('MONTH', (d) => {
    const m = d === null ? null : /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d));
    return m ? parseInt(m[2], 10) : null;
  });
  db.create_function('DATE_FORMAT', (d, format) => {
    const m = d === null ? null : /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d));
    if (!m || format === null) return null;
    const [, y, mo, day] = m;
    return String(format).replace(/%Y/g, y).replace(/%m/g, mo).replace(/%d/g, day);
  });
  db.create_function('NOW', () => new Date().toISOString().slice(0, 19).replace('T', ' '));
  db.create_function('CURDATE', () => new Date().toISOString().slice(0, 10));
  db.create_function('DATEDIFF', (d1, d2) => {
    if (d1 === null || d2 === null) return null;
    return Math.round((new Date(String(d1)) - new Date(String(d2))) / 86400000);
  });
  // STDDEV (écart-type, variance d'échantillon n-1 — cohérent avec VARIANCE() natif de SQLite)
  db.create_aggregate('STDDEV', {
    init: () => ({ sum: 0, sumSq: 0, count: 0 }),
    step: (state, value) => {
      if (value === null) return state;
      const v = Number(value);
      return { sum: state.sum + v, sumSq: state.sumSq + v * v, count: state.count + 1 };
    },
    finalize: (state) => {
      if (state.count < 2) return null;
      const variance = (state.sumSq - (state.sum * state.sum) / state.count) / (state.count - 1);
      return Math.sqrt(Math.max(0, variance));
    }
  });
}

// Charge SQL.js (WASM) depuis le CDN, puis construit la base en mémoire.
// Appelée une seule fois au démarrage dans app.js — retourne une Promise.
// Le WASM fait ~1 Mo : le premier chargement prend 1-2 secondes selon la connexion.
async function initDB() {
  _SQL = await initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
  });
  _buildDB();
}

// Crée une nouvelle base SQLite vide et y injecte toutes les tables et données
// depuis ACTIVE_DOMAIN.sqlInit — défini dans le fichier de domaine actif (js/domains/).
// Appelée par initDB() au démarrage et par resetDB() pour remettre les données à zéro.
function _buildDB() {
  if (db) db.close();
  db = new _SQL.Database();
  _registerMySQLCompatFunctions();
  db.run(ACTIVE_DOMAIN.sqlInit);
}

// Remet la base de données à son état initial (toutes les tables avec leurs données d'origine).
// Utile après des exercices INSERT / UPDATE / DELETE qui modifient les données.
// Appelée par le bouton "↺ Réinit. BD" dans l'interface.
function resetDB() {
  _buildDB();
  const ra = document.getElementById('ra');
  if (ra) ra.innerHTML = '<div class="rinfo">✓ Base de données réinitialisée à son état initial.</div>';
}

// Exécute une requête SQL via SQLite et retourne {columns, rows} attendu par app.js.
//
// Comportement selon le type de requête :
// - SELECT / WITH / EXPLAIN  → retourne les colonnes et lignes du résultat
// - INSERT / UPDATE / DELETE → retourne une ligne de message avec le nombre de lignes affectées
// - CREATE / ALTER / DROP    → retourne une ligne de message de confirmation
//
// Les erreurs SQLite (syntaxe, table inconnue, colonne manquante…) sont propagées
// via une exception et affichées dans la zone de résultat de app.js.
function runQuery(sql) {
  if (!db) throw new Error('Base de données non initialisée. Veuillez patienter...');
  const results = db.exec(sql);
  if (results.length === 0) {
    const n = db.getRowsModified();
    const t = sql.trim();
    let msg;
    if (/^insert/i.test(t))              msg = `✓ ${n} ligne${n!==1?'s':''} insérée${n!==1?'s':''}`;
    else if (/^update/i.test(t))         msg = `✓ ${n} ligne${n!==1?'s':''} mise${n!==1?'s':''} à jour`;
    else if (/^delete/i.test(t))         msg = `✓ ${n} ligne${n!==1?'s':''} supprimée${n!==1?'s':''}`;
    else if (/^create\s+table/i.test(t)) msg = '✓ Table créée avec succès';
    else if (/^create\s+view/i.test(t))  msg = '✓ Vue créée avec succès';
    else if (/^create\s+index/i.test(t)) msg = '✓ Index créé avec succès';
    else if (/^alter/i.test(t))          msg = '✓ Table modifiée avec succès';
    else if (/^drop/i.test(t))           msg = '✓ Suppression effectuée avec succès';
    else                                  msg = '✓ Opération exécutée avec succès';
    return {columns: ['message'], rows: [[msg]]};
  }
  return {columns: results[0].columns, rows: results[0].values};
}
