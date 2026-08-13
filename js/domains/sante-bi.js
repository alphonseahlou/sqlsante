// Domaine : BI Santé (pilotage d'un réseau d'établissements).
// Ce fichier est auto-suffisant : données SQL, leçons, schéma, compétences.
// Curriculum centré sur les compétences data analyst/BI : jointures, agrégation,
// fenêtrage, CTE, CASE — le DML/DDL pur (INSERT/UPDATE/DELETE/CREATE TABLE) est
// volontairement absent, hors du périmètre d'un rôle d'analyse.
// Chargement : index.html → sante-bi.js → db.js → app.js

if (!window.DOMAINS) window.DOMAINS = {};

const DOMAIN_META_BI = {
  id: 'sante-bi',
  name: 'BI Santé',
  icon: '📊',
  description: 'Établissements, services, personnel, indicateurs mensuels, budgets'
};

// Données SQL injectées dans SQLite au démarrage.
const SQL_INIT_BI = `
CREATE TABLE etablissements (
  id_etablissement INTEGER, nom TEXT, ville TEXT, region TEXT, type TEXT, nb_lits INTEGER
);
INSERT INTO etablissements VALUES
  (1,'CHU Centre','Paris','Île-de-France','CHU',850),
  (2,'Clinique Nord','Lille','Hauts-de-France','Clinique',220),
  (3,'CHR Sud','Marseille','PACA','CHR',600),
  (4,'Clinique Ouest','Rennes','Bretagne','Clinique',150);

CREATE TABLE services (
  id_service INTEGER, id_etablissement INTEGER, nom_service TEXT, specialite TEXT, nb_lits_service INTEGER
);
INSERT INTO services VALUES
  (1,1,'Cardiologie','Cardiologie',60),
  (2,1,'Neurologie','Neurologie',45),
  (3,1,'Urgences','Médecine d''urgence',30),
  (4,2,'Maternité','Gynécologie-Obstétrique',25),
  (5,2,'Chirurgie','Chirurgie générale',35),
  (6,2,'Pédiatrie','Pédiatrie',20),
  (7,3,'Oncologie','Oncologie',50),
  (8,3,'Gériatrie','Gériatrie',70),
  (9,3,'Radiologie','Imagerie médicale',15);

CREATE TABLE personnel (
  id_personnel INTEGER, id_service INTEGER, nom TEXT, poste TEXT,
  etp REAL, salaire_mensuel INTEGER, date_embauche TEXT, date_depart TEXT
);
INSERT INTO personnel VALUES
  (1,1,'Dr. Lemoine','Médecin',1.0,8800,'2015-03-01',NULL),
  (2,1,'Nadia Cherif','Infirmier',0.8,2600,'2019-09-10',NULL),
  (3,1,'Léa Roy','Infirmier',1.0,2550,'2021-01-15',NULL),
  (4,2,'Dr. Faure','Médecin',1.0,8200,'2017-06-01',NULL),
  (5,2,'Karim Benali','Infirmier',1.0,2500,'2020-02-20',NULL),
  (6,3,'Dr. Roussel','Médecin',1.0,8500,'2016-11-01',NULL),
  (7,3,'Julie Marchand','Infirmier',1.0,2550,'2018-04-05',NULL),
  (8,3,'Tom Faye','Infirmier',1.0,2500,'2019-07-12','2024-10-15'),
  (9,3,'Nora Aziz','Aide-soignant',0.9,2150,'2022-03-01',NULL),
  (10,4,'Dr. Picard','Médecin',1.0,8000,'2014-09-01',NULL),
  (11,4,'Sandra Lopez','Infirmier',0.9,2450,'2020-10-01',NULL),
  (12,5,'Dr. Vidal','Médecin',1.0,9100,'2013-05-01',NULL),
  (13,5,'Hugo Renard','Infirmier',1.0,2600,'2017-08-15',NULL),
  (14,5,'Eva Klein','Infirmier',0.8,2500,'2021-11-01',NULL),
  (15,6,'Dr. Aubert','Médecin',0.8,7900,'2018-01-10',NULL),
  (16,6,'Léa Dumas','Infirmier',1.0,2500,'2019-05-01',NULL),
  (17,7,'Dr. Mercier','Médecin',1.0,9500,'2012-02-01',NULL),
  (18,7,'Inès Bertrand','Infirmier',1.0,2700,'2016-09-01',NULL),
  (19,7,'Yanis Roche','Aide-soignant',1.0,2100,'2020-06-01',NULL),
  (20,8,'Dr. Rousseau','Médecin',0.9,7600,'2015-10-01',NULL),
  (21,8,'Paul Garnier','Aide-soignant',1.0,2100,'2018-03-15',NULL),
  (22,8,'Chloé Petit','Aide-soignant',0.8,2050,'2019-11-01','2024-09-30'),
  (23,9,'Dr. Caron','Médecin',0.7,8300,'2017-04-01',NULL),
  (24,9,'Manon Girard','Infirmier',0.6,2400,'2021-09-01',NULL);

CREATE TABLE indicateurs_mensuels (
  id_indicateur INTEGER, id_service INTEGER, mois TEXT,
  nb_admissions INTEGER, nb_sorties INTEGER, duree_moy_sejour REAL,
  taux_occupation REAL, cout_moyen_sejour REAL, satisfaction_score REAL
);
INSERT INTO indicateurs_mensuels VALUES
  (1,1,'2024-09-01',110,105,5.2,78.5,3200,7.8),
  (2,1,'2024-10-01',118,112,5.0,81.0,3150,7.9),
  (3,1,'2024-11-01',125,120,4.8,84.0,3100,8.1),
  (4,2,'2024-09-01',70,68,6.5,72.0,3800,7.5),
  (5,2,'2024-10-01',75,71,6.2,75.5,3750,7.6),
  (6,2,'2024-11-01',80,77,6.0,79.0,3700,7.7),
  (7,3,'2024-09-01',540,538,1.2,95.0,850,6.5),
  (8,3,'2024-10-01',565,560,1.3,97.5,870,6.3),
  (9,3,'2024-11-01',590,585,1.4,99.0,900,6.1),
  (10,4,'2024-09-01',95,94,3.5,68.0,2200,8.8),
  (11,4,'2024-10-01',102,100,3.4,71.0,2180,8.9),
  (12,4,'2024-11-01',98,97,3.6,70.0,2210,8.7),
  (13,5,'2024-09-01',130,126,4.1,80.0,4500,7.9),
  (14,5,'2024-10-01',135,130,4.3,83.5,4600,7.8),
  (15,5,'2024-11-01',140,137,4.0,85.0,4550,8.0),
  (16,6,'2024-09-01',88,86,2.8,65.0,1900,8.5),
  (17,6,'2024-10-01',92,90,2.7,68.0,1880,8.6),
  (18,6,'2024-11-01',85,84,2.9,64.0,1920,8.4),
  (19,7,'2024-09-01',60,55,7.5,88.0,6200,7.2),
  (20,7,'2024-10-01',63,59,7.8,90.5,6350,7.0),
  (21,7,'2024-11-01',65,61,8.0,92.0,6500,6.9),
  (22,8,'2024-09-01',45,40,9.5,91.0,2800,7.6),
  (23,8,'2024-10-01',48,42,9.8,93.5,2850,7.5),
  (24,8,'2024-11-01',50,44,10.0,95.0,2900,7.4),
  (25,9,'2024-10-01',22,22,0.4,60.0,360,NULL),
  (26,9,'2024-11-01',25,25,0.5,62.0,370,8.0);

CREATE TABLE budgets (
  id_budget INTEGER, id_service INTEGER, annee INTEGER, budget_prevu INTEGER, budget_reel INTEGER
);
INSERT INTO budgets VALUES
  (1,1,2023,4200000,4350000),
  (2,1,2024,4500000,4420000),
  (3,2,2023,3100000,3050000),
  (4,2,2024,3300000,3380000),
  (5,3,2023,2800000,2950000),
  (6,3,2024,3000000,3120000),
  (7,4,2023,1900000,1850000),
  (8,4,2024,2000000,1980000),
  (9,5,2023,3600000,3700000),
  (10,5,2024,3800000,3750000),
  (11,6,2023,1500000,1480000),
  (12,6,2024,1600000,1620000),
  (13,7,2023,5200000,5400000),
  (14,7,2024,5600000,5750000),
  (15,8,2023,2600000,2550000),
  (16,8,2024,2700000,2680000),
  (17,9,2023,900000,880000);
`;

// Cartographie des compétences SQL pour le graphique radar.
const SKILL_MAP_BI = {
  'SELECT & Filtres': ['d1','d2','d3','d4','d5','d6','d8','d9','i7'],
  'Jointures':        ['i1','i2','i6','a5','e7'],
  'Agrégation':       ['i3','i4','i5','a4','e17','e18'],
  'CTE / Sous-req.':  ['a1','a2','e4','e19'],
  'Fenêtrage':        ['e1','e2','e3','e15','e16'],
  'Vues / Reporting': ['e13'],
  'Chaînes & Dates':  ['d7','a6','a7','e8','e9','e22','e23'],
  'CASE & Ensembles': ['a3','e6','e20','e21'],
};

