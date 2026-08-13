// État global de l'application.
// - lvl    : niveau actif ('d' débutant, 'i' intermédiaire, 'a' avancé, 'e' expert)
// - idx    : index de la leçon en cours dans CUR[lvl]
// - exIdx  : index de l'exercice en cours dans lesson().exercises
// - done   : Set des IDs de leçons réussies — une leçon est done quand ses 3 exercices sont faits
// - exDone : Set des clés d'exercices complétés (ex: 'd1_0', 'd1_1', 'd1_2')
// - hintC  : compteur d'indices affichés par exercice, clé = cacheKey()
// - queryCache : mémorise la requête tapée pour chaque exercice, clé = cacheKey()
let lvl='d',idx=0,exIdx=0,done=new Set(),exDone=new Set(),hintC={},queryCache={},screen='accueil';
let gamState={xp:0,streak:0,lastVisit:null,awarded:[]};
let visitCount=null,visitFetchStarted=false;
const lmap={d:'Débutant',i:'Intermédiaire',a:'Avancé',e:'Expert'};
const LEVEL_ORDER=['d','i','a','e'];

// Retourne le niveau suivant dans LEVEL_ORDER s'il existe et contient des leçons dans le domaine actif, sinon null.
function nextLevel(){
  const l=LEVEL_ORDER[LEVEL_ORDER.indexOf(lvl)+1];
  return (l&&ACTIVE_DOMAIN.cur[l]&&ACTIVE_DOMAIN.cur[l].length)?l:null;
}
const XP_PAR_EXERCICE=40;
function total(){return Object.values(ACTIVE_DOMAIN.cur).reduce((a,b)=>a+b.length,0);}


// Retourne une clé unique identifiant l'exercice courant.
// Utilisée pour indexer queryCache et hintC afin que chaque exercice
// conserve sa propre requête et son propre compteur d'indices.
function cacheKey(){return lesson().id+'_'+exIdx;}

// Gamification — XP & série (streak), globaux (indépendants du domaine actif), affichés dans la topbar.

// Charge xp/streak/awarded depuis localStorage et met à jour la série
// en comparant la date de dernière visite à aujourd'hui (+1 si hier, reset sinon).
function loadGam(){
  try{
    const s=localStorage.getItem('sqlsante_gam');
    const g=s?JSON.parse(s):{xp:0,streak:0,lastVisit:null,awarded:[]};
    const today=new Date().toISOString().slice(0,10);
    if(g.lastVisit!==today){
      const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
      g.streak=g.lastVisit===yesterday?(g.streak||0)+1:1;
      g.lastVisit=today;
    }
    gamState=g;
  }catch(e){gamState={xp:0,streak:1,lastVisit:null,awarded:[]};}
  saveGam();
}

function saveGam(){try{localStorage.setItem('sqlsante_gam',JSON.stringify(gamState));}catch(e){}}

// Reflète xp/streak dans les badges de la topbar.
function renderGam(){
  document.getElementById('xp-n').textContent=gamState.xp.toLocaleString('fr-FR');
  document.getElementById('streak-n').textContent=gamState.streak;
}

// Attribue XP_PAR_EXERCICE points d'XP la première fois qu'une clé d'exercice est validée.
// key est préfixée par le domaine pour ne jamais récompenser deux fois le même exercice
// même si des IDs de leçon se répètent entre domaines.
function awardXP(key){
  if(gamState.awarded.includes(key)) return;
  gamState.awarded.push(key);
  gamState.xp+=XP_PAR_EXERCICE;
  saveGam();
  renderGam();
}

// Retourne la liste des exercices de la leçon courante (lesson().exercises).
// Point d'accès central : si la structure de curriculum change, un seul endroit à mettre à jour.
function exercises(){return lesson().exercises;}

// Retourne l'objet exercice actif {task, hints} dans la leçon courante.
// Utilisé par showHint(), showSol() et renderLesson() pour afficher la consigne.
function exercise(){return exercises()[exIdx];}

// Sauvegarde le texte tapé dans l'éditeur SQL dans queryCache avant tout changement de leçon.
// Appelée systématiquement par gol(), nav(), setLevel() et goEx() pour ne pas perdre le travail en cours.
function saveCurrentQuery(){const ed=document.getElementById('ed');if(ed&&lesson())queryCache[cacheKey()]=ed.value;}

// Retourne la clé localStorage propre au domaine actif.
// Chaque domaine conserve sa progression indépendamment.
function progressKey(){return 'sqlsante_v2_'+ACTIVE_DOMAIN.meta.id;}

// Persiste lvl, idx, done et exDone dans localStorage sous une clé par domaine.
// Appelée après chaque navigation et après chaque exercice réussi.
function saveProgress(){try{localStorage.setItem(progressKey(),JSON.stringify({lvl,idx,done:[...done],exDone:[...exDone]}));}catch(e){}}

// Restaure la progression du domaine actif depuis localStorage.
// Migration automatique depuis 'sqlsante_v1' (ancien format sans domaine) si nécessaire.
function loadProgress(){
  try{
    let s=localStorage.getItem(progressKey());
    if(!s&&ACTIVE_DOMAIN.meta.id==='sante-hop') s=localStorage.getItem('sqlsante_v2');
    if(s){
      const p=JSON.parse(s);
      if(p.done) done=new Set(p.done);
      if(p.exDone) exDone=new Set(p.exDone);
      const cur=ACTIVE_DOMAIN.cur;
      if(p.lvl&&cur[p.lvl]){lvl=p.lvl;document.querySelectorAll('.sb-lvl').forEach(b=>b.classList.toggle('active',b.dataset.l===lvl));}
      if(typeof p.idx==='number'&&cur[lvl]&&p.idx<cur[lvl].length) idx=p.idx;
      return;
    }
    // Migration depuis l'ancien format v1 (sante-hop uniquement)
    s=localStorage.getItem('sqlsante_v1');
    if(!s) return;
    const p=JSON.parse(s);
    if(p.done){
      done=new Set(p.done);
      const cur=ACTIVE_DOMAIN.cur;
      done.forEach(id=>{const l=Object.values(cur).flat().find(x=>x.id===id);if(l)l.exercises.forEach((_,i)=>exDone.add(id+'_'+i));});
    }
    if(p.lvl&&ACTIVE_DOMAIN.cur[p.lvl]){lvl=p.lvl;document.querySelectorAll('.sb-lvl').forEach(b=>b.classList.toggle('active',b.dataset.l===lvl));}
    if(typeof p.idx==='number'&&ACTIVE_DOMAIN.cur[lvl]&&p.idx<ACTIVE_DOMAIN.cur[lvl].length) idx=p.idx;
  }catch(e){}
}

// Retourne le tableau de leçons du niveau actif depuis le domaine courant.
function lessons(){return ACTIVE_DOMAIN.cur[lvl];}

