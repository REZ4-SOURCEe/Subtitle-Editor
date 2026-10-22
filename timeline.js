/* timeline */
const TLc=$('#tlc');let follow=true;const fvis=()=>{if(playing)follow=!(T<tv0||T>tv0+span*.9)};
function drawTL(){const c=TLc,w=c.clientWidth,hh=c.clientHeight,dpr=devicePixelRatio||1;if(!w)return;if(c.width!==Math.round(w*dpr)||c.height!==Math.round(hh*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(hh*dpr)}
const x=c.getContext('2d'),D=dur();x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,hh);span=clamp(span,2,Math.max(D,2));
if(playing&&follow&&(T<tv0||T>tv0+span*.9))tv0=T-span*.1;tv0=clamp(tv0,0,Math.max(0,D-span));const X=t=>(t-tv0)/span*w;
x.fillStyle='#8b949e';x.strokeStyle='#30363d';x.font='9px ui-monospace,monospace';x.textAlign='left';x.textBaseline='alphabetic';
const st=[.5,1,2,5,10,15,30,60,120,300,600].find(s=>w/span*s>=50)||600;
for(let t=Math.ceil(tv0/st)*st;t<=tv0+span;t+=st){const px=X(t);x.beginPath();x.moveTo(px,0);x.lineTo(px,hh);x.stroke();x.fillText(fm(t),px+2,9)}
const vis=A.ev.filter(e=>e.end>=tv0&&e.start<=tv0+span),lanes=[],pl=vis.map(e=>{let i=lanes.findIndex(le=>e.start>=le);if(i<0){i=lanes.length;lanes.push(0)}lanes[i]=e.end;return[e,i]});
const lh=clamp((hh-16)/Math.max(lanes.length,1)-2,8,22);hits=[];
for(const[e,i]of pl){const x1=X(e.start),x2=X(e.end),y=14+i*(lh+2),bx=Math.max(0,x1),bw=Math.max(2,Math.min(w,x2)-bx);if(y+lh>hh)continue;
x.fillStyle=e.id===sel?'#388bfd':T>=e.start&&T<e.end?'#1f6feb':e.type==='Comment'?'#30363d':'#1c3a5e';if(mvOn&&e.id===sel){x.shadowColor='rgba(0,0,0,.8)';x.shadowBlur=10;x.fillStyle='#9a5b1e'}x.fillRect(bx,y,bw,lh);x.shadowBlur=0;if(e.id===sel){x.strokeStyle=mvOn?'#f0883e':'#79c0ff';x.lineWidth=mvOn?2:1;x.strokeRect(bx+.5,y+.5,bw-1,lh-1);x.lineWidth=1;if(tlEdit){x.fillStyle=mvOn?'#f0883e':'#f0f6fc';if(x1>=-1)x.fillRect(x1,y,6,lh);if(x2<=w+1)x.fillRect(x2-6,y,6,lh);x.fillStyle='#0d1117';if(x1>=-1)x.fillRect(x1+2.5,y+lh*.3,1,lh*.4);if(x2<=w+1)x.fillRect(x2-3.5,y+lh*.3,1,lh*.4);}if(drag&&(drag.m==='mv'||drag.m==='tl')&&drag.moved){x.fillStyle='#f0883e';x.fillText(s2t(e.start)+' → '+s2t(e.end),clamp(bx,0,w-130),y-2)}}
if(bw>24){x.save();x.beginPath();x.rect(bx,y,bw,lh);x.clip();x.fillStyle='#e6edf3';x.fillText(strip(e.text),bx+4,y+lh/2+3);x.restore()}hits.push({e,x1,x2,y,h:lh})}
const cx=X(T);x.strokeStyle='#f85149';x.lineWidth=1.5;x.beginPath();x.moveTo(cx,0);x.lineTo(cx,hh);x.stroke();x.lineWidth=1}
const tlP=new Map();let tlG=null,tlV=0,tlRaf=0,lastMv=null;
function tlFling(){cancelAnimationFrame(tlRaf);let last=performance.now();const step=now=>{const dt=Math.min(now-last,40);last=now;const mx=Math.max(0,dur()-span);tv0+=tlV*dt;tlV*=Math.pow(.9975,dt);if(tv0<=0||tv0>=mx){tv0=clamp(tv0,0,mx);tlV=0}dirty=1;fvis();if(Math.abs(tlV)/span*(TLc.clientWidth||1)>.02)tlRaf=requestAnimationFrame(step);else tlV=0};tlRaf=requestAnimationFrame(step)}
TLc.addEventListener('pointerdown',ev=>{cancelAnimationFrame(tlRaf);tlV=0;lastMv={x:ev.clientX,t:performance.now()};TLc.setPointerCapture(ev.pointerId);tlP.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
if(tlP.size===1){const r0=TLc.getBoundingClientRect(),px=ev.clientX-r0.left,py=ev.clientY-r0.top,HT=tlEdit&&hits.find(q=>q.e.id===sel&&py>=q.y-6&&py<=q.y+q.h+6),hz=HT?Math.min(12,(HT.x2-HT.x1)/3+3):0,dS=HT&&HT.x1>=-1?Math.abs(px-HT.x1):1e9,dE=HT&&HT.x2<=r0.width+1?Math.abs(px-HT.x2):1e9,HB=tlEdit&&hits.find(q=>px>=q.x1&&px<=q.x2&&py>=q.y&&py<=q.y+q.h);clearTimeout(lpT);
if(HT&&Math.min(dS,dE)<=hz){if(drafts.size)flushDrafts(1);drag={m:'tl',e:HT.e,side:dS<=dE?'s':'e',x0:ev.clientX,s0:HT.e.start,e0:HT.e.end,moved:false}}
else{drag={m:'pan',x0:ev.clientX,y0:ev.clientY,tv:tv0,moved:false};if(HB)lpT=setTimeout(()=>{if(!drag||drag.m!=='pan'||drag.moved||tlP.size!==1)return;if(sel!==HB.e.id)select(HB.e.id);if(drafts.size)flushDrafts(1);drag={m:'mv',e:HB.e,x0:drag.x0,s0:HB.e.start,len:HB.e.end-HB.e.start,moved:false};mvOn=true;try{navigator.vibrate&&navigator.vibrate(25)}catch(e){}dirty=1},380)}tlG=null}
else if(tlP.size===2){if(drag&&(drag.m==='mv'||drag.m==='tl')){mvFin(drag);drag=null;mvOn=false}const[p,q]=[...tlP.values()];tlG={d:Math.hypot(p.x-q.x,p.y-q.y)||1,span,mx:(p.x+q.x)/2};if(drag)drag.moved=true}});
TLc.addEventListener('pointermove',ev=>{if(!tlP.has(ev.pointerId))return;tlP.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});const r=TLc.getBoundingClientRect();
if(drag&&drag.m==='tl'&&tlP.size===1){const dx=ev.clientX-drag.x0;if(Math.abs(dx)>5)drag.moved=true;if(drag.moved){const e=drag.e,sn=t=>Math.abs((t-T)/span*r.width)<8?T:t,d=dx/r.width*span;if(drag.side==='s')e.start=clamp(sn(drag.s0+d),0,Math.max(0,e.end-.1));else{let n=sn(drag.e0+d);if(hasVideo)n=Math.min(n,dur());e.end=Math.max(n,e.start+.1)}dirty=1}return}
if(drag&&drag.m==='mv'&&tlP.size===1){const dx=ev.clientX-drag.x0;if(Math.abs(dx)>6)drag.moved=true;if(drag.moved){let s=drag.s0+dx/r.width*span;s=Math.max(0,s);if(hasVideo)s=Math.min(s,Math.max(0,dur()-drag.len));drag.e.start=s;drag.e.end=s+drag.len;dirty=1}return}
if(tlP.size>=2&&tlG){const[p,q]=[...tlP.values()],d=Math.hypot(p.x-q.x,p.y-q.y)||1,fx=((p.x+q.x)/2-r.left)/r.width,tAt=tv0+fx*span;span=clamp(tlG.span*tlG.d/d,2,Math.max(dur(),2));tv0=tAt-fx*span;dirty=1;fvis();return}
if(!drag||drag.m!=='pan')return;const dx=ev.clientX-drag.x0;if(Math.abs(dx)>6||Math.abs(ev.clientY-drag.y0)>6)drag.moved=true;
if(drag.moved){const now=performance.now(),dt=now-lastMv.t;if(dt>0){tlV=tlV*.6+(-(ev.clientX-lastMv.x)/r.width*span/dt)*.4;lastMv={x:ev.clientX,t:now}}tv0=clamp(drag.tv-dx/r.width*span,0,Math.max(0,dur()-span));dirty=1;fvis()}});
const tlEnd=ev=>{const d=drag;tlP.delete(ev.pointerId);if(tlP.size<2)tlG=null;if(tlP.size===0){clearTimeout(lpT);mvOn=false;if(d&&(d.m==='mv'||d.m==='tl'))mvFin(d);drag=null;if(d&&d.m==='pan'&&d.moved&&ev.type==='pointerup'&&lastMv&&performance.now()-lastMv.t<90&&Math.abs(tlV)/span*(TLc.clientWidth||1)>.15)tlFling();else tlV=0;if(d&&(d.m==='pan'||d.m==='tl')&&!d.moved&&ev.type==='pointerup'){const r=TLc.getBoundingClientRect(),px=ev.clientX-r.left,py=ev.clientY-r.top,H=hits.find(q=>px>=q.x1-4&&px<=q.x2+4&&py>=q.y&&py<=q.y+q.h);if(H)select(H.e.id);seek(tv0+px/r.width*span)}}else if(tlP.size===1){const[p]=[...tlP.values()];drag={m:'pan',x0:p.x,y0:p.y,tv:tv0,moved:true}}};
TLc.addEventListener('pointerup',tlEnd);TLc.addEventListener('pointercancel',tlEnd);
function tlCenter(e){cancelAnimationFrame(tlRaf);tlV=0;const D=dur(),mid=(e.start+e.end)/2;tv0=clamp(e.end-e.start>span*.8?e.start-span*.1:mid-span/2,0,Math.max(0,D-span));dirty=1}
TLc.addEventListener('wheel',ev=>{ev.preventDefault();if(ev.ctrlKey||ev.metaKey){const r=TLc.getBoundingClientRect(),fx=(ev.clientX-r.left)/r.width,tAt=tv0+fx*span;span=clamp(span*(ev.deltaY>0?1.15:1/1.15),2,Math.max(dur(),2));tv0=tAt-fx*span;dirty=1;fvis();return}tv0+=(ev.deltaX||ev.deltaY)/TLc.clientWidth*span;dirty=1;fvis()},{passive:false});

/* long-press a block to lift it, then drag it along the timeline */
let mvOn=false,lpT=0,tlEdit=false;
try{tlEdit=localStorage.getItem('tle')==='1'}catch(e){}
const lt=$('#lt'),tleUI=()=>{lt.classList.toggle('p',tlEdit);lt.setAttribute('aria-pressed',tlEdit);dirty=1};
lt.onclick=()=>{tlEdit=!tlEdit;clearTimeout(lpT);mvOn=false;try{localStorage.setItem('tle',tlEdit?'1':'0')}catch(e){}tleUI();toast(tlEdit?'Edit mode ON: drag block handles, hold a block to move it, drag a subtitle on the video':'Edit mode OFF')};
tleUI();
function mvFin(d){if(d&&d.moved&&A.ev.includes(d.e)){chg('tm'+d.e.id);renderEdit()}}
