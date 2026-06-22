// ═══════════════════════════════════════
// APP STATE
// Variables globales qui représentent l'état courant de l'application.
// - lvl    : niveau actif ('d' débutant, 'i' intermédiaire, 'a' avancé, 'e' expert)
// - idx    : index de la leçon en cours dans CUR[lvl]
// - exIdx  : index de l'exercice en cours dans lesson().exercises
// - done   : Set des IDs de leçons réussies — une leçon est done quand ses 3 exercices sont faits
// - exDone : Set des clés d'exercices complétés (ex: 'd1_0', 'd1_1', 'd1_2')
// - hintC  : compteur d'indices affichés par exercice, clé = cacheKey()
// - queryCache : mémorise la requête tapée pour chaque exercice, clé = cacheKey()
// ═══════════════════════════════════════
let lvl='d',idx=0,exIdx=0,done=new Set(),exDone=new Set(),hintC={},queryCache={};
const lmap={d:'Débutant',i:'Intermédiaire',a:'Avancé',e:'Expert'};
function total(){return Object.values(ACTIVE_DOMAIN.cur).reduce((a,b)=>a+b.length,0);}


// Retourne une clé unique identifiant l'exercice courant.
// Utilisée pour indexer queryCache et hintC afin que chaque exercice
// conserve sa propre requête et son propre compteur d'indices.
function cacheKey(){return lesson().id+'_'+exIdx;}

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
      if(p.lvl&&cur[p.lvl]){lvl=p.lvl;document.querySelectorAll('.lvl-btn').forEach(b=>b.classList.toggle('active',b.dataset.l===lvl));}
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
    if(p.lvl&&ACTIVE_DOMAIN.cur[p.lvl]){lvl=p.lvl;document.querySelectorAll('.lvl-btn').forEach(b=>b.classList.toggle('active',b.dataset.l===lvl));}
    if(typeof p.idx==='number'&&ACTIVE_DOMAIN.cur[lvl]&&p.idx<ACTIVE_DOMAIN.cur[lvl].length) idx=p.idx;
  }catch(e){}
}

// Retourne le tableau de leçons du niveau actif depuis le domaine courant.
function lessons(){return ACTIVE_DOMAIN.cur[lvl];}

// Retourne l'objet leçon courant : {id, title, desc, concept, exercises, hot?}.
function lesson(){return lessons()[idx];}

// ═══════════════════════════════════════
// RENDER
// ═══════════════════════════════════════