// Retourne l'objet leçon courant : {id, title, desc, concept, exercises, hot?}.
function lesson(){return lessons()[idx];}

// Redessine la barre latérale gauche : sélecteur de niveau (déb/int/avc/exp) en haut,
// puis toutes les leçons du niveau actif. Marque la leçon active (▸) et les terminées (✓).
// Appelée par renderLesson() à chaque changement de leçon ou de niveau.
function renderSB(){
  const levels=[['d','déb','Débutant — SELECT, WHERE, ORDER BY, LIMIT : les bases pour lire des données'],['i','int','Intermédiaire — JOIN, GROUP BY, sous-requêtes : combiner et agréger les données'],['a','avc','Avancé — CTE, fonctions de fenêtre, CASE, chaînes et dates'],['e','exp','Expert — DML, DDL, transactions, optimisation, opérations ensemblistes']];
  const levelsHtml=`<div class="sb-levels">${levels.map(([k,short,title])=>`<div class="sb-lvl${k===lvl?' active':''}" data-l="${k}" onclick="setLevel('${k}')" title="Niveau ${title}">${short}</div>`).join('')}</div>`;
  document.getElementById('sb').innerHTML=
    levelsHtml+
    '<div class="sb-lbl">'+lmap[lvl]+'</div>'+
    lessons().map((l,i)=>{
      const isDone=done.has(l.id);const isActive=i===idx;
      return `<div class="sb-item ${isActive?'active':''} ${isDone?'done':''}" onclick="gol(${i})">
        <span class="sbi">${isDone?'✓':isActive?'▸':'○'}</span>
        <span style="flex:1;line-height:1.3">${l.title}${l.hot?'<span class="tag tag-hot">★ Entretien</span>':''}</span>
      </div>`;
    }).join('');
}

// Construit et injecte tout le contenu de la zone principale :
// - titre et description de la leçon dans le header
// - section "Syntaxe & Concept" (repliée par défaut)
// - navigation entre exercices (boutons 1/2/3)
// - zone d'édition SQL + boutons Exécuter, Indice, Solution, Réinit., Structure BD
// - restaure la requête mémorisée pour cet exercice via queryCache
// - met à jour la barre de progression globale, le compteur et les boutons Précédent/Suivant
// Appelée à chaque changement de leçon, niveau ou exercice.
function renderLesson(){
  const l=lesson();
  const ex=exercise();
  document.getElementById('lc').textContent=`leçon ${idx+1} · exercice ${exIdx+1} / ${exercises().length} · ${ACTIVE_DOMAIN.meta.id}.db`;
  document.getElementById('lt').innerHTML=l.title+(l.hot?'<span class="tag tag-hot">★ Demandé en entretien</span>':'');
  document.getElementById('ld').textContent=l.desc;
  const exNav=exercises().map((_,i)=>{const ok=exDone.has(lesson().id+'_'+i);return `<button class="ex-btn${i===exIdx?' active':''}${ok?' done':''}" onclick="goEx(${i})" title="Exercice ${i+1}${ok?' — complété ✓':' — à compléter'}">${ok?'✓':i+1}</button>`;}).join('');
  const tip=(typeof TIPS!=='undefined')&&TIPS[l.id];
  const tipOpen=false;
  const tipHtml=tip?`
    <div class="tip-block">
      <div class="tip-head" onclick="toggleTip(this)" title="Explication en langage simple de la notion SQL de cette leçon">
        <span class="dot" style="background:#00C896"></span>
        &nbsp; 💡 En termes simples
        <span class="chead-hint">cliquez pour ${tipOpen?'fermer':'ouvrir'}</span>
        <span class="chead-arrow" style="${tipOpen?'transform:rotate(90deg)':''}">▶</span>
      </div>
      <div class="tip-body${tipOpen?' open':''}">
        <div class="tip-simple">${tip.simple}</div>
        ${tip.analogy?`<div class="tip-analogy">${tip.analogy}</div>`:''}
      </div>
    </div>`:'';
  document.getElementById('lb').innerHTML=`
    ${tipHtml}
    <div class="cbox">
      <div class="chead" onclick="toggleConcept(this)" title="Cliquez pour afficher ou masquer la syntaxe et les exemples de la notion">
        <span class="dot" style="background:#FF6B5C"></span><span class="dot" style="background:#FFDD15"></span><span class="dot" style="background:#00C896"></span>
        &nbsp; Syntaxe &amp; Concept
        <span class="chead-hint">cliquez pour ouvrir</span>
        <span class="chead-arrow">▶</span>
      </div>
      <div class="cbody"><pre>${l.concept}</pre></div>
    </div>
    <div class="split">
      <div class="split-left tbox">
        <div class="ex-nav"><span class="ex-nav-lbl" title="3 exercices par leçon — même compétence SQL, situations différentes">Exercice</span>${exNav}</div>
        <div class="thead2"><span class="tbadge">À faire</span><span class="ttxt">${ex.task}</span></div>
        <textarea id="ed" spellcheck="false" placeholder="-- Écrivez votre requête SQL ici...&#10;-- Ctrl+Entrée pour exécuter"></textarea>
        <div class="eline">
          <button class="brun" id="brun" onclick="execute()" title="Exécuter votre requête SQL et afficher le résultat (raccourci : Ctrl+Entrée). Marque la leçon comme terminée si la requête réussit.">▶ Exécuter</button>
          <button class="bghost bamber" onclick="showHint()" title="Afficher un indice progressif — chaque clic révèle un peu plus sans donner la réponse complète">💡 Indice</button>
          <button class="bghost bred" onclick="showSol()" title="Afficher la solution complète dans l'éditeur — vous pouvez l'exécuter pour voir le résultat attendu">👁 Solution</button>
          <span class="sp"></span>
          <button class="bghost" onclick="resetDB()" title="Réinitialiser la base de données à son état initial — utile après un INSERT, UPDATE ou DELETE pour repartir de zéro">↺ Réinit.</button>
          <button class="bghost bblue" onclick="toggleSP()" title="Afficher ou masquer la structure de la base (tables, colonnes, types, clés primaires et étrangères)">📋 Structure</button>
        </div>
        <div id="ha"></div>
      </div>
      <div class="split-right">
        <div class="res-head" id="res-head">résultat</div>
        <div class="rarea" id="ra"><span class="rph">→ Cliquez "Exécuter" pour voir le résultat (Ctrl+Entrée).</span></div>
        <div class="star-burst" id="star-burst"></div>
      </div>
    </div>`;
  const edEl=document.getElementById('ed');
  if(edEl&&queryCache[cacheKey()]) edEl.value=queryCache[cacheKey()];
  document.getElementById('pf').style.width=Math.max(4,Math.round((done.size/total())*100))+'%';
  document.getElementById('pi').textContent=(idx+1)+' / '+lessons().length+'  |  '+done.size+'/'+total()+' ✓';
  document.getElementById('bprev').disabled=idx===0;
  const bnext=document.getElementById('bnext');
  if(idx===lessons().length-1){
    const nl=nextLevel();
    if(nl){bnext.textContent='Niveau '+lmap[nl]+' →';bnext.title='Passer au niveau '+lmap[nl];bnext.disabled=false;}
    else{bnext.textContent='Terminé ✓';bnext.title='Vous avez terminé tous les niveaux de ce domaine';bnext.disabled=true;}
  }else{
    bnext.textContent='Suivant →';bnext.title='Passer à la leçon suivante';bnext.disabled=false;
  }
  renderSB();
  document.getElementById('sp').classList.remove('open');
}

