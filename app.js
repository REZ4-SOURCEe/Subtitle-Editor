/* transport */
function seek(t){follow=true;T=clamp(t,0,dur());if(hasVideo)V.currentTime=T;dirty=1}
function setP(on){playing=on;if(on)follow=true;$('#pp').replaceChildren(ico(on?'pause':'play'));$('#fcp').replaceChildren(ico(on?'pause':'play'));$('#pp').setAttribute('aria-label',on?'Pause':'Play');dirty=1}
function play(on){if(hasVideo){if(on)V.play().catch(()=>toast('Playback was blocked. Tap play again.'));else V.pause()}else{if(on&&T>=dur())T=0;setP(on)}}
V.onplay=()=>setP(true);V.onpause=()=>setP(false);V.onended=()=>setP(false);
V.onloadedmetadata=()=>{hasVideo=true;vb.classList.add('hv');V.playbackRate=rate;seek(T);toast('Video loaded')};
V.onerror=()=>{if(!V.getAttribute('src'))return;hasVideo=false;vb.classList.remove('hv');toast('This browser cannot play that file (MKV/HEVC?). Use MP4 (H.264) or WebM.')};
vb.onclick=()=>play(!playing);$('#fs').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else if(vb.requestFullscreen)vb.requestFullscreen();else if(V.webkitEnterFullscreen)V.webkitEnterFullscreen()};
$('#pp').onclick=()=>play(!playing);$('#b1').onclick=()=>seek(T-5);$('#b4').onclick=()=>seek(T+5);$('#b2').onclick=()=>seek(T-.04);$('#b3').onclick=()=>seek(T+.04);
$('#rt').onclick=()=>{const R=[.5,1,1.5,2];rate=R[(R.indexOf(rate)+1)%R.length];V.playbackRate=rate;$('#rt').textContent=rate+'x'};$('#sk').oninput=ev=>seek(+ev.target.value);
let lastRow=-9,lastTL=0;function hud(d){fcUpd();$('#tm').textContent=fm(T)+' / '+fm(dur());const s=$('#sk');s.max=dur();if(document.activeElement!==s)s.value=T;if(Math.abs(T-lastRow)>.05||d){lastRow=T;A.ev.forEach(e=>{const r=rows.get(e.id);if(r)r.classList.toggle('act',T>=e.start&&T<e.end)});lfScroll(0)}}
let last=performance.now(),lastDraw=-1;
function loop(ts){requestAnimationFrame(loop);const dt=Math.min((ts-last)/1000,.2);last=ts;
if(playing){if(hasVideo){if(!V.seeking)T=V.currentTime}else{T+=dt*rate;if(T>=dur()){T=dur();setP(false)}}}
if(playing||dirty||T!==lastDraw){const d=dirty;dirty=0;lastDraw=T;try{drawSubs(d);if(d||!playing||ts-lastTL>60){drawTL();lastTL=ts}hud(d)}catch(e){console.error(e)}}}
/* files */
const isVid=f=>/^video\//.test(f.type)||/\.(mp4|mkv|webm|mov|m4v)$/i.test(f.name);
async function loadAss(f){try{const b=await f.arrayBuffer();const u=new Uint8Array(b);let t=u[0]===255&&u[1]===254?new TextDecoder('utf-16le').decode(b):u[0]===254&&u[1]===255?new TextDecoder('utf-16be').decode(b):new TextDecoder('utf-8').decode(b);if(!(u[0]>=254)&&t.includes('\uFFFD')){try{t=new TextDecoder('windows-1256').decode(b)}catch(e){}}
const srt=/\d+:\d+[,.]\d{1,3}\s*-->\s*\d+:\d+/.test(t)&&!/\[events\]/i.test(t);if(!srt&&!/\[(script info|events|v4\+? styles)\]/i.test(t))return toast('That file is not an .ass, .srt or .vtt subtitle');
A=srt?parseSrt(t,f.name.replace(/\.\w+$/,'')):parse(t);drafts.clear();if(A.fonts&&A.fonts.length)await loadFileFonts(A.fonts);delete A.fonts;sel=A.ev[0]?A.ev[0].id:null;ss=0;hist=[];hi=-1;lastD='';commit('import');all();seek(A.ev[0]?A.ev[0].start:0);toast('Imported '+A.ev.length+' lines')}catch(x){toast('Could not read that file')}}
function loadVid(f){if(vurl)URL.revokeObjectURL(vurl);hasVideo=false;setP(false);vurl=URL.createObjectURL(f);V.src=vurl;V.load()}
const loadAny=f=>isVid(f)?loadVid(f):loadAss(f);
for(const id of['fa','fv'])$('#'+id).onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)loadAny(f)};
$('#bi').onclick=()=>$('#fa').click();$('#bv').onclick=()=>$('#fv').click();
addEventListener('dragover',e=>e.preventDefault());addEventListener('drop',e=>{e.preventDefault();[...e.dataTransfer.files].forEach(loadAny)});
const defName=()=>((gi('Title')||'subtitles').replace(/[\\\/:*?"<>|]+/g,'_').trim()||'subtitles');
$('#be').onclick=()=>{flushDrafts();const xn=$('#xn'),d=defName();if(!xn.value||xn.value===xn.dataset.a)xn.value=d;xn.dataset.a=d;$('#xp').hidden=false};
const xs={f:'ass',d:'keep'};document.querySelectorAll('#xf button,#xd button').forEach(b=>b.onclick=()=>{const g=b.parentNode;g.querySelectorAll('button').forEach(x=>x.classList.toggle('p',x===b));xs[g.id==='xf'?'f':'d']=b.dataset.v;$('#xe').textContent='.'+xs.f});
$('#xc2').onclick=()=>{$('#xp').hidden=true};
$('#xg').onclick=()=>{const o={dir:xs.d,nodot:$('#xr').checked},n=($('#xn').value.replace(/[\\\/:*?"<>|]+/g,'_').replace(/\.(ass|srt|txt)$/i,'').trim()||defName()),txt=xs.f==='srt'?serSrt(A,o):ser(A,o),a=h('a',{href:URL.createObjectURL(new Blob([txt],{type:'application/octet-stream'})),download:n+'.'+xs.f});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);$('#xp').hidden=true};
$('#bu').onclick=undo;$('#br').onclick=redo;$('#la').onclick=add;$('#ld').onclick=dup;$('#ls').onclick=split;$('#lx').onclick=del;$('#le').onclick=()=>tab('edit');$('#lu').onclick=()=>mv(-1);$('#lw').onclick=()=>mv(1);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
addEventListener('keydown',ev=>{if(/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName))return;const m=ev.ctrlKey||ev.metaKey;
if(ev.code==='Space'){ev.preventDefault();play(!playing)}else if(ev.key==='ArrowLeft')seek(T-.04);else if(ev.key==='ArrowRight')seek(T+.04);else if(m&&ev.key==='z'){ev.preventDefault();ev.shiftKey?redo():undo()}else if(m&&ev.key==='y'){ev.preventDefault();redo()}});
if('serviceWorker'in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
addEventListener('error',e=>toast('Error: '+e.message));
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushDrafts(1)});addEventListener('pagehide',()=>flushDrafts(1));
(async()=>{try{const s=await idb('get','p');if(s){const a=JSON.parse(s);if(a&&a.ev&&a.styles&&a.info){A=a;sel=A.ev[0]?A.ev[0].id:null;if(A.ev.length)toast('Restored your last project')}}}catch(e){}
try{const fs=await idb('get','f');if(fs&&fs.length)await restoreFonts(fs)}catch(e){}
document.querySelectorAll('[data-i]').forEach(b=>b.prepend(ico(b.dataset.i)));commit('init');all();requestAnimationFrame(loop)})();

$('#ff').onchange=async e=>{for(const f of e.target.files)await addFont(f);e.target.value=''};

{const ed=$('#edit'),isT=t=>(t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&t.type!=='checkbox'));
ed.addEventListener('focusin',ev=>{if(!isT(ev.target))return;document.body.classList.add('kb');const t=ev.target;setTimeout(()=>t.scrollIntoView({block:'center'}),350)});
ed.addEventListener('focusout',()=>setTimeout(()=>{if(!ed.contains(document.activeElement))document.body.classList.remove('kb')},150));
window.addEventListener('resize',()=>{const t=document.activeElement;if(t&&ed.contains(t)&&isT(t))setTimeout(()=>t.scrollIntoView({block:'center'}),100)})}

const ask=(t,m,ok)=>new Promise(r=>{const c=$('#cf'),end=v=>{c.hidden=true;r(v)};$('#ct').textContent=t;$('#cm').textContent=m;$('#co').textContent=ok;c.hidden=false;$('#co').onclick=()=>end(1);$('#cn').onclick=()=>end(0);c.onclick=ev=>{if(ev.target===c)end(0)}});
$('#bn').onclick=async()=>{if(!await ask('Delete project?','The current project will be removed. Export it first if you still need it.','Delete'))return;A=newA();drafts.clear();sel=null;ss=0;hist=[];hi=-1;lastD='';commit('new');all();seek(0);toast('Project deleted')};

const fsOn=()=>document.fullscreenElement===vb||vb.classList.contains('fsx');
let fcT=0;const showFC=()=>{const c=$('#fc');c.classList.add('show');clearTimeout(fcT);fcT=setTimeout(()=>c.classList.remove('show'),4000)};
async function enterFS(){let ok=false;try{if(vb.requestFullscreen){await vb.requestFullscreen();ok=true;try{await screen.orientation.lock('landscape')}catch(e){}}}catch(e){}if(!ok)vb.classList.add('fsx');dirty=1;showFC()}
function exitFS(){try{screen.orientation.unlock()}catch(e){}vb.classList.remove('fsx');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});$('#fc').classList.remove('show');dirty=1}
function fcUpd(){if(!fsOn())return;const s=$('#fcs');s.max=dur();if(document.activeElement!==s)s.value=T;$('#fct').textContent=fm(T)+' / '+fm(dur())}
$('#fs').onclick=()=>fsOn()?exitFS():enterFS();$('#fcx').onclick=exitFS;
$('#fcp').onclick=()=>{play(!playing);showFC()};$('#fcb').onclick=()=>{seek(T-5);showFC()};$('#fcf').onclick=()=>{seek(T+5);showFC()};$('#fcs').oninput=ev=>{seek(+ev.target.value);showFC()};
vb.onclick=ev=>{if(sdJ)return;if(fsOn()){if(!ev.target.closest('#fc')){const c=$('#fc');if(c.classList.contains('show'))c.classList.remove('show');else showFC()}return}play(!playing)};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){try{screen.orientation.unlock()}catch(e){}if(!vb.classList.contains('fsx'))$('#fc').classList.remove('show');dirty=1}});
if(window.ResizeObserver)new ResizeObserver(()=>{dirty=1}).observe(vb);addEventListener('resize',()=>{dirty=1});addEventListener('orientationchange',()=>{[100,400,900].forEach(t=>setTimeout(()=>{dirty=1},t))});document.addEventListener('fullscreenchange',()=>{[0,150,500].forEach(t=>setTimeout(()=>{dirty=1},t))});