// Redessine la barre latérale gauche avec toutes les leçons du niveau actif.
// Marque la leçon active (▸), les leçons terminées (✓), les leçons futures verrouillées (🔒).
// Appelée par renderLesson() à chaque changement de leçon ou de niveau.
function renderSB(){
  document.getElementById('sb').innerHTML=
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
  document.getElementById('lt').innerHTML=l.title+(l.hot?'<span class="tag tag-hot">★ Demandé en entretien</span>':'');
  document.getElementById('ld').textContent=l.desc;
  const exNav=exercises().map((_,i)=>{const ok=exDone.has(lesson().id+'_'+i);return `<button class="ex-btn${i===exIdx?' active':''}${ok?' done':''}" onclick="goEx(${i})" title="Exercice ${i+1}${ok?' — complété ✓':' — à compléter'}">${ok?'✓':i+1}</button>`;}).join('');
  const tip=(typeof TIPS!=='undefined')&&TIPS[l.id];
  const tipOpen=false;
  const tipHtml=tip?`
    <div class="tip-block">
      <div class="tip-head" onclick="toggleTip(this)" title="Explication en langage simple de la notion SQL de cette leçon">
        <span class="dot" style="background:#3fb950"></span>
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
        <span class="dot" style="background:#f85149"></span><span class="dot" style="background:#e3b341"></span><span class="dot" style="background:#3fb950"></span>
        &nbsp; Syntaxe &amp; Concept
        <span class="chead-hint">cliquez pour ouvrir</span>
        <span class="chead-arrow">▶</span>
      </div>
      <div class="cbody"><pre>${l.concept}</pre></div>
    </div>
    <div class="tbox">
      <div class="ex-nav"><span class="ex-nav-lbl" title="3 exercices par leçon — même compétence SQL, situations différentes">Exercice</span>${exNav}</div>
      <div class="thead2"><span class="tbadge">À faire</span><span class="ttxt">${ex.task}</span></div>
      <textarea id="ed" spellcheck="false" placeholder="-- Écrivez votre requête SQL ici...&#10;-- Ctrl+Entrée pour exécuter"></textarea>
      <div class="eline">
        <button class="brun" id="brun" onclick="execute()" title="Exécuter votre requête SQL et afficher le résultat (raccourci : Ctrl+Entrée). Marque la leçon comme terminée si la requête réussit.">▶ Exécuter</button>
        <button class="bghost bamber" onclick="showHint()" title="Afficher un indice progressif — chaque clic révèle un peu plus sans donner la réponse complète">💡 Indice</button>
        <button class="bghost bred" onclick="showSol()" title="Afficher la solution complète dans l'éditeur — vous pouvez l'exécuter pour voir le résultat attendu">👁 Solution</button>
        <span class="sp"></span>
        <button class="bghost" onclick="resetDB()" title="Réinitialiser la base de données à son état initial — utile après un INSERT, UPDATE ou DELETE pour repartir de zéro">↺ Réinit. BD</button>
        <button class="bghost bblue" onclick="toggleSP()" title="Afficher ou masquer la structure de la base (tables, colonnes, types, clés primaires et étrangères)">📋 Structure BD</button>
      </div>
      <div class="fn-help">
        <span title="Exécuter : lance votre requête SQL (Ctrl+Entrée)">▶ <b>Exécuter</b> lance la requête</span>
        <span class="fn-sep">·</span>
        <span title="Indice : révèle un aide progressivement">💡 <b>Indice</b> aide pas à pas</span>
        <span class="fn-sep">·</span>
        <span title="Solution : affiche la réponse complète dans l'éditeur">👁 <b>Solution</b> montre la réponse</span>
        <span class="fn-sep">·</span>
        <span title="Réinit. BD : remet les données à leur état de départ">↺ <b>Réinit.</b> remet les données</span>
        <span class="fn-sep">·</span>
        <span title="Structure BD : affiche les tables et colonnes disponibles">📋 <b>Structure</b> liste les tables</span>
      </div>
      <div id="ha"></div>
      <div class="rarea" id="ra"><span class="rph">→ Cliquez "Exécuter" pour voir le résultat (Ctrl+Entrée).</span></div>
    </div>`;
  const edEl=document.getElementById('ed');
  if(edEl&&queryCache[cacheKey()]) edEl.value=queryCache[cacheKey()];
  document.getElementById('pf').style.width=Math.max(4,Math.round((done.size/total())*100))+'%';
  document.getElementById('pi').textContent=(idx+1)+' / '+lessons().length+'  |  '+done.size+'/'+total()+' ✓';
  document.getElementById('bprev').disabled=idx===0;
  document.getElementById('bnext').textContent=idx===lessons().length-1?'Terminer ✓':'Suivant →';
  document.getElementById('bnext').disabled=false;
  document.getElementById('bnext').title='Passer à la leçon suivante';
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

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════

// Change le niveau actif (d/i/a/e), repart à la première leçon et au premier exercice.
// Appelée par les boutons de la topbar (Débutant, Intermédiaire, Avancé, Expert).
function setLevel(l){saveCurrentQuery();lvl=l;idx=0;exIdx=0;document.querySelectorAll('.lvl-btn').forEach(b=>b.classList.toggle('active',b.dataset.l===l));saveProgress();renderLesson();}

// Saute directement à la leçon d'index i dans le niveau courant, repart au premier exercice.
function gol(i){if(i<0||i>=lessons().length)return;saveCurrentQuery();idx=i;exIdx=0;saveProgress();renderLesson();}

// Passe à la leçon suivante (d=+1) ou précédente (d=-1) dans le niveau courant.
// Appelée par les boutons "← Précédent" et "Suivant →" en bas de page.
function nav(d){const n=idx+d;if(n>=0&&n<lessons().length){saveCurrentQuery();idx=n;exIdx=0;saveProgress();renderLesson();}}

// Navigue vers l'exercice i de la leçon courante sans changer de leçon.
// Appelée par les boutons numérotés (1, 2, 3) de la navigation d'exercice.
function goEx(i){saveCurrentQuery();exIdx=i;renderLesson();}

// Ouvre ou ferme le panneau "Structure BD" sur la droite de l'écran.
// Appelée par le bouton "📋 Structure BD" dans la barre de l'éditeur.
function toggleSP(){document.getElementById('sp').classList.toggle('open');}

// ═══════════════════════════════════════
// HINTS & SOLUTION
// ═══════════════════════════════════════

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

// Extrait la solution SQL depuis le dernier élément de exercise().hints et l'injecte dans l'éditeur.
// La regex isole la partie SQL (à partir de SELECT/INSERT/etc.) en ignorant le texte introductif.
// Affiche un message invitant à cliquer "Exécuter". Appelée par le bouton "👁 Solution".
function showSol(){
  const hints=exercise().hints;
  const sol=hints[hints.length-1];
  const sqlMatch=sol.match(/((?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|EXPLAIN)[\s\S]+)/i);
  document.getElementById('ed').value=sqlMatch?sqlMatch[1].trim():sol;
  document.getElementById('ra').innerHTML='<div class="rinfo">💡 Solution affichée — cliquez Exécuter pour voir le résultat.</div>';
}

// ═══════════════════════════════════════
// EXECUTE
// ═══════════════════════════════════════

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
    const allExDone=exercises().every((_,i)=>exDone.has(lesson().id+'_'+i));
    if(allExDone) done.add(lesson().id);
    saveProgress();renderSB();
    // Marquer le bouton de l'exercice actif comme complété (✓) sans re-rendre toute la leçon
    const activeBtn=document.querySelector('.ex-btn.active');
    if(activeBtn){activeBtn.classList.add('done');activeBtn.textContent='✓';}
    let html;
    if(columns.length===1&&columns[0]==='message'){
      html=`<div class="rok">${rows[0][0]}</div>`;
    } else {
      html=`<div class="rok">✓ ${rows.length} ligne${rows.length!==1?'s':''} retournée${rows.length!==1?'s':''}</div>`;
      if(rows.length){
        html+=`<div class="twrap"><table class="rt"><thead><tr>${columns.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>`;
        rows.forEach(r=>{html+=`<tr>${r.map(v=>`<td${v===null||v===undefined?' class="nl"':''}>${v===null||v===undefined?'NULL':v}</td>`).join('')}</tr>`;});
        html+=`</tbody></table></div><div class="rcount">${rows.length} ligne${rows.length!==1?'s':''}</div>`;
      }
    }
    document.getElementById('ra').innerHTML=html;
  }catch(e){
    let msg=String(e.message||e).replace(/^Error:\s*/,'').trim();
    let tip='';
    if(/no such table/i.test(msg))  tip='\n💡 Tables disponibles : '+ACTIVE_DOMAIN.schemaDef.map(t=>t.name).join(', ');
    if(/syntax error/i.test(msg))   tip='\n💡 Vérifiez la syntaxe : SELECT colonnes FROM table WHERE condition;';
    if(/no such column/i.test(msg)) tip='\n💡 Vérifiez les noms de colonnes avec 📋 Structure BD';
    document.getElementById('ra').innerHTML=`<div class="rerr">✗ ${msg}${tip}</div>`;
  }
  btn.disabled=false;btn.textContent='▶ Exécuter';
}

