// ═══════════════════════════════════════
// DOMAINE : Épidémiologie (surveillance de maladies)
//
// Ce fichier est auto-suffisant : données SQL, leçons, schéma, compétences.
// Même périmètre que BI Santé : jointures, agrégation, fenêtrage, CTE, CASE —
// pas de DML/DDL pur, hors du rôle d'un épidémiologiste/data analyst santé publique.
//
// Chargement : index.html → sante-epi.js → db.js → app.js
// ═══════════════════════════════════════

if (!window.DOMAINS) window.DOMAINS = {};

const DOMAIN_META_EPI = {
  id: 'sante-epi',
  name: 'Épidémiologie',
  icon: '🦠',
  description: 'Zones, maladies, cas déclarés, foyers épidémiques, vaccination'
};

const SQL_INIT_EPI = `
CREATE TABLE zones (
  id_zone INTEGER, nom TEXT, region TEXT, population INTEGER
);
INSERT INTO zones VALUES
  (1,'Zone Nord','Hauts-de-France',450000),
  (2,'Zone Centre','Île-de-France',980000),
  (3,'Zone Sud','PACA',620000),
  (4,'Zone Ouest','Bretagne',310000),
  (5,'Zone Est','Grand Est',540000),
  (6,'Zone Outre-Mer','Guadeloupe',150000);

CREATE TABLE maladies (
  id_maladie INTEGER, nom TEXT, type TEXT, periode_incubation_jours INTEGER
);
INSERT INTO maladies VALUES
  (1,'Grippe','Virale',2),
  (2,'COVID-19','Virale',5),
  (3,'Rougeole','Virale',12),
  (4,'Tuberculose','Bactérienne',21),
  (5,'Dengue','Virale',7);

CREATE TABLE cas (
  id_cas INTEGER, id_zone INTEGER, id_maladie INTEGER, date_declaration TEXT,
  age_patient INTEGER, sexe TEXT, gravite TEXT, hospitalise INTEGER, date_gueri TEXT
);
INSERT INTO cas VALUES
  (1,1,1,'2024-09-03',34,'F','Léger',0,'2024-09-10'),
  (2,1,1,'2024-09-15',58,'M','Modéré',1,'2024-09-25'),
  (3,1,2,'2024-09-05',45,'F','Modéré',1,'2024-09-18'),
  (4,1,2,'2024-10-02',29,'M','Léger',0,'2024-10-09'),
  (5,1,5,'2024-11-01',61,'F','Sévère',1,NULL),
  (6,2,1,'2024-09-08',22,'M','Léger',0,'2024-09-14'),
  (7,2,2,'2024-09-20',67,'F','Sévère',1,'2024-10-05'),
  (8,2,2,'2024-10-11',39,'M','Modéré',0,'2024-10-20'),
  (9,2,3,'2024-10-25',8,'F','Modéré',1,'2024-11-08'),
  (10,2,4,'2024-09-12',52,'M','Sévère',1,NULL),
  (11,3,1,'2024-09-18',41,'F','Léger',0,'2024-09-24'),
  (12,3,2,'2024-09-22',74,'M','Sévère',1,'2024-10-10'),
  (13,3,2,'2024-10-15',31,'F','Modéré',1,'2024-10-28'),
  (14,3,5,'2024-11-05',19,'M','Léger',0,'2024-11-12'),
  (15,3,5,'2024-11-10',27,'F','Modéré',0,NULL),
  (16,4,1,'2024-09-09',36,'M','Léger',0,'2024-09-16'),
  (17,4,2,'2024-10-03',55,'F','Modéré',1,'2024-10-17'),
  (18,4,3,'2024-10-20',5,'M','Sévère',1,'2024-11-03'),
  (19,4,4,'2024-09-28',63,'F','Sévère',1,NULL),
  (20,5,1,'2024-09-14',48,'M','Léger',0,'2024-09-21'),
  (21,5,2,'2024-09-29',71,'F','Sévère',1,'2024-10-14'),
  (22,5,2,'2024-10-22',26,'M','Léger',0,'2024-10-29'),
  (23,5,3,'2024-11-02',12,'F','Modéré',1,'2024-11-16'),
  (24,5,5,'2024-11-08',33,'M','Modéré',0,NULL),
  (25,1,4,'2024-10-18',58,'F','Sévère',1,'2024-11-20'),
  (26,2,5,'2024-11-12',44,'M','Léger',0,NULL),
  (27,3,1,'2024-10-30',29,'F','Léger',0,'2024-11-06'),
  (28,4,2,'2024-11-04',50,'M','Modéré',1,NULL),
  (29,5,1,'2024-11-15',37,'F','Léger',0,NULL),
  (30,1,2,'2024-11-18',64,'M','Modéré',1,NULL);

CREATE TABLE foyers (
  id_foyer INTEGER, id_zone INTEGER, id_maladie INTEGER,
  date_debut TEXT, date_fin TEXT, nb_cas_lies INTEGER
);
INSERT INTO foyers VALUES
  (1,1,2,'2024-09-01','2024-09-30',12),
  (2,2,2,'2024-09-15','2024-10-15',18),
  (3,3,2,'2024-09-10',NULL,9),
  (4,2,3,'2024-10-20',NULL,6),
  (5,4,4,'2024-09-25','2024-11-10',5),
  (6,5,2,'2024-09-28','2024-10-25',14),
  (7,1,5,'2024-10-30',NULL,4),
  (8,3,5,'2024-11-01',NULL,7),
  (9,5,1,'2024-09-10','2024-09-30',8),
  (10,4,2,'2024-10-05','2024-10-28',10);

CREATE TABLE vaccinations (
  id_vaccination INTEGER, id_zone INTEGER, id_maladie INTEGER, mois TEXT,
  nb_doses_administrees INTEGER, taux_couverture REAL
);
INSERT INTO vaccinations VALUES
  (1,1,1,'2024-10-01',8200,42.5),
  (2,1,1,'2024-11-01',9100,47.8),
  (3,1,2,'2024-10-01',6500,38.0),
  (4,1,2,'2024-11-01',7200,41.5),
  (5,2,1,'2024-10-01',18500,45.0),
  (6,2,1,'2024-11-01',20100,49.2),
  (7,2,2,'2024-10-01',15200,40.1),
  (8,2,2,'2024-11-01',16800,43.7),
  (9,3,1,'2024-10-01',11200,43.8),
  (10,3,1,'2024-11-01',12400,48.6),
  (11,3,2,'2024-10-01',9800,39.2),
  (12,3,2,'2024-11-01',10600,42.0),
  (13,4,1,'2024-10-01',5900,46.1),
  (14,4,1,'2024-11-01',6500,50.3),
  (15,4,2,'2024-10-01',4800,37.5),
  (16,4,2,'2024-11-01',5300,40.8),
  (17,5,1,'2024-10-01',10100,44.0),
  (18,5,1,'2024-11-01',11000,48.1),
  (19,5,2,'2024-11-01',8700,41.9);
`;

const SKILL_MAP_EPI = {
  'SELECT & Filtres': ['d1','d2','d3','d4','d5','d6','d8','d9','i7'],
  'Jointures':        ['i1','i2','i6','a5','e7'],
  'Agrégation':       ['i3','i4','i5','a4','e17','e18'],
  'CTE / Sous-req.':  ['a1','a2','e4','e19'],
  'Fenêtrage':        ['e1','e2','e3','e15','e16'],
  'Vues / Reporting': ['e13'],
  'Chaînes & Dates':  ['d7','a6','a7','e8','e9','e22','e23'],
  'CASE & Ensembles': ['a3','e6','e20','e21'],
};