// Injecte la structure de la base de données dans le panneau latéral droit (Structure BD).
// Affiche pour chaque table ses colonnes, types, et badges PK/FK.
// Appelée une seule fois au démarrage via init ; le panneau reste ouvert ou fermé via toggleSP().
function renderSchema(){
  document.getElementById('sbd').innerHTML=ACTIVE_DOMAIN.schemaDef.map(t=>`
    <div class="stbl">
      <div class="stname">${t.name}</div>
      ${t.rows.map(r=>`<div class="strow">
        <span class="stc">${r.c}${r.n==='PK'?'<span class="pk">PK</span>':r.n==='FK'?'<span class="fk">FK</span>':''}</span>
        <span class="stt">${r.t}</span>
        <span class="stn">${r.n!=='PK'&&r.n!=='FK'?r.n:''}</span>
      </div>`).join('')}
    </div>`).join('');
}

// Écrans — Parcours (accueil) / Atelier / Compétences / Lexique / Test de placement.
// Bascule entre les 4 écrans de l'application : accueil, atelier, compétences, lexique.
// Chacun a sa propre pastille de nav (np-*) et son propre conteneur, un seul visible à la fois.
function goScreen(s){
  screen=s;
  ['accueil','atelier','competences','lexique'].forEach(id=>{const el=document.getElementById('np-'+id);if(el)el.classList.toggle('active',s===id);});
  document.getElementById('accueil').style.display=s==='accueil'?'block':'none';
  document.getElementById('main').style.display=s==='atelier'?'flex':'none';
  document.getElementById('competences').style.display=s==='competences'?'block':'none';
  document.getElementById('lexique').style.display=s==='lexique'?'block':'none';
  document.getElementById('test').style.display=s==='test'?'flex':'none';
  document.getElementById('progbar').style.display=s==='atelier'?'block':'none';
  closeDomainMenu();
  if(s==='accueil') renderAccueil();
  if(s==='competences') renderCompetences();
  if(s==='lexique') renderLexiquePage();
  if(s==='test') renderTestScreen();
  window.scrollTo(0,0);
}

// Construit l'écran d'accueil : en-tête + chiffres clés du domaine actif,
// aperçu du chemin (2 leçons précédentes + leçon courante + 1 à venir),
// et 3 cartes de mise en avant (défi du jour, cas réels, radar de compétences).
function renderAccueil(){
  const l=lessons();
  const totalLecons=total();
  const domainIcon=ACTIVE_DOMAIN.meta.icon||'🩺';
  const lead=ACTIVE_DOMAIN.meta.description||"Apprends le SQL sur des données de santé réelles, un exercice à la fois.";
  const tableCount=ACTIVE_DOMAIN.schemaDef.length;
  const domainsList=Object.values(DOMAINS).map(d=>`${d.meta.icon} ${d.meta.name}`).join(' · ');

  const from=Math.max(0,idx-2);
  const to=Math.min(l.length-1,idx+1);
  let pathHtml='';
  for(let i=from;i<=to;i++){
    const les=l[i];
    const isDone=done.has(les.id);
    const isActive=i===idx;
    if(i>from){
      const prevDone=done.has(l[i-1].id);
      const prevActive=(i-1)===idx;
      const lc=prevDone?'#00C896':prevActive?'#FFDD15':'#D2D5E2';
      pathHtml+=`<div class="acc-path-line" style="background:${lc}"></div>`;
    }
    if(isDone){
      pathHtml+=`<div class="acc-path-item"><span class="acc-path-dot" style="background:#00C896;color:#fff">✓</span><div><div class="acc-path-title">${les.title}</div><div class="acc-path-sub">Complétée</div></div></div>`;
    }else if(isActive){
      pathHtml+=`<div class="acc-path-item acc-path-current" onclick="goScreen('atelier')"><span class="acc-path-dot" style="background:#FFDD15;color:#10173F;font-weight:700">${i+1}</span><div><div class="acc-path-title">${les.title}</div><div class="acc-path-sub" style="color:#4A5072">Reprendre ici →</div></div></div>`;
    }else{
      pathHtml+=`<div class="acc-path-item" style="opacity:.6;cursor:pointer" onclick="gol(${i});goScreen('atelier')"><span class="acc-path-dot" style="border:2px dashed #D2D5E2;color:#8087A8">${i+1}</span><div><div class="acc-path-title">${les.title}</div><div class="acc-path-sub">À venir — cliquer pour commencer</div></div></div>`;
    }
  }

  document.getElementById('accueil').innerHTML=`
    <svg class="acc-bg-icon br" viewBox="0 0 100 120" aria-hidden="true"><ellipse cx="50" cy="18" rx="44" ry="14"/><path d="M6,18 L6,102 A44,14 0 0,0 94,102 L94,18"/><path d="M6,60 A44,14 0 0,0 94,60"/></svg>
    <div class="acc-hero">
      <svg class="acc-bg-icon tl" viewBox="0 0 100 120" aria-hidden="true"><ellipse cx="50" cy="18" rx="44" ry="14"/><path d="M6,18 L6,102 A44,14 0 0,0 94,102 L94,18"/><path d="M6,60 A44,14 0 0,0 94,60"/></svg>
      <svg class="acc-bg-icon tr" viewBox="0 0 100 120" aria-hidden="true"><ellipse cx="50" cy="18" rx="44" ry="14"/><path d="M6,18 L6,102 A44,14 0 0,0 94,102 L94,18"/><path d="M6,60 A44,14 0 0,0 94,60"/></svg>
      <svg class="acc-bg-icon tc" viewBox="0 0 100 120" aria-hidden="true"><ellipse cx="50" cy="18" rx="44" ry="14"/><path d="M6,18 L6,102 A44,14 0 0,0 94,102 L94,18"/><path d="M6,60 A44,14 0 0,0 94,60"/></svg>
      <div class="acc-hero-left">
        <div class="acc-eyebrow">${domainIcon} ${ACTIVE_DOMAIN.meta.name}</div>
        <div class="acc-title">Un chemin,<br>${totalLecons} leçons,<br>zéro blabla.</div>
        <div class="acc-domain-icons">
          <span class="acc-icon-badge sm grad-blue" title="Bases de données">🗄️</span>
          <span class="acc-icon-badge sm grad-teal" title="Requêtes SQL">🔎</span>
          <span class="acc-icon-badge sm grad-coral" title="Données de santé">🩺</span>
        </div>
        <div class="acc-skill">🩺 Compétences SQL santé</div>
        <div class="acc-lead">${lead}</div>
        <div class="acc-ctas">
          <button class="acc-cta-pri" onclick="goScreen('atelier')">${done.size?'Continuer ma progression →':'Écrire ma première requête'}</button>
          <button class="acc-cta-sec" onclick="startPlacementTest()">Tester mon niveau</button>
        </div>
        <div class="acc-stats">
          <div><div class="acc-stat-n">${totalLecons}</div><div class="acc-stat-l">leçons</div></div>
          <div><div class="acc-stat-n">${totalLecons*3}</div><div class="acc-stat-l">exercices</div></div>
          <div><div class="acc-stat-n">${tableCount}</div><div class="acc-stat-l">tables santé</div></div>
        </div>
      </div>
      <div class="acc-path">
        <div class="acc-path-lbl">Ton chemin — ${lmap[lvl]}</div>
        ${pathHtml}
      </div>
      <div class="acc-stat-visit"><div class="acc-stat-n" id="visit-count">${visitCount===null?'…':visitCount}</div><div class="acc-stat-l">personnes à tester notre solution</div></div>
    </div>
    <div class="acc-cards">
      <div class="acc-card" style="background:#E9FBF4"><div class="acc-icon-badge grad-teal">🎯</div><div class="acc-card-title">Défi du jour</div><div class="acc-card-desc">Reprends ta leçon en cours et enchaîne les 3 exercices pour gagner de l'XP.</div></div>
      <div class="acc-card" style="background:#FFF1EF"><div class="acc-icon-badge grad-coral">🩺</div><div class="acc-card-title">Cas réels</div><div class="acc-card-desc">Chaque exercice vient d'une vraie question posée à un data analyst santé.<br><span class="acc-card-domains">${domainsList}</span></div></div>
      <div class="acc-card" style="background:#EDF4FD;cursor:pointer" onclick="goScreen('competences')"><div class="acc-icon-badge grad-blue">📈</div><div class="acc-card-title">Radar de compétences</div><div class="acc-card-desc">Jointures, agrégats, fenêtres : vois tes trous avant l'entretien.</div></div>
    </div>`;
  loadVisitCount();
}