// ═══════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════

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

// ═══════════════════════════════════════
// STATS / RADAR
// ═══════════════════════════════════════

// La cartographie des compétences est définie dans le fichier de domaine actif (js/domains/).
// ACTIVE_DOMAIN.skillMap associe chaque catégorie SQL aux IDs de leçons qui la couvrent.

// Calcule le taux de maîtrise (0.0 → 1.0) pour chaque catégorie du domaine actif.
// Retourne un tableau [{cat, pct}] utilisé par renderRadar() pour positionner les points du radar.
function computeSkills(){return Object.entries(ACTIVE_DOMAIN.skillMap).map(([cat,ids])=>({cat,pct:ids.filter(id=>done.has(id)).length/ids.length}));}

// Génère le graphique radar (toile d'araignée) en SVG pur, sans librairie externe.
// Chaque axe représente une catégorie SQL ; la surface verte indique la progression.
// Les labels affichent le nom de la catégorie et le pourcentage ; ils passent au vert à 100%.
// Retourne une chaîne SVG injectée dans #stats-radar par openStats().
function renderRadar(){
  const skills=computeSkills();const N=skills.length;const cx=150,cy=155,r=105;
  const angles=skills.map((_,i)=>(2*Math.PI*i/N)-Math.PI/2);
  const circles=[0.25,0.5,0.75,1.0].map(v=>{const pts=angles.map(a=>`${cx+r*v*Math.cos(a)},${cy+r*v*Math.sin(a)}`).join(' ');return `<polygon points="${pts}" fill="none" stroke="#30363d" stroke-width="1"/>`;}).join('');
  const axes=angles.map(a=>`<line x1="${cx}" y1="${cy}" x2="${cx+r*Math.cos(a)}" y2="${cy+r*Math.sin(a)}" stroke="#30363d" stroke-width="1"/>`).join('');
  const pts=skills.map((s,i)=>`${cx+r*s.pct*Math.cos(angles[i])},${cy+r*s.pct*Math.sin(angles[i])}`).join(' ');
  const poly=`<polygon points="${pts}" fill="rgba(63,185,80,0.15)" stroke="#3fb950" stroke-width="2"/>`;
  const labels=skills.map((s,i)=>{
    const lx=cx+(r+24)*Math.cos(angles[i]);const ly=cy+(r+24)*Math.sin(angles[i]);
    const dx=cx+r*s.pct*Math.cos(angles[i]);const dy=cy+r*s.pct*Math.sin(angles[i]);
    const pct=Math.round(s.pct*100);
    const anchor=Math.cos(angles[i])<-0.1?'end':Math.cos(angles[i])>0.1?'start':'middle';
    return `<circle cx="${dx}" cy="${dy}" r="4" fill="#3fb950"/><text x="${lx}" y="${ly-5}" text-anchor="${anchor}" fill="#8b949e" font-size="10" font-family="'Segoe UI',sans-serif">${s.cat}</text><text x="${lx}" y="${ly+8}" text-anchor="${anchor}" fill="${pct===100?'#3fb950':'#58a6ff'}" font-size="9" font-family="monospace">${pct}%</text>`;
  }).join('');
  return `<svg width="300" height="310" viewBox="0 0 300 310">${circles}${axes}${poly}${labels}</svg>`;
}

