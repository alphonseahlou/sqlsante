// ═══════════════════════════════════════
// MOTEUR SQL — SQLite via SQL.js (WebAssembly)
// _SQL  : instance de la librairie SQL.js, chargée une seule fois de manière asynchrone
// db    : base de données SQLite en mémoire, recréée à chaque resetDB()
// ═══════════════════════════════════════
let _SQL = null;
let db = null;

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