const CUR_BI = { d: [
 {id:'d1',title:'1. SELECT – Lire des données',hot:true,
  desc:'Commande fondamentale pour récupérer des données. Présente dans 100% des offres d\'emploi.',
  concept:`<span class="kw">SELECT</span> colonne1, colonne2 <span class="kw">FROM</span> table;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">services</span>;  <span class="cm">-- toutes les colonnes</span>
<span class="kw">SELECT</span> nom_service, specialite <span class="kw">FROM</span> <span class="tbl">services</span>;  <span class="cm">-- colonnes spécifiques</span>`,
  exercises:[
   {task:'Sélectionnez le <b>nom</b>, la <b>ville</b> et la <b>region</b> de tous les établissements.',
    hints:['SELECT col1, col2, col3 FROM table;','Colonnes : nom, ville, region','SELECT nom, ville, region FROM etablissements;']},
   {task:'Sélectionnez l\'<b>id_service</b>, le <b>nom_service</b> et la <b>specialite</b> de tous les services.',
    hints:['SELECT col1, col2, col3 FROM table;','La table s\'appelle services.','SELECT id_service, nom_service, specialite FROM services;']},
   {task:'Sélectionnez <b>toutes les colonnes</b> de la table <b>personnel</b>.',
    hints:['Utilisez * pour toutes les colonnes.','La table s\'appelle personnel.','SELECT * FROM personnel;']},
  ]},

 {id:'d2',title:'2. WHERE – Filtrer les lignes',hot:true,
  desc:'Filtrer les résultats selon des conditions. Indispensable dans tout rôle de données.',
  concept:`<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">services</span> <span class="kw">WHERE</span> specialite = <span class="str">'Cardiologie'</span>;
<span class="kw">WHERE</span> nb_lits_service > <span class="num">40</span>
<span class="kw">WHERE</span> poste != <span class="str">'Médecin'</span>
<span class="cm">-- Texte : guillemets simples. Nombres : sans guillemets.</span>`,
  exercises:[
   {task:'Listez tous les services de la spécialité <b>Cardiologie</b>.',
    hints:['Ajoutez WHERE après FROM.','La valeur est \'Cardiologie\' (avec guillemets simples).','SELECT * FROM services WHERE specialite = \'Cardiologie\';']},
   {task:'Listez tout le personnel ayant le poste <b>Médecin</b>.',
    hints:['WHERE poste = \'valeur\'','La table est personnel, la colonne poste.','SELECT * FROM personnel WHERE poste = \'Médecin\';']},
   {task:'Listez les indicateurs mensuels du mois <b>2024-11-01</b> (novembre).',
    hints:['WHERE mois = \'2024-11-01\'','Les dates sont stockées au format \'YYYY-MM-DD\'.','SELECT * FROM indicateurs_mensuels WHERE mois = \'2024-11-01\';']},
  ]},

 {id:'d3',title:'3. AND / OR / BETWEEN / IN',hot:true,
  desc:'Combiner des conditions. Très fréquent dans les tests techniques d\'entretien.',
  concept:`<span class="kw">WHERE</span> specialite = <span class="str">'Cardiologie'</span> <span class="kw">AND</span> nb_lits_service > <span class="num">40</span>
<span class="kw">WHERE</span> nb_lits_service < <span class="num">20</span> <span class="kw">OR</span> nb_lits_service > <span class="num">60</span>
<span class="kw">WHERE</span> nb_lits_service <span class="kw">BETWEEN</span> <span class="num">40</span> <span class="kw">AND</span> <span class="num">70</span>
<span class="kw">WHERE</span> specialite <span class="kw">IN</span> (<span class="str">'Cardiologie'</span>, <span class="str">'Neurologie'</span>)`,
  exercises:[
   {task:'Trouvez les services dont la spécialité est <b>Cardiologie ou Neurologie</b> ET dont le <b>nombre de lits est entre 40 et 70</b>.',
    hints:['Utilisez IN (\'Cardiologie\', \'Neurologie\') pour la spécialité.','Utilisez BETWEEN 40 AND 70 pour nb_lits_service.','SELECT * FROM services WHERE specialite IN (\'Cardiologie\', \'Neurologie\') AND nb_lits_service BETWEEN 40 AND 70;']},
   {task:'Trouvez le personnel de poste <b>Infirmier</b> appartenant aux services <b>4, 5 ou 6</b> (id_service).',
    hints:['Combinez WHERE poste = \'Infirmier\' AND id_service IN (...)','IN (4, 5, 6)','SELECT * FROM personnel WHERE poste = \'Infirmier\' AND id_service IN (4, 5, 6);']},
   {task:'Listez les budgets dont le <b>budget_reel</b> est <b>entre 2 000 000 et 4 000 000</b> (inclus).',
    hints:['La table est budgets, la colonne budget_reel.','BETWEEN 2000000 AND 4000000','SELECT * FROM budgets WHERE budget_reel BETWEEN 2000000 AND 4000000;']},
  ]},

 {id:'d4',title:'4. NULL – IS NULL / IS NOT NULL / COALESCE',hot:true,
  desc:'Gérer les valeurs manquantes : question incontournable en entretien data analyst.',
  concept:`<span class="cm">-- Tester la présence d'un NULL :</span>
<span class="kw">WHERE</span> date_depart <span class="kw">IS NULL</span>       <span class="cm">-- encore en poste</span>
<span class="kw">WHERE</span> date_depart <span class="kw">IS NOT NULL</span>   <span class="cm">-- a quitté</span>

<span class="cm">-- Remplacer NULL par une valeur :</span>
<span class="fn">COALESCE</span>(date_depart, <span class="str">'En poste'</span>)`,
  exercises:[
   {task:'Listez le personnel <b>encore en poste</b> (date_depart est NULL). Affichez nom, poste et id_service.',
    hints:['La table s\'appelle personnel.','WHERE date_depart IS NULL','SELECT nom, poste, id_service FROM personnel WHERE date_depart IS NULL;']},
   {task:'Listez le personnel <b>qui a quitté</b> (date_depart est renseignée). Affichez nom, poste et date_depart.',
    hints:['IS NOT NULL teste qu\'une valeur existe.','WHERE date_depart IS NOT NULL','SELECT nom, poste, date_depart FROM personnel WHERE date_depart IS NOT NULL;']},
   {task:'Affichez tout le personnel avec la date_depart remplacée par <b>"En poste"</b> si elle est NULL. Colonnes : id_personnel, nom, statut.',
    hints:['COALESCE(date_depart, \'En poste\') AS statut','SELECT id_personnel, nom, COALESCE(date_depart, \'En poste\') AS statut','SELECT id_personnel, nom, COALESCE(date_depart, \'En poste\') AS statut FROM personnel;']},
  ]},

 {id:'d5',title:'5. ORDER BY & LIMIT',hot:false,
  desc:'Trier et paginer les résultats. Base de tout rapport ou dashboard.',
  concept:`<span class="kw">ORDER BY</span> nb_lits_service <span class="kw">DESC</span>   <span class="cm">-- décroissant</span>
<span class="kw">ORDER BY</span> nom <span class="kw">ASC</span>    <span class="cm">-- croissant (défaut)</span>
<span class="kw">ORDER BY</span> id_service, mois <span class="kw">DESC</span>  <span class="cm">-- multi-colonnes</span>
<span class="kw">LIMIT</span> <span class="num">5</span>               <span class="cm">-- 5 premières lignes</span>`,
  exercises:[
   {task:'Les <b>3 services ayant le plus de lits</b> : nom_service, nb_lits_service.',
    hints:['ORDER BY nb_lits_service DESC','LIMIT 3 à la fin','SELECT nom_service, nb_lits_service FROM services ORDER BY nb_lits_service DESC LIMIT 3;']},
   {task:'Les <b>5 indicateurs avec le taux d\'occupation le plus élevé</b> : id_service, mois, taux_occupation.',
    hints:['ORDER BY taux_occupation DESC','LIMIT 5','SELECT id_service, mois, taux_occupation FROM indicateurs_mensuels ORDER BY taux_occupation DESC LIMIT 5;']},
   {task:'Les <b>3 membres du personnel les mieux payés</b> : nom, poste, salaire_mensuel.',
    hints:['ORDER BY salaire_mensuel DESC','LIMIT 3','SELECT nom, poste, salaire_mensuel FROM personnel ORDER BY salaire_mensuel DESC LIMIT 3;']},
  ]},

 {id:'d6',title:'6. DISTINCT – Dédoublonner',hot:false,
  desc:'Éliminer les doublons dans les résultats. Souvent demandé pour l\'analyse de données.',
  concept:`<span class="cm">-- Valeurs uniques d'une colonne :</span>
<span class="kw">SELECT DISTINCT</span> specialite <span class="kw">FROM</span> <span class="tbl">services</span>;

<span class="cm">-- Combinaisons uniques :</span>
<span class="kw">SELECT DISTINCT</span> poste, id_service <span class="kw">FROM</span> <span class="tbl">personnel</span>;`,
  exercises:[
   {task:'Listez toutes les <b>spécialités distinctes</b> présentes dans la table services.',
    hints:['Utilisez SELECT DISTINCT.','Une seule colonne suffit ici.','SELECT DISTINCT specialite FROM services;']},
   {task:'Listez tous les <b>postes distincts</b> du personnel.',
    hints:['SELECT DISTINCT colonne FROM table;','La colonne s\'appelle poste dans la table personnel.','SELECT DISTINCT poste FROM personnel;']},
   {task:'Listez toutes les combinaisons distinctes de <b>poste</b> et <b>id_service</b> du personnel.',
    hints:['SELECT DISTINCT col1, col2 retourne des paires uniques.','Chaque paire (poste, id_service) n\'apparaît qu\'une seule fois.','SELECT DISTINCT poste, id_service FROM personnel;']},
  ]},

 {id:'d7',title:'7. Fonctions – UPPER, LOWER, LENGTH, CONCAT, ROUND, MONTH',hot:false,
  desc:'Transformer les données à la volée : casse, longueur, concaténation, arrondi, extraction de date.',
  concept:`<span class="cm">-- Casse du texte :</span>
<span class="fn">UPPER</span>(nom)           <span class="cm">→ 'CHU CENTRE'</span>
<span class="fn">LOWER</span>(ville)         <span class="cm">→ 'paris'</span>
<span class="fn">LENGTH</span>(nom)          <span class="cm">→ 9 (nombre de caractères)</span>

<span class="cm">-- Assembler du texte :</span>
<span class="fn">CONCAT</span>(nom, <span class="str">' ('</span>, poste, <span class="str">')'</span>)  <span class="cm">→ 'Dr. Lemoine (Médecin)'</span>

<span class="cm">-- Nombres et dates :</span>
<span class="fn">ROUND</span>(taux_occupation, <span class="num">0</span>)   <span class="cm">→ 84 (arrondi à l'entier)</span>
<span class="fn">MONTH</span>(date_embauche)      <span class="cm">→ 3</span>`,
  exercises:[
   {task:'Affichez le <b>nom en majuscules</b> (colonne <b>nom_maj</b>), la <b>ville en minuscules</b> (colonne <b>ville_min</b>) et la <b>longueur du nom</b> (colonne <b>longueur_nom</b>) pour chaque établissement.',
    hints:['UPPER(nom) AS nom_maj, LOWER(ville) AS ville_min, LENGTH(nom) AS longueur_nom','SELECT ... FROM etablissements','SELECT UPPER(nom) AS nom_maj, LOWER(ville) AS ville_min, LENGTH(nom) AS longueur_nom FROM etablissements;']},
   {task:'Affichez une <b>fiche</b> par membre du personnel au format "nom (poste)" et le <b>mois d\'embauche</b> dans une colonne <b>mois_embauche</b>.',
    hints:['CONCAT(nom, \' (\', poste, \')\') AS fiche','MONTH(date_embauche) AS mois_embauche','SELECT CONCAT(nom, \' (\', poste, \')\') AS fiche, MONTH(date_embauche) AS mois_embauche FROM personnel;']},
   {task:'Depuis <b>indicateurs_mensuels</b>, affichez l\'<b>id_service</b>, le <b>taux_occupation</b> original et son <b>arrondi à l\'entier</b> (colonne <b>taux_arrondi</b>).',
    hints:['ROUND(taux_occupation, 0) AS taux_arrondi','SELECT id_service, taux_occupation, ROUND(...) AS taux_arrondi FROM indicateurs_mensuels;','SELECT id_service, taux_occupation, ROUND(taux_occupation, 0) AS taux_arrondi FROM indicateurs_mensuels;']},
  ]},

 {id:'d8',title:'8. OFFSET – Afficher à partir d\'une ligne',hot:false,
  desc:'Sauter les N premières lignes pour paginer les résultats ou commencer à une position précise.',
  concept:`<span class="cm">-- OFFSET saute les N premières lignes :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">services</span> <span class="kw">LIMIT</span> <span class="num">5</span> <span class="kw">OFFSET</span> <span class="num">3</span>;
<span class="cm">-- → lignes 4, 5, 6, 7, 8 (les 3 premières sont sautées)</span>

<span class="cm">-- Pagination : 3 résultats par page</span>
<span class="kw">LIMIT</span> <span class="num">3</span> <span class="kw">OFFSET</span> <span class="num">0</span>  <span class="cm">-- page 1 : lignes 1–3</span>
<span class="kw">LIMIT</span> <span class="num">3</span> <span class="kw">OFFSET</span> <span class="num">3</span>  <span class="cm">-- page 2 : lignes 4–6</span>`,
  exercises:[
   {task:'Affichez les services en sautant le plus grand : <b>4 services triés par nombre de lits décroissant</b>, en commençant au 2ème. Colonnes : nom_service, nb_lits_service.',
    hints:['ORDER BY nb_lits_service DESC pour trier du plus grand au plus petit.','LIMIT 4 OFFSET 1 — saute le 1er résultat (le plus grand).','SELECT nom_service, nb_lits_service FROM services ORDER BY nb_lits_service DESC LIMIT 4 OFFSET 1;']},
   {task:'Simulez la <b>page 2</b> du personnel (3 résultats par page). Affichez id_personnel, nom, poste, triés par id_personnel croissant.',
    hints:['Page 2 = sauter les 3 premiers → OFFSET 3','LIMIT 3 OFFSET 3','SELECT id_personnel, nom, poste FROM personnel ORDER BY id_personnel LIMIT 3 OFFSET 3;']},
   {task:'Affichez le <b>3ème budget_reel le plus bas</b> uniquement. Colonnes : id_service, annee, budget_reel.',
    hints:['ORDER BY budget_reel ASC pour du moins élevé au plus élevé.','LIMIT 1 OFFSET 2 — saute les 2 premiers, prend le 3ème.','SELECT id_service, annee, budget_reel FROM budgets ORDER BY budget_reel ASC LIMIT 1 OFFSET 2;']},
  ]},

 {id:'d9',title:'9. Pourcentage – Afficher X% des données',hot:false,
  desc:'Calculer et afficher une fraction des données en déduisant un LIMIT à partir d\'un pourcentage.',
  concept:`<span class="cm">-- Calcul manuel : total × (X/100) = N → LIMIT N</span>
<span class="cm">-- Ex : 9 services × 30% ≈ 2 → LIMIT 2</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">services</span> <span class="kw">ORDER BY</span> nb_lits_service <span class="kw">DESC</span> <span class="kw">LIMIT</span> <span class="num">2</span>;

<span class="cm">-- Calcul dynamique (s'adapte si la table grandit) :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">personnel</span> <span class="kw">ORDER BY</span> salaire_mensuel <span class="kw">DESC</span>
<span class="kw">LIMIT</span> (<span class="kw">SELECT</span> <span class="fn">CAST</span>(<span class="fn">COUNT</span>(*) * <span class="num">0.50</span> <span class="kw">AS</span> <span class="kw">INT</span>) <span class="kw">FROM</span> <span class="tbl">personnel</span>);`,
  exercises:[
   {task:'Affichez les <b>30% des services ayant le plus de lits</b> (calcul manuel : 9 × 0,30 ≈ 2). Colonnes : nom_service, nb_lits_service.',
    hints:['9 services × 0,30 = 2,7 → LIMIT 2','ORDER BY nb_lits_service DESC','SELECT nom_service, nb_lits_service FROM services ORDER BY nb_lits_service DESC LIMIT 2;']},
   {task:'Affichez les <b>50% du personnel les mieux payés</b> avec un <b>calcul dynamique</b> (LIMIT basé sur COUNT(*)).',
    hints:['LIMIT (SELECT CAST(COUNT(*) * 0.50 AS INT) FROM personnel)','ORDER BY salaire_mensuel DESC','SELECT * FROM personnel ORDER BY salaire_mensuel DESC LIMIT (SELECT CAST(COUNT(*) * 0.50 AS INT) FROM personnel);']},
   {task:'Affichez les <b>25% des indicateurs ayant le taux d\'occupation le plus élevé</b> (calcul manuel : 26 × 0,25 ≈ 6). Colonnes : id_service, mois, taux_occupation.',
    hints:['26 lignes × 0,25 = 6,5 → LIMIT 6','ORDER BY taux_occupation DESC','SELECT id_service, mois, taux_occupation FROM indicateurs_mensuels ORDER BY taux_occupation DESC LIMIT 6;']},
  ]},
], i: [
 {id:'i1',title:'7. INNER JOIN – Joindre deux tables',hot:true,
  desc:'Combiner des tables liées. Question numéro 1 dans les tests SQL en entretien.',
  concept:`<span class="kw">SELECT</span> e.nom, s.nom_service
<span class="kw">FROM</span> <span class="tbl">services</span> s
<span class="kw">INNER JOIN</span> <span class="tbl">etablissements</span> e
  <span class="kw">ON</span> s.id_etablissement = e.id_etablissement;
<span class="cm">-- Seules les lignes avec correspondance des deux côtés</span>`,
  exercises:[
   {task:'Affichez le <b>nom de l\'établissement</b>, le <b>nom_service</b> et la <b>specialite</b> pour chaque service.',
    hints:['INNER JOIN etablissements e','ON s.id_etablissement = e.id_etablissement','SELECT e.nom AS etablissement, s.nom_service, s.specialite FROM services s INNER JOIN etablissements e ON s.id_etablissement = e.id_etablissement;']},
   {task:'Affichez le <b>nom_service</b>, le <b>mois</b> et le <b>taux_occupation</b> pour chaque indicateur mensuel.',
    hints:['JOIN indicateurs_mensuels i ON s.id_service = i.id_service','SELECT s.nom_service, i.mois, i.taux_occupation','SELECT s.nom_service, i.mois, i.taux_occupation FROM services s INNER JOIN indicateurs_mensuels i ON s.id_service = i.id_service;']},
   {task:'Affichez le <b>nom du personnel</b>, son <b>poste</b> et le <b>nom_service</b> auquel il appartient.',
    hints:['JOIN du côté personnel → services','ON p.id_service = s.id_service','SELECT p.nom, p.poste, s.nom_service FROM personnel p INNER JOIN services s ON p.id_service = s.id_service;']},
  ]},

 {id:'i2',title:'8. LEFT JOIN – Garder tout à gauche',hot:true,
  desc:'Inclure les lignes sans correspondance. Très testé pour l\'analyse de données manquantes.',
  concept:`<span class="kw">FROM</span> <span class="tbl">etablissements</span> e
<span class="kw">LEFT JOIN</span> <span class="tbl">services</span> s
  <span class="kw">ON</span> e.id_etablissement = s.id_etablissement;
<span class="cm">-- Établissement sans service → nom_service = NULL</span>
<span class="cm">-- INNER JOIN l'aurait exclu</span>`,
  exercises:[
   {task:'Listez <b>tous les établissements</b> avec leurs services (NULL si aucun service enregistré).',
    hints:['LEFT JOIN au lieu de INNER JOIN.','ON e.id_etablissement = s.id_etablissement','SELECT e.nom, s.nom_service FROM etablissements e LEFT JOIN services s ON e.id_etablissement = s.id_etablissement;']},
   {task:'Listez <b>tous les services</b> avec leur indicateur du mois <b>2024-09-01</b> (NULL si absent ce mois-là).',
    hints:['LEFT JOIN indicateurs_mensuels i ON s.id_service = i.id_service AND i.mois = \'2024-09-01\'','SELECT s.nom_service, i.taux_occupation','SELECT s.nom_service, i.taux_occupation FROM services s LEFT JOIN indicateurs_mensuels i ON s.id_service = i.id_service AND i.mois = \'2024-09-01\';']},
   {task:'Listez <b>tous les services</b> avec leur budget de l\'année <b>2024</b> (NULL si aucun budget enregistré).',
    hints:['LEFT JOIN budgets b ON s.id_service = b.id_service AND b.annee = 2024','SELECT s.nom_service, b.budget_reel','SELECT s.nom_service, b.budget_reel FROM services s LEFT JOIN budgets b ON s.id_service = b.id_service AND b.annee = 2024;']},
  ]},

 {id:'i3',title:'9. COUNT / AVG / SUM / MIN / MAX',hot:true,
  desc:'Fonctions d\'agrégation. Présentes dans 95% des postes data analyst.',
  concept:`<span class="kw">SELECT</span>
  <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb_total,
  <span class="fn">AVG</span>(nb_lits_service) <span class="kw">AS</span> lits_moyen,
  <span class="fn">SUM</span>(nb_lits_service) <span class="kw">AS</span> lits_total,
  <span class="fn">MAX</span>(nb_lits_service) <span class="kw">AS</span> lits_max
<span class="kw">FROM</span> <span class="tbl">services</span>;`,
  exercises:[
   {task:'Calculez : nombre total de services, nombre de lits moyen, maximum et minimum.',
    hints:['COUNT(*), AVG(nb_lits_service), MAX(...), MIN(...)','Utilisez AS pour nommer chaque résultat.','SELECT COUNT(*) AS nb, AVG(nb_lits_service) AS lits_moyen, MAX(nb_lits_service) AS lits_max, MIN(nb_lits_service) AS lits_min FROM services;']},
   {task:'Calculez le nombre total d\'admissions, le taux d\'occupation moyen et le score de satisfaction maximum.',
    hints:['SUM(nb_admissions), AVG(taux_occupation), MAX(satisfaction_score)','FROM indicateurs_mensuels','SELECT SUM(nb_admissions) AS total_admissions, AVG(taux_occupation) AS taux_moyen, MAX(satisfaction_score) AS satisfaction_max FROM indicateurs_mensuels;']},
   {task:'Calculez le salaire mensuel moyen, minimum et maximum du personnel.',
    hints:['AVG(salaire_mensuel), MIN(salaire_mensuel), MAX(salaire_mensuel)','FROM personnel','SELECT AVG(salaire_mensuel) AS moy, MIN(salaire_mensuel) AS min_sal, MAX(salaire_mensuel) AS max_sal FROM personnel;']},
  ]},

 {id:'i4',title:'10. GROUP BY – Statistiques par groupe',hot:true,
  desc:'Regrouper et agréger. Omniprésent dans les analyses et tableaux de bord.',
  concept:`<span class="kw">SELECT</span> id_etablissement, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">services</span>
<span class="kw">GROUP BY</span> id_etablissement
<span class="kw">ORDER BY</span> nb <span class="kw">DESC</span>;
<span class="cm">-- GROUP_CONCAT : concatène les valeurs d'un groupe</span>
<span class="fn">GROUP_CONCAT</span>(nom, <span class="str">', '</span>) <span class="kw">AS</span> liste_noms`,
  exercises:[
   {task:'Nombre de services et nombre moyen de lits <b>par établissement</b> (id_etablissement), du plus chargé au moins.',
    hints:['GROUP BY id_etablissement','COUNT(*) AS nb_services, AVG(nb_lits_service) AS lits_moyen','SELECT id_etablissement, COUNT(*) AS nb_services, AVG(nb_lits_service) AS lits_moyen FROM services GROUP BY id_etablissement ORDER BY nb_services DESC;']},
   {task:'Nombre d\'indicateurs et taux d\'occupation moyen <b>par service</b> (id_service), triés par taux décroissant.',
    hints:['GROUP BY id_service','COUNT(*) AS nb_mois, AVG(taux_occupation) AS taux_moyen','SELECT id_service, COUNT(*) AS nb_mois, AVG(taux_occupation) AS taux_moyen FROM indicateurs_mensuels GROUP BY id_service ORDER BY taux_moyen DESC;']},
   {task:'Pour chaque service (id_service), affichez la <b>liste des noms du personnel</b> séparés par une virgule avec <b>GROUP_CONCAT</b>.',
    hints:['GROUP_CONCAT(nom, \', \') AS liste_personnel','GROUP_CONCAT concatène toutes les valeurs du groupe en une seule chaîne (syntaxe SQLite : GROUP_CONCAT(col, séparateur)).','SELECT id_service, GROUP_CONCAT(nom, \', \') AS liste_personnel FROM personnel GROUP BY id_service;']},
  ]},

 {id:'i5',title:'11. HAVING – Filtrer les groupes',hot:true,
  desc:'HAVING filtre après GROUP BY. WHERE ne peut pas utiliser les agrégats.',
  concept:`<span class="cm">-- WHERE filtre les LIGNES (avant groupement)</span>
<span class="cm">-- HAVING filtre les GROUPES (après groupement)</span>

<span class="kw">SELECT</span> id_etablissement, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">services</span>
<span class="kw">GROUP BY</span> id_etablissement
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) >= <span class="num">2</span>;`,
  exercises:[
   {task:'Listez les établissements (id_etablissement) ayant <b>au moins 2 services</b>.',
    hints:['GROUP BY id_etablissement','HAVING COUNT(*) >= 2','SELECT id_etablissement, COUNT(*) AS nb FROM services GROUP BY id_etablissement HAVING COUNT(*) >= 2;']},
   {task:'Listez les services (id_service) dont le <b>taux d\'occupation moyen dépasse 85%</b>.',
    hints:['GROUP BY id_service FROM indicateurs_mensuels','HAVING AVG(taux_occupation) > 85','SELECT id_service, AVG(taux_occupation) AS taux_moyen FROM indicateurs_mensuels GROUP BY id_service HAVING AVG(taux_occupation) > 85;']},
   {task:'Listez les services (id_service) ayant <b>au moins 3 membres du personnel</b> enregistrés.',
    hints:['GROUP BY id_service FROM personnel','HAVING COUNT(*) >= 3','SELECT id_service, COUNT(*) AS nb_personnel FROM personnel GROUP BY id_service HAVING COUNT(*) >= 3;']},
  ]},

 {id:'i6',title:'12. Jointure multiple – 3 tables',hot:true,
  desc:'Requêtes sur plusieurs tables. Fréquent en entretien senior et dans les vrais projets.',
  concept:`<span class="kw">SELECT</span> e.nom, s.nom_service, i.taux_occupation
<span class="kw">FROM</span> <span class="tbl">etablissements</span> e
<span class="kw">JOIN</span> <span class="tbl">services</span> s <span class="kw">ON</span> e.id_etablissement = s.id_etablissement
<span class="kw">JOIN</span> <span class="tbl">indicateurs_mensuels</span> i <span class="kw">ON</span> s.id_service = i.id_service;
<span class="cm">-- Chaîner plusieurs JOIN pour relier les tables</span>`,
  exercises:[
   {task:'Listez le <b>nom de l\'établissement</b>, le <b>nom_service</b>, le <b>mois</b> et le <b>taux_occupation</b> pour chaque indicateur.',
    hints:['Faites 2 JOIN : etablissements → services → indicateurs_mensuels','ON s.id_service = i.id_service pour le 2e JOIN','SELECT e.nom AS etablissement, s.nom_service, i.mois, i.taux_occupation FROM etablissements e JOIN services s ON e.id_etablissement = s.id_etablissement JOIN indicateurs_mensuels i ON s.id_service = i.id_service;']},
   {task:'Affichez le <b>nom de l\'établissement</b>, le <b>nom_service</b>, le <b>nom</b> et le <b>poste</b> de chaque membre du personnel.',
    hints:['Même type de jointure : etablissements → services → personnel','ON p.id_service = s.id_service','SELECT e.nom AS etablissement, s.nom_service, p.nom, p.poste FROM etablissements e JOIN services s ON e.id_etablissement = s.id_etablissement JOIN personnel p ON p.id_service = s.id_service;']},
   {task:'Affichez le <b>nom_service</b>, l\'<b>annee</b>, le <b>budget_reel</b> et la <b>ville</b> de l\'établissement pour chaque budget.',
    hints:['JOIN budgets b ON s.id_service = b.id_service','JOIN etablissements e ON s.id_etablissement = e.id_etablissement','SELECT s.nom_service, b.annee, b.budget_reel, e.ville FROM services s JOIN budgets b ON s.id_service = b.id_service JOIN etablissements e ON s.id_etablissement = e.id_etablissement;']},
  ]},

 {id:'i7',title:'13. LIKE – Recherche de motifs',hot:false,
  desc:'Filtrer du texte avec des wildcards. Utilisé dans les recherches et la validation de données.',
  concept:`<span class="cm">-- % : n'importe quelle séquence de caractères</span>
<span class="cm">-- _ : exactement un caractère</span>

<span class="kw">WHERE</span> specialite <span class="kw">LIKE</span> <span class="str">'%Gynéco%'</span>  <span class="cm">-- contient</span>
<span class="kw">WHERE</span> nom <span class="kw">LIKE</span> <span class="str">'L%'</span>              <span class="cm">-- commence par L</span>
<span class="kw">WHERE</span> nom <span class="kw">LIKE</span> <span class="str">'%in'</span>             <span class="cm">-- finit par 'in'</span>`,
  exercises:[
   {task:'Trouvez le service dont la spécialité contient le mot <b>Gynéco</b>.',
    hints:['WHERE specialite LIKE \'%...%\'','Le mot à chercher : Gynéco','SELECT * FROM services WHERE specialite LIKE \'%Gynéco%\';']},
   {task:'Listez le personnel dont le <b>nom commence par la lettre L</b>.',
    hints:['WHERE nom LIKE \'L%\'','Le % remplace tout ce qui suit le L.','SELECT * FROM personnel WHERE nom LIKE \'L%\';']},
   {task:'Listez les services dont la <b>spécialité contient le mot "Médecine"</b>.',
    hints:['WHERE specialite LIKE \'%Médecine%\'','La spécialité est la colonne specialite de la table services.','SELECT * FROM services WHERE specialite LIKE \'%Médecine%\';']},
  ]},
], a: [
 {id:'a1',title:'14. Sous-requêtes – Subqueries',hot:true,
  desc:'Imbriquer des requêtes. Très demandé dans les tests techniques data analyst.',
  concept:`<span class="cm">-- Sous-requête scalaire (retourne 1 valeur) :</span>
<span class="kw">WHERE</span> taux_occupation > (<span class="kw">SELECT</span> <span class="fn">AVG</span>(taux_occupation) <span class="kw">FROM</span> <span class="tbl">indicateurs_mensuels</span>)

<span class="cm">-- Sous-requête dans FROM :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> (
  <span class="kw">SELECT</span> id_service, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb <span class="kw">FROM</span> <span class="tbl">personnel</span>
  <span class="kw">GROUP BY</span> id_service
) sub <span class="kw">WHERE</span> nb > <span class="num">2</span>`,
  exercises:[
   {task:'Listez les indicateurs dont le <b>taux_occupation</b> est <b>supérieur à la moyenne</b> globale.',
    hints:['WHERE taux_occupation > (sous-requête)','La sous-requête : SELECT AVG(taux_occupation) FROM indicateurs_mensuels','SELECT * FROM indicateurs_mensuels WHERE taux_occupation > (SELECT AVG(taux_occupation) FROM indicateurs_mensuels);']},
   {task:'Listez le personnel dont le <b>salaire_mensuel</b> est <b>supérieur au salaire moyen</b>.',
    hints:['WHERE salaire_mensuel > (SELECT AVG(salaire_mensuel) FROM personnel)','SELECT nom, poste, salaire_mensuel FROM personnel','SELECT nom, poste, salaire_mensuel FROM personnel WHERE salaire_mensuel > (SELECT AVG(salaire_mensuel) FROM personnel);']},
   {task:'Listez les services dont le <b>nb_lits_service</b> est <b>supérieur à la moyenne</b> des lits par service.',
    hints:['WHERE nb_lits_service > (SELECT AVG(nb_lits_service) FROM services)','SELECT nom_service, specialite, nb_lits_service FROM services','SELECT nom_service, specialite, nb_lits_service FROM services WHERE nb_lits_service > (SELECT AVG(nb_lits_service) FROM services);']},
  ]},

 {id:'a2',title:'15. CTE – WITH … AS',hot:true,
  desc:'Rendre les requêtes lisibles et modulaires. Très apprécié par les recruteurs.',
  concept:`<span class="kw">WITH</span> services_grands <span class="kw">AS</span> (
  <span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">services</span>
  <span class="kw">WHERE</span> nb_lits_service >= <span class="num">40</span>
)
<span class="kw">SELECT</span> s.nom_service, p.nom
<span class="kw">FROM</span> services_grands s
<span class="kw">JOIN</span> <span class="tbl">personnel</span> p <span class="kw">ON</span> s.id_service = p.id_service;`,
  exercises:[
   {task:'Avec un CTE <b>services_grands</b> (nb_lits_service >= 40), comptez combien de personnel travaille dans ces services.',
    hints:['WITH services_grands AS (SELECT * FROM services WHERE nb_lits_service >= 40)','Le CTE filtre, le SELECT principal compte.','WITH services_grands AS (SELECT * FROM services WHERE nb_lits_service >= 40) SELECT COUNT(*) AS nb_personnel FROM services_grands s JOIN personnel p ON s.id_service = p.id_service;']},
   {task:'Avec un CTE <b>indicateurs_critiques</b> (taux_occupation > 90), affichez le nom_service et le mois de ces indicateurs.',
    hints:['WITH indicateurs_critiques AS (SELECT * FROM indicateurs_mensuels WHERE taux_occupation > 90)','JOIN services s ON indicateurs_critiques.id_service = s.id_service','WITH indicateurs_critiques AS (SELECT * FROM indicateurs_mensuels WHERE taux_occupation > 90) SELECT s.nom_service, ic.mois FROM indicateurs_critiques ic JOIN services s ON ic.id_service = s.id_service;']},
   {task:'Avec un CTE <b>personnel_senior</b> (salaire_mensuel > 8000), listez leur nom et le nom_service associé.',
    hints:['WITH personnel_senior AS (SELECT * FROM personnel WHERE salaire_mensuel > 8000)','JOIN sur ps.id_service = s.id_service','WITH personnel_senior AS (SELECT * FROM personnel WHERE salaire_mensuel > 8000) SELECT ps.nom, s.nom_service FROM personnel_senior ps JOIN services s ON ps.id_service = s.id_service;']},
  ]},

 {id:'a3',title:'16. CASE WHEN – Logique conditionnelle',hot:true,
  desc:'Créer des colonnes calculées conditionnelles. Demandé dans presque tous les tests SQL.',
  concept:`<span class="kw">SELECT</span> nom_service,
  <span class="kw">CASE</span>
    <span class="kw">WHEN</span> specialite <span class="kw">IN</span> (<span class="str">'Oncologie'</span>, <span class="str">'Urgences'</span>) <span class="kw">THEN</span> <span class="str">'Haute'</span>
    <span class="kw">ELSE</span> <span class="str">'Normale'</span>
  <span class="kw">END</span> <span class="kw">AS</span> priorite
<span class="kw">FROM</span> <span class="tbl">services</span>;`,
  exercises:[
   {task:'Ajoutez une colonne <b>priorite</b> : "Haute" si la spécialité est Oncologie ou Urgences, "Normale" sinon.',
    hints:['CASE WHEN specialite IN (\'Oncologie\', \'Urgences\') THEN \'Haute\'','ELSE \'Normale\' END AS priorite','SELECT nom_service, specialite, CASE WHEN specialite IN (\'Oncologie\', \'Urgences\') THEN \'Haute\' ELSE \'Normale\' END AS priorite FROM services;']},
   {task:'Ajoutez une colonne <b>niveau_occupation</b> : "Critique" (> 90), "Normal" (70 à 90), "Faible" (< 70), sur indicateurs_mensuels.',
    hints:['CASE WHEN taux_occupation > 90 THEN \'Critique\' WHEN taux_occupation >= 70 THEN \'Normal\' ELSE \'Faible\' END','SELECT id_service, mois, taux_occupation, CASE WHEN ... END AS niveau_occupation','SELECT id_service, mois, taux_occupation, CASE WHEN taux_occupation > 90 THEN \'Critique\' WHEN taux_occupation >= 70 THEN \'Normal\' ELSE \'Faible\' END AS niveau_occupation FROM indicateurs_mensuels;']},
   {task:'Sur le personnel, ajoutez une colonne <b>categorie_salaire</b> : "Élevé" (> 8000), "Moyen" (3000 à 8000), "Standard" (< 3000).',
    hints:['CASE WHEN salaire_mensuel > 8000 THEN \'Élevé\' WHEN salaire_mensuel >= 3000 THEN \'Moyen\' ELSE \'Standard\' END','SELECT nom, salaire_mensuel, CASE WHEN ... END AS categorie_salaire','SELECT nom, salaire_mensuel, CASE WHEN salaire_mensuel > 8000 THEN \'Élevé\' WHEN salaire_mensuel >= 3000 THEN \'Moyen\' ELSE \'Standard\' END AS categorie_salaire FROM personnel;']},
  ]},

 {id:'a4',title:'17. Détecter les doublons',hot:true,
  desc:'Question classique d\'entretien : "comment trouver les doublons ?" — GROUP BY + HAVING.',
  concept:`<span class="cm">-- Trouver les doublons : GROUP BY + HAVING COUNT > 1</span>
<span class="kw">SELECT</span> col1, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> table
<span class="kw">GROUP BY</span> col1
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) > <span class="num">1</span>;`,
  exercises:[
   {task:'Trouvez les services (id_service) ayant <b>plus de 2 membres du personnel</b> enregistrés.',
    hints:['SELECT id_service, COUNT(*) AS nb_personnel FROM personnel','GROUP BY id_service','SELECT id_service, COUNT(*) AS nb_personnel FROM personnel GROUP BY id_service HAVING COUNT(*) > 2;']},
   {task:'Trouvez les services ayant <b>plus d\'une personne avec le même poste</b> (ex : 2 infirmiers).',
    hints:['SELECT id_service, poste, COUNT(*) FROM personnel','GROUP BY id_service, poste','SELECT id_service, poste, COUNT(*) AS nb FROM personnel GROUP BY id_service, poste HAVING COUNT(*) > 1;']},
   {task:'Trouvez les services (id_service) apparaissant <b>plus d\'une fois</b> dans la table budgets.',
    hints:['SELECT id_service, COUNT(*) FROM budgets','GROUP BY id_service HAVING COUNT(*) > 1','SELECT id_service, COUNT(*) AS nb_fois FROM budgets GROUP BY id_service HAVING COUNT(*) > 1;']},
  ]},

 {id:'a5',title:'18. Établissements sans service – Anti-JOIN',hot:true,
  desc:'"Trouver les X sans Y" : question très fréquente en entretien. Deux approches classiques.',
  concept:`<span class="cm">-- Approche 1 : LEFT JOIN + IS NULL</span>
<span class="kw">SELECT</span> e.nom <span class="kw">FROM</span> <span class="tbl">etablissements</span> e
<span class="kw">LEFT JOIN</span> <span class="tbl">services</span> s <span class="kw">ON</span> e.id_etablissement = s.id_etablissement
<span class="kw">WHERE</span> s.id_service <span class="kw">IS NULL</span>;

<span class="cm">-- Approche 2 : NOT IN</span>
<span class="kw">WHERE</span> id_service <span class="kw">NOT IN</span> (
  <span class="kw">SELECT</span> id_service <span class="kw">FROM</span> <span class="tbl">budgets</span>
)`,
  exercises:[
   {task:'Listez les établissements qui n\'ont <b>aucun service</b> enregistré.',
    hints:['LEFT JOIN services s ON e.id_etablissement = s.id_etablissement','WHERE s.id_service IS NULL','SELECT e.nom, e.ville FROM etablissements e LEFT JOIN services s ON e.id_etablissement = s.id_etablissement WHERE s.id_service IS NULL;']},
   {task:'Listez les services qui n\'ont <b>aucun indicateur enregistré pour le mois 2024-09-01</b>.',
    hints:['LEFT JOIN indicateurs_mensuels i ON s.id_service = i.id_service AND i.mois = \'2024-09-01\'','WHERE i.id_indicateur IS NULL','SELECT s.nom_service FROM services s LEFT JOIN indicateurs_mensuels i ON s.id_service = i.id_service AND i.mois = \'2024-09-01\' WHERE i.id_indicateur IS NULL;']},
   {task:'Listez les services qui n\'ont <b>aucun budget enregistré pour l\'année 2024</b> (utilisez NOT IN).',
    hints:['WHERE id_service NOT IN (SELECT id_service FROM budgets WHERE annee = 2024)','SELECT nom_service, specialite FROM services','SELECT nom_service, specialite FROM services WHERE id_service NOT IN (SELECT id_service FROM budgets WHERE annee = 2024);']},
  ]},

 {id:'a6',title:'19. Fonctions de date',hot:true,
  desc:'Manipuler des dates : demandé dans les analyses temporelles et les tableaux de bord.',
  concept:`<span class="cm">-- Extraire une partie de date :</span>
<span class="fn">YEAR</span>(date_embauche)   <span class="cm">→ 2019</span>
<span class="fn">MONTH</span>(mois)  <span class="cm">→ 11</span>

<span class="cm">-- Compter par mois :</span>
<span class="kw">SELECT</span> <span class="fn">MONTH</span>(mois) <span class="kw">AS</span> mois_num,
       <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">indicateurs_mensuels</span> <span class="kw">GROUP BY</span> mois_num`,
  exercises:[
   {task:'Comptez le nombre d\'indicateurs enregistrés <b>par mois</b> (numéro du mois). Affichez le mois et le nombre.',
    hints:['MONTH(mois) AS mois_num','GROUP BY mois_num','SELECT MONTH(mois) AS mois_num, COUNT(*) AS nb FROM indicateurs_mensuels GROUP BY mois_num ORDER BY mois_num;']},
   {task:'Comptez le nombre d\'<b>embauches</b> de personnel <b>par année</b> (date_embauche). Affichez l\'année et le nombre.',
    hints:['YEAR(date_embauche) AS annee FROM personnel','GROUP BY annee','SELECT YEAR(date_embauche) AS annee, COUNT(*) AS nb_embauches FROM personnel GROUP BY annee ORDER BY annee;']},
   {task:'Listez uniquement les indicateurs du <b>mois 11</b> (novembre). Affichez mois, id_service, taux_occupation.',
    hints:['WHERE MONTH(mois) = 11','SELECT mois, id_service, taux_occupation FROM indicateurs_mensuels','SELECT mois, id_service, taux_occupation FROM indicateurs_mensuels WHERE MONTH(mois) = 11;']},
  ]},

 {id:'a7',title:'20. COALESCE & NULLIF',hot:true,
  desc:'Gérer intelligemment les NULLs. Attendu dans tout rôle data engineering ou analyst.',
  concept:`<span class="cm">-- COALESCE : retourne la 1ère valeur non-NULL</span>
<span class="fn">COALESCE</span>(date_depart, <span class="str">'En poste'</span>)
<span class="fn">COALESCE</span>(col1, col2, <span class="str">'défaut'</span>)

<span class="cm">-- NULLIF : retourne NULL si a = b (évite ÷0)</span>
<span class="fn">NULLIF</span>(col, <span class="num">0</span>)  <span class="cm">→ NULL si col = 0</span>`,
  exercises:[
   {task:'Listez le personnel avec la date_depart remplacée par <b>"Toujours en poste"</b> si NULL.',
    hints:['COALESCE(date_depart, \'Toujours en poste\') AS statut','SELECT nom, poste, COALESCE(date_depart, \'Toujours en poste\') AS statut','SELECT nom, poste, COALESCE(date_depart, \'Toujours en poste\') AS statut FROM personnel;']},
   {task:'Affichez id_indicateur, id_service, mois et une colonne <b>satisfaction_aff</b> = satisfaction_score ou -1 si NULL (enquête non réalisée), ordonné par id_indicateur.',
    hints:['COALESCE(satisfaction_score, -1) AS satisfaction_aff','SELECT id_indicateur, id_service, mois, COALESCE(satisfaction_score, -1) AS satisfaction_aff','SELECT id_indicateur, id_service, mois, COALESCE(satisfaction_score, -1) AS satisfaction_aff FROM indicateurs_mensuels ORDER BY id_indicateur;']},
   {task:'Affichez le personnel avec une colonne <b>salaire_ajuste</b> qui vaut NULL si le salaire_mensuel est exactement 8800 (Dr. Lemoine), sinon le salaire normal.',
    hints:['NULLIF(salaire_mensuel, 8800) AS salaire_ajuste','SELECT nom, salaire_mensuel, NULLIF(salaire_mensuel, 8800) AS salaire_ajuste','SELECT nom, salaire_mensuel, NULLIF(salaire_mensuel, 8800) AS salaire_ajuste FROM personnel;']},
  ]},
], e: [
 {id:'e1',title:'21. RANK() / ROW_NUMBER() OVER',hot:true,
  desc:'Fonctions fenêtre de classement. Incontournables pour les postes data analyst avancés.',
  concept:`<span class="kw">SELECT</span> nom, id_service, salaire_mensuel,
  <span class="fn">RANK</span>() <span class="kw">OVER</span> (
    <span class="kw">PARTITION BY</span> id_service
    <span class="kw">ORDER BY</span> salaire_mensuel <span class="kw">DESC</span>
  ) <span class="kw">AS</span> rang
<span class="kw">FROM</span> ...
<span class="cm">-- ROW_NUMBER : rang unique même si ex-aequo</span>
<span class="cm">-- RANK : ex-aequo partagent le même rang</span>`,
  exercises:[
   {task:'Classez le personnel par salaire décroissant <b>par service</b> (PARTITION BY id_service). Affichez id_service, nom, salaire_mensuel et rang.',
    hints:['RANK() OVER (PARTITION BY id_service ORDER BY salaire_mensuel DESC) AS rang','SELECT id_service, nom, salaire_mensuel, RANK()...','SELECT id_service, nom, salaire_mensuel, RANK() OVER (PARTITION BY id_service ORDER BY salaire_mensuel DESC) AS rang FROM personnel ORDER BY id_service, rang;']},
   {task:'Classez <b>tous les indicateurs</b> par taux_occupation décroissant avec ROW_NUMBER() (sans PARTITION). Affichez id_service, mois, taux_occupation et rang.',
    hints:['ROW_NUMBER() OVER (ORDER BY taux_occupation DESC) AS rang','Pas de PARTITION BY ici — tous les indicateurs ensemble.','SELECT id_service, mois, taux_occupation, ROW_NUMBER() OVER (ORDER BY taux_occupation DESC) AS rang FROM indicateurs_mensuels;']},
   {task:'Classez les indicateurs par taux_occupation décroissant <b>par service</b> (PARTITION BY id_service) avec RANK(). Affichez id_service, mois, taux_occupation et rang.',
    hints:['RANK() OVER (PARTITION BY id_service ORDER BY taux_occupation DESC) AS rang','SELECT id_service, mois, taux_occupation, RANK() ...','SELECT id_service, mois, taux_occupation, RANK() OVER (PARTITION BY id_service ORDER BY taux_occupation DESC) AS rang FROM indicateurs_mensuels ORDER BY id_service, rang;']},
  ]},

 {id:'e2',title:'22. SUM / AVG OVER – Cumul & Moyenne glissante',hot:true,
  desc:'Totaux cumulés et moyennes mobiles. Demandés dans les analyses financières et médicales.',
  concept:`<span class="cm">-- Total cumulé :</span>
<span class="fn">SUM</span>(nb_admissions) <span class="kw">OVER</span> (
  <span class="kw">ORDER BY</span> mois
) <span class="kw">AS</span> cumul

<span class="cm">-- Par partition :</span>
<span class="fn">SUM</span>(nb_admissions) <span class="kw">OVER</span> (
  <span class="kw">PARTITION BY</span> id_service
  <span class="kw">ORDER BY</span> mois
) <span class="kw">AS</span> cumul_par_service`,
  exercises:[
   {task:'Total cumulé du <b>nombre d\'admissions</b> par ordre de mois (toutes lignes confondues). Affichez mois, nb_admissions et cumul.',
    hints:['SUM(nb_admissions) OVER (ORDER BY mois) AS cumul_admissions','SELECT mois, nb_admissions, SUM(nb_admissions) OVER (ORDER BY mois) AS cumul_admissions','SELECT mois, nb_admissions, SUM(nb_admissions) OVER (ORDER BY mois) AS cumul_admissions FROM indicateurs_mensuels ORDER BY mois;']},
   {task:'Total cumulé du <b>budget_reel</b> par ordre d\'id_budget. Affichez id_budget, id_service, budget_reel et cumul.',
    hints:['SUM(budget_reel) OVER (ORDER BY id_budget) AS cumul_budget','SELECT id_budget, id_service, budget_reel, SUM(...) OVER (...) AS cumul_budget','SELECT id_budget, id_service, budget_reel, SUM(budget_reel) OVER (ORDER BY id_budget) AS cumul_budget FROM budgets;']},
   {task:'Moyenne glissante du <b>taux_occupation</b> par ordre de mois. Affichez mois, taux_occupation et la moyenne glissante.',
    hints:['AVG(taux_occupation) OVER (ORDER BY mois) AS moy_glissante','SELECT mois, taux_occupation, AVG(...) OVER (...) AS moy_glissante','SELECT mois, taux_occupation, AVG(taux_occupation) OVER (ORDER BY mois) AS moy_glissante FROM indicateurs_mensuels ORDER BY mois;']},
  ]},

 {id:'e3',title:'23. LAG / LEAD – Valeurs décalées',hot:true,
  desc:'Comparer une ligne avec la précédente ou suivante. Question avancée très appréciée.',
  concept:`<span class="fn">LAG</span>(col, 1)  <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> mois)
<span class="cm">-- valeur de la ligne précédente</span>

<span class="fn">LEAD</span>(col, 1) <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> mois)
<span class="cm">-- valeur de la ligne suivante</span>

<span class="cm">-- Utilisation : calculer l'évolution mois par mois</span>`,
  exercises:[
   {task:'Pour chaque indicateur, affichez le <b>taux_occupation du mois précédent</b> (LAG) par ordre de mois (toutes lignes confondues).',
    hints:['LAG(taux_occupation, 1) OVER (ORDER BY mois) AS taux_precedent','SELECT mois, taux_occupation, LAG(taux_occupation, 1) OVER (ORDER BY mois) AS taux_precedent','SELECT mois, taux_occupation, LAG(taux_occupation, 1) OVER (ORDER BY mois) AS taux_precedent FROM indicateurs_mensuels ORDER BY mois;']},
   {task:'Pour chaque indicateur, affichez le <b>taux_occupation du mois suivant</b> (LEAD) par ordre de mois.',
    hints:['LEAD(taux_occupation, 1) OVER (ORDER BY mois) AS taux_suivant','SELECT mois, taux_occupation, LEAD(taux_occupation, 1) OVER (ORDER BY mois) AS taux_suivant','SELECT mois, taux_occupation, LEAD(taux_occupation, 1) OVER (ORDER BY mois) AS taux_suivant FROM indicateurs_mensuels ORDER BY mois;']},
   {task:'Pour chaque indicateur, affichez le taux_occupation précédent <b>par service</b> (PARTITION BY id_service, LAG) par ordre de mois.',
    hints:['LAG(taux_occupation, 1) OVER (PARTITION BY id_service ORDER BY mois) AS taux_prec_service','SELECT id_service, mois, taux_occupation, LAG(...) OVER (...) AS taux_prec_service','SELECT id_service, mois, taux_occupation, LAG(taux_occupation, 1) OVER (PARTITION BY id_service ORDER BY mois) AS taux_prec_service FROM indicateurs_mensuels ORDER BY id_service, mois;']},
  ]},

 {id:'e4',title:'24. Deuxième valeur la plus haute',hot:true,
  desc:'Question classique d\'entretien : "2ème salaire le plus élevé". Plusieurs approches.',
  concept:`<span class="cm">-- Approche 1 : LIMIT + OFFSET</span>
<span class="kw">SELECT DISTINCT</span> salaire_mensuel <span class="kw">FROM</span> <span class="tbl">personnel</span>
<span class="kw">ORDER BY</span> salaire_mensuel <span class="kw">DESC</span> <span class="kw">LIMIT</span> <span class="num">1</span> <span class="cm">OFFSET 1</span>

<span class="cm">-- Approche 2 : Sous-requête</span>
<span class="kw">SELECT</span> <span class="fn">MAX</span>(salaire_mensuel) <span class="kw">FROM</span> <span class="tbl">personnel</span>
<span class="kw">WHERE</span> salaire_mensuel < (
  <span class="kw">SELECT</span> <span class="fn">MAX</span>(salaire_mensuel) <span class="kw">FROM</span> <span class="tbl">personnel</span>
)`,
  exercises:[
   {task:'Trouvez le <b>2ème salaire le plus élevé</b> du personnel (sans utiliser OFFSET).',
    hints:['Approche : SELECT MAX(salaire_mensuel) WHERE salaire_mensuel < (SELECT MAX(salaire_mensuel) ...)','La sous-requête retourne le salaire max, la requête principale prend le max en dessous.','SELECT MAX(salaire_mensuel) AS deuxieme_salaire FROM personnel WHERE salaire_mensuel < (SELECT MAX(salaire_mensuel) FROM personnel);']},
   {task:'Trouvez le <b>2ème taux_occupation le plus élevé</b> parmi les indicateurs (utilisez LIMIT + OFFSET).',
    hints:['SELECT DISTINCT taux_occupation FROM indicateurs_mensuels ORDER BY taux_occupation DESC LIMIT 1 OFFSET 1','OFFSET 1 saute la première ligne (la plus élevée).','SELECT DISTINCT taux_occupation AS deuxieme_taux FROM indicateurs_mensuels ORDER BY taux_occupation DESC LIMIT 1 OFFSET 1;']},
   {task:'Trouvez le nombre de lits du <b>3ème service le plus grand</b> (utilisez LIMIT + OFFSET).',
    hints:['SELECT DISTINCT nb_lits_service FROM services ORDER BY nb_lits_service DESC','LIMIT 1 OFFSET 2 pour la 3ème valeur','SELECT DISTINCT nb_lits_service AS troisieme_taille FROM services ORDER BY nb_lits_service DESC LIMIT 1 OFFSET 2;']},
  ]},

 {id:'e6',title:'26. UNION / UNION ALL – Combiner des résultats',hot:true,
  desc:'Fusionner les résultats de plusieurs requêtes. Question classique d\'entretien.',
  concept:`<span class="cm">-- UNION : fusionne et dédoublonne</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">etablissements</span>
<span class="kw">UNION</span>
<span class="kw">SELECT</span> nom_service <span class="kw">FROM</span> <span class="tbl">services</span>;

<span class="cm">-- UNION ALL : fusionne SANS dédoublonner (plus rapide)</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">etablissements</span>
<span class="kw">UNION ALL</span>
<span class="kw">SELECT</span> nom_service <span class="kw">FROM</span> <span class="tbl">services</span>;

<span class="cm">-- Règle : même nombre de colonnes, mêmes types</span>`,
  exercises:[
   {task:'Combinez avec <b>UNION</b> la liste des noms d\'établissements et la liste des noms de services en une seule colonne <b>nom</b>.',
    hints:['UNION dédoublonne automatiquement les noms identiques.','Les deux SELECT doivent retourner le même nombre de colonnes.','SELECT nom FROM etablissements UNION SELECT nom_service FROM services;']},
   {task:'Combinez avec <b>UNION ALL</b> les noms d\'établissements et de services (sans dédoublonner). Combien de lignes obtenez-vous ?',
    hints:['SELECT nom FROM etablissements UNION ALL SELECT nom_service FROM services;','UNION ALL conserve tous les doublons — le résultat a 13 lignes (4 + 9).','SELECT nom FROM etablissements UNION ALL SELECT nom_service FROM services;']},
   {task:'Créez une liste combinée avec une colonne <b>type</b> : "Établissement" pour les établissements, "Service" pour les services.',
    hints:['SELECT nom, \'Établissement\' AS type FROM etablissements','UNION SELECT nom_service, \'Service\' AS type FROM services','SELECT nom, \'Établissement\' AS type FROM etablissements UNION SELECT nom_service, \'Service\' AS type FROM services ORDER BY type;']},
  ]},

 {id:'e7',title:'27. EXISTS / NOT EXISTS – Sous-requête d\'existence',hot:true,
  desc:'Tester l\'existence de lignes dans une sous-requête. Très demandé en entretien senior.',
  concept:`<span class="cm">-- EXISTS : vrai si la sous-requête retourne au moins 1 ligne</span>
<span class="kw">SELECT</span> s.nom_service
<span class="kw">FROM</span> <span class="tbl">services</span> s
<span class="kw">WHERE</span> <span class="fn">EXISTS</span> (
  <span class="kw">SELECT</span> <span class="num">1</span> <span class="kw">FROM</span> <span class="tbl">indicateurs_mensuels</span> i
  <span class="kw">WHERE</span> i.id_service = s.id_service
);

<span class="cm">-- NOT EXISTS : services SANS budget</span>
<span class="kw">WHERE</span> <span class="kw">NOT</span> <span class="fn">EXISTS</span> (...)`,
  exercises:[
   {task:'Listez les services qui <b>ont au moins un indicateur</b> enregistré (utilisez EXISTS).',
    hints:['WHERE EXISTS (SELECT 1 FROM indicateurs_mensuels i WHERE i.id_service = s.id_service)','SELECT s.nom_service FROM services s WHERE EXISTS (...);','SELECT s.nom_service FROM services s WHERE EXISTS (SELECT 1 FROM indicateurs_mensuels i WHERE i.id_service = s.id_service);']},
   {task:'Listez les services qui <b>n\'ont aucun budget</b> pour l\'année 2024 (utilisez NOT EXISTS).',
    hints:['WHERE NOT EXISTS (SELECT 1 FROM budgets b WHERE b.id_service = s.id_service AND b.annee = 2024)','SELECT s.nom_service FROM services s','SELECT s.nom_service FROM services s WHERE NOT EXISTS (SELECT 1 FROM budgets b WHERE b.id_service = s.id_service AND b.annee = 2024);']},
   {task:'Listez les établissements qui <b>ont au moins un service</b> enregistré (utilisez EXISTS).',
    hints:['WHERE EXISTS (SELECT 1 FROM services s WHERE s.id_etablissement = e.id_etablissement)','SELECT e.nom, e.ville FROM etablissements e','SELECT e.nom, e.ville FROM etablissements e WHERE EXISTS (SELECT 1 FROM services s WHERE s.id_etablissement = e.id_etablissement);']},
  ]},

 {id:'e8',title:'28. Fonctions de chaînes – UPPER, LOWER, LENGTH, SUBSTRING',hot:true,
  desc:'Manipuler du texte en SQL. Incontournable pour le nettoyage et la transformation de données.',
  concept:`<span class="fn">UPPER</span>(nom_service)     <span class="cm">→ 'CARDIOLOGIE'</span>
<span class="fn">LOWER</span>(type)           <span class="cm">→ 'chu'</span>
<span class="fn">LENGTH</span>(nom_service)    <span class="cm">→ 11</span>
<span class="fn">SUBSTRING</span>(nom, 1, 3)  <span class="cm">→ 'Dr.'</span>
<span class="cm">-- Ou avec opérateur : nom || ' ' || poste</span>`,
  exercises:[
   {task:'Affichez la <b>spécialité en majuscules</b> et la <b>longueur du nom_service</b> pour chaque service.',
    hints:['UPPER(specialite) AS specialite_maj, LENGTH(nom_service) AS longueur_nom','Deux fonctions dans le même SELECT.','SELECT nom_service, UPPER(specialite) AS specialite_maj, LENGTH(nom_service) AS longueur_nom FROM services;']},
   {task:'Affichez le <b>type en minuscules</b> et la <b>longueur du nom</b> de chaque établissement.',
    hints:['LOWER(type) AS type_min, LENGTH(nom) AS longueur_nom','Deux fonctions appliquées sur la table etablissements.','SELECT nom, LOWER(type) AS type_min, LENGTH(nom) AS longueur_nom FROM etablissements;']},
   {task:'Affichez les <b>3 premiers caractères du nom</b> de chaque membre du personnel avec SUBSTRING.',
    hints:['SUBSTRING(nom, 1, 3) AS debut_nom — position 1, longueur 3','SUBSTRING(chaîne, position_départ, longueur)','SELECT nom, SUBSTRING(nom, 1, 3) AS debut_nom FROM personnel;']},
  ]},

 {id:'e9',title:'29. CONCAT & Concaténation',hot:false,
  desc:'Assembler des chaînes. Utilisé pour construire des noms complets, des libellés, des clés.',
  concept:`<span class="cm">-- Avec CONCAT() :</span>
<span class="fn">CONCAT</span>(poste, <span class="str">' - '</span>, nom) <span class="kw">AS</span> fiche

<span class="cm">-- Avec l'opérateur || (standard SQL) :</span>
poste || <span class="str">' - '</span> || nom <span class="kw">AS</span> fiche

<span class="cm">-- Exemple :</span>
<span class="kw">SELECT</span> <span class="fn">CONCAT</span>(poste, <span class="str">' - '</span>, nom) <span class="kw">AS</span> fiche
<span class="kw">FROM</span> <span class="tbl">personnel</span>;`,
  exercises:[
   {task:'Affichez une <b>fiche</b> pour chaque membre du personnel au format : <b>"poste - nom"</b>.',
    hints:['CONCAT(poste, \' - \', nom) AS fiche','Exemple attendu : "Médecin - Dr. Lemoine"','SELECT CONCAT(poste, \' - \', nom) AS fiche FROM personnel;']},
   {task:'Affichez une colonne <b>fiche</b> pour chaque établissement au format : <b>"nom - ville"</b>.',
    hints:['CONCAT(nom, \' - \', ville) AS fiche','Exemple attendu : "CHU Centre - Paris"','SELECT CONCAT(nom, \' - \', ville) AS fiche FROM etablissements;']},
   {task:'Affichez une colonne <b>libelle</b> au format : <b>"nom_service (specialite)"</b> pour chaque service.',
    hints:['CONCAT(nom_service, \' (\', specialite, \')\') AS libelle','Exemple attendu : "Cardiologie (Cardiologie)"','SELECT CONCAT(nom_service, \' (\', specialite, \')\') AS libelle FROM services;']},
  ]},

 {id:'e13',title:'33. CREATE VIEW – Créer une vue',hot:true,
  desc:'Les vues simplifient les requêtes complexes et sécurisent l\'accès aux données.',
  concept:`<span class="cm">-- Créer une vue (table virtuelle) :</span>
<span class="kw">CREATE VIEW</span> vue_personnel_actif <span class="kw">AS</span>
<span class="kw">SELECT</span> nom, poste, id_service
<span class="kw">FROM</span> <span class="tbl">personnel</span>
<span class="kw">WHERE</span> date_depart <span class="kw">IS NULL</span>;

<span class="cm">-- Utiliser la vue comme une table :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> vue_personnel_actif;

<span class="cm">-- Supprimer la vue :</span>
<span class="kw">DROP VIEW</span> vue_personnel_actif;`,
  exercises:[
   {task:'Créez une vue <b>vue_services_critiques</b> contenant les indicateurs avec un taux_occupation supérieur à 90, puis faites un SELECT dessus.',
    hints:['CREATE VIEW vue_services_critiques AS SELECT * FROM indicateurs_mensuels WHERE taux_occupation > 90;','Une vue se comporte comme une table dans les requêtes suivantes.','CREATE VIEW vue_services_critiques AS SELECT * FROM indicateurs_mensuels WHERE taux_occupation > 90; SELECT * FROM vue_services_critiques;']},
   {task:'Créez une vue <b>vue_personnel_actif</b> (date_depart IS NULL), puis listez le nom et le poste de cette vue.',
    hints:['CREATE VIEW vue_personnel_actif AS SELECT * FROM personnel WHERE date_depart IS NULL;','Ensuite : SELECT nom, poste FROM vue_personnel_actif;','CREATE VIEW vue_personnel_actif AS SELECT * FROM personnel WHERE date_depart IS NULL; SELECT nom, poste FROM vue_personnel_actif;']},
   {task:'Créez une vue <b>vue_etablissements_services</b> joignant établissements et services (nom établissement, nom_service, specialite), puis sélectionnez-la.',
    hints:['CREATE VIEW vue_etablissements_services AS SELECT e.nom AS etablissement, s.nom_service, s.specialite FROM etablissements e JOIN services s ON e.id_etablissement = s.id_etablissement;','Ensuite : SELECT * FROM vue_etablissements_services;','CREATE VIEW vue_etablissements_services AS SELECT e.nom AS etablissement, s.nom_service, s.specialite FROM etablissements e JOIN services s ON e.id_etablissement = s.id_etablissement; SELECT * FROM vue_etablissements_services;']},
  ]},

 {id:'e15',title:'35. DENSE_RANK() & NTILE()',hot:true,
  desc:'Fonctions fenêtre avancées. DENSE_RANK évite les "sauts" de rang, NTILE divise en groupes.',
  concept:`<span class="cm">-- DENSE_RANK : pas de saut si ex-aequo</span>
<span class="cm">-- RANK :       1,2,2,4 (saute 3)</span>
<span class="cm">-- DENSE_RANK : 1,2,2,3 (pas de saut)</span>
<span class="fn">DENSE_RANK</span>() <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> salaire_mensuel <span class="kw">DESC</span>)

<span class="cm">-- NTILE(n) : divise en n groupes égaux</span>
<span class="fn">NTILE</span>(<span class="num">3</span>) <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> salaire_mensuel) <span class="kw">AS</span> groupe`,
  exercises:[
   {task:'Divisez le personnel en <b>3 groupes de salaire</b> (NTILE) et affichez aussi leur DENSE_RANK par salaire décroissant.',
    hints:['NTILE(3) OVER (ORDER BY salaire_mensuel) AS groupe_salaire','DENSE_RANK() OVER (ORDER BY salaire_mensuel DESC) AS rang_salaire','SELECT nom, salaire_mensuel, DENSE_RANK() OVER (ORDER BY salaire_mensuel DESC) AS rang, NTILE(3) OVER (ORDER BY salaire_mensuel) AS groupe FROM personnel;']},
   {task:'Divisez les indicateurs en <b>4 quartiles</b> par taux_occupation croissant (NTILE(4)). Affichez id_service, mois, taux_occupation et quartile.',
    hints:['NTILE(4) OVER (ORDER BY taux_occupation) AS quartile','NTILE(4) crée 4 groupes de taille égale (ou quasi-égale).','SELECT id_service, mois, taux_occupation, NTILE(4) OVER (ORDER BY taux_occupation) AS quartile FROM indicateurs_mensuels;']},
   {task:'Classez les services par nb_lits_service décroissant avec <b>DENSE_RANK</b>. Affichez nom_service, nb_lits_service et rang, ordonné par rang.',
    hints:['DENSE_RANK() OVER (ORDER BY nb_lits_service DESC) AS rang','DENSE_RANK ne laisse pas de trous dans la numérotation, contrairement à RANK.','SELECT nom_service, nb_lits_service, DENSE_RANK() OVER (ORDER BY nb_lits_service DESC) AS rang FROM services ORDER BY rang;']},
  ]},

 {id:'e16',title:'36. FIRST_VALUE() & LAST_VALUE()',hot:false,
  desc:'Récupérer la première ou dernière valeur d\'une partition. Utile pour les analyses comparatives.',
  concept:`<span class="fn">FIRST_VALUE</span>(col) <span class="kw">OVER</span> (
  <span class="kw">PARTITION BY</span> id_service
  <span class="kw">ORDER BY</span> col
) <span class="kw">AS</span> valeur_min_du_groupe`,
  exercises:[
   {task:'Pour chaque membre du personnel, affichez le <b>salaire le plus bas</b> de son service via FIRST_VALUE.',
    hints:['FIRST_VALUE(salaire_mensuel) OVER (PARTITION BY id_service ORDER BY salaire_mensuel) AS salaire_min_service','SELECT id_service, nom, salaire_mensuel, FIRST_VALUE(...) OVER (...) AS salaire_min_service','SELECT id_service, nom, salaire_mensuel, FIRST_VALUE(salaire_mensuel) OVER (PARTITION BY id_service ORDER BY salaire_mensuel) AS salaire_min_service FROM personnel ORDER BY id_service;']},
   {task:'Pour chaque indicateur, affichez le <b>taux_occupation minimal</b> de ce service via FIRST_VALUE.',
    hints:['FIRST_VALUE(taux_occupation) OVER (PARTITION BY id_service ORDER BY taux_occupation) AS taux_min_service','SELECT id_service, mois, taux_occupation, FIRST_VALUE(...) OVER (...) AS taux_min_service','SELECT id_service, mois, taux_occupation, FIRST_VALUE(taux_occupation) OVER (PARTITION BY id_service ORDER BY taux_occupation) AS taux_min_service FROM indicateurs_mensuels ORDER BY id_service;']},
   {task:'Pour chaque budget, affichez le <b>budget_reel minimal</b> de ce service via FIRST_VALUE.',
    hints:['FIRST_VALUE(budget_reel) OVER (PARTITION BY id_service ORDER BY budget_reel) AS budget_min_service','SELECT id_service, annee, budget_reel, FIRST_VALUE(...) OVER (...) AS budget_min_service','SELECT id_service, annee, budget_reel, FIRST_VALUE(budget_reel) OVER (PARTITION BY id_service ORDER BY budget_reel) AS budget_min_service FROM budgets ORDER BY id_service;']},
  ]},

 {id:'e17',title:'37. VARIANCE & STDDEV – Statistiques',hot:false,
  desc:'Mesurer la dispersion des données. Demandé dans les postes data science et analyse avancée.',
  concept:`<span class="cm">-- Variance et écart-type (agrégats) :</span>
<span class="kw">SELECT</span>
  <span class="fn">AVG</span>(salaire_mensuel)      <span class="kw">AS</span> moyenne,
  <span class="fn">VARIANCE</span>(salaire_mensuel) <span class="kw">AS</span> variance,
  <span class="fn">STDDEV</span>(salaire_mensuel)   <span class="kw">AS</span> ecart_type
<span class="kw">FROM</span> <span class="tbl">personnel</span>;`,
  exercises:[
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> des salaires du personnel.',
    hints:['SELECT AVG(salaire_mensuel), VARIANCE(salaire_mensuel), STDDEV(salaire_mensuel) FROM personnel;','Utilisez des alias pour chaque colonne.','SELECT AVG(salaire_mensuel) AS moyenne, VARIANCE(salaire_mensuel) AS variance, STDDEV(salaire_mensuel) AS ecart_type FROM personnel;']},
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> des taux d\'occupation.',
    hints:['AVG(taux_occupation), VARIANCE(taux_occupation), STDDEV(taux_occupation) FROM indicateurs_mensuels','SELECT AVG(taux_occupation) AS moy, VARIANCE(taux_occupation) AS variance, STDDEV(taux_occupation) AS ecart_type','SELECT AVG(taux_occupation) AS moy, VARIANCE(taux_occupation) AS variance, STDDEV(taux_occupation) AS ecart_type FROM indicateurs_mensuels;']},
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> du nombre de lits par service.',
    hints:['AVG(nb_lits_service), VARIANCE(nb_lits_service), STDDEV(nb_lits_service) FROM services','SELECT AVG(nb_lits_service) AS moy, VARIANCE(nb_lits_service) AS variance, STDDEV(nb_lits_service) AS ecart_type','SELECT AVG(nb_lits_service) AS moy, VARIANCE(nb_lits_service) AS variance, STDDEV(nb_lits_service) AS ecart_type FROM services;']},
  ]},

 {id:'e18',title:'38. PERCENT_RANK() – Rang en pourcentage',hot:false,
  desc:'Calculer la position relative d\'une ligne (entre 0 et 1). Utile pour les percentiles.',
  concept:`<span class="fn">PERCENT_RANK</span>() <span class="kw">OVER</span> (
  <span class="kw">ORDER BY</span> salaire_mensuel
) <span class="kw">AS</span> percentile

<span class="cm">-- 0 = valeur la plus basse</span>
<span class="cm">-- 1 = valeur la plus haute</span>
<span class="cm">-- 0.5 = médiane (50ème percentile)</span>`,
  exercises:[
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque membre du personnel par salaire croissant.',
    hints:['PERCENT_RANK() OVER (ORDER BY salaire_mensuel) AS percentile','La valeur va de 0 (moins payé) à 1 (plus payé).','SELECT nom, salaire_mensuel, PERCENT_RANK() OVER (ORDER BY salaire_mensuel) AS percentile FROM personnel;']},
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque service par nb_lits_service croissant.',
    hints:['PERCENT_RANK() OVER (ORDER BY nb_lits_service) AS percentile_lits','0 = le plus petit, 1 = le plus grand.','SELECT nom_service, nb_lits_service, PERCENT_RANK() OVER (ORDER BY nb_lits_service) AS percentile_lits FROM services;']},
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque indicateur par taux_occupation croissant.',
    hints:['PERCENT_RANK() OVER (ORDER BY taux_occupation) AS percentile_taux','0 = le moins occupé, 1 = le plus occupé.','SELECT id_service, mois, taux_occupation, PERCENT_RANK() OVER (ORDER BY taux_occupation) AS percentile_taux FROM indicateurs_mensuels;']},
  ]},

 {id:'e19',title:'39. Requête récapitulative complexe',hot:true,
  desc:'Combinaison de plusieurs techniques : JOIN + GROUP BY + HAVING + ORDER BY. Type examen final.',
  concept:`<span class="cm">-- Exemple de requête complexe combinant tout :</span>
<span class="kw">SELECT</span> s.nom_service,
       <span class="fn">COUNT</span>(i.id_indicateur) <span class="kw">AS</span> nb_mois,
       <span class="fn">AVG</span>(i.taux_occupation) <span class="kw">AS</span> taux_moy,
       <span class="fn">SUM</span>(i.cout_moyen_sejour) <span class="kw">AS</span> cout_total
<span class="kw">FROM</span> <span class="tbl">services</span> s
<span class="kw">JOIN</span> <span class="tbl">indicateurs_mensuels</span> i <span class="kw">ON</span> s.id_service = i.id_service
<span class="kw">GROUP BY</span> s.nom_service
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) >= <span class="num">2</span>
<span class="kw">ORDER BY</span> taux_moy <span class="kw">DESC</span>;`,
  exercises:[
   {task:'Pour chaque service ayant <b>au moins 2 mois</b> d\'indicateurs : nom_service, nb_mois, taux_moyen et cout_total. Triez par taux_moyen décroissant.',
    hints:['JOIN indicateurs_mensuels i ON s.id_service = i.id_service','GROUP BY s.nom_service HAVING COUNT(*) >= 2','SELECT s.nom_service, COUNT(i.id_indicateur) AS nb_mois, AVG(i.taux_occupation) AS taux_moyen, SUM(i.cout_moyen_sejour) AS cout_total FROM services s JOIN indicateurs_mensuels i ON s.id_service = i.id_service GROUP BY s.nom_service HAVING COUNT(*) >= 2 ORDER BY taux_moyen DESC;']},
   {task:'Par établissement, affichez le <b>nombre de services distincts</b> et la <b>somme des lits</b>. Triez par nombre de services décroissant.',
    hints:['JOIN etablissements e avec services s ON e.id_etablissement = s.id_etablissement','GROUP BY e.nom, COUNT(DISTINCT s.id_service) AS nb_services, SUM(s.nb_lits_service) AS total_lits','SELECT e.nom AS etablissement, COUNT(DISTINCT s.id_service) AS nb_services, SUM(s.nb_lits_service) AS total_lits FROM etablissements e JOIN services s ON e.id_etablissement = s.id_etablissement GROUP BY e.nom ORDER BY nb_services DESC;']},
   {task:'Pour chaque service ayant <b>au moins 1 budget</b> enregistré : nom_service, nombre de budgets, somme du budget_reel. Triez par somme décroissante.',
    hints:['JOIN services s avec budgets b ON s.id_service = b.id_service','GROUP BY s.nom_service HAVING COUNT(b.id_budget) >= 1','SELECT s.nom_service, COUNT(b.id_budget) AS nb_budgets, SUM(b.budget_reel) AS total_reel FROM services s JOIN budgets b ON s.id_service = b.id_service GROUP BY s.nom_service HAVING COUNT(b.id_budget) >= 1 ORDER BY total_reel DESC;']},
  ]},

 {id:'e20',title:'40. Pivot manuel avec CASE WHEN',hot:true,
  desc:'"Pivoter" des lignes en colonnes : question avancée très fréquente dans les postes BI/reporting.',
  concept:`<span class="cm">-- Transformer des valeurs en colonnes :</span>
<span class="kw">SELECT</span>
  <span class="fn">COUNT</span>(<span class="kw">CASE</span> <span class="kw">WHEN</span> poste=<span class="str">'Médecin'</span> <span class="kw">THEN</span> <span class="num">1</span> <span class="kw">END</span>) <span class="kw">AS</span> nb_medecins,
  <span class="fn">COUNT</span>(<span class="kw">CASE</span> <span class="kw">WHEN</span> poste=<span class="str">'Infirmier'</span> <span class="kw">THEN</span> <span class="num">1</span> <span class="kw">END</span>) <span class="kw">AS</span> nb_infirmiers
<span class="kw">FROM</span> <span class="tbl">personnel</span>;

<span class="cm">-- Idée : COUNT ne compte que les valeurs non-NULL</span>`,
  exercises:[
   {task:'Créez un tableau croisé montrant, <b>par service</b> (id_service), le nombre de <b>Médecins</b> et d\'<b>Infirmiers</b>.',
    hints:['SELECT id_service, COUNT(CASE WHEN poste=\'Médecin\' THEN 1 END) AS nb_medecins, COUNT(CASE WHEN poste=\'Infirmier\' THEN 1 END) AS nb_infirmiers','FROM personnel GROUP BY id_service','SELECT id_service, COUNT(CASE WHEN poste=\'Médecin\' THEN 1 END) AS nb_medecins, COUNT(CASE WHEN poste=\'Infirmier\' THEN 1 END) AS nb_infirmiers FROM personnel GROUP BY id_service ORDER BY id_service;']},
   {task:'Pour chaque service (id_service), comptez les <b>admissions de septembre</b> et de <b>novembre</b> (colonnes adm_sept et adm_nov).',
    hints:['SUM(CASE WHEN mois=\'2024-09-01\' THEN nb_admissions END) AS adm_sept','SUM(CASE WHEN mois=\'2024-11-01\' THEN nb_admissions END) AS adm_nov','SELECT id_service, SUM(CASE WHEN mois=\'2024-09-01\' THEN nb_admissions END) AS adm_sept, SUM(CASE WHEN mois=\'2024-11-01\' THEN nb_admissions END) AS adm_nov FROM indicateurs_mensuels GROUP BY id_service;']},
   {task:'Affichez en une seule ligne le <b>budget_reel total de 2023</b> et de <b>2024</b> (colonnes budget_2023 et budget_2024).',
    hints:['SUM(CASE WHEN annee=2023 THEN budget_reel END) AS budget_2023','SUM(CASE WHEN annee=2024 THEN budget_reel END) AS budget_2024','SELECT SUM(CASE WHEN annee=2023 THEN budget_reel END) AS budget_2023, SUM(CASE WHEN annee=2024 THEN budget_reel END) AS budget_2024 FROM budgets;']},
  ]},

 {id:'e21',title:'41. INTERSECT / EXCEPT – Intersection et exclusion',hot:true,
  desc:'Compléments de UNION : trouver des lignes communes ou absentes entre deux requêtes.',
  concept:`<span class="cm">-- INTERSECT : lignes présentes dans LES DEUX requêtes</span>
<span class="kw">SELECT</span> id_service <span class="kw">FROM</span> <span class="tbl">indicateurs_mensuels</span> <span class="kw">WHERE</span> taux_occupation > <span class="num">90</span>
<span class="kw">INTERSECT</span>
<span class="kw">SELECT</span> id_service <span class="kw">FROM</span> <span class="tbl">budgets</span> <span class="kw">WHERE</span> budget_reel > budget_prevu;

<span class="cm">-- EXCEPT : lignes dans la 1ère mais PAS dans la 2ème</span>
<span class="kw">SELECT</span> id_service <span class="kw">FROM</span> <span class="tbl">budgets</span> <span class="kw">WHERE</span> annee = <span class="num">2023</span>
<span class="kw">EXCEPT</span>
<span class="kw">SELECT</span> id_service <span class="kw">FROM</span> <span class="tbl">budgets</span> <span class="kw">WHERE</span> annee = <span class="num">2024</span>;
<span class="cm">-- Règle : même nombre de colonnes et mêmes types</span>`,
  exercises:[
   {task:'Trouvez les <b>id_service</b> ayant à la fois un <b>taux_occupation > 90</b> ET un <b>dépassement budgétaire</b> (budget_reel > budget_prevu) — utilisez INTERSECT.',
    hints:['SELECT id_service FROM indicateurs_mensuels WHERE taux_occupation > 90','INTERSECT','SELECT id_service FROM indicateurs_mensuels WHERE taux_occupation > 90 INTERSECT SELECT id_service FROM budgets WHERE budget_reel > budget_prevu;']},
   {task:'Trouvez les <b>id_service</b> ayant un budget en <b>2023</b> mais <b>aucun budget en 2024</b> (utilisez EXCEPT).',
    hints:['SELECT id_service FROM budgets WHERE annee = 2023','EXCEPT SELECT id_service FROM budgets WHERE annee = 2024','SELECT id_service FROM budgets WHERE annee = 2023 EXCEPT SELECT id_service FROM budgets WHERE annee = 2024;']},
   {task:'Trouvez les <b>id_service</b> ayant un <b>Médecin</b> mais <b>aucun Aide-soignant</b> dans leur personnel (utilisez EXCEPT).',
    hints:['SELECT id_service FROM personnel WHERE poste = \'Médecin\'','EXCEPT SELECT id_service FROM personnel WHERE poste = \'Aide-soignant\'','SELECT id_service FROM personnel WHERE poste = \'Médecin\' EXCEPT SELECT id_service FROM personnel WHERE poste = \'Aide-soignant\';']},
  ]},

 {id:'e22',title:'42. NOW, DATEDIFF, DATE_FORMAT – Dates avancées',hot:true,
  desc:'Calculer des durées et reformater des dates : essentiel pour les rapports temporels.',
  concept:`<span class="cm">-- Date et heure actuelles :</span>
<span class="fn">NOW</span>()      <span class="cm">→ '2026-06-22 10:30:00'</span>
<span class="fn">CURDATE</span>()  <span class="cm">→ '2026-06-22'</span>

<span class="cm">-- Différence en jours :</span>
<span class="fn">DATEDIFF</span>(date_depart, date_embauche)  <span class="cm">→ nombre de jours</span>

<span class="cm">-- Reformater une date :</span>
<span class="fn">DATE_FORMAT</span>(mois, <span class="str">'%m/%Y'</span>)  <span class="cm">→ '09/2024'</span>`,
  exercises:[
   {task:'Affichez la <b>date et heure actuelles</b> avec NOW() dans une colonne <b>maintenant</b>, et la date du jour avec CURDATE() dans <b>aujourd_hui</b>.',
    hints:['SELECT NOW() AS maintenant, CURDATE() AS aujourd_hui;','Pas besoin de FROM — c\'est une requête sur des valeurs constantes.','SELECT NOW() AS maintenant, CURDATE() AS aujourd_hui;']},
   {task:'Pour le personnel ayant quitté (date_depart renseignée), affichez la <b>durée travaillée en jours</b> avec DATEDIFF.',
    hints:['DATEDIFF(date_depart, date_embauche) AS duree_jours','SELECT nom, date_embauche, date_depart, DATEDIFF(date_depart, date_embauche) AS duree_jours FROM personnel WHERE date_depart IS NOT NULL;','SELECT nom, date_embauche, date_depart, DATEDIFF(date_depart, date_embauche) AS duree_jours FROM personnel WHERE date_depart IS NOT NULL;']},
   {task:'Formatez le <b>mois</b> de chaque indicateur au format <b>\'%m/%Y\'</b> dans une colonne <b>mois_fr</b>.',
    hints:['DATE_FORMAT(mois, \'%m/%Y\') AS mois_fr','%m = mois à 2 chiffres, %Y = année à 4 chiffres.','SELECT id_service, DATE_FORMAT(mois, \'%m/%Y\') AS mois_fr FROM indicateurs_mensuels;']},
  ]},

 {id:'e23',title:'43. TRIM, REPLACE, LEFT, RIGHT – Nettoyage de chaînes',hot:true,
  desc:'Fonctions essentielles pour nettoyer et transformer des données textuelles brutes.',
  concept:`<span class="cm">-- Supprimer les espaces :</span>
<span class="fn">TRIM</span>(nom)          <span class="cm">→ 'Dr. Lemoine' (sans espaces)</span>

<span class="cm">-- Remplacer du texte :</span>
<span class="fn">REPLACE</span>(col, <span class="str">'ancien'</span>, <span class="str">'nouveau'</span>)

<span class="cm">-- Extraire les N premiers / derniers caractères :</span>
<span class="fn">LEFT</span>(type, <span class="num">3</span>)     <span class="cm">→ 'CHU' (3 premiers)</span>
<span class="fn">RIGHT</span>(ville, <span class="num">3</span>)   <span class="cm">→ 'lle' (3 derniers)</span>`,
  exercises:[
   {task:'Nettoyez les noms du personnel : affichez le nom avec <b>TRIM</b> et la <b>première lettre</b> avec LEFT(nom, 1) dans une colonne <b>initiale</b>.',
    hints:['TRIM(nom) AS nom_propre, LEFT(nom, 1) AS initiale','LEFT(col, n) retourne les n premiers caractères de gauche.','SELECT TRIM(nom) AS nom_propre, LEFT(nom, 1) AS initiale FROM personnel;']},
   {task:'Dans les services, <b>remplacez</b> "Gynécologie-Obstétrique" par "Gynéco-Obstétrique" avec REPLACE. Affichez specialite et specialite_courte.',
    hints:['REPLACE(specialite, \'Gynécologie-Obstétrique\', \'Gynéco-Obstétrique\') AS specialite_courte','REPLACE(colonne, ancien, nouveau)','SELECT specialite, REPLACE(specialite, \'Gynécologie-Obstétrique\', \'Gynéco-Obstétrique\') AS specialite_courte FROM services;']},
   {task:'Affichez les <b>3 premiers caractères du type</b> d\'établissement avec LEFT et les <b>3 derniers caractères de la ville</b> avec RIGHT.',
    hints:['LEFT(type, 3) AS type_abr, RIGHT(ville, 3) AS fin_ville','Exemple : LEFT(\'Clinique\', 3) = \'Cli\', RIGHT(\'Lille\', 3) = \'lle\'','SELECT nom, type, LEFT(type, 3) AS type_abr, ville, RIGHT(ville, 3) AS fin_ville FROM etablissements;']},
  ]},
] };