// Récupère le nombre de visites (service abacus.jasoncameron.dev — JSON + CORS, contrairement
// aux badges SVG classiques qui ne s'intègrent qu'en <img>). visitFetchStarted garantit une seule
// requête par vrai chargement de page : revenir sur l'Accueil dans la même session ne réincrémente
// pas le compteur, ça réaffiche juste la valeur déjà en cache.
function loadVisitCount(){
  const el=document.getElementById('visit-count');
  if(el) el.textContent=visitCount===null?'…':visitCount;
  if(visitFetchStarted||typeof fetch!=='function') return;
  visitFetchStarted=true;
  fetch('https://abacus.jasoncameron.dev/hit/sqlsante-alphonseahlou/visits')
    .then(r=>r.json())
    .then(data=>{
      if(typeof data.value==='number') visitCount=data.value;
      const el2=document.getElementById('visit-count');
      if(el2&&visitCount!==null) el2.textContent=visitCount;
    })
    .catch(()=>{});
}

// Construit l'écran plein page "Compétences" : en-tête (profil, KPIs xp/série/leçons),
// radar SVG des catégories SQL, barres de progression par catégorie, et un conseil
// pointant vers la catégorie la plus faible (pour orienter vers l'Atelier).
function renderCompetences(){
  const skills=computeSkills();
  const totalLecons=total();
  let weakest=skills[0];
  skills.forEach(s=>{if(s.pct<weakest.pct) weakest=s;});
  const allMastered=skills.every(s=>s.pct>=1);
  document.getElementById('competences').innerHTML=`
    <div class="comp-head">
      <div>
        <div class="comp-eyebrow">profil · niveau ${lmap[lvl].toLowerCase()}</div>
        <div class="comp-title">Là où tu es solide,<br>là où ça coince.</div>
      </div>
      <div class="comp-kpis">
        <div class="comp-kpi"><div class="comp-kpi-n">${gamState.xp.toLocaleString('fr-FR')}</div><div class="comp-kpi-l">xp total</div></div>
        <div class="comp-kpi"><div class="comp-kpi-n">${gamState.streak} j</div><div class="comp-kpi-l">série</div></div>
        <div class="comp-kpi"><div class="comp-kpi-n">${done.size}/${totalLecons}</div><div class="comp-kpi-l">leçons</div></div>
      </div>
    </div>
    <div class="comp-grid">
      <div class="comp-radar" id="comp-radar"></div>
      <div class="comp-skills">
        ${skills.map(s=>{
          const pct=Math.round(s.pct*100);
          const color=pct>=70?'#00C896':pct>=35?'#FFDD15':pct>0?'#FF6B5C':'#8087A8';
          return `<div class="comp-skill"><div class="comp-skill-hd"><span>${s.cat}</span><span style="color:${color};font-family:var(--font-mono)">${pct} %</span></div><div class="comp-skill-track"><div class="comp-skill-fill" style="width:${pct}%;background:${color}"></div></div></div>`;
        }).join('')}
        <div class="comp-advice"${allMastered?' style="cursor:default"':' onclick="goScreen(\'atelier\')"'}>
          ${allMastered?'Toutes les catégories sont maîtrisées à 100 % — bravo !':`<b>${weakest.cat}</b> reste ton point faible (${Math.round(weakest.pct*100)} %) — c'est aussi une question fréquente en entretien. <span style="color:var(--accent)">Continuer l'atelier →</span>`}
        </div>
      </div>
    </div>`;
  document.getElementById('comp-radar').innerHTML=renderRadar();
}

// Lexique — écran plein page. Recherche texte + filtre par catégorie (dérivée dynamiquement de
// LEXIQUE, pas figée, pour rester correcte si de nouveaux mots-clés sont ajoutés).
let lexQ='',lexCat='tous';

