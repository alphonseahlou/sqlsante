// ═══════════════════════════════════════
// DOMAINE : Gestion Hospitalière
//
// Ce fichier est auto-suffisant : données SQL, leçons, schéma, compétences.
// Pour ajouter un domaine, dupliquer ce fichier et le charger dans index.html.
//
// Chargement : index.html → sante-hop.js → db.js → app.js
// ═══════════════════════════════════════

// Initialisation du registre global si ce fichier est le premier domaine chargé.
if (!window.DOMAINS) window.DOMAINS = {};

// Métadonnées du domaine — affichées dans le sélecteur de domaine
const DOMAIN_META = {
  id: 'sante-hop',
  name: 'Gestion Hospitalière',
  icon: '🏥',
  description: 'Patients, consultations, médecins, médicaments, hospitalisations'
};

// Données SQL injectées dans SQLite au démarrage.
// Modifier ici pour ajouter des tables, des lignes ou ajuster les valeurs de la BD.
const SQL_INIT = `
CREATE TABLE patients (
  id_patient INTEGER, nom TEXT, prenom TEXT, age INTEGER,
  sexe TEXT, groupe_sanguin TEXT, service TEXT,
  date_admission TEXT, medecin_id INTEGER, statut TEXT
);
INSERT INTO patients VALUES
  (1,'Martin','Sophie',59,'F','A+','Cardiologie','2024-11-03',2,'Hospitalisé'),
  (2,'Dubois','Marc',46,'M','O+','Neurologie','2024-11-07',3,'Hospitalisé'),
  (3,'Leroy','Claire',33,'F','B-','Cardiologie','2024-11-10',2,'Ambulatoire'),
  (4,'Bernard','Jean',72,'M','AB+','Oncologie','2024-11-01',1,'Hospitalisé'),
  (5,'Petit','Isabelle',40,'F','A-','Cardiologie','2024-11-12',2,'Hospitalisé'),
  (6,'Richard','Paul',79,'M','O-','Gériatrie','2024-10-28',4,'Hospitalisé'),
  (7,'Thomas','Anne',23,'F','B+','Urgences','2024-11-14',5,'Ambulatoire'),
  (8,'Moreau','Luc',55,'M','A+','Neurologie','2024-10-15',3,'Hospitalisé'),
  (9,'Simon','Marie',68,'F','O+','Gériatrie','2024-10-20',4,'Ambulatoire'),
  (10,'Laurent','Pierre',31,'M','AB-','Oncologie','2024-11-05',1,'Hospitalisé');

CREATE TABLE consultations (
  id_consultation INTEGER, id_patient INTEGER, date_consultation TEXT,
  diagnostic TEXT, traitement TEXT, medecin_id INTEGER, duree_min INTEGER
);
INSERT INTO consultations VALUES
  (1,1,'2024-11-03','Hypertension artérielle','Lisinopril 10mg',2,25),
  (2,2,'2024-11-07','Migraine chronique','Sumatriptan 50mg',3,40),
  (3,3,'2024-11-10','Arythmie cardiaque','Amiodarone 200mg',2,30),
  (4,4,'2024-11-01','Cancer colorectal stade II','Chimiothérapie FOLFOX',1,60),
  (5,1,'2024-01-15','Contrôle tensionnel','Ajustement posologie',2,20),
  (6,5,'2024-11-12','Insuffisance cardiaque','Furosémide 40mg',2,35),
  (7,7,'2024-11-14','Fracture cheville','Plâtre + antidouleurs',5,45),
  (8,8,'2024-10-15','Épilepsie focale','Lévétiracétam 500mg',3,50),
  (9,9,'2024-10-20','Démence sénile','Donépézil 10mg',4,55),
  (10,10,'2024-11-05','Lymphome non hodgkinien','Rituximab + CHOP',1,65);

CREATE TABLE medecins (
  id_medecin INTEGER, nom TEXT, specialite TEXT, service TEXT, salaire INTEGER
);
INSERT INTO medecins VALUES
  (1,'Dr. Mercier','Oncologie','Oncologie',9500),
  (2,'Dr. Fontaine','Cardiologie','Cardiologie',8800),
  (3,'Dr. Garnier','Neurologie','Neurologie',8200),
  (4,'Dr. Rousseau','Gériatrie','Gériatrie',7600),
  (5,'Dr. Blanc','Urgences','Urgences',8500);

CREATE TABLE medicaments (
  id_medicament INTEGER, nom_medicament TEXT, categorie TEXT, prix_unitaire REAL
);
INSERT INTO medicaments VALUES
  (1,'Lisinopril','Antihypertenseur',0.15),
  (2,'Sumatriptan','Antimigraineux',2.40),
  (3,'Amiodarone','Antiarythmique',0.85),
  (4,'Furosémide','Diurétique',0.10),
  (5,'Lévétiracétam','Antiépileptique',1.20),
  (6,'Metformine','Antidiabétique',0.08),
  (7,'Atorvastatine','Hypolipémiant',0.30);

CREATE TABLE prescriptions (
  id_prescription INTEGER, id_consultation INTEGER, id_medicament INTEGER,
  quantite INTEGER, duree_jours INTEGER
);
INSERT INTO prescriptions VALUES
  (1,1,1,30,90),
  (2,2,2,10,14),
  (3,3,3,30,180),
  (4,6,4,30,60),
  (5,8,5,60,365),
  (6,1,7,30,90),
  (7,4,6,60,180);

CREATE TABLE hospitalisations (
  id_hosp INTEGER, id_patient INTEGER, date_entree TEXT,
  date_sortie TEXT, chambre TEXT, cout_journalier INTEGER
);
INSERT INTO hospitalisations VALUES
  (1,1,'2024-11-03','2024-11-10','A101',450),
  (2,2,'2024-11-07',NULL,'B205',520),
  (3,4,'2024-11-01','2024-11-15','C302',680),
  (4,5,'2024-11-12',NULL,'A103',450),
  (5,6,'2024-10-28','2024-11-08','D401',390),
  (6,8,'2024-10-15','2024-10-25','B210',520),
  (7,10,'2024-11-05',NULL,'C305',680);
`;

// Cartographie des compétences SQL pour le graphique radar.
// Associe chaque catégorie aux IDs de leçons qui la couvrent.
// À mettre à jour si de nouvelles leçons sont ajoutées au curriculum.
const SKILL_MAP = {
  'SELECT & Filtres': ['d1','d2','d3','d4','d5','d6','i7'],
  'Jointures':        ['i1','i2','i6','a5','e7'],
  'Agrégation':       ['i3','i4','i5','a4','e17','e18'],
  'CTE / Sous-req.':  ['a1','a2','e4','e19'],
  'Fenêtrage':        ['e1','e2','e3','e15','e16'],
  'DML / DDL':        ['e10','e11','e12','e5','e13','e14'],
  'Chaînes & Dates':  ['a6','a7','e8','e9','e22','e23'],
  'CASE & Ensembles': ['a3','e6','e20','e21'],
};

