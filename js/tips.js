// Tips — explications en langage simple pour chaque leçon.
// Clé = ID de leçon (d1, i3, a2…). Le champ 'tip' est optionnel dans les leçons.
// Affichés dans un bloc "En termes simples" replié par défaut, à ouvrir au clic.
const TIPS = {

  // Débutant
  d1: {
    simple: '<b>SELECT</b> est la commande pour lire des données dans une base. C\'est toujours le point de départ d\'une question posée à la base : "Montre-moi ces informations."<br><br><b>FROM</b> précise dans quelle table chercher. Une base de données est un ensemble de tables — chaque table ressemble à un tableau Excel avec des lignes et des colonnes.',
    analogy: '📂 Imaginez un classeur avec plusieurs onglets : <i>patients</i>, <i>consultations</i>, <i>médecins</i>. <code>SELECT * FROM patients</code> revient à ouvrir l\'onglet patients et afficher toutes ses lignes.'
  },
  d2: {
    simple: '<b>WHERE</b> filtre les lignes — il ne garde que celles qui correspondent à une condition.<br><br>Les opérateurs : <b>=</b> (égal), <b>!=</b> (différent), <b>&gt;</b> <b>&lt;</b> (supérieur/inférieur).<br>Texte entre guillemets simples <code>\'Cardiologie\'</code>, nombres sans guillemets <code>60</code>.',
    analogy: '🔍 Chercher tous les patients de Cardiologie dans une liste de 1 000 fiches, c\'est long à la main. <code>WHERE service = \'Cardiologie\'</code> fait ce tri instantanément, comme un filtre dans Excel.'
  },
  d3: {
    simple: '<b>AND</b> exige que toutes les conditions soient vraies. <b>OR</b> exige qu\'au moins une le soit.<br><br><b>BETWEEN</b> filtre une plage de valeurs (bornes incluses). <b>IN</b> vérifie si une valeur appartient à une liste de valeurs possibles.',
    analogy: '🔎 <code>WHERE service IN (\'Cardiologie\', \'Neurologie\') AND age BETWEEN 30 AND 60</code> : patients des deux services ET dans cette tranche d\'âge. Sans AND/IN/BETWEEN, il faudrait écrire plusieurs conditions séparées.'
  },
  d4: {
    simple: '<b>NULL</b> signifie "valeur absente" — pas zéro, pas vide, mais inconnu. On ne peut pas tester NULL avec <b>=</b> : il faut <b>IS NULL</b> ou <b>IS NOT NULL</b>.<br><br><b>COALESCE(col, valeur)</b> remplace NULL par une valeur par défaut dans l\'affichage.',
    analogy: '🏥 Un patient encore hospitalisé n\'a pas de date de sortie : <code>date_sortie IS NULL</code> le retrouve. <code>COALESCE(date_sortie, \'En cours\')</code> affiche "En cours" à la place du NULL.'
  },
  d5: {
    simple: '<b>ORDER BY</b> trie les résultats selon une ou plusieurs colonnes.<br><b>ASC</b> = croissant (A→Z, 1→100) — c\'est le défaut. <b>DESC</b> = décroissant (Z→A, 100→1).<br><br><b>LIMIT</b> restreint le nombre de lignes retournées. Indispensable pour obtenir le "top N" d\'un classement.',
    analogy: '🗂️ <code>ORDER BY salaire DESC LIMIT 3</code> : classer les médecins du mieux payé au moins bien payé, puis ne garder que les 3 premiers — comme un podium.'
  },
  d6: {
    simple: '<b>SELECT DISTINCT</b> élimine les doublons dans le résultat. Si dix patients sont dans le service Cardiologie, <code>SELECT DISTINCT service</code> retourne "Cardiologie" une seule fois.<br><br>On peut appliquer DISTINCT sur plusieurs colonnes : chaque combinaison unique compte.',
    analogy: '📋 Comme l\'option "Supprimer les doublons" dans Excel — mais appliquée à la volée dans la requête, sans modifier les données originales.'
  },

  d8: {
    simple: '<b>OFFSET</b> saute les N premières lignes avant d\'afficher les résultats. Combiné à <b>LIMIT</b>, il permet de paginer :<br>• <code>LIMIT 3 OFFSET 0</code> → page 1 (lignes 1–3)<br>• <code>LIMIT 3 OFFSET 3</code> → page 2 (lignes 4–6)<br>• <code>LIMIT 3 OFFSET 6</code> → page 3 (lignes 7–9)',
    analogy: '📖 Comme sauter des pages dans un livre : LIMIT = nombre de pages à lire, OFFSET = nombre de pages à ignorer avant de commencer. Pour aller directement au chapitre 3 (3 pages par chapitre) : <code>LIMIT 3 OFFSET 6</code>.'
  },
  d9: {
    simple: 'Pour afficher <b>X% des données</b>, calculez le nombre de lignes correspondant :<br>• <b>Manuel</b> : total × (X ÷ 100) = N, puis <code>LIMIT N</code><br>• <b>Dynamique</b> : <code>LIMIT (SELECT CAST(COUNT(*) * 0.30 AS INT) FROM table)</code><br><br><b>CAST(… AS INT)</b> convertit le résultat décimal en entier (arrondi inférieur).',
    analogy: '📊 Vous avez 10 patients et voulez voir 30% des cas → 10 × 0,30 = 3. En SQL : <code>LIMIT 3</code>. La version dynamique calcule ce chiffre automatiquement, même si la table passe à 1 000 patients.'
  },
  d7: {
    simple: 'SQL a des fonctions qui transforment les données <b>à la volée</b>, sans modifier la base :<br>• <code>UPPER</code> / <code>LOWER</code> → majuscules / minuscules<br>• <code>LENGTH</code> → nombre de caractères<br>• <code>CONCAT</code> → assembler du texte<br>• <code>ROUND</code> → arrondir un nombre<br>• <code>YEAR</code> / <code>MONTH</code> → extraire une partie d\'une date',
    analogy: '🧮 Comme des formules Excel : <code>UPPER</code>=MAJUSCULE, <code>LENGTH</code>=NBCAR, <code>CONCAT</code>=CONCATENER, <code>ROUND</code>=ARRONDI, <code>YEAR</code>=ANNEE. En SQL, elles s\'appliquent sur <b>toutes les lignes d\'un coup</b>.'
  },

  // Intermédiaire
  i1: {
    simple: '<b>JOIN</b> (ou INNER JOIN) relie deux tables via une colonne commune — la clé étrangère (FK). Le résultat ne contient que les lignes qui ont une correspondance dans les deux tables.',
    analogy: '🔗 Les patients ont un <code>medecin_id</code>. Les médecins ont un <code>id_medecin</code>. JOIN les relie comme assembler deux pièces de puzzle : on obtient le nom du patient avec le nom de son médecin sur la même ligne.'
  },
  i2: {
    simple: '<b>LEFT JOIN</b> retourne TOUTES les lignes de la table de gauche, même si elles n\'ont pas de correspondance à droite. Les colonnes droites seront NULL pour ces lignes.<br><br>Utile pour trouver des patients sans consultation, des médecins sans prescription, etc.',
    analogy: '📋 Avec INNER JOIN, un patient sans consultation disparaît du résultat. Avec LEFT JOIN, il reste visible — avec des cases vides pour la consultation. Idéal pour détecter les "oubliés".'
  },
  i3: {
    simple: 'Les <b>fonctions d\'agrégation</b> calculent une valeur à partir de plusieurs lignes :<br>• <b>COUNT(*)</b> : nombre total de lignes — <b>COUNT(col)</b> ignore les NULL<br>• <b>AVG</b> : moyenne<br>• <b>SUM</b> : total<br>• <b>MAX / MIN</b> : valeur la plus haute / la plus basse',
    analogy: '🧮 Équivalent des formules Excel : COUNT → NB(), AVG → MOYENNE(), SUM → SOMME(), MAX/MIN → MAX()/MIN(). En SQL, elles s\'appliquent sur des colonnes entières de la base en une seule instruction.'
  },
  i4: {
    simple: '<b>GROUP BY</b> regroupe les lignes ayant la même valeur dans une colonne, puis permet d\'appliquer des fonctions d\'agrégation sur chaque groupe.<br><br><b>GROUP_CONCAT</b> concatène les textes d\'un groupe en une seule chaîne séparée par un délimiteur.',
    analogy: '📊 Compter combien de patients sont dans chaque service. Sans GROUP BY vous obtenez une liste de 10 patients. Avec <code>GROUP BY service</code> vous obtenez 5 lignes : une par service avec son effectif.'
  },
  i5: {
    simple: '<b>HAVING</b> filtre les résultats après le regroupement GROUP BY. C\'est le WHERE des agrégats.<br><br>Règle : WHERE filtre les lignes AVANT le groupement. HAVING filtre les groupes APRÈS le calcul.',
    analogy: '🏥 "Je veux les services qui ont plus de 3 patients hospitalisés." On ne peut pas le savoir avant de compter — donc HAVING, pas WHERE.'
  },
  i6: {
    simple: 'On peut enchaîner plusieurs JOIN dans la même requête pour relier 3 tables ou plus. Chaque JOIN ajoute une nouvelle table en indiquant sur quelle colonne la relier à celles déjà présentes.',
    analogy: '🔗🔗 Patient → Consultation → Prescription → Médicament : 3 JOIN successifs permettent de répondre à "Quel médicament a été prescrit à chaque patient lors de quelle consultation ?"'
  },
  i7: {
    simple: '<b>LIKE</b> filtre du texte selon un motif. Deux wildcards (jokers) :<br>• <b>%</b> : remplace n\'importe quelle séquence de caractères (zéro ou plus)<br>• <b>_</b> : remplace exactement un caractère<br><br><code>\'%cardiaque%\'</code> trouve tout texte contenant "cardiaque", où qu\'il soit.',
    analogy: '🔍 Comme la barre de recherche d\'un traitement de texte : <code>WHERE diagnostic LIKE \'%Cancer%\'</code> retrouve tous les diagnostics contenant ce mot, qu\'il soit au début, au milieu ou à la fin.'
  },

  // Avancé
  a1: {
    simple: 'Une <b>sous-requête</b> est un SELECT imbriqué dans un autre. Elle peut apparaître :<br>• dans <b>WHERE</b> : pour filtrer selon un résultat calculé dynamiquement<br>• dans <b>FROM</b> : pour créer une table temporaire<br>• dans <b>SELECT</b> : pour ajouter une colonne calculée',
    analogy: '🪆 "Listez les patients plus âgés que la moyenne" — il faut d\'abord calculer la moyenne, puis comparer. La sous-requête calcule cette valeur à l\'intérieur de la requête principale : <code>WHERE age > (SELECT AVG(age) FROM patients)</code>'
  },
  a2: {
    simple: '<b>WITH … AS</b> crée une CTE (Common Table Expression) : une table temporaire nommée, définie en haut de la requête et réutilisée ensuite. Elle rend le code plus lisible qu\'une sous-requête imbriquée.<br><br>La CTE n\'est pas stockée en base — elle n\'existe que pendant l\'exécution de la requête.',
    analogy: '📝 Comme écrire un brouillon nommé en haut de la page ("patients seniors = ceux de 65 ans et plus"), puis s\'y référer plus bas. Au lieu d\'écrire la définition plusieurs fois, on lui donne un nom.'
  },
  a3: {
    simple: '<b>CASE WHEN</b> est un "si/alors/sinon" dans SQL. Il crée une nouvelle colonne calculée dont la valeur dépend d\'une condition.<br><br>Structure : CASE WHEN condition THEN valeur ELSE autre_valeur END',
    analogy: '💊 "Si l\'âge est supérieur à 65, afficher \'Gériatrie\', sinon afficher \'Standard\'." C\'est exactement la fonction SI() d\'Excel, en plus flexible.'
  },
  a4: {
    simple: 'Pour trouver les doublons : regroupez avec <b>GROUP BY</b> sur la colonne à tester, puis filtrez avec <b>HAVING COUNT(*) &gt; 1</b> pour ne garder que les groupes ayant plusieurs lignes.<br><br>C\'est la question classique d\'entretien : "Comment détecter les doublons ?"',
    analogy: '🔁 Si un patient apparaît deux fois dans consultations, son id_patient aura COUNT(*) = 2. <code>HAVING COUNT(*) > 1</code> isole exactement ces cas — comme le filtre "doublons" dans Excel.'
  },
  a5: {
    simple: 'Pour trouver les éléments d\'une table qui n\'ont <b>aucune correspondance</b> dans une autre, deux approches :<br>• <b>LEFT JOIN + IS NULL</b> : jointure gauche, puis filtrer les lignes sans correspondance<br>• <b>NOT IN (sous-requête)</b> : exclure les IDs présents dans l\'autre table',
    analogy: '🔍 "Quels patients n\'ont aucune consultation ?" Avec LEFT JOIN, ils apparaissent avec des colonnes NULL côté consultations. <code>WHERE c.id_consultation IS NULL</code> les isole.'
  },
  a6: {
    simple: 'SQL propose des fonctions pour manipuler les dates :<br>• <b>YEAR(date) / MONTH(date)</b> : extrait l\'année ou le mois<br>• Ces fonctions permettent de grouper des données par mois, année, trimestre…<br><br>Exemple : compter les consultations par mois avec <code>GROUP BY MONTH(date_consultation)</code>.',
    analogy: '📅 Grouper les consultations par mois pour voir les pics d\'activité saisonniers, sans trier manuellement chaque date. <code>MONTH(date_admission)</code> retourne un nombre de 1 à 12.'
  },
  a7: {
    simple: '<b>COALESCE(a, b)</b> retourne la première valeur non-NULL de sa liste. Si <code>a</code> est NULL, retourne <code>b</code>.<br><br><b>NULLIF(a, b)</b> retourne NULL si <code>a = b</code>, sinon retourne <code>a</code>. Souvent utilisé pour éviter une division par zéro.',
    analogy: '🏥 <code>COALESCE(date_sortie, \'En cours\')</code> : si la date de sortie est NULL (patient encore hospitalisé), affiche "En cours". <code>NULLIF(prix, 0)</code> : retourne NULL si le prix vaut 0, évitant une division par zéro.'
  },

  // Expert
  e1: {
    simple: 'Les <b>fonctions de fenêtrage</b> (OVER) calculent des valeurs sur un groupe de lignes sans les regrouper — chaque ligne garde son identité dans le résultat.<br><br><b>PARTITION BY</b> définit le groupe. <b>ORDER BY</b> dans OVER définit l\'ordre dans ce groupe.',
    analogy: '📊 Calculer le rang de chaque patient dans son service selon son âge, sans fusionner les lignes de patients. Chaque patient reste visible avec son rang calculé à côté.'
  },
  e2: {
    simple: '<b>SUM() OVER (ORDER BY …)</b> calcule un <b>total cumulé</b> : chaque ligne affiche la somme de toutes les lignes précédentes plus la sienne.<br><br><b>AVG() OVER (ORDER BY …)</b> calcule une <b>moyenne glissante</b> : la moyenne de toutes les lignes vues jusqu\'à la courante.',
    analogy: '📈 Sur un relevé bancaire, le "solde courant" est un cumul : chaque ligne ajoute le montant au total précédent. <code>SUM(cout_journalier) OVER (ORDER BY id_hosp)</code> fait exactement ça sur les hospitalisations.'
  },
  e3: {
    simple: '<b>LAG(col, n)</b> accède à la valeur de la ligne N rangs avant dans la fenêtre. <b>LEAD(col, n)</b> accède à la ligne N rangs après. Permet des calculs de variation entre lignes consécutives.',
    analogy: '⏪⏩ Sur une série de consultations triées par date : LAG(date_consultation, 1) donne la date de la consultation précédente. Permet de calculer le délai entre deux visites.'
  },
  e4: {
    simple: 'Trouver la 2ème valeur la plus haute : deux approches :<br>• <b>LIMIT + OFFSET</b> : trier en DESC et sauter la 1ère ligne avec <code>OFFSET 1</code><br>• <b>Sous-requête</b> : <code>SELECT MAX(col) WHERE col &lt; (SELECT MAX(col) …)</code><br><br>DISTINCT évite que des valeurs égales bloquent le résultat.',
    analogy: '🥈 "Quel est le 2ème salaire le plus élevé ?" Avec OFFSET : classer, puis sauter la 1ère ligne. Sans OFFSET : prendre le max des salaires inférieurs au max absolu.'
  },
  e5: {
    simple: 'Un <b>index</b> est une structure qui accélère les recherches sur une colonne — comme l\'index d\'un livre qui évite de lire toutes les pages.<br><br><b>EXPLAIN</b> affiche le plan d\'exécution d\'une requête : comment SQL va la résoudre, si un index est utilisé, combien de lignes seront parcourues.',
    analogy: '📚 Sans index, SQL lit chaque ligne de la table (scan complet). Avec <code>CREATE INDEX idx_service ON patients(service)</code>, les recherches <code>WHERE service = \'Cardiologie\'</code> deviennent quasi-instantanées.'
  },
  e6: {
    simple: '<b>UNION</b> combine les résultats de deux SELECT en empilant les lignes. Les colonnes doivent correspondre en nombre et en type.<br><b>UNION ALL</b> garde les doublons. <b>UNION</b> les supprime.',
    analogy: '📚 Fusionner deux listes de patients (deux hôpitaux différents) en une seule. UNION supprime les doublons si un patient apparaît dans les deux listes. UNION ALL garde tout.'
  },
  e7: {
    simple: '<b>EXISTS</b> retourne vrai si la sous-requête retourne au moins une ligne. <b>NOT EXISTS</b> retourne vrai si elle est vide.<br><br>Plus performant que IN sur les grandes tables : SQL s\'arrête dès qu\'il trouve une première correspondance.',
    analogy: '✅ "Le patient a-t-il au moins une consultation ?" EXISTS vérifie l\'existence sans récupérer toutes les données. Comme demander "y a-t-il un médecin disponible ?" plutôt que "liste tous les médecins disponibles."'
  },
  e8: {
    simple: 'Fonctions avancées de chaînes : <b>SUBSTRING/SUBSTR</b> extrait une portion de texte à partir d\'une position. <b>INSTR</b> trouve la position d\'un caractère. Utiles pour nettoyer ou transformer des données textuelles.',
    analogy: '✂️ Extraire le code postal des 5 derniers caractères d\'une adresse, ou trouver la position du tiret dans un code de chambre "A-101".'
  },
  e9: {
    simple: '<b>CONCAT(a, b, c)</b> assemble plusieurs textes en un seul. On peut aussi utiliser l\'opérateur <b>||</b> (standard SQL).<br><br>Utile pour construire des noms complets, des libellés formatés, ou des clés composites directement dans la requête.',
    analogy: '🔤 <code>CONCAT(prenom, \' \', nom)</code> crée "Sophie Martin" à partir de deux colonnes séparées — comme la formule <code>=A1&" "&B1</code> dans Excel, mais appliquée à toute la table d\'un coup.'
  },
  e10: {
    simple: '<b>INSERT INTO</b> ajoute une nouvelle ligne dans une table. On précise les colonnes et les valeurs dans le même ordre.<br><br>Les colonnes omises reçoivent NULL ou leur valeur par défaut. Les textes vont entre guillemets simples, les nombres sans.',
    analogy: '📝 Admettre un nouveau patient en base : on remplit les colonnes (nom, age, service…) avec ses informations. La BD vérifie la cohérence des types avant d\'accepter la nouvelle ligne.'
  },
  e11: {
    simple: '<b>UPDATE … SET</b> modifie des lignes existantes. La clause <b>WHERE</b> est indispensable pour cibler les bonnes lignes — sans WHERE, <b>toutes les lignes</b> de la table sont modifiées.<br><br>On peut modifier plusieurs colonnes en même temps en séparant les affectations par des virgules.',
    analogy: '⚠️ UPDATE sans WHERE = modifier tous les dossiers patients d\'un coup. Toujours cibler : <code>UPDATE patients SET statut = \'Hospitalisé\' WHERE id_patient = 3</code>.'
  },
  e12: {
    simple: 'Combinaison de DML (INSERT, UPDATE, DELETE) dans des scénarios réalistes : mettre à jour un salaire puis vérifier le résultat, ajouter une prescription puis la lire, etc.',
    analogy: '🔄 En pratique, les bases de données sont modifiées en permanence. Maîtriser INSERT + UPDATE + DELETE permet de maintenir les données à jour et cohérentes.'
  },
  e13: {
    simple: 'Une <b>vue</b> est une table virtuelle définie par une requête SELECT. Elle ne stocke pas de données — elle les calcule à la demande.<br><br><b>CREATE VIEW nom AS SELECT …</b> crée la vue. Elle s\'utilise ensuite comme une table ordinaire. <b>DROP VIEW</b> la supprime.',
    analogy: '🪟 Comme un onglet Excel qui affiche automatiquement les résultats d\'une formule. La vue <code>vue_seniors</code> filtre toujours les patients de 65 ans et plus, même si de nouveaux patients sont ajoutés.'
  },
  e14: {
    simple: 'Les types de données définissent ce qu\'une colonne peut stocker :<br>• <b>INTEGER</b> : nombre entier<br>• <b>REAL / DECIMAL</b> : nombre décimal<br>• <b>TEXT / VARCHAR</b> : texte<br>• <b>DATE / DATETIME</b> : date et heure<br><br>Choisir le bon type garantit l\'intégrité des données.',
    analogy: '📏 Comme choisir le bon type de case sur un formulaire : case à cocher (booléen), champ numérique (INTEGER), champ texte libre (TEXT), calendrier (DATE).'
  },
  e15: {
    simple: '<b>DENSE_RANK()</b> attribue un rang sans saut en cas d\'égalité (1,1,2 — pas 1,1,3 comme RANK).<br><br><b>NTILE(n)</b> divise les lignes en n groupes de taille égale : quartiles avec NTILE(4), déciles avec NTILE(10).',
    analogy: '📊 DENSE_RANK : deux ex-aequo en 1ère place → le suivant est 2ème, pas 3ème. NTILE(4) : diviser les patients en 4 groupes d\'âge égaux pour une analyse épidémiologique par tranche.'
  },
  e16: {
    simple: '<b>FIRST_VALUE / LAST_VALUE</b> retournent la première ou dernière valeur dans une fenêtre. <b>SUM() OVER</b> calcule un cumul progressif (running total) ligne par ligne.',
    analogy: '📈 Calculer un cumul des coûts d\'hospitalisation au fil des jours — chaque ligne affiche le total cumulé jusqu\'à cette date, comme un relevé de compte.'
  },
  e17: {
    simple: '<b>VARIANCE</b> et <b>STDDEV</b> mesurent la dispersion des données autour de la moyenne. Une forte variance = les valeurs sont très étalées. Une faible variance = elles sont regroupées.',
    analogy: '📉 La durée moyenne des consultations est 45 min. Mais si la variance est élevée, certaines durent 10 min et d\'autres 120 min. La moyenne seule peut être trompeuse.'
  },
  e18: {
    simple: '<b>PERCENT_RANK()</b> calcule la position relative d\'une ligne entre 0 et 1 :<br>• 0 = valeur la plus basse<br>• 1 = valeur la plus haute<br>• 0.5 = médiane<br><br>Formule : (rang - 1) / (nombre total de lignes - 1).',
    analogy: '📉 Un médecin avec PERCENT_RANK = 0.75 sur le salaire gagne plus que 75% de ses collègues. Utile pour comparer une valeur à sa position dans la distribution sans connaître les valeurs absolues.'
  },
  e19: {
    simple: 'Les requêtes complexes combinent plusieurs techniques : <b>JOIN</b> pour relier les tables, <b>GROUP BY</b> pour agréger, <b>HAVING</b> pour filtrer les groupes, <b>ORDER BY</b> pour trier.<br><br>Ordre d\'exécution SQL : FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
    analogy: '🏗️ Comme assembler plusieurs outils en une seule requête : "Pour chaque médecin ayant fait au moins 2 consultations, calculer la durée totale et trier par durée décroissante."'
  },
  e20: {
    simple: '<b>CASE WHEN</b> avancé : on peut imbriquer des CASE, les utiliser dans GROUP BY, ORDER BY, ou les combiner avec des agrégats. Très puissant pour créer des catégories dynamiques.',
    analogy: '🏷️ Classer les médecins en "Junior" (< 8000€), "Confirmé" (8000-9000€), "Senior" (> 9000€) directement dans la requête, sans modifier la table.'
  },
  e21: {
    simple: '<b>INTERSECT</b> retourne les lignes présentes dans LES DEUX requêtes. <b>EXCEPT</b> retourne les lignes du premier SELECT qui ne sont PAS dans le second.<br><br>Contrairement à JOIN, ces opérateurs comparent des lignes complètes.',
    analogy: '🔵🟡 INTERSECT = l\'intersection de deux cercles (ce qui est dans les deux). EXCEPT = ce qui est dans le cercle gauche mais pas dans le droit.'
  },
  e22: {
    simple: '<b>NOW()</b> retourne la date et l\'heure actuelles. <b>DATEDIFF</b> calcule le nombre de jours entre deux dates. <b>DATE_FORMAT</b> formate une date pour l\'affichage.',
    analogy: '📅 Calculer combien de jours un patient est resté hospitalisé : DATEDIFF(date_sortie, date_entree). Afficher la date en format français : DATE_FORMAT(date, \'%d/%m/%Y\').'
  },
  e23: {
    simple: '<b>TRIM</b> supprime les espaces superflus (souvent présents dans les imports). <b>REPLACE</b> remplace un texte par un autre. <b>LEFT/RIGHT</b> extraient N caractères d\'un côté.',
    analogy: '🧹 Les données importées depuis Excel contiennent souvent des espaces cachés ou des abréviations non uniformes. Ces fonctions nettoient et standardisent les données texte.'
  },
};