// Construit la coquille de l'écran Lexique (titre, recherche, chips de catégorie, grille)
// une seule fois à l'ouverture, puis délègue le remplissage de la grille à fillLexiquePage().
function renderLexiquePage(){
  lexQ='';lexCat='tous';
  if(typeof LEXIQUE==='undefined') return;
  const cats=['tous',...new Set(LEXIQUE.map(x=>x.cat))];
  document.getElementById('lexique').innerHTML=`
    <div class="lex-page-title">Lexique SQL</div>
    <div class="lex-page-search"><span class="lex-page-slash">/</span><input id="lex-page-q" oninput="filterLexiquePage(this.value)" placeholder="Chercher un mot-clé : SELECT, JOIN, GROUP BY…"></div>
    <div class="lex-page-cats" id="lex-page-cats">${cats.map(c=>`<div class="lex-chip${c==='tous'?' active':''}" data-c="${c}" onclick="setLexCat('${c}')">${c}</div>`).join('')}</div>
    <div class="lex-page-grid" id="lex-page-grid"></div>`;
  fillLexiquePage();
}

// Change la catégorie active (chips) et rafraîchit la grille.
function setLexCat(c){
  lexCat=c;
  document.querySelectorAll('#lex-page-cats .lex-chip').forEach(el=>el.classList.toggle('active',el.dataset.c===c));
  fillLexiquePage();
}

// Appelée à chaque frappe dans la recherche — ne touche que la grille pour garder le focus du champ.
function filterLexiquePage(v){lexQ=v;fillLexiquePage();}

// Recalcule et injecte les cartes du lexique selon lexQ (texte) et lexCat (catégorie).
function fillLexiquePage(){
  const s=lexQ.toLowerCase().trim();
  const items=LEXIQUE.filter(x=>(lexCat==='tous'||x.cat===lexCat)&&(!s||x.kw.toLowerCase().includes(s)||x.simple.toLowerCase().includes(s)||x.cat.toLowerCase().includes(s)));
  document.getElementById('lex-page-grid').innerHTML=items.length?items.map(x=>`
    <div class="lex-item">
      <div class="lex-kw-row"><span class="lex-kw">${x.kw}</span><span class="lex-cat">${x.cat}</span></div>
      <div class="lex-simple">${x.simple}</div>
      <div class="lex-ex">${x.ex}</div>
    </div>`).join(''):`<div style="color:var(--text-faint);font-size:14px;padding:20px 4px">Aucun résultat pour « ${s} ».</div>`;
}

// Test de placement — mini-quiz de 2 questions par niveau (déb/int/avc/exp), tirées des exercices
// existants du domaine actif. Chaque question est vérifiée en exécutant la requête
// de l'utilisateur ET la solution de référence (extraite via extractSolutionSQL),
// puis en comparant les lignes de résultat — pas de pattern-matching sur le texte SQL,
// donc une requête différemment écrite mais correcte passe quand même.
// Seuls des exercices dont la solution est un SELECT/WITH sont retenus : le test
// n'exécute jamais d'INSERT/UPDATE/DELETE/DDL, donc il ne modifie jamais la base.
let testState=null;

// Choisit jusqu'à 2 leçons par niveau (priorité aux leçons "★ Entretien") dont le premier
// exercice a une solution en lecture seule, et construit la liste de questions du test.
function buildPlacementQuestions(){
  const qs=[];
  LEVEL_ORDER.forEach(lv=>{
    const pool=(ACTIVE_DOMAIN.cur[lv]||[]).filter(l=>{
      const ex=l.exercises&&l.exercises[0];
      if(!ex) return false;
      return /^(SELECT|WITH)\b/i.test(extractSolutionSQL(ex.hints));
    });
    [...pool].sort((a,b)=>(b.hot?1:0)-(a.hot?1:0)).slice(0,2).forEach(l=>{
      const ex=l.exercises[0];
      qs.push({lvl:lv, lessonTitle:l.title, task:ex.task, sql:extractSolutionSQL(ex.hints)});
    });
  });
  return qs;
}

// Compare deux résultats de requête (colonnes + lignes) sans tenir compte de l'ordre des lignes.
// Une requête valide mais qui ne retourne pas les mêmes données est donc jugée incorrecte,
// mais l'ordre des colonnes/lignes n'a pas besoin d'être identique à la solution de référence.
function sameResult(a,b){
  if(a.columns.length!==b.columns.length) return false;
  const norm=r=>r.rows.map(row=>JSON.stringify(row)).sort();
  const A=norm(a),B=norm(b);
  return A.length===B.length&&A.every((v,i)=>v===B[i]);
}

// Lance un nouveau test de placement pour le domaine actif : construit les questions et ouvre l'écran.
// Appelée par le bouton "Tester mon niveau" de l'Accueil.
function startPlacementTest(){
  const questions=buildPlacementQuestions();
  if(!questions.length){document.getElementById('test').innerHTML='<div class="test-wrap"><div class="rerr">✗ Aucune question disponible pour ce domaine.</div></div>';goScreen('test');return;}
  testState={questions,i:0,results:[]};
  goScreen('test');
}

// Construit soit la question courante, soit l'écran de résultat si le test est terminé.
function renderTestScreen(){
  if(!testState) return;
  const{questions,i}=testState;
  if(i>=questions.length){renderTestResults();return;}
  const q=questions[i];
  document.getElementById('test').innerHTML=`
    <div class="test-wrap">
      <div class="test-progress">Question ${i+1} / ${questions.length}</div>
      <div class="test-lvlbadge">${lmap[q.lvl]}</div>
      <div class="test-title">${q.lessonTitle}</div>
      <div class="test-task">${q.task}</div>
      <textarea id="test-ed" class="test-editor" spellcheck="false" placeholder="-- Écris ta requête SQL ici..."></textarea>
      <div class="test-actions">
        <button class="brun" onclick="submitTestAnswer()">Vérifier ▶</button>
        <button class="bghost" onclick="skipTestQuestion()">Passer →</button>
      </div>
      <div id="test-fb"></div>
    </div>`;
}

// Exécute la requête de l'utilisateur et la solution de référence, compare les résultats,
// enregistre correct/incorrect pour cette question, puis passe à la suivante.
function submitTestAnswer(){
  const userSql=document.getElementById('test-ed').value.trim();
  if(!userSql){document.getElementById('test-fb').innerHTML='<div class="rerr">✗ Écris une requête avant de vérifier.</div>';return;}
  const q=testState.questions[testState.i];
  let correct=false;
  try{ correct=sameResult(runQuery(q.sql),runQuery(userSql)); }catch(e){ correct=false; }
  testState.results.push({lvl:q.lvl,correct});
  testState.i++;
  renderTestScreen();
}

// Marque la question courante comme non répondue (incorrecte) et passe à la suivante.
function skipTestQuestion(){
  testState.results.push({lvl:testState.questions[testState.i].lvl,correct:false});
  testState.i++;
  renderTestScreen();
}

