/* Sonata MVP — aplicación PWA local, sin backend ni cobros. */
(() => {
  'use strict';
  const OWNER_EMAIL = 'pelayovaldivieso@gmail.com';
  const STORE_KEY = 'sonata_mvp_v1';
  const NOTE_ORDER = ['Do','Re','Mi','Fa','Sol','La','Si','Do5'];
  const NOTES = {Do:261.63, Re:293.66, Mi:329.63, Fa:349.23, Sol:392.00, La:440, Si:493.88, Do5:523.25};
  const STAFF = {Do:'𝅘𝅥',Re:'𝅘𝅥',Mi:'𝅘𝅥',Fa:'𝅘𝅥',Sol:'𝅘𝅥',La:'𝅘𝅥',Si:'𝅘𝅥',Do5:'𝅘𝅥'};
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
  const defaultState = () => ({xp:0,coins:0,completed:{},chests:{},songScores:{},email:'',invites:[],lastDay:'',streak:0});
  function loadState(){
    try {
      const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
      if(!saved||typeof saved!=='object')return defaultState();
      return {...defaultState(),...saved,completed:saved.completed||{},chests:saved.chests||{},songScores:saved.songScores||{},invites:Array.isArray(saved.invites)?saved.invites:[]};
    } catch {return defaultState()}
  }
  let state=loadState();
  let route='home',activity=null,audioContext=null,micStream=null,micContext=null,micSource=null,micNode=null,micRaf=null,lastDetected='',lastDetectedAt=0;
  let midiInput=null,midiAccess=null,toastTimeout;
  const main=document.getElementById('mainContent');
  const clean = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value||'').trim().toLowerCase();
  const completedCount = () => LESSONS.filter(l=>state.completed[l.id]).length;
  const premiumAccess = () => state.email===OWNER_EMAIL || state.invites.includes(state.email);
  const isLocked = lesson => lesson.unit>1 && !premiumAccess();
  const songLocked = song => song.premium && !premiumAccess();
  const isAvailable = index => index===0 || !!state.completed[LESSONS[index-1].id];
  const dailyKey = () => new Date().toLocaleDateString('en-CA');
  function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch(e){console.warn('No se pudo guardar progreso',e)}syncHeader()}
  function syncHeader(){document.getElementById('topXP').textContent=state.xp; document.querySelector('.top-avatar').textContent=(state.email[0]||'P').toUpperCase()}
  function toast(message){const node=document.getElementById('toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove('show'),2500)}
  function progressBar(){return `<div class="lesson-progress" aria-label="Progreso del curso"><span style="width:${completedCount()/LESSONS.length*100}%"></span></div>`}
  function heading(title,subtitle='',pill=''){return `<header class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div>${pill?`<span class="pill">${pill}</span>`:''}</header>`}
  function section(title,action='',target=''){return `<div class="section-heading"><h2>${title}</h2>${action?`<button class="text-action" data-nav="${target}">${action} ›</button>`:''}</div>`}
  function home(){
    const nextIndex=LESSONS.findIndex(l=>!state.completed[l.id]);const i=nextIndex<0?LESSONS.length-1:nextIndex,l=LESSONS[i],finish=completedCount();
    const preview=LESSONS.slice(0,5).map((x,j)=>`<div class="mini-step ${state.completed[x.id]?'done':j===i?'current':''}"><i>${state.completed[x.id]?'✓':x.emoji}</i><b>${clean(x.title)}</b><small>${state.completed[x.id]?'Completada':j===i?'Siguiente':''}</small></div>`).join('');
    const nextChest=CHESTS.find(c=>!state.chests[c.id]);
    return `${heading(`¡Hola${state.email?' de nuevo':''}! 👋`,'Tu próxima sesión de piano empieza aquí.', '🎹 APRENDE A TU RITMO')}
      ${section('Continuar aprendiendo','Ver curso','path')}
      <section class="hero"><div class="hero-art"><div class="sheet"><span>♫</span></div></div><div class="hero-copy"><div class="eyebrow">UNIDAD ${l.unit} · ${l.unit===1?'FUNDAMENTOS':'NIVEL INTERMEDIO'}</div><h2>${clean(l.title)}</h2><p>${clean(l.subtitle)}. Practica nota a nota y consigue estrellas.</p><button class="btn" data-lesson="${l.id}">${isLocked(l)?'VER SONATA COMPLETO':finish===LESSONS.length?'REPETIR LECCIÓN':'CONTINUAR →'}</button></div></section>
      <section class="stats"><div class="stat"><div class="s-icon">✦</div><div><b>${state.xp} XP</b><small>Experiencia</small></div></div><div class="stat"><div class="s-icon">🔥</div><div><b>${state.streak} ${state.streak===1?'día':'días'}</b><small>Racha de práctica</small></div></div><div class="stat"><div class="s-icon">🎵</div><div><b>${finish} de ${LESSONS.length}</b><small>Lecciones</small></div></div></section>
      ${section('Tu camino musical','Ver lecciones','path')}
      <button class="card path-preview" data-nav="path"><div class="eyebrow">UNIDAD 1 · FUNDAMENTOS</div><div class="mini-track">${preview}</div></button>
      ${section('Tus recompensas','Ver cofres','rewards')}
      <div class="reward-banner"><span class="emoji">🎁</span><div><b>${nextChest?`Próximo cofre: ${nextChest.name}`:'¡Todos los cofres conseguidos!'}</b><p>${nextChest?`Completa ${Math.max(0,nextChest.requires-finish)} lecciones más para desbloquearlo.`:'Has abierto toda la colección actual.'}</p></div><button class="btn gold" data-nav="rewards">COFRES</button></div>`;
  }
  function lessonRow(l,i){
    const done=state.completed[l.id],locked=isLocked(l),available=isAvailable(i),disabled=!locked&&!available;
    let label=locked?'10 € · PREMIUM':done?'REPETIR':available?'EMPEZAR':'BLOQUEADO';
    return `<article class="lesson-row ${done?'completed':''} ${available&&!done&&!locked?'current':''} ${locked?'premium-row':''}"><div class="lesson-symbol">${done?'✅':locked?'🔒':l.emoji}</div><div class="lesson-copy"><b>${clean(l.title)}</b><small>${clean(l.subtitle)} · ${l.notes.length} notas</small>${done?`<div class="mini-stars">${'★'.repeat(done.stars)}${'☆'.repeat(3-done.stars)}</div>`:''}</div><button class="btn ${done||disabled?'secondary':''}" ${disabled?'disabled':''} data-lesson="${l.id}">${label}</button></article>`;
  }
  function path(){return `${heading('Tu camino musical','Aprende con ejercicios cortos y ve desbloqueando el siguiente paso.',`${completedCount()}/${LESSONS.length} LECCIONES`)}
    <div class="path-intro"><div><div class="eyebrow">TU PRIMER GRAN PASO</div><h2>Fundamentos del piano</h2><p>Una nota cada vez. ¡Haz que tu piano suene!</p></div><span class="big-note">🎹</span></div>
    <div class="unit-title">UNIDAD 1 · PRINCIPIANTE · GRATIS</div><div class="lesson-list">${LESSONS.slice(0,5).map((l,i)=>lessonRow(l,i)).join('')}</div>
    <div class="unit-title">UNIDAD 2 · INTERMEDIO · ${premiumAccess()?'ACCESO ESPECIAL':'SONATA COMPLETO'}</div><div class="lesson-list">${LESSONS.slice(5).map((l,i)=>lessonRow(l,i+5)).join('')}</div>
    <div class="notice">🎯 Las notas se verifican usando el teclado en pantalla, un piano MIDI compatible o el micrófono experimental. Las canciones del curso intermedio forman parte de Sonata Completo.</div>`}
  function songs(){return `${heading('Canciones','Melodías originales para practicar a tu ritmo.',`${SONGS.length} CANCIONES`)}<div class="song-grid">${SONGS.map(s=>`<article class="song-card"><div class="song-art">${s.emoji}</div><div class="song-details"><h3>${clean(s.title)} ${songLocked(s)?'🔒':''}</h3><p>${s.desc}${state.songScores[s.id]?` · ${'★'.repeat(state.songScores[s.id])}`:''}</p><button class="btn ${songLocked(s)?'secondary':''}" data-song="${s.id}">${songLocked(s)?'SONATA COMPLETO · 10 €':'TOCAR →'}</button></div></article>`).join('')}</div>`}
  const CHEST_COLORS={common:['#a4b2bd','#7b8997','#536778'],rare:['#7ed1ff','#3998d9','#1b649e'],epic:['#d0a1ff','#9960d6','#603698'],legendary:['#ffdf78','#e4a42e','#ae6f17'],mythic:['#ffafdc','#e75da4','#963e9a']};
  function chestSvg(c,suffix=''){
    const [light,mid,dark]=CHEST_COLORS[c.id],uid='grad-'+c.id+suffix;
    return `<svg viewBox="0 0 130 116" width="115" height="100" role="img" aria-label="Cofre ${c.name}"><defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></linearGradient></defs><ellipse cx="65" cy="104" rx="47" ry="8" fill="#3c5560" opacity=".13"/><path d="M22 48 L34 18 Q65 4 96 18 L108 48 Z" fill="url(#${uid})" stroke="${dark}" stroke-width="5" stroke-linejoin="round"/><path d="M21 50 H109 V91 Q109 99 101 99 H29 Q21 99 21 91 Z" fill="url(#${uid})" stroke="${dark}" stroke-width="5"/><path d="M32 21 L38 47 M98 21 L92 47" stroke="${dark}" stroke-width="9" opacity=".73"/><path d="M36 53 V94 M94 53 V94" stroke="${dark}" stroke-width="10" opacity=".7"/><path d="M22 52 H108" stroke="#fff" stroke-width="5" opacity=".65"/><rect x="54" y="45" width="22" height="24" rx="5" fill="#fff1b7" stroke="${dark}" stroke-width="3"/><circle cx="65" cy="56" r="4" fill="${dark}"/><path d="M10 23 l4 -9 4 9 9 4 -9 4 -4 9 -4 -9 -9 -4z" fill="${light}"/><path d="M110 12 l3 -6 3 6 6 3 -6 3 -3 6 -3 -6 -6 -3z" fill="${mid}"/></svg>`;
  }
  function chestCard(c){const opened=state.chests[c.id],unlocked=completedCount()>=c.requires;
    return `<article class="chest-card ${c.id}"><div class="chest-rarity">${clean(c.name.toUpperCase())}</div><div class="chest-visual">${opened?'🏆':chestSvg(c)}</div><h3>Cofre ${clean(c.name.toLowerCase())}</h3><p>${clean(c.desc)}</p><div class="meta">${opened?`Conseguiste ${opened.xp} XP y ${opened.coins} monedas`:`Se desbloquea al completar ${c.requires} ${c.requires===1?'lección':'lecciones'}`}</div><button class="btn" data-chest="${c.id}" ${(!unlocked||opened)?'disabled':''}>${opened?'✓ ABIERTO':unlocked?'ABRIR COFRE':'🔒 AÚN BLOQUEADO'}</button></article>`}
  function rewards(){return `${heading('Tus cofres','Cuanto más aprendes, mejores recompensas consigues.',`🪙 ${state.coins} MONEDAS`)}<div class="path-intro"><div><div class="eyebrow">RECOMPENSAS SONATA</div><h2>¡Toca, aprende y descubre!</h2><p>Hay cinco rarezas. Los cofres se abren una sola vez en este MVP y los premios se guardan en tu dispositivo.</p></div><span class="big-note">🎁</span></div>${section('Colección de cofres')}<div class="chest-grid">${CHESTS.map(chestCard).join('')}</div><p class="footer-note">Los cofres no contienen compras, dinero real ni acceso Premium.</p>`}
  function profile(){const free=premiumAccess();return `${heading('Tu perfil','Tu progreso y los ajustes de Sonata.')}<div class="profile-card"><h2>👤 Tu cuenta (modo prueba)</h2><p>Escribe un correo para simular una cuenta. No se envía ningún mensaje ni se verifica la propiedad de la dirección: todavía no hay inicio de sesión real.</p><form id="emailForm" class="field-row"><input type="email" id="emailInput" required autocomplete="email" placeholder="tu@email.com" value="${clean(state.email)}" aria-label="Correo de cuenta"><button class="btn" type="submit">GUARDAR</button></form><span class="badge">${free?'Sonata Completo · Acceso de prueba':'Plan principiante · Gratis'}</span></div>
      <div class="profile-card"><h2>📊 Tus estadísticas</h2><p><strong>${completedCount()}</strong> lecciones completas · <strong>${state.xp}</strong> XP · <strong>${state.coins}</strong> monedas · <strong>${Object.keys(state.chests).length}</strong> cofres abiertos</p><button class="btn secondary" data-nav="path">VER CAMINO MUSICAL</button></div>
      <div class="profile-card"><h2>👑 Propietario de Sonata</h2><p>El correo del propietario dispone de acceso de prueba al curso completo y puede añadir otro correo autorizado.</p>${state.email===OWNER_EMAIL?`<div class="owner-tools"><h3>Herramienta especial · Demostración</h3><form id="inviteForm" class="field-row"><input type="email" id="inviteInput" required placeholder="otro@email.com" aria-label="Nuevo correo autorizado"><button class="btn" type="submit">AUTORIZAR</button></form><p>Direcciones autorizadas en este dispositivo: ${state.invites.length?state.invites.map(clean).join(', '):'ninguna'}</p></div>`:`<div class="notice">El panel especial aparece al introducir el correo propietario. Esta identificación es solo una simulación local y NO es segura.</div>`}</div>
      <div class="profile-card"><h2>⚙️ Pruebas</h2><p>Se guardan tus datos con el almacenamiento de este navegador. Si borras los datos del sitio, se perderá el progreso.</p><button class="btn ghost" id="resetProgress">BORRAR PROGRESO DE PRUEBA</button></div>
      <p class="footer-note">MVP de evaluación. Sin cuentas verificadas, pagos operativos ni sincronización entre dispositivos.</p>`}
  function paywall(){return `${heading('Sonata Completo','El siguiente paso de tu camino musical.')}<div class="paywall"><div class="lock">🔐</div><div class="eyebrow">NIVEL INTERMEDIO Y CANCIONES</div><h1>Desbloquea todo Sonata</h1><div class="price">10 €</div><p>Precio previsto de un único pago. Incluye las lecciones intermedias y todas las canciones de esta versión.</p><button class="btn" id="fakeCheckout">COMPRA NO DISPONIBLE EN EL MVP</button><p class="small-print">No se realiza ningún cobro. Antes de vender habrá que integrar pagos reales y verificar permisos en un servidor.</p><button class="text-action" data-nav="profile">¿Tienes acceso especial? Ir al perfil ›</button></div>`}
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
    stopInputs();activity={type,id,title:data.title,notes:data.notes.slice(),index:0,correct:0,mistakes:0,attempts:0,source:'pantalla',finished:false};navigate('play');
  }
  function keyboard(){return `<div class="practice-keyboard" aria-label="Teclado de piano en pantalla"><button class="white-key" data-note="Do" aria-label="Tocar Do">Do</button><button class="black-key" aria-hidden="true" tabindex="-1"></button><button class="white-key" data-note="Re" aria-label="Tocar Re">Re</button><button class="black-key" aria-hidden="true" tabindex="-1"></button><button class="white-key" data-note="Mi" aria-label="Tocar Mi">Mi</button><button class="white-key" data-note="Fa" aria-label="Tocar Fa">Fa</button><button class="black-key" aria-hidden="true" tabindex="-1"></button><button class="white-key" data-note="Sol" aria-label="Tocar Sol">Sol</button><button class="black-key" aria-hidden="true" tabindex="-1"></button><button class="white-key" data-note="La" aria-label="Tocar La">La</button><button class="black-key" aria-hidden="true" tabindex="-1"></button><button class="white-key" data-note="Si" aria-label="Tocar Si">Si</button><button class="white-key" data-note="Do5" aria-label="Tocar Do agudo">Do↑</button></div>`}
  function playPage(){if(!activity)return home();const target=activity.notes[activity.index],percent=Math.round(activity.index/activity.notes.length*100);return `<div class="lesson-top"><button class="back-btn" id="leaveLesson" aria-label="Salir de la lección">‹</button><div style="flex:1"><div class="lesson-header"><div><h1>${clean(activity.title)}</h1><p>Nota ${activity.index+1} de ${activity.notes.length}</p></div></div>${progressBarActivity(percent)}</div></div>
    <section class="lesson-stage"><div><div class="note-label">TOCA ESTA NOTA</div><div class="target-note" id="targetNote">${target==='Do5'?'Do↑':target}</div></div><div class="staff" aria-hidden="true"><span class="note-mark">${STAFF[target]}</span></div><p class="lesson-help">${activity.type==='lesson'?clean(getLesson(activity.id).tip):'Toca la secuencia con la mejor precisión posible.'}</p>${keyboard()}<div class="lesson-feedback" id="lessonFeedback" role="status" aria-live="polite">Pulsa una tecla blanca para empezar</div></section>
    <div class="lesson-controls"><button class="btn secondary" id="hearTarget">🔊 ESCUCHAR NOTA</button><button class="btn ghost" id="enableMic">🎤 MICRÓFONO</button><button class="btn ghost" id="enableMidi">🎹 MIDI</button></div><div class="source-status" id="sourceStatus">Entrada: teclado en pantalla · Micrófono experimental · MIDI si está disponible</div>`}
  function progressBarActivity(percent){return `<div class="lesson-progress" aria-label="Progreso del ejercicio"><span id="activityBar" style="width:${percent}%"></span></div>`}
  function resultPage(){if(!activity)return home();const count=activity.notes.length,accuracy=Math.round(activity.correct/Math.max(1,activity.attempts)*100);const stars=accuracy>=95?3:accuracy>=75?2:1;const isLesson=activity.type==='lesson',data=isLesson?getLesson(activity.id):getSong(activity.id);
    return `<div class="result"><div class="result-burst">🎉</div><h1>¡${isLesson?'Lección':'Canción'} completada!</h1><p>¡Has llegado hasta la última nota!</p><div class="stars" aria-label="${stars} estrellas">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><div class="result-stats"><div><strong>${accuracy}%</strong><small>Precisión</small></div><div><strong>${count}</strong><small>Notas correctas</small></div><div><strong>+${activity.awardedXP||0}</strong><small>XP nuevos</small></div></div><p>${activity.newChest?'🎁 ¡Has desbloqueado un cofre! Ve a Recompensas para abrirlo.':'Mejora tus estrellas repitiendo la actividad.'}</p><div class="actions"><button class="btn secondary" id="retryActivity">REPETIR</button><button class="btn" data-nav="${isLesson?'path':'songs'}">CONTINUAR →</button>${activity.newChest?'<button class="btn gold" data-nav="rewards">VER COFRES</button>':''}</div></div>`}
  function navigate(next){
    if(next!=='play'&&next!=='result')stopInputs();
    route=next;
    const pages={home,path,songs,rewards,profile,premium:paywall,play:playPage,result:resultPage};
    main.innerHTML=(pages[next]||home)();
    document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('selected',el.dataset.nav===next||(next==='play'&&el.dataset.nav==='path')));
    window.scrollTo({top:0,behavior:'instant'});
    syncHeader();
  }
  function playTone(note){
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
  function handleNote(note,source='pantalla'){
    if(route!=='play'||!activity||activity.finished)return;
    if(!(note in NOTES))return;
    const pressed=document.querySelector(`[data-note="${note}"]`);
    pressed?.classList.add('pressed');if(pressed)setTimeout(()=>pressed.classList.remove('pressed'),180);
    if(source==='pantalla')playTone(note);
    activity.attempts++;
    const expected=activity.notes[activity.index];const label=document.getElementById('lessonFeedback');
    if(note===expected){
      activity.correct++;activity.index++;if(label){label.style.color='#249a7c';label.textContent='¡Muy bien! ✓'}
      if(activity.index>=activity.notes.length){activity.finished=true;setTimeout(finishActivity,450);return}
      const next=activity.notes[activity.index];document.getElementById('targetNote').textContent=next==='Do5'?'Do↑':next;
      const bar=document.getElementById('activityBar');if(bar)bar.style.width=`${activity.index/activity.notes.length*100}%`;
      const info=document.querySelector('.lesson-header p');if(info)info.textContent=`Nota ${activity.index+1} de ${activity.notes.length}`;
    }else{activity.mistakes++;if(label){label.style.color='#d38a39';label.textContent=`Has tocado ${note}. Prueba otra vez: ${expected==='Do5'?'Do agudo':expected}`}}
  }
  function updateStreak(){const today=dailyKey();if(state.lastDay===today)return;const yesterday=new Date(Date.now()-86400000).toLocaleDateString('en-CA');state.streak=state.lastDay===yesterday?state.streak+1:1;state.lastDay=today}
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
    activity.awardedXP=awardedXP;activity.newChest=newChest;save();stopInputs();navigate('result');
  }
  function openChest(id){
    const c=CHESTS.find(x=>x.id===id);if(!c||state.chests[id]||completedCount()<c.requires)return;
    const randomBetween=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    const xp=randomBetween(...c.xp),coins=randomBetween(...c.coins);
    state.chests[id]={xp,coins};state.xp+=xp;state.coins+=coins;save();navigate('rewards');
    const overlay=document.getElementById('rewardOverlay');overlay.innerHTML=`<div class="prize" role="dialog" aria-modal="true" aria-label="Recompensa"><span class="chest-icon">${chestSvg(c,"-prize")}</span><div class="eyebrow">COFRE ${clean(c.name.toUpperCase())}</div><h2>¡Qué recompensa!</h2><div class="big-reward">+${xp} XP · +${coins} 🪙</div><p>¡Sigue aprendiendo para desbloquear el siguiente cofre!</p><button class="btn" id="dismissPrize">¡GENIAL!</button></div>`;overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');document.getElementById('dismissPrize').focus();
  }
  function dismissPrize(){const ov=document.getElementById('rewardOverlay');ov.classList.remove('show');ov.setAttribute('aria-hidden','true');ov.innerHTML=''}
  function stopInputs(){
    if(micRaf)cancelAnimationFrame(micRaf);micRaf=null;
    if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
    if(micNode){micNode.disconnect();micNode=null}
    if(micSource){micSource.disconnect();micSource=null}
    if(micContext){micContext.close().catch(()=>{});micContext=null}
    if(midiInput){midiInput.onmidimessage=null;midiInput=null}
  }
  function midiToNote(number){const octave=Math.floor(number/12)-1,key=['Do',null,'Re',null,'Mi','Fa',null,'Sol',null,'La',null,'Si'][number%12];return key?(octave===4?key:octave===5&&key==='Do'?'Do5':null):null}
  async function enableMIDI(){
    if(!navigator.requestMIDIAccess){toast('MIDI no está disponible en este navegador.');return}
    try{midiAccess=await navigator.requestMIDIAccess();const inputs=[...midiAccess.inputs.values()];if(!inputs.length){toast('Conecta un piano MIDI y vuelve a probar.');return}midiInput=inputs[0];midiInput.onmidimessage=e=>{const [status,note,velocity]=e.data;if((status&0xf0)===0x90&&velocity>0){const name=midiToNote(note);if(name)handleNote(name,'midi')}};document.getElementById('sourceStatus').textContent=`MIDI activo: ${midiInput.name||'piano conectado'} · rango Do4–Do5`;toast('Piano MIDI conectado.');}catch(e){toast('No se pudo conectar el piano MIDI.')}
  }
  function autoCorrelate(buffer,sampleRate){
    let rms=0;for(let i=0;i<buffer.length;i++)rms+=buffer[i]*buffer[i];rms=Math.sqrt(rms/buffer.length);if(rms<.025)return null;
    const minLag=Math.floor(sampleRate/600),maxLag=Math.min(buffer.length-1,Math.floor(sampleRate/240));let best=-1,bestLag=-1;
    for(let lag=minLag;lag<=maxLag;lag++){let sum=0;for(let i=0;i<buffer.length-lag;i++)sum+=buffer[i]*buffer[i+lag];if(sum>best){best=sum;bestLag=lag}}
    if(bestLag<0)return null;return sampleRate/bestLag;
  }
  async function enableMic(){
    if(!navigator.mediaDevices?.getUserMedia){toast('Abre Sonata por HTTPS para usar el micrófono.');return}
    try{
      micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      const Context=window.AudioContext||window.webkitAudioContext;micContext=new Context();micSource=micContext.createMediaStreamSource(micStream);micNode=micContext.createAnalyser();micNode.fftSize=4096;micSource.connect(micNode);const buffer=new Float32Array(micNode.fftSize);
      document.getElementById('sourceStatus').textContent='Micrófono activo (experimental). Toca una nota clara y mantenida.';toast('Micrófono activado.');
      const listen=()=>{
        if(!micNode||route!=='play')return;
        micNode.getFloatTimeDomainData(buffer);const freq=autoCorrelate(buffer,micContext.sampleRate);
        if(freq){const closest=Object.entries(NOTES).reduce((a,b)=>Math.abs(b[1]-freq)<Math.abs(a[1]-freq)?b:a);const cents=1200*Math.log2(freq/closest[1]);const now=Date.now();if(Math.abs(cents)<33){if(lastDetected!==closest[0]){lastDetected=closest[0];lastDetectedAt=now}else if(now-lastDetectedAt>330){handleNote(closest[0],'micrófono');lastDetectedAt=now+750}}}
        micRaf=requestAnimationFrame(listen);
      };listen();
    }catch(e){toast('No se pudo activar el micrófono. Comprueba el permiso.');stopInputs()}
  }
  // Navegación y acciones delegadas (sobreviven a renderizados de pantalla).
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-nav]');if(nav){navigate(nav.dataset.nav);return}
    const lesson=e.target.closest('[data-lesson]');if(lesson){startActivity('lesson',lesson.dataset.lesson);return}
    const song=e.target.closest('[data-song]');if(song){startActivity('song',song.dataset.song);return}
    const chest=e.target.closest('[data-chest]');if(chest){openChest(chest.dataset.chest);return}
    const note=e.target.closest('[data-note]');if(note){handleNote(note.dataset.note);return}
    if(e.target.closest('#leaveLesson')){navigate(activity?.type==='song'?'songs':'path');return}
    if(e.target.closest('#hearTarget')&&activity){playTone(activity.notes[activity.index]);return}
    if(e.target.closest('#enableMidi')){enableMIDI();return}
    if(e.target.closest('#enableMic')){enableMic();return}
    if(e.target.closest('#dismissPrize')){dismissPrize();return}
    if(e.target.closest('#retryActivity')&&activity){startActivity(activity.type,activity.id);return}
    if(e.target.closest('#fakeCheckout')){toast('Todavía no se realizan pagos en el MVP.');return}
    if(e.target.closest('#resetProgress')){if(confirm('¿Quieres borrar todo el progreso guardado en este dispositivo?')){state=defaultState();save();navigate('home');toast('Progreso de prueba borrado.')}return}
  });
  document.addEventListener('submit',e=>{
    if(e.target.id==='emailForm'){e.preventDefault();state.email=normalize(document.getElementById('emailInput').value);save();navigate('profile');toast('Correo de prueba guardado en este dispositivo.');return}
    if(e.target.id==='inviteForm'){e.preventDefault();if(state.email!==OWNER_EMAIL)return;const email=normalize(document.getElementById('inviteInput').value);if(!email||email===OWNER_EMAIL){toast('Introduce otra dirección válida.');return}if(!state.invites.includes(email))state.invites.push(email);save();navigate('profile');toast('Correo autorizado en este dispositivo (modo prueba).')}
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){dismissPrize();return}
    if(route!=='play'||e.repeat||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
    const map={a:'Do',s:'Re',d:'Mi',f:'Fa',g:'Sol',h:'La',j:'Si',k:'Do5'};
    const note=map[e.key.toLowerCase()];if(note){e.preventDefault();handleNote(note)}
  });
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('SW:',err)));
  }
  syncHeader();navigate('home');document.documentElement.classList.add('sonata-interactiva');
})();