// Lexique SQL — dictionnaire des mots-clés, utilisé par le panneau "📖 Lexique" accessible depuis la topbar.
const LEXIQUE = [
  // Lecture de données
  { kw:'SELECT',      cat:'Lecture',     simple:'Choisit les colonnes à afficher.',                             ex:'SELECT nom, age FROM patients;' },
  { kw:'FROM',        cat:'Lecture',     simple:'Indique la table source des données.',                         ex:'SELECT * FROM medecins;' },
  { kw:'WHERE',       cat:'Filtrage',    simple:'Filtre les lignes selon une condition.',                        ex:'SELECT * FROM patients WHERE age > 60;' },
  { kw:'AND',         cat:'Filtrage',    simple:'Les deux conditions doivent être vraies.',                      ex:'WHERE age > 60 AND sexe = \'F\''},
  { kw:'OR',          cat:'Filtrage',    simple:'Au moins une des conditions doit être vraie.',                  ex:'WHERE service = \'Cardiologie\' OR service = \'Neurologie\''},
  { kw:'NOT',         cat:'Filtrage',    simple:'Inverse une condition.',                                        ex:'WHERE NOT statut = \'Ambulatoire\''},
  { kw:'LIKE',        cat:'Filtrage',    simple:'Filtre du texte avec un motif. % = n\'importe quoi, _ = un caractère.', ex:'WHERE nom LIKE \'M%\'' },
  { kw:'IN',          cat:'Filtrage',    simple:'Vérifie si une valeur est dans une liste.',                     ex:'WHERE service IN (\'Cardiologie\', \'Neurologie\')' },
  { kw:'BETWEEN',     cat:'Filtrage',    simple:'Filtre entre deux valeurs (bornes incluses).',                  ex:'WHERE age BETWEEN 40 AND 65' },
  { kw:'IS NULL',     cat:'Filtrage',    simple:'Détecte les valeurs manquantes (NULL = absence de valeur).',    ex:'WHERE date_sortie IS NULL' },
  { kw:'IS NOT NULL', cat:'Filtrage',    simple:'Exclut les lignes sans valeur.',                                ex:'WHERE date_sortie IS NOT NULL' },
  { kw:'DISTINCT',    cat:'Lecture',     simple:'Supprime les lignes en double du résultat.',                    ex:'SELECT DISTINCT service FROM patients;' },
  { kw:'AS',          cat:'Lecture',     simple:'Renomme une colonne ou une table dans le résultat (alias).',    ex:'SELECT nom AS nom_patient FROM patients;' },
  // Tri et pagination
  { kw:'ORDER BY',    cat:'Tri',         simple:'Trie les résultats. ASC = croissant (défaut), DESC = décroissant.', ex:'ORDER BY age DESC' },
  { kw:'LIMIT',       cat:'Pagination',  simple:'Limite le nombre de lignes retournées.',                        ex:'SELECT * FROM patients LIMIT 5;' },
  { kw:'OFFSET',      cat:'Pagination',  simple:'Saute les N premières lignes (pour la pagination).',            ex:'LIMIT 10 OFFSET 20' },
  // Jointures
  { kw:'JOIN',        cat:'Jointures',   simple:'Relie deux tables via une colonne commune. Ne garde que les lignes avec correspondance.', ex:'FROM patients JOIN medecins ON patients.medecin_id = medecins.id_medecin' },
  { kw:'LEFT JOIN',   cat:'Jointures',   simple:'Garde toutes les lignes de gauche, même sans correspondance à droite (colonnes droites = NULL).', ex:'FROM patients LEFT JOIN consultations ON ...' },
  { kw:'RIGHT JOIN',  cat:'Jointures',   simple:'Garde toutes les lignes de droite, même sans correspondance à gauche.', ex:'FROM patients RIGHT JOIN medecins ON ...' },
  { kw:'FULL JOIN',   cat:'Jointures',   simple:'Garde toutes les lignes des deux côtés, avec NULL là où il n\'y a pas de correspondance.', ex:'FROM patients FULL JOIN medecins ON ...' },
  { kw:'ON',          cat:'Jointures',   simple:'Précise la condition de jointure (quelle colonne relie les deux tables).', ex:'ON patients.medecin_id = medecins.id_medecin' },
  // Agrégation
  { kw:'GROUP BY',    cat:'Agrégation',  simple:'Regroupe les lignes ayant la même valeur, pour calculer des totaux par groupe.', ex:'GROUP BY service' },
  { kw:'HAVING',      cat:'Agrégation',  simple:'Filtre les groupes après GROUP BY (comme WHERE, mais pour les agrégats).', ex:'HAVING COUNT(*) > 3' },
  { kw:'COUNT',       cat:'Agrégation',  simple:'Compte le nombre de lignes. COUNT(*) compte tout, COUNT(col) ignore les NULL.', ex:'SELECT COUNT(*) FROM patients;' },
  { kw:'SUM',         cat:'Agrégation',  simple:'Additionne les valeurs d\'une colonne numérique.',              ex:'SELECT SUM(duree_min) FROM consultations;' },
  { kw:'AVG',         cat:'Agrégation',  simple:'Calcule la moyenne d\'une colonne numérique.',                  ex:'SELECT AVG(age) FROM patients;' },
  { kw:'MAX',         cat:'Agrégation',  simple:'Retourne la valeur la plus haute.',                             ex:'SELECT MAX(salaire) FROM medecins;' },
  { kw:'MIN',         cat:'Agrégation',  simple:'Retourne la valeur la plus basse.',                             ex:'SELECT MIN(age) FROM patients;' },
  // CTE et sous-requêtes
  { kw:'WITH ... AS', cat:'CTE',         simple:'Crée une table temporaire nommée réutilisable dans la requête. Rend le code plus lisible.', ex:'WITH adultes AS (SELECT * FROM patients WHERE age > 18)' },
  { kw:'Sous-requête',cat:'CTE',         simple:'Un SELECT imbriqué dans un autre SELECT, WHERE, ou FROM.',      ex:'WHERE id IN (SELECT id FROM ...)' },
  // Fonctions de fenêtrage
  { kw:'OVER',        cat:'Fenêtrage',   simple:'Définit une fenêtre de calcul pour une fonction de fenêtrage. La ligne n\'est pas regroupée.', ex:'RANK() OVER (PARTITION BY service ORDER BY age)' },
  { kw:'PARTITION BY',cat:'Fenêtrage',   simple:'Divise les données en sous-groupes pour le calcul de fenêtrage (comme GROUP BY mais sans fusionner les lignes).', ex:'OVER (PARTITION BY service)' },
  { kw:'RANK',        cat:'Fenêtrage',   simple:'Attribue un rang avec sauts en cas d\'égalité (1,1,3).',        ex:'RANK() OVER (ORDER BY age DESC)' },
  { kw:'DENSE_RANK',  cat:'Fenêtrage',   simple:'Attribue un rang sans sauts en cas d\'égalité (1,1,2).',       ex:'DENSE_RANK() OVER (ORDER BY age DESC)' },
  { kw:'ROW_NUMBER',  cat:'Fenêtrage',   simple:'Numérotation unique de chaque ligne, sans égalité.',            ex:'ROW_NUMBER() OVER (ORDER BY date_admission)' },
  { kw:'LAG',         cat:'Fenêtrage',   simple:'Accède à la valeur de la ligne précédente dans la fenêtre.',    ex:'LAG(date_consultation, 1) OVER (ORDER BY date_consultation)' },
  { kw:'LEAD',        cat:'Fenêtrage',   simple:'Accède à la valeur de la ligne suivante dans la fenêtre.',      ex:'LEAD(date_consultation, 1) OVER (ORDER BY date_consultation)' },
  // DML
  { kw:'INSERT INTO', cat:'DML',         simple:'Ajoute une nouvelle ligne dans une table.',                     ex:'INSERT INTO patients (nom, age) VALUES (\'Dupont\', 45);' },
  { kw:'UPDATE',      cat:'DML',         simple:'Modifie des lignes existantes. Toujours utiliser WHERE !',       ex:'UPDATE medecins SET salaire = 9000 WHERE id_medecin = 3;' },
  { kw:'DELETE FROM', cat:'DML',         simple:'Supprime des lignes. Toujours utiliser WHERE !',                 ex:'DELETE FROM patients WHERE statut = \'Sorti\';' },
  // DDL
  { kw:'CREATE TABLE',cat:'DDL',         simple:'Crée une nouvelle table avec ses colonnes et leurs types.',     ex:'CREATE TABLE infirmiers (id INTEGER, nom TEXT);' },
  { kw:'ALTER TABLE', cat:'DDL',         simple:'Modifie une table existante (ajouter une colonne, etc.).',      ex:'ALTER TABLE patients ADD COLUMN telephone TEXT;' },
  { kw:'DROP TABLE',  cat:'DDL',         simple:'Supprime définitivement une table et toutes ses données.',       ex:'DROP TABLE table_temporaire;' },
  // Ensembles
  { kw:'UNION',       cat:'Ensembles',   simple:'Combine deux SELECT en empilant leurs lignes. Supprime les doublons.', ex:'SELECT nom FROM patients UNION SELECT nom FROM medecins;' },
  { kw:'UNION ALL',   cat:'Ensembles',   simple:'Comme UNION mais conserve les doublons. Plus rapide.',          ex:'SELECT ... UNION ALL SELECT ...' },
  { kw:'INTERSECT',   cat:'Ensembles',   simple:'Retourne les lignes présentes dans les deux SELECT.',           ex:'SELECT ... INTERSECT SELECT ...' },
  { kw:'EXCEPT',      cat:'Ensembles',   simple:'Retourne les lignes du premier SELECT absentes du second.',     ex:'SELECT ... EXCEPT SELECT ...' },
  // Fonctions utiles
  { kw:'CASE WHEN',   cat:'Logique',     simple:'Condition si/alors/sinon dans une requête.',                    ex:'CASE WHEN age > 65 THEN \'Senior\' ELSE \'Standard\' END' },
  { kw:'COALESCE',    cat:'Logique',     simple:'Retourne la première valeur non-NULL parmi ses arguments.',     ex:'COALESCE(date_sortie, \'En cours\')' },
  { kw:'NULLIF',      cat:'Logique',     simple:'Retourne NULL si les deux valeurs sont égales, sinon la première.', ex:'NULLIF(duree_min, 0)' },
  { kw:'CAST',        cat:'Logique',     simple:'Convertit une valeur d\'un type vers un autre.',                 ex:'CAST(age AS TEXT)' },
  { kw:'NOW',         cat:'Dates',       simple:'Retourne la date et l\'heure actuelles.',                        ex:'SELECT NOW();' },
  { kw:'DATEDIFF',    cat:'Dates',       simple:'Calcule le nombre de jours entre deux dates.',                   ex:'DATEDIFF(date_sortie, date_entree)' },
  { kw:'DATE_FORMAT', cat:'Dates',       simple:'Formate une date pour l\'affichage.',                            ex:"DATE_FORMAT(date_admission, '%d/%m/%Y')" },
  { kw:'UPPER/LOWER', cat:'Texte',       simple:'Convertit le texte en majuscules ou minuscules.',                ex:'SELECT UPPER(nom) FROM patients;' },
  { kw:'TRIM',        cat:'Texte',       simple:'Supprime les espaces en début et fin de texte.',                 ex:'SELECT TRIM(nom) FROM patients;' },
  { kw:'REPLACE',     cat:'Texte',       simple:'Remplace toutes les occurrences d\'un texte par un autre.',      ex:"REPLACE(diagnostic, 'artérielle', 'art.')" },
  { kw:'LEFT/RIGHT',  cat:'Texte',       simple:'Extrait N caractères depuis la gauche ou la droite.',            ex:'LEFT(groupe_sanguin, 2)' },
  { kw:'LENGTH',      cat:'Texte',       simple:'Retourne le nombre de caractères d\'un texte.',                  ex:'SELECT LENGTH(diagnostic) FROM consultations;' },
  { kw:'CONCAT / ||', cat:'Texte',       simple:'Colle plusieurs textes ensemble.',                               ex:"SELECT nom || ' ' || prenom FROM patients;" },
  { kw:'GROUP_CONCAT',cat:'Agrégation',  simple:'Concatène les valeurs d\'un groupe en une seule chaîne.',       ex:"GROUP_CONCAT(diagnostic, ', ')" },
  { kw:'VARIANCE',     cat:'Agrégation',  simple:'Mesure la dispersion des valeurs autour de la moyenne.',        ex:'SELECT VARIANCE(duree_min) FROM consultations;' },
  { kw:'STDDEV',       cat:'Agrégation',  simple:'Écart-type — racine carrée de la variance, dans la même unité que les données.', ex:'SELECT STDDEV(duree_min) FROM consultations;' },
  // Nombres
  { kw:'ROUND',        cat:'Nombres',     simple:'Arrondit un nombre décimal à N chiffres après la virgule.',     ex:'SELECT ROUND(salaire / 12, 2) FROM medecins;' },
  // Dates (suite)
  { kw:'YEAR',         cat:'Dates',       simple:'Extrait l\'année d\'une date.',                                 ex:'SELECT YEAR(date_admission) FROM patients;' },
  { kw:'MONTH',        cat:'Dates',       simple:'Extrait le mois d\'une date (1 à 12).',                         ex:'SELECT MONTH(date_admission) FROM patients;' },
  // CTE et sous-requêtes (suite)
  { kw:'EXISTS',       cat:'CTE',         simple:'Vrai si la sous-requête retourne au moins une ligne. NOT EXISTS teste l\'absence de résultat.', ex:'WHERE EXISTS (SELECT 1 FROM consultations WHERE consultations.id_patient = patients.id_patient)' },
  // Texte (suite)
  { kw:'SUBSTRING',    cat:'Texte',       simple:'Extrait une partie d\'un texte à partir d\'une position donnée.', ex:'SUBSTRING(diagnostic, 1, 10)' },
  // DDL (suite)
  { kw:'CREATE VIEW',  cat:'DDL',         simple:'Crée une vue : une requête sauvegardée, réutilisable comme une table virtuelle.', ex:'CREATE VIEW patients_actifs AS SELECT * FROM patients WHERE statut = \'Hospitalisé\';' },
  // Performance
  { kw:'INDEX',        cat:'Performance', simple:'Structure qui accélère la recherche sur une colonne, au prix d\'un espace disque et d\'un coût à l\'écriture.', ex:'CREATE INDEX idx_patients_nom ON patients(nom);' },
  { kw:'EXPLAIN',      cat:'Performance', simple:'Affiche le plan d\'exécution d\'une requête — comment SQLite compte s\'y prendre pour la répondre.', ex:'EXPLAIN QUERY PLAN SELECT * FROM patients WHERE nom = \'Martin\';' },
  // Fenêtrage (suite)
  { kw:'NTILE',        cat:'Fenêtrage',   simple:'Répartit les lignes en N groupes de taille égale (ex. quartiles, déciles).', ex:'NTILE(4) OVER (ORDER BY salaire)' },
  { kw:'FIRST_VALUE',  cat:'Fenêtrage',   simple:'Retourne la première valeur de la fenêtre.',                    ex:'FIRST_VALUE(salaire) OVER (PARTITION BY service ORDER BY salaire DESC)' },
  { kw:'LAST_VALUE',   cat:'Fenêtrage',   simple:'Retourne la dernière valeur de la fenêtre.',                    ex:'LAST_VALUE(salaire) OVER (PARTITION BY service ORDER BY salaire DESC)' },
  { kw:'PERCENT_RANK', cat:'Fenêtrage',   simple:'Rang relatif d\'une ligne dans la fenêtre, entre 0 et 1.',      ex:'PERCENT_RANK() OVER (ORDER BY age)' },
];
