-- ═══════════════════════════════════════
-- SQLSanté — Export de la base "BI Santé"
-- Source : js/domains/sante-bi.js (const SQL_INIT_BI)
-- Dialecte : SQLite
-- ═══════════════════════════════════════
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
