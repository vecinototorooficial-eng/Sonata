/* Sonata MVP — aplicación PWA local, sin backend ni cobros. */
(() => {
  'use strict';
  const OWNER_EMAIL = 'pelayovaldivieso@gmail.com';
  const STORE_KEY = 'sonata_mvp_v1';
  const NOTE_ORDER = ['Do','Re','Mi','Fa','Sol','La','Si','Do5','Re5','Mi5','Fa5','Sol5'];
  const NOTES = {Do:261.63, Re:293.66, Mi:329.63, Fa:349.23, Sol:392.00, La:440, Si:493.88, Do5:523.25, Re5:587.33, Mi5:659.25, Fa5:698.46, Sol5:783.99};
  // Naming follows international letter names: C D E F G A B C.
  const LETTER = {Do:'C',Re:'D',Mi:'E',Fa:'F',Sol:'G',La:'A',Si:'B',Do5:'C',Re5:'D',Mi5:'E',Fa5:'F',Sol5:'G'};
  const STAFF_Y = {Do:104,Re:97,Mi:90,Fa:83,Sol:76,La:69,Si:62,Do5:55,Re5:48,Mi5:41,Fa5:34,Sol5:27};
  const prettyName = note => `${LETTER[note]} · ${note.endsWith('5')?note.replace('5',' agudo'):note}`;
  function staffDrawing(note){
    const y=STAFF_Y[note];
    const lines=[34,48,62,76,90].map(pos=>`<line x1="24" y1="${pos}" x2="336" y2="${pos}" stroke="#a9bfcc" stroke-width="1.5"/>`).join('');
    const ledger=y===104?'<line x1="166" y1="104" x2="210" y2="104" stroke="#7795a7" stroke-width="1.8"/>':'';
    return `<svg class="music-staff-svg" viewBox="0 0 360 130" role="img" aria-label="Partitura en clave de sol: nota ${prettyName(note)}">
      ${lines}${ledger}<text x="35" y="88" font-size="63" font-family="Georgia,serif" fill="#50758c">𝄞</text>
      <ellipse cx="186" cy="${y}" rx="13" ry="9" transform="rotate(-18 186 ${y})" fill="#1686d9"/>
      <line x1="198" y1="${y-2}" x2="198" y2="${y-44}" stroke="#1686d9" stroke-width="3" stroke-linecap="round"/>
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
    {id:'mint',name:'Menta',emoji:'🍃',price:15,desc:'Teclas suaves en verde agua.',color:'#3bbca5'},
    {id:'sunset',name:'Atardecer',emoji:'🌇',price:45,desc:'Un piano cálido coral y melocotón.',color:'#eb8c76'},
    {id:'night',name:'Noche',emoji:'🌙',price:90,desc:'Teclado oscuro con detalles azules.',color:'#394b79'},
    {id:'galaxy',name:'Galaxia',emoji:'🌌',price:150,desc:'Violetas y estrellas para tu piano.',color:'#926ad3'},
    {id:'gold',name:'Dorado',emoji:'👑',price:220,desc:'El teclado más brillante de Sonata.',color:'#c59a35'}
  ];
  const defaultState = () => ({xp:0,coins:0,completed:{},chests:{},songScores:{},ownedSkins:['classic'],equippedSkin:'classic',email:'',invites:[],lastDay:'',streak:0});
  function loadState(){
    try {
      const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
      if(!saved||typeof saved!=='object')return defaultState();
      return {...defaultState(),...saved,completed:saved.completed||{},chests:saved.chests||{},songScores:saved.songScores||{},invites:Array.isArray(saved.invites)?saved.invites:[],ownedSkins:Array.isArray(saved.ownedSkins)?['classic',...saved.ownedSkins.filter(id=>SKINS.some(s=>s.id===id))]:['classic'],equippedSkin:SKINS.some(s=>s.id===saved.equippedSkin)?saved.equippedSkin:'classic'};
    } catch {return defaultState()}
  }
  let state=loadState();
  let route='home',activity=null,audioContext=null,micStream=null,micContext=null,micSource=null,micNode=null,micRaf=null,lastDetected='',lastDetectedAt=0;
  let midiInput=null,midiAccess=null,toastTimeout,feedbackTimer=null,demoTimer=null,detectedCooldown=0,quietFrames=0;
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
  function syncHeader(){document.getElementById('topXP').textContent=state.xp; document.querySelector('.top-avatar').textContent=(state.email[0]||'P').toUpperCase();document.documentElement.dataset.skin=state.equippedSkin||'classic'}
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
      ${section('Tienda de skins','Ver tienda','shop')}
      <div class="reward-banner"><span class="emoji">🛍️</span><div><b>Personaliza tu piano</b><p>Consigue monedas abriendo cofres y cambia los colores de tu teclado.</p></div><button class="btn" data-nav="shop">TIENDA</button></div>
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
  function skinPreview(skin){return `<div class="skin-preview ${skin.id}" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><i></i><i></i><i></i></div>`}
  function shop(){return `${heading('Tienda de Sonata','Compra aspectos con monedas ganadas jugando.',`🪙 ${state.coins} MONEDAS`)}
    <div class="path-intro"><div><div class="eyebrow">PERSONALIZA TU PIANO</div><h2>¡Dale estilo a tu música!</h2><p>Las skins cambian el aspecto del teclado de práctica. No afectan a los aciertos ni desbloquean contenido Premium.</p></div><span class="big-note">🛍️</span></div>
    <div class="skin-grid">${SKINS.map(s=>{const owned=state.ownedSkins.includes(s.id),equipped=state.equippedSkin===s.id,canBuy=state.coins>=s.price;return `<article class="skin-card"><div class="skin-title"><span>${s.emoji}</span><b>${clean(s.name)}</b></div>${skinPreview(s)}<p>${clean(s.desc)}</p><button class="btn ${equipped?'secondary':''}" data-skin-action="${s.id}" ${(!owned&&!canBuy)?'disabled':''}>${equipped?'✓ EQUIPADA':owned?'EQUIPAR':`🪙 ${s.price} · COMPRAR`}</button></article>`}).join('')}</div>
    <p class="footer-note">Las monedas son ficticias, no se compran con dinero real y los objetos se guardan en este dispositivo.</p>`}
  function profile(){const free=premiumAccess();return `${heading('Tu perfil','Tu progreso y los ajustes de Sonata.')}<div class="profile-card"><h2>👤 Tu cuenta (modo prueba)</h2><p>Escribe un correo para simular una cuenta. No se envía ningún mensaje ni se verifica la propiedad de la dirección: todavía no hay inicio de sesión real.</p><form id="emailForm" class="field-row"><input type="email" id="emailInput" required autocomplete="email" placeholder="tu@email.com" value="${clean(state.email)}" aria-label="Correo de cuenta"><button class="btn" type="submit">GUARDAR</button></form><span class="badge">${free?'Sonata Completo · Acceso de prueba':'Plan principiante · Gratis'}</span></div>
      <div class="profile-card"><h2>📊 Tus estadísticas</h2><p><strong>${completedCount()}</strong> lecciones completas · <strong>${state.xp}</strong> XP · <strong>${state.coins}</strong> monedas · <strong>${Object.keys(state.chests).length}</strong> cofres abiertos</p><button class="btn secondary" data-nav="path">VER CAMINO MUSICAL</button> <button class="btn secondary" data-nav="shop">🛍️ TIENDA DE SKINS</button></div>
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
    stopInputs();activity={type,id,title:data.title,notes:data.notes.slice(),index:0,correct:0,mistakes:0,attempts:0,source:'pantalla',finished:false,hand:'right',chooseHand:true,waiting:false,loopStart:-1,loopEnd:-1,loopEnabled:false};navigate('play');
  }
  // Guía ilustrativa para principiantes; no sustituye la digitación de una partitura revisada.
  // La mano derecha tiene pulgar=1 e índice=2, medio=3, anular=4 y meñique=5.
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
    return {position,finger:position.notes.indexOf(note)+1,note};
  }
  function activeHand(){
    if(!activity)return 'right';
    if(activity.hand==='both')return Math.floor(activity.index/4)%2===0?'right':'left';
    return activity.hand||'right';
  }
  function fingerDiagram(note){
    const info=fingeringFor(note);
    const hand=activeHand();
    const fingertips=[{x:44,y:67},{x:67,y:39},{x:92,y:27},{x:117,y:38},{x:142,y:55}];
    const fingers=fingertips.map((f,i)=>{
      const active=i+1===info.finger;
      return `<g><line x1="${f.x}" y1="${f.y+6}" x2="${63+i*14}" y2="96" stroke="${active?'#1686d9':'#aebdca'}" stroke-width="${active?18:15}" stroke-linecap="round" />
      <circle cx="${f.x}" cy="${f.y}" r="${active?15:12}" fill="${active?'#1686d9':'#dfe8ef'}" stroke="white" stroke-width="2"/>
      <text x="${f.x}" y="${f.y+4.5}" text-anchor="middle" font-size="13" font-weight="bold" fill="${active?'white':'#647f91'}">${i+1}</text></g>`;
    }).join('');
    return `<div class="finger-training" id="fingerTraining"><div class="hand-graphic ${hand==='left'?'left-hand':''}" aria-hidden="true"><svg viewBox="0 0 190 125" role="presentation"><path d="M54 103 Q55 82 76 78 L128 80 Q145 90 138 117 L67 117 Z" fill="#dfe8ef" stroke="#bdcbd8" stroke-width="2" />${fingers}</svg></div><div class="finger-training-copy"><b>${hand==='right'?'🤚 Mano derecha':'✋ Mano izquierda'} · dedo <span id="suggestedFinger">${hand==='right'?info.finger:6-info.finger}</span></b><span id="fingerPosition">Posición: ${info.position.name} · pulgar en ${LETTER[info.position.base]} (${info.position.base.replace('5',' agudo')})</span><small>1 pulgar · 2 índice · 3 corazón · 4 anular · 5 meñique</small></div></div>`;
  }
  function updateFingerGuide(note){
    const current=document.getElementById('fingerTraining');
    if(current)current.outerHTML=fingerDiagram(note);
    const overlay=document.getElementById('keyboardHands');if(overlay)overlay.outerHTML=handOverlay(note);
    document.querySelectorAll('.white-key').forEach(key=>{
      const isTarget=key.dataset.note===note;
      key.classList.toggle('guide-target',isTarget);
      const old=key.querySelector('.finger-marker');if(old)old.remove();
      if(isTarget){const circle=document.createElement('span');circle.className='finger-marker';circle.textContent=String(activeHand()==='left'?6-fingeringFor(note).finger:fingeringFor(note).finger);circle.setAttribute('aria-label','Dedo recomendado '+circle.textContent);key.append(circle)}
    });
  }
  function handOverlay(note){
    const birthday=activity?.type==='song'&&getSong(activity.id)?.keyboard==='birthday';
    const seq=birthday?['Sol','La','Si','Do5','Re5','Mi5','Fa5','Sol5']:['Do','Re','Mi','Fa','Sol','La','Si','Do5'];
    const position=fingeringFor(note).position;
    const hand=activeHand();
    return `<div class="keyboard-hand-overlay ${hand==='left'?'mirror':''}" id="keyboardHands" aria-hidden="true">${position.notes.map((n,i)=>{
      const slot=seq.indexOf(n);if(slot<0)return '';
      const active=n===note;
      return `<span class="ghost-finger ${active?'active':''}" style="left:${((slot+.5)/seq.length*100).toFixed(3)}%;top:${[49,35,29,35,48][i]}%"><i>${hand==='left'?5-i:i+1}</i></span>`;
    }).join('')}</div>`;
  }
  function keyboard(){
    const birthday=activity?.type==='song'&&getSong(activity.id)?.keyboard==='birthday';
    const sequence=birthday?['Sol','La','Si','Do5','Re5','Mi5','Fa5','Sol5']:['Do','Re','Mi','Fa','Sol','La','Si','Do5'];
    const white=sequence.map(note=>`<button class="white-key${note===activity?.notes[activity.index]?' guide-target':''}" data-note="${note}" aria-label="Tocar ${prettyName(note)}"><span class="key-letter">${LETTER[note]}</span><span class="key-name">${note.replace('5','↑')}</span></button>`).join('');
    const blacks=(birthday?[1,2,4,5,7]:[1,2,4,5,6]).map(after=>`<span class="black-key" style="left:${after*12.5}%" aria-hidden="true"></span>`).join('');
    const letters=birthday?'G A B C D E F G':'C D E F G A B C';
    return `<div class="keyboard-guide">Teclas blancas: <b>${letters}</b>${birthday?' · Desde Sol4 hasta Sol5':''}</div><div class="practice-keyboard" aria-label="Teclado de piano con letras ${letters}"><div class="white-keys">${white}</div>${blacks}${handOverlay(activity.notes[activity.index])}</div>`;
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
        ${y===104?`<line x1="${x-17}" x2="${x+18}" y1="104" y2="104" stroke="#58788d" stroke-width="2"/>`:''}
        <ellipse cx="${x}" cy="${y}" rx="10.7" ry="7.1" transform="rotate(-18 ${x} ${y})" fill="${i===activity.index?'#0d83cd':i<activity.index?'#6ec6ac':'#2e4457'}"/>
        <line x1="${x+9}" y1="${y-1}" x2="${x+9}" y2="${y-33}" stroke="${i===activity.index?'#0d83cd':'#2e4457'}" stroke-width="2.3"/>
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
  function handChooser(){
    return `<div class="hand-chooser" id="handChooser" role="dialog" aria-modal="true" aria-label="Elige tu modo de manos">
      <div class="hand-chooser-card"><div class="eyebrow">ANTES DE EMPEZAR</div><h2>¿Con qué mano quieres practicar?</h2><p>Elige una mano y sigue las indicaciones de cada dedo.</p>
      <button class="hand-choice" data-hand="right">🤚 Mano derecha <span>→</span></button>
      <button class="hand-choice" data-hand="left">✋ Mano izquierda <span>→</span></button>
      <button class="hand-choice" data-hand="both">🙌 Ambas manos (por turnos) <span>→</span></button>
      <small>Por ahora las notas se practican de una en una. «Ambas manos» alterna la guía y no reproduce una partitura a dos voces.</small></div>
    </div>`;
  }
  function playPage(){
    if(!activity)return home();
    const target=activity.notes[activity.index],percent=Math.round(activity.index/activity.notes.length*100);
    return `<div class="lesson-top"><button class="back-btn" id="leaveLesson" aria-label="Salir de la lección">‹</button><div style="flex:1"><div class="lesson-header"><div><h1>${clean(activity.title)}</h1><p>Nota ${activity.index+1} de ${activity.notes.length}</p></div><button id="handSettings" class="small-settings" aria-label="Cambiar mano">✋ ${activity.hand==='both'?'Ambas':activity.hand==='left'?'Izquierda':'Derecha'}</button></div>${progressBarActivity(percent)}</div></div>
    <section class="lesson-stage" id="lessonStage">
      <div class="target-display"><div class="note-label">TOCA ESTA NOTA</div><div class="target-note" id="targetNote">${prettyName(target)}</div></div>
      <div class="staff" id="staffDrawing">${staffDrawing(target)}</div>
      ${scoreTimeline()}
      <p class="lesson-help">${activity.type==='lesson'?clean(getLesson(activity.id).tip):(getSong(activity.id).keyboard==='birthday'?'Cumpleaños feliz: toca las letras G, A, B, C, D, E y F en orden.':'Sigue las notas de la canción, una por una.')}</p>
      ${fingerDiagram(target)}
      ${keyboard()}
      <div class="lesson-feedback" id="lessonFeedback" role="status" aria-live="polite">🎹 Esperando una nota · toca o activa el micrófono</div>
    </section>
    <div class="lesson-controls"><button class="btn secondary" id="hearTarget">🔊 ESCUCHAR NOTA</button><button class="btn secondary" id="demoSequence">▶ ESCUCHAR FRAGMENTO</button><button class="btn ghost" id="toggleLoop" aria-pressed="${activity.loopEnabled}">⟳ ${activity.loopEnabled?'QUITAR BUCLE':'REPETIR 4 NOTAS'}</button><button class="btn ghost" id="enableMic">🎤 ACTIVAR MICRÓFONO</button><button class="btn ghost" id="enableMidi">🎹 MIDI</button></div>
    <div class="source-status" id="sourceStatus">Puedes tocar el teclado de pantalla. Para reconocer tu piano físico activa el micrófono o conecta MIDI.</div>
    ${activity.chooseHand?handChooser():''}`;
  }
  function progressBarActivity(percent){return `<div class="lesson-progress" aria-label="Progreso del ejercicio"><span id="activityBar" style="width:${percent}%"></span></div>`}
  function resultPage(){if(!activity)return home();const count=activity.notes.length,accuracy=Math.round(activity.correct/Math.max(1,activity.attempts)*100);const stars=accuracy>=95?3:accuracy>=75?2:1;const isLesson=activity.type==='lesson',data=isLesson?getLesson(activity.id):getSong(activity.id);
    return `<div class="result"><div class="result-burst">🎉</div><h1>¡${isLesson?'Lección':'Canción'} completada!</h1><p>¡Has llegado hasta la última nota!</p><div class="stars" aria-label="${stars} estrellas">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><div class="result-stats"><div><strong>${accuracy}%</strong><small>Precisión</small></div><div><strong>${count}</strong><small>Notas correctas</small></div><div><strong>+${activity.awardedXP||0}</strong><small>XP nuevos</small></div></div><p>${activity.newChest?'🎁 ¡Has desbloqueado un cofre! Ve a Recompensas para abrirlo.':'Mejora tus estrellas repitiendo la actividad.'}</p><div class="actions"><button class="btn secondary" id="retryActivity">REPETIR</button><button class="btn" data-nav="${isLesson?'path':'songs'}">CONTINUAR →</button>${activity.newChest?'<button class="btn gold" data-nav="rewards">VER COFRES</button>':''}</div></div>`}
  function navigate(next){
    if(next!=='play'&&next!=='result')stopInputs();
    route=next;
    const pages={home,path,songs,rewards,shop,profile,premium:paywall,play:playPage,result:resultPage};
    main.innerHTML=(pages[next]||home)();
    document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('selected',el.dataset.nav===next||(next==='play'&&el.dataset.nav==='path')));
    window.scrollTo({top:0,behavior:'instant'});
    syncHeader();
    if(next==='play' && activity){updateFingerGuide(activity.notes[activity.index]);updateScore();}
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
    if(route!=='play'||!activity||activity.finished||activity.waiting||activity.chooseHand)return;
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
  function buyOrEquipSkin(id){
    const skin=SKINS.find(x=>x.id===id);if(!skin)return;
    if(!state.ownedSkins.includes(id)){
      if(state.coins<skin.price){toast('Necesitas más monedas. ¡Abre cofres!');return}
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
    const overlay=document.getElementById('rewardOverlay');overlay.innerHTML=`<div class="prize" role="dialog" aria-modal="true" aria-label="Recompensa"><span class="chest-icon">${chestSvg(c,"-prize")}</span><div class="eyebrow">COFRE ${clean(c.name.toUpperCase())}</div><h2>¡Qué recompensa!</h2><div class="big-reward">+${xp} XP · +${coins} 🪙</div><p>¡Sigue aprendiendo para desbloquear el siguiente cofre!</p><button class="btn" id="dismissPrize">¡GENIAL!</button></div>`;overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');document.getElementById('dismissPrize').focus();
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
  function autoCorrelate(buffer,sampleRate){
    const n=buffer.length;
    let energy=0;for(let i=0;i<n;i++)energy+=buffer[i]*buffer[i];
    const rms=Math.sqrt(energy/n);if(rms<.018)return null;
    // Normalised autocorrelation for C4–G5. It can still mistake harmonics in noisy rooms.
    const minLag=Math.floor(sampleRate/850),maxLag=Math.min(Math.floor(sampleRate/240),n/2);
    let bestScore=-1,bestLag=0;
    for(let lag=minLag;lag<=maxLag;lag++){
      let sum=0,energyA=0,energyB=0;
      for(let i=0;i<n-lag;i+=2){const a=buffer[i],b=buffer[i+lag];sum+=a*b;energyA+=a*a;energyB+=b*b;}
      const score=sum/Math.sqrt(Math.max(1e-9,energyA*energyB));
      if(score>bestScore){bestScore=score;bestLag=lag;}
    }
    if(bestScore<.72||!bestLag)return null;
    return sampleRate/bestLag;
  }
  async function enableMic(){
    if(!navigator.mediaDevices?.getUserMedia){toast('Abre Sonata por HTTPS para usar el micrófono.');return}
    try{
      micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});lastDetected='';lastDetectedAt=0;detectedCooldown=0;quietFrames=0;
      const Context=window.AudioContext||window.webkitAudioContext;micContext=new Context();micSource=micContext.createMediaStreamSource(micStream);micNode=micContext.createAnalyser();micNode.fftSize=4096;micSource.connect(micNode);const buffer=new Float32Array(micNode.fftSize);
      document.getElementById('sourceStatus').textContent='Micrófono activo (experimental). Toca una nota clara y mantenida.';toast('Micrófono activado.');
      const listen=()=>{
        if(!micNode||route!=='play')return;
        micNode.getFloatTimeDomainData(buffer);const freq=autoCorrelate(buffer,micContext.sampleRate);
        if(!freq){quietFrames++;if(quietFrames>5){lastDetected='';lastDetectedAt=0}}else{
          quietFrames=0;
          const closest=Object.entries(NOTES).reduce((a,b)=>Math.abs(b[1]-freq)<Math.abs(a[1]-freq)?b:a);
          const cents=1200*Math.log2(freq/closest[1]);const now=Date.now();
          if(Math.abs(cents)<32){
            if(lastDetected!==closest[0]){lastDetected=closest[0];lastDetectedAt=now}
            else if(now-lastDetectedAt>280 && now>detectedCooldown){handleNote(closest[0],'micrófono');detectedCooldown=now+650;lastDetectedAt=Infinity;}
          }
        }
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
    const skin=e.target.closest('[data-skin-action]');if(skin){buyOrEquipSkin(skin.dataset.skinAction);return}
    const note=e.target.closest('[data-note]');if(note){handleNote(note.dataset.note);return}
    if(e.target.closest('#leaveLesson')){navigate(activity?.type==='song'?'songs':'path');return}
    if(e.target.closest('#hearTarget')&&activity){if(micStream){stopMicrophoneOnly();document.getElementById('sourceStatus').textContent='Micrófono pausado para evitar que el ejemplo se detecte como una nota tocada. Actívalo de nuevo para escuchar tu piano.'}playTone(activity.notes[activity.index]);return}
    if(e.target.closest('#enableMidi')){enableMIDI();return}
    if(e.target.closest('#enableMic')){enableMic();return}
    const hand=e.target.closest('[data-hand]');if(hand&&activity){activity.hand=hand.dataset.hand;activity.chooseHand=false;navigate('play');return}
    if(e.target.closest('#handSettings')&&activity){activity.chooseHand=true;navigate('play');return}
    if(e.target.closest('#toggleLoop')&&activity){
      activity.loopEnabled=!activity.loopEnabled;
      if(activity.loopEnabled){activity.loopStart=activity.index;activity.loopEnd=Math.min(activity.notes.length,activity.index+4)}
      else{activity.loopStart=-1;activity.loopEnd=-1}
      const btn=document.getElementById('toggleLoop');btn.textContent=activity.loopEnabled?'⟳ QUITAR BUCLE':'⟳ REPETIR 4 NOTAS';btn.setAttribute('aria-pressed',String(activity.loopEnabled));
      toast(activity.loopEnabled?'Repitiendo este fragmento de 4 notas.':'Repetición desactivada.');return;
    }
    if(e.target.closest('#demoSequence')&&activity){
      clearTimeout(demoTimer);
      // Prevent playback from being mistaken for an external instrument.
      if(micStream)stopMicrophoneOnly();
      const segment=activity.notes.slice(activity.index,activity.index+4);
      segment.forEach((n,i)=>{demoTimer=setTimeout(()=>playTone(n),i*560)});
      document.getElementById('sourceStatus').textContent='Escuchando ejemplo (4 notas). El micrófono se ha desactivado para evitar falsos aciertos.';
      return;
    }
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
    const map={c:'Do',d:'Re',e:'Mi',f:'Fa',g:'Sol',a:'La',b:'Si',8:'Do5'};
    const note=map[e.key.toLowerCase()];if(note){e.preventDefault();handleNote(note)}
  });
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('SW:',err)));
  }
  syncHeader();navigate('home');document.documentElement.classList.add('sonata-interactiva');
})();