const CUR_EPI = { d: [
 {id:'d1',title:'1. SELECT – Lire des données',hot:true,
  desc:'Commande fondamentale pour récupérer des données. Présente dans 100% des offres d\'emploi.',
  concept:`<span class="kw">SELECT</span> colonne1, colonne2 <span class="kw">FROM</span> table;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">zones</span>;  <span class="cm">-- toutes les colonnes</span>
<span class="kw">SELECT</span> nom, region <span class="kw">FROM</span> <span class="tbl">zones</span>;  <span class="cm">-- colonnes spécifiques</span>`,
  exercises:[
   {task:'Sélectionnez le <b>nom</b>, la <b>region</b> et la <b>population</b> de toutes les zones.',
    hints:['SELECT col1, col2, col3 FROM table;','Colonnes : nom, region, population','SELECT nom, region, population FROM zones;']},
   {task:'Sélectionnez l\'<b>id_maladie</b>, le <b>nom</b> et le <b>type</b> de toutes les maladies.',
    hints:['SELECT col1, col2, col3 FROM table;','La table s\'appelle maladies.','SELECT id_maladie, nom, type FROM maladies;']},
   {task:'Sélectionnez <b>toutes les colonnes</b> de la table <b>cas</b>.',
    hints:['Utilisez * pour toutes les colonnes.','La table s\'appelle cas.','SELECT * FROM cas;']},
  ]},

 {id:'d2',title:'2. WHERE – Filtrer les lignes',hot:true,
  desc:'Filtrer les résultats selon des conditions. Indispensable dans tout rôle de données.',
  concept:`<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">maladies</span> <span class="kw">WHERE</span> type = <span class="str">'Virale'</span>;
<span class="kw">WHERE</span> age_patient > <span class="num">60</span>
<span class="kw">WHERE</span> hospitalise != <span class="num">1</span>
<span class="cm">-- Texte : guillemets simples. Nombres : sans guillemets.</span>`,
  exercises:[
   {task:'Listez toutes les maladies de type <b>Virale</b>.',
    hints:['Ajoutez WHERE après FROM.','La valeur est \'Virale\' (avec guillemets simples).','SELECT * FROM maladies WHERE type = \'Virale\';']},
   {task:'Listez tous les cas de gravité <b>Sévère</b>.',
    hints:['WHERE gravite = \'valeur\'','La table est cas, la colonne gravite.','SELECT * FROM cas WHERE gravite = \'Sévère\';']},
   {task:'Listez les vaccinations du mois <b>2024-11-01</b> (novembre).',
    hints:['WHERE mois = \'2024-11-01\'','Les dates sont stockées au format \'YYYY-MM-DD\'.','SELECT * FROM vaccinations WHERE mois = \'2024-11-01\';']},
  ]},

 {id:'d3',title:'3. AND / OR / BETWEEN / IN',hot:true,
  desc:'Combiner des conditions. Très fréquent dans les tests techniques d\'entretien.',
  concept:`<span class="kw">WHERE</span> nom = <span class="str">'Zone Nord'</span> <span class="kw">AND</span> population > <span class="num">400000</span>
<span class="kw">WHERE</span> population < <span class="num">200000</span> <span class="kw">OR</span> population > <span class="num">900000</span>
<span class="kw">WHERE</span> population <span class="kw">BETWEEN</span> <span class="num">400000</span> <span class="kw">AND</span> <span class="num">700000</span>
<span class="kw">WHERE</span> nom <span class="kw">IN</span> (<span class="str">'Zone Nord'</span>, <span class="str">'Zone Sud'</span>)`,
  exercises:[
   {task:'Trouvez les zones dont le nom est <b>Zone Nord ou Zone Sud</b> ET dont la <b>population est entre 400 000 et 700 000</b>.',
    hints:['Utilisez IN (\'Zone Nord\', \'Zone Sud\') pour le nom.','Utilisez BETWEEN 400000 AND 700000 pour la population.','SELECT * FROM zones WHERE nom IN (\'Zone Nord\', \'Zone Sud\') AND population BETWEEN 400000 AND 700000;']},
   {task:'Trouvez les cas <b>hospitalisés</b> (hospitalise = 1) dans les zones <b>1, 2 ou 3</b> (id_zone).',
    hints:['Combinez WHERE hospitalise = 1 AND id_zone IN (...)','IN (1, 2, 3)','SELECT * FROM cas WHERE hospitalise = 1 AND id_zone IN (1, 2, 3);']},
   {task:'Listez les vaccinations dont le <b>taux_couverture</b> est <b>entre 40 et 50</b> (inclus).',
    hints:['La table est vaccinations, la colonne taux_couverture.','BETWEEN 40 AND 50','SELECT * FROM vaccinations WHERE taux_couverture BETWEEN 40 AND 50;']},
  ]},

 {id:'d4',title:'4. NULL – IS NULL / IS NOT NULL / COALESCE',hot:true,
  desc:'Gérer les valeurs manquantes : question incontournable en entretien data analyst.',
  concept:`<span class="cm">-- Tester la présence d'un NULL :</span>
<span class="kw">WHERE</span> date_gueri <span class="kw">IS NULL</span>       <span class="cm">-- pas encore guéri</span>
<span class="kw">WHERE</span> date_gueri <span class="kw">IS NOT NULL</span>   <span class="cm">-- guéri</span>

<span class="cm">-- Remplacer NULL par une valeur :</span>
<span class="fn">COALESCE</span>(date_gueri, <span class="str">'Non guéri'</span>)`,
  exercises:[
   {task:'Listez les cas <b>pas encore guéris</b> (date_gueri est NULL). Affichez id_cas, id_zone et date_declaration.',
    hints:['La table s\'appelle cas.','WHERE date_gueri IS NULL','SELECT id_cas, id_zone, date_declaration FROM cas WHERE date_gueri IS NULL;']},
   {task:'Listez les cas <b>guéris</b> (date_gueri est renseignée). Affichez id_cas, date_declaration et date_gueri.',
    hints:['IS NOT NULL teste qu\'une valeur existe.','WHERE date_gueri IS NOT NULL','SELECT id_cas, date_declaration, date_gueri FROM cas WHERE date_gueri IS NOT NULL;']},
   {task:'Affichez tous les cas avec la date_gueri remplacée par <b>"Non guéri"</b> si elle est NULL. Colonnes : id_cas, id_zone, statut.',
    hints:['COALESCE(date_gueri, \'Non guéri\') AS statut','SELECT id_cas, id_zone, COALESCE(date_gueri, \'Non guéri\') AS statut','SELECT id_cas, id_zone, COALESCE(date_gueri, \'Non guéri\') AS statut FROM cas;']},
  ]},

 {id:'d5',title:'5. ORDER BY & LIMIT',hot:false,
  desc:'Trier et paginer les résultats. Base de tout rapport ou dashboard.',
  concept:`<span class="kw">ORDER BY</span> population <span class="kw">DESC</span>   <span class="cm">-- décroissant</span>
<span class="kw">ORDER BY</span> nom <span class="kw">ASC</span>    <span class="cm">-- croissant (défaut)</span>
<span class="kw">ORDER BY</span> id_zone, date_declaration <span class="kw">DESC</span>  <span class="cm">-- multi-colonnes</span>
<span class="kw">LIMIT</span> <span class="num">5</span>               <span class="cm">-- 5 premières lignes</span>`,
  exercises:[
   {task:'Les <b>3 zones les plus peuplées</b> : nom, population.',
    hints:['ORDER BY population DESC','LIMIT 3 à la fin','SELECT nom, population FROM zones ORDER BY population DESC LIMIT 3;']},
   {task:'Les <b>5 cas dont le patient est le plus âgé</b> : id_cas, age_patient, gravite.',
    hints:['ORDER BY age_patient DESC','LIMIT 5','SELECT id_cas, age_patient, gravite FROM cas ORDER BY age_patient DESC LIMIT 5;']},
   {task:'Les <b>3 foyers ayant le plus de cas liés</b> : id_foyer, id_zone, nb_cas_lies.',
    hints:['ORDER BY nb_cas_lies DESC','LIMIT 3','SELECT id_foyer, id_zone, nb_cas_lies FROM foyers ORDER BY nb_cas_lies DESC LIMIT 3;']},
  ]},

 {id:'d6',title:'6. DISTINCT – Dédoublonner',hot:false,
  desc:'Éliminer les doublons dans les résultats. Souvent demandé pour l\'analyse de données.',
  concept:`<span class="cm">-- Valeurs uniques d'une colonne :</span>
<span class="kw">SELECT DISTINCT</span> type <span class="kw">FROM</span> <span class="tbl">maladies</span>;

<span class="cm">-- Combinaisons uniques :</span>
<span class="kw">SELECT DISTINCT</span> id_zone, id_maladie <span class="kw">FROM</span> <span class="tbl">cas</span>;`,
  exercises:[
   {task:'Listez tous les <b>types distincts</b> de maladies.',
    hints:['Utilisez SELECT DISTINCT.','Une seule colonne suffit ici.','SELECT DISTINCT type FROM maladies;']},
   {task:'Listez tous les niveaux de <b>gravite distincts</b> des cas.',
    hints:['SELECT DISTINCT colonne FROM table;','La colonne s\'appelle gravite dans la table cas.','SELECT DISTINCT gravite FROM cas;']},
   {task:'Listez toutes les combinaisons distinctes de <b>id_zone</b> et <b>id_maladie</b> dans la table cas.',
    hints:['SELECT DISTINCT col1, col2 retourne des paires uniques.','Chaque paire (id_zone, id_maladie) n\'apparaît qu\'une seule fois.','SELECT DISTINCT id_zone, id_maladie FROM cas;']},
  ]},

 {id:'d7',title:'7. Fonctions – UPPER, LOWER, LENGTH, CONCAT, ROUND, MONTH',hot:false,
  desc:'Transformer les données à la volée : casse, longueur, concaténation, arrondi, extraction de date.',
  concept:`<span class="cm">-- Casse du texte :</span>
<span class="fn">UPPER</span>(nom)           <span class="cm">→ 'ZONE NORD'</span>
<span class="fn">LOWER</span>(region)        <span class="cm">→ 'paca'</span>
<span class="fn">LENGTH</span>(nom)          <span class="cm">→ 9 (nombre de caractères)</span>

<span class="cm">-- Assembler du texte :</span>
<span class="fn">CONCAT</span>(gravite, <span class="str">' ('</span>, sexe, <span class="str">')'</span>)  <span class="cm">→ 'Sévère (F)'</span>

<span class="cm">-- Nombres et dates :</span>
<span class="fn">ROUND</span>(taux_couverture, <span class="num">0</span>)   <span class="cm">→ 43 (arrondi à l'entier)</span>
<span class="fn">MONTH</span>(date_declaration)      <span class="cm">→ 9</span>`,
  exercises:[
   {task:'Affichez le <b>nom en majuscules</b> (colonne <b>nom_maj</b>), la <b>region en minuscules</b> (colonne <b>region_min</b>) et la <b>longueur du nom</b> (colonne <b>longueur_nom</b>) pour chaque zone.',
    hints:['UPPER(nom) AS nom_maj, LOWER(region) AS region_min, LENGTH(nom) AS longueur_nom','SELECT ... FROM zones','SELECT UPPER(nom) AS nom_maj, LOWER(region) AS region_min, LENGTH(nom) AS longueur_nom FROM zones;']},
   {task:'Affichez une <b>fiche</b> par cas au format "gravite (sexe)" et le <b>mois de déclaration</b> dans une colonne <b>mois_declaration</b>.',
    hints:['CONCAT(gravite, \' (\', sexe, \')\') AS fiche','MONTH(date_declaration) AS mois_declaration','SELECT CONCAT(gravite, \' (\', sexe, \')\') AS fiche, MONTH(date_declaration) AS mois_declaration FROM cas;']},
   {task:'Depuis <b>vaccinations</b>, affichez l\'<b>id_zone</b>, le <b>taux_couverture</b> original et son <b>arrondi à l\'entier</b> (colonne <b>taux_arrondi</b>).',
    hints:['ROUND(taux_couverture, 0) AS taux_arrondi','SELECT id_zone, taux_couverture, ROUND(...) AS taux_arrondi FROM vaccinations;','SELECT id_zone, taux_couverture, ROUND(taux_couverture, 0) AS taux_arrondi FROM vaccinations;']},
  ]},

 {id:'d8',title:'8. OFFSET – Afficher à partir d\'une ligne',hot:false,
  desc:'Sauter les N premières lignes pour paginer les résultats ou commencer à une position précise.',
  concept:`<span class="cm">-- OFFSET saute les N premières lignes :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">zones</span> <span class="kw">LIMIT</span> <span class="num">5</span> <span class="kw">OFFSET</span> <span class="num">3</span>;
<span class="cm">-- → lignes 4, 5, 6, 7, 8 (les 3 premières sont sautées)</span>

<span class="cm">-- Pagination : 3 résultats par page</span>
<span class="kw">LIMIT</span> <span class="num">3</span> <span class="kw">OFFSET</span> <span class="num">0</span>  <span class="cm">-- page 1 : lignes 1–3</span>
<span class="kw">LIMIT</span> <span class="num">3</span> <span class="kw">OFFSET</span> <span class="num">3</span>  <span class="cm">-- page 2 : lignes 4–6</span>`,
  exercises:[
   {task:'Affichez les zones en sautant la plus peuplée : <b>4 zones triées par population décroissante</b>, en commençant à la 2ème. Colonnes : nom, population.',
    hints:['ORDER BY population DESC pour trier de la plus peuplée à la moins peuplée.','LIMIT 4 OFFSET 1 — saute le 1er résultat (le plus peuplé).','SELECT nom, population FROM zones ORDER BY population DESC LIMIT 4 OFFSET 1;']},
   {task:'Simulez la <b>page 2</b> des cas (3 résultats par page). Affichez id_cas, id_zone, gravite, triés par id_cas croissant.',
    hints:['Page 2 = sauter les 3 premiers → OFFSET 3','LIMIT 3 OFFSET 3','SELECT id_cas, id_zone, gravite FROM cas ORDER BY id_cas LIMIT 3 OFFSET 3;']},
   {task:'Affichez le <b>3ème foyer ayant le moins de cas liés</b> uniquement. Colonnes : id_foyer, id_zone, nb_cas_lies.',
    hints:['ORDER BY nb_cas_lies ASC pour du moins élevé au plus élevé.','LIMIT 1 OFFSET 2 — saute les 2 premiers, prend le 3ème.','SELECT id_foyer, id_zone, nb_cas_lies FROM foyers ORDER BY nb_cas_lies ASC LIMIT 1 OFFSET 2;']},
  ]},

 {id:'d9',title:'9. Pourcentage – Afficher X% des données',hot:false,
  desc:'Calculer et afficher une fraction des données en déduisant un LIMIT à partir d\'un pourcentage.',
  concept:`<span class="cm">-- Calcul manuel : total × (X/100) = N → LIMIT N</span>
<span class="cm">-- Ex : 6 zones × 30% ≈ 2 → LIMIT 2</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">zones</span> <span class="kw">ORDER BY</span> population <span class="kw">DESC</span> <span class="kw">LIMIT</span> <span class="num">2</span>;

<span class="cm">-- Calcul dynamique (s'adapte si la table grandit) :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">cas</span> <span class="kw">ORDER BY</span> age_patient <span class="kw">DESC</span>
<span class="kw">LIMIT</span> (<span class="kw">SELECT</span> <span class="fn">CAST</span>(<span class="fn">COUNT</span>(*) * <span class="num">0.50</span> <span class="kw">AS</span> <span class="kw">INT</span>) <span class="kw">FROM</span> <span class="tbl">cas</span>);`,
  exercises:[
   {task:'Affichez les <b>30% des zones les plus peuplées</b> (calcul manuel : 6 × 0,30 ≈ 2). Colonnes : nom, population.',
    hints:['6 zones × 0,30 = 1,8 → LIMIT 2','ORDER BY population DESC','SELECT nom, population FROM zones ORDER BY population DESC LIMIT 2;']},
   {task:'Affichez les <b>50% des cas avec le patient le plus âgé</b> avec un <b>calcul dynamique</b> (LIMIT basé sur COUNT(*)).',
    hints:['LIMIT (SELECT CAST(COUNT(*) * 0.50 AS INT) FROM cas)','ORDER BY age_patient DESC','SELECT * FROM cas ORDER BY age_patient DESC LIMIT (SELECT CAST(COUNT(*) * 0.50 AS INT) FROM cas);']},
   {task:'Affichez les <b>25% des vaccinations ayant le taux de couverture le plus élevé</b> (calcul manuel : 19 × 0,25 ≈ 5). Colonnes : id_zone, mois, taux_couverture.',
    hints:['19 lignes × 0,25 = 4,75 → LIMIT 5','ORDER BY taux_couverture DESC','SELECT id_zone, mois, taux_couverture FROM vaccinations ORDER BY taux_couverture DESC LIMIT 5;']},
  ]},
], i: [
 {id:'i1',title:'7. INNER JOIN – Joindre deux tables',hot:true,
  desc:'Combiner des tables liées. Question numéro 1 dans les tests SQL en entretien.',
  concept:`<span class="kw">SELECT</span> z.nom, c.gravite
<span class="kw">FROM</span> <span class="tbl">cas</span> c
<span class="kw">INNER JOIN</span> <span class="tbl">zones</span> z
  <span class="kw">ON</span> c.id_zone = z.id_zone;
<span class="cm">-- Seules les lignes avec correspondance des deux côtés</span>`,
  exercises:[
   {task:'Affichez le <b>nom de la zone</b>, la <b>date_declaration</b> et la <b>gravite</b> pour chaque cas.',
    hints:['INNER JOIN zones z','ON c.id_zone = z.id_zone','SELECT z.nom AS zone, c.date_declaration, c.gravite FROM cas c INNER JOIN zones z ON c.id_zone = z.id_zone;']},
   {task:'Affichez le <b>nom de la maladie</b>, l\'<b>age_patient</b> et la <b>gravite</b> pour chaque cas.',
    hints:['JOIN maladies m ON c.id_maladie = m.id_maladie','SELECT m.nom AS maladie, c.age_patient, c.gravite','SELECT m.nom AS maladie, c.age_patient, c.gravite FROM cas c INNER JOIN maladies m ON c.id_maladie = m.id_maladie;']},
   {task:'Affichez le <b>nom de la zone</b>, le <b>mois</b> et le <b>taux_couverture</b> pour chaque vaccination.',
    hints:['JOIN du côté vaccinations → zones','ON v.id_zone = z.id_zone','SELECT z.nom AS zone, v.mois, v.taux_couverture FROM vaccinations v INNER JOIN zones z ON v.id_zone = z.id_zone;']},
  ]},

 {id:'i2',title:'8. LEFT JOIN – Garder tout à gauche',hot:true,
  desc:'Inclure les lignes sans correspondance. Très testé pour l\'analyse de données manquantes.',
  concept:`<span class="kw">FROM</span> <span class="tbl">zones</span> z
<span class="kw">LEFT JOIN</span> <span class="tbl">cas</span> c
  <span class="kw">ON</span> z.id_zone = c.id_zone;
<span class="cm">-- Zone sans cas → gravite = NULL</span>
<span class="cm">-- INNER JOIN l'aurait exclue</span>`,
  exercises:[
   {task:'Listez <b>toutes les zones</b> avec leurs cas (NULL si aucun cas enregistré).',
    hints:['LEFT JOIN au lieu de INNER JOIN.','ON z.id_zone = c.id_zone','SELECT z.nom, c.gravite FROM zones z LEFT JOIN cas c ON z.id_zone = c.id_zone;']},
   {task:'Listez <b>toutes les maladies</b> avec leur foyer (NULL si aucun foyer enregistré pour cette maladie).',
    hints:['LEFT JOIN foyers f ON m.id_maladie = f.id_maladie','SELECT m.nom, f.id_foyer','SELECT m.nom, f.id_foyer FROM maladies m LEFT JOIN foyers f ON m.id_maladie = f.id_maladie;']},
   {task:'Listez <b>toutes les zones</b> avec leur vaccination contre la maladie 2 au mois <b>2024-10-01</b> (NULL si absente).',
    hints:['LEFT JOIN vaccinations v ON z.id_zone = v.id_zone AND v.id_maladie = 2 AND v.mois = \'2024-10-01\'','SELECT z.nom, v.taux_couverture','SELECT z.nom, v.taux_couverture FROM zones z LEFT JOIN vaccinations v ON z.id_zone = v.id_zone AND v.id_maladie = 2 AND v.mois = \'2024-10-01\';']},
  ]},

 {id:'i3',title:'9. COUNT / AVG / SUM / MIN / MAX',hot:true,
  desc:'Fonctions d\'agrégation. Présentes dans 95% des postes data analyst.',
  concept:`<span class="kw">SELECT</span>
  <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb_total,
  <span class="fn">AVG</span>(age_patient) <span class="kw">AS</span> age_moyen,
  <span class="fn">MAX</span>(age_patient) <span class="kw">AS</span> age_max
<span class="kw">FROM</span> <span class="tbl">cas</span>;`,
  exercises:[
   {task:'Calculez : nombre total de cas, âge moyen, âge maximum et âge minimum.',
    hints:['COUNT(*), AVG(age_patient), MAX(...), MIN(...)','Utilisez AS pour nommer chaque résultat.','SELECT COUNT(*) AS nb, AVG(age_patient) AS age_moyen, MAX(age_patient) AS age_max, MIN(age_patient) AS age_min FROM cas;']},
   {task:'Calculez le nombre total de doses administrées et le taux de couverture moyen et maximum.',
    hints:['SUM(nb_doses_administrees), AVG(taux_couverture), MAX(taux_couverture)','FROM vaccinations','SELECT SUM(nb_doses_administrees) AS total_doses, AVG(taux_couverture) AS taux_moyen, MAX(taux_couverture) AS taux_max FROM vaccinations;']},
   {task:'Calculez le nombre moyen, minimum et maximum de <b>cas liés</b> par foyer.',
    hints:['AVG(nb_cas_lies), MIN(nb_cas_lies), MAX(nb_cas_lies)','FROM foyers','SELECT AVG(nb_cas_lies) AS moy, MIN(nb_cas_lies) AS min_cas, MAX(nb_cas_lies) AS max_cas FROM foyers;']},
  ]},

 {id:'i4',title:'10. GROUP BY – Statistiques par groupe',hot:true,
  desc:'Regrouper et agréger. Omniprésent dans les analyses et tableaux de bord.',
  concept:`<span class="kw">SELECT</span> id_zone, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">cas</span>
<span class="kw">GROUP BY</span> id_zone
<span class="kw">ORDER BY</span> nb <span class="kw">DESC</span>;
<span class="cm">-- GROUP_CONCAT : concatène les valeurs d'un groupe</span>
<span class="fn">GROUP_CONCAT</span>(gravite, <span class="str">', '</span>) <span class="kw">AS</span> liste_gravites`,
  exercises:[
   {task:'Nombre de cas et âge moyen <b>par zone</b> (id_zone), de la plus touchée à la moins touchée.',
    hints:['GROUP BY id_zone','COUNT(*) AS nb_cas, AVG(age_patient) AS age_moyen','SELECT id_zone, COUNT(*) AS nb_cas, AVG(age_patient) AS age_moyen FROM cas GROUP BY id_zone ORDER BY nb_cas DESC;']},
   {task:'Nombre de vaccinations et taux de couverture moyen <b>par maladie</b> (id_maladie), triés par taux décroissant.',
    hints:['GROUP BY id_maladie','COUNT(*) AS nb_mois, AVG(taux_couverture) AS taux_moyen','SELECT id_maladie, COUNT(*) AS nb_mois, AVG(taux_couverture) AS taux_moyen FROM vaccinations GROUP BY id_maladie ORDER BY taux_moyen DESC;']},
   {task:'Pour chaque zone (id_zone), affichez la <b>liste des niveaux de gravité</b> des cas séparés par une virgule avec <b>GROUP_CONCAT</b>.',
    hints:['GROUP_CONCAT(gravite, \', \') AS liste_gravites','GROUP_CONCAT concatène toutes les valeurs du groupe en une seule chaîne (syntaxe SQLite : GROUP_CONCAT(col, séparateur)).','SELECT id_zone, GROUP_CONCAT(gravite, \', \') AS liste_gravites FROM cas GROUP BY id_zone;']},
  ]},

 {id:'i5',title:'11. HAVING – Filtrer les groupes',hot:true,
  desc:'HAVING filtre après GROUP BY. WHERE ne peut pas utiliser les agrégats.',
  concept:`<span class="cm">-- WHERE filtre les LIGNES (avant groupement)</span>
<span class="cm">-- HAVING filtre les GROUPES (après groupement)</span>

<span class="kw">SELECT</span> id_zone, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">cas</span>
<span class="kw">GROUP BY</span> id_zone
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) >= <span class="num">5</span>;`,
  exercises:[
   {task:'Listez les zones (id_zone) ayant <b>au moins 5 cas</b> déclarés.',
    hints:['GROUP BY id_zone','HAVING COUNT(*) >= 5','SELECT id_zone, COUNT(*) AS nb FROM cas GROUP BY id_zone HAVING COUNT(*) >= 5;']},
   {task:'Listez les maladies (id_maladie) dont le <b>taux de couverture vaccinale moyen dépasse 45%</b>.',
    hints:['GROUP BY id_maladie FROM vaccinations','HAVING AVG(taux_couverture) > 45','SELECT id_maladie, AVG(taux_couverture) AS taux_moyen FROM vaccinations GROUP BY id_maladie HAVING AVG(taux_couverture) > 45;']},
   {task:'Listez les zones (id_zone) ayant <b>au moins 2 foyers</b> enregistrés.',
    hints:['GROUP BY id_zone FROM foyers','HAVING COUNT(*) >= 2','SELECT id_zone, COUNT(*) AS nb_foyers FROM foyers GROUP BY id_zone HAVING COUNT(*) >= 2;']},
  ]},

 {id:'i6',title:'12. Jointure multiple – 3 tables',hot:true,
  desc:'Requêtes sur plusieurs tables. Fréquent en entretien senior et dans les vrais projets.',
  concept:`<span class="kw">SELECT</span> z.nom, m.nom <span class="kw">AS</span> maladie, c.gravite
<span class="kw">FROM</span> <span class="tbl">zones</span> z
<span class="kw">JOIN</span> <span class="tbl">cas</span> c <span class="kw">ON</span> z.id_zone = c.id_zone
<span class="kw">JOIN</span> <span class="tbl">maladies</span> m <span class="kw">ON</span> c.id_maladie = m.id_maladie;
<span class="cm">-- Chaîner plusieurs JOIN pour relier les tables</span>`,
  exercises:[
   {task:'Listez le <b>nom de la zone</b>, le <b>nom de la maladie</b> et la <b>gravite</b> pour chaque cas.',
    hints:['Faites 2 JOIN : zones → cas → maladies','ON c.id_maladie = m.id_maladie pour le 2e JOIN','SELECT z.nom AS zone, m.nom AS maladie, c.gravite FROM zones z JOIN cas c ON z.id_zone = c.id_zone JOIN maladies m ON c.id_maladie = m.id_maladie;']},
   {task:'Affichez le <b>nom de la zone</b>, le <b>nom de la maladie</b>, et la <b>date_debut</b> et <b>date_fin</b> de chaque foyer.',
    hints:['Même type de jointure : zones → foyers → maladies','ON f.id_maladie = m.id_maladie','SELECT z.nom AS zone, m.nom AS maladie, f.date_debut, f.date_fin FROM zones z JOIN foyers f ON z.id_zone = f.id_zone JOIN maladies m ON f.id_maladie = m.id_maladie;']},
   {task:'Affichez le <b>nom de la zone</b>, le <b>nom de la maladie</b>, le <b>mois</b> et le <b>taux_couverture</b> pour chaque vaccination.',
    hints:['JOIN vaccinations v ON z.id_zone = v.id_zone','JOIN maladies m ON v.id_maladie = m.id_maladie','SELECT z.nom AS zone, m.nom AS maladie, v.mois, v.taux_couverture FROM zones z JOIN vaccinations v ON z.id_zone = v.id_zone JOIN maladies m ON v.id_maladie = m.id_maladie;']},
  ]},

 {id:'i7',title:'13. LIKE – Recherche de motifs',hot:false,
  desc:'Filtrer du texte avec des wildcards. Utilisé dans les recherches et la validation de données.',
  concept:`<span class="cm">-- % : n'importe quelle séquence de caractères</span>
<span class="cm">-- _ : exactement un caractère</span>

<span class="kw">WHERE</span> nom <span class="kw">LIKE</span> <span class="str">'%covid%'</span>  <span class="cm">-- contient (insensible à la casse)</span>
<span class="kw">WHERE</span> nom <span class="kw">LIKE</span> <span class="str">'Zone N%'</span>      <span class="cm">-- commence par 'Zone N'</span>
<span class="kw">WHERE</span> region <span class="kw">LIKE</span> <span class="str">'%Île%'</span>     <span class="cm">-- contient 'Île'</span>`,
  exercises:[
   {task:'Trouvez la maladie dont le nom contient <b>covid</b> (LIKE est insensible à la casse).',
    hints:['WHERE nom LIKE \'%...%\'','Le mot à chercher : covid','SELECT * FROM maladies WHERE nom LIKE \'%covid%\';']},
   {task:'Listez les zones dont le <b>nom commence par "Zone N"</b>.',
    hints:['WHERE nom LIKE \'Zone N%\'','Le % remplace tout ce qui suit.','SELECT * FROM zones WHERE nom LIKE \'Zone N%\';']},
   {task:'Listez les zones dont la <b>région contient le mot "Île"</b>.',
    hints:['WHERE region LIKE \'%Île%\'','La région est la colonne region de la table zones.','SELECT * FROM zones WHERE region LIKE \'%Île%\';']},
  ]},
], a: [
 {id:'a1',title:'14. Sous-requêtes – Subqueries',hot:true,
  desc:'Imbriquer des requêtes. Très demandé dans les tests techniques data analyst.',
  concept:`<span class="cm">-- Sous-requête scalaire (retourne 1 valeur) :</span>
<span class="kw">WHERE</span> age_patient > (<span class="kw">SELECT</span> <span class="fn">AVG</span>(age_patient) <span class="kw">FROM</span> <span class="tbl">cas</span>)

<span class="cm">-- Sous-requête dans FROM :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> (
  <span class="kw">SELECT</span> id_zone, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb <span class="kw">FROM</span> <span class="tbl">cas</span>
  <span class="kw">GROUP BY</span> id_zone
) sub <span class="kw">WHERE</span> nb > <span class="num">5</span>`,
  exercises:[
   {task:'Listez les cas dont l\'<b>age_patient</b> est <b>supérieur à la moyenne</b> d\'âge.',
    hints:['WHERE age_patient > (sous-requête)','La sous-requête : SELECT AVG(age_patient) FROM cas','SELECT * FROM cas WHERE age_patient > (SELECT AVG(age_patient) FROM cas);']},
   {task:'Listez les vaccinations dont le <b>taux_couverture</b> est <b>supérieur à la moyenne</b>.',
    hints:['WHERE taux_couverture > (SELECT AVG(taux_couverture) FROM vaccinations)','SELECT id_zone, mois, taux_couverture FROM vaccinations','SELECT id_zone, mois, taux_couverture FROM vaccinations WHERE taux_couverture > (SELECT AVG(taux_couverture) FROM vaccinations);']},
   {task:'Listez les zones dont la <b>population</b> est <b>supérieure à la moyenne</b> des populations.',
    hints:['WHERE population > (SELECT AVG(population) FROM zones)','SELECT nom, region, population FROM zones','SELECT nom, region, population FROM zones WHERE population > (SELECT AVG(population) FROM zones);']},
  ]},

 {id:'a2',title:'15. CTE – WITH … AS',hot:true,
  desc:'Rendre les requêtes lisibles et modulaires. Très apprécié par les recruteurs.',
  concept:`<span class="kw">WITH</span> foyers_actifs <span class="kw">AS</span> (
  <span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">foyers</span>
  <span class="kw">WHERE</span> date_fin <span class="kw">IS NULL</span>
)
<span class="kw">SELECT</span> z.nom, fa.nb_cas_lies
<span class="kw">FROM</span> foyers_actifs fa
<span class="kw">JOIN</span> <span class="tbl">zones</span> z <span class="kw">ON</span> fa.id_zone = z.id_zone;`,
  exercises:[
   {task:'Avec un CTE <b>foyers_actifs</b> (date_fin IS NULL), listez le nom des zones concernées par ces foyers.',
    hints:['WITH foyers_actifs AS (SELECT * FROM foyers WHERE date_fin IS NULL)','JOIN zones z ON foyers_actifs.id_zone = z.id_zone','WITH foyers_actifs AS (SELECT * FROM foyers WHERE date_fin IS NULL) SELECT z.nom, fa.nb_cas_lies FROM foyers_actifs fa JOIN zones z ON fa.id_zone = z.id_zone;']},
   {task:'Avec un CTE <b>cas_graves</b> (gravite = \'Sévère\'), comptez combien sont hospitalisés.',
    hints:['WITH cas_graves AS (SELECT * FROM cas WHERE gravite = \'Sévère\')','Ensuite : SELECT COUNT(*) FROM cas_graves WHERE hospitalise = 1','Le CTE filtre, le SELECT principal compte.','WITH cas_graves AS (SELECT * FROM cas WHERE gravite = \'Sévère\') SELECT COUNT(*) AS nb_hospitalises FROM cas_graves WHERE hospitalise = 1;']},
   {task:'Avec un CTE <b>zones_grandes</b> (population > 500000), listez les cas (id_cas, gravite) survenus dans ces zones.',
    hints:['WITH zones_grandes AS (SELECT * FROM zones WHERE population > 500000)','JOIN cas c ON zones_grandes.id_zone = c.id_zone','WITH zones_grandes AS (SELECT * FROM zones WHERE population > 500000) SELECT c.id_cas, c.gravite FROM zones_grandes zg JOIN cas c ON zg.id_zone = c.id_zone;']},
  ]},

 {id:'a3',title:'16. CASE WHEN – Logique conditionnelle',hot:true,
  desc:'Créer des colonnes calculées conditionnelles. Demandé dans presque tous les tests SQL.',
  concept:`<span class="kw">SELECT</span> id_cas,
  <span class="kw">CASE</span>
    <span class="kw">WHEN</span> gravite = <span class="str">'Sévère'</span> <span class="kw">THEN</span> <span class="str">'Urgente'</span>
    <span class="kw">ELSE</span> <span class="str">'Normale'</span>
  <span class="kw">END</span> <span class="kw">AS</span> priorite_sante
<span class="kw">FROM</span> <span class="tbl">cas</span>;`,
  exercises:[
   {task:'Ajoutez une colonne <b>priorite_sante</b> : "Urgente" si gravite = Sévère, "Normale" sinon.',
    hints:['CASE WHEN gravite = \'Sévère\' THEN \'Urgente\' ELSE \'Normale\' END','SELECT id_cas, gravite, CASE WHEN ... END AS priorite_sante','SELECT id_cas, gravite, CASE WHEN gravite = \'Sévère\' THEN \'Urgente\' ELSE \'Normale\' END AS priorite_sante FROM cas;']},
   {task:'Ajoutez une colonne <b>niveau_couverture</b> : "Faible" (< 40), "Moyen" (40 à 48), "Bon" (> 48), sur vaccinations.',
    hints:['CASE WHEN taux_couverture < 40 THEN \'Faible\' WHEN taux_couverture <= 48 THEN \'Moyen\' ELSE \'Bon\' END','SELECT id_zone, mois, taux_couverture, CASE WHEN ... END AS niveau_couverture','SELECT id_zone, mois, taux_couverture, CASE WHEN taux_couverture < 40 THEN \'Faible\' WHEN taux_couverture <= 48 THEN \'Moyen\' ELSE \'Bon\' END AS niveau_couverture FROM vaccinations;']},
   {task:'Sur les cas, ajoutez une colonne <b>tranche_age</b> : "Enfant" (< 18), "Adulte" (18 à 65), "Senior" (> 65).',
    hints:['CASE WHEN age_patient < 18 THEN \'Enfant\' WHEN age_patient <= 65 THEN \'Adulte\' ELSE \'Senior\' END','SELECT id_cas, age_patient, CASE WHEN ... END AS tranche_age','SELECT id_cas, age_patient, CASE WHEN age_patient < 18 THEN \'Enfant\' WHEN age_patient <= 65 THEN \'Adulte\' ELSE \'Senior\' END AS tranche_age FROM cas;']},
  ]},

 {id:'a4',title:'17. Détecter les doublons',hot:true,
  desc:'Question classique d\'entretien : "comment trouver les doublons ?" — GROUP BY + HAVING.',
  concept:`<span class="cm">-- Trouver les doublons : GROUP BY + HAVING COUNT > 1</span>
<span class="kw">SELECT</span> col1, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> table
<span class="kw">GROUP BY</span> col1
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) > <span class="num">1</span>;`,
  exercises:[
   {task:'Trouvez les zones (id_zone) ayant <b>plus de 3 cas</b> déclarés.',
    hints:['SELECT id_zone, COUNT(*) AS nb_cas FROM cas','GROUP BY id_zone','SELECT id_zone, COUNT(*) AS nb_cas FROM cas GROUP BY id_zone HAVING COUNT(*) > 3;']},
   {task:'Trouvez les combinaisons (id_zone, id_maladie) apparaissant <b>plus d\'une fois</b> dans les cas.',
    hints:['SELECT id_zone, id_maladie, COUNT(*) FROM cas','GROUP BY id_zone, id_maladie','SELECT id_zone, id_maladie, COUNT(*) AS nb FROM cas GROUP BY id_zone, id_maladie HAVING COUNT(*) > 1;']},
   {task:'Trouvez les zones (id_zone) apparaissant <b>plus d\'une fois</b> dans la table foyers.',
    hints:['SELECT id_zone, COUNT(*) FROM foyers','GROUP BY id_zone HAVING COUNT(*) > 1','SELECT id_zone, COUNT(*) AS nb_fois FROM foyers GROUP BY id_zone HAVING COUNT(*) > 1;']},
  ]},

 {id:'a5',title:'18. Zones sans cas – Anti-JOIN',hot:true,
  desc:'"Trouver les X sans Y" : question très fréquente en entretien. Deux approches classiques.',
  concept:`<span class="cm">-- Approche 1 : LEFT JOIN + IS NULL</span>
<span class="kw">SELECT</span> z.nom <span class="kw">FROM</span> <span class="tbl">zones</span> z
<span class="kw">LEFT JOIN</span> <span class="tbl">cas</span> c <span class="kw">ON</span> z.id_zone = c.id_zone
<span class="kw">WHERE</span> c.id_cas <span class="kw">IS NULL</span>;

<span class="cm">-- Approche 2 : NOT IN</span>
<span class="kw">WHERE</span> id_maladie <span class="kw">NOT IN</span> (
  <span class="kw">SELECT</span> id_maladie <span class="kw">FROM</span> <span class="tbl">foyers</span>
)`,
  exercises:[
   {task:'Listez les zones qui n\'ont <b>aucun cas</b> déclaré.',
    hints:['LEFT JOIN cas c ON z.id_zone = c.id_zone','WHERE c.id_cas IS NULL','SELECT z.nom, z.region FROM zones z LEFT JOIN cas c ON z.id_zone = c.id_zone WHERE c.id_cas IS NULL;']},
   {task:'Listez les zones qui n\'ont <b>aucun foyer</b> enregistré (utilisez NOT IN).',
    hints:['WHERE id_zone NOT IN (SELECT id_zone FROM foyers)','SELECT nom, region FROM zones','SELECT nom, region FROM zones WHERE id_zone NOT IN (SELECT id_zone FROM foyers);']},
   {task:'Listez les zones qui n\'ont <b>aucune vaccination contre la maladie 2 au mois 2024-10-01</b> (LEFT JOIN + IS NULL).',
    hints:['LEFT JOIN vaccinations v ON z.id_zone = v.id_zone AND v.id_maladie = 2 AND v.mois = \'2024-10-01\'','WHERE v.id_vaccination IS NULL','SELECT z.nom FROM zones z LEFT JOIN vaccinations v ON z.id_zone = v.id_zone AND v.id_maladie = 2 AND v.mois = \'2024-10-01\' WHERE v.id_vaccination IS NULL;']},
  ]},

 {id:'a6',title:'19. Fonctions de date',hot:true,
  desc:'Manipuler des dates : demandé dans les analyses temporelles et les tableaux de bord.',
  concept:`<span class="cm">-- Extraire une partie de date :</span>
<span class="fn">YEAR</span>(date_debut)   <span class="cm">→ 2024</span>
<span class="fn">MONTH</span>(date_declaration)  <span class="cm">→ 11</span>

<span class="cm">-- Compter par mois :</span>
<span class="kw">SELECT</span> <span class="fn">MONTH</span>(date_declaration) <span class="kw">AS</span> mois_num,
       <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">cas</span> <span class="kw">GROUP BY</span> mois_num`,
  exercises:[
   {task:'Comptez le nombre de cas déclarés <b>par mois</b> (numéro du mois). Affichez le mois et le nombre.',
    hints:['MONTH(date_declaration) AS mois_num','GROUP BY mois_num','SELECT MONTH(date_declaration) AS mois_num, COUNT(*) AS nb FROM cas GROUP BY mois_num ORDER BY mois_num;']},
   {task:'Comptez le nombre de <b>foyers démarrés</b> par année (date_debut). Affichez l\'année et le nombre.',
    hints:['YEAR(date_debut) AS annee FROM foyers','GROUP BY annee','SELECT YEAR(date_debut) AS annee, COUNT(*) AS nb_foyers FROM foyers GROUP BY annee ORDER BY annee;']},
   {task:'Listez uniquement les cas du <b>mois 11</b> (novembre). Affichez id_cas, id_zone, date_declaration.',
    hints:['WHERE MONTH(date_declaration) = 11','SELECT id_cas, id_zone, date_declaration FROM cas','SELECT id_cas, id_zone, date_declaration FROM cas WHERE MONTH(date_declaration) = 11;']},
  ]},

 {id:'a7',title:'20. COALESCE & NULLIF',hot:true,
  desc:'Gérer intelligemment les NULLs. Attendu dans tout rôle data engineering ou analyst.',
  concept:`<span class="cm">-- COALESCE : retourne la 1ère valeur non-NULL</span>
<span class="fn">COALESCE</span>(date_gueri, <span class="str">'Toujours malade'</span>)
<span class="fn">COALESCE</span>(col1, col2, <span class="str">'défaut'</span>)

<span class="cm">-- NULLIF : retourne NULL si a = b (évite ÷0)</span>
<span class="fn">NULLIF</span>(col, <span class="num">0</span>)  <span class="cm">→ NULL si col = 0</span>`,
  exercises:[
   {task:'Listez les cas avec la date_gueri remplacée par <b>"Toujours malade"</b> si NULL.',
    hints:['COALESCE(date_gueri, \'Toujours malade\') AS statut','SELECT id_cas, gravite, COALESCE(date_gueri, \'Toujours malade\') AS statut','SELECT id_cas, gravite, COALESCE(date_gueri, \'Toujours malade\') AS statut FROM cas;']},
   {task:'Affichez id_foyer, id_zone, date_debut et une colonne <b>statut_foyer</b> = date_fin ou "Foyer actif" si NULL, ordonné par id_foyer.',
    hints:['COALESCE(date_fin, \'Foyer actif\') AS statut_foyer','SELECT id_foyer, id_zone, date_debut, COALESCE(date_fin, \'Foyer actif\') AS statut_foyer','SELECT id_foyer, id_zone, date_debut, COALESCE(date_fin, \'Foyer actif\') AS statut_foyer FROM foyers ORDER BY id_foyer;']},
   {task:'Affichez les cas avec une colonne <b>age_ajuste</b> qui vaut NULL si l\'age_patient est exactement 45, sinon l\'âge normal.',
    hints:['NULLIF(age_patient, 45) AS age_ajuste','SELECT id_cas, age_patient, NULLIF(age_patient, 45) AS age_ajuste','SELECT id_cas, age_patient, NULLIF(age_patient, 45) AS age_ajuste FROM cas;']},
  ]},
], e: [
 {id:'e1',title:'21. RANK() / ROW_NUMBER() OVER',hot:true,
  desc:'Fonctions fenêtre de classement. Incontournables pour les postes data analyst avancés.',
  concept:`<span class="kw">SELECT</span> id_cas, id_zone, age_patient,
  <span class="fn">RANK</span>() <span class="kw">OVER</span> (
    <span class="kw">PARTITION BY</span> id_zone
    <span class="kw">ORDER BY</span> age_patient <span class="kw">DESC</span>
  ) <span class="kw">AS</span> rang
<span class="kw">FROM</span> ...
<span class="cm">-- ROW_NUMBER : rang unique même si ex-aequo</span>
<span class="cm">-- RANK : ex-aequo partagent le même rang</span>`,
  exercises:[
   {task:'Classez les cas par âge décroissant <b>par zone</b> (PARTITION BY id_zone). Affichez id_zone, id_cas, age_patient et rang.',
    hints:['RANK() OVER (PARTITION BY id_zone ORDER BY age_patient DESC) AS rang','SELECT id_zone, id_cas, age_patient, RANK()...','SELECT id_zone, id_cas, age_patient, RANK() OVER (PARTITION BY id_zone ORDER BY age_patient DESC) AS rang FROM cas ORDER BY id_zone, rang;']},
   {task:'Classez <b>toutes les vaccinations</b> par taux_couverture décroissant avec ROW_NUMBER() (sans PARTITION). Affichez id_zone, mois, taux_couverture et rang.',
    hints:['ROW_NUMBER() OVER (ORDER BY taux_couverture DESC) AS rang','Pas de PARTITION BY ici — toutes les vaccinations ensemble.','SELECT id_zone, mois, taux_couverture, ROW_NUMBER() OVER (ORDER BY taux_couverture DESC) AS rang FROM vaccinations;']},
   {task:'Classez les vaccinations par taux_couverture décroissant <b>par zone</b> (PARTITION BY id_zone) avec RANK(). Affichez id_zone, mois, taux_couverture et rang.',
    hints:['RANK() OVER (PARTITION BY id_zone ORDER BY taux_couverture DESC) AS rang','SELECT id_zone, mois, taux_couverture, RANK() ...','SELECT id_zone, mois, taux_couverture, RANK() OVER (PARTITION BY id_zone ORDER BY taux_couverture DESC) AS rang FROM vaccinations ORDER BY id_zone, rang;']},
  ]},

 {id:'e2',title:'22. SUM / AVG OVER – Cumul & Moyenne glissante',hot:true,
  desc:'Totaux cumulés et moyennes mobiles. Demandés dans les analyses financières et médicales.',
  concept:`<span class="cm">-- Total cumulé :</span>
<span class="fn">SUM</span>(nb_doses_administrees) <span class="kw">OVER</span> (
  <span class="kw">ORDER BY</span> mois
) <span class="kw">AS</span> cumul

<span class="cm">-- Par partition :</span>
<span class="fn">SUM</span>(nb_doses_administrees) <span class="kw">OVER</span> (
  <span class="kw">PARTITION BY</span> id_zone
  <span class="kw">ORDER BY</span> mois
) <span class="kw">AS</span> cumul_par_zone`,
  exercises:[
   {task:'Total cumulé du <b>nombre de doses administrées</b> par ordre de mois (toutes lignes confondues). Affichez mois, nb_doses_administrees et cumul.',
    hints:['SUM(nb_doses_administrees) OVER (ORDER BY mois) AS cumul_doses','SELECT mois, nb_doses_administrees, SUM(nb_doses_administrees) OVER (ORDER BY mois) AS cumul_doses','SELECT mois, nb_doses_administrees, SUM(nb_doses_administrees) OVER (ORDER BY mois) AS cumul_doses FROM vaccinations ORDER BY mois;']},
   {task:'Total cumulé du <b>nombre de cas liés</b> des foyers par ordre d\'id_foyer. Affichez id_foyer, id_zone, nb_cas_lies et cumul.',
    hints:['SUM(nb_cas_lies) OVER (ORDER BY id_foyer) AS cumul_cas','SELECT id_foyer, id_zone, nb_cas_lies, SUM(...) OVER (...) AS cumul_cas','SELECT id_foyer, id_zone, nb_cas_lies, SUM(nb_cas_lies) OVER (ORDER BY id_foyer) AS cumul_cas FROM foyers;']},
   {task:'Moyenne glissante du <b>taux_couverture</b> par ordre de mois. Affichez mois, taux_couverture et la moyenne glissante.',
    hints:['AVG(taux_couverture) OVER (ORDER BY mois) AS moy_glissante','SELECT mois, taux_couverture, AVG(...) OVER (...) AS moy_glissante','SELECT mois, taux_couverture, AVG(taux_couverture) OVER (ORDER BY mois) AS moy_glissante FROM vaccinations ORDER BY mois;']},
  ]},

 {id:'e3',title:'23. LAG / LEAD – Valeurs décalées',hot:true,
  desc:'Comparer une ligne avec la précédente ou suivante. Question avancée très appréciée.',
  concept:`<span class="fn">LAG</span>(col, 1)  <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> mois)
<span class="cm">-- valeur de la ligne précédente</span>

<span class="fn">LEAD</span>(col, 1) <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> mois)
<span class="cm">-- valeur de la ligne suivante</span>

<span class="cm">-- Utilisation : calculer l'évolution mois par mois</span>`,
  exercises:[
   {task:'Pour chaque vaccination, affichez le <b>taux_couverture du mois précédent</b> (LAG) par ordre de mois (toutes lignes confondues).',
    hints:['LAG(taux_couverture, 1) OVER (ORDER BY mois) AS taux_precedent','SELECT mois, taux_couverture, LAG(taux_couverture, 1) OVER (ORDER BY mois) AS taux_precedent','SELECT mois, taux_couverture, LAG(taux_couverture, 1) OVER (ORDER BY mois) AS taux_precedent FROM vaccinations ORDER BY mois;']},
   {task:'Pour chaque vaccination, affichez le <b>taux_couverture du mois suivant</b> (LEAD) par ordre de mois.',
    hints:['LEAD(taux_couverture, 1) OVER (ORDER BY mois) AS taux_suivant','SELECT mois, taux_couverture, LEAD(taux_couverture, 1) OVER (ORDER BY mois) AS taux_suivant','SELECT mois, taux_couverture, LEAD(taux_couverture, 1) OVER (ORDER BY mois) AS taux_suivant FROM vaccinations ORDER BY mois;']},
   {task:'Pour chaque vaccination, affichez le taux_couverture précédent <b>par zone</b> (PARTITION BY id_zone, LAG) par ordre de mois.',
    hints:['LAG(taux_couverture, 1) OVER (PARTITION BY id_zone ORDER BY mois) AS taux_prec_zone','SELECT id_zone, mois, taux_couverture, LAG(...) OVER (...) AS taux_prec_zone','SELECT id_zone, mois, taux_couverture, LAG(taux_couverture, 1) OVER (PARTITION BY id_zone ORDER BY mois) AS taux_prec_zone FROM vaccinations ORDER BY id_zone, mois;']},
  ]},

 {id:'e4',title:'24. Deuxième valeur la plus haute',hot:true,
  desc:'Question classique d\'entretien : "2ème salaire le plus élevé". Plusieurs approches.',
  concept:`<span class="cm">-- Approche 1 : LIMIT + OFFSET</span>
<span class="kw">SELECT DISTINCT</span> age_patient <span class="kw">FROM</span> <span class="tbl">cas</span>
<span class="kw">ORDER BY</span> age_patient <span class="kw">DESC</span> <span class="kw">LIMIT</span> <span class="num">1</span> <span class="cm">OFFSET 1</span>

<span class="cm">-- Approche 2 : Sous-requête</span>
<span class="kw">SELECT</span> <span class="fn">MAX</span>(age_patient) <span class="kw">FROM</span> <span class="tbl">cas</span>
<span class="kw">WHERE</span> age_patient < (
  <span class="kw">SELECT</span> <span class="fn">MAX</span>(age_patient) <span class="kw">FROM</span> <span class="tbl">cas</span>
)`,
  exercises:[
   {task:'Trouvez le <b>2ème âge le plus élevé</b> parmi les cas (sans utiliser OFFSET).',
    hints:['Approche : SELECT MAX(age_patient) WHERE age_patient < (SELECT MAX(age_patient) ...)','La sous-requête retourne l\'âge max, la requête principale prend le max en dessous.','SELECT MAX(age_patient) AS deuxieme_age FROM cas WHERE age_patient < (SELECT MAX(age_patient) FROM cas);']},
   {task:'Trouvez le <b>2ème taux_couverture le plus élevé</b> parmi les vaccinations (utilisez LIMIT + OFFSET).',
    hints:['SELECT DISTINCT taux_couverture FROM vaccinations ORDER BY taux_couverture DESC LIMIT 1 OFFSET 1','OFFSET 1 saute la première ligne (la plus élevée).','SELECT DISTINCT taux_couverture AS deuxieme_taux FROM vaccinations ORDER BY taux_couverture DESC LIMIT 1 OFFSET 1;']},
   {task:'Trouvez le nombre de cas liés du <b>3ème foyer le plus important</b> (utilisez LIMIT + OFFSET).',
    hints:['SELECT DISTINCT nb_cas_lies FROM foyers ORDER BY nb_cas_lies DESC','LIMIT 1 OFFSET 2 pour la 3ème valeur','SELECT DISTINCT nb_cas_lies AS troisieme_taille FROM foyers ORDER BY nb_cas_lies DESC LIMIT 1 OFFSET 2;']},
  ]},

 {id:'e6',title:'26. UNION / UNION ALL – Combiner des résultats',hot:true,
  desc:'Fusionner les résultats de plusieurs requêtes. Question classique d\'entretien.',
  concept:`<span class="cm">-- UNION : fusionne et dédoublonne</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">zones</span>
<span class="kw">UNION</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">maladies</span>;

<span class="cm">-- UNION ALL : fusionne SANS dédoublonner (plus rapide)</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">zones</span>
<span class="kw">UNION ALL</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">maladies</span>;

<span class="cm">-- Règle : même nombre de colonnes, mêmes types</span>`,
  exercises:[
   {task:'Combinez avec <b>UNION</b> la liste des noms de zones et la liste des noms de maladies en une seule colonne <b>nom</b>.',
    hints:['UNION dédoublonne automatiquement les noms identiques.','Les deux SELECT doivent retourner le même nombre de colonnes.','SELECT nom FROM zones UNION SELECT nom FROM maladies;']},
   {task:'Combinez avec <b>UNION ALL</b> les noms de zones et de maladies (sans dédoublonner). Combien de lignes obtenez-vous ?',
    hints:['UNION ALL conserve tous les doublons — le résultat a 11 lignes (6 + 5).','SELECT nom FROM zones UNION ALL SELECT nom FROM maladies;','SELECT nom FROM zones UNION ALL SELECT nom FROM maladies;']},
   {task:'Créez une liste combinée avec une colonne <b>type_entite</b> : "Zone" pour les zones, "Maladie" pour les maladies.',
    hints:['SELECT nom, \'Zone\' AS type_entite FROM zones','UNION SELECT nom, \'Maladie\' AS type_entite FROM maladies','SELECT nom, \'Zone\' AS type_entite FROM zones UNION SELECT nom, \'Maladie\' AS type_entite FROM maladies ORDER BY type_entite;']},
  ]},

 {id:'e7',title:'27. EXISTS / NOT EXISTS – Sous-requête d\'existence',hot:true,
  desc:'Tester l\'existence de lignes dans une sous-requête. Très demandé en entretien senior.',
  concept:`<span class="cm">-- EXISTS : vrai si la sous-requête retourne au moins 1 ligne</span>
<span class="kw">SELECT</span> z.nom
<span class="kw">FROM</span> <span class="tbl">zones</span> z
<span class="kw">WHERE</span> <span class="fn">EXISTS</span> (
  <span class="kw">SELECT</span> <span class="num">1</span> <span class="kw">FROM</span> <span class="tbl">cas</span> c
  <span class="kw">WHERE</span> c.id_zone = z.id_zone
);

<span class="cm">-- NOT EXISTS : zones SANS vaccination</span>
<span class="kw">WHERE</span> <span class="kw">NOT</span> <span class="fn">EXISTS</span> (...)`,
  exercises:[
   {task:'Listez les zones qui <b>ont au moins un cas</b> déclaré (utilisez EXISTS).',
    hints:['WHERE EXISTS (SELECT 1 FROM cas c WHERE c.id_zone = z.id_zone)','SELECT z.nom FROM zones z WHERE EXISTS (...);','SELECT z.nom FROM zones z WHERE EXISTS (SELECT 1 FROM cas c WHERE c.id_zone = z.id_zone);']},
   {task:'Listez les zones qui <b>n\'ont aucune vaccination</b> enregistrée (utilisez NOT EXISTS).',
    hints:['WHERE NOT EXISTS (SELECT 1 FROM vaccinations v WHERE v.id_zone = z.id_zone)','SELECT z.nom FROM zones z','SELECT z.nom FROM zones z WHERE NOT EXISTS (SELECT 1 FROM vaccinations v WHERE v.id_zone = z.id_zone);']},
   {task:'Listez les maladies qui <b>ont au moins un cas</b> enregistré (utilisez EXISTS).',
    hints:['WHERE EXISTS (SELECT 1 FROM cas c WHERE c.id_maladie = m.id_maladie)','SELECT m.nom, m.type FROM maladies m','SELECT m.nom, m.type FROM maladies m WHERE EXISTS (SELECT 1 FROM cas c WHERE c.id_maladie = m.id_maladie);']},
  ]},

 {id:'e8',title:'28. Fonctions de chaînes – UPPER, LOWER, LENGTH, SUBSTRING',hot:true,
  desc:'Manipuler du texte en SQL. Incontournable pour le nettoyage et la transformation de données.',
  concept:`<span class="fn">UPPER</span>(nom)        <span class="cm">→ 'ZONE NORD'</span>
<span class="fn">LOWER</span>(type)        <span class="cm">→ 'virale'</span>
<span class="fn">LENGTH</span>(nom)       <span class="cm">→ 9</span>
<span class="fn">SUBSTRING</span>(nom, 1, 4) <span class="cm">→ 'Zone'</span>`,
  exercises:[
   {task:'Affichez le <b>type en majuscules</b> et la <b>longueur du nom</b> pour chaque maladie.',
    hints:['UPPER(type) AS type_maj, LENGTH(nom) AS longueur_nom','Deux fonctions dans le même SELECT.','SELECT nom, UPPER(type) AS type_maj, LENGTH(nom) AS longueur_nom FROM maladies;']},
   {task:'Affichez la <b>region en minuscules</b> et la <b>longueur du nom</b> de chaque zone.',
    hints:['LOWER(region) AS region_min, LENGTH(nom) AS longueur_nom','Deux fonctions appliquées sur la table zones.','SELECT nom, LOWER(region) AS region_min, LENGTH(nom) AS longueur_nom FROM zones;']},
   {task:'Affichez les <b>4 premiers caractères du nom</b> de chaque zone avec SUBSTRING.',
    hints:['SUBSTRING(nom, 1, 4) AS debut_nom — position 1, longueur 4','SUBSTRING(chaîne, position_départ, longueur)','SELECT nom, SUBSTRING(nom, 1, 4) AS debut_nom FROM zones;']},
  ]},

 {id:'e9',title:'29. CONCAT & Concaténation',hot:false,
  desc:'Assembler des chaînes. Utilisé pour construire des noms complets, des libellés, des clés.',
  concept:`<span class="cm">-- Avec CONCAT() :</span>
<span class="fn">CONCAT</span>(gravite, <span class="str">' - '</span>, sexe) <span class="kw">AS</span> fiche

<span class="cm">-- Avec l'opérateur || (standard SQL) :</span>
gravite || <span class="str">' - '</span> || sexe <span class="kw">AS</span> fiche`,
  exercises:[
   {task:'Affichez une <b>fiche</b> pour chaque cas au format : <b>"gravite - sexe"</b>.',
    hints:['CONCAT(gravite, \' - \', sexe) AS fiche','Exemple attendu : "Sévère - F"','SELECT CONCAT(gravite, \' - \', sexe) AS fiche FROM cas;']},
   {task:'Affichez une colonne <b>fiche</b> pour chaque zone au format : <b>"nom - region"</b>.',
    hints:['CONCAT(nom, \' - \', region) AS fiche','Exemple attendu : "Zone Nord - Hauts-de-France"','SELECT CONCAT(nom, \' - \', region) AS fiche FROM zones;']},
   {task:'Affichez une colonne <b>libelle</b> au format : <b>"nom (type)"</b> pour chaque maladie.',
    hints:['CONCAT(nom, \' (\', type, \')\') AS libelle','Exemple attendu : "Grippe (Virale)"','SELECT CONCAT(nom, \' (\', type, \')\') AS libelle FROM maladies;']},
  ]},

 {id:'e13',title:'33. CREATE VIEW – Créer une vue',hot:true,
  desc:'Les vues simplifient les requêtes complexes et sécurisent l\'accès aux données.',
  concept:`<span class="cm">-- Créer une vue (table virtuelle) :</span>
<span class="kw">CREATE VIEW</span> vue_cas_graves <span class="kw">AS</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">cas</span>
<span class="kw">WHERE</span> gravite = <span class="str">'Sévère'</span>;

<span class="cm">-- Utiliser la vue comme une table :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> vue_cas_graves;

<span class="cm">-- Supprimer la vue :</span>
<span class="kw">DROP VIEW</span> vue_cas_graves;`,
  exercises:[
   {task:'Créez une vue <b>vue_cas_graves</b> contenant les cas de gravité Sévère, puis faites un SELECT dessus.',
    hints:['CREATE VIEW vue_cas_graves AS SELECT * FROM cas WHERE gravite = \'Sévère\';','Ensuite : SELECT * FROM vue_cas_graves;','Une vue se comporte comme une table dans les requêtes suivantes.','CREATE VIEW vue_cas_graves AS SELECT * FROM cas WHERE gravite = \'Sévère\'; SELECT * FROM vue_cas_graves;']},
   {task:'Créez une vue <b>vue_foyers_actifs</b> (date_fin IS NULL), puis listez l\'id_zone et le nb_cas_lies de cette vue.',
    hints:['CREATE VIEW vue_foyers_actifs AS SELECT * FROM foyers WHERE date_fin IS NULL;','Ensuite : SELECT id_zone, nb_cas_lies FROM vue_foyers_actifs;','CREATE VIEW vue_foyers_actifs AS SELECT * FROM foyers WHERE date_fin IS NULL; SELECT id_zone, nb_cas_lies FROM vue_foyers_actifs;']},
   {task:'Créez une vue <b>vue_zones_maladies</b> joignant zones, cas et maladies (nom zone, nom maladie, gravite), puis sélectionnez-la.',
    hints:['CREATE VIEW vue_zones_maladies AS SELECT z.nom AS zone, m.nom AS maladie, c.gravite FROM zones z JOIN cas c ON z.id_zone = c.id_zone JOIN maladies m ON c.id_maladie = m.id_maladie;','Ensuite : SELECT * FROM vue_zones_maladies;','CREATE VIEW vue_zones_maladies AS SELECT z.nom AS zone, m.nom AS maladie, c.gravite FROM zones z JOIN cas c ON z.id_zone = c.id_zone JOIN maladies m ON c.id_maladie = m.id_maladie; SELECT * FROM vue_zones_maladies;']},
  ]},

 {id:'e15',title:'35. DENSE_RANK() & NTILE()',hot:true,
  desc:'Fonctions fenêtre avancées. DENSE_RANK évite les "sauts" de rang, NTILE divise en groupes.',
  concept:`<span class="cm">-- DENSE_RANK : pas de saut si ex-aequo</span>
<span class="fn">DENSE_RANK</span>() <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> age_patient <span class="kw">DESC</span>)

<span class="cm">-- NTILE(n) : divise en n groupes égaux</span>
<span class="fn">NTILE</span>(<span class="num">3</span>) <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> age_patient) <span class="kw">AS</span> groupe`,
  exercises:[
   {task:'Divisez les cas en <b>3 groupes d\'âge</b> (NTILE) et affichez aussi leur DENSE_RANK par âge décroissant.',
    hints:['NTILE(3) OVER (ORDER BY age_patient) AS groupe_age','DENSE_RANK() OVER (ORDER BY age_patient DESC) AS rang_age','SELECT id_cas, age_patient, DENSE_RANK() OVER (ORDER BY age_patient DESC) AS rang, NTILE(3) OVER (ORDER BY age_patient) AS groupe FROM cas;']},
   {task:'Divisez les vaccinations en <b>4 quartiles</b> par taux_couverture croissant (NTILE(4)). Affichez id_zone, mois, taux_couverture et quartile.',
    hints:['NTILE(4) OVER (ORDER BY taux_couverture) AS quartile','NTILE(4) crée 4 groupes de taille égale (ou quasi-égale).','SELECT id_zone, mois, taux_couverture, NTILE(4) OVER (ORDER BY taux_couverture) AS quartile FROM vaccinations;']},
   {task:'Classez les zones par population décroissante avec <b>DENSE_RANK</b>. Affichez nom, population et rang, ordonné par rang.',
    hints:['DENSE_RANK() OVER (ORDER BY population DESC) AS rang','DENSE_RANK ne laisse pas de trous dans la numérotation, contrairement à RANK.','SELECT nom, population, DENSE_RANK() OVER (ORDER BY population DESC) AS rang FROM zones ORDER BY rang;']},
  ]},

 {id:'e16',title:'36. FIRST_VALUE() & LAST_VALUE()',hot:false,
  desc:'Récupérer la première ou dernière valeur d\'une partition. Utile pour les analyses comparatives.',
  concept:`<span class="fn">FIRST_VALUE</span>(col) <span class="kw">OVER</span> (
  <span class="kw">PARTITION BY</span> id_zone
  <span class="kw">ORDER BY</span> col
) <span class="kw">AS</span> valeur_min_du_groupe`,
  exercises:[
   {task:'Pour chaque cas, affichez l\'<b>âge minimal</b> de sa zone via FIRST_VALUE.',
    hints:['FIRST_VALUE(age_patient) OVER (PARTITION BY id_zone ORDER BY age_patient) AS age_min_zone','SELECT id_zone, id_cas, age_patient, FIRST_VALUE(...) OVER (...) AS age_min_zone','SELECT id_zone, id_cas, age_patient, FIRST_VALUE(age_patient) OVER (PARTITION BY id_zone ORDER BY age_patient) AS age_min_zone FROM cas ORDER BY id_zone;']},
   {task:'Pour chaque vaccination, affichez le <b>taux_couverture minimal</b> de cette zone via FIRST_VALUE.',
    hints:['FIRST_VALUE(taux_couverture) OVER (PARTITION BY id_zone ORDER BY taux_couverture) AS taux_min_zone','SELECT id_zone, mois, taux_couverture, FIRST_VALUE(...) OVER (...) AS taux_min_zone','SELECT id_zone, mois, taux_couverture, FIRST_VALUE(taux_couverture) OVER (PARTITION BY id_zone ORDER BY taux_couverture) AS taux_min_zone FROM vaccinations ORDER BY id_zone;']},
   {task:'Pour chaque foyer, affichez le <b>nb_cas_lies minimal</b> de cette zone via FIRST_VALUE.',
    hints:['FIRST_VALUE(nb_cas_lies) OVER (PARTITION BY id_zone ORDER BY nb_cas_lies) AS cas_min_zone','SELECT id_zone, id_foyer, nb_cas_lies, FIRST_VALUE(...) OVER (...) AS cas_min_zone','SELECT id_zone, id_foyer, nb_cas_lies, FIRST_VALUE(nb_cas_lies) OVER (PARTITION BY id_zone ORDER BY nb_cas_lies) AS cas_min_zone FROM foyers ORDER BY id_zone;']},
  ]},

 {id:'e17',title:'37. VARIANCE & STDDEV – Statistiques',hot:false,
  desc:'Mesurer la dispersion des données. Demandé dans les postes data science et analyse avancée.',
  concept:`<span class="kw">SELECT</span>
  <span class="fn">AVG</span>(age_patient)      <span class="kw">AS</span> moyenne,
  <span class="fn">VARIANCE</span>(age_patient) <span class="kw">AS</span> variance,
  <span class="fn">STDDEV</span>(age_patient)   <span class="kw">AS</span> ecart_type
<span class="kw">FROM</span> <span class="tbl">cas</span>;`,
  exercises:[
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> de l\'âge des patients.',
    hints:['SELECT AVG(age_patient), VARIANCE(age_patient), STDDEV(age_patient) FROM cas;','Utilisez des alias pour chaque colonne.','SELECT AVG(age_patient) AS moyenne, VARIANCE(age_patient) AS variance, STDDEV(age_patient) AS ecart_type FROM cas;']},
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> des taux de couverture vaccinale.',
    hints:['AVG(taux_couverture), VARIANCE(taux_couverture), STDDEV(taux_couverture) FROM vaccinations','SELECT AVG(taux_couverture) AS moy, VARIANCE(taux_couverture) AS variance, STDDEV(taux_couverture) AS ecart_type','SELECT AVG(taux_couverture) AS moy, VARIANCE(taux_couverture) AS variance, STDDEV(taux_couverture) AS ecart_type FROM vaccinations;']},
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> de la population des zones.',
    hints:['AVG(population), VARIANCE(population), STDDEV(population) FROM zones','SELECT AVG(population) AS moy, VARIANCE(population) AS variance, STDDEV(population) AS ecart_type','SELECT AVG(population) AS moy, VARIANCE(population) AS variance, STDDEV(population) AS ecart_type FROM zones;']},
  ]},

 {id:'e18',title:'38. PERCENT_RANK() – Rang en pourcentage',hot:false,
  desc:'Calculer la position relative d\'une ligne (entre 0 et 1). Utile pour les percentiles.',
  concept:`<span class="fn">PERCENT_RANK</span>() <span class="kw">OVER</span> (
  <span class="kw">ORDER BY</span> age_patient
) <span class="kw">AS</span> percentile

<span class="cm">-- 0 = valeur la plus basse</span>
<span class="cm">-- 1 = valeur la plus haute</span>`,
  exercises:[
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque cas par âge croissant.',
    hints:['PERCENT_RANK() OVER (ORDER BY age_patient) AS percentile','La valeur va de 0 (le plus jeune) à 1 (le plus âgé).','SELECT id_cas, age_patient, PERCENT_RANK() OVER (ORDER BY age_patient) AS percentile FROM cas;']},
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque zone par population croissante.',
    hints:['PERCENT_RANK() OVER (ORDER BY population) AS percentile_pop','0 = la moins peuplée, 1 = la plus peuplée.','SELECT nom, population, PERCENT_RANK() OVER (ORDER BY population) AS percentile_pop FROM zones;']},
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque vaccination par taux_couverture croissant.',
    hints:['PERCENT_RANK() OVER (ORDER BY taux_couverture) AS percentile_taux','0 = le taux le plus bas, 1 = le taux le plus haut.','SELECT id_zone, mois, taux_couverture, PERCENT_RANK() OVER (ORDER BY taux_couverture) AS percentile_taux FROM vaccinations;']},
  ]},

 {id:'e19',title:'39. Requête récapitulative complexe',hot:true,
  desc:'Combinaison de plusieurs techniques : JOIN + GROUP BY + HAVING + ORDER BY. Type examen final.',
  concept:`<span class="kw">SELECT</span> z.nom,
       <span class="fn">COUNT</span>(c.id_cas) <span class="kw">AS</span> nb_cas,
       <span class="fn">AVG</span>(c.age_patient) <span class="kw">AS</span> age_moyen
<span class="kw">FROM</span> <span class="tbl">zones</span> z
<span class="kw">JOIN</span> <span class="tbl">cas</span> c <span class="kw">ON</span> z.id_zone = c.id_zone
<span class="kw">GROUP BY</span> z.nom
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) >= <span class="num">2</span>
<span class="kw">ORDER BY</span> nb_cas <span class="kw">DESC</span>;`,
  exercises:[
   {task:'Pour chaque zone ayant <b>au moins 2 cas</b> : nom, nombre de cas, âge moyen et nombre d\'hospitalisations. Triez par nombre de cas décroissant.',
    hints:['JOIN cas c ON z.id_zone = c.id_zone','GROUP BY z.nom HAVING COUNT(*) >= 2','SELECT z.nom, COUNT(c.id_cas) AS nb_cas, AVG(c.age_patient) AS age_moyen, SUM(c.hospitalise) AS nb_hospitalises FROM zones z JOIN cas c ON z.id_zone = c.id_zone GROUP BY z.nom HAVING COUNT(*) >= 2 ORDER BY nb_cas DESC;']},
   {task:'Par maladie, affichez le <b>nombre de zones distinctes touchées</b> et le <b>total de cas</b>. Triez par nombre de zones décroissant.',
    hints:['JOIN maladies m avec cas c ON m.id_maladie = c.id_maladie','GROUP BY m.nom, COUNT(DISTINCT c.id_zone) AS nb_zones, COUNT(*) AS total_cas','SELECT m.nom AS maladie, COUNT(DISTINCT c.id_zone) AS nb_zones, COUNT(*) AS total_cas FROM maladies m JOIN cas c ON m.id_maladie = c.id_maladie GROUP BY m.nom ORDER BY nb_zones DESC;']},
   {task:'Pour chaque zone ayant <b>au moins 1 vaccination</b> enregistrée : nom, nombre de vaccinations, total des doses. Triez par total décroissant.',
    hints:['JOIN zones z avec vaccinations v ON z.id_zone = v.id_zone','GROUP BY z.nom HAVING COUNT(v.id_vaccination) >= 1','SELECT z.nom, COUNT(v.id_vaccination) AS nb_vaccinations, SUM(v.nb_doses_administrees) AS total_doses FROM zones z JOIN vaccinations v ON z.id_zone = v.id_zone GROUP BY z.nom HAVING COUNT(v.id_vaccination) >= 1 ORDER BY total_doses DESC;']},
  ]},

 {id:'e20',title:'40. Pivot manuel avec CASE WHEN',hot:true,
  desc:'"Pivoter" des lignes en colonnes : question avancée très fréquente dans les postes BI/reporting.',
  concept:`<span class="cm">-- Transformer des valeurs en colonnes :</span>
<span class="kw">SELECT</span>
  <span class="fn">COUNT</span>(<span class="kw">CASE</span> <span class="kw">WHEN</span> gravite=<span class="str">'Léger'</span> <span class="kw">THEN</span> <span class="num">1</span> <span class="kw">END</span>) <span class="kw">AS</span> nb_legers,
  <span class="fn">COUNT</span>(<span class="kw">CASE</span> <span class="kw">WHEN</span> gravite=<span class="str">'Sévère'</span> <span class="kw">THEN</span> <span class="num">1</span> <span class="kw">END</span>) <span class="kw">AS</span> nb_severes
<span class="kw">FROM</span> <span class="tbl">cas</span>;

<span class="cm">-- Idée : COUNT ne compte que les valeurs non-NULL</span>`,
  exercises:[
   {task:'Créez un tableau croisé montrant, <b>par zone</b> (id_zone), le nombre de cas <b>Légers</b> et <b>Sévères</b>.',
    hints:['SELECT id_zone, COUNT(CASE WHEN gravite=\'Léger\' THEN 1 END) AS nb_legers, COUNT(CASE WHEN gravite=\'Sévère\' THEN 1 END) AS nb_severes','FROM cas GROUP BY id_zone','SELECT id_zone, COUNT(CASE WHEN gravite=\'Léger\' THEN 1 END) AS nb_legers, COUNT(CASE WHEN gravite=\'Sévère\' THEN 1 END) AS nb_severes FROM cas GROUP BY id_zone ORDER BY id_zone;']},
   {task:'Pour chaque maladie (id_maladie), comptez les cas <b>hospitalisés</b> et <b>non hospitalisés</b> (colonnes nb_hospitalises et nb_ambulatoires).',
    hints:['SUM(CASE WHEN hospitalise = 1 THEN 1 ELSE 0 END) AS nb_hospitalises','SUM(CASE WHEN hospitalise = 0 THEN 1 ELSE 0 END) AS nb_ambulatoires','SELECT id_maladie, SUM(CASE WHEN hospitalise = 1 THEN 1 ELSE 0 END) AS nb_hospitalises, SUM(CASE WHEN hospitalise = 0 THEN 1 ELSE 0 END) AS nb_ambulatoires FROM cas GROUP BY id_maladie;']},
   {task:'Affichez en une seule ligne le <b>nombre total de doses</b> administrées en <b>octobre</b> et en <b>novembre</b> (colonnes doses_octobre et doses_novembre).',
    hints:['SUM(CASE WHEN mois=\'2024-10-01\' THEN nb_doses_administrees END) AS doses_octobre','SUM(CASE WHEN mois=\'2024-11-01\' THEN nb_doses_administrees END) AS doses_novembre','SELECT SUM(CASE WHEN mois=\'2024-10-01\' THEN nb_doses_administrees END) AS doses_octobre, SUM(CASE WHEN mois=\'2024-11-01\' THEN nb_doses_administrees END) AS doses_novembre FROM vaccinations;']},
  ]},

 {id:'e21',title:'41. INTERSECT / EXCEPT – Intersection et exclusion',hot:true,
  desc:'Compléments de UNION : trouver des lignes communes ou absentes entre deux requêtes.',
  concept:`<span class="cm">-- INTERSECT : lignes présentes dans LES DEUX requêtes</span>
<span class="kw">SELECT</span> id_zone <span class="kw">FROM</span> <span class="tbl">cas</span> <span class="kw">WHERE</span> gravite = <span class="str">'Sévère'</span>
<span class="kw">INTERSECT</span>
<span class="kw">SELECT</span> id_zone <span class="kw">FROM</span> <span class="tbl">foyers</span> <span class="kw">WHERE</span> date_fin <span class="kw">IS NULL</span>;

<span class="cm">-- EXCEPT : lignes dans la 1ère mais PAS dans la 2ème</span>
<span class="kw">SELECT</span> id_zone <span class="kw">FROM</span> <span class="tbl">foyers</span>
<span class="kw">EXCEPT</span>
<span class="kw">SELECT</span> id_zone <span class="kw">FROM</span> <span class="tbl">vaccinations</span> <span class="kw">WHERE</span> id_maladie = <span class="num">2</span> <span class="kw">AND</span> mois = <span class="str">'2024-10-01'</span>;
<span class="cm">-- Règle : même nombre de colonnes et mêmes types</span>`,
  exercises:[
   {task:'Trouvez les <b>id_zone</b> ayant à la fois un <b>cas Sévère</b> ET un <b>foyer actif</b> (date_fin IS NULL) — utilisez INTERSECT.',
    hints:['SELECT id_zone FROM cas WHERE gravite = \'Sévère\'','INTERSECT','SELECT id_zone FROM cas WHERE gravite = \'Sévère\' INTERSECT SELECT id_zone FROM foyers WHERE date_fin IS NULL;']},
   {task:'Trouvez les <b>id_zone</b> ayant un <b>foyer</b> mais <b>aucune vaccination contre la maladie 2 en octobre 2024</b> (utilisez EXCEPT).',
    hints:['SELECT id_zone FROM foyers','EXCEPT SELECT id_zone FROM vaccinations WHERE id_maladie = 2 AND mois = \'2024-10-01\'','SELECT id_zone FROM foyers EXCEPT SELECT id_zone FROM vaccinations WHERE id_maladie = 2 AND mois = \'2024-10-01\';']},
   {task:'Trouvez les <b>id_zone</b> ayant déclaré un cas de <b>Tuberculose</b> (id_maladie = 4) mais <b>sans foyer de Tuberculose</b> enregistré (utilisez EXCEPT).',
    hints:['SELECT id_zone FROM cas WHERE id_maladie = 4','EXCEPT SELECT id_zone FROM foyers WHERE id_maladie = 4','SELECT id_zone FROM cas WHERE id_maladie = 4 EXCEPT SELECT id_zone FROM foyers WHERE id_maladie = 4;']},
  ]},

 {id:'e22',title:'42. NOW, DATEDIFF, DATE_FORMAT – Dates avancées',hot:true,
  desc:'Calculer des durées et reformater des dates : essentiel pour les rapports temporels.',
  concept:`<span class="cm">-- Date et heure actuelles :</span>
<span class="fn">NOW</span>()      <span class="cm">→ '2026-06-22 10:30:00'</span>
<span class="fn">CURDATE</span>()  <span class="cm">→ '2026-06-22'</span>

<span class="cm">-- Différence en jours :</span>
<span class="fn">DATEDIFF</span>(date_gueri, date_declaration)  <span class="cm">→ nombre de jours</span>

<span class="cm">-- Reformater une date :</span>
<span class="fn">DATE_FORMAT</span>(mois, <span class="str">'%m/%Y'</span>)  <span class="cm">→ '10/2024'</span>`,
  exercises:[
   {task:'Affichez la <b>date et heure actuelles</b> avec NOW() dans une colonne <b>maintenant</b>, et la date du jour avec CURDATE() dans <b>aujourd_hui</b>.',
    hints:['SELECT NOW() AS maintenant, CURDATE() AS aujourd_hui;','Pas besoin de FROM — c\'est une requête sur des valeurs constantes.','SELECT NOW() AS maintenant, CURDATE() AS aujourd_hui;']},
   {task:'Pour les cas guéris (date_gueri renseignée), affichez la <b>durée de la maladie en jours</b> avec DATEDIFF.',
    hints:['DATEDIFF(date_gueri, date_declaration) AS duree_jours','SELECT id_cas, date_declaration, date_gueri, DATEDIFF(date_gueri, date_declaration) AS duree_jours FROM cas WHERE date_gueri IS NOT NULL;','SELECT id_cas, date_declaration, date_gueri, DATEDIFF(date_gueri, date_declaration) AS duree_jours FROM cas WHERE date_gueri IS NOT NULL;']},
   {task:'Formatez le <b>mois</b> de chaque vaccination au format <b>\'%m/%Y\'</b> dans une colonne <b>mois_fr</b>.',
    hints:['DATE_FORMAT(mois, \'%m/%Y\') AS mois_fr','%m = mois à 2 chiffres, %Y = année à 4 chiffres.','SELECT id_zone, DATE_FORMAT(mois, \'%m/%Y\') AS mois_fr FROM vaccinations;']},
  ]},

 {id:'e23',title:'43. TRIM, REPLACE, LEFT, RIGHT – Nettoyage de chaînes',hot:true,
  desc:'Fonctions essentielles pour nettoyer et transformer des données textuelles brutes.',
  concept:`<span class="cm">-- Supprimer les espaces :</span>
<span class="fn">TRIM</span>(nom)          <span class="cm">→ 'Zone Nord' (sans espaces)</span>

<span class="cm">-- Remplacer du texte :</span>
<span class="fn">REPLACE</span>(col, <span class="str">'ancien'</span>, <span class="str">'nouveau'</span>)

<span class="cm">-- Extraire les N premiers / derniers caractères :</span>
<span class="fn">LEFT</span>(nom, <span class="num">4</span>)     <span class="cm">→ 'Zone' (4 premiers)</span>
<span class="fn">RIGHT</span>(region, <span class="num">4</span>)   <span class="cm">→ 'ance' (4 derniers)</span>`,
  exercises:[
   {task:'Nettoyez les noms de zones : affichez le nom avec <b>TRIM</b> et la <b>première lettre</b> avec LEFT(nom, 1) dans une colonne <b>initiale</b>.',
    hints:['TRIM(nom) AS nom_propre, LEFT(nom, 1) AS initiale','LEFT(col, n) retourne les n premiers caractères de gauche.','SELECT TRIM(nom) AS nom_propre, LEFT(nom, 1) AS initiale FROM zones;']},
   {task:'Dans les maladies, <b>remplacez</b> "COVID-19" par "Covid" avec REPLACE. Affichez nom et nom_court.',
    hints:['REPLACE(nom, \'COVID-19\', \'Covid\') AS nom_court','REPLACE(colonne, ancien, nouveau)','SELECT nom, REPLACE(nom, \'COVID-19\', \'Covid\') AS nom_court FROM maladies;']},
   {task:'Affichez les <b>4 premiers caractères du nom</b> de chaque zone avec LEFT et les <b>4 derniers caractères de la région</b> avec RIGHT.',
    hints:['LEFT(nom, 4) AS nom_abr, RIGHT(region, 4) AS fin_region','Exemple : LEFT(\'Zone Nord\', 4) = \'Zone\', RIGHT(\'PACA\', 4) = \'PACA\'','SELECT nom, LEFT(nom, 4) AS nom_abr, region, RIGHT(region, 4) AS fin_region FROM zones;']},
  ]},
] };

