// ═══════════════════════════════════════
// TIPS — Explications en langage simple pour chaque leçon
// Clé = ID de leçon (d1, i3, a2…). Le champ 'tip' est optionnel dans les leçons.
// Affichés dans un bloc "En termes simples" ouvert par défaut au niveau Débutant.
// ═══════════════════════════════════════
const TIPS = {

  // ── Débutant ──────────────────────────────────────────────────────────────
  d1: {
    simple: '<b>SELECT</b> est la commande pour lire des données dans une base. C\'est toujours le point de départ d\'une question posée à la base : "Montre-moi ces informations."<br><br><b>FROM</b> précise dans quelle table chercher. Une base de données est un ensemble de tables — chaque table ressemble à un tableau Excel avec des lignes et des colonnes.',
    analogy: '📂 Imaginez un classeur avec plusieurs onglets : <i>patients</i>, <i>consultations</i>, <i>médecins</i>. <code>SELECT * FROM patients</code> revient à ouvrir l\'onglet patients et afficher toutes ses lignes.'
  },
  d2: {
    simple: 'Au lieu d\'afficher toutes les colonnes avec <b>*</b>, on liste uniquement celles qui nous intéressent, séparées par des virgules.<br><br><b>AS</b> permet de renommer une colonne dans le résultat (alias) sans modifier la vraie base.',
    analogy: '📋 Une fiche patient contient 10 champs. Dans votre rapport, vous n\'avez besoin que du nom et du diagnostic. <code>SELECT nom, diagnostic</code> fait exactement ça : il ne recopie que les colonnes utiles.'
  },
  d3: {
    simple: '<b>WHERE</b> filtre les lignes — il ne garde que celles qui correspondent à une condition.<br><br>Les opérateurs de comparaison : <b>=</b> (égal), <b>!=</b> (différent), <b>&gt;</b> <b>&lt;</b> (supérieur/inférieur), <b>LIKE</b> (ressemble à, avec <b>%</b> comme joker).<br><b>AND</b> et <b>OR</b> combinent plusieurs conditions.',
    analogy: '🔍 Chercher tous les patients de plus de 60 ans dans une liste de 1 000 fiches, c\'est long à la main. <code>WHERE age &gt; 60</code> fait ce tri instantanément, comme un filtre dans Excel.'
  },
  d4: {
    simple: '<b>ORDER BY</b> trie les résultats selon une ou plusieurs colonnes.<br><b>ASC</b> = ordre croissant (A→Z, 1→100) — c\'est le défaut.<br><b>DESC</b> = ordre décroissant (Z→A, 100→1).<br><br>On peut trier sur plusieurs colonnes : d\'abord par service, puis par nom dans chaque service.',
    analogy: '🗂️ Comme classer des fiches papier par ordre alphabétique de nom, ou par date d\'admission du plus récent au plus ancien.'
  },
  d5: {
    simple: '<b>LIMIT</b> restreint le nombre de lignes retournées. Indispensable quand la table contient des milliers de lignes et qu\'on veut juste un aperçu.<br><br><b>OFFSET</b> saute les N premières lignes — utile pour la pagination (page 1, page 2…).',
    analogy: '📄 Dans un annuaire de 10 000 médecins, vous ne voulez voir que les 10 premiers. <code>LIMIT 10</code> vous évite d\'attendre le téléchargement de toute la liste.'
  },
  d6: {
    simple: 'SQL intègre des fonctions qui transforment les données à la volée :<br>• <b>UPPER/LOWER</b> : change la casse du texte<br>• <b>LENGTH</b> : compte les caractères<br>• <b>CONCAT</b> ou <b>||</b> : colle deux textes ensemble<br>• <b>ROUND</b> : arrondit un nombre<br>• <b>YEAR/MONTH</b> : extrait une partie d\'une date',
    analogy: '🧮 Comme les formules dans Excel : <code>=MAJUSCULE(A1)</code> devient <code>UPPER(nom)</code> en SQL.'
  },

  // ── Intermédiaire ─────────────────────────────────────────────────────────
  i1: {
    simple: '<b>JOIN</b> (ou INNER JOIN) relie deux tables via une colonne commune — la clé étrangère (FK). Le résultat ne contient que les lignes qui ont une correspondance dans les deux tables.',
    analogy: '🔗 Les patients ont un <code>medecin_id</code>. Les médecins ont un <code>id_medecin</code>. JOIN les relie comme assembler deux pièces de puzzle : on obtient le nom du patient avec le nom de son médecin sur la même ligne.'
  },
  i2: {
    simple: '<b>LEFT JOIN</b> retourne TOUTES les lignes de la table de gauche, même si elles n\'ont pas de correspondance à droite. Les colonnes droites seront NULL pour ces lignes.<br><br>Utile pour trouver des patients sans consultation, des médecins sans prescription, etc.',
    analogy: '📋 Avec INNER JOIN, un patient sans consultation disparaît du résultat. Avec LEFT JOIN, il reste visible — avec des cases vides pour la consultation. Idéal pour détecter les "oubliés".'
  },
  i3: {
    simple: '<b>GROUP BY</b> regroupe les lignes selon une valeur commune, puis permet d\'appliquer des calculs par groupe.<br><br><b>COUNT(*)</b> compte les lignes du groupe. D\'autres fonctions : <b>SUM</b> (total), <b>AVG</b> (moyenne), <b>MAX/MIN</b> (extrêmes).',
    analogy: '📊 Compter combien de patients sont dans chaque service. Sans GROUP BY vous obtenez une liste de 10 patients. Avec <code>GROUP BY service</code> vous obtenez 5 lignes : une par service avec son effectif.'
  },
  i4: {
    simple: 'Les fonctions d\'agrégation calculent une valeur à partir de plusieurs lignes :<br>• <b>SUM</b> : additionne (total des durées de consultation)<br>• <b>AVG</b> : moyenne (âge moyen par service)<br>• <b>MAX/MIN</b> : valeur la plus haute/basse<br>• <b>GROUP_CONCAT</b> : colle tous les textes du groupe en une chaîne',
    analogy: '🧮 C\'est l\'équivalent des formules SOMME(), MOYENNE(), MAX() d\'Excel, mais appliquées sur des groupes de lignes dynamiques.'
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
    simple: 'Une <b>sous-requête</b> est un SELECT imbriqué dans un autre. Celle placée dans <b>WHERE</b> permet de filtrer selon un résultat calculé dynamiquement.<br><br>Ex : WHERE id_patient IN (SELECT id_patient FROM consultations WHERE ...)',
    analogy: '🪆 Comme une question dans une question : "Quels patients ont été vus par un médecin qui gagne plus de 9 000 € ?" Il faut d\'abord trouver ces médecins, puis chercher leurs patients.'
  },

  // ── Avancé ────────────────────────────────────────────────────────────────
  a1: {
    simple: '<b>WITH ... AS</b> crée une CTE (Common Table Expression) : une table temporaire nommée qu\'on réutilise dans la requête principale. Le résultat n\'est pas stocké en base — il n\'existe que le temps de la requête.',
    analogy: '📝 Comme écrire un brouillon nommé en haut de la page, puis s\'y référer plus bas. Ça évite de répéter la même sous-requête 3 fois.'
  },
  a2: {
    simple: 'Plusieurs CTEs peuvent se chaîner : la deuxième peut utiliser la première, la troisième peut utiliser les deux précédentes. Cela permet de décomposer une logique complexe en étapes lisibles.',
    analogy: '🏗️ Construire un résultat complexe étape par étape, comme des briques posées les unes sur les autres, plutôt qu\'une seule formule monstrueuse.'
  },
  a3: {
    simple: '<b>CASE WHEN</b> est un "si/alors/sinon" dans SQL. Il crée une nouvelle colonne calculée dont la valeur dépend d\'une condition.<br><br>Structure : CASE WHEN condition THEN valeur ELSE autre_valeur END',
    analogy: '💊 "Si l\'âge est supérieur à 65, afficher \'Gériatrie\', sinon afficher \'Standard\'." C\'est exactement la fonction SI() d\'Excel, en plus flexible.'
  },
  a4: {
    simple: 'Une <b>sous-requête corrélée</b> fait référence à la requête externe — elle se recalcule pour chaque ligne de la table principale. Plus puissant, mais plus lent sur de grandes tables.',
    analogy: '🔄 Pour chaque patient, calculer combien de consultations il a eues. La sous-requête doit connaître l\'ID du patient courant pour filtrer ses consultations.'
  },
  a5: {
    simple: 'Un <b>self join</b> relie une table à elle-même. Utile quand les lignes d\'une même table ont une relation hiérarchique (manager/employé, médecin référent/médecin traitant).',
    analogy: '👥 Joindre la table médecins avec elle-même pour trouver les médecins qui exercent dans le même service qu\'un autre médecin donné.'
  },
  a6: {
    simple: 'SQL propose des fonctions pour manipuler les chaînes de caractères :<br>• <b>UPPER/LOWER</b> : casse<br>• <b>TRIM</b> : supprime les espaces en début/fin<br>• <b>REPLACE</b> : remplace un texte par un autre<br>• <b>LEFT/RIGHT</b> : extrait N caractères depuis la gauche ou la droite<br>• <b>LENGTH</b> : longueur du texte',
    analogy: '✂️ Comme les fonctions texte d\'Excel (GAUCHE, DROITE, SUPPRIMER, SUBSTITUE), appliquées sur des colonnes entières en une seule requête.'
  },
  a7: {
    simple: 'SQL permet d\'extraire des parties d\'une date ou de calculer des intervalles :<br>• <b>YEAR/MONTH</b> : extrait l\'année ou le mois<br>• <b>DATE_PART / EXTRACT</b> : extraction flexible<br>• Ces fonctions permettent de grouper des données par mois, année, trimestre…',
    analogy: '📅 Grouper les consultations par mois pour voir les pics d\'activité saisonniers, sans avoir à trier manuellement chaque date.'
  },

  // ── Expert ────────────────────────────────────────────────────────────────
  e1: {
    simple: 'Les <b>fonctions de fenêtrage</b> (OVER) calculent des valeurs sur un groupe de lignes sans les regrouper — chaque ligne garde son identité dans le résultat.<br><br><b>PARTITION BY</b> définit le groupe. <b>ORDER BY</b> dans OVER définit l\'ordre dans ce groupe.',
    analogy: '📊 Calculer le rang de chaque patient dans son service selon son âge, sans fusionner les lignes de patients. Chaque patient reste visible avec son rang calculé à côté.'
  },
  e2: {
    simple: '<b>RANK()</b> attribue un rang (avec égalités et sauts). <b>DENSE_RANK()</b> attribue un rang sans sauts. <b>ROW_NUMBER()</b> numérote chaque ligne uniquement.<br><br>Ex : 3 ex-aequo en 1ère position → RANK donne 1,1,1,4 — DENSE_RANK donne 1,1,1,2.',
    analogy: '🏆 Au classement sportif : 2 patients ex-aequo 1ers. RANK saute le rang 2 (1,1,3). DENSE_RANK ne saute pas (1,1,2). ROW_NUMBER les distingue arbitrairement (1,2,3).'
  },
  e3: {
    simple: '<b>LAG(col, n)</b> accède à la valeur de la ligne N rangs avant dans la fenêtre. <b>LEAD(col, n)</b> accède à la ligne N rangs après. Permet des calculs de variation entre lignes consécutives.',
    analogy: '⏪⏩ Sur une série de consultations triées par date : LAG(date_consultation, 1) donne la date de la consultation précédente. Permet de calculer le délai entre deux visites.'
  },
  e4: {
    simple: 'Une sous-requête dans <b>FROM</b> crée une table temporaire (table dérivée) qu\'on traite comme une vraie table. On peut y joindre d\'autres tables et y appliquer WHERE/GROUP BY.',
    analogy: '🧩 Calculer d\'abord les totaux par médecin, puis filtrer ceux dont le total dépasse un seuil. La première étape devient une "mini-table" que la requête extérieure exploite.'
  },
  e5: {
    simple: '<b>INSERT INTO</b> ajoute une nouvelle ligne dans une table. On précise les colonnes concernées et les valeurs à insérer dans le même ordre.<br><br>Attention : les contraintes (types, clés étrangères) sont vérifiées à l\'insertion.',
    analogy: '📝 Admettre un nouveau patient en base : on remplit son dossier (les colonnes) avec ses informations (les valeurs). La BD vérifie que tout est cohérent avant de l\'accepter.'
  },
  e6: {
    simple: '<b>UNION</b> combine les résultats de deux SELECT en empilant les lignes. Les colonnes doivent correspondre en nombre et en type.<br><b>UNION ALL</b> garde les doublons. <b>UNION</b> les supprime.',
    analogy: '📚 Fusionner deux listes de patients (deux hôpitaux différents) en une seule. UNION supprime les doublons si un patient apparaît dans les deux listes. UNION ALL garde tout.'
  },
  e7: {
    simple: '<b>FULL JOIN</b> (FULL OUTER JOIN) retourne toutes les lignes des deux tables, qu\'elles aient une correspondance ou non. Les colonnes sans correspondance sont NULL des deux côtés.',
    analogy: '🔀 LEFT JOIN garde tous les patients. RIGHT JOIN garde tous les médecins. FULL JOIN garde tout le monde — même un médecin sans patient et un patient sans médecin assigné.'
  },
  e8: {
    simple: 'Fonctions avancées de chaînes : <b>SUBSTRING/SUBSTR</b> extrait une portion de texte à partir d\'une position. <b>INSTR</b> trouve la position d\'un caractère. Utiles pour nettoyer ou transformer des données textuelles.',
    analogy: '✂️ Extraire le code postal des 5 derniers caractères d\'une adresse, ou trouver la position du tiret dans un code de chambre "A-101".'
  },
  e9: {
    simple: 'Des fonctions plus avancées permettent de calculer des valeurs à partir de chaînes : <b>CAST</b> convertit un type (texte → nombre), <b>COALESCE</b> remplace NULL par une valeur par défaut.',
    analogy: '🔄 COALESCE(date_sortie, \'En cours\') : si la date de sortie est NULL (patient encore hospitalisé), affiche "En cours" à la place de NULL.'
  },
  e10: {
    simple: '<b>INSERT INTO</b> ajoute des lignes. <b>UPDATE ... SET</b> modifie des lignes existantes. Toujours utiliser <b>WHERE</b> avec UPDATE pour ne modifier que les lignes voulues — sans WHERE, TOUTES les lignes sont modifiées.',
    analogy: '⚠️ UPDATE sans WHERE = modifier tous les dossiers d\'un coup. C\'est l\'équivalent d\'effacer et réécrire toutes les fiches à la main. Toujours cibler avec WHERE !'
  },
  e11: {
    simple: '<b>DELETE FROM</b> supprime des lignes. Comme UPDATE, <b>WHERE est indispensable</b> pour cibler les bonnes lignes. Sans WHERE, toute la table est vidée.<br><br>La table reste — seules ses lignes sont supprimées.',
    analogy: '🗑️ Supprimer le dossier d\'un patient qui a quitté l\'établissement. DELETE supprime sa ligne. La table patients reste intacte pour tous les autres.'
  },
  e12: {
    simple: 'Combinaison de DML (INSERT, UPDATE, DELETE) dans des scénarios réalistes : mettre à jour un salaire puis vérifier le résultat, ajouter une prescription puis la lire, etc.',
    analogy: '🔄 En pratique, les bases de données sont modifiées en permanence. Maîtriser INSERT + UPDATE + DELETE permet de maintenir les données à jour et cohérentes.'
  },
  e13: {
    simple: '<b>CREATE TABLE</b> crée une nouvelle table avec ses colonnes et leurs types. <b>ALTER TABLE ADD</b> ajoute une colonne à une table existante sans la recréer.',
    analogy: '📋 Créer un nouveau formulaire de saisie (CREATE TABLE), ou ajouter un nouveau champ à un formulaire existant (ALTER TABLE ADD).'
  },
  e14: {
    simple: 'Les types de données définissent ce qu\'une colonne peut stocker :<br>• <b>INTEGER</b> : nombre entier<br>• <b>REAL / DECIMAL</b> : nombre décimal<br>• <b>TEXT / VARCHAR</b> : texte<br>• <b>DATE / DATETIME</b> : date et heure<br><br>Choisir le bon type garantit l\'intégrité des données.',
    analogy: '📏 Comme choisir le bon type de case sur un formulaire : case à cocher (booléen), champ numérique (INTEGER), champ texte libre (TEXT), calendrier (DATE).'
  },
  e15: {
    simple: '<b>NTILE(n)</b> divise les lignes en n groupes de taille égale (quartiles, déciles…). <b>PERCENT_RANK()</b> calcule le rang en pourcentage (0 = plus bas, 1 = plus haut).',
    analogy: '📊 Diviser les patients en 4 groupes selon leur âge (NTILE(4)) : les 25% les plus jeunes, les 25-50%, les 50-75%, et les 25% les plus âgés. Utile en épidémiologie.'
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
    simple: '<b>GROUP_CONCAT</b> (ou STRING_AGG) concatène les valeurs texte d\'un groupe en une seule chaîne, séparées par un délimiteur choisi.',
    analogy: '🔤 Lister tous les diagnostics d\'un patient en une seule cellule : "Hypertension, Arythmie, Contrôle tensionnel" plutôt que 3 lignes séparées.'
  },
  e19: {
    simple: 'Les <b>CTEs récursives</b> (WITH RECURSIVE) permettent à une CTE de s\'appeler elle-même pour traverser des hiérarchies (organigrammes, catégories imbriquées, graphes).',
    analogy: '🌳 Trouver tous les subordonnés d\'un directeur médical, puis leurs subordonnés, etc. La récursivité descend l\'arbre hiérarchique jusqu\'aux feuilles.'
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

// ═══════════════════════════════════════
// LEXIQUE SQL — Dictionnaire des mots-clés
// Utilisé par le panneau "📖 Lexique" accessible depuis la topbar.
// ═══════════════════════════════════════
const LEXIQUE = [
  // ── Lecture de données ────────────────
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
  // ── Tri et pagination ─────────────────
  { kw:'ORDER BY',    cat:'Tri',         simple:'Trie les résultats. ASC = croissant (défaut), DESC = décroissant.', ex:'ORDER BY age DESC' },
  { kw:'LIMIT',       cat:'Pagination',  simple:'Limite le nombre de lignes retournées.',                        ex:'SELECT * FROM patients LIMIT 5;' },
  { kw:'OFFSET',      cat:'Pagination',  simple:'Saute les N premières lignes (pour la pagination).',            ex:'LIMIT 10 OFFSET 20' },
  // ── Jointures ─────────────────────────
  { kw:'JOIN',        cat:'Jointures',   simple:'Relie deux tables via une colonne commune. Ne garde que les lignes avec correspondance.', ex:'FROM patients JOIN medecins ON patients.medecin_id = medecins.id_medecin' },
  { kw:'LEFT JOIN',   cat:'Jointures',   simple:'Garde toutes les lignes de gauche, même sans correspondance à droite (colonnes droites = NULL).', ex:'FROM patients LEFT JOIN consultations ON ...' },
  { kw:'RIGHT JOIN',  cat:'Jointures',   simple:'Garde toutes les lignes de droite, même sans correspondance à gauche.', ex:'FROM patients RIGHT JOIN medecins ON ...' },
  { kw:'FULL JOIN',   cat:'Jointures',   simple:'Garde toutes les lignes des deux côtés, avec NULL là où il n\'y a pas de correspondance.', ex:'FROM patients FULL JOIN medecins ON ...' },
  { kw:'ON',          cat:'Jointures',   simple:'Précise la condition de jointure (quelle colonne relie les deux tables).', ex:'ON patients.medecin_id = medecins.id_medecin' },
  // ── Agrégation ────────────────────────
  { kw:'GROUP BY',    cat:'Agrégation',  simple:'Regroupe les lignes ayant la même valeur, pour calculer des totaux par groupe.', ex:'GROUP BY service' },
  { kw:'HAVING',      cat:'Agrégation',  simple:'Filtre les groupes après GROUP BY (comme WHERE, mais pour les agrégats).', ex:'HAVING COUNT(*) > 3' },
  { kw:'COUNT',       cat:'Agrégation',  simple:'Compte le nombre de lignes. COUNT(*) compte tout, COUNT(col) ignore les NULL.', ex:'SELECT COUNT(*) FROM patients;' },
  { kw:'SUM',         cat:'Agrégation',  simple:'Additionne les valeurs d\'une colonne numérique.',              ex:'SELECT SUM(duree_min) FROM consultations;' },
  { kw:'AVG',         cat:'Agrégation',  simple:'Calcule la moyenne d\'une colonne numérique.',                  ex:'SELECT AVG(age) FROM patients;' },
  { kw:'MAX',         cat:'Agrégation',  simple:'Retourne la valeur la plus haute.',                             ex:'SELECT MAX(salaire) FROM medecins;' },
  { kw:'MIN',         cat:'Agrégation',  simple:'Retourne la valeur la plus basse.',                             ex:'SELECT MIN(age) FROM patients;' },
  // ── CTE et sous-requêtes ──────────────
  { kw:'WITH ... AS', cat:'CTE',         simple:'Crée une table temporaire nommée réutilisable dans la requête. Rend le code plus lisible.', ex:'WITH adultes AS (SELECT * FROM patients WHERE age > 18)' },
  { kw:'Sous-requête',cat:'CTE',         simple:'Un SELECT imbriqué dans un autre SELECT, WHERE, ou FROM.',      ex:'WHERE id IN (SELECT id FROM ...)' },
  // ── Fonctions de fenêtrage ────────────
  { kw:'OVER',        cat:'Fenêtrage',   simple:'Définit une fenêtre de calcul pour une fonction de fenêtrage. La ligne n\'est pas regroupée.', ex:'RANK() OVER (PARTITION BY service ORDER BY age)' },
  { kw:'PARTITION BY',cat:'Fenêtrage',   simple:'Divise les données en sous-groupes pour le calcul de fenêtrage (comme GROUP BY mais sans fusionner les lignes).', ex:'OVER (PARTITION BY service)' },
  { kw:'RANK',        cat:'Fenêtrage',   simple:'Attribue un rang avec sauts en cas d\'égalité (1,1,3).',        ex:'RANK() OVER (ORDER BY age DESC)' },
  { kw:'DENSE_RANK',  cat:'Fenêtrage',   simple:'Attribue un rang sans sauts en cas d\'égalité (1,1,2).',       ex:'DENSE_RANK() OVER (ORDER BY age DESC)' },
  { kw:'ROW_NUMBER',  cat:'Fenêtrage',   simple:'Numérotation unique de chaque ligne, sans égalité.',            ex:'ROW_NUMBER() OVER (ORDER BY date_admission)' },
  { kw:'LAG',         cat:'Fenêtrage',   simple:'Accède à la valeur de la ligne précédente dans la fenêtre.',    ex:'LAG(date_consultation, 1) OVER (ORDER BY date_consultation)' },
  { kw:'LEAD',        cat:'Fenêtrage',   simple:'Accède à la valeur de la ligne suivante dans la fenêtre.',      ex:'LEAD(date_consultation, 1) OVER (ORDER BY date_consultation)' },
  // ── DML ───────────────────────────────
  { kw:'INSERT INTO', cat:'DML',         simple:'Ajoute une nouvelle ligne dans une table.',                     ex:'INSERT INTO patients (nom, age) VALUES (\'Dupont\', 45);' },
  { kw:'UPDATE',      cat:'DML',         simple:'Modifie des lignes existantes. Toujours utiliser WHERE !',       ex:'UPDATE medecins SET salaire = 9000 WHERE id_medecin = 3;' },
  { kw:'DELETE FROM', cat:'DML',         simple:'Supprime des lignes. Toujours utiliser WHERE !',                 ex:'DELETE FROM patients WHERE statut = \'Sorti\';' },
  // ── DDL ───────────────────────────────
  { kw:'CREATE TABLE',cat:'DDL',         simple:'Crée une nouvelle table avec ses colonnes et leurs types.',     ex:'CREATE TABLE infirmiers (id INTEGER, nom TEXT);' },
  { kw:'ALTER TABLE', cat:'DDL',         simple:'Modifie une table existante (ajouter une colonne, etc.).',      ex:'ALTER TABLE patients ADD COLUMN telephone TEXT;' },
  { kw:'DROP TABLE',  cat:'DDL',         simple:'Supprime définitivement une table et toutes ses données.',       ex:'DROP TABLE table_temporaire;' },
  // ── Ensembles ─────────────────────────
  { kw:'UNION',       cat:'Ensembles',   simple:'Combine deux SELECT en empilant leurs lignes. Supprime les doublons.', ex:'SELECT nom FROM patients UNION SELECT nom FROM medecins;' },
  { kw:'UNION ALL',   cat:'Ensembles',   simple:'Comme UNION mais conserve les doublons. Plus rapide.',          ex:'SELECT ... UNION ALL SELECT ...' },
  { kw:'INTERSECT',   cat:'Ensembles',   simple:'Retourne les lignes présentes dans les deux SELECT.',           ex:'SELECT ... INTERSECT SELECT ...' },
  { kw:'EXCEPT',      cat:'Ensembles',   simple:'Retourne les lignes du premier SELECT absentes du second.',     ex:'SELECT ... EXCEPT SELECT ...' },
  // ── Fonctions utiles ──────────────────
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
];
