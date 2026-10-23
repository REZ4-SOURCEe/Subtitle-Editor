/* preview glyph size vs. the real player (measured: player text is ~8% smaller) */
let PVS=.92;try{const v=parseFloat(localStorage.getItem('pvs'));if(v>.5&&v<1.5)PVS=v}catch(e){}
let mvAct=null,mvHook=null;
function mvInfo(){if(mvAct===null||playing||sel==null)return null;const e=A.ev.find(q=>q.id===sel);if(!e)return null;const d=drafts.get(e.id)||e,m=/\\move\(([^)]*)\)/.exec(d.text);if(!m)return null;const p=m[1].split(',').map(Number);return p.length>=4&&!p.some(isNaN)?p:null}
const mvForce=e=>mvAct!==null&&!playing&&e.id===sel;
const subBoxes=[];
const fkc=new Map();function fmet(fn){let r=fkc.get(fn);if(r)return r;r={k:1,ar:.8};try{const c=document.createElement('canvas').getContext('2d');c.font=`100px "${fn}",Vazirmatn,Tahoma,"Noto Sans",Arial,sans-serif`;const m=c.measureText('Hg'),a=m.fontBoundingBoxAscent,d=m.fontBoundingBoxDescent;if(a>0&&d>0){r.k=clamp(100/(a+d),.4,1.2);r.ar=a/(a+d)}}catch(e){}fkc.set(fn,r);return r}
const fk=fn=>fmet(fn).k;
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{fkc.clear();dirty=1});
/* tag parser + renderer */
const TR=/\\(pos|move|fade?|i?clip|org|an|alpha|[1-4]a|bord|shad|blur|be|fscx|fscy|fsp|fn|fs|frx|fry|frz|fr|[1-4]c|c|b|i|u|s|r|p|kf|ko|k|K|q|a)(\([^)]*\)|[^\\]*)/g,RT=/[\u0590-\u08FF\uFB1D-\uFEFF]/;
function pt(text){const ov={},lines=[[]];let o={};
for(const part of text.split(/(\{[^}]*\})/)){if(part[0]==='{'&&part.endsWith('}')){const b=part.slice(1,-1).replace(/\\t\((?:[^()]|\([^)]*\))*\)/g,'');let m;TR.lastIndex=0;
while((m=TR.exec(b))){const n=m[1],a=m[2],f=parseFloat(a),ar=()=>a.slice(1,-1).split(',').map(Number);
switch(n){case'pos':{const p=ar();if(p.length>1)ov.pos=p}break;case'move':{const p=ar();if(p.length>=4)ov.move=p}break;case'fad':case'fade':{const p=ar();if(p.length===2)ov.fad=p}break;case'an':ov.an=f;break;case'frz':case'fr':ov.frz=f;break;
case'fs':o.fs=f;break;case'fn':o.fn=a;break;case'b':o.b=a!=='0';break;case'i':o.i=a!=='0';break;case'u':o.u=a!=='0';break;case's':o.s=a!=='0';break;case'c':case'1c':o.c=a?a2c(a):0;break;case'3c':o.oc=a?a2c(a):0;break;case'4c':o.bc=a?a2c(a):0;break;case'bord':o.bord=f;break;case'shad':o.shad=f;break;case'blur':case'be':o.blur=f;break;case'alpha':o.al=(parseInt(a.replace(/[^0-9a-f]/gi,''),16)||0)/255;break;case'fsp':o.sp=f;break;case'p':o.p=f;break;case'r':o={};break}}continue}
part.split(/\\N|\\n/).forEach((s,i)=>{if(i)lines.push([]);s=s.replace(/\\h/g,'\u00a0');if(s)lines[lines.length-1].push({t:s,o:{...o}})})}
return{lines,ov}}
const cvs=$('#cv'),vb=$('#vb');
function fit(){const W=vb.clientWidth,H=vb.clientHeight,ar=hasVideo&&V.videoWidth?V.videoWidth/V.videoHeight:(num(gi('PlayResX'),1920)/num(gi('PlayResY'),1080)||16/9);let w=W,hh=W/ar;if(hh>H){hh=H;w=H*ar}return{w:Math.round(w),h:Math.round(hh),l:Math.round((W-w)/2),t:Math.round((H-hh)/2)}}
let lastKey='';const PC=new Map(),pc=t=>{let r=PC.get(t);if(!r){if(PC.size>500)PC.clear();r=pt(t);PC.set(t,r)}return r};
function drawSubs(force){if(!vb.clientWidth)return;const f=fit(),dpr=devicePixelRatio||1;if(cvs._w!==f.w||cvs._h!==f.h||cvs._d!==dpr){force=1;cvs._w=f.w;cvs._h=f.h;cvs._d=dpr;cvs.width=f.w*dpr;cvs.height=f.h*dpr;for(const el of[cvs,V])Object.assign(el.style,{left:f.l+'px',top:f.t+'px',width:f.w+'px',height:f.h+'px'})}
const x=cvs.getContext('2d'),LS='letterSpacing'in x;x.setTransform(dpr,0,0,dpr,0,0);const act=A.ev.map(e=>drafts.get(e.id)||e).filter(e=>e.type==='Dialogue'&&(T>=e.start&&T<e.end||mvForce(e))).sort((a,b)=>a.layer-b.layer),key=act.map(e=>e.id+e.text).join('|')+f.w+'|'+(mvInfo()||'')+mvAct+(playing?'p':'');
if(!force&&key===lastKey&&!act.some(e=>/\\(move|fad)/.test(e.text)))return;lastKey=key;x.clearRect(0,0,f.w,f.h);subBoxes.length=0;
const sx=f.w/(num(gi('PlayResX'),1920)||1920),sy=f.h/(num(gi('PlayResY'),1080)||1080),placed=[];
for(const e of act){const S=A.styles.find(s=>s.name===e.style)||A.styles[0],{lines,ov}=pc(e.text);
const L=lines.map(l=>{let w=0,lh=0,la=0;const rs=[];for(const r of l){const o=r.o;if(o.p>0)continue;const fs0=(o.fs??S.fontsize)*sy,fs=fs0*fk(o.fn||S.fontname)*PVS,sp=(o.sp??S.spacing)*sx,font=`${(o.i??(S.italic!=0))?'italic ':''}${(o.b??(S.bold!=0))?700:400} ${fs}px "${o.fn||S.fontname}",Vazirmatn,Tahoma,"Noto Sans",Arial,sans-serif`;x.font=font;if(LS)x.letterSpacing=sp+'px';const rw=x.measureText(r.t).width;rs.push({t:r.t,o,fs,sp,font,w:rw});w+=rw;lh=Math.max(lh,fs0);la=Math.max(la,fs0*fmet(o.fn||S.fontname).ar)}if(!rs.length){lh=S.fontsize*sy;la=lh*fmet(S.fontname).ar}return{rs,w,lh,la,rtl:RT.test(l.map(r=>r.t).join(''))}});
if(!L.some(l=>l.rs.length))continue;const H=L.reduce((s,l)=>s+l.lh,0),an=ov.an||S.alignment,col=(an-1)%3,row=an<=3?2:an<=6?1:0;
const mL=(e.marginl||S.marginl)*sx,mR=(e.marginr||S.marginr)*sx,mV=(e.marginv||S.marginv)*sy;let p=ov.pos;
if(!p&&ov.move){const m=ov.move,d=(e.end-e.start)*1000,t1=m[4]??0,t2=m[5]??d,k=t2>t1?clamp(((T-e.start)*1000-t1)/(t2-t1),0,1):1;p=[m[0]+(m[2]-m[0])*k,m[1]+(m[3]-m[1])*k]}
if(ov.move&&mvForce(e))p=[ov.move[mvAct*2],ov.move[mvAct*2+1]];
const ax=p?p[0]*sx:col===0?mL:col===1?(mL+f.w-mR)/2:f.w-mR,ay=p?p[1]*sy:0;
let top=p?(row===2?ay-H:row===1?ay-H/2:ay):row===2?f.h-mV-H:row===1?(f.h-H)/2:mV;
const n0=top,W=Math.max(0,...L.map(l=>l.w)),xl=col===0?ax:col===1?ax-W/2:ax-W,xr=xl+W;
if(!p){for(let n=0;n<20;n++){const q=placed.find(q=>q.row===row&&top<q.b-1&&top+H>q.t+1&&xl<q.r-1&&xr>q.l+1);if(!q)break;top=row===2?q.t-H:q.b}placed.push({row,t:top,b:top+H,l:xl,r:xr})}
subBoxes.push({id:e.id,l:xl,r:xr,t:top,b:top+H,n:n0,H,row,col,fw:f.w,fh:f.h,p:!!p,ax,ay:top+(row===2?H:row===1?H/2:0),sx,sy});
let al=1;if(ov.fad&&!mvForce(e)){const[a,b]=ov.fad,el=(T-e.start)*1000,re=(e.end-T)*1000;if(a>0&&el<a)al=el/a;if(b>0&&re<b)al=Math.min(al,re/b)}
x.save();if(ov.frz){const oy=top+H/2;x.translate(ax,oy);x.rotate(-ov.frz*Math.PI/180);x.translate(-ax,-oy)}
let y=top;for(const l of L){const yb=y+l.la,lx=col===0?ax:col===1?ax-l.w/2:ax-l.w,order=l.rtl?[...l.rs].reverse():l.rs;
for(const pass of[0,1,2]){let cx=lx;for(const r of order){const o=r.o,ol=(o.bord??S.outline)*sy,sh=(o.shad??S.shadow)*sy;x.font=r.font;if(LS)x.letterSpacing=r.sp+'px';x.direction=l.rtl?'rtl':'ltr';x.textAlign='left';x.textBaseline='alphabetic';x.globalAlpha=clamp(al*(1-(o.al||0)),0,1);x.filter=o.blur?`blur(${o.blur*sy}px)`:'none';x.lineJoin='round';
if(pass===0&&sh>0){const c=css(o.bc||a2c(S.backcolour));x.fillStyle=c;x.strokeStyle=c;x.lineWidth=ol*2;if(ol>0)x.strokeText(r.t,cx+sh,yb+sh);x.fillText(r.t,cx+sh,yb+sh)}
if(pass===1&&ol>0){x.strokeStyle=css(o.oc||a2c(S.outlinecolour));x.lineWidth=ol*2;x.strokeText(r.t,cx,yb)}
if(pass===2){x.fillStyle=css(o.c||a2c(S.primarycolour));x.fillText(r.t,cx,yb);if(o.u??(S.underline!=0))x.fillRect(cx,yb+r.fs*.1,r.w,Math.max(1,r.fs/18));if(o.s??(S.strikeout!=0))x.fillRect(cx,yb-r.fs*.28,r.w,Math.max(1,r.fs/18))}
cx+=r.w}}y+=l.lh}
x.restore();x.globalAlpha=1;x.filter='none';if(LS)x.letterSpacing='0px';
if(tlEdit&&e.id===sel){x.save();x.strokeStyle='#58a6ff';x.lineWidth=1;x.setLineDash([4,3]);x.strokeRect(xl-4,top-3,W+8,H+6);x.restore()}}}