// Calcule le score par niveau et détermine le niveau recommandé : le niveau le plus avancé
// dont TOUTES les questions ont été réussies (heuristique simple, pas une évaluation rigoureuse).
function renderTestResults(){
  const byLevel={};
  LEVEL_ORDER.forEach(l=>byLevel[l]={correct:0,total:0});
  testState.results.forEach(r=>{byLevel[r.lvl].total++;if(r.correct)byLevel[r.lvl].correct++;});
  let placement='d';
  LEVEL_ORDER.forEach(l=>{const b=byLevel[l];if(b.total&&b.correct===b.total)placement=l;});
  const rowsHtml=LEVEL_ORDER.filter(l=>byLevel[l].total).map(l=>{
    const b=byLevel[l],pass=b.correct===b.total;
    return `<div class="test-result-row"><span>${lmap[l]}</span><span style="color:${pass?'#00C896':'#FF6B5C'}">${b.correct} / ${b.total} ${pass?'✓':'✗'}</span></div>`;
  }).join('');
  document.getElementById('test').innerHTML=`
    <div class="test-wrap">
      <div class="test-title">Résultat du test</div>
      <div class="test-results-list">${rowsHtml}</div>
      <div class="test-placement">Niveau recommandé : <b>${lmap[placement]}</b></div>
      <div class="test-actions">
        <button class="acc-cta-pri" onclick="applyPlacement('${placement}')">Commencer en ${lmap[placement]} →</button>
        <button class="acc-cta-sec" onclick="goScreen('accueil')">Retour à l'accueil</button>
      </div>
    </div>`;
}

// Applique le niveau recommandé (change lvl, repart à la 1ère leçon) et ouvre l'Atelier.
function applyPlacement(l){
  lvl=l;idx=0;exIdx=0;
  document.querySelectorAll('.sb-lvl').forEach(b=>b.classList.toggle('active',b.dataset.l===lvl));
  saveProgress();
  testState=null;
  renderLesson();
  goScreen('atelier');
}

// Change le niveau actif (d/i/a/e), repart à la première leçon et au premier exercice.
// Appelée par les boutons de la topbar (Débutant, Intermédiaire, Avancé, Expert).
function setLevel(l){saveCurrentQuery();lvl=l;idx=0;exIdx=0;document.querySelectorAll('.sb-lvl').forEach(b=>b.classList.toggle('active',b.dataset.l===l));saveProgress();renderLesson();}

// Saute directement à la leçon d'index i dans le niveau courant, repart au premier exercice.
function gol(i){if(i<0||i>=lessons().length)return;saveCurrentQuery();idx=i;exIdx=0;saveProgress();renderLesson();}

// Passe à la leçon suivante (d=+1) ou précédente (d=-1) dans le niveau courant.
// En bout de niveau (d=+1 après la dernière leçon), bascule sur le niveau suivant (déb → int → avc → exp) s'il existe.
// Appelée par les boutons "← Précédent" et "Suivant →" en bas de page.
function nav(d){
  const n=idx+d;
  if(n>=0&&n<lessons().length){saveCurrentQuery();idx=n;exIdx=0;saveProgress();renderLesson();return;}
  if(d===1){
    const nl=nextLevel();
    if(nl){saveCurrentQuery();lvl=nl;idx=0;exIdx=0;saveProgress();renderLesson();}
  }
}

// Navigue vers l'exercice i de la leçon courante sans changer de leçon.
// Appelée par les boutons numérotés (1, 2, 3) de la navigation d'exercice.
function goEx(i){saveCurrentQuery();exIdx=i;renderLesson();}

// Ouvre ou ferme le panneau "Structure BD" sur la droite de l'écran.
// Appelée par le bouton "📋 Structure BD" dans la barre de l'éditeur.
function toggleSP(){document.getElementById('sp').classList.toggle('open');}

// Affiche l'indice suivant pour l'exercice courant, en progressant un par un dans exercise().hints.
// Le compteur hintC[cacheKey()] est par exercice : naviguer entre exercices repart à l'indice 1.
// Appelée par le bouton "💡 Indice".
function showHint(){
  const k=cacheKey();
  if(!hintC[k]) hintC[k]=0;
  const i=hintC[k];
  const hints=exercise().hints;
  document.getElementById('ha').innerHTML=`
    <div class="hintbox">
      <div class="htitle">💡 Indice ${i+1}/${hints.length}</div>
      <div class="htext">${hints[Math.min(i,hints.length-1)]}</div>
    </div>`;
  hintC[k]=Math.min(i+1,hints.length-1);
}

// Extrait la requête SQL depuis le dernier hint d'un exercice (texte introductif ignoré).
// Partagée par showSol() (affichage) et le test de placement (comparaison de résultats).
function extractSolutionSQL(hints){
  const sol=hints[hints.length-1];
  const m=sol.match(/((?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|EXPLAIN)[\s\S]+)/i);
  return (m?m[1]:sol).trim();
}

// Extrait la solution SQL depuis le dernier élément de exercise().hints et l'injecte dans l'éditeur.
// Affiche un message invitant à cliquer "Exécuter". Appelée par le bouton "👁 Solution".
function showSol(){
  document.getElementById('ed').value=extractSolutionSQL(exercise().hints);
  document.getElementById('ra').innerHTML='<div class="rinfo">💡 Solution affichée — cliquez Exécuter pour voir le résultat.</div>';
}