// ═══════════════════════════════════════
// CURRICULUM — 40 leçons × 3 exercices
// ═══════════════════════════════════════
const CUR={
d:[
 {id:'d1',title:'1. SELECT – Lire des données',hot:true,
  desc:'Commande fondamentale pour récupérer des données. Présente dans 100% des offres d\'emploi.',
  concept:`<span class="kw">SELECT</span> colonne1, colonne2 <span class="kw">FROM</span> table;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">patients</span>;  <span class="cm">-- toutes les colonnes</span>
<span class="kw">SELECT</span> nom, age <span class="kw">FROM</span> <span class="tbl">patients</span>;  <span class="cm">-- colonnes spécifiques</span>`,
  exercises:[
   {task:'Sélectionnez le <b>nom</b>, le <b>prenom</b> et le <b>groupe_sanguin</b> de tous les patients.',
    hints:['Utilisez SELECT col1, col2, col3 FROM table;','Colonnes : nom, prenom, groupe_sanguin','SELECT nom, prenom, groupe_sanguin FROM patients;']},
   {task:'Sélectionnez l\'<b>id_patient</b>, le <b>nom</b> et l\'<b>age</b> de tous les patients.',
    hints:['SELECT col1, col2, col3 FROM table;','Colonnes : id_patient, nom, age','SELECT id_patient, nom, age FROM patients;']},
   {task:'Sélectionnez <b>toutes les colonnes</b> de la table <b>medecins</b>.',
    hints:['Utilisez * pour toutes les colonnes.','La table s\'appelle medecins (sans accent).','SELECT * FROM medecins;']},
  ]},

 {id:'d2',title:'2. WHERE – Filtrer les lignes',hot:true,
  desc:'Filtrer les résultats selon des conditions. Indispensable dans tout rôle de données.',
  concept:`<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">patients</span> <span class="kw">WHERE</span> service = <span class="str">'Cardiologie'</span>;
<span class="kw">WHERE</span> age > <span class="num">60</span>
<span class="kw">WHERE</span> sexe != <span class="str">'M'</span>
<span class="cm">-- Texte : guillemets simples. Nombres : sans guillemets.</span>`,
  exercises:[
   {task:'Listez tous les patients du service <b>Cardiologie</b>.',
    hints:['Ajoutez WHERE après FROM.','La valeur est \'Cardiologie\' (avec guillemets simples).','SELECT * FROM patients WHERE service = \'Cardiologie\';']},
   {task:'Listez tous les patients de sexe <b>M</b>.',
    hints:['WHERE sexe = \'valeur\'','La valeur est la lettre M entre guillemets simples.','SELECT * FROM patients WHERE sexe = \'M\';']},
   {task:'Listez les patients dont l\'âge est <b>supérieur à 60 ans</b>.',
    hints:['WHERE age > nombre (sans guillemets pour les nombres)','60 est un nombre, pas de guillemets simples.','SELECT * FROM patients WHERE age > 60;']},
  ]},

 {id:'d3',title:'3. AND / OR / BETWEEN / IN',hot:true,
  desc:'Combiner des conditions. Très fréquent dans les tests techniques d\'entretien.',
  concept:`<span class="kw">WHERE</span> service = <span class="str">'Cardiologie'</span> <span class="kw">AND</span> sexe = <span class="str">'F'</span>
<span class="kw">WHERE</span> age < <span class="num">30</span> <span class="kw">OR</span> age > <span class="num">70</span>
<span class="kw">WHERE</span> age <span class="kw">BETWEEN</span> <span class="num">40</span> <span class="kw">AND</span> <span class="num">60</span>
<span class="kw">WHERE</span> service <span class="kw">IN</span> (<span class="str">'Cardiologie'</span>, <span class="str">'Neurologie'</span>)`,
  exercises:[
   {task:'Trouvez les patients dont le service est <b>Cardiologie ou Neurologie</b> ET dont l\'âge est entre <b>30 et 60 ans</b>.',
    hints:['Utilisez IN (\'Cardiologie\', \'Neurologie\') pour le service.','Utilisez BETWEEN 30 AND 60 pour l\'âge.','SELECT * FROM patients WHERE service IN (\'Cardiologie\', \'Neurologie\') AND age BETWEEN 30 AND 60;']},
   {task:'Trouvez les patients de sexe <b>F</b> appartenant au service <b>Gériatrie</b> ou <b>Oncologie</b>.',
    hints:['Combinez WHERE sexe = \'F\' AND service IN (...)','IN (\'Gériatrie\', \'Oncologie\')','SELECT * FROM patients WHERE sexe = \'F\' AND service IN (\'Gériatrie\', \'Oncologie\');']},
   {task:'Listez les médecins dont le salaire est <b>entre 8000 et 9000</b> (inclus).',
    hints:['La table est medecins, la colonne est salaire.','BETWEEN 8000 AND 9000','SELECT * FROM medecins WHERE salaire BETWEEN 8000 AND 9000;']},
  ]},

 {id:'d4',title:'4. NULL – IS NULL / IS NOT NULL / COALESCE',hot:true,
  desc:'Gérer les valeurs manquantes : question incontournable en entretien data analyst.',
  concept:`<span class="cm">-- Tester la présence d'un NULL :</span>
<span class="kw">WHERE</span> date_sortie <span class="kw">IS NULL</span>       <span class="cm">-- encore hospitalisé</span>
<span class="kw">WHERE</span> date_sortie <span class="kw">IS NOT NULL</span>   <span class="cm">-- sorti</span>

<span class="cm">-- Remplacer NULL par une valeur :</span>
<span class="fn">COALESCE</span>(date_sortie, <span class="str">'En cours'</span>)`,
  exercises:[
   {task:'Listez les hospitalisations <b>encore en cours</b> (date_sortie est NULL). Affichez id_patient, chambre et date_entree.',
    hints:['La table s\'appelle hospitalisations.','WHERE date_sortie IS NULL','SELECT id_patient, chambre, date_entree FROM hospitalisations WHERE date_sortie IS NULL;']},
   {task:'Listez les hospitalisations <b>terminées</b> (date_sortie est renseignée). Affichez id_patient, chambre, date_entree et date_sortie.',
    hints:['IS NOT NULL teste qu\'une valeur existe.','WHERE date_sortie IS NOT NULL','SELECT id_patient, chambre, date_entree, date_sortie FROM hospitalisations WHERE date_sortie IS NOT NULL;']},
   {task:'Affichez toutes les hospitalisations avec la date_sortie remplacée par <b>"En cours"</b> si elle est NULL. Colonnes : id_hosp, chambre, date_entree, statut.',
    hints:['COALESCE(date_sortie, \'En cours\') AS statut','SELECT id_hosp, chambre, date_entree, COALESCE(date_sortie, \'En cours\') AS statut','SELECT id_hosp, chambre, date_entree, COALESCE(date_sortie, \'En cours\') AS statut FROM hospitalisations;']},
  ]},

 {id:'d5',title:'5. ORDER BY & LIMIT',hot:false,
  desc:'Trier et paginer les résultats. Base de tout rapport ou dashboard.',
  concept:`<span class="kw">ORDER BY</span> age <span class="kw">DESC</span>   <span class="cm">-- décroissant</span>
<span class="kw">ORDER BY</span> nom <span class="kw">ASC</span>    <span class="cm">-- croissant (défaut)</span>
<span class="kw">ORDER BY</span> service, age <span class="kw">DESC</span>  <span class="cm">-- multi-colonnes</span>
<span class="kw">LIMIT</span> <span class="num">5</span>               <span class="cm">-- 5 premières lignes</span>`,
  exercises:[
   {task:'Les <b>3 patients les plus âgés</b> : nom, prenom, age, service.',
    hints:['ORDER BY age DESC','LIMIT 3 à la fin','SELECT nom, prenom, age, service FROM patients ORDER BY age DESC LIMIT 3;']},
   {task:'Les <b>5 consultations les plus longues</b> : diagnostic, duree_min, medecin_id.',
    hints:['ORDER BY duree_min DESC','LIMIT 5','SELECT diagnostic, duree_min, medecin_id FROM consultations ORDER BY duree_min DESC LIMIT 5;']},
   {task:'Les <b>3 médecins les mieux payés</b> : nom, specialite, salaire.',
    hints:['ORDER BY salaire DESC','LIMIT 3','SELECT nom, specialite, salaire FROM medecins ORDER BY salaire DESC LIMIT 3;']},
  ]},

 {id:'d6',title:'6. DISTINCT – Dédoublonner',hot:false,
  desc:'Éliminer les doublons dans les résultats. Souvent demandé pour l\'analyse de données.',
  concept:`<span class="cm">-- Valeurs uniques d'une colonne :</span>
<span class="kw">SELECT DISTINCT</span> service <span class="kw">FROM</span> <span class="tbl">patients</span>;

<span class="cm">-- Combinaisons uniques :</span>
<span class="kw">SELECT DISTINCT</span> service, sexe <span class="kw">FROM</span> <span class="tbl">patients</span>;`,
  exercises:[
   {task:'Listez tous les <b>services distincts</b> présents dans la table patients.',
    hints:['Utilisez SELECT DISTINCT.','SELECT DISTINCT service FROM patients;','Une seule colonne suffit ici.']},
   {task:'Listez toutes les <b>spécialités distinctes</b> des médecins.',
    hints:['SELECT DISTINCT colonne FROM table;','La colonne s\'appelle specialite dans la table medecins.','SELECT DISTINCT specialite FROM medecins;']},
   {task:'Listez toutes les combinaisons distinctes de <b>service</b> et <b>statut</b> des patients.',
    hints:['SELECT DISTINCT col1, col2 retourne des paires uniques.','SELECT DISTINCT service, statut FROM patients;','Chaque paire (service, statut) n\'apparaît qu\'une seule fois.']},
  ]},
],
i:[
 {id:'i1',title:'7. INNER JOIN – Joindre deux tables',hot:true,
  desc:'Combiner des tables liées. Question numéro 1 dans les tests SQL en entretien.',
  concept:`<span class="kw">SELECT</span> p.nom, c.diagnostic
<span class="kw">FROM</span> <span class="tbl">patients</span> p
<span class="kw">INNER JOIN</span> <span class="tbl">consultations</span> c
  <span class="kw">ON</span> p.id_patient = c.id_patient;
<span class="cm">-- Seules les lignes avec correspondance des deux côtés</span>`,
  exercises:[
   {task:'Affichez le <b>nom du patient</b>, la <b>date_consultation</b> et le <b>diagnostic</b> pour chaque consultation.',
    hints:['INNER JOIN consultations c','ON p.id_patient = c.id_patient','SELECT p.nom, c.date_consultation, c.diagnostic FROM patients p INNER JOIN consultations c ON p.id_patient = c.id_patient;']},
   {task:'Affichez le <b>nom du patient</b>, la <b>chambre</b> et la <b>date_entree</b> pour chaque hospitalisation.',
    hints:['JOIN hospitalisations h ON p.id_patient = h.id_patient','SELECT p.nom, h.chambre, h.date_entree','SELECT p.nom, h.chambre, h.date_entree FROM patients p INNER JOIN hospitalisations h ON p.id_patient = h.id_patient;']},
   {task:'Affichez le <b>nom du médecin</b>, le <b>diagnostic</b> et la <b>duree_min</b> pour chaque consultation.',
    hints:['JOIN du côté consultations → medecins','ON c.medecin_id = m.id_medecin','SELECT m.nom AS medecin, c.diagnostic, c.duree_min FROM consultations c INNER JOIN medecins m ON c.medecin_id = m.id_medecin;']},
  ]},

 {id:'i2',title:'8. LEFT JOIN – Garder tout à gauche',hot:true,
  desc:'Inclure les lignes sans correspondance. Très testé pour l\'analyse de données manquantes.',
  concept:`<span class="kw">FROM</span> <span class="tbl">patients</span> p
<span class="kw">LEFT JOIN</span> <span class="tbl">consultations</span> c
  <span class="kw">ON</span> p.id_patient = c.id_patient;
<span class="cm">-- Patient sans consultation → diagnostic = NULL</span>
<span class="cm">-- INNER JOIN l'aurait exclu</span>`,
  exercises:[
   {task:'Listez <b>tous les patients</b> avec leur diagnostic (NULL si aucune consultation).',
    hints:['LEFT JOIN au lieu de INNER JOIN.','ON p.id_patient = c.id_patient','SELECT p.nom, p.prenom, c.diagnostic FROM patients p LEFT JOIN consultations c ON p.id_patient = c.id_patient;']},
   {task:'Listez <b>tous les patients</b> avec leur chambre d\'hospitalisation (NULL si non hospitalisé).',
    hints:['LEFT JOIN hospitalisations h ON p.id_patient = h.id_patient','SELECT p.nom, p.prenom, h.chambre','SELECT p.nom, p.prenom, h.chambre FROM patients p LEFT JOIN hospitalisations h ON p.id_patient = h.id_patient;']},
   {task:'Listez <b>tous les médecins</b> avec le diagnostic de leurs consultations (NULL si aucune consultation).',
    hints:['Partez de medecins et LEFT JOIN consultations','ON m.id_medecin = c.medecin_id','SELECT m.nom AS medecin, c.diagnostic FROM medecins m LEFT JOIN consultations c ON m.id_medecin = c.medecin_id;']},
  ]},

 {id:'i3',title:'9. COUNT / AVG / SUM / MIN / MAX',hot:true,
  desc:'Fonctions d\'agrégation. Présentes dans 95% des postes data analyst.',
  concept:`<span class="kw">SELECT</span>
  <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb_total,
  <span class="fn">COUNT</span>(date_sortie) <span class="kw">AS</span> nb_sortis,  <span class="cm">-- ignore NULL</span>
  <span class="fn">AVG</span>(age)   <span class="kw">AS</span> age_moyen,
  <span class="fn">SUM</span>(duree_min) <span class="kw">AS</span> total_min,
  <span class="fn">MAX</span>(age)   <span class="kw">AS</span> age_max
<span class="kw">FROM</span> <span class="tbl">patients</span>;`,
  exercises:[
   {task:'Calculez : nombre total de patients, âge moyen, âge maximum et âge minimum.',
    hints:['COUNT(*), AVG(age), MAX(age), MIN(age)','Utilisez AS pour nommer chaque résultat.','SELECT COUNT(*) AS nb, AVG(age) AS age_moyen, MAX(age) AS age_max, MIN(age) AS age_min FROM patients;']},
   {task:'Calculez la durée totale, la durée moyenne et la durée maximale des consultations.',
    hints:['SUM(duree_min), AVG(duree_min), MAX(duree_min)','FROM consultations','SELECT SUM(duree_min) AS total_min, AVG(duree_min) AS duree_moy, MAX(duree_min) AS duree_max FROM consultations;']},
   {task:'Calculez le coût journalier moyen, minimum et maximum des hospitalisations.',
    hints:['AVG(cout_journalier), MIN(cout_journalier), MAX(cout_journalier)','FROM hospitalisations','SELECT AVG(cout_journalier) AS moy, MIN(cout_journalier) AS min_cout, MAX(cout_journalier) AS max_cout FROM hospitalisations;']},
  ]},

 {id:'i4',title:'10. GROUP BY – Statistiques par groupe',hot:true,
  desc:'Regrouper et agréger. Omniprésent dans les analyses et tableaux de bord.',
  concept:`<span class="kw">SELECT</span> service, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">patients</span>
<span class="kw">GROUP BY</span> service
<span class="kw">ORDER BY</span> nb <span class="kw">DESC</span>;
<span class="cm">-- GROUP_CONCAT : concatène les valeurs d'un groupe</span>
<span class="fn">GROUP_CONCAT</span>(nom <span class="kw">SEPARATOR</span> <span class="str">', '</span>) <span class="kw">AS</span> liste_noms`,
  exercises:[
   {task:'Nombre de patients et âge moyen <b>par service</b>, du service le plus chargé au moins.',
    hints:['GROUP BY service','COUNT(*) AS nb_patients, AVG(age) AS age_moyen','SELECT service, COUNT(*) AS nb_patients, AVG(age) AS age_moyen FROM patients GROUP BY service ORDER BY nb_patients DESC;']},
   {task:'Nombre de consultations et durée moyenne <b>par médecin</b> (medecin_id), triés par nombre décroissant.',
    hints:['GROUP BY medecin_id','COUNT(*) AS nb_consultations, AVG(duree_min) AS duree_moy','SELECT medecin_id, COUNT(*) AS nb_consultations, AVG(duree_min) AS duree_moy FROM consultations GROUP BY medecin_id ORDER BY nb_consultations DESC;']},
   {task:'Pour chaque service, affichez la <b>liste des noms de patients</b> séparés par une virgule avec <b>GROUP_CONCAT</b>.',
    hints:['GROUP_CONCAT(nom SEPARATOR \', \') AS liste_patients','SELECT service, GROUP_CONCAT(nom SEPARATOR \', \') AS liste_patients FROM patients GROUP BY service;','GROUP_CONCAT concatène toutes les valeurs du groupe en une seule chaîne.']},
  ]},

 {id:'i5',title:'11. HAVING – Filtrer les groupes',hot:true,
  desc:'HAVING filtre après GROUP BY. WHERE ne peut pas utiliser les agrégats.',
  concept:`<span class="cm">-- WHERE filtre les LIGNES (avant groupement)</span>
<span class="cm">-- HAVING filtre les GROUPES (après groupement)</span>

<span class="kw">SELECT</span> service, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">patients</span>
<span class="kw">GROUP BY</span> service
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) >= <span class="num">2</span>;`,
  exercises:[
   {task:'Listez les services ayant <b>au moins 2 patients</b>.',
    hints:['GROUP BY service','HAVING COUNT(*) >= 2','SELECT service, COUNT(*) AS nb FROM patients GROUP BY service HAVING COUNT(*) >= 2;']},
   {task:'Listez les médecins (medecin_id) ayant fait <b>au moins 2 consultations</b>.',
    hints:['GROUP BY medecin_id FROM consultations','HAVING COUNT(*) >= 2','SELECT medecin_id, COUNT(*) AS nb_consultations FROM consultations GROUP BY medecin_id HAVING COUNT(*) >= 2;']},
   {task:'Listez les médicaments (id_medicament) prescrits avec une <b>quantité totale supérieure à 30</b>.',
    hints:['GROUP BY id_medicament FROM prescriptions','HAVING SUM(quantite) > 30','SELECT id_medicament, SUM(quantite) AS qte_totale FROM prescriptions GROUP BY id_medicament HAVING SUM(quantite) > 30;']},
  ]},

 {id:'i6',title:'12. Jointure multiple – 3 tables',hot:true,
  desc:'Requêtes sur plusieurs tables. Fréquent en entretien senior et dans les vrais projets.',
  concept:`<span class="kw">SELECT</span> p.nom, c.diagnostic, m.nom <span class="kw">AS</span> medecin
<span class="kw">FROM</span> <span class="tbl">patients</span> p
<span class="kw">JOIN</span> <span class="tbl">consultations</span> c <span class="kw">ON</span> p.id_patient = c.id_patient
<span class="kw">JOIN</span> <span class="tbl">medecins</span> m <span class="kw">ON</span> c.medecin_id = m.id_medecin;
<span class="cm">-- Chaîner plusieurs JOIN pour relier les tables</span>`,
  exercises:[
   {task:'Listez le <b>nom du patient</b>, le <b>diagnostic</b> et le <b>nom du médecin</b> pour chaque consultation.',
    hints:['Faites 2 JOIN : patients → consultations → medecins','ON c.medecin_id = m.id_medecin pour le 2e JOIN','SELECT p.nom, c.diagnostic, m.nom AS medecin FROM patients p JOIN consultations c ON p.id_patient = c.id_patient JOIN medecins m ON c.medecin_id = m.id_medecin;']},
   {task:'Affichez le <b>nom du patient</b>, la <b>duree_min</b> de consultation, et le <b>nom</b> et la <b>spécialité</b> du médecin.',
    hints:['Même jointure : patients → consultations → medecins','Ajoutez m.specialite dans le SELECT','SELECT p.nom, c.duree_min, m.nom AS medecin, m.specialite FROM patients p JOIN consultations c ON p.id_patient = c.id_patient JOIN medecins m ON c.medecin_id = m.id_medecin;']},
   {task:'Affichez le <b>nom du patient</b>, son <b>service</b>, et le <b>nom</b> et la <b>spécialité de son médecin traitant</b> (via patients.medecin_id).',
    hints:['JOIN medecins m ON p.medecin_id = m.id_medecin (lien direct sans passer par consultations)','SELECT p.nom, p.service, m.nom AS medecin, m.specialite','SELECT p.nom, p.service, m.nom AS medecin, m.specialite FROM patients p JOIN medecins m ON p.medecin_id = m.id_medecin;']},
  ]},

 {id:'i7',title:'13. LIKE – Recherche de motifs',hot:false,
  desc:'Filtrer du texte avec des wildcards. Utilisé dans les recherches et la validation de données.',
  concept:`<span class="cm">-- % : n'importe quelle séquence de caractères</span>
<span class="cm">-- _ : exactement un caractère</span>

<span class="kw">WHERE</span> diagnostic <span class="kw">LIKE</span> <span class="str">'%cardiaque%'</span>  <span class="cm">-- contient</span>
<span class="kw">WHERE</span> nom <span class="kw">LIKE</span> <span class="str">'M%'</span>              <span class="cm">-- commence par M</span>
<span class="kw">WHERE</span> nom <span class="kw">LIKE</span> <span class="str">'%in'</span>             <span class="cm">-- finit par 'in'</span>`,
  exercises:[
   {task:'Trouvez toutes les consultations dont le diagnostic contient le mot <b>cardiaque</b>.',
    hints:['WHERE diagnostic LIKE \'%...%\'','Le mot à chercher : cardiaque','SELECT * FROM consultations WHERE diagnostic LIKE \'%cardiaque%\';']},
   {task:'Listez les patients dont le <b>nom commence par la lettre M</b>.',
    hints:['WHERE nom LIKE \'M%\'','Le % remplace tout ce qui suit le M.','SELECT * FROM patients WHERE nom LIKE \'M%\';']},
   {task:'Listez les médicaments dont la <b>catégorie commence par "Anti"</b>.',
    hints:['WHERE categorie LIKE \'Anti%\'','La catégorie est la colonne categorie de la table medicaments.','SELECT * FROM medicaments WHERE categorie LIKE \'Anti%\';']},
  ]},
],
a:[
 {id:'a1',title:'14. Sous-requêtes – Subqueries',hot:true,
  desc:'Imbriquer des requêtes. Très demandé dans les tests techniques data analyst.',
  concept:`<span class="cm">-- Sous-requête scalaire (retourne 1 valeur) :</span>
<span class="kw">WHERE</span> age > (<span class="kw">SELECT</span> <span class="fn">AVG</span>(age) <span class="kw">FROM</span> <span class="tbl">patients</span>)

<span class="cm">-- Sous-requête dans FROM :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> (
  <span class="kw">SELECT</span> service, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb <span class="kw">FROM</span> <span class="tbl">patients</span>
  <span class="kw">GROUP BY</span> service
) sub <span class="kw">WHERE</span> nb > <span class="num">2</span>`,
  exercises:[
   {task:'Listez les patients dont l\'âge est <b>supérieur à la moyenne</b> d\'âge.',
    hints:['WHERE age > (sous-requête)','La sous-requête : SELECT AVG(age) FROM patients','SELECT * FROM patients WHERE age > (SELECT AVG(age) FROM patients);']},
   {task:'Listez les consultations dont la durée est <b>supérieure à la durée moyenne</b>.',
    hints:['WHERE duree_min > (SELECT AVG(duree_min) FROM consultations)','SELECT diagnostic, duree_min, medecin_id FROM consultations','SELECT diagnostic, duree_min, medecin_id FROM consultations WHERE duree_min > (SELECT AVG(duree_min) FROM consultations);']},
   {task:'Listez les médecins dont le salaire est <b>supérieur au salaire moyen</b>.',
    hints:['WHERE salaire > (SELECT AVG(salaire) FROM medecins)','SELECT nom, specialite, salaire FROM medecins','SELECT nom, specialite, salaire FROM medecins WHERE salaire > (SELECT AVG(salaire) FROM medecins);']},
  ]},

 {id:'a2',title:'15. CTE – WITH … AS',hot:true,
  desc:'Rendre les requêtes lisibles et modulaires. Très apprécié par les recruteurs.',
  concept:`<span class="kw">WITH</span> patients_cardio <span class="kw">AS</span> (
  <span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">patients</span>
  <span class="kw">WHERE</span> service = <span class="str">'Cardiologie'</span>
)
<span class="kw">SELECT</span> p.nom, c.diagnostic
<span class="kw">FROM</span> patients_cardio p
<span class="kw">JOIN</span> <span class="tbl">consultations</span> c <span class="kw">ON</span> p.id_patient = c.id_patient;`,
  exercises:[
   {task:'Avec un CTE <b>patients_seniors</b> (age >= 65), comptez combien de consultations ont ces patients.',
    hints:['WITH patients_seniors AS (SELECT * FROM patients WHERE age >= 65)','Ensuite : SELECT COUNT(*) FROM patients_seniors p JOIN consultations c ON p.id_patient = c.id_patient','Le CTE filtre, le SELECT principal compte.']},
   {task:'Avec un CTE <b>consult_longues</b> (duree_min > 40), affichez le diagnostic et le nom du médecin.',
    hints:['WITH consult_longues AS (SELECT * FROM consultations WHERE duree_min > 40)','JOIN medecins m ON consult_longues.medecin_id = m.id_medecin','WITH consult_longues AS (SELECT * FROM consultations WHERE duree_min > 40) SELECT c.diagnostic, m.nom AS medecin FROM consult_longues c JOIN medecins m ON c.medecin_id = m.id_medecin;']},
   {task:'Avec un CTE <b>medecins_top</b> (salaire > 8500), listez les patients de ces médecins (via patients.medecin_id).',
    hints:['WITH medecins_top AS (SELECT * FROM medecins WHERE salaire > 8500)','JOIN sur p.medecin_id = mt.id_medecin','WITH medecins_top AS (SELECT * FROM medecins WHERE salaire > 8500) SELECT p.nom, p.service, mt.nom AS medecin FROM patients p JOIN medecins_top mt ON p.medecin_id = mt.id_medecin;']},
  ]},

 {id:'a3',title:'16. CASE WHEN – Logique conditionnelle',hot:true,
  desc:'Créer des colonnes calculées conditionnelles. Demandé dans presque tous les tests SQL.',
  concept:`<span class="kw">SELECT</span> nom,
  <span class="kw">CASE</span>
    <span class="kw">WHEN</span> age < <span class="num">18</span> <span class="kw">THEN</span> <span class="str">'Mineur'</span>
    <span class="kw">WHEN</span> age < <span class="num">65</span> <span class="kw">THEN</span> <span class="str">'Adulte'</span>
    <span class="kw">ELSE</span> <span class="str">'Senior'</span>
  <span class="kw">END</span> <span class="kw">AS</span> categorie
<span class="kw">FROM</span> <span class="tbl">patients</span>;`,
  exercises:[
   {task:'Ajoutez une colonne <b>priorite</b> : "Haute" si Oncologie ou Cardiologie, "Normale" sinon.',
    hints:['CASE WHEN service IN (\'Oncologie\', \'Cardiologie\') THEN \'Haute\'','ELSE \'Normale\' END AS priorite','SELECT nom, service, CASE WHEN service IN (\'Oncologie\', \'Cardiologie\') THEN \'Haute\' ELSE \'Normale\' END AS priorite FROM patients;']},
   {task:'Ajoutez une colonne <b>tranche_age</b> : "Jeune" (< 40), "Adulte" (40 à 65), "Senior" (> 65).',
    hints:['CASE WHEN age < 40 THEN \'Jeune\' WHEN age <= 65 THEN \'Adulte\' ELSE \'Senior\' END','SELECT nom, age, CASE WHEN ... END AS tranche_age','SELECT nom, age, CASE WHEN age < 40 THEN \'Jeune\' WHEN age <= 65 THEN \'Adulte\' ELSE \'Senior\' END AS tranche_age FROM patients;']},
   {task:'Sur les consultations, ajoutez une colonne <b>duree_cat</b> : "Courte" (< 30 min), "Normale" (30-50), "Longue" (> 50).',
    hints:['CASE WHEN duree_min < 30 THEN \'Courte\' WHEN duree_min <= 50 THEN \'Normale\' ELSE \'Longue\' END','SELECT diagnostic, duree_min, CASE WHEN ... END AS duree_cat','SELECT diagnostic, duree_min, CASE WHEN duree_min < 30 THEN \'Courte\' WHEN duree_min <= 50 THEN \'Normale\' ELSE \'Longue\' END AS duree_cat FROM consultations;']},
  ]},

 {id:'a4',title:'17. Détecter les doublons',hot:true,
  desc:'Question classique d\'entretien : "comment trouver les doublons ?" — GROUP BY + HAVING.',
  concept:`<span class="cm">-- Trouver les doublons : GROUP BY + HAVING COUNT > 1</span>
<span class="kw">SELECT</span> col1, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> table
<span class="kw">GROUP BY</span> col1
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) > <span class="num">1</span>;`,
  exercises:[
   {task:'Trouvez les patients ayant eu <b>plusieurs consultations</b> (id_patient apparaissant plus d\'une fois dans consultations).',
    hints:['SELECT id_patient, COUNT(*) AS nb_consultations FROM consultations','GROUP BY id_patient','SELECT id_patient, COUNT(*) AS nb_consultations FROM consultations GROUP BY id_patient HAVING COUNT(*) > 1;']},
   {task:'Trouvez les patients ayant été <b>hospitalisés plusieurs fois</b> (id_patient dans hospitalisations avec COUNT > 1).',
    hints:['SELECT id_patient, COUNT(*) FROM hospitalisations','GROUP BY id_patient','SELECT id_patient, COUNT(*) AS nb_hospitalisations FROM hospitalisations GROUP BY id_patient HAVING COUNT(*) > 1;']},
   {task:'Trouvez les médicaments (id_medicament) <b>prescrits plus d\'une fois</b> dans les prescriptions.',
    hints:['SELECT id_medicament, COUNT(*) FROM prescriptions','GROUP BY id_medicament HAVING COUNT(*) > 1','SELECT id_medicament, COUNT(*) AS nb_fois FROM prescriptions GROUP BY id_medicament HAVING COUNT(*) > 1;']},
  ]},

 {id:'a5',title:'18. Patients sans consultation – Anti-JOIN',hot:true,
  desc:'"Trouver les X sans Y" : question très fréquente en entretien. Deux approches classiques.',
  concept:`<span class="cm">-- Approche 1 : LEFT JOIN + IS NULL</span>
<span class="kw">SELECT</span> p.nom <span class="kw">FROM</span> <span class="tbl">patients</span> p
<span class="kw">LEFT JOIN</span> <span class="tbl">consultations</span> c <span class="kw">ON</span> p.id_patient = c.id_patient
<span class="kw">WHERE</span> c.id_consultation <span class="kw">IS NULL</span>;

<span class="cm">-- Approche 2 : NOT IN</span>
<span class="kw">WHERE</span> id_patient <span class="kw">NOT IN</span> (
  <span class="kw">SELECT</span> id_patient <span class="kw">FROM</span> <span class="tbl">consultations</span>
)`,
  exercises:[
   {task:'Listez les patients qui n\'ont <b>aucune consultation</b> enregistrée.',
    hints:['LEFT JOIN consultations c ON p.id_patient = c.id_patient','WHERE c.id_consultation IS NULL','SELECT p.nom, p.prenom FROM patients p LEFT JOIN consultations c ON p.id_patient = c.id_patient WHERE c.id_consultation IS NULL;']},
   {task:'Listez les patients qui n\'ont <b>aucune hospitalisation</b> enregistrée.',
    hints:['LEFT JOIN hospitalisations h ON p.id_patient = h.id_patient','WHERE h.id_hosp IS NULL','SELECT p.nom, p.prenom FROM patients p LEFT JOIN hospitalisations h ON p.id_patient = h.id_patient WHERE h.id_hosp IS NULL;']},
   {task:'Listez les médecins qui n\'ont <b>aucune consultation</b> (id_medecin absent de consultations).',
    hints:['WHERE id_medecin NOT IN (SELECT medecin_id FROM consultations)','SELECT nom, specialite FROM medecins','SELECT nom, specialite FROM medecins WHERE id_medecin NOT IN (SELECT medecin_id FROM consultations);']},
  ]},

 {id:'a6',title:'19. Fonctions de date',hot:true,
  desc:'Manipuler des dates : demandé dans les analyses temporelles et les tableaux de bord.',
  concept:`<span class="cm">-- Extraire une partie de date :</span>
<span class="fn">YEAR</span>(date_consultation)   <span class="cm">→ 2024</span>
<span class="fn">MONTH</span>(date_consultation)  <span class="cm">→ 11</span>

<span class="cm">-- Compter par mois :</span>
<span class="kw">SELECT</span> <span class="fn">MONTH</span>(date_consultation) <span class="kw">AS</span> mois,
       <span class="fn">COUNT</span>(*) <span class="kw">AS</span> nb
<span class="kw">FROM</span> <span class="tbl">consultations</span> <span class="kw">GROUP BY</span> mois`,
  exercises:[
   {task:'Comptez le nombre de consultations <b>par mois</b>. Affichez le mois et le nombre.',
    hints:['MONTH(date_consultation) AS mois','GROUP BY mois','SELECT MONTH(date_consultation) AS mois, COUNT(*) AS nb FROM consultations GROUP BY mois ORDER BY mois;']},
   {task:'Comptez le nombre d\'admissions de patients <b>par mois</b> (date_admission). Affichez le mois et le nombre.',
    hints:['MONTH(date_admission) AS mois FROM patients','GROUP BY mois','SELECT MONTH(date_admission) AS mois, COUNT(*) AS nb_admissions FROM patients GROUP BY mois ORDER BY mois;']},
   {task:'Listez uniquement les consultations du <b>mois 11</b> (novembre). Affichez date_consultation, diagnostic, duree_min.',
    hints:['WHERE MONTH(date_consultation) = 11','SELECT date_consultation, diagnostic, duree_min FROM consultations','SELECT date_consultation, diagnostic, duree_min FROM consultations WHERE MONTH(date_consultation) = 11;']},
  ]},

 {id:'a7',title:'20. COALESCE & NULLIF',hot:true,
  desc:'Gérer intelligemment les NULLs. Attendu dans tout rôle data engineering ou analyst.',
  concept:`<span class="cm">-- COALESCE : retourne la 1ère valeur non-NULL</span>
<span class="fn">COALESCE</span>(date_sortie, <span class="str">'En cours'</span>)
<span class="fn">COALESCE</span>(col1, col2, <span class="str">'défaut'</span>)

<span class="cm">-- NULLIF : retourne NULL si a = b (évite ÷0)</span>
<span class="fn">NULLIF</span>(col, <span class="num">0</span>)  <span class="cm">→ NULL si col = 0</span>`,
  exercises:[
   {task:'Listez les hospitalisations avec la date_sortie remplacée par <b>"Toujours hospitalisé"</b> si NULL.',
    hints:['COALESCE(date_sortie, \'Toujours hospitalisé\') AS date_sortie','SELECT id_patient, chambre, date_entree, COALESCE(date_sortie, \'Toujours hospitalisé\') AS date_sortie','FROM hospitalisations']},
   {task:'Affichez id_hosp, chambre, cout_journalier et une colonne <b>statut_sortie</b> = date_sortie ou "En cours" si NULL, ordonné par id_hosp.',
    hints:['COALESCE(date_sortie, \'En cours\') AS statut_sortie','SELECT id_hosp, chambre, cout_journalier, COALESCE(date_sortie, \'En cours\') AS statut_sortie','SELECT id_hosp, chambre, cout_journalier, COALESCE(date_sortie, \'En cours\') AS statut_sortie FROM hospitalisations ORDER BY id_hosp;']},
   {task:'Affichez les médicaments avec une colonne <b>prix_ajuste</b> qui vaut NULL si le prix est 0.15 (Lisinopril), sinon le prix normal.',
    hints:['NULLIF(prix_unitaire, 0.15) AS prix_ajuste','SELECT nom_medicament, prix_unitaire, NULLIF(prix_unitaire, 0.15) AS prix_ajuste','SELECT nom_medicament, prix_unitaire, NULLIF(prix_unitaire, 0.15) AS prix_ajuste FROM medicaments;']},
  ]},
],
e:[
 {id:'e1',title:'21. RANK() / ROW_NUMBER() OVER',hot:true,
  desc:'Fonctions fenêtre de classement. Incontournables pour les postes data analyst avancés.',
  concept:`<span class="kw">SELECT</span> nom, service, duree_min,
  <span class="fn">RANK</span>() <span class="kw">OVER</span> (
    <span class="kw">PARTITION BY</span> service
    <span class="kw">ORDER BY</span> duree_min <span class="kw">DESC</span>
  ) <span class="kw">AS</span> rang
<span class="kw">FROM</span> ...
<span class="cm">-- ROW_NUMBER : rang unique même si ex-aequo</span>
<span class="cm">-- RANK : ex-aequo partagent le même rang</span>`,
  exercises:[
   {task:'Classez les consultations par durée décroissante <b>par médecin</b> (PARTITION BY medecin_id). Affichez medecin_id, diagnostic, duree_min et rang.',
    hints:['RANK() OVER (PARTITION BY medecin_id ORDER BY duree_min DESC) AS rang','SELECT medecin_id, diagnostic, duree_min, RANK()...','SELECT medecin_id, diagnostic, duree_min, RANK() OVER (PARTITION BY medecin_id ORDER BY duree_min DESC) AS rang FROM consultations ORDER BY medecin_id, rang;']},
   {task:'Classez <b>tous les patients</b> par âge décroissant avec ROW_NUMBER() (sans PARTITION). Affichez nom, age et rang.',
    hints:['ROW_NUMBER() OVER (ORDER BY age DESC) AS rang','Pas de PARTITION BY ici — tous les patients ensemble.','SELECT nom, age, ROW_NUMBER() OVER (ORDER BY age DESC) AS rang FROM patients;']},
   {task:'Classez les patients par âge décroissant <b>par service</b> (PARTITION BY service) avec RANK(). Affichez nom, service, age et rang.',
    hints:['RANK() OVER (PARTITION BY service ORDER BY age DESC) AS rang','SELECT nom, service, age, RANK() ...','SELECT nom, service, age, RANK() OVER (PARTITION BY service ORDER BY age DESC) AS rang FROM patients ORDER BY service, rang;']},
  ]},

 {id:'e2',title:'22. SUM / AVG OVER – Cumul & Moyenne glissante',hot:true,
  desc:'Totaux cumulés et moyennes mobiles. Demandés dans les analyses financières et médicales.',
  concept:`<span class="cm">-- Total cumulé :</span>
<span class="fn">SUM</span>(duree_min) <span class="kw">OVER</span> (
  <span class="kw">ORDER BY</span> date_consultation
) <span class="kw">AS</span> cumul

<span class="cm">-- Par partition :</span>
<span class="fn">SUM</span>(duree_min) <span class="kw">OVER</span> (
  <span class="kw">PARTITION BY</span> medecin_id
  <span class="kw">ORDER BY</span> date_consultation
) <span class="kw">AS</span> cumul_par_medecin`,
  exercises:[
   {task:'Total cumulé de <b>minutes de consultation</b> par ordre de date. Affichez date, durée et cumul.',
    hints:['SUM(duree_min) OVER (ORDER BY date_consultation) AS cumul_minutes','SELECT date_consultation, duree_min, SUM(duree_min) OVER (ORDER BY date_consultation) AS cumul_minutes','SELECT date_consultation, duree_min, SUM(duree_min) OVER (ORDER BY date_consultation) AS cumul_minutes FROM consultations ORDER BY date_consultation;']},
   {task:'Total cumulé du <b>coût journalier</b> des hospitalisations par ordre d\'id_hosp. Affichez id_hosp, chambre, cout_journalier et cumul.',
    hints:['SUM(cout_journalier) OVER (ORDER BY id_hosp) AS cumul_cout','SELECT id_hosp, chambre, cout_journalier, SUM(...) OVER (...) AS cumul_cout','SELECT id_hosp, chambre, cout_journalier, SUM(cout_journalier) OVER (ORDER BY id_hosp) AS cumul_cout FROM hospitalisations;']},
   {task:'Moyenne glissante de la <b>durée des consultations</b> par ordre de date. Affichez date_consultation, duree_min et la moyenne glissante.',
    hints:['AVG(duree_min) OVER (ORDER BY date_consultation) AS moy_glissante','SELECT date_consultation, duree_min, AVG(...) OVER (...) AS moy_glissante','SELECT date_consultation, duree_min, AVG(duree_min) OVER (ORDER BY date_consultation) AS moy_glissante FROM consultations ORDER BY date_consultation;']},
  ]},

 {id:'e3',title:'23. LAG / LEAD – Valeurs décalées',hot:true,
  desc:'Comparer une ligne avec la précédente ou suivante. Question avancée très appréciée.',
  concept:`<span class="fn">LAG</span>(col, 1)  <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> date)
<span class="cm">-- valeur de la ligne précédente</span>

<span class="fn">LEAD</span>(col, 1) <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> date)
<span class="cm">-- valeur de la ligne suivante</span>

<span class="cm">-- Utilisation : calculer l'écart entre 2 consultations</span>`,
  exercises:[
   {task:'Pour chaque consultation, affichez la <b>durée de la consultation précédente</b> (LAG) par ordre de date.',
    hints:['LAG(duree_min, 1) OVER (ORDER BY date_consultation) AS duree_precedente','SELECT date_consultation, duree_min, LAG(duree_min, 1) OVER (ORDER BY date_consultation) AS duree_precedente','SELECT date_consultation, duree_min, LAG(duree_min, 1) OVER (ORDER BY date_consultation) AS duree_precedente FROM consultations ORDER BY date_consultation;']},
   {task:'Pour chaque consultation, affichez la <b>durée de la consultation suivante</b> (LEAD) par ordre de date.',
    hints:['LEAD(duree_min, 1) OVER (ORDER BY date_consultation) AS duree_suivante','SELECT date_consultation, duree_min, LEAD(duree_min, 1) OVER (ORDER BY date_consultation) AS duree_suivante','SELECT date_consultation, duree_min, LEAD(duree_min, 1) OVER (ORDER BY date_consultation) AS duree_suivante FROM consultations ORDER BY date_consultation;']},
   {task:'Pour chaque consultation, affichez la durée précédente <b>par médecin</b> (PARTITION BY medecin_id, LAG) par ordre de date.',
    hints:['LAG(duree_min, 1) OVER (PARTITION BY medecin_id ORDER BY date_consultation) AS duree_prec','SELECT medecin_id, date_consultation, duree_min, LAG(...) OVER (...) AS duree_prec','SELECT medecin_id, date_consultation, duree_min, LAG(duree_min, 1) OVER (PARTITION BY medecin_id ORDER BY date_consultation) AS duree_prec FROM consultations ORDER BY medecin_id, date_consultation;']},
  ]},

 {id:'e4',title:'24. Deuxième valeur la plus haute',hot:true,
  desc:'Question classique d\'entretien : "2ème salaire le plus élevé". Plusieurs approches.',
  concept:`<span class="cm">-- Approche 1 : LIMIT + OFFSET</span>
<span class="kw">SELECT</span> DISTINCT salaire <span class="kw">FROM</span> <span class="tbl">medecins</span>
<span class="kw">ORDER BY</span> salaire <span class="kw">DESC</span> <span class="kw">LIMIT</span> <span class="num">1</span> <span class="cm">OFFSET 1</span>

<span class="cm">-- Approche 2 : Sous-requête</span>
<span class="kw">SELECT</span> <span class="fn">MAX</span>(salaire) <span class="kw">FROM</span> <span class="tbl">medecins</span>
<span class="kw">WHERE</span> salaire < (
  <span class="kw">SELECT</span> <span class="fn">MAX</span>(salaire) <span class="kw">FROM</span> <span class="tbl">medecins</span>
)`,
  exercises:[
   {task:'Trouvez le <b>2ème salaire le plus élevé</b> parmi les médecins (sans utiliser OFFSET).',
    hints:['Approche : SELECT MAX(salaire) WHERE salaire < (SELECT MAX(salaire) ...)','SELECT MAX(salaire) AS deuxieme_salaire FROM medecins WHERE salaire < (SELECT MAX(salaire) FROM medecins);','La sous-requête retourne le salaire max, la requête principale prend le max en dessous.']},
   {task:'Trouvez la <b>2ème durée la plus longue</b> parmi les consultations (utilisez LIMIT + OFFSET).',
    hints:['SELECT DISTINCT duree_min FROM consultations ORDER BY duree_min DESC LIMIT 1 OFFSET 1','OFFSET 1 saute la première ligne (la plus longue).','SELECT DISTINCT duree_min AS deuxieme_duree FROM consultations ORDER BY duree_min DESC LIMIT 1 OFFSET 1;']},
   {task:'Trouvez l\'âge du <b>3ème patient le plus âgé</b> (utilisez LIMIT + OFFSET).',
    hints:['SELECT DISTINCT age FROM patients ORDER BY age DESC','LIMIT 1 OFFSET 2 pour la 3ème valeur','SELECT DISTINCT age AS troisieme_age FROM patients ORDER BY age DESC LIMIT 1 OFFSET 2;']},
  ]},

 {id:'e5',title:'25. INDEX & EXPLAIN – Optimisation',hot:false,
  desc:'Analyser et optimiser les performances. Attendu pour les postes data engineer / DBA.',
  concept:`<span class="cm">-- Analyser le plan d'exécution :</span>
<span class="kw">EXPLAIN</span> <span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">patients</span>
<span class="kw">WHERE</span> service = <span class="str">'Cardiologie'</span>;

<span class="cm">-- Créer un index (accélère les filtres WHERE) :</span>
<span class="kw">CREATE INDEX</span> idx_service
<span class="kw">ON</span> <span class="tbl">patients</span>(service);

<span class="cm">-- Index composite (plusieurs colonnes) :</span>
<span class="kw">CREATE INDEX</span> idx_svc_age <span class="kw">ON</span> <span class="tbl">patients</span>(service, age);`,
  exercises:[
   {task:'Créez un index <b>idx_service</b> sur la colonne service de la table patients.',
    hints:['CREATE INDEX nom ON table(colonne);','CREATE INDEX idx_service ON patients(service);','Le nom de l\'index est idx_service.']},
   {task:'Analysez le plan d\'exécution d\'un SELECT sur consultations filtré par <b>medecin_id = 2</b>.',
    hints:['EXPLAIN SELECT ... FROM consultations WHERE medecin_id = 2','EXPLAIN SELECT * FROM consultations WHERE medecin_id = 2;','EXPLAIN retourne le plan de la requête sans l\'exécuter.']},
   {task:'Créez un index <b>idx_patient_consult</b> sur la colonne id_patient de la table consultations.',
    hints:['CREATE INDEX nom ON table(colonne);','CREATE INDEX idx_patient_consult ON consultations(id_patient);','Cet index accélère les JOIN sur patients ↔ consultations.']},
  ]},

 {id:'e6',title:'26. UNION / UNION ALL – Combiner des résultats',hot:true,
  desc:'Fusionner les résultats de plusieurs requêtes. Question classique d\'entretien.',
  concept:`<span class="cm">-- UNION : fusionne et dédoublonne</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">patients</span>
<span class="kw">UNION</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">medecins</span>;

<span class="cm">-- UNION ALL : fusionne SANS dédoublonner (plus rapide)</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">patients</span>
<span class="kw">UNION ALL</span>
<span class="kw">SELECT</span> nom <span class="kw">FROM</span> <span class="tbl">medecins</span>;

<span class="cm">-- Règle : même nombre de colonnes, mêmes types</span>`,
  exercises:[
   {task:'Combinez avec <b>UNION</b> la liste des noms de patients et la liste des noms de médecins en une seule colonne <b>nom</b>.',
    hints:['SELECT nom FROM patients UNION SELECT nom FROM medecins;','UNION dédoublonne automatiquement les noms identiques.','Les deux SELECT doivent retourner le même nombre de colonnes.']},
   {task:'Combinez avec <b>UNION ALL</b> les noms de patients et de médecins (sans dédoublonner). Combien de lignes obtenez-vous ?',
    hints:['SELECT nom FROM patients UNION ALL SELECT nom FROM medecins;','UNION ALL conserve tous les doublons — le résultat a plus de lignes que UNION.','SELECT nom FROM patients UNION ALL SELECT nom FROM medecins;']},
   {task:'Créez une liste combinée avec une colonne <b>type</b> : "Patient" pour les patients, "Médecin" pour les médecins.',
    hints:['SELECT nom, \'Patient\' AS type FROM patients','UNION SELECT nom, \'Médecin\' AS type FROM medecins','SELECT nom, \'Patient\' AS type FROM patients UNION SELECT nom, \'Médecin\' AS type FROM medecins ORDER BY type;']},
  ]},

 {id:'e7',title:'27. EXISTS / NOT EXISTS – Sous-requête d\'existence',hot:true,
  desc:'Tester l\'existence de lignes dans une sous-requête. Très demandé en entretien senior.',
  concept:`<span class="cm">-- EXISTS : vrai si la sous-requête retourne au moins 1 ligne</span>
<span class="kw">SELECT</span> p.nom
<span class="kw">FROM</span> <span class="tbl">patients</span> p
<span class="kw">WHERE</span> <span class="fn">EXISTS</span> (
  <span class="kw">SELECT</span> <span class="num">1</span> <span class="kw">FROM</span> <span class="tbl">consultations</span> c
  <span class="kw">WHERE</span> c.id_patient = p.id_patient
);

<span class="cm">-- NOT EXISTS : patients SANS consultation</span>
<span class="kw">WHERE</span> <span class="kw">NOT</span> <span class="fn">EXISTS</span> (...)`,
  exercises:[
   {task:'Listez les patients qui <b>ont au moins une consultation</b> (utilisez EXISTS).',
    hints:['WHERE EXISTS (SELECT 1 FROM consultations c WHERE c.id_patient = p.id_patient)','SELECT p.nom, p.prenom FROM patients p WHERE EXISTS (SELECT 1 FROM consultations c WHERE c.id_patient = p.id_patient);','EXISTS est plus performant que IN sur les grandes tables.']},
   {task:'Listez les patients qui <b>n\'ont aucune hospitalisation</b> (utilisez NOT EXISTS).',
    hints:['WHERE NOT EXISTS (SELECT 1 FROM hospitalisations h WHERE h.id_patient = p.id_patient)','SELECT p.nom, p.prenom FROM patients p','SELECT p.nom, p.prenom FROM patients p WHERE NOT EXISTS (SELECT 1 FROM hospitalisations h WHERE h.id_patient = p.id_patient);']},
   {task:'Listez les médecins qui <b>ont au moins une consultation</b> enregistrée (utilisez EXISTS).',
    hints:['WHERE EXISTS (SELECT 1 FROM consultations c WHERE c.medecin_id = m.id_medecin)','SELECT m.nom, m.specialite FROM medecins m','SELECT m.nom, m.specialite FROM medecins m WHERE EXISTS (SELECT 1 FROM consultations c WHERE c.medecin_id = m.id_medecin);']},
  ]},

 {id:'e8',title:'28. Fonctions de chaînes – UPPER, LOWER, LENGTH, SUBSTRING',hot:true,
  desc:'Manipuler du texte en SQL. Incontournable pour le nettoyage et la transformation de données.',
  concept:`<span class="fn">UPPER</span>(nom)           <span class="cm">→ 'MARTIN'</span>
<span class="fn">LOWER</span>(nom)           <span class="cm">→ 'martin'</span>
<span class="fn">LENGTH</span>(nom)          <span class="cm">→ 6</span>
<span class="fn">SUBSTRING</span>(nom, 1, 3) <span class="cm">→ 'Mar'</span>
<span class="fn">CONCAT</span>(nom, <span class="str">' '</span>, prenom)
<span class="cm">-- Ou avec opérateur : nom || ' ' || prenom</span>`,
  exercises:[
   {task:'Affichez le <b>nom en majuscules</b>, le <b>prénom en minuscules</b> et la <b>longueur du nom</b> pour chaque patient.',
    hints:['UPPER(nom) AS nom_maj, LOWER(prenom) AS prenom_min, LENGTH(nom) AS longueur_nom','SELECT UPPER(nom) AS nom_maj, LOWER(prenom) AS prenom_min, LENGTH(nom) AS longueur_nom FROM patients;','Trois fonctions dans le même SELECT.']},
   {task:'Affichez la <b>spécialité en majuscules</b> et la <b>longueur du nom</b> de chaque médecin.',
    hints:['UPPER(specialite) AS specialite_maj, LENGTH(nom) AS longueur_nom','SELECT nom, UPPER(specialite) AS specialite_maj, LENGTH(nom) AS longueur_nom FROM medecins;','Deux fonctions appliquées sur la table medecins.']},
   {task:'Affichez les <b>3 premiers caractères du nom</b> de chaque patient avec SUBSTRING.',
    hints:['SUBSTRING(nom, 1, 3) AS initiales — position 1, longueur 3','SELECT nom, SUBSTRING(nom, 1, 3) AS debut_nom FROM patients;','SUBSTRING(chaîne, position_départ, longueur)']},
  ]},

 {id:'e9',title:'29. CONCAT & Concaténation',hot:false,
  desc:'Assembler des chaînes. Utilisé pour construire des noms complets, des libellés, des clés.',
  concept:`<span class="cm">-- Avec CONCAT() :</span>
<span class="fn">CONCAT</span>(prenom, <span class="str">' '</span>, nom) <span class="kw">AS</span> nom_complet

<span class="cm">-- Avec l'opérateur || (standard SQL) :</span>
prenom || <span class="str">' '</span> || nom <span class="kw">AS</span> nom_complet

<span class="cm">-- Exemple :</span>
<span class="kw">SELECT</span> <span class="fn">CONCAT</span>(prenom, <span class="str">' '</span>, nom) <span class="kw">AS</span> nom_complet
<span class="kw">FROM</span> <span class="tbl">patients</span>;`,
  exercises:[
   {task:'Affichez le <b>nom complet</b> (prenom + espace + nom) de chaque patient dans une colonne appelée <b>nom_complet</b>.',
    hints:['CONCAT(prenom, \' \', nom) AS nom_complet','SELECT CONCAT(prenom, \' \', nom) AS nom_complet FROM patients;','Vous pouvez aussi écrire : prenom || \' \' || nom AS nom_complet']},
   {task:'Affichez une colonne <b>fiche</b> pour chaque médecin au format : <b>"nom - spécialité"</b>.',
    hints:['CONCAT(nom, \' - \', specialite) AS fiche','SELECT CONCAT(nom, \' - \', specialite) AS fiche FROM medecins;','Exemple attendu : "Dr. Fontaine - Cardiologie"']},
   {task:'Affichez une colonne <b>patient_service</b> au format : <b>"nom (service)"</b> pour chaque patient.',
    hints:['CONCAT(nom, \' (\', service, \')\') AS patient_service','SELECT CONCAT(nom, \' (\', service, \')\') AS patient_service FROM patients;','Exemple attendu : "Martin (Cardiologie)"']},
  ]},

 {id:'e10',title:'30. INSERT INTO – Insérer des données',hot:true,
  desc:'Ajouter des lignes à une table. Base du langage DML, testé dans les entretiens.',
  concept:`<span class="kw">INSERT INTO</span> <span class="tbl">patients</span> (nom, prenom, age, sexe, service)
<span class="kw">VALUES</span> (<span class="str">'Dupont'</span>, <span class="str">'Alice'</span>, <span class="num">45</span>, <span class="str">'F'</span>, <span class="str">'Cardiologie'</span>);

<span class="cm">-- Vérifier ensuite :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="tbl">patients</span> <span class="kw">WHERE</span> nom = <span class="str">'Dupont'</span>;`,
  exercises:[
   {task:'Insérez un nouveau patient : nom <b>Dupont</b>, prenom <b>Alice</b>, age <b>45</b>, sexe <b>F</b>, service <b>Cardiologie</b>. Puis vérifiez avec un SELECT.',
    hints:['INSERT INTO patients (nom, prenom, age, sexe, service) VALUES (\'Dupont\', \'Alice\', 45, \'F\', \'Cardiologie\');','Après l\'INSERT, faites : SELECT * FROM patients WHERE nom = \'Dupont\';','Les valeurs texte sont entre guillemets simples, les nombres non.']},
   {task:'Insérez un nouveau médicament : id_medicament <b>8</b>, nom <b>Paracétamol</b>, catégorie <b>Antalgique</b>, prix <b>0.05</b>. Vérifiez ensuite.',
    hints:['INSERT INTO medicaments (id_medicament, nom_medicament, categorie, prix_unitaire)','VALUES (8, \'Paracétamol\', \'Antalgique\', 0.05)','INSERT INTO medicaments (id_medicament, nom_medicament, categorie, prix_unitaire) VALUES (8, \'Paracétamol\', \'Antalgique\', 0.05); SELECT * FROM medicaments;']},
   {task:'Insérez une nouvelle prescription : id_prescription <b>8</b>, id_consultation <b>1</b>, id_medicament <b>7</b>, quantite <b>20</b>, duree_jours <b>30</b>. Vérifiez.',
    hints:['INSERT INTO prescriptions (id_prescription, id_consultation, id_medicament, quantite, duree_jours)','VALUES (8, 1, 7, 20, 30)','INSERT INTO prescriptions (id_prescription, id_consultation, id_medicament, quantite, duree_jours) VALUES (8, 1, 7, 20, 30); SELECT * FROM prescriptions;']},
  ]},

 {id:'e11',title:'31. UPDATE – Modifier des données',hot:true,
  desc:'Mettre à jour des lignes existantes. Commande DML fondamentale, toujours demandée.',
  concept:`<span class="kw">UPDATE</span> <span class="tbl">patients</span>
<span class="kw">SET</span> service = <span class="str">'Neurologie'</span>,
    statut = <span class="str">'Ambulatoire'</span>
<span class="kw">WHERE</span> id_patient = <span class="num">1</span>;

<span class="cm">-- ⚠️ TOUJOURS utiliser WHERE sinon tout est modifié !</span>`,
  exercises:[
   {task:'Modifiez le statut du patient <b>id_patient = 3</b> en <b>\'Hospitalisé\'</b>. Vérifiez après.',
    hints:['UPDATE patients SET statut = \'Hospitalisé\' WHERE id_patient = 3;','Ne pas oublier le WHERE sinon TOUS les patients sont modifiés.','UPDATE patients SET statut = \'Hospitalisé\' WHERE id_patient = 3; SELECT nom, statut FROM patients WHERE id_patient = 3;']},
   {task:'Augmentez le salaire du médecin <b>id_medecin = 1</b> de <b>500 €</b> (SET salaire = salaire + 500). Vérifiez.',
    hints:['UPDATE medecins SET salaire = salaire + 500 WHERE id_medecin = 1;','Vous pouvez utiliser une expression : salaire = salaire + 500','UPDATE medecins SET salaire = salaire + 500 WHERE id_medecin = 1; SELECT nom, salaire FROM medecins WHERE id_medecin = 1;']},
   {task:'Mettez à jour la date_sortie de l\'hospitalisation <b>id_hosp = 2</b> à <b>\'2024-11-20\'</b>. Vérifiez.',
    hints:['UPDATE hospitalisations SET date_sortie = \'2024-11-20\' WHERE id_hosp = 2;','Vérifiez avec SELECT * FROM hospitalisations WHERE id_hosp = 2;','UPDATE hospitalisations SET date_sortie = \'2024-11-20\' WHERE id_hosp = 2; SELECT * FROM hospitalisations WHERE id_hosp = 2;']},
  ]},

 {id:'e12',title:'32. DELETE – Supprimer des données',hot:true,
  desc:'Supprimer des lignes. Commande DML à maîtriser absolument.',
  concept:`<span class="kw">DELETE FROM</span> <span class="tbl">prescriptions</span>
<span class="kw">WHERE</span> duree_jours < <span class="num">20</span>;

<span class="cm">-- Supprimer TOUT (dangereux !) :</span>
<span class="kw">DELETE FROM</span> <span class="tbl">table</span>;

<span class="cm">-- ⚠️ TOUJOURS utiliser WHERE en production !</span>`,
  exercises:[
   {task:'Supprimez les prescriptions dont la durée est <b>inférieure à 20 jours</b>. Vérifiez après.',
    hints:['DELETE FROM prescriptions WHERE duree_jours < 20;','Le WHERE est essentiel pour ne pas supprimer toutes les lignes.','DELETE FROM prescriptions WHERE duree_jours < 20; SELECT * FROM prescriptions;']},
   {task:'Supprimez les hospitalisations dont la <b>date_sortie est antérieure au 2024-11-01</b>. Vérifiez.',
    hints:['DELETE FROM hospitalisations WHERE date_sortie < \'2024-11-01\'','Les dates sont stockées en texte au format YYYY-MM-DD, la comparaison alphabétique fonctionne.','DELETE FROM hospitalisations WHERE date_sortie < \'2024-11-01\'; SELECT * FROM hospitalisations;']},
   {task:'Supprimez toutes les consultations du médecin <b>id = 5</b> (medecin_id = 5). Vérifiez.',
    hints:['DELETE FROM consultations WHERE medecin_id = 5;','Vérifiez avec SELECT * FROM consultations WHERE medecin_id = 5;','DELETE FROM consultations WHERE medecin_id = 5; SELECT * FROM consultations;']},
  ]},

 {id:'e13',title:'33. CREATE VIEW – Créer une vue',hot:true,
  desc:'Les vues simplifient les requêtes complexes et sécurisent l\'accès aux données.',
  concept:`<span class="cm">-- Créer une vue (table virtuelle) :</span>
<span class="kw">CREATE VIEW</span> patients_cardio <span class="kw">AS</span>
<span class="kw">SELECT</span> nom, prenom, age
<span class="kw">FROM</span> <span class="tbl">patients</span>
<span class="kw">WHERE</span> service = <span class="str">'Cardiologie'</span>;

<span class="cm">-- Utiliser la vue comme une table :</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> patients_cardio;

<span class="cm">-- Supprimer la vue :</span>
<span class="kw">DROP VIEW</span> patients_cardio;`,
  exercises:[
   {task:'Créez une vue <b>vue_seniors</b> contenant les patients de 65 ans et plus (nom, prenom, age, service), puis faites un SELECT dessus.',
    hints:['CREATE VIEW vue_seniors AS SELECT nom, prenom, age, service FROM patients WHERE age >= 65;','Ensuite : SELECT * FROM vue_seniors;','Une vue se comporte comme une table dans les requêtes suivantes.']},
   {task:'Créez une vue <b>vue_consultations_longues</b> (duree_min > 40), puis listez les diagnostics et durées de cette vue.',
    hints:['CREATE VIEW vue_consultations_longues AS SELECT * FROM consultations WHERE duree_min > 40;','Ensuite : SELECT diagnostic, duree_min FROM vue_consultations_longues;','CREATE VIEW vue_consultations_longues AS SELECT * FROM consultations WHERE duree_min > 40; SELECT diagnostic, duree_min FROM vue_consultations_longues;']},
   {task:'Créez une vue <b>vue_patients_medecins</b> joignant patients et médecins traitants (nom patient, service, nom médecin), puis sélectionnez-la.',
    hints:['CREATE VIEW vue_patients_medecins AS SELECT p.nom AS patient, p.service, m.nom AS medecin FROM patients p JOIN medecins m ON p.medecin_id = m.id_medecin;','Ensuite : SELECT * FROM vue_patients_medecins;','CREATE VIEW vue_patients_medecins AS SELECT p.nom AS patient, p.service, m.nom AS medecin FROM patients p JOIN medecins m ON p.medecin_id = m.id_medecin; SELECT * FROM vue_patients_medecins;']},
  ]},

 {id:'e14',title:'34. DDL – CREATE TABLE & ALTER TABLE',hot:true,
  desc:'Créer et modifier la structure de tables. Essentiel pour les rôles backend et data engineer.',
  concept:`<span class="cm">-- Types numériques :</span>  INTEGER  FLOAT  DECIMAL(10,2)
<span class="cm">-- Types texte :</span>      VARCHAR(255)  TEXT  CHAR(10)
<span class="cm">-- Types temporels :</span>  DATE  DATETIME  TIMESTAMP

<span class="kw">CREATE TABLE</span> notes_medicales (
  id_note    INTEGER,
  id_patient INTEGER,
  note       TEXT,
  date_note  DATE,
  montant    DECIMAL(<span class="num">10</span>,<span class="num">2</span>)
);
<span class="kw">ALTER TABLE</span> patients <span class="kw">ADD</span> telephone VARCHAR(<span class="num">20</span>);
<span class="kw">DROP TABLE</span> notes_medicales;`,
  exercises:[
   {task:'Créez une table <b>notes_medicales</b> avec les colonnes : id_note INTEGER, id_patient INTEGER, note TEXT, date_note TEXT. Vérifiez.',
    hints:['CREATE TABLE notes_medicales (id_note INTEGER, id_patient INTEGER, note TEXT, date_note TEXT);','Vérifiez avec SELECT * FROM notes_medicales;','La table sera vide, c\'est normal.']},
   {task:'Ajoutez une colonne <b>telephone TEXT</b> à la table patients, puis affichez nom et telephone de 3 patients.',
    hints:['ALTER TABLE patients ADD telephone TEXT;','Ensuite : SELECT nom, telephone FROM patients LIMIT 3;','ALTER TABLE patients ADD telephone TEXT; SELECT nom, telephone FROM patients LIMIT 3;']},
   {task:'Créez une table <b>bilans_sanguins</b> avec : id_bilan INTEGER, id_patient INTEGER, date_bilan TEXT, resultat TEXT. Vérifiez.',
    hints:['CREATE TABLE bilans_sanguins (id_bilan INTEGER, id_patient INTEGER, date_bilan TEXT, resultat TEXT);','SELECT * FROM bilans_sanguins; — la table sera vide.','CREATE TABLE bilans_sanguins (id_bilan INTEGER, id_patient INTEGER, date_bilan TEXT, resultat TEXT); SELECT * FROM bilans_sanguins;']},
  ]},

 {id:'e15',title:'35. DENSE_RANK() & NTILE()',hot:true,
  desc:'Fonctions fenêtre avancées. DENSE_RANK évite les "sauts" de rang, NTILE divise en groupes.',
  concept:`<span class="cm">-- DENSE_RANK : pas de saut si ex-aequo</span>
<span class="cm">-- RANK :       1,2,2,4 (saute 3)</span>
<span class="cm">-- DENSE_RANK : 1,2,2,3 (pas de saut)</span>
<span class="fn">DENSE_RANK</span>() <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> age <span class="kw">DESC</span>)

<span class="cm">-- NTILE(n) : divise en n groupes égaux</span>
<span class="fn">NTILE</span>(<span class="num">4</span>) <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> age) <span class="kw">AS</span> quartile`,
  exercises:[
   {task:'Divisez les médecins en <b>3 groupes de salaire</b> (NTILE) et affichez aussi leur DENSE_RANK par salaire décroissant.',
    hints:['NTILE(3) OVER (ORDER BY salaire) AS groupe_salaire','DENSE_RANK() OVER (ORDER BY salaire DESC) AS rang_salaire','SELECT nom, salaire, DENSE_RANK() OVER (ORDER BY salaire DESC) AS rang, NTILE(3) OVER (ORDER BY salaire) AS groupe FROM medecins;']},
   {task:'Divisez les patients en <b>4 quartiles</b> par âge croissant (NTILE(4)). Affichez nom, age et quartile.',
    hints:['NTILE(4) OVER (ORDER BY age) AS quartile','SELECT nom, age, NTILE(4) OVER (ORDER BY age) AS quartile FROM patients;','NTILE(4) crée 4 groupes de taille égale (ou quasi-égale).']},
   {task:'Classez les patients par âge décroissant avec <b>DENSE_RANK</b>. Affichez nom, age et rang, ordonné par rang.',
    hints:['DENSE_RANK() OVER (ORDER BY age DESC) AS rang','SELECT nom, age, DENSE_RANK() OVER (ORDER BY age DESC) AS rang FROM patients ORDER BY rang;','DENSE_RANK ne laisse pas de trous dans la numérotation, contrairement à RANK.']},
  ]},

 {id:'e16',title:'36. FIRST_VALUE() & LAST_VALUE()',hot:false,
  desc:'Récupérer la première ou dernière valeur d\'une partition. Utile pour les analyses comparatives.',
  concept:`<span class="fn">FIRST_VALUE</span>(col) <span class="kw">OVER</span> (
  <span class="kw">PARTITION BY</span> service
  <span class="kw">ORDER BY</span> age
) <span class="kw">AS</span> plus_jeune_du_service

<span class="fn">LAST_VALUE</span>(col) <span class="kw">OVER</span> (
  <span class="kw">PARTITION BY</span> service
  <span class="kw">ORDER BY</span> age
) <span class="kw">AS</span> plus_age_du_service`,
  exercises:[
   {task:'Pour chaque patient, affichez le <b>salaire du médecin le moins payé</b> de son service via FIRST_VALUE.',
    hints:['Faites un JOIN patients ↔ medecins sur service','FIRST_VALUE(m.salaire) OVER (PARTITION BY p.service ORDER BY m.salaire) AS salaire_min_service','SELECT p.nom, p.service, m.salaire, FIRST_VALUE(m.salaire) OVER (PARTITION BY p.service ORDER BY m.salaire) AS salaire_min FROM patients p JOIN medecins m ON p.service = m.service;']},
   {task:'Pour chaque consultation, affichez la <b>durée minimale</b> des consultations de ce médecin via FIRST_VALUE.',
    hints:['FIRST_VALUE(duree_min) OVER (PARTITION BY medecin_id ORDER BY duree_min) AS duree_min_medecin','SELECT medecin_id, diagnostic, duree_min, FIRST_VALUE(duree_min) OVER (PARTITION BY medecin_id ORDER BY duree_min) AS duree_min_medecin','SELECT medecin_id, diagnostic, duree_min, FIRST_VALUE(duree_min) OVER (PARTITION BY medecin_id ORDER BY duree_min) AS duree_min_medecin FROM consultations ORDER BY medecin_id;']},
   {task:'Pour chaque patient, affichez l\'<b>âge du plus jeune patient</b> de son service via FIRST_VALUE.',
    hints:['FIRST_VALUE(age) OVER (PARTITION BY service ORDER BY age) AS plus_jeune_service','SELECT nom, service, age, FIRST_VALUE(age) OVER (PARTITION BY service ORDER BY age) AS plus_jeune_service','SELECT nom, service, age, FIRST_VALUE(age) OVER (PARTITION BY service ORDER BY age) AS plus_jeune_service FROM patients ORDER BY service;']},
  ]},

 {id:'e17',title:'37. VARIANCE & STDDEV – Statistiques',hot:false,
  desc:'Mesurer la dispersion des données. Demandé dans les postes data science et analyse avancée.',
  concept:`<span class="cm">-- Variance et écart-type (agrégats) :</span>
<span class="kw">SELECT</span>
  <span class="fn">AVG</span>(salaire)      <span class="kw">AS</span> moyenne,
  <span class="fn">VARIANCE</span>(salaire) <span class="kw">AS</span> variance,
  <span class="fn">STDDEV</span>(salaire)   <span class="kw">AS</span> ecart_type
<span class="kw">FROM</span> <span class="tbl">medecins</span>;

<span class="cm">-- VAR_POP / STDDEV_POP : population entière</span>
<span class="cm">-- VAR_SAMP / STDDEV_SAMP : échantillon</span>`,
  exercises:[
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> des salaires des médecins.',
    hints:['SELECT AVG(salaire), VARIANCE(salaire), STDDEV(salaire) FROM medecins;','Utilisez des alias pour chaque colonne.','SELECT AVG(salaire) AS moyenne, VARIANCE(salaire) AS variance, STDDEV(salaire) AS ecart_type FROM medecins;']},
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> des durées de consultations.',
    hints:['AVG(duree_min), VARIANCE(duree_min), STDDEV(duree_min) FROM consultations','SELECT AVG(duree_min) AS moy, VARIANCE(duree_min) AS variance, STDDEV(duree_min) AS ecart_type','SELECT AVG(duree_min) AS moy, VARIANCE(duree_min) AS variance, STDDEV(duree_min) AS ecart_type FROM consultations;']},
   {task:'Calculez la <b>moyenne</b>, la <b>variance</b> et l\'<b>écart-type</b> des âges des patients.',
    hints:['AVG(age), VARIANCE(age), STDDEV(age) FROM patients','SELECT AVG(age) AS age_moyen, VARIANCE(age) AS variance, STDDEV(age) AS ecart_type','SELECT AVG(age) AS age_moyen, VARIANCE(age) AS variance, STDDEV(age) AS ecart_type FROM patients;']},
  ]},

 {id:'e18',title:'38. PERCENT_RANK() – Rang en pourcentage',hot:false,
  desc:'Calculer la position relative d\'une ligne (entre 0 et 1). Utile pour les percentiles.',
  concept:`<span class="fn">PERCENT_RANK</span>() <span class="kw">OVER</span> (
  <span class="kw">ORDER BY</span> salaire
) <span class="kw">AS</span> percentile

<span class="cm">-- 0 = valeur la plus basse</span>
<span class="cm">-- 1 = valeur la plus haute</span>
<span class="cm">-- 0.5 = médiane (50ème percentile)</span>`,
  exercises:[
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque médecin par salaire croissant.',
    hints:['PERCENT_RANK() OVER (ORDER BY salaire) AS percentile','SELECT nom, salaire, PERCENT_RANK() OVER (ORDER BY salaire) AS percentile FROM medecins;','La valeur va de 0 (moins payé) à 1 (plus payé).']},
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque patient par âge croissant.',
    hints:['PERCENT_RANK() OVER (ORDER BY age) AS percentile_age','SELECT nom, age, PERCENT_RANK() OVER (ORDER BY age) AS percentile_age FROM patients;','0 = le plus jeune, 1 = le plus âgé.']},
   {task:'Calculez le <b>PERCENT_RANK</b> de chaque consultation par durée croissante.',
    hints:['PERCENT_RANK() OVER (ORDER BY duree_min) AS percentile_duree','SELECT diagnostic, duree_min, PERCENT_RANK() OVER (ORDER BY duree_min) AS percentile_duree FROM consultations;','0 = consultation la plus courte, 1 = la plus longue.']},
  ]},

 {id:'e19',title:'39. Requête récapitulative complexe',hot:true,
  desc:'Combinaison de plusieurs techniques : JOIN + GROUP BY + HAVING + ORDER BY. Type examen final.',
  concept:`<span class="cm">-- Exemple de requête complexe combinant tout :</span>
<span class="kw">SELECT</span> m.nom <span class="kw">AS</span> medecin,
       <span class="fn">COUNT</span>(c.id_consultation) <span class="kw">AS</span> nb_consult,
       <span class="fn">AVG</span>(c.duree_min) <span class="kw">AS</span> duree_moy,
       <span class="fn">SUM</span>(c.duree_min) <span class="kw">AS</span> duree_totale
<span class="kw">FROM</span> <span class="tbl">medecins</span> m
<span class="kw">JOIN</span> <span class="tbl">consultations</span> c <span class="kw">ON</span> m.id_medecin = c.medecin_id
<span class="kw">GROUP BY</span> m.nom
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) >= <span class="num">2</span>
<span class="kw">ORDER BY</span> duree_totale <span class="kw">DESC</span>;`,
  exercises:[
   {task:'Pour chaque médecin ayant <b>au moins 2 consultations</b> : nom, nb consultations, durée moyenne et totale. Triez par durée totale décroissante.',
    hints:['JOIN consultations c ON m.id_medecin = c.medecin_id','GROUP BY m.nom HAVING COUNT(*) >= 2','SELECT m.nom AS medecin, COUNT(c.id_consultation) AS nb_consult, AVG(c.duree_min) AS duree_moy, SUM(c.duree_min) AS duree_totale FROM medecins m JOIN consultations c ON m.id_medecin = c.medecin_id GROUP BY m.nom HAVING COUNT(*) >= 2 ORDER BY duree_totale DESC;']},
   {task:'Par service, affichez le <b>nombre de patients distincts</b> et la <b>durée totale de consultations</b>. Triez par nb_patients décroissant.',
    hints:['JOIN patients p avec consultations c ON p.id_patient = c.id_patient','GROUP BY p.service, COUNT(DISTINCT p.id_patient) AS nb_patients, SUM(c.duree_min) AS total_min','SELECT p.service, COUNT(DISTINCT p.id_patient) AS nb_patients, SUM(c.duree_min) AS total_min FROM patients p JOIN consultations c ON p.id_patient = c.id_patient GROUP BY p.service ORDER BY nb_patients DESC;']},
   {task:'Pour chaque médecin ayant prescrit <b>au moins 1 médicament</b> : nom, nombre de prescriptions. Triez par nb_prescriptions décroissant.',
    hints:['JOIN medecins → consultations → prescriptions','GROUP BY m.nom HAVING COUNT(pr.id_prescription) >= 1','SELECT m.nom AS medecin, COUNT(pr.id_prescription) AS nb_prescriptions FROM medecins m JOIN consultations c ON m.id_medecin = c.medecin_id JOIN prescriptions pr ON c.id_consultation = pr.id_consultation GROUP BY m.nom HAVING COUNT(pr.id_prescription) >= 1 ORDER BY nb_prescriptions DESC;']},
  ]},

 {id:'e20',title:'40. Pivot manuel avec CASE WHEN',hot:true,
  desc:'"Pivoter" des lignes en colonnes : question avancée très fréquente dans les postes BI/reporting.',
  concept:`<span class="cm">-- Transformer des valeurs en colonnes :</span>
<span class="kw">SELECT</span>
  <span class="fn">COUNT</span>(<span class="kw">CASE</span> <span class="kw">WHEN</span> sexe=<span class="str">'M'</span> <span class="kw">THEN</span> <span class="num">1</span> <span class="kw">END</span>) <span class="kw">AS</span> hommes,
  <span class="fn">COUNT</span>(<span class="kw">CASE</span> <span class="kw">WHEN</span> sexe=<span class="str">'F'</span> <span class="kw">THEN</span> <span class="num">1</span> <span class="kw">END</span>) <span class="kw">AS</span> femmes
<span class="kw">FROM</span> <span class="tbl">patients</span>;

<span class="cm">-- Idée : COUNT ne compte que les valeurs non-NULL</span>`,
  exercises:[
   {task:'Créez un tableau croisé montrant, <b>par service</b>, le nombre d\'<b>hommes</b> et de <b>femmes</b>.',
    hints:['SELECT service, COUNT(CASE WHEN sexe=\'M\' THEN 1 END) AS hommes, COUNT(CASE WHEN sexe=\'F\' THEN 1 END) AS femmes','FROM patients GROUP BY service','SELECT service, COUNT(CASE WHEN sexe=\'M\' THEN 1 END) AS hommes, COUNT(CASE WHEN sexe=\'F\' THEN 1 END) AS femmes FROM patients GROUP BY service ORDER BY service;']},
   {task:'Pour chaque médecin (medecin_id), comptez les consultations <b>courtes</b> (< 30 min) et <b>longues</b> (>= 30 min).',
    hints:['COUNT(CASE WHEN duree_min < 30 THEN 1 END) AS courtes','COUNT(CASE WHEN duree_min >= 30 THEN 1 END) AS longues','SELECT medecin_id, COUNT(CASE WHEN duree_min < 30 THEN 1 END) AS courtes, COUNT(CASE WHEN duree_min >= 30 THEN 1 END) AS longues FROM consultations GROUP BY medecin_id;']},
   {task:'Affichez en une seule ligne le nombre total de patients <b>Hospitalisés</b> et le nombre <b>Ambulatoires</b>.',
    hints:['COUNT(CASE WHEN statut=\'Hospitalisé\' THEN 1 END) AS hospitalises','COUNT(CASE WHEN statut=\'Ambulatoire\' THEN 1 END) AS ambulatoires','SELECT COUNT(CASE WHEN statut=\'Hospitalisé\' THEN 1 END) AS hospitalises, COUNT(CASE WHEN statut=\'Ambulatoire\' THEN 1 END) AS ambulatoires FROM patients;']},
  ]},
 ,{id:'e21',title:'41. INTERSECT / EXCEPT – Intersection et exclusion',hot:true,
  desc:'Compléments de UNION : trouver des lignes communes ou absentes entre deux requêtes.',
  concept:`<span class="cm">-- INTERSECT : lignes présentes dans LES DEUX requêtes</span>
<span class="kw">SELECT</span> id_patient <span class="kw">FROM</span> <span class="tbl">consultations</span>
<span class="kw">INTERSECT</span>
<span class="kw">SELECT</span> id_patient <span class="kw">FROM</span> <span class="tbl">hospitalisations</span>;

<span class="cm">-- EXCEPT : lignes dans la 1ère mais PAS dans la 2ème</span>
<span class="kw">SELECT</span> id_patient <span class="kw">FROM</span> <span class="tbl">patients</span>
<span class="kw">EXCEPT</span>
<span class="kw">SELECT</span> id_patient <span class="kw">FROM</span> <span class="tbl">consultations</span>;
<span class="cm">-- Règle : même nombre de colonnes et mêmes types</span>`,
  exercises:[
   {task:'Trouvez les <b>id_patient</b> qui ont à la fois une <b>consultation ET une hospitalisation</b> (INTERSECT).',
    hints:['SELECT id_patient FROM consultations','INTERSECT','SELECT id_patient FROM consultations INTERSECT SELECT id_patient FROM hospitalisations;']},
   {task:'Trouvez les <b>id_patient</b> présents dans patients mais <b>sans aucune consultation</b> (EXCEPT).',
    hints:['SELECT id_patient FROM patients','EXCEPT SELECT id_patient FROM consultations','SELECT id_patient FROM patients EXCEPT SELECT id_patient FROM consultations;']},
   {task:'Trouvez les <b>nom</b> présents dans patients mais <b>absents de medecins</b> — noms qui n\'appartiennent qu\'aux patients (EXCEPT).',
    hints:['SELECT nom FROM patients EXCEPT SELECT nom FROM medecins','EXCEPT soustrait les lignes de la 2ème requête.','SELECT nom FROM patients EXCEPT SELECT nom FROM medecins ORDER BY nom;']},
  ]},

 {id:'e22',title:'42. NOW, DATEDIFF, DATE_FORMAT – Dates avancées',hot:true,
  desc:'Fonctions de date avancées pour les analyses temporelles. Indispensables en reporting.',
  concept:`<span class="cm">-- Date et heure actuelles :</span>
<span class="fn">NOW</span>()        <span class="cm">→ '2024-11-14 10:30:00'</span>
<span class="fn">CURDATE</span>()   <span class="cm">→ '2024-11-14'</span>

<span class="cm">-- Écart entre deux dates (en jours) :</span>
<span class="fn">DATEDIFF</span>(date1, date2)  <span class="cm">→ nombre de jours</span>

<span class="cm">-- Formater une date :</span>
<span class="fn">DATE_FORMAT</span>(date, <span class="str">'%d/%m/%Y'</span>)  <span class="cm">→ '14/11/2024'</span>
<span class="fn">DATE_FORMAT</span>(date, <span class="str">'%M %Y'</span>)     <span class="cm">→ 'November 2024'</span>`,
  exercises:[
   {task:'Affichez la <b>date et heure actuelles</b> avec NOW() dans une colonne <b>maintenant</b>, et la date du jour avec CURDATE() dans <b>aujourd_hui</b>.',
    hints:['SELECT NOW() AS maintenant, CURDATE() AS aujourd_hui;','Pas besoin de FROM — c\'est une requête sur des valeurs constantes.','SELECT NOW() AS maintenant, CURDATE() AS aujourd_hui;']},
   {task:'Pour chaque hospitalisation terminée, calculez la <b>durée du séjour en jours</b> (DATEDIFF entre date_sortie et date_entree).',
    hints:['DATEDIFF(date_sortie, date_entree) AS duree_jours','SELECT id_hosp, chambre, DATEDIFF(date_sortie, date_entree) AS duree_jours FROM hospitalisations','SELECT id_hosp, chambre, date_entree, date_sortie, DATEDIFF(date_sortie, date_entree) AS duree_jours FROM hospitalisations WHERE date_sortie IS NOT NULL;']},
   {task:'Formatez la date_consultation de chaque consultation au format <b>\'%d/%m/%Y\'</b> dans une colonne <b>date_fr</b>.',
    hints:['DATE_FORMAT(date_consultation, \'%d/%m/%Y\') AS date_fr','SELECT diagnostic, DATE_FORMAT(date_consultation, \'%d/%m/%Y\') AS date_fr FROM consultations;','%d = jour, %m = mois, %Y = année à 4 chiffres.']},
  ]},

 {id:'e23',title:'43. TRIM, REPLACE, LEFT, RIGHT – Nettoyage de chaînes',hot:true,
  desc:'Fonctions essentielles pour nettoyer et transformer des données textuelles brutes.',
  concept:`<span class="cm">-- Supprimer les espaces :</span>
<span class="fn">TRIM</span>(nom)          <span class="cm">→ 'Martin' (sans espaces)</span>
<span class="fn">LTRIM</span>(<span class="str">'  texte'</span>)  <span class="cm">→ 'texte'</span>

<span class="cm">-- Remplacer du texte :</span>
<span class="fn">REPLACE</span>(col, <span class="str">'ancien'</span>, <span class="str">'nouveau'</span>)

<span class="cm">-- Extraire les N premiers / derniers caractères :</span>
<span class="fn">LEFT</span>(nom, <span class="num">3</span>)    <span class="cm">→ 'Mar' (3 premiers)</span>
<span class="fn">RIGHT</span>(nom, <span class="num">2</span>)   <span class="cm">→ 'in' (2 derniers)</span>`,
  exercises:[
   {task:'Nettoyez les noms de patients : affichez le nom avec <b>TRIM</b> et la <b>première lettre</b> avec LEFT(nom, 1) dans une colonne <b>initiale</b>.',
    hints:['TRIM(nom) AS nom_propre, LEFT(nom, 1) AS initiale','SELECT TRIM(nom) AS nom_propre, LEFT(nom, 1) AS initiale FROM patients;','LEFT(col, n) retourne les n premiers caractères de gauche.']},
   {task:'Dans les diagnostics, <b>remplacez</b> le mot "artérielle" par "art." avec REPLACE. Affichez diagnostic et diagnostic_court.',
    hints:['REPLACE(diagnostic, \'artérielle\', \'art.\') AS diagnostic_court','SELECT diagnostic, REPLACE(diagnostic, \'artérielle\', \'art.\') AS diagnostic_court FROM consultations;','REPLACE(colonne, ancien, nouveau)']},
   {task:'Affichez les <b>3 derniers caractères</b> du groupe sanguin avec RIGHT et les <b>2 premiers</b> avec LEFT pour chaque patient.',
    hints:['LEFT(groupe_sanguin, 2) AS type_sang, RIGHT(groupe_sanguin, 1) AS rhesus','Exemple : LEFT(\'AB+\', 2) = \'AB\', RIGHT(\'AB+\', 1) = \'+\'','SELECT nom, groupe_sanguin, LEFT(groupe_sanguin, 2) AS type_sang, RIGHT(groupe_sanguin, 1) AS rhesus FROM patients;']},
  ]},
]};

