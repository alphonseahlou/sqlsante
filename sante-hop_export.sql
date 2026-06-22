-- ═══════════════════════════════════════
-- SQLSanté — Export de la base "Gestion Hospitalière"
-- Source : js/domains/sante-hop.js (const SQL_INIT)
-- Dialecte : SQLite — compatible MySQL/PostgreSQL avec adaptations mineures
--   (types stricts, AUTOINCREMENT au lieu de INTEGER, etc. si besoin)
-- ═══════════════════════════════════════

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