// Exécute la requête SQL via SQLite (SQL.js) et affiche le résultat dans #ra.
// Raccourci clavier : Ctrl+Entrée (défini dans le listener keydown plus bas).
//
// Flux d'exécution :
// 1. Lit la requête dans l'éditeur (#ed) — abandonne si vide.
// 2. Délègue à runQuery() (db.js) qui exécute la requête dans SQLite.
// 3. SELECT : affiche un tableau de résultats.
//    DML/DDL (colonne 'message') : affiche le message de confirmation en vert.
// 4. Marque la leçon comme terminée dans done et sauvegarde.
// 5. Erreur SQLite : affiche le message avec un conseil contextuel en français.
function execute(){
  const q=document.getElementById('ed').value.trim();
  if(!q) return;
  const btn=document.getElementById('brun');
  btn.disabled=true;btn.textContent='…';
  try{
    const{columns,rows}=runQuery(q);
    exDone.add(cacheKey());
    awardXP(ACTIVE_DOMAIN.meta.id+'::'+cacheKey());
    const allExDone=exercises().every((_,i)=>exDone.has(lesson().id+'_'+i));
    if(allExDone) done.add(lesson().id);
    saveProgress();renderSB();
    // Marquer le bouton de l'exercice actif comme complété (✓) sans re-rendre toute la leçon
    const activeBtn=document.querySelector('.ex-btn.active');
    if(activeBtn){activeBtn.classList.add('done');activeBtn.textContent='✓';}
    let html;
    if(columns.length===1&&columns[0]==='message'){
      html=`<div class="rok">${rows[0][0]}</div>`;
      document.getElementById('res-head').textContent='résultat';
    } else {
      html=`<div class="rok">✓ ${rows.length} ligne${rows.length!==1?'s':''} retournée${rows.length!==1?'s':''}</div>`;
      if(rows.length){
        html+=`<div class="twrap"><table class="rt"><thead><tr>${columns.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>`;
        rows.forEach(r=>{html+=`<tr>${r.map(v=>`<td${v===null||v===undefined?' class="nl"':''}>${v===null||v===undefined?'NULL':v}</td>`).join('')}</tr>`;});
        html+=`</tbody></table></div><div class="rcount">${rows.length} ligne${rows.length!==1?'s':''}</div>`;
      }
      document.getElementById('res-head').textContent=`résultat · ${rows.length} ligne${rows.length!==1?'s':''}`;
    }
    document.getElementById('ra').innerHTML=html;
    popStars();
  }catch(e){
    let msg=String(e.message||e).replace(/^Error:\s*/,'').trim();
    let tip='';
    if(/no such table/i.test(msg))  tip='\n💡 Tables disponibles : '+ACTIVE_DOMAIN.schemaDef.map(t=>t.name).join(', ');
    if(/syntax error/i.test(msg))   tip='\n💡 Vérifiez la syntaxe : SELECT colonnes FROM table WHERE condition;';
    if(/no such column/i.test(msg)) tip='\n💡 Vérifiez les noms de colonnes avec 📋 Structure BD';
    document.getElementById('res-head').textContent='résultat · erreur';
    document.getElementById('ra').innerHTML=`<div class="rerr">✗ ${msg}${tip}</div>`;
  }
  btn.disabled=false;btn.textContent='▶ Exécuter';
}

// Petite récompense visuelle : une poignée d'étoiles qui explosent depuis le centre du panneau
// de résultats puis disparaissent. CSS pur (une seule animation, ~700ms, aucune dépendance,
// aucun son) — appelée par execute() à chaque requête réussie.
function popStars(){
  const host=document.getElementById('star-burst');
  if(!host) return;
  host.innerHTML='';
  const n=7;
  for(let i=0;i<n;i++){
    const s=document.createElement('span');
    s.textContent='⭐';
    const angle=(Math.PI*2*i/n)+(Math.random()*0.5-0.25);
    const dist=46+Math.random()*34;
    s.style.setProperty('--tx',(Math.cos(angle)*dist).toFixed(1)+'px');
    s.style.setProperty('--ty',(Math.sin(angle)*dist).toFixed(1)+'px');
    s.style.setProperty('--rot',(Math.random()*180-90).toFixed(0)+'deg');
    s.style.animationDelay=(Math.random()*70).toFixed(0)+'ms';
    host.appendChild(s);
  }
  setTimeout(()=>{ if(host.isConnected) host.innerHTML=''; }, 900);
}

// Deux raccourcis clavier globaux :
// - Ctrl+Entrée (ou Cmd+Entrée sur Mac) : exécute la requête SQL dans l'éditeur.
// - Tab dans l'éditeur (#ed) : insère 2 espaces au lieu de changer de focus,
//   pour permettre l'indentation du code SQL sans quitter la zone de texte.
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();execute();}
  if(e.key==='Tab'&&e.target.id==='ed'){
    e.preventDefault();
    const t=e.target,s=t.selectionStart,en=t.selectionEnd;
    t.value=t.value.substring(0,s)+'  '+t.value.substring(en);
    t.selectionStart=t.selectionEnd=s+2;
  }
});

// Ouvre ou ferme la section "Syntaxe & Concept" d'une leçon (accordéon).
// header : l'élément .chead cliqué. Lit son frère suivant (.cbody) pour le basculer.
// Met à jour la flèche (▶ / rotation 90°) et le texte indicatif.
// Appelée par onclick sur chaque .chead dans renderLesson().
function toggleConcept(header){
  const body=header.nextElementSibling;
  const arrow=header.querySelector('.chead-arrow');
  const hint=header.querySelector('.chead-hint');
  const isOpen=body.classList.toggle('open');
  arrow.style.transform=isOpen?'rotate(90deg)':'';
  hint.textContent=isOpen?'cliquez pour fermer':'cliquez pour ouvrir';
}

// Ouvre ou ferme le bloc "En termes simples" d'une leçon (même logique que toggleConcept).
// Appelée par onclick sur .tip-head dans renderLesson().
function toggleTip(header){
  const body=header.nextElementSibling;
  const arrow=header.querySelector('.chead-arrow');
  const hint=header.querySelector('.chead-hint');
  const isOpen=body.classList.toggle('open');
  arrow.style.transform=isOpen?'rotate(90deg)':'';
  hint.textContent=isOpen?'cliquez pour fermer':'cliquez pour ouvrir';
}

// La cartographie des compétences est définie dans le fichier de domaine actif (js/domains/).
// ACTIVE_DOMAIN.skillMap associe chaque catégorie SQL aux IDs de leçons qui la couvrent.

// Calcule le taux de maîtrise (0.0 → 1.0) pour chaque catégorie du domaine actif.
// Retourne un tableau [{cat, pct}] utilisé par renderRadar() pour positionner les points du radar.
function computeSkills(){return Object.entries(ACTIVE_DOMAIN.skillMap).map(([cat,ids])=>({cat,pct:ids.filter(id=>done.has(id)).length/ids.length}));}

// Génère le graphique radar (toile d'araignée) en SVG pur, sans librairie externe.
// Chaque axe représente une catégorie SQL ; la surface verte indique la progression.
// Les labels affichent le nom de la catégorie et le pourcentage ; ils passent au vert à 100%.
// Retourne une chaîne SVG injectée dans #comp-radar par renderCompetences().
function renderRadar(){
  const skills=computeSkills();const N=skills.length;const cx=220,cy=180,r=100;
  const angles=skills.map((_,i)=>(2*Math.PI*i/N)-Math.PI/2);
  const circles=[0.25,0.5,0.75,1.0].map(v=>{const pts=angles.map(a=>`${cx+r*v*Math.cos(a)},${cy+r*v*Math.sin(a)}`).join(' ');return `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="1"/>`;}).join('');
  const axes=angles.map(a=>`<line x1="${cx}" y1="${cy}" x2="${cx+r*Math.cos(a)}" y2="${cy+r*Math.sin(a)}" stroke="rgba(255,255,255,.1)" stroke-width="1"/>`).join('');
  const pts=skills.map((s,i)=>`${cx+r*s.pct*Math.cos(angles[i])},${cy+r*s.pct*Math.sin(angles[i])}`).join(' ');
  const poly=`<polygon points="${pts}" fill="rgba(255,221,21,.22)" stroke="#FFDD15" stroke-width="2"/>`;
  const labels=skills.map((s,i)=>{
    const lx=cx+(r+24)*Math.cos(angles[i]);const ly=cy+(r+24)*Math.sin(angles[i]);
    const dx=cx+r*s.pct*Math.cos(angles[i]);const dy=cy+r*s.pct*Math.sin(angles[i]);
    const pct=Math.round(s.pct*100);
    const anchor=Math.cos(angles[i])<-0.1?'end':Math.cos(angles[i])>0.1?'start':'middle';
    return `<circle cx="${dx}" cy="${dy}" r="4" fill="#FFDD15"/><text x="${lx}" y="${ly-5}" text-anchor="${anchor}" fill="#B9BFD8" font-size="10" font-family="Geist,sans-serif">${s.cat}</text><text x="${lx}" y="${ly+8}" text-anchor="${anchor}" fill="${pct===100?'#00C896':'#4A90E2'}" font-size="9" font-family="'Geist Mono',monospace">${pct}%</text>`;
  }).join('');
  return `<svg viewBox="0 0 440 360" style="width:100%;height:auto;max-width:460px">${circles}${axes}${poly}${labels}</svg>`;
}

