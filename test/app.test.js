const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function makeContext() {
  const context = {
    console,
    Date,
    Set,
    JSON
  };
  context.window = context;
  return vm.createContext(context);
}

function runFile(context, relativePath, suffix = '') {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  return vm.runInContext(`${source}\n${suffix}`, context, { filename });
}

function allLessons(domain) {
  return Object.values(domain.cur).flat();
}

test('les trois domaines SQL exposent un curriculum complet et cohérent', () => {
  const context = makeContext();
  for (const file of [
    'js/domains/sante-hop.js',
    'js/domains/sante-bi.js',
    'js/domains/sante-epi.js'
  ]) {
    runFile(context, file);
  }

  assert.deepEqual(
    Object.keys(context.DOMAINS).sort(),
    ['sante-bi', 'sante-epi', 'sante-hop']
  );

  const lessonIds = new Set();
  for (const [domainId, domain] of Object.entries(context.DOMAINS)) {
    assert.equal(domain.meta.id, domainId);
    assert.ok(domain.sqlInit.includes('CREATE TABLE'), `${domainId}: SQL initial absent`);
    assert.ok(domain.schemaDef.length > 0, `${domainId}: schéma vide`);
    assert.ok(Object.keys(domain.skillMap).length > 0, `${domainId}: compétences absentes`);

    for (const level of ['d', 'i', 'a', 'e']) {
      assert.ok(Array.isArray(domain.cur[level]), `${domainId}: niveau ${level} absent`);
      assert.ok(domain.cur[level].length > 0, `${domainId}: niveau ${level} vide`);
    }

    for (const lesson of allLessons(domain)) {
      const qualifiedId = `${domainId}:${lesson.id}`;
      assert.ok(!lessonIds.has(qualifiedId), `ID de leçon dupliqué: ${qualifiedId}`);
      lessonIds.add(qualifiedId);
      assert.ok(lesson.title && lesson.concept, `${qualifiedId}: contenu incomplet`);
      assert.equal(lesson.exercises.length, 3, `${qualifiedId}: 3 exercices attendus`);
      for (const exercise of lesson.exercises) {
        assert.ok(exercise.task, `${qualifiedId}: consigne absente`);
        assert.ok(Array.isArray(exercise.hints) && exercise.hints.length >= 2);
        assert.ok(exercise.hints.at(-1).trim(), `${qualifiedId}: solution absente`);
      }
    }
  }
});

test('les fonctions de compatibilité MySQL gèrent textes, dates et écart-type', () => {
  const functions = new Map();
  const aggregates = new Map();
  const context = makeContext();
  context.db = {
    create_function(name, fn) { functions.set(name, fn); },
    create_aggregate(name, definition) { aggregates.set(name, definition); }
  };

  const api = runFile(
    context,
    'js/db.js',
    'db = globalThis.db; _registerMySQLCompatFunctions(); globalThis.__api = { functions: globalThis.__functions, aggregates: globalThis.__aggregates };'
  );
  void api;

  assert.equal(functions.get('LEFT')('Cardiologie', 6), 'Cardio');
  assert.equal(functions.get('RIGHT')('Cardiologie', 5), 'logie');
  assert.equal(functions.get('YEAR')('2025-04-19'), 2025);
  assert.equal(functions.get('MONTH')('2025-04-19'), 4);
  assert.equal(functions.get('DATE_FORMAT')('2025-04-19', '%d/%m/%Y'), '19/04/2025');
  assert.equal(functions.get('DATEDIFF')('2025-04-20', '2025-04-18'), 2);
  assert.equal(functions.get('YEAR')('date invalide'), null);

  const stddev = aggregates.get('STDDEV');
  let state = stddev.init();
  for (const value of [2, 4, 4, 4, 5, 5, 7, 9]) state = stddev.step(state, value);
  assert.ok(Math.abs(stddev.finalize(state) - 2.138089935) < 1e-8);
});

test('runQuery transforme les résultats et les opérations SQL en réponse affichable', () => {
  const context = makeContext();
  const api = runFile(
    context,
    'js/db.js',
    'globalThis.__setDb = value => { db = value; }; globalThis.__runQuery = runQuery;'
  );
  void api;

  context.__setDb({
    exec: () => [{ columns: ['nom'], values: [['Hounsou']] }],
    getRowsModified: () => 0
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.__runQuery('SELECT nom FROM patients'))),
    { columns: ['nom'], rows: [['Hounsou']] }
  );

  context.__setDb({ exec: () => [], getRowsModified: () => 2 });
  const mutation = context.__runQuery('UPDATE patients SET age = age + 1');
  assert.equal(mutation.columns[0], 'message');
  assert.match(mutation.rows[0][0], /2 lignes/);

  context.__setDb(null);
  assert.throws(() => context.__runQuery('SELECT 1'), /non initialisée/i);
});
