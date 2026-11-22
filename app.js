/* Sonata MVP — aplicación PWA local, sin backend ni cobros. */
(() => {
  'use strict';
  const STORE_KEY = 'sonata_mvp_v1';
  const NOTE_ORDER = ['Do','Re','Mi','Fa','Sol','La','Si','Do5','Re5','Mi5','Fa5','Sol5'];
  const NOTES = {Do:261.63, Re:293.66, Mi:329.63, Fa:349.23, Sol:392.00, La:440, Si:493.88, Do5:523.25, Re5:587.33, Mi5:659.25, Fa5:698.46, Sol5:783.99};
  // Naming follows international letter names: C D E F G A B C.
  const LETTER = {Do:'C',Re:'D',Mi:'E',Fa:'F',Sol:'G',La:'A',Si:'B',Do5:'C',Re5:'D',Mi5:'E',Fa5:'F',Sol5:'G'};
  const STAFF_LINES = [34,48,62,76,90];
  const STAFF_Y = {Do:104,Re:97,Mi:90,Fa:83,Sol:76,La:69,Si:62,Do5:55,Re5:48,Mi5:41,Fa5:34,Sol5:27};
  const prettyName = note => `${LETTER[note]} · ${note.endsWith('5')?note.replace('5',' agudo'):note}`;
  // Ledger lines sit a full staff-space outside the staff. C4 is on the first ledger below.
  // D4 and G5 sit in the spaces immediately outside the staff, so they do not take a ledger.
  function ledgerLines(y, x1, x2){
    const gap=14, top=STAFF_LINES[0], bottom=STAFF_LINES[STAFF_LINES.length-1], ys=[];
    for(let ly=bottom+gap; ly<=y+3; ly+=gap) ys.push(ly);
    for(let ly=top-gap; ly>=y-3; ly-=gap) ys.push(ly);
    return ys.map(ly=>`<line x1="${x1}" y1="${ly}" x2="${x2}" y2="${ly}" stroke="#7795a7" stroke-width="1.8"/>`).join('');
  }
  function staffDrawing(note){
    const y=STAFF_Y[note];
    const lines=STAFF_LINES.map(pos=>`<line x1="24" y1="${pos}" x2="336" y2="${pos}" stroke="#a9bfcc" stroke-width="1.5"/>`).join('');
    const up=y>62, sx=up?198:174, y1=up?y-2:y+2, y2=up?y-44:y+44;
    return `<svg class="music-staff-svg" viewBox="0 0 360 130" role="img" aria-label="Partitura en clave de sol: nota ${prettyName(note)}">
      ${lines}${ledgerLines(y,166,210)}<text x="35" y="88" font-size="63" font-family="Georgia,serif" fill="#50758c">𝄞</text>
      <ellipse cx="186" cy="${y}" rx="13" ry="9" transform="rotate(-18 186 ${y})" fill="#1686d9"/>
      <line x1="${sx}" y1="${y1}" x2="${sx}" y2="${y2}" stroke="#1686d9" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }
  const LESSONS = [
    {id:'l1',unit:1,title:'Conoce el piano',subtitle:'Las teclas blancas',emoji:'🎹',notes:['Do','Re','Mi','Do'],xp:50,tip:'Comienza por la tecla Do; la tecla se ilumina cuando aciertas.'},
    {id:'l2',unit:1,title:'Tus primeras notas',subtitle:'Do, Re y Mi',emoji:'♫',notes:['Do','Re','Mi','Mi','Re','Do'],xp:60,tip:'Toca cada nota en el orden indicado.'},
    {id:'l3',unit:1,title:'Encuentra el Do',subtitle:'Aprende a orientarte',emoji:'🎼',notes:['Do','Sol','Do','Mi','Do','Do'],xp:70,tip:'El Do está justo antes de dos teclas negras.'},
    {id:'l4',unit:1,title:'El primer ritmo',subtitle:'Practica una secuencia',emoji:'🥁',notes:['Do','Do','Re','Re','Mi','Re','Do'],xp:80,tip:'Primero la precisión; el ritmo exacto llegará más adelante.'},
    {id:'l5',unit:1,title:'Tu primera melodía',subtitle:'¡Completa la unidad!',emoji:'⭐',notes:['Do','Re','Mi','Sol','Mi','Re','Do','Do'],xp:100,tip:'Junta todo lo que ya has practicado.'},
    {id:'l6',unit:2,title:'Mano derecha',subtitle:'Nuevas combinaciones',emoji:'✋',notes:['Mi','Fa','Sol','La','Sol','Fa','Mi'],xp:120,tip:'Un paso más: practica usando varios dedos.'},
    {id:'l7',unit:2,title:'Melodías intermedias',subtitle:'Más notas, más música',emoji:'🎶',notes:['Do','Mi','Sol','La','Sol','Mi','Re','Do'],xp:135,tip:'Escucha cada nota y tócalas en orden.'},
    {id:'l8',unit:2,title:'Concierto Sonata',subtitle:'Reto de fin de unidad',emoji:'🏆',notes:['Do','Re','Mi','Fa','Sol','La','Sol','Fa','Mi','Re','Do'],xp:160,tip:'Tu concierto final de esta primera versión.'}
  ];
  const SONGS = [
    {id:'s1',title:'Paseo de Do',emoji:'🌿',desc:'Melodía original · Fácil',premium:false,notes:['Do','Re','Mi','Sol','Mi','Re','Do']},
    {id:'s2',title:'Brisa azul',emoji:'☁️',desc:'Melodía original · Fácil',premium:false,notes:['Mi','Sol','La','Sol','Mi','Re','Do']},
    {id:'birthday',title:'Cumpleaños feliz',emoji:'🎂',desc:'Melodía tradicional · Fácil · Letras G A B C D E F',premium:false,notes:['Sol','Sol','La','Sol','Do5','Si','Sol','Sol','La','Sol','Re5','Do5','Sol','Sol','Sol5','Mi5','Do5','Si','La','Fa5','Fa5','Mi5','Do5','Re5','Do5'],keyboard:'birthday'},
    {id:'s3',title:'Camino al sol',emoji:'🌅',desc:'Melodía original · Intermedio',premium:true,notes:['Do','Mi','Fa','Sol','La','Do5','La','Sol','Mi']},
    {id:'s4',title:'Estrellas Sonata',emoji:'✨',desc:'Melodía original · Intermedio',premium:true,notes:['Sol','La','Si','Do5','Si','La','Sol','Mi','Do']}
  ];
  const CHESTS = [
    {id:'common',name:'Común',emoji:'🧰',requires:1,xp:[20,35],coins:[10,20],desc:'Un comienzo lleno de música.'},
    {id:'rare',name:'Raro',emoji:'🩵',requires:2,xp:[35,65],coins:[25,40],desc:'Por tus primeras grandes mejoras.'},
    {id:'epic',name:'Épico',emoji:'💜',requires:4,xp:[70,110],coins:[45,75],desc:'Para pianistas perseverantes.'},
    {id:'legendary',name:'Legendario',emoji:'👑',requires:6,xp:[120,170],coins:[85,130],desc:'Una recompensa extraordinaria.'},
    {id:'mythic',name:'Mítico',emoji:'💎',requires:8,xp:[200,300],coins:[160,230],desc:'El tesoro más especial de Sonata.'}
  ];
  const SKINS = [
    {id:'classic',name:'Clásico',emoji:'🎹',price:0,desc:'El aspecto original de Sonata.',color:'#1686d9'},
    {id:'mint',name:'Menta',emoji:'🍃',price:250,days:3,desc:'Teclas suaves en verde agua.',color:'#3bbca5'},
    {id:'sunset',name:'Atardecer',emoji:'🌇',price:450,days:5,desc:'Un piano cálido coral y melocotón.',color:'#eb8c76'},
    {id:'night',name:'Noche',emoji:'🌙',price:900,days:12,desc:'Teclado oscuro con detalles azules.',color:'#394b79'},
    {id:'galaxy',name:'Galaxia',emoji:'🌌',price:1300,days:18,desc:'Violetas y estrellas para tu piano.',color:'#926ad3'},
    {id:'gold',name:'Dorado',emoji:'👑',price:1700,days:24,desc:'El teclado más brillante de Sonata.',color:'#c59a35'},
    {id:'ocean',name:'Océano',emoji:'🐬',price:1000,days:14,desc:'Azules profundos y espuma del mar.',color:'#227aab'},
    {id:'rainbow',name:'Arcoíris',emoji:'🌈',price:1500,days:21,desc:'Un teclado lleno de color.',color:'#b372d9'}
  ];
  // Las misiones cuentan ejercicios COMPLETADOS, nunca visitas o aperturas de la app.
  const MISSIONS = [
    {id:'d1',period:'daily',icon:'🎹',name:'Un ratito de piano',detail:'Completa una lección o una canción hoy.',metric:'activities',goal:1,reward:15},
    {id:'d2',period:'daily',icon:'🎵',name:'Doble práctica',detail:'Completa dos ejercicios hoy.',metric:'activities',goal:2,reward:25},
    {id:'d3',period:'daily',icon:'🎂',name:'Momento musical',detail:'Termina una canción hoy.',metric:'songs',goal:1,reward:20},
    {id:'w1',period:'weekly',icon:'🔥',name:'Tres días de música',detail:'Practica en tres días diferentes esta semana.',metric:'days',goal:3,reward:75},
    {id:'w2',period:'weekly',icon:'🏅',name:'Superpianista',detail:'Completa cinco ejercicios esta semana.',metric:'activities',goal:5,reward:90},
    {id:'w3',period:'weekly',icon:'🎶',name:'Amante de las canciones',detail:'Termina tres canciones esta semana.',metric:'songs',goal:3,reward:65}
  ];
  const ACHIEVEMENTS = [
    {id:'first',icon:'🎹',name:'Primera nota',detail:'Completa tu primera lección.',earned:()=>completedCount()>=1},
    {id:'three',icon:'🎼',name:'Buen comienzo',detail:'Completa 3 lecciones.',earned:()=>completedCount()>=3},
    {id:'five',icon:'🏆',name:'Melodista',detail:'Completa 5 lecciones.',earned:()=>completedCount()>=5},
    {id:'perfect',icon:'🌟',name:'Tres estrellas',detail:'Consigue tres estrellas en una lección.',earned:()=>Object.values(state.completed).some(x=>x.stars===3)},
    {id:'song',icon:'🎂',name:'Mi primera canción',detail:'Termina una canción.',earned:()=>Object.keys(state.songScores).length>=1},
    {id:'collector',icon:'🎁',name:'Buscatesoros',detail:'Abre tu primer cofre.',earned:()=>Object.keys(state.chests).length>=1},
    {id:'fashion',icon:'🛍️',name:'Coleccionista',detail:'Compra una skin en la tienda.',earned:()=>state.ownedSkins.some(id=>id!=='classic')},
    {id:'master',icon:'💎',name:'Gran pianista',detail:'Completa las 8 lecciones.',earned:()=>completedCount()>=8}
  ];
  const defaultState = () => ({xp:0,coins:0,completed:{},chests:{},songScores:{},ownedSkins:['classic'],equippedSkin:'classic',equippedBadge:'',email:'',invites:[],lastDay:'',streak:0,practiceDays:[],dailyCoinDate:'',missionStats:{daily:{},weekly:{}},claimedMissions:{},micChoice:'unknown',centsTolerance:45,micDebug:false});
  function normalizeOwnedSkins(list){
    const ids=[];
    const add=id=>{if(SKINS.some(skin=>skin.id===id)&&!ids.includes(id))ids.push(id);};
    add('classic');
    if(Array.isArray(list))list.forEach(add);
    return ids;
  }
  function loadState(){
    try {
      const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
      if(!saved||typeof saved!=='object')return defaultState();
      return {...defaultState(),...saved,completed:saved.completed||{},chests:saved.chests||{},songScores:saved.songScores||{},invites:Array.isArray(saved.invites)?saved.invites:[],practiceDays:Array.isArray(saved.practiceDays)?saved.practiceDays:[],missionStats:saved.missionStats&&typeof saved.missionStats==='object'?{daily:saved.missionStats.daily||{},weekly:saved.missionStats.weekly||{}}:{daily:{},weekly:{}},claimedMissions:saved.claimedMissions&&typeof saved.claimedMissions==='object'?saved.claimedMissions:{},ownedSkins:normalizeOwnedSkins(saved.ownedSkins),equippedSkin:SKINS.some(s=>s.id===saved.equippedSkin)?saved.equippedSkin:'classic',micChoice:['granted','denied','skipped','unknown'].includes(saved.micChoice)?saved.micChoice:'unknown',centsTolerance:Math.min(80,Math.max(20,Number(saved.centsTolerance)||45)),micDebug:saved.micDebug===true};
    } catch {return defaultState()}
  }
  let state=loadState();
  function storedSkinsNeedCleanup(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
      return !!saved && JSON.stringify(saved.ownedSkins)!==JSON.stringify(state.ownedSkins);
    }catch{return false}
  }
  let route='home',activity=null,audioContext=null,micStream=null,micContext=null,micSource=null,micNode=null,micRaf=null,micTracker=null,ignoreMicUntil=0;
  let midiInput=null,midiAccess=null,toastTimeout,feedbackTimer=null,demoTimer=null;
  const main=document.getElementById('mainContent');
  const clean = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value||'').trim().toLowerCase();
  const completedCount = () => LESSONS.filter(l=>state.completed[l.id]).length;
  const premiumAccess = () => false;
  const isLocked = lesson => lesson.unit>1 && !premiumAccess();
  const songLocked = song => song.premium && !premiumAccess();
  const isAvailable = index => index===0 || !!state.completed[LESSONS[index-1].id];
  const dailyKey = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const practiceDayCount = () => (Array.isArray(state.practiceDays)?new Set(state.practiceDays).size:0);
  // Semana ISO local: lunes como primer día, con fechas YYYY-MM-DD.
  function weekKey(date=new Date()){
    const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
    d.setDate(d.getDate()-((d.getDay()+6)%7));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function missionBucket(period){
    const key=period==='daily'?dailyKey():weekKey();
    const entries=state.missionStats[period];
    if(!entries[key])entries[key]={activities:0,songs:0,days:[]};
    return {key,stats:entries[key]};
  }
  function missionCount(mission){
    const {stats}=missionBucket(mission.period);
    return mission.metric==='days'?new Set(stats.days||[]).size:Number(stats[mission.metric]||0);
  }
  function missionClaimKey(mission){return `${mission.period}:${mission.period==='daily'?dailyKey():weekKey()}:${mission.id}`;}
  function missionIsClaimed(mission){return !!state.claimedMissions[missionClaimKey(mission)];}
  function trackMissionProgress(type){
    const today=dailyKey();
    for(const period of ['daily','weekly']){
      const {stats}=missionBucket(period);
      stats.activities=(stats.activities||0)+1;
      if(type==='song')stats.songs=(stats.songs||0)+1;
      if(!Array.isArray(stats.days))stats.days=[];
      if(!stats.days.includes(today))stats.days.push(today);
    }
    // El historial de periodos anteriores no hace falta para calcular misiones futuras.
    for(const period of ['daily','weekly']){
      const key=period==='daily'?today:weekKey();
      const periods=Object.keys(state.missionStats[period]).sort();
      for(const old of periods.slice(0,-8))if(old!==key)delete state.missionStats[period][old];
    }
  }
  function claimMission(id){
    const m=MISSIONS.find(x=>x.id===id);if(!m)return;
    if(missionIsClaimed(m)){toast('Esta recompensa ya está reclamada.');return}
    if(missionCount(m)<m.goal){toast('Completa la misión antes de reclamar el premio.');return}
    state.claimedMissions[missionClaimKey(m)]=true;
    state.coins+=m.reward;save();navigate('missions');toast(`¡Misión completada! +${m.reward} monedas`,true);
  }
  function missionCard(m){
    const count=Math.min(m.goal,missionCount(m)),claimed=missionIsClaimed(m),ready=count>=m.goal;
    return `<article class="mission-card ${ready?'mission-ready':''}">
      <div class="mission-symbol" aria-hidden="true">${m.icon}</div>
      <div class="mission-body"><h3>${clean(m.name)}</h3><p>${clean(m.detail)}</p>
      <div class="mission-progress" role="progressbar" aria-label="Progreso de ${clean(m.name)}" aria-valuemin="0" aria-valuemax="${m.goal}" aria-valuenow="${count}"><span style="width:${Math.round(count/m.goal*100)}%"></span></div>
      <small>${count} de ${m.goal}</small></div>
      <div class="mission-prize"><b class="coin-price">${coinIcon(16)}<span>${m.reward}</span></b><button class="btn ${claimed?'secondary':''}" data-claim-mission="${m.id}" ${(!ready||claimed)?'disabled':''}>${claimed?'✓ RECLAMADA':ready?'RECLAMAR':'EN CURSO'}</button></div>
    </article>`;
  }
  function missions(){
    const today=dailyKey(),monday=weekKey();
    const doneToday=state.practiceDays.includes(today);
    const ready=MISSIONS.filter(m=>missionCount(m)>=m.goal&&!missionIsClaimed(m)).length;
    return `${heading('Misiones musicales','Practica cada día y consigue monedas para tus skins.',coinPill())}
      <div class="mission-banner"><div><div class="eyebrow">TU OBJETIVO DE HOY</div><h2>${doneToday?'¡Ya has practicado hoy! 🎉':'¡Empieza tu práctica! 🎹'}</h2><p>Las misiones avanzan al terminar una lección o canción. No necesitas acertar todo a la primera.</p></div><div class="mission-flame">🔥<b>${state.streak}</b><small>racha</small></div></div>
      ${ready?`<div class="mission-ready-notice">🎉 ¡Tienes ${ready} ${ready===1?'premio listo':'premios listos'} para reclamar!</div>`:''}
      <div class="mission-section-title"><h2>☀️ Misiones diarias</h2><small>Reinician cada día · ${today}</small></div>
      <div class="mission-list">${MISSIONS.filter(m=>m.period==='daily').map(missionCard).join('')}</div>
      <div class="mission-section-title"><h2>📅 Misiones semanales</h2><small>Semana desde el lunes ${monday}</small></div>
      <div class="mission-list">${MISSIONS.filter(m=>m.period==='weekly').map(missionCard).join('')}</div>
      <div class="mission-help">💡 Completar una actividad también cuenta para tu racha y para el desbloqueo por días de práctica de la tienda. Cada misión solo da monedas una vez por periodo. Los premios no tienen valor monetario real.</div>
      <button class="btn" data-nav="path">IR A PRACTICAR →</button>`;
  }

  let coinSerial=0;
  function coinIcon(size){
    const px=Number(size)||18;
    const id='sc'+(++coinSerial);
    return `<svg class="gold-coin" width="${px}" height="${px}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><defs><radialGradient id="${id}f" cx="36%" cy="30%" r="72%"><stop offset="0" stop-color="#FFE27A"/><stop offset=".58" stop-color="#F5B800"/><stop offset="1" stop-color="#B8860B"/></radialGradient><linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".45" stop-color="#F5B800"/><stop offset="1" stop-color="#8C6210"/></linearGradient><g id="${id}n"><ellipse cx="12.6" cy="20.5" rx="4.5" ry="3.05" transform="rotate(-28 12.6 20.5)"/><rect x="15.55" y="8.7" width="2.7" height="12.2" rx=".5"/><path d="M18.15 8.75c3.1-.35 5.55 1.15 5.7 3.15.12 1.35-.85 2.35-2.15 2.15-1.85-.28-3.15-1.7-3.45-3.15-.08-.4-.1-.85-.1-1.25V8.9c0-.05 0-.1 0-.15z"/></g></defs><ellipse cx="16" cy="18.4" rx="12.2" ry="3.1" fill="#6A4A08" opacity=".35"/><circle cx="16" cy="16" r="14" fill="url(#${id}e)"/><circle cx="16" cy="16" r="11.6" fill="url(#${id}f)" stroke="#8A620C" stroke-width=".9"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#FFE7A6" stroke-width=".75" opacity=".9"/><circle cx="16" cy="16" r="8.7" fill="none" stroke="#A06C10" stroke-width=".45"/><ellipse cx="11.2" cy="11" rx="4.6" ry="2.6" fill="#fff" opacity=".42"/><use href="#${id}n" xlink:href="#${id}n" fill="#FFF4C8" x="-0.6" y="-0.7"/><use href="#${id}n" xlink:href="#${id}n" fill="#8B6508"/></svg>`;
  }
  function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch(e){console.warn('No se pudo guardar progreso',e)}syncHeader()}
  function syncHeader(){
    document.getElementById('topXP').textContent=state.xp;
    const coinValue=document.getElementById('topCoinsValue');
    if(coinValue) coinValue.textContent=String(state.coins);
    const coinLabel=document.getElementById('topCoinsLabel');
    const coinLabelText=`${state.coins} monedas`;
    if(coinLabel&&coinLabel.dataset.source!==coinLabelText){coinLabel.dataset.source=coinLabelText;coinLabel.textContent=coinLabelText;}
    const coinSlot=document.getElementById('topCoinSlot');
    if(coinSlot&&!coinSlot.querySelector('svg')) coinSlot.innerHTML=coinIcon(18);
    const earned=ACHIEVEMENTS.find(a=>a.id===state.equippedBadge && a.earned());
    document.querySelector('.top-avatar').innerHTML=`<span>${clean((state.email[0]||'P').toUpperCase())}</span>${earned?`<span class="avatar-badge" aria-hidden="true">${earned.icon}</span>`:''}`;
    document.documentElement.dataset.skin=state.equippedSkin||'classic';
  }
  function coinPill(){return `${coinIcon(16)}<span>${state.coins} MONEDAS</span>`}
  function toast(message,withCoin){
    const node=document.getElementById('toast');
    if(withCoin) node.innerHTML=`${coinIcon(16)}<span>${message}</span>`;
    else node.textContent=message;
    node.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout=setTimeout(()=>node.classList.remove('show'),2500);
  }
  function progressBar(){return `<div class="lesson-progress" aria-label="Progreso del curso"><span style="width:${completedCount()/LESSONS.length*100}%"></span></div>`}
  function heading(title,subtitle='',pill=''){return `<header class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div>${pill?`<span class="pill">${pill}</span>`:''}</header>`}
  function section(title,action='',target=''){return `<div class="section-heading"><h2>${title}</h2>${action?`<button class="text-action" data-nav="${target}"><span>${action}</span><span aria-hidden="true"> ›</span></button>`:''}</div>`}
  function home(){
    const nextIndex=LESSONS.findIndex(l=>!state.completed[l.id]);const i=nextIndex<0?LESSONS.length-1:nextIndex,l=LESSONS[i],finish=completedCount();
    const preview=LESSONS.slice(0,5).map((x,j)=>`<div class="mini-step ${state.completed[x.id]?'done':j===i?'current':''}"><i>${state.completed[x.id]?'✓':x.emoji}</i><b>${clean(x.title)}</b><small>${state.completed[x.id]?'Completada':j===i?'Siguiente':''}</small></div>`).join('');
    const nextChest=CHESTS.find(c=>!state.chests[c.id]);
    const chestLessonsLeft=nextChest?Math.max(0,nextChest.requires-finish):0;
    return `${heading(`¡Hola${state.email?' de nuevo':''}! 👋`,'Tu próxima sesión de piano empieza aquí.', '🎹 APRENDE A TU RITMO')}
      ${section('Continuar aprendiendo','Ver curso','path')}
      <section class="hero"><div class="hero-art"><div class="sheet"><span>♫</span></div></div><div class="hero-copy"><div class="eyebrow">UNIDAD ${l.unit} · ${l.unit===1?'FUNDAMENTOS':'NIVEL INTERMEDIO'}</div><h2>${clean(l.title)}</h2><p><span>${clean(l.subtitle)}</span>. <span>Practica nota a nota y consigue estrellas.</span></p><button class="btn" data-lesson="${l.id}">${isLocked(l)?'VER SONATA COMPLETO':finish===LESSONS.length?'REPETIR LECCIÓN':'CONTINUAR →'}</button></div></section>
      <section class="stats"><div class="stat"><div class="s-icon">✦</div><div><b>${state.xp} XP</b><small>Experiencia</small></div></div><div class="stat"><div class="s-icon">🔥</div><div><b>${state.streak} ${state.streak===1?'día':'días'}</b><small>Racha de práctica</small></div></div><div class="stat"><div class="s-icon">🎵</div><div><b>${finish} de ${LESSONS.length}</b><small>Lecciones</small></div></div></section>
      ${section('Misiones de hoy','Ver todas','missions')}
      <div class="mission-home-card"><span class="mission-home-icon">🎯</span><div><b>${MISSIONS.filter(m=>missionCount(m)>=m.goal&&!missionIsClaimed(m)).length?'¡Tienes recompensas disponibles!':'Practica y gana monedas extra'}</b><p>Misiones diarias, semanales y rachas. Completa ejercicios para conseguir skins.</p></div><button class="btn" data-nav="missions">Misiones</button></div>
      ${section('Tu camino musical','Ver lecciones','path')}
      <button class="card path-preview" data-nav="path"><div class="eyebrow">UNIDAD 1 · FUNDAMENTOS</div><div class="mini-track">${preview}</div></button>
      ${section('Tienda de skins','Ver tienda','shop')}
      <div class="reward-banner"><span class="emoji">🛍️</span><div><b>Personaliza tu piano</b><p>Consigue monedas abriendo cofres y cambia los colores de tu teclado.</p></div><button class="btn" data-nav="shop">TIENDA</button></div>
      ${section('Tus recompensas','Ver cofres','rewards')}
      <div class="reward-banner"><span class="emoji">🎁</span><div><b>${nextChest?`Próximo cofre: ${nextChest.name}`:'¡Todos los cofres conseguidos!'}</b><p>${nextChest?`Completa ${chestLessonsLeft} ${chestLessonsLeft===1?'lección':'lecciones'} más para desbloquearlo.`:'Has abierto toda la colección actual.'}</p></div><button class="btn gold" data-nav="rewards">COFRES</button></div>`;
  }
  function lessonRow(l,i){
    const done=state.completed[l.id],locked=isLocked(l),available=isAvailable(i),disabled=!locked&&!available;
    let label=locked?'10 € · PREMIUM':done?'REPETIR':available?'EMPEZAR':'BLOQUEADO';
    return `<article class="lesson-row ${done?'completed':''} ${available&&!done&&!locked?'current':''} ${locked?'premium-row':''}"><div class="lesson-symbol">${done?'✅':locked?'🔒':l.emoji}</div><div class="lesson-copy"><b>${clean(l.title)}</b><small><span>${clean(l.subtitle)}</span> · <span>${l.notes.length} notas</span></small>${done?`<div class="mini-stars">${'★'.repeat(done.stars)}${'☆'.repeat(3-done.stars)}</div>`:''}</div><button class="btn ${done||disabled?'secondary':''}" ${disabled?'disabled':''} data-lesson="${l.id}">${label}</button></article>`;
  }
  function path(){return `${heading('Tu camino musical','Aprende con ejercicios cortos y ve desbloqueando el siguiente paso.',`${completedCount()}/${LESSONS.length} LECCIONES`)}
    <div class="path-intro"><div><div class="eyebrow">TU PRIMER GRAN PASO</div><h2>Fundamentos del piano</h2><p>Una nota cada vez. ¡Haz que tu piano suene!</p></div><span class="big-note">🎹</span></div>
    <div class="unit-title">UNIDAD 1 · PRINCIPIANTE · GRATIS</div><div class="lesson-list">${LESSONS.slice(0,5).map((l,i)=>lessonRow(l,i)).join('')}</div>
    <div class="unit-title">UNIDAD 2 · INTERMEDIO · ${premiumAccess()?'ACCESO ESPECIAL':'SONATA COMPLETO'}</div><div class="lesson-list">${LESSONS.slice(5).map((l,i)=>lessonRow(l,i+5)).join('')}</div>
    <div class="notice">🎯 Las notas se verifican usando el teclado en pantalla, un piano MIDI compatible o el micrófono experimental. Las canciones del curso intermedio forman parte de Sonata Completo.</div>`}
  function songs(){return `${heading('Canciones','Melodías originales para practicar a tu ritmo.',`${SONGS.length} CANCIONES`)}<div class="song-grid">${SONGS.map(s=>`<article class="song-card"><div class="song-art">${s.emoji}</div><div class="song-details"><h3><span>${clean(s.title)}</span>${songLocked(s)?'<span aria-hidden="true"> 🔒</span>':''}</h3><p><span>${s.desc}</span>${state.songScores[s.id]?`<span> · ${'★'.repeat(state.songScores[s.id])}</span>`:''}</p><button class="btn ${songLocked(s)?'secondary':''}" data-song="${s.id}">${songLocked(s)?'SONATA COMPLETO · 10 €':'TOCAR →'}</button></div></article>`).join('')}</div>`}
  const CHEST_COLORS={common:['#a4b2bd','#7b8997','#536778'],rare:['#7ed1ff','#3998d9','#1b649e'],epic:['#d0a1ff','#9960d6','#603698'],legendary:['#ffdf78','#e4a42e','#ae6f17'],mythic:['#ffafdc','#e75da4','#963e9a']};
  function chestSvg(c,suffix=''){
    const [light,mid,dark]=CHEST_COLORS[c.id],uid='grad-'+c.id+suffix;
    return `<svg viewBox="0 0 130 116" width="115" height="100" role="img" aria-label="Cofre ${c.name}"><defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></linearGradient></defs><ellipse cx="65" cy="104" rx="47" ry="8" fill="#3c5560" opacity=".13"/><path d="M22 48 L34 18 Q65 4 96 18 L108 48 Z" fill="url(#${uid})" stroke="${dark}" stroke-width="5" stroke-linejoin="round"/><path d="M21 50 H109 V91 Q109 99 101 99 H29 Q21 99 21 91 Z" fill="url(#${uid})" stroke="${dark}" stroke-width="5"/><path d="M32 21 L38 47 M98 21 L92 47" stroke="${dark}" stroke-width="9" opacity=".73"/><path d="M36 53 V94 M94 53 V94" stroke="${dark}" stroke-width="10" opacity=".7"/><path d="M22 52 H108" stroke="#fff" stroke-width="5" opacity=".65"/><rect x="54" y="45" width="22" height="24" rx="5" fill="#fff1b7" stroke="${dark}" stroke-width="3"/><circle cx="65" cy="56" r="4" fill="${dark}"/><path d="M10 23 l4 -9 4 9 9 4 -9 4 -4 9 -4 -9 -9 -4z" fill="${light}"/><path d="M110 12 l3 -6 3 6 6 3 -6 3 -3 6 -3 -6 -6 -3z" fill="${mid}"/></svg>`;
  }
  function chestCard(c){const opened=state.chests[c.id],unlocked=completedCount()>=c.requires;
    return `<article class="chest-card ${c.id}"><div class="chest-rarity">${clean(c.name)}</div><div class="chest-visual">${opened?'🏆':chestSvg(c)}</div><h3>Cofre ${clean(c.name.toLowerCase())}</h3><p>${clean(c.desc)}</p><div class="meta">${opened?`<span>Conseguiste ${opened.xp} XP y ${opened.coins} monedas</span> ${coinIcon(14)}`:`Se desbloquea al completar ${c.requires} ${c.requires===1?'lección':'lecciones'}`}</div><button class="btn" data-chest="${c.id}" ${(!unlocked||opened)?'disabled':''}>${opened?'✓ ABIERTO':unlocked?'ABRIR COFRE':'🔒 AÚN BLOQUEADO'}</button></article>`}
  function rewards(){return `${heading('Tus cofres','Cuanto más aprendes, mejores recompensas consigues.',coinPill())}<div class="path-intro"><div><div class="eyebrow">RECOMPENSAS SONATA</div><h2>¡Toca, aprende y descubre!</h2><p>Hay cinco rarezas. Los cofres se abren una sola vez en este MVP y los premios se guardan en tu dispositivo.</p></div><span class="big-note">🎁</span></div><button class="btn secondary" data-nav="missions" style="margin:0 0 14px">🎯 VER MISIONES Y GANAR MONEDAS</button>${section('Colección de cofres')}<div class="chest-grid">${CHESTS.map(chestCard).join('')}</div><p class="footer-note">Los cofres no contienen compras, dinero real ni acceso Premium.</p>`}
  function skinPreview(skin){return `<div class="skin-preview ${skin.id}" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><i></i><i></i><i></i></div>`}
  function shop(){return `${heading('Tienda de Sonata','Compra aspectos con monedas ganadas jugando.',coinPill())}
    <div class="path-intro"><div><div class="eyebrow">PERSONALIZA TU PIANO</div><h2>¡Dale estilo a tu música!</h2><p>Las skins cambian el aspecto del teclado de práctica. No afectan a los aciertos ni desbloquean contenido Premium. Gana 40 monedas por el primer ejercicio completado de cada día.</p></div><span class="big-note">🛍️</span></div>
    <div class="skin-grid">${SKINS.map(s=>{const owned=state.ownedSkins.includes(s.id),equipped=state.equippedSkin===s.id,daysNeeded=s.days||0,daysLeft=Math.max(0,daysNeeded-practiceDayCount()),canBuy=state.coins>=s.price&&daysLeft===0;return `<article class="skin-card"><div class="skin-title"><span>${s.emoji}</span><b>${clean(s.name)}</b></div>${skinPreview(s)}<p>${clean(s.desc)}</p><p class="skin-requirement">${!owned&&daysLeft?`🔒 Faltan ${daysLeft} días de práctica`:owned?'✓ Ya es tuya':`Disponible desde ${daysNeeded} días de práctica`}</p><button class="btn ${equipped?'secondary':''}" data-skin-action="${s.id}" ${(!owned&&!canBuy)?'disabled':''}>${equipped?'✓ EQUIPADA':owned?'EQUIPAR':`${coinIcon(14)}<span>${daysLeft?`${s.price} · ${daysNeeded} DÍAS`:`${s.price} · COMPRAR`}</span>`}</button></article>`}).join('')}</div>
    ${section('Insignias de logros')}<p class="achievement-intro">Desbloquea medallas por aprender. Elige una insignia conseguida para mostrarla en tu avatar.</p>${achievementCards()}
    <p class="footer-note">Las monedas son ficticias, no se compran con dinero real y los objetos se guardan en este dispositivo.</p>`}
  function achievementCards(){
    const earned=ACHIEVEMENTS.filter(a=>a.earned()).length;
    return `<div class="achievement-summary">🏅 ${earned} de ${ACHIEVEMENTS.length} insignias desbloqueadas · Se ganan jugando y no cuestan monedas.</div>
      <div class="achievement-grid">${ACHIEVEMENTS.map(a=>{
        const unlocked=a.earned(),equipped=unlocked&&state.equippedBadge===a.id;
        return `<article class="achievement-card ${unlocked?'earned':'unearned'}"><div class="achievement-icon">${unlocked?a.icon:'🔒'}</div>
          <b>${clean(a.name)}</b><p>${clean(a.detail)}</p>
          <button class="btn ${equipped?'secondary':''}" data-badge-equip="${a.id}" ${unlocked?'':'disabled'}>${equipped?'✓ EN TU PERFIL':unlocked?'MOSTRAR EN PERFIL':'POR CONSEGUIR'}</button></article>`;
      }).join('')}</div>`;
  }
  function profile(){return `${heading('Tu perfil','Tu progreso y los ajustes de Sonata.')}<div class="profile-card"><h2>👤 Tu cuenta (modo prueba)</h2><p>Escribe un correo para simular una cuenta. No se envía ningún mensaje ni se verifica la propiedad de la dirección: todavía no hay inicio de sesión real. El correo no desbloquea lecciones ni canciones.</p><form id="emailForm" class="field-row"><input type="email" id="emailInput" required autocomplete="email" placeholder="tu@email.com" value="${clean(state.email)}" aria-label="Correo de cuenta"><button class="btn" type="submit">GUARDAR</button></form><span class="badge">Plan principiante · Gratis</span></div>
      <div class="profile-card"><h2>📊 Tus estadísticas</h2><p><strong>${completedCount()}</strong> <span>lecciones completas</span> · <strong>${state.xp}</strong> XP · <strong>${state.coins}</strong> ${coinIcon(14)} <span>monedas</span> · <strong>${Object.keys(state.chests).length}</strong> <span>cofres abiertos</span></p><button class="btn secondary" data-nav="path">VER CAMINO MUSICAL</button> <button class="btn secondary" data-nav="shop">🛍️ TIENDA DE SKINS</button> <button class="btn secondary" data-nav="missions">🎯 Misiones</button></div>
      <div class="profile-card"><h2>🏅 Tus insignias</h2><p>Elige una insignia ganada para lucirla en tu perfil.</p>${achievementCards()}</div>
      <div class="profile-card"><h2>🎤 Micrófono</h2><p>Tolerancia de afinación. Un valor más alto acepta pianos un poco desafinados.</p><label class="cents-label"><span>Tolerancia</span> <b id="centsRead">${state.centsTolerance||45}</b> cents</label><input id="centsTolerance" type="range" min="20" max="80" step="5" value="${state.centsTolerance||45}" aria-label="Tolerancia en cents"><label class="debug-label"><input id="micDebug" type="checkbox" ${state.micDebug?'checked':''}><span>Mostrar frecuencia y confianza</span></label></div>
      <div class="profile-card"><h2>⚙️ Pruebas</h2><p>Se guardan tus datos con el almacenamiento de este navegador. Si borras los datos del sitio, se perderá el progreso.</p><button class="btn ghost" id="resetProgress">BORRAR PROGRESO DE PRUEBA</button></div>
      <p class="footer-note">MVP de evaluación. Sin cuentas verificadas, pagos operativos ni sincronización entre dispositivos.</p>`}
  function paywall(){return `${heading('Sonata Completo','El siguiente paso de tu camino musical.')}<div class="paywall"><div class="lock">🔐</div><div class="eyebrow">NIVEL INTERMEDIO Y CANCIONES</div><h1>Desbloquea todo Sonata</h1><div class="price">10 €</div><p>Precio previsto de un único pago. Incluye las lecciones intermedias y todas las canciones de esta versión.</p><button class="btn" id="fakeCheckout">COMPRA NO DISPONIBLE EN EL MVP</button><p class="small-print">No se realiza ningún cobro. Antes de vender habrá que integrar pagos reales y verificar permisos en un servidor.</p></div>`}
  function getLesson(id){return LESSONS.find(l=>l.id===id)}
  function getSong(id){return SONGS.find(s=>s.id===id)}
  function startActivity(type,id){
    const data=type==='lesson'?getLesson(id):getSong(id);
    if(!data)return;
    if(type==='lesson'){
      const index=LESSONS.findIndex(l=>l.id===id);
      if(isLocked(data)){navigate('premium');return}
      if(!isAvailable(index)){toast('Completa primero las lecciones anteriores.');return}
    }else if(songLocked(data)){navigate('premium');return}
    stopInputs();activity={type,id,title:data.title,notes:data.notes.slice(),index:0,correct:0,mistakes:0,attempts:0,source:'pantalla',finished:false,hand:'right',chooseHand:true,placeHands:false,waiting:false,loopStart:-1,loopEnd:-1,loopEnabled:false};navigate('play');
  }
  // Guía ilustrativa para principiantes; no sustituye la digitación de una partitura revisada.
  // Pulgar=1 en las dos manos. En la derecha el 1 cae en la nota más grave de la posición; en la izquierda, en la más aguda.
  // Tres posiciones sencillas cubren el registro utilizado en este MVP.
  const HAND_POSITIONS = [
    {name:'Do central',base:'Do',notes:['Do','Re','Mi','Fa','Sol']},
    {name:'Fa',base:'Fa',notes:['Fa','Sol','La','Si','Do5']},
    {name:'Sol',base:'Sol',notes:['Sol','La','Si','Do5','Re5']},
    {name:'Do agudo',base:'Do5',notes:['Do5','Re5','Mi5','Fa5','Sol5']}
  ];
  function fingeringFor(note){
    const birthday=activity?.type==='song'&&activity.id==='birthday';
    const position=birthday?(['Sol','La','Si','Do5','Re5'].includes(note)?HAND_POSITIONS[2]:HAND_POSITIONS[3]):
      (HAND_POSITIONS[0].notes.includes(note)?HAND_POSITIONS[0]:(HAND_POSITIONS[1].notes.includes(note)?HAND_POSITIONS[1]:HAND_POSITIONS[3]));
    return {position,finger:fingerNumber(position,note)||1,note};
  }
  function fingerNumber(position,noteName){
    const index=position.notes.indexOf(noteName);
    if(index<0) return 0;
    return activeHand()==='left'?5-index:index+1;
  }
  function activeHand(){
    if(!activity)return 'right';
    if(activity.hand==='both')return Math.floor(activity.index/4)%2===0?'right':'left';
    return activity.hand||'right';
  }
  const FINGER_COLORS=['#e23b3b','#f08a12','#1f9d6a','#2f7de1','#7a4ec8'];
  function handFigure(side,emphasize){
    const right=side==='right';
    const order=right?[1,2,3,4,5]:[5,4,3,2,1];
    const lift={1:50,2:24,3:8,4:20,5:38};
    const slots=[22,48,74,100,126];
    const fingers=order.map((finger,index)=>{
      const color=FINGER_COLORS[finger-1];
      const x=slots[index];
      const y=lift[finger];
      const on=emphasize&&finger===1;
      return `<g><rect x="${x-10}" y="${y+10}" width="20" height="${96-y}" rx="10" fill="${color}"/><circle cx="${x}" cy="${y+12}" r="${on?12:10}" fill="${color}" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y+16}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${finger}</text></g>`;
    }).join('');
    const label=right?'Mano derecha':'Mano izquierda';
    return `<figure class="hand-figure ${emphasize?'is-active':''}"><svg viewBox="0 0 148 128" role="img" aria-label="${label}"><rect x="14" y="78" width="120" height="40" rx="16" fill="#f6d3b8" stroke="#e2b89a"/>${fingers}</svg><figcaption>${label}</figcaption></figure>`;
  }
  function thumbLine(){
    const base=fingeringFor(activity.notes[0]).position.base;
    const lines={
      right:{Do:'El pulgar derecho va en Do central (C).',Fa:'El pulgar derecho va en Fa (F).',Sol:'El pulgar derecho va en Sol (G).',Do5:'El pulgar derecho va en Do agudo (C).'},
      left:{Do:'El pulgar izquierdo va en Sol (G).',Fa:'El pulgar izquierdo va en Do agudo (C).',Sol:'El pulgar izquierdo va en Re agudo (D).',Do5:'El pulgar izquierdo va en Sol agudo (G).'},
      both:{Do:'El pulgar derecho va en Do central (C) y el izquierdo en Sol (G).',Fa:'El pulgar derecho va en Fa (F) y el izquierdo en Do agudo (C).',Sol:'El pulgar derecho va en Sol (G) y el izquierdo en Re agudo (D).',Do5:'El pulgar derecho va en Do agudo (C) y el izquierdo en Sol agudo (G).'}
    };
    const hand=activity.hand==='both'?'both':activity.hand==='left'?'left':'right';
    return (lines[hand]&&lines[hand][base])||lines.right.Do;
  }
  function placeHandsStep(){
    return `<div class="hand-setup" id="handSetup" role="dialog" aria-modal="true" aria-label="Coloca tus manos"><div class="hand-setup-card"><div class="eyebrow">ANTES DE TOCAR</div><h2>Coloca tus manos</h2><p>${thumbLine()}</p><div class="hand-pair">${handFigure('left',activity.hand!=='right')}${handFigure('right',activity.hand!=='left')}</div><p class="hand-legend"><span>1 pulgar</span><span>2 índice</span><span>3 medio</span><span>4 anular</span><span>5 meñique</span></p><p>La vista es la de tus manos sobre el piano: el pulgar de la derecha queda a la izquierda, y el de la izquierda a la derecha.</p><button class="btn" id="handsReady">LISTO</button></div></div>`;
  }
  function handStrip(note){
    const hand=activeHand();
    const info=fingeringFor(note);
    const dots=[1,2,3,4,5].map(finger=>`<i class="finger-dot ${finger===info.finger?'is-on':''}" style="background:${FINGER_COLORS[finger-1]}">${finger}</i>`).join('');
    return `<div class="hand-strip" id="handStrip"><b class="hand-lr">${hand==='left'?'L':'R'}</b><span>${hand==='left'?'Mano izquierda':'Mano derecha'}</span><span class="finger-dots" aria-hidden="true">${dots}</span></div>`;
  }
  function updateFingerGuide(note){
    const info=fingeringFor(note);
    document.querySelectorAll('.white-key').forEach(key=>{
      const name=key.dataset.note;
      const finger=fingerNumber(info.position,name);
      key.classList.toggle('guide-target',name===note);
      const old=key.querySelector('.key-finger');
      if(!finger){old?.remove();return;}
      const badge=old||document.createElement('span');
      badge.className='key-finger'+(name===note?' is-target':'');
      badge.textContent=String(finger);
      badge.style.background=FINGER_COLORS[finger-1];
      badge.setAttribute('aria-label','Dedo '+finger);
      if(!old) key.append(badge);
    });
    const strip=document.getElementById('handStrip');
    if(strip) strip.outerHTML=handStrip(note);
  }
  function keyboard(){
    const birthday=activity?.type==='song'&&getSong(activity.id)?.keyboard==='birthday';
    const sequence=birthday?['Sol','La','Si','Do5','Re5','Mi5','Fa5','Sol5']:['Do','Re','Mi','Fa','Sol','La','Si','Do5'];
    const white=sequence.map(note=>`<button class="white-key${note===activity?.notes[activity.index]?' guide-target':''}" data-note="${note}" aria-label="Tocar ${prettyName(note)}"><span class="key-letter">${LETTER[note]}</span><span class="key-name">${note.replace('5','↑')}</span></button>`).join('');
    const blacks=(birthday?[1,2,4,5,7]:[1,2,4,5,6]).map(after=>`<span class="black-key" style="left:${after*12.5}%" aria-hidden="true"></span>`).join('');
    const letters=birthday?'G A B C D E F G':'C D E F G A B C';
    return `<div class="keyboard-guide"><span>Letras del ordenador: C Do, D Re, E Mi, F Fa, G Sol, A La, B Si. La letra sigue la nota esperada; Mayús o 8 suben la octava.</span>${birthday?'<span> · Desde Sol4 hasta Sol5</span>':''}</div><div class="practice-keyboard" aria-label="Teclado de piano con letras ${letters}"><div class="white-keys">${white}</div>${blacks}</div>`;
  }
  function scoreTimeline(){
    if(!activity)return '';
    const width=Math.max(630,activity.notes.length*70+52);
    const horizontal=[34,48,62,76,90].map(y=>`<line x1="14" x2="${width-14}" y1="${y}" y2="${y}" stroke="#8096a6" stroke-width="1.15"/>`).join('');
    const notes=activity.notes.map((n,i)=>{
      const x=60+i*70,y=STAFF_Y[n];
      return `<g class="score-note ${i<activity.index?'scored':''} ${i===activity.index?'score-current':''}" data-score-index="${i}">
        ${i===activity.index?`<rect x="${x-30}" y="11" width="60" height="106" rx="9" fill="#d8f3e9" opacity=".84"/>`:''}
        ${i%4===0&&i!==0?`<line x1="${x-37}" x2="${x-37}" y1="30" y2="94" stroke="#aec0cc"/>`:''}
        ${ledgerLines(y,x-17,x+18)}
        <ellipse cx="${x}" cy="${y}" rx="10.7" ry="7.1" transform="rotate(-18 ${x} ${y})" fill="${i===activity.index?'#0d83cd':i<activity.index?'#6ec6ac':'#2e4457'}"/>
        <line x1="${y>62?x+9:x-9}" y1="${y>62?y-1:y+1}" x2="${y>62?x+9:x-9}" y2="${y>62?y-33:y+33}" stroke="${i===activity.index?'#0d83cd':'#2e4457'}" stroke-width="2.3"/>
        <text x="${x}" y="123" text-anchor="middle" font-size="13" font-weight="800" fill="#466c85">${LETTER[n]}</text>
      </g>`;
    }).join('');
    return `<div class="score-timeline" id="scoreTimeline" aria-label="Partitura con todas las notas de la actividad">
      <svg viewBox="0 0 ${width} 138" width="${width}" height="138" role="img" aria-label="Secuencia musical; nota actual ${prettyName(activity.notes[activity.index])}">
        ${horizontal}<text x="16" y="90" font-family="Georgia,serif" font-size="61" fill="#506e83">𝄞</text>${notes}
      </svg>
    </div>`;
  }
  function updateScore(){
    const node=document.getElementById('scoreTimeline');
    if(node){node.outerHTML=scoreTimeline();const fresh=document.getElementById('scoreTimeline');fresh.scrollLeft=Math.max(0,activity.index*70-120);}
  }
  function listenPanel(){
    const live=!!micStream;
    return `<div class="listen-panel" id="listenPanel"><div class="listen-row"><span class="listen-dot ${live?'live':''}" id="listenDot"></span><span id="listenState">${live?'Escuchando tu piano':'Micrófono en pausa'}</span><b class="heard-note" id="heardNote">—</b></div><div class="level-meter" aria-label="Nivel del micrófono"><span id="levelFill"></span></div><small id="micDebugLine" ${state.micDebug?'':'hidden'}></small></div>`;
  }
  function handChooser(){
    const micAsk=micStream?'':`<button class="btn" data-mic-ask>🎤 ACTIVAR MICRÓFONO</button><p class="mic-note">Sin micrófono puedes usar la pantalla o las letras C D E F G A B.</p>`;
    return `<div class="hand-chooser" id="handChooser" role="dialog" aria-modal="true" aria-label="Elige tu modo de manos">
      <div class="hand-chooser-card"><div class="eyebrow">ANTES DE EMPEZAR</div><h2>¿Con qué mano quieres practicar?</h2><p>Elige una mano y sigue las indicaciones de cada dedo.</p>
      ${micAsk}
      <button class="hand-choice" data-hand="right">🤚 Mano derecha <span>→</span></button>
      <button class="hand-choice" data-hand="left">✋ Mano izquierda <span>→</span></button>
      <button class="hand-choice" data-hand="both">🙌 Ambas manos (por turnos) <span>→</span></button>
      <small>Por ahora las notas se practican de una en una. «Ambas manos» alterna la guía y no reproduce una partitura a dos voces.</small></div>
    </div>`;
  }
  function playPage(){
    if(!activity)return home();
    const target=activity.notes[activity.index],percent=Math.round(activity.index/activity.notes.length*100);
    const modeLabel=activity.hand==='both'?'Ambas':activity.hand==='left'?'Izquierda':'Derecha';
    return `<div class="lesson-top"><button class="back-btn" id="leaveLesson" aria-label="Salir de la lección">‹</button><div style="flex:1"><div class="lesson-header"><div><h1>${clean(activity.title)}</h1><p>Nota ${activity.index+1} de ${activity.notes.length}</p></div><button id="handSettings" class="small-settings" aria-label="Cambiar mano">${modeLabel}</button></div>${progressBarActivity(percent)}</div></div>
    <section class="lesson-stage" id="lessonStage">
      <div class="target-display"><div class="note-label">TOCA ESTA NOTA</div><div class="target-note" id="targetNote">${prettyName(target)}</div></div>
      ${handStrip(target)}
      <div class="staff" id="staffDrawing">${staffDrawing(target)}</div>
      <div class="lesson-feedback" id="lessonFeedback" role="status" aria-live="polite">🎹 Esperando una nota · toca o activa el micrófono</div>
      ${listenPanel()}
      ${keyboard()}
      ${scoreTimeline()}
      <p class="lesson-help">${activity.type==='lesson'?clean(getLesson(activity.id).tip):(getSong(activity.id).keyboard==='birthday'?'Cumpleaños feliz: toca las letras G, A, B, C, D, E y F en orden.':'Sigue las notas de la canción, una por una.')}</p>
    </section>
    <div class="lesson-controls"><button class="btn secondary" id="hearTarget">🔊 ESCUCHAR NOTA</button><button class="btn secondary" id="demoSequence">▶ ESCUCHAR FRAGMENTO</button><button class="btn ghost" id="toggleLoop" aria-pressed="${activity.loopEnabled}">⟳ ${activity.loopEnabled?'QUITAR BUCLE':'REPETIR 4 NOTAS'}</button>${micStream?'<button class="btn ghost" id="enableMic" disabled>🎤 ESCUCHANDO</button>':'<button class="btn ghost" data-mic-ask id="enableMic">🎤 ACTIVAR MICRÓFONO</button>'}<button class="btn ghost" data-nav="calibrate">PROBAR DO</button><button class="btn ghost" id="enableMidi">🎹 MIDI</button></div>
    <div class="source-status" id="sourceStatus">Teclado del ordenador: C D E F G A B. Si la nota esperada es aguda, esa letra la toca. Mayús+letra fuerza la octava 5 y 8 es Do agudo. La pantalla, el micrófono y MIDI también valen.</div>
    ${activity.chooseHand?handChooser():''}${activity.placeHands?placeHandsStep():''}`;
  }
  function progressBarActivity(percent){return `<div class="lesson-progress" aria-label="Progreso del ejercicio"><span id="activityBar" style="width:${percent}%"></span></div>`}
  function resultPage(){if(!activity)return home();const count=activity.notes.length,accuracy=Math.round(activity.correct/Math.max(1,activity.attempts)*100);const stars=accuracy>=95?3:accuracy>=75?2:1;const isLesson=activity.type==='lesson',data=isLesson?getLesson(activity.id):getSong(activity.id);
    return `<div class="result"><div class="result-burst">🎉</div><h1>¡${isLesson?'Lección':'Canción'} completada!</h1><p>¡Has llegado hasta la última nota!</p><div class="stars" aria-label="${stars} ${stars===1?'estrella':'estrellas'}">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><div class="result-stats"><div><strong>${accuracy}%</strong><small>Precisión</small></div><div><strong>${count}</strong><small>Notas correctas</small></div><div><strong>+${activity.awardedXP||0}</strong><small>XP nuevos</small></div></div><p>${activity.awardedCoins?`<span class="coin-price">${coinIcon(16)}<span>+${activity.awardedCoins} monedas por practicar hoy.</span></span> `:''}<span>${activity.newChest?'🎁 ¡Has desbloqueado un cofre! Ve a Recompensas para abrirlo.':'Mejora tus estrellas repitiendo la actividad.'}</span></p><div class="actions"><button class="btn secondary" id="retryActivity">REPETIR</button><button class="btn" data-nav="${isLesson?'path':'songs'}">CONTINUAR →</button>${activity.newChest?'<button class="btn gold" data-nav="rewards">VER COFRES</button>':''}</div></div>`}
  function calibratePage(){
    return `${heading('Prueba el micrófono','Toca un Do para confirmar que te oímos.')}<section class="calibrate-card"><div class="note-label">TOCA ESTA NOTA</div><div class="target-note">C · Do</div><p>Toca el Do central o el Do agudo en tu piano, con una nota clara. Si el micrófono falla, las lecciones siguen en la pantalla y con las letras del ordenador.</p>${listenPanel()}${micStream?'':`<button class="btn" data-mic-ask>🎤 ACTIVAR MICRÓFONO</button>`}<p id="calibrateResult">Aún no oímos un Do.</p><button class="btn" id="calibrateDone" disabled>EMPEZAR A PRACTICAR</button><button class="btn ghost" data-nav="home">Volver al inicio</button></section>`;
  }
  function navigate(next){
    if(next!=='play'&&next!=='result'&&next!=='calibrate')stopInputs();
    route=next;
    const pages={home,path,songs,rewards,shop,missions,profile,premium:paywall,play:playPage,result:resultPage,calibrate:calibratePage};
    listenStateSource='';listenNoteSource='';
    main.innerHTML=(pages[next]||home)();
    document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('selected',el.dataset.nav===next||(next==='play'&&el.dataset.nav==='path')));
    window.scrollTo({top:0,behavior:'instant'});
    syncHeader();
    if(next==='play' && activity){updateFingerGuide(activity.notes[activity.index]);updateScore();}
  }
  function playTone(note){
    ignoreMicUntil=performance.now()+750;
    if(micTracker) micTracker.reset();
    try {
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)return;
      audioContext ||= new Context();
      if(audioContext.state==='suspended')audioContext.resume();
      const osc=audioContext.createOscillator(),gain=audioContext.createGain();
      osc.type='sine';osc.frequency.value=NOTES[note]||261.63;gain.gain.value=.001;
      osc.connect(gain);gain.connect(audioContext.destination);
      const t=audioContext.currentTime;gain.gain.exponentialRampToValueAtTime(.16,t+.018);gain.gain.exponentialRampToValueAtTime(.001,t+.43);
      osc.start(t);osc.stop(t+.45);
    }catch(e){console.warn('Audio no disponible',e)}
  }
  function showFeedback(status,message,note){
    const stage=document.getElementById('lessonStage'),label=document.getElementById('lessonFeedback');
    if(stage){stage.classList.remove('feedback-correct','feedback-wrong');stage.classList.add(status==='correct'?'feedback-correct':'feedback-wrong')}
    if(label){label.textContent=message;label.style.color=status==='correct'?'#138f53':'#d42d43';}
    if(note){const key=Array.from(document.querySelectorAll('.white-key')).find(el=>el.dataset.note===note);key?.classList.add(status==='correct'?'correct-flash':'wrong-flash');setTimeout(()=>key?.classList.remove('correct-flash','wrong-flash'),480)}
  }
  function advanceNote(){
    if(route!=='play'||!activity)return;
    activity.waiting=false;
    if(activity.index>=activity.notes.length){activity.finished=true;finishActivity();return}
    if(activity.loopEnabled&&activity.loopStart>=0&&activity.index>=activity.loopEnd){activity.index=activity.loopStart;}
    const next=activity.notes[activity.index];
    document.getElementById('targetNote').textContent=prettyName(next);
    document.getElementById('staffDrawing').innerHTML=staffDrawing(next);
    updateFingerGuide(next);updateScore();
    const stage=document.getElementById('lessonStage');stage?.classList.remove('feedback-correct','feedback-wrong');
    const label=document.getElementById('lessonFeedback');if(label){label.textContent='🎹 Toca la siguiente nota';label.style.color='#287fb9'}
    const bar=document.getElementById('activityBar');if(bar)bar.style.width=`${activity.index/activity.notes.length*100}%`;
    const info=document.querySelector('.lesson-header p');if(info)info.textContent=`Nota ${activity.index+1} de ${activity.notes.length}`;
  }
  function handleNote(note,source='pantalla'){
    if(route!=='play'||!activity||activity.finished||activity.waiting||activity.chooseHand||activity.placeHands)return;
    if(!(note in NOTES))return;
    const pressed=Array.from(document.querySelectorAll('.white-key')).find(el=>el.dataset.note===note);
    pressed?.classList.add('pressed');if(pressed)setTimeout(()=>pressed.classList.remove('pressed'),160);
    if(source==='pantalla')playTone(note);
    activity.attempts++;
    const expected=activity.notes[activity.index];
    if(note===expected){
      activity.correct++;activity.index++;activity.waiting=true;
      showFeedback('correct','✓ ¡Correcto! '+LETTER[note]+' · '+note,note);
      clearTimeout(feedbackTimer);feedbackTimer=setTimeout(advanceNote,560);
    }else{
      activity.mistakes++;
      showFeedback('wrong',`✕ Has tocado ${LETTER[note]} (${note}). Busca ${LETTER[expected]} (${expected}).`,note);
    }
  }
  function updateStreak(){const today=dailyKey();if(state.lastDay===today)return;const d=new Date();d.setDate(d.getDate()-1);const yesterday=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;state.streak=state.lastDay===yesterday?state.streak+1:1;state.lastDay=today}
  function finishActivity(){
    if(!activity)return;
    const accuracy=Math.round(activity.correct/Math.max(1,activity.attempts)*100);
    const stars=accuracy>=95?3:accuracy>=75?2:1;
    let awardedXP=0,newChest=false;
    if(activity.type==='lesson'){
      const old=state.completed[activity.id];
      if(!old){awardedXP=getLesson(activity.id).xp;state.xp+=awardedXP;const before=completedCount();state.completed[activity.id]={stars};const after=completedCount();newChest=CHESTS.some(c=>c.requires>before&&c.requires<=after&&!state.chests[c.id]);updateStreak()}
      else state.completed[activity.id]={stars:Math.max(old.stars,stars)};
    }else state.songScores[activity.id]=Math.max(state.songScores[activity.id]||0,stars);
    const today=dailyKey();
    if(!state.practiceDays.includes(today))state.practiceDays.push(today);
    updateStreak();
    trackMissionProgress(activity.type);
    const awardedCoins=state.dailyCoinDate===today?0:40;
    if(awardedCoins){state.coins+=awardedCoins;state.dailyCoinDate=today}
    activity.awardedCoins=awardedCoins;
    activity.awardedXP=awardedXP;activity.newChest=newChest;save();stopInputs();navigate('result');
  }
  function buyOrEquipSkin(id){
    const skin=SKINS.find(x=>x.id===id);if(!skin)return;
    if(!state.ownedSkins.includes(id)){
      if(practiceDayCount()<(skin.days||0)){toast(`Necesitas ${skin.days} días de práctica para desbloquear esta skin.`);return}
      if(state.coins<skin.price){toast('Necesitas más monedas. ¡Practica a diario y abre cofres!');return}
      state.coins-=skin.price;
      state.ownedSkins.push(id);
      toast(`¡Has comprado ${skin.name}!`);
    }else toast(`${skin.name} equipada en tu piano.`);
    state.equippedSkin=id;
    save();navigate('shop');
  }
  function openChest(id){
    const c=CHESTS.find(x=>x.id===id);if(!c||state.chests[id]||completedCount()<c.requires)return;
    const randomBetween=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    const xp=randomBetween(...c.xp),coins=randomBetween(...c.coins);
    state.chests[id]={xp,coins};state.xp+=xp;state.coins+=coins;save();navigate('rewards');
    const overlay=document.getElementById('rewardOverlay');overlay.innerHTML=`<div class="prize" role="dialog" aria-modal="true" aria-label="Recompensa"><span class="chest-icon">${chestSvg(c,"-prize")}</span><div class="eyebrow">COFRE ${clean(c.name.toUpperCase())}</div><h2>¡Qué recompensa!</h2><div class="big-reward">+${xp} XP · +${coins} ${coinIcon(28)}</div><p>¡Sigue aprendiendo para desbloquear el siguiente cofre!</p><button class="btn" id="dismissPrize">¡GENIAL!</button></div>`;overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');document.getElementById('dismissPrize').focus();
  }
  function dismissPrize(){const ov=document.getElementById('rewardOverlay');ov.classList.remove('show');ov.setAttribute('aria-hidden','true');ov.innerHTML=''}
  function stopInputs(){
    clearTimeout(feedbackTimer);feedbackTimer=null;clearTimeout(demoTimer);demoTimer=null;
    if(micRaf)cancelAnimationFrame(micRaf);micRaf=null;
    if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
    if(micNode){micNode.disconnect();micNode=null}
    if(micSource){micSource.disconnect();micSource=null}
    if(micContext){micContext.close().catch(()=>{});micContext=null}
    if(midiInput){midiInput.onmidimessage=null;midiInput=null}
  }
  function stopMicrophoneOnly(){
    if(micRaf)cancelAnimationFrame(micRaf);micRaf=null;
    if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
    if(micNode){micNode.disconnect();micNode=null}
    if(micSource){micSource.disconnect();micSource=null}
    if(micContext){micContext.close().catch(()=>{});micContext=null}
  }
  function midiToNote(number){const octave=Math.floor(number/12)-1,key=['Do',null,'Re',null,'Mi','Fa',null,'Sol',null,'La',null,'Si'][number%12];return key?(octave===4?key:(octave===5?key+'5':null)):null}
  async function enableMIDI(){
    if(!navigator.requestMIDIAccess){toast('MIDI no está disponible en este navegador.');return}
    try{midiAccess=await navigator.requestMIDIAccess();const inputs=[...midiAccess.inputs.values()];if(!inputs.length){toast('Conecta un piano MIDI y vuelve a probar.');return}midiInput=inputs[0];midiInput.onmidimessage=e=>{const [status,note,velocity]=e.data;if((status&0xf0)===0x90&&velocity>0){const name=midiToNote(note);if(name)handleNote(name,'midi')}};document.getElementById('sourceStatus').textContent=`MIDI activo: ${midiInput.name||'piano conectado'} · rango Do4–Sol5`;toast('Piano MIDI conectado.');}catch(e){toast('No se pudo conectar el piano MIDI.')}
  }
  function detectPlatform(){
    const ua=navigator.userAgent||'';
    if(/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)) return 'ios';
    if(/CrOS/.test(ua)) return 'chromebook';
    if(/Android/.test(ua)) return 'android';
    return 'desktop';
  }
  function micHelpCopy(kind){
    if(kind==='insecure') return 'El micrófono necesita una página HTTPS. Ábrela desde GitHub Pages, no como un archivo descargado.';
    if(kind==='missing') return 'No encontramos un micrófono en este dispositivo. Puedes seguir con el teclado de la pantalla o del ordenador.';
    if(kind==='busy') return 'El micrófono está ocupado por otra aplicación. Ciérrala y pulsa Activar micrófono otra vez.';
    if(kind==='unsupported') return 'Este navegador no puede usar el micrófono. Sigue con el teclado de la pantalla o del ordenador.';
    const where={
      ios:'En iPhone o iPad abre Ajustes, entra en Safari y permite el micrófono. Vuelve a Sonata y pulsa Activar micrófono.',
      android:'En Android toca el candado de la barra de direcciones, abre Permisos y permite el micrófono.',
      chromebook:'En Chromebook toca el candado, abre la configuración del sitio y permite el micrófono. Revisa también el micrófono en la configuración de ChromeOS.',
      desktop:'En el ordenador toca el candado de la barra de direcciones y permite el micrófono para este sitio.'
    };
    return where[detectPlatform()];
  }
  function classifyMicError(error){
    const name=error&&error.name||'';
    if(name==='NotAllowedError'||name==='PermissionDeniedError'||name==='SecurityError'&&!window.isSecureContext) return name==='SecurityError'?'insecure':'denied';
    if(name==='NotFoundError'||name==='DevicesNotFoundError') return 'missing';
    if(name==='NotReadableError'||name==='TrackStartError'||name==='AbortError') return 'busy';
    if(name==='SecurityError') return 'insecure';
    return 'denied';
  }
  function hideMicOverlay(){
    const overlay=document.getElementById('micOverlay');
    if(!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='';
  }
  function showOnboarding(){
    const overlay=document.getElementById('micOverlay');
    if(!overlay) return;
    overlay.innerHTML=`<div class="mic-card" role="dialog" aria-modal="true" aria-label="Activar el micrófono"><div class="eyebrow">TU PIANO</div><h2>¿Podemos escuchar tu piano?</h2><p>Sonata avanza las lecciones y las canciones con las notas que tocas en un piano acústico o digital. El audio se queda en este dispositivo: no lo enviamos a ningún servidor.</p><p>Si prefieres, puedes tocar en la pantalla o con las letras del ordenador.</p><button class="btn" data-mic-ask>🎤 ACTIVAR MICRÓFONO</button><button class="btn ghost" id="micSkip">SEGUIR CON EL TECLADO</button></div>`;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
  }
  function showMicHelp(kind){
    const overlay=document.getElementById('micOverlay');
    if(!overlay) return;
    overlay.innerHTML=`<div class="mic-card" role="dialog" aria-modal="true" aria-label="Permiso del micrófono"><h2>No pudimos usar el micrófono</h2><p>${micHelpCopy(kind)}</p><button class="btn" data-mic-ask>🎤 ACTIVAR MICRÓFONO</button><button class="btn ghost" id="micSkip">SEGUIR CON EL TECLADO</button></div>`;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
  }
  let listenStateSource='',listenNoteSource='';
  function paintListen(level,note,frequency,confidence){
    const fill=document.getElementById('levelFill');
    if(fill) fill.style.width=`${Math.max(0,Math.min(100,Math.round(level/0.2*100)))}%`;
    const dot=document.getElementById('listenDot');
    if(dot) dot.classList.toggle('live',!!micStream);
    const stateNode=document.getElementById('listenState');
    const nextState=micStream?'Escuchando tu piano':'Micrófono en pausa';
    if(stateNode&&listenStateSource!==nextState){listenStateSource=nextState;stateNode.textContent=nextState;}
    const heard=document.getElementById('heardNote');
    const solfege=note?(note.endsWith('5')?note.replace('5',' agudo'):note):'';
    const nextHeard=note?`${solfege} (${LETTER[note]})`:'—';
    if(heard&&listenNoteSource!==nextHeard){listenNoteSource=nextHeard;heard.textContent=nextHeard;}
    if(heard) heard.classList.toggle('heard-ok',!!(note&&route==='play'&&activity&&note===activity.notes[activity.index]));
    const debug=document.getElementById('micDebugLine');
    if(debug){
      debug.hidden=!state.micDebug;
      if(state.micDebug) debug.textContent=frequency?`${frequency.toFixed(1)} Hz · ${Math.round((confidence||0)*100)}%`:'';
    }
  }
  function markCalibrated(note){
    const node=document.getElementById('calibrateResult');
    if(node) node.innerHTML=`<span>¡Te oímos!</span> <span>${prettyName(note)}</span>`;
    const done=document.getElementById('calibrateDone');
    if(done) done.disabled=false;
  }
  function attachStream(stream){
    if(micRaf) cancelAnimationFrame(micRaf);
    micRaf=null;
    if(micStream&&micStream!==stream) micStream.getTracks().forEach(track=>track.stop());
    if(micNode) micNode.disconnect();
    if(micSource) micSource.disconnect();
    if(micContext) micContext.close().catch(()=>{});
    const Context=window.AudioContext||window.webkitAudioContext;
    micContext=new Context();
    micStream=stream;
    micSource=micContext.createMediaStreamSource(stream);
    micNode=micContext.createAnalyser();
    micNode.fftSize=micContext.sampleRate>48000?8192:4096;
    micNode.smoothingTimeConstant=0;
    micSource.connect(micNode);
    if(micContext.state==='suspended') micContext.resume();
    micTracker=window.SonataPitch.createTracker(NOTES,{
      getTolerance:()=>state.centsTolerance||45,
      getExpectedHz:()=>route==='play'&&activity&&!activity.chooseHand&&!activity.placeHands?NOTES[activity.notes[activity.index]]||null:null
    });
    const buffer=new Float32Array(micNode.fftSize);
    let frameSkip=0;
    const listen=()=>{
      if(!micNode||!micTracker) return;
      micRaf=requestAnimationFrame(listen);
      frameSkip=(frameSkip+1)%2;
      if(frameSkip) return;
      micNode.getFloatTimeDomainData(buffer);
      if(performance.now()<ignoreMicUntil){micTracker.reset();paintListen(window.SonataPitch.rms(buffer),null,null,null);return;}
      if(route!=='play'&&route!=='calibrate'){paintListen(window.SonataPitch.rms(buffer),null,null,null);return;}
      const frame=micTracker.push(buffer,micContext.sampleRate);
      paintListen(frame.level,frame.note,frame.frequency,frame.confidence);
      if(!frame.emit) return;
      if(route==='calibrate'&&(frame.emit==='Do'||frame.emit==='Do5')) markCalibrated(frame.emit);
      else if(route==='play') handleNote(frame.emit,'micrófono');
    };
    listen();
    paintListen(0,null);
    const button=document.getElementById('enableMic');
    if(button){button.textContent='🎤 ESCUCHANDO';button.disabled=true;button.removeAttribute('data-mic-ask');}
  }
  function requestMic(){
    if(micStream) return Promise.resolve('granted');
    const secure=window.isSecureContext||location.hostname==='localhost'||location.hostname==='127.0.0.1';
    if(!secure){showMicHelp('insecure');return Promise.resolve('insecure');}
    if(!navigator.mediaDevices?.getUserMedia){showMicHelp('unsupported');return Promise.resolve('unsupported');}
    const open=constraints=>navigator.mediaDevices.getUserMedia(constraints);
    return open({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).catch(error=>{
      if(error&&error.name==='OverconstrainedError') return open({audio:true});
      throw error;
    }).then(stream=>{
      attachStream(stream);
      state.micChoice='granted';
      save();
      return 'granted';
    }).catch(error=>{
      const kind=classifyMicError(error);
      if(kind==='denied') state.micChoice='denied';
      save();
      showMicHelp(kind);
      return kind;
    });
  }
  // Navegación y acciones delegadas (sobreviven a renderizados de pantalla).
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-mic-ask]')){
      const fromStart=!state.micChoice||state.micChoice==='unknown'||!!document.getElementById('micOverlay')?.classList.contains('show');
      requestMic().then(result=>{
        if(result!=='granted') return;
        hideMicOverlay();
        toast('Micrófono activado.');
        if(fromStart&&route!=='play') navigate('calibrate');
        else if(route==='play'||route==='calibrate') navigate(route);
      });
      return;
    }
    if(e.target.closest('#micSkip')){
      if(state.micChoice!=='granted') state.micChoice='skipped';
      save();
      hideMicOverlay();
      return;
    }
    if(e.target.closest('#calibrateDone')){navigate('path');return}
    const nav=e.target.closest('[data-nav]');if(nav){navigate(nav.dataset.nav);return}
    const lesson=e.target.closest('[data-lesson]');if(lesson){startActivity('lesson',lesson.dataset.lesson);return}
    const song=e.target.closest('[data-song]');if(song){startActivity('song',song.dataset.song);return}
    const mission=e.target.closest('[data-claim-mission]');if(mission){claimMission(mission.dataset.claimMission);return}
    const chest=e.target.closest('[data-chest]');if(chest){openChest(chest.dataset.chest);return}
    const skin=e.target.closest('[data-skin-action]');if(skin){buyOrEquipSkin(skin.dataset.skinAction);return}
    const badge=e.target.closest('[data-badge-equip]');if(badge){
      const selected=ACHIEVEMENTS.find(a=>a.id===badge.dataset.badgeEquip);
      if(selected?.earned()){state.equippedBadge=selected.id;save();navigate(route);toast(`¡Insignia ${selected.name} equipada!`)}
      return;
    }
    const note=e.target.closest('[data-note]');if(note){handleNote(note.dataset.note);return}
    if(e.target.closest('#leaveLesson')){navigate(activity?.type==='song'?'songs':'path');return}
    if(e.target.closest('#hearTarget')&&activity){playTone(activity.notes[activity.index]);return}
    if(e.target.closest('#enableMidi')){enableMIDI();return}
    const hand=e.target.closest('[data-hand]');if(hand&&activity){activity.hand=hand.dataset.hand;activity.chooseHand=false;activity.placeHands=true;if(state.micChoice==='granted'&&!micStream) requestMic();navigate('play');return}
    if(e.target.closest('#handsReady')&&activity){activity.placeHands=false;navigate('play');return}
    if(e.target.closest('#handSettings')&&activity){activity.chooseHand=true;activity.placeHands=false;navigate('play');return}
    if(e.target.closest('#toggleLoop')&&activity){
      activity.loopEnabled=!activity.loopEnabled;
      if(activity.loopEnabled){activity.loopStart=activity.index;activity.loopEnd=Math.min(activity.notes.length,activity.index+4)}
      else{activity.loopStart=-1;activity.loopEnd=-1}
      const btn=document.getElementById('toggleLoop');btn.textContent=activity.loopEnabled?'⟳ QUITAR BUCLE':'⟳ REPETIR 4 NOTAS';btn.setAttribute('aria-pressed',String(activity.loopEnabled));
      toast(activity.loopEnabled?'Repitiendo este fragmento de 4 notas.':'Repetición desactivada.');return;
    }
    if(e.target.closest('#demoSequence')&&activity){
      clearTimeout(demoTimer);
      const segment=activity.notes.slice(activity.index,activity.index+4);
      ignoreMicUntil=performance.now()+(segment.length-1)*560+750;
      if(micTracker) micTracker.reset();
      segment.forEach((n,i)=>{demoTimer=setTimeout(()=>playTone(n),i*560)});
      return;
    }
    if(e.target.closest('#dismissPrize')){dismissPrize();return}
    if(e.target.closest('#retryActivity')&&activity){startActivity(activity.type,activity.id);return}
    if(e.target.closest('#fakeCheckout')){toast('Todavía no se realizan pagos en el MVP.');return}
    if(e.target.closest('#resetProgress')){const ask='¿Quieres borrar todo el progreso guardado en este dispositivo?';if(confirm(window.SonataI18n?window.SonataI18n.translate(ask):ask)){const remembered=state.micChoice,cents=state.centsTolerance,debug=state.micDebug;state=defaultState();state.micChoice=remembered;state.centsTolerance=cents;state.micDebug=debug;save();navigate('home');toast('Progreso de prueba borrado.')}return}
  });
  document.addEventListener('input',e=>{
    if(e.target.id!=='centsTolerance') return;
    state.centsTolerance=Math.min(80,Math.max(20,Number(e.target.value)||45));
    const read=document.getElementById('centsRead');
    if(read) read.textContent=String(state.centsTolerance);
    save();
  });
  document.addEventListener('change',e=>{
    if(e.target.id!=='micDebug') return;
    state.micDebug=!!e.target.checked;
    save();
  });
  document.addEventListener('submit',e=>{
    if(e.target.id==='emailForm'){e.preventDefault();state.email=normalize(document.getElementById('emailInput').value);save();navigate('profile');toast('Correo de prueba guardado en este dispositivo.');return}
  });
  const LOWER_OCTAVE={c:'Do',d:'Re',e:'Mi',f:'Fa',g:'Sol',a:'La',b:'Si'};
  const UPPER_OCTAVE={c:'Do5',d:'Re5',e:'Mi5',f:'Fa5',g:'Sol5'};
  function noteFromComputerKey(event){
    if(event.key==='8')return 'Do5';
    if(event.key.length!==1)return;
    const letter=event.key.toLowerCase();
    const lower=LOWER_OCTAVE[letter];
    if(!lower)return;
    if(event.shiftKey)return UPPER_OCTAVE[letter];
    const expected=activity?.notes?.[activity.index];
    if(expected && LETTER[expected]?.toLowerCase()===letter)return expected;
    return lower;
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){dismissPrize();return}
    if(route!=='play'||e.repeat||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    const note=noteFromComputerKey(e);
    if(note){e.preventDefault();handleNote(note)}
  });
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('SW:',err)));
  }
  if(storedSkinsNeedCleanup())save();
  syncHeader();navigate('home');document.documentElement.classList.add('sonata-interactiva');
  if(state.micChoice==='unknown') showOnboarding();
})();