/* edit mode: drag a subtitle on the video to place it (no tags to type) */
let sd=null,sdJ=false;
function setMar(e,b,dx,dy){const l=b.l+dx,r=b.r+dx,n=b.n+dy,M=v=>Math.max(1,Math.round(v));
if(b.col===0)e.marginl=M(l/b.sx);else if(b.col===2)e.marginr=M((b.fw-r)/b.sx);else{const c2=l+r;if(c2<=b.fw){e.marginl=1;e.marginr=M((b.sx+b.fw-c2)/b.sx)}else{e.marginr=1;e.marginl=M((c2-b.fw+b.sx)/b.sx)}}
if(b.row===2)e.marginv=M((b.fh-n-b.H)/b.sy);else if(b.row===0)e.marginv=M(n/b.sy);else if(!sd.warn&&Math.abs(dy)>12){sd.warn=1;toast('Middle alignment can only move left/right. Use Top or Bottom to move it up/down.')}}
function setAn(e,n){const t=e.text.replace(/\\an[1-9]/g,'').replace(/\{\}/g,'');e.text=t[0]==='{'?'{\\an'+n+t.slice(1):'{\\an'+n+'}'+t}
function setPos(e,x,y){const t=e.text.replace(/\\(?:pos|move)\([^)]*\)/g,'').replace(/\{\}/g,''),p='\\pos('+x+','+y+')';e.text=t[0]==='{'?'{'+p+t.slice(1):'{'+p+'}'+t}
vb.addEventListener('pointerdown',ev=>{if(ev.target.closest('#fc'))return;const r=cvs.getBoundingClientRect(),px=ev.clientX-r.left,py=ev.clientY-r.top;if(mvAct!==null&&mvHook){const p=mvInfo();if(p){const f=fit(),sx=f.w/(num(gi('PlayResX'),1920)||1920),sy=f.h/(num(gi('PlayResY'),1080)||1080);md={k:mvAct,id:ev.pointerId,x0:ev.clientX,y0:ev.clientY,ox:p[mvAct*2]*sx,oy:p[mvAct*2+1]*sy,sx,sy};try{vb.setPointerCapture(ev.pointerId)}catch(x){}return}}if(!tlEdit)return;let b=null;for(let i=subBoxes.length-1;i>=0;i--){const q=subBoxes[i];if(px>=q.l-8&&px<=q.r+8&&py>=q.t-8&&py<=q.b+8){b=q;break}}if(b){const e1=A.ev.find(x=>x.id===b.id);if(e1&&/\\move\(/.test(e1.text)){toast('This line slides from S to E: use the Move buttons in the Edit tab');return}sd={b,x0:ev.clientX,y0:ev.clientY,moved:false,id:ev.pointerId}}});
vb.addEventListener('pointermove',ev=>{if(!sd||ev.pointerId!==sd.id)return;const dx=ev.clientX-sd.x0,dy=ev.clientY-sd.y0;if(!sd.moved){if(Math.hypot(dx,dy)<8)return;sd.moved=true;try{vb.setPointerCapture(ev.pointerId)}catch(x){}flushDrafts(1);if(sel!==sd.b.id)select(sd.b.id);const e0=A.ev.find(x=>x.id===sd.b.id);if(e0&&(sd.b.p||sd.b.row===1)){const b=sd.b;e0.text=e0.text.replace(/\\(?:pos|move)\([^)]*\)/g,'').replace(/\{\}/g,'');let row=b.row;if(row===1){row=(b.t+b.b)/2>b.fh/2?2:0;setAn(e0,(row===2?1:7)+b.col)}sd.b={...b,p:false,row}}}
const e=A.ev.find(x=>x.id===sd.b.id);if(!e)return;if(sd.b.p)setPos(e,Math.round((sd.b.ax+dx)/sd.b.sx),Math.round((sd.b.ay+dy)/sd.b.sy));else setMar(e,sd.b,dx,dy);dirty=1});
const sdEnd=ev=>{if(!sd||ev.pointerId!==sd.id)return;const s=sd;sd=null;if(s.moved){sdJ=true;setTimeout(()=>{sdJ=false},80);const e=A.ev.find(x=>x.id===s.b.id);if(e){chg('pos'+e.id);renderEdit()}}};
vb.addEventListener('pointerup',sdEnd);vb.addEventListener('pointercancel',sdEnd);