// Retour à l'Atelier depuis Compétences ou Lexique via Échap.
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  if(screen==='competences'||screen==='lexique') goScreen('atelier');
  else if(screen==='test') goScreen('accueil');
});

// Domaines annoncés mais pas encore disponibles — affichés en "bientôt" dans le menu.
const COMING_SOON=[
  {id:'nutrition', icon:'🥗', name:'Nutrition clinique',    desc:'Profils nutritionnels, recommandations'},
  {id:'recherche', icon:'🔬', name:'Recherche clinique',    desc:'Essais randomisés, données manquantes'},
];

// Construit et injecte le menu déroulant de sélection de domaine.
// Affiche les domaines disponibles (DOMAINS) et les futurs (COMING_SOON).
function renderDomainMenu(){
  const available=Object.values(DOMAINS).map(d=>`
    <div class="domain-item${d===ACTIVE_DOMAIN?' active':''}" onclick="${d===ACTIVE_DOMAIN?'':'switchDomain(\''+d.meta.id+'\')'}">
      <span class="domain-item-icon">${d.meta.icon}</span>
      <div class="domain-item-info">
        <div class="domain-item-name">${d.meta.name}</div>
        <div class="domain-item-desc">${d.meta.description}</div>
      </div>
      ${d===ACTIVE_DOMAIN?'<span class="domain-item-check">✓</span>':''}
    </div>`).join('');
  const soon=COMING_SOON.map(d=>`
    <div class="domain-soon">
      <span class="domain-soon-icon">${d.icon}</span>
      <span class="domain-soon-name">${d.name}</span>
      <span class="domain-soon-tag">bientôt</span>
    </div>`).join('');
  document.getElementById('domain-menu').innerHTML=`
    <div class="domain-menu-title">Domaine actif</div>
    ${available}
    <div class="domain-divider"></div>
    <div class="domain-menu-title">À venir</div>
    ${soon}`;
}

// Ouvre ou ferme le menu de sélection de domaine.
// Appelée par un clic sur le badge de domaine dans la topbar.
function toggleDomainMenu(e){
  e.stopPropagation();
  const menu=document.getElementById('domain-menu');
  const isOpen=menu.classList.toggle('open');
  if(isOpen) renderDomainMenu();
}

// Ferme le menu de domaine (clic en dehors).
function closeDomainMenu(){document.getElementById('domain-menu').classList.remove('open');}

// Change le domaine actif, réinitialise l'état et recharge l'interface.
// Sauvegarde la progression du domaine courant avant de switcher.
function switchDomain(id){
  if(!DOMAINS[id]||DOMAINS[id]===ACTIVE_DOMAIN) return;
  saveProgress();
  ACTIVE_DOMAIN=DOMAINS[id];
  // Réinitialiser l'état applicatif
  lvl='d';idx=0;exIdx=0;done=new Set();exDone=new Set();hintC={};queryCache={};testState=null;
  document.querySelectorAll('.sb-lvl').forEach(b=>b.classList.toggle('active',b.dataset.l==='d'));
  // Charger la progression de ce domaine
  loadProgress();
  // Mettre à jour le badge
  document.getElementById('domain-badge').firstChild.textContent=''; // text node
  renderDomainBadge();
  // Reconstruire la BD avec les données du nouveau domaine
  _buildDB();
  // Rafraîchir l'interface
  renderSchema();
  renderLesson();
  if(screen==='accueil') renderAccueil();
  else if(screen==='competences') renderCompetences();
  else if(screen==='lexique') renderLexiquePage();
  else if(screen==='test') goScreen('accueil');
  closeDomainMenu();
}

// Met à jour le texte du badge de domaine dans la topbar.
function renderDomainBadge(){
  const badge=document.getElementById('domain-badge');
  // On garde le div#domain-menu à l'intérieur, on met le texte avant lui
  badge.childNodes[0]&&badge.childNodes[0].nodeType===3
    ?badge.childNodes[0].textContent=ACTIVE_DOMAIN.meta.icon+' '+ACTIVE_DOMAIN.meta.name+' ▾'
    :badge.insertBefore(document.createTextNode(ACTIVE_DOMAIN.meta.icon+' '+ACTIVE_DOMAIN.meta.name+' ▾'),badge.firstChild);
}

// Ferme le menu si on clique en dehors
document.addEventListener('click',()=>closeDomainMenu());

// Affiche ou masque la sidebar sur mobile (classe 'open' contrôlée par CSS responsive).
function toggleSidebar(){document.getElementById('sb').classList.toggle('open');}

// Init — séquence de démarrage exécutée une fois au chargement de la page.
// Ordre : loadProgress() restaure lvl/idx/done depuis localStorage, renderSB()+renderSchema()
// affichent l'UI immédiatement (ne dépendent pas de SQLite), puis initDB() charge le WASM
// (~1 Mo, 1-2 sec) et renderLesson() remplace l'indicateur de chargement par le contenu réel.
renderDomainBadge();
loadGam();renderGam();

loadProgress();
renderSchema();
renderSB();
goScreen('accueil');
document.getElementById('lb').innerHTML=`
  <div style="display:flex;align-items:center;gap:12px;padding:24px 18px;color:var(--text-mute);font-family:var(--font-body);font-size:13px">
    <span style="font-size:22px;animation:spin 1s linear infinite">⏳</span>
    <span>Chargement du moteur SQL (SQLite)…</span>
  </div>`;
initDB()
  .then(()=>renderLesson())
  .catch(e=>{
    document.getElementById('lb').innerHTML=`<div class="rerr" style="margin:16px">✗ Impossible de charger SQL.js : ${e.message}<br><br>Vérifiez votre connexion internet, puis rechargez la page.</div>`;
  });