// Génère les barres de progression par niveau (Débutant, Intermédiaire, Avancé, Expert)
// et les injecte dans #stats-levels.
// Chaque barre affiche le nombre de leçons terminées sur le total du niveau, avec sa couleur propre.
// Appelée par openStats() à chaque ouverture de la modal pour refléter la progression en cours.
function renderStatsLevels(){
  const colors={d:'#3fb950',i:'#58a6ff',a:'#e3b341',e:'#f0883e'};
  const names={d:'Débutant',i:'Intermédiaire',a:'Avancé',e:'Expert'};
  document.getElementById('stats-levels').innerHTML=Object.entries(ACTIVE_DOMAIN.cur).map(([k,lessons])=>{
    const dc=lessons.filter(l=>done.has(l.id)).length;const pct=Math.round(dc/lessons.length*100);
    return `<div class="stat-level"><div class="stat-level-hd"><span style="color:${colors[k]};font-weight:700">${names[k]}</span><span class="stat-cnt">${dc}/${lessons.length} — ${pct}%</span></div><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%;background:${colors[k]}"></div></div></div>`;
  }).join('');
}

// Ouvre la modal de progression (#stats-modal) et recalcule le radar et les barres
// au moment de l'ouverture pour refléter l'état le plus récent de done.
// Appelée par le bouton "📊 Compétences" dans la topbar.
function openStats(){document.getElementById('stats-modal').classList.add('open');document.getElementById('stats-radar').innerHTML=renderRadar();renderStatsLevels();}