/* auto-scroll the lines list with the playhead */
let lfOn=false,lfId=null;try{lfOn=localStorage.getItem('lfo')==='1'}catch(e){}
function lfScroll(force){if(!lfOn)return;const L=$('#list');if(!L||!L.clientHeight)return;let c=null;for(const e of A.ev){if(e.start<=T)c=e;else break}if(!c)return;if(!force&&c.id===lfId)return;const r=rows.get(c.id);if(!r)return;lfId=c.id;const lr=L.getBoundingClientRect(),rr=r.getBoundingClientRect();L.scrollBy({top:rr.top-lr.top-(L.clientHeight-rr.height)/2,behavior:'smooth'})}
const lfb=$('#lf'),lfUI=()=>{lfb.classList.toggle('p',lfOn);lfb.setAttribute('aria-pressed',lfOn)};
lfb.onclick=()=>{lfOn=!lfOn;lfId=null;try{localStorage.setItem('lfo',lfOn?'1':'0')}catch(e){}lfUI();toast(lfOn?'List follows playback':'List auto-scroll off');lfScroll(1)};
lfUI();

/* Move effect: after tapping Start/End in the Move panel, touch or drag on the video to place that point */
let md=null;
function mdPlace(ev){if(!mvHook||!md)return;mvHook(md.k,Math.round((md.ox+ev.clientX-md.x0)/md.sx),Math.round((md.oy+ev.clientY-md.y0)/md.sy));dirty=1}
vb.addEventListener('pointermove',ev=>{if(md&&ev.pointerId===md.id)mdPlace(ev)});
const mdEnd=ev=>{if(!md||ev.pointerId!==md.id)return;md=null;sdJ=true;setTimeout(()=>{sdJ=false},80)};
vb.addEventListener('pointerup',mdEnd);vb.addEventListener('pointercancel',mdEnd);