const SCHEMA_DEF=[
  {name:'patients',rows:[{c:'id_patient',t:'INTEGER',n:'PK'},{c:'nom',t:'TEXT',n:''},{c:'prenom',t:'TEXT',n:''},{c:'age',t:'INTEGER',n:''},{c:'sexe',t:'TEXT',n:"'M'/'F'"},{c:'groupe_sanguin',t:'TEXT',n:''},{c:'service',t:'TEXT',n:''},{c:'date_admission',t:'TEXT',n:''},{c:'statut',t:'TEXT',n:''},{c:'medecin_id',t:'INTEGER',n:'FK'}]},
  {name:'consultations',rows:[{c:'id_consultation',t:'INTEGER',n:'PK'},{c:'id_patient',t:'INTEGER',n:'FK'},{c:'date_consultation',t:'TEXT',n:''},{c:'diagnostic',t:'TEXT',n:''},{c:'traitement',t:'TEXT',n:''},{c:'medecin_id',t:'INTEGER',n:'FK'},{c:'duree_min',t:'INTEGER',n:'minutes'}]},
  {name:'medecins',rows:[{c:'id_medecin',t:'INTEGER',n:'PK'},{c:'nom',t:'TEXT',n:''},{c:'specialite',t:'TEXT',n:''},{c:'service',t:'TEXT',n:''},{c:'salaire',t:'INTEGER',n:'€/mois'}]},
  {name:'hospitalisations',rows:[{c:'id_hosp',t:'INTEGER',n:'PK'},{c:'id_patient',t:'INTEGER',n:'FK'},{c:'date_entree',t:'TEXT',n:''},{c:'date_sortie',t:'TEXT',n:'NULL=en cours'},{c:'chambre',t:'TEXT',n:''},{c:'cout_journalier',t:'INTEGER',n:'€'}]},
  {name:'medicaments',rows:[{c:'id_medicament',t:'INTEGER',n:'PK'},{c:'nom_medicament',t:'TEXT',n:''},{c:'categorie',t:'TEXT',n:''},{c:'prix_unitaire',t:'REAL',n:'€'}]},
  {name:'prescriptions',rows:[{c:'id_prescription',t:'INTEGER',n:'PK'},{c:'id_consultation',t:'INTEGER',n:'FK'},{c:'id_medicament',t:'INTEGER',n:'FK'},{c:'quantite',t:'INTEGER',n:''},{c:'duree_jours',t:'INTEGER',n:''}]},
];


// Enregistrement dans le registre global et activation comme domaine par défaut.
// CUR et SCHEMA_DEF définis ci-dessus sont directement inclus dans l'objet de domaine.
DOMAINS['sante-hop'] = { meta: DOMAIN_META, sqlInit: SQL_INIT, skillMap: SKILL_MAP, cur: CUR, schemaDef: SCHEMA_DEF };
if (!window.ACTIVE_DOMAIN) window.ACTIVE_DOMAIN = DOMAINS['sante-hop'];