// Ferme la modal de progression en retirant la classe 'open'.
// Appelée par le bouton ✕ dans le header de la modal, ou par un clic sur le fond sombre.
function closeStats(){document.getElementById('stats-modal').classList.remove('open');}

// ═══════════════════════════════════════
// LEXIQUE SQL
// ═══════════════════════════════════════

// Ouvre la modal du lexique et affiche toutes les entrées (filtre vide).
// Appelée par le bouton "📖 Lexique" dans la topbar.
function openLexique(){
  document.getElementById('lex-modal').classList.add('open');
  document.getElementById('lex-q').value='';
  filterLexique('');
}

// Ferme la modal du lexique.
function closeLexique(){document.getElementById('lex-modal').classList.remove('open');}

// Filtre les entrées du LEXIQUE selon le texte tapé (mot-clé, catégorie ou définition).
// Appelée à chaque frappe dans le champ de recherche.
function filterLexique(q){
  if(typeof LEXIQUE==='undefined') return;
  const s=q.toLowerCase().trim();
  const items=s?LEXIQUE.filter(x=>x.kw.toLowerCase().includes(s)||x.cat.toLowerCase().includes(s)||x.simple.toLowerCase().includes(s)):LEXIQUE;
  document.getElementById('lex-grid').innerHTML=items.length?items.map(x=>`
    <div class="lex-item">
      <div class="lex-kw-row"><span class="lex-kw">${x.kw}</span><span class="lex-cat">${x.cat}</span></div>
      <div class="lex-simple">${x.simple}</div>
      <div class="lex-ex">${x.ex}</div>
    </div>`).join(''):'<div style="color:#484f58;font-size:12px;padding:8px">Aucun résultat pour "'+s+'"</div>';
}

// Ferme les modaux ouverts si on clique sur Escape
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLexique();closeStats();}});

// ═══════════════════════════════════════
// SÉLECTEUR DE DOMAINE
// ═══════════════════════════════════════

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
  lvl='d';idx=0;exIdx=0;done=new Set();exDone=new Set();hintC={};queryCache={};
  document.querySelectorAll('.lvl-btn').forEach(b=>b.classList.toggle('active',b.dataset.l==='d'));
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

// ═══════════════════════════════════════
// INIT
// Séquence de démarrage exécutée une fois au chargement de la page.
//
// Ordre :
// 1. loadProgress() — restaure lvl/idx/done depuis localStorage
// 2. renderSB() + renderSchema() — affichage immédiat, ne dépendent pas de SQLite
// 3. Indicateur de chargement dans la zone principale pendant qu'on attend SQL.js
// 4. initDB() — charge le WASM (~1 Mo, 1-2 sec selon connexion) puis crée la base
// 5. renderLesson() — remplace l'indicateur par le contenu réel de la leçon
// ═══════════════════════════════════════
renderDomainBadge();

loadProgress();
renderSchema();
renderSB();
document.getElementById('lb').innerHTML=`
  <div style="display:flex;align-items:center;gap:12px;padding:24px 18px;color:#8b949e;font-family:'Segoe UI',sans-serif;font-size:13px">
    <span style="font-size:22px;animation:spin 1s linear infinite">⏳</span>
    <span>Chargement du moteur SQL (SQLite)…</span>
  </div>`;
initDB()
  .then(()=>renderLesson())
  .catch(e=>{
    document.getElementById('lb').innerHTML=`<div class="rerr" style="margin:16px">✗ Impossible de charger SQL.js : ${e.message}<br><br>Vérifiez votre connexion internet, puis rechargez la page.</div>`;
  });