const SCHEMA_DEF_BI = [
  {name:'etablissements',rows:[{c:'id_etablissement',t:'INTEGER',n:'PK'},{c:'nom',t:'TEXT',n:''},{c:'ville',t:'TEXT',n:''},{c:'region',t:'TEXT',n:''},{c:'type',t:'TEXT',n:"'CHU'/'CHR'/'Clinique'"},{c:'nb_lits',t:'INTEGER',n:''}]},
  {name:'services',rows:[{c:'id_service',t:'INTEGER',n:'PK'},{c:'id_etablissement',t:'INTEGER',n:'FK'},{c:'nom_service',t:'TEXT',n:''},{c:'specialite',t:'TEXT',n:''},{c:'nb_lits_service',t:'INTEGER',n:''}]},
  {name:'personnel',rows:[{c:'id_personnel',t:'INTEGER',n:'PK'},{c:'id_service',t:'INTEGER',n:'FK'},{c:'nom',t:'TEXT',n:''},{c:'poste',t:'TEXT',n:"'Médecin'/'Infirmier'/'Aide-soignant'"},{c:'etp',t:'REAL',n:'0–1'},{c:'salaire_mensuel',t:'INTEGER',n:'€'},{c:'date_embauche',t:'TEXT',n:''},{c:'date_depart',t:'TEXT',n:'NULL=en poste'}]},
  {name:'indicateurs_mensuels',rows:[{c:'id_indicateur',t:'INTEGER',n:'PK'},{c:'id_service',t:'INTEGER',n:'FK'},{c:'mois',t:'TEXT',n:'1er du mois'},{c:'nb_admissions',t:'INTEGER',n:''},{c:'nb_sorties',t:'INTEGER',n:''},{c:'duree_moy_sejour',t:'REAL',n:'jours'},{c:'taux_occupation',t:'REAL',n:'%'},{c:'cout_moyen_sejour',t:'REAL',n:'€'},{c:'satisfaction_score',t:'REAL',n:'/10'}]},
  {name:'budgets',rows:[{c:'id_budget',t:'INTEGER',n:'PK'},{c:'id_service',t:'INTEGER',n:'FK'},{c:'annee',t:'INTEGER',n:''},{c:'budget_prevu',t:'INTEGER',n:'€'},{c:'budget_reel',t:'INTEGER',n:'€'}]},
];

DOMAINS['sante-bi'] = { meta: DOMAIN_META_BI, sqlInit: SQL_INIT_BI, skillMap: SKILL_MAP_BI, cur: CUR_BI, schemaDef: SCHEMA_DEF_BI };