const SCHEMA_DEF_EPI = [
  {name:'zones',rows:[{c:'id_zone',t:'INTEGER',n:'PK'},{c:'nom',t:'TEXT',n:''},{c:'region',t:'TEXT',n:''},{c:'population',t:'INTEGER',n:''}]},
  {name:'maladies',rows:[{c:'id_maladie',t:'INTEGER',n:'PK'},{c:'nom',t:'TEXT',n:''},{c:'type',t:'TEXT',n:"'Virale'/'Bactérienne'"},{c:'periode_incubation_jours',t:'INTEGER',n:''}]},
  {name:'cas',rows:[{c:'id_cas',t:'INTEGER',n:'PK'},{c:'id_zone',t:'INTEGER',n:'FK'},{c:'id_maladie',t:'INTEGER',n:'FK'},{c:'date_declaration',t:'TEXT',n:''},{c:'age_patient',t:'INTEGER',n:''},{c:'sexe',t:'TEXT',n:"'M'/'F'"},{c:'gravite',t:'TEXT',n:"'Léger'/'Modéré'/'Sévère'"},{c:'hospitalise',t:'INTEGER',n:'0/1'},{c:'date_gueri',t:'TEXT',n:'NULL=non guéri'}]},
  {name:'foyers',rows:[{c:'id_foyer',t:'INTEGER',n:'PK'},{c:'id_zone',t:'INTEGER',n:'FK'},{c:'id_maladie',t:'INTEGER',n:'FK'},{c:'date_debut',t:'TEXT',n:''},{c:'date_fin',t:'TEXT',n:'NULL=actif'},{c:'nb_cas_lies',t:'INTEGER',n:''}]},
  {name:'vaccinations',rows:[{c:'id_vaccination',t:'INTEGER',n:'PK'},{c:'id_zone',t:'INTEGER',n:'FK'},{c:'id_maladie',t:'INTEGER',n:'FK'},{c:'mois',t:'TEXT',n:'1er du mois'},{c:'nb_doses_administrees',t:'INTEGER',n:''},{c:'taux_couverture',t:'REAL',n:'%'}]},
];

DOMAINS['sante-epi'] = { meta: DOMAIN_META_EPI, sqlInit: SQL_INIT_EPI, skillMap: SKILL_MAP_EPI, cur: CUR_EPI, schemaDef: SCHEMA_DEF_EPI };
