/* ============== ПРОЦЕДУРНАЯ ГРАФИКА (фабрики спрайтов) ============== */

import { G } from './globals.js';
import { HW, HH, HW2, HH2, MW, PALB, TC,
         CS, NCH, CMX, CMT, CMB, CHW, CHH, ANCX, ANCY,
         T_WATER, T_RIVER, T_SAND, T_GRASS, T_FERT, T_FOREST, T_HILL, T_MTN, T_SWAMP } from './config.js';
import { shade, clamp, mulberry32, ri, pick } from './utils.js';
import { idx, inb, ter } from './map.js';

export function mkIso(tw,th,topPad,fn){
 /* x4 апскейл AAA-уровня: физический канвас в 4 раза больше, рисуем в виртуальной системе через scale.
    HWv/HHv — старые "виртуальные" значения, чтобы существующие литералы в bs() работали как раньше. */
 const S=4;
 const HWv=HW/S,HHv=HH/S;
 const W=Math.ceil((tw+th)*HW)+8*S,H=Math.ceil((tw+th)*HH)+topPad*S+10*S;
 const c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d');
 g.scale(S,S);
 g.lineJoin='round';g.lineCap='round';
 const ax=th*HWv+4,ay=topPad+2;
 const P=(x,y,z)=>[ax+(x-y)*HWv,ay+(x+y)*HHv-(z||0)];
 /* warm: тёплое направленное освещение. m='sun' — закатный свет (теплее), m='shade' — теневая сторона (холоднее). */
 const warm=(hex,f,m)=>{
  const n=parseInt(hex.slice(1),16);
  let R=clamp(((n>>16)&255)*f,0,255),Gn=clamp(((n>>8)&255)*f,0,255),B=clamp((n&255)*f,0,255);
  if(m==='sun'){R=clamp(R*1.06+8,0,255);Gn=clamp(Gn*1.01+3,0,255);B=clamp(B*0.92,0,255)}
  else if(m==='shade'){R=clamp(R*0.9,0,255);Gn=clamp(Gn*0.96,0,255);B=clamp(B*1.06+4,0,255)}
  return 'rgb('+(R|0)+','+(Gn|0)+','+(B|0)+')';
 };
 const poly=(pts,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();
  g.strokeStyle=shade(col,0.78);g.lineWidth=0.35;g.stroke()};
 const line=(a,b,col,w)=>{g.strokeStyle=col;g.lineWidth=w||1.4;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()};
 const diam=(x,y,w,h,z,col)=>poly([P(x,y,z),P(x+w,y,z),P(x+w,y+h,z),P(x,y+h,z)],col);
 const wall=(x1,y1,x2,y2,z0,z1,col)=>poly([P(x1,y1,z0),P(x2,y2,z0),P(x2,y2,z1),P(x1,y1,z1)],col);
 const box=(x,y,w,h,z0,z1,c1)=>{
  /* юго-западная грань — освещена закатным солнцем, тёплая */
  wall(x,y+h,x+w,y+h,z0,z1,warm(c1,0.86,'sun'));
  /* юго-восточная грань — в тени, прохладная */
  wall(x+w,y+h,x+w,y,z0,z1,warm(c1,0.52,'shade'));
  /* верх */
  diam(x,y,w,h,z1,warm(c1,1.05,'sun'));
  /* тёмные канты на угловых рёбрах — даёт глубину */
  line(P(x,y+h,z0),P(x,y+h,z1),'rgba(20,14,6,0.5)',0.45);
  line(P(x+w,y+h,z0),P(x+w,y+h,z1),'rgba(20,14,6,0.55)',0.5);
  line(P(x+w,y,z0),P(x+w,y,z1),'rgba(20,14,6,0.45)',0.4);
  /* мягкая полоса света под крышей (eaves shadow) */
  line(P(x,y+h,z1),P(x+w,y+h,z1),'rgba(15,10,3,0.35)',0.4);
  line(P(x+w,y+h,z1),P(x+w,y,z1),'rgba(15,10,3,0.4)',0.45);
 };
 const stripes=(pA,pB,pC,pD,n,col)=>{g.strokeStyle=col;g.lineWidth=1;
  for(let i=1;i<n;i++){const t=i/n;
   g.beginPath();g.moveTo(pA[0]+(pD[0]-pA[0])*t,pA[1]+(pD[1]-pA[1])*t);
   g.lineTo(pB[0]+(pC[0]-pB[0])*t,pB[1]+(pC[1]-pB[1])*t);g.stroke();}
 };
 const rtex=(c1,tex,a,b,r1,r2,dark)=>{
  if(tex==='thatch'){
   /* солома: основные полосы + дополнительные тонкие штрихи */
   stripes(a,b,r2,r1,9,shade(c1,dark?0.5:0.72));
   stripes(a,b,r2,r1,18,'rgba(50,38,18,0.2)');
  }else if(tex==='tile'||tex==='slate'){
   const N=tex==='tile'?12:8;
   stripes(a,b,r2,r1,N,shade(c1,dark?0.44:0.64));
   /* вертикальные швы со смещением через ряд — чешуйчатый узор */
   const cols=tex==='tile'?7:5;
   g.strokeStyle=shade(c1,dark?0.38:0.5);g.lineWidth=0.35;
   for(let rr=0;rr<N;rr++){
    const t1=rr/N,t2=(rr+1)/N,off=rr%2?0.5/cols:0;
    for(let cc=0;cc<cols;cc++){
     const tC=(cc+off)/cols;
     const xS=a[0]+(b[0]-a[0])*tC,yS=a[1]+(b[1]-a[1])*tC;
     const xE=r1[0]+(r2[0]-r1[0])*tC,yE=r1[1]+(r2[1]-r1[1])*tC;
     const x1=xS+(xE-xS)*t1,y1=yS+(yE-yS)*t1;
     const x2=xS+(xE-xS)*t2,y2=yS+(yE-yS)*t2;
     g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
    }
   }
   /* лёгкий блик на верхней половине каждой чешуйки */
   g.strokeStyle='rgba(255,240,200,0.08)';g.lineWidth=0.3;
   for(let rr=0;rr<N;rr+=2){
    const t1=(rr+0.15)/N;
    const xS=a[0]+(b[0]-a[0]),yS=a[1]+(b[1]-a[1]);
    const x1=a[0]+(r1[0]-a[0])*t1,y1=a[1]+(r1[1]-a[1])*t1;
    const x2=b[0]+(r2[0]-b[0])*t1,y2=b[1]+(r2[1]-b[1])*t1;
    g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
   }
  }
 };
 const roofG=(x,y,w,h,z0,zr,axis,c1,tex)=>{
  const gutCol='#6d5436';
  if(axis===0){
   const r1=P(x,y+h/2,zr),r2=P(x+w,y+h/2,zr);
   poly([P(x,y,z0),P(x+w,y,z0),r2,r1],warm(c1,0.95,'sun'));
   rtex(c1,tex,P(x,y,z0),P(x+w,y,z0),r1,r2,false);
   poly([P(x,y,z0),P(x,y+h,z0),r1],warm(c1,0.74,'sun'));
   poly([P(x+w,y,z0),P(x+w,y+h,z0),r2],warm(c1,0.48,'shade'));
   poly([P(x,y+h,z0),P(x+w,y+h,z0),r2,r1],warm(c1,0.58,'shade'));
   rtex(c1,tex,P(x,y+h,z0),P(x+w,y+h,z0),r1,r2,true);
   /* конек */
   line(r1,r2,warm(c1,1.22,'sun'),1.8);
   line(r1,r2,'rgba(20,12,4,0.45)',0.5);
   /* карниз — тёмная полоса между крышей и стеной */
   line(P(x,y,z0),P(x+w,y,z0),'rgba(15,8,2,0.55)',0.6);
   line(P(x,y+h,z0),P(x+w,y+h,z0),'rgba(15,8,2,0.6)',0.6);
   /* медный жёлоб водостока вдоль нижних кромок */
   line(P(x,y,z0),P(x+w,y,z0),gutCol,1.2);
   line(P(x,y+h,z0),P(x+w,y+h,z0),gutCol,1.2);
  }else{
   const r1=P(x+w/2,y,zr),r2=P(x+w/2,y+h,zr);
   poly([P(x,y,z0),P(x,y+h,z0),r2,r1],warm(c1,0.9,'sun'));
   rtex(c1,tex,P(x,y,z0),P(x,y+h,z0),r1,r2,false);
   poly([P(x,y,z0),P(x+w,y,z0),r1],warm(c1,0.7,'sun'));
   poly([P(x,y+h,z0),P(x+w,y+h,z0),r2],warm(c1,0.6,'shade'));
   poly([P(x+w,y,z0),P(x+w,y+h,z0),r2,r1],warm(c1,0.52,'shade'));
   rtex(c1,tex,P(x+w,y,z0),P(x+w,y+h,z0),r1,r2,true);
   line(r1,r2,warm(c1,1.22,'sun'),1.8);
   line(r1,r2,'rgba(20,12,4,0.45)',0.5);
   line(P(x,y,z0),P(x,y+h,z0),'rgba(15,8,2,0.55)',0.6);
   line(P(x+w,y,z0),P(x+w,y+h,z0),'rgba(15,8,2,0.6)',0.6);
   /* медный жёлоб водостока */
   line(P(x,y,z0),P(x,y+h,z0),gutCol,1.2);
   line(P(x+w,y,z0),P(x+w,y+h,z0),gutCol,1.2);
  }
 };
 const roofP=(x,y,w,h,z0,zr,c1)=>{
  const a=P(x+w/2,y+h/2,zr);
  poly([P(x,y,z0),P(x+w,y,z0),a],shade(c1,0.95));
  poly([P(x,y,z0),P(x,y+h,z0),a],shade(c1,0.78));
  poly([P(x+w,y,z0),P(x+w,y+h,z0),a],shade(c1,0.52));
  poly([P(x,y+h,z0),P(x+w,y+h,z0),a],shade(c1,0.64));
 };
 const ell=(cx,cy,r,z,col)=>{g.fillStyle=col;const p=P(cx,cy,z);g.beginPath();g.ellipse(p[0],p[1],r*HWv*1.414,r*HHv*1.414,0,0,7);g.fill();g.strokeStyle=shade(col,0.78);g.lineWidth=0.35;g.stroke()};
 const cyl=(cx,cy,r,z0,z1,c1)=>{
  const rx=r*HWv*1.414,ry=r*HHv*1.414;
  const pB=P(cx,cy,z0),pT=P(cx,cy,z1);
  const grd=g.createLinearGradient(pB[0]-rx,0,pB[0]+rx,0);
  grd.addColorStop(0,shade(c1,0.78));grd.addColorStop(0.3,shade(c1,0.95));grd.addColorStop(0.55,shade(c1,1.05));grd.addColorStop(1,shade(c1,0.46));
  g.fillStyle=grd;
  g.beginPath();g.ellipse(pB[0],pB[1],rx,ry,0,0,7);g.fill();
  g.fillRect(pB[0]-rx,pT[1],rx*2,pB[1]-pT[1]);
  g.strokeStyle=shade(c1,0.5);g.lineWidth=0.35;
  g.beginPath();g.moveTo(pB[0]-rx,pT[1]);g.lineTo(pB[0]-rx,pB[1]);g.stroke();
  g.beginPath();g.moveTo(pB[0]+rx,pT[1]);g.lineTo(pB[0]+rx,pB[1]);g.stroke();
  ell(cx,cy,r,z1,shade(c1,1.08));
 };
 const fach=(x1,y1,x2,y2,z0,z1,n)=>{
  g.strokeStyle='#4a3622';g.lineWidth=1.5;
  for(let i=0;i<=n;i++){const t=i/n;const bx=x1+(x2-x1)*t,by=y1+(y2-y1)*t;
   const a=P(bx,by,z0),b=P(bx,by,z1);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
  line(P(x1,y1,z1),P(x2,y2,z1),'#4a3622',1.5);
  line(P(x1,y1,z0+1),P(x2,y2,z0+1),'#4a3622',1.5);
  const m1=P(x1+(x2-x1)*0.5,y1+(y2-y1)*0.5,z0),m2a=P(x1,y1,z1),m2b=P(x2,y2,z1);
  line(m1,m2a,'#4a3622',1.1);line(m1,m2b,'#4a3622',1.1);
 };
 const winr=(x1,y1,x2,y2,z,zh,n)=>{
  for(let i=0;i<n;i++){const t=(i+0.55)/(n+0.1);const dt=0.5/(n+2);
   const ax2=x1+(x2-x1)*(t-dt),ay2=y1+(y2-y1)*(t-dt),bx=x1+(x2-x1)*(t+dt),by=y1+(y2-y1)*(t+dt);
   /* углубление окна — тёмный фон */
   wall(ax2,ay2,bx,by,z,z+zh,'#1a140d');
   /* стекло с тёплым свечением (внутренний свет) */
   wall(ax2,ay2,bx,by,z+zh*0.1,z+zh*0.92,'rgba(220,170,90,0.55)');
   /* верхний блик стекла */
   wall(ax2,ay2,bx,by,z+zh*0.62,z+zh*0.78,'rgba(255,235,170,0.5)');
   /* тёмная рама вокруг окна */
   g.strokeStyle='#241a0e';g.lineWidth=0.55;
   const pa=P(ax2,ay2,z),pb=P(bx,by,z),pc=P(bx,by,z+zh),pd=P(ax2,ay2,z+zh);
   g.beginPath();g.moveTo(pa[0],pa[1]);g.lineTo(pb[0],pb[1]);g.lineTo(pc[0],pc[1]);g.lineTo(pd[0],pd[1]);g.closePath();g.stroke();
   /* крестовина в окне */
   const mx=(ax2+bx)/2,my=(ay2+by)/2;
   line(P(mx,my,z),P(mx,my,z+zh),'#241a0e',0.4);
   line(P(ax2,ay2,z+zh/2),P(bx,by,z+zh/2),'#241a0e',0.4);
   /* подоконник — небольшой выступ снизу */
   const dx=(x2-x1)/(n+0.1)*0.08,dy=(y2-y1)/(n+0.1)*0.08;
   wall(ax2-dx,ay2-dy,bx+dx,by+dy,z-0.6,z,'rgba(140,115,85,0.85)');
   line(P(ax2-dx,ay2-dy,z),P(bx+dx,by+dy,z),'rgba(60,42,22,0.7)',0.4);
   /* открытые ставни по бокам окна — деревянные, цветные */
   const sHues=['#4a6a96','#5d7a3a','#a85438','#8a4a3c','#6a5a3a','#3a6a8a'];
   const sCol=sHues[Math.abs(((i*7+(x1*13|0)+(y1*17|0))%sHues.length))];
   const dxw=(x2-x1)/(n+0.1)*0.42,dyw=(y2-y1)/(n+0.1)*0.42;
   /* левая ставня — торчит влево от окна */
   const lx1=ax2-dxw,ly1=ay2-dyw;
   wall(lx1,ly1,ax2,ay2,z+0.4,z+zh-0.4,sCol);
   /* планки */
   for(let k=1;k<3;k++){const tt=k/3;
    const px=lx1+(ax2-lx1)*tt,py=ly1+(ay2-ly1)*tt;
    line(P(px,py,z+0.4),P(px,py,z+zh-0.4),'rgba(25,15,5,0.55)',0.35);
   }
   /* кромка ставни */
   g.strokeStyle='rgba(25,15,5,0.7)';g.lineWidth=0.4;
   const lpa=P(lx1,ly1,z+0.4),lpb=P(ax2,ay2,z+0.4),lpc=P(ax2,ay2,z+zh-0.4),lpd=P(lx1,ly1,z+zh-0.4);
   g.beginPath();g.moveTo(lpa[0],lpa[1]);g.lineTo(lpb[0],lpb[1]);g.lineTo(lpc[0],lpc[1]);g.lineTo(lpd[0],lpd[1]);g.closePath();g.stroke();
   /* правая ставня — торчит вправо от окна */
   const rx1=bx,ry1=by,rx2=bx+dxw,ry2=by+dyw;
   wall(rx1,ry1,rx2,ry2,z+0.4,z+zh-0.4,sCol);
   for(let k=1;k<3;k++){const tt=k/3;
    const px=rx1+(rx2-rx1)*tt,py=ry1+(ry2-ry1)*tt;
    line(P(px,py,z+0.4),P(px,py,z+zh-0.4),'rgba(25,15,5,0.55)',0.35);
   }
   const rpa=P(rx1,ry1,z+0.4),rpb=P(rx2,ry2,z+0.4),rpc=P(rx2,ry2,z+zh-0.4),rpd=P(rx1,ry1,z+zh-0.4);
   g.beginPath();g.moveTo(rpa[0],rpa[1]);g.lineTo(rpb[0],rpb[1]);g.lineTo(rpc[0],rpc[1]);g.lineTo(rpd[0],rpd[1]);g.closePath();g.stroke();
   /* маленькие петли — две точки на ставне у границы окна */
   for(const hz of [z+zh*0.25,z+zh*0.7]){
    const lhp=P(ax2,ay2,hz),rhp=P(bx,by,hz);
    g.fillStyle='#1a1108';
    g.beginPath();g.arc(lhp[0],lhp[1],0.5,0,7);g.fill();
    g.beginPath();g.arc(rhp[0],rhp[1],0.5,0,7);g.fill();
   }
  }
 };
 const door=(x1,y1,x2,y2,zh)=>{
  /* фон двери — тёмное дерево */
  wall(x1,y1,x2,y2,0,zh,'#3a2a18');
  /* вертикальные швы между досками */
  for(let k=1;k<3;k++){const t=k/3;
   const bx=x1+(x2-x1)*t,by=y1+(y2-y1)*t;
   line(P(bx,by,0),P(bx,by,zh),'rgba(15,8,2,0.65)',0.45);
  }
  /* петли слева — две железные полосы */
  for(const hz of [0.18,0.78]){
   const pz=hz*zh;
   const ex=x1+(x2-x1)*0.25,ey=y1+(y2-y1)*0.25;
   wall(x1,y1,ex,ey,pz,pz+0.6,'#1a1108');
  }
  /* ручка — золотистая */
  const hx=x1+(x2-x1)*0.78,hy=y1+(y2-y1)*0.78;
  const hp=P(hx,hy,zh*0.45);
  g.fillStyle='#c89030';g.beginPath();g.arc(hp[0],hp[1],1.1,0,7);g.fill();
  g.strokeStyle='rgba(20,12,4,0.65)';g.lineWidth=0.3;g.stroke();
  /* верхний и боковые канты двери */
  line(P(x1,y1,zh),P(x2,y2,zh),'#1a1108',0.6);
  line(P(x1,y1,0),P(x1,y1,zh),'#1a1108',0.5);
  line(P(x2,y2,0),P(x2,y2,zh),'#1a1108',0.5);
  /* небольшой каменный порог у входа */
  const px1=x1,py1=y1,px2=x2,py2=y2;
  const dx=(x2-x1)*0.12,dy=(y2-y1)*0.12;
  wall(px1-dy*0.5,py1+dx*0.5,px2-dy*0.5,py2+dx*0.5,-0.6,0,'rgba(150,135,110,0.7)');
 };
 const chim=(x,y,z0,h)=>{box(x,y,0.18,0.18,z0,z0+h,'#7d7468');diam(x,y,0.18,0.18,z0+h,'#2a2420')};
 const flag=(x,y,z0,h,col)=>{const a=P(x,y,z0),b=P(x,y,z0+h);line(a,b,'#3c2e1c',1.6);
  poly([b,[b[0]+11,b[1]+3],[b[0],b[1]+6]],col)};
 const sign=(x1,y1,x2,y2,z,col,sym)=>{const m=P((x1+x2)/2,(y1+y2)/2,z);
  g.fillStyle='#54402a';g.fillRect(m[0]-5,m[1]-5,10,9);
  g.fillStyle=col;g.beginPath();g.arc(m[0],m[1]-1,3.4,0,7);g.fill();
  if(sym){g.fillStyle='#fff8e0';g.font='6px serif';g.textAlign='center';g.fillText(sym,m[0],m[1]+1)}};
 const barrel=(x,y)=>{cyl(x,y,0.13,0,9,'#8a6438');const pp=P(x,y,5);
  g.strokeStyle='#4d381f';g.lineWidth=1;g.beginPath();g.moveTo(pp[0]-5,pp[1]);g.lineTo(pp[0]+5,pp[1]);g.stroke()};
 const crate=(x,y,sz)=>{box(x,y,sz||0.28,sz||0.28,0,(sz||0.28)*26,'#9a7a4a')};
 /* цветочный ящик с цветами под окном — добавляет уюта */
 const flowerBox=(x1,y1,x2,y2,z)=>{
  const dx=(x2-x1)*0.06,dy=(y2-y1)*0.06;
  /* деревянный ящик */
  wall(x1-dx,y1-dy,x2+dx,y2+dy,z-2.8,z+0.2,'#5d4a2c');
  /* лицевая темная полоска */
  line(P(x1-dx,y1-dy,z-2.8),P(x2+dx,y2+dy,z-2.8),'rgba(20,12,4,0.7)',0.5);
  line(P(x1-dx,y1-dy,z+0.2),P(x2+dx,y2+dy,z+0.2),'rgba(255,235,180,0.3)',0.4);
  /* зелень — плотная стена листвы */
  const N=6;
  for(let i=0;i<N;i++){
   const t=(i+0.5)/N;
   const bx=x1+(x2-x1)*t,by=y1+(y2-y1)*t;
   const pp=P(bx,by,z+0.5);
   /* большой зелёный куст */
   g.fillStyle=i%2?'#4d7028':'#5d8c38';
   g.beginPath();g.arc(pp[0],pp[1]-0.6,2.0,0,7);g.fill();
   g.strokeStyle='rgba(30,50,15,0.6)';g.lineWidth=0.3;g.stroke();
   /* блик на листве */
   g.fillStyle='rgba(170,220,120,0.45)';
   g.beginPath();g.arc(pp[0]-0.5,pp[1]-1.4,0.9,0,7);g.fill();
  }
  /* яркие цветы — крупные пятна */
  for(let i=0;i<N;i++){
   const t=(i+0.5)/N;
   const bx=x1+(x2-x1)*t,by=y1+(y2-y1)*t;
   const pp=P(bx,by,z+0.5);
   const cols=['#e8462a','#f0c83a','#c83a8a','#ff7a3a','#ea4a5a','#ffd66a'];
   const cl=cols[(i*5+i)%cols.length];
   g.fillStyle=cl;
   g.beginPath();g.arc(pp[0]+0.6+((i*7)%3-1)*0.4,pp[1]-1.6,1.1,0,7);g.fill();
   /* центр цветка */
   g.fillStyle='#ffd040';
   g.beginPath();g.arc(pp[0]+0.6+((i*7)%3-1)*0.4,pp[1]-1.6,0.4,0,7);g.fill();
  }
 };
 /* фонарь у входа — кованный с тёплым свечением, крупный */
 const lantern=(x,y,z0,h)=>{
  /* столб с утолщением у основания */
  line(P(x,y,z0),P(x,y,z0+h),'#3a2e1c',1.4);
  /* основание */
  const b0=P(x,y,z0);
  g.fillStyle='#2a1f12';
  g.beginPath();g.ellipse(b0[0],b0[1],1.8,0.7,0,0,7);g.fill();
  /* корпус фонаря — больше */
  const c0=P(x,y,z0+h);
  g.fillStyle='#2a1f12';
  g.fillRect(c0[0]-2.4,c0[1]-5.4,4.8,5.4);
  /* стекло со светом */
  g.fillStyle='rgba(255,195,80,0.92)';
  g.fillRect(c0[0]-1.8,c0[1]-4.7,3.6,4.0);
  /* верхний блик стекла */
  g.fillStyle='rgba(255,240,170,0.85)';
  g.fillRect(c0[0]-1.2,c0[1]-4.3,2.4,1.7);
  /* кованные перекладины (крест) */
  g.strokeStyle='#1a1108';g.lineWidth=0.5;
  g.beginPath();g.moveTo(c0[0],c0[1]-4.7);g.lineTo(c0[0],c0[1]-0.7);g.stroke();
  g.beginPath();g.moveTo(c0[0]-1.8,c0[1]-2.7);g.lineTo(c0[0]+1.8,c0[1]-2.7);g.stroke();
  /* шапочка */
  g.fillStyle='#1a1108';
  g.beginPath();g.moveTo(c0[0]-2.8,c0[1]-5.4);g.lineTo(c0[0]+2.8,c0[1]-5.4);g.lineTo(c0[0],c0[1]-7.6);g.closePath();g.fill();
  /* антенна */
  g.strokeStyle='#1a1108';g.lineWidth=0.4;
  g.beginPath();g.moveTo(c0[0],c0[1]-7.6);g.lineTo(c0[0],c0[1]-8.6);g.stroke();
  g.fillStyle='#3a2e1c';
  g.beginPath();g.arc(c0[0],c0[1]-8.8,0.6,0,7);g.fill();
  /* мощное сияние вокруг */
  const grd=g.createRadialGradient(c0[0],c0[1]-2.8,0,c0[0],c0[1]-2.8,14);
  grd.addColorStop(0,'rgba(255,210,110,0.55)');
  grd.addColorStop(0.4,'rgba(255,210,110,0.22)');
  grd.addColorStop(1,'rgba(255,210,110,0)');
  g.fillStyle=grd;
  g.fillRect(c0[0]-14,c0[1]-16,28,28);
 };
 /* поленница дров — уложенные брёвна */
 const firewoodPile=(x,y,w,h)=>{
  const W=w||0.4,H=h||0.25;
  /* 4 ряда брёвен в высоту, по 3 в длину */
  for(let r=0;r<4;r++){
   for(let c=0;c<3;c++){
    const px=x+(c+0.5)/3*W,py=y+(r+0.5)/4*H;
    const z0=r*2.6,z1=z0+2.4;
    box(px-0.06,py-0.06,0.12,0.12,z0,z1,r%2?'#8a6438':'#7a5630');
    /* торец полена */
    const pp=P(px,py-0.06,z0+1.2);
    g.fillStyle='#d8b878';g.beginPath();g.arc(pp[0]+1.5,pp[1]-2.5,1.8,0,7);g.fill();
    /* кольца */
    g.strokeStyle='rgba(60,40,20,0.6)';g.lineWidth=0.4;g.stroke();
    g.beginPath();g.arc(pp[0]+1.5,pp[1]-2.5,1.0,0,7);g.stroke();
    g.beginPath();g.arc(pp[0]+1.5,pp[1]-2.5,0.5,0,7);g.stroke();
    /* центр */
    g.fillStyle='rgba(60,40,20,0.5)';
    g.beginPath();g.arc(pp[0]+1.5,pp[1]-2.5,0.2,0,7);g.fill();
   }
  }
 };
 /* мощёная дорожка от двери — уютный камень */
 const cobblePath=(x,y,w,h)=>{
  diam(x,y,w,h,0.5,'#9c9078');
  /* отдельные камешки */
  g.fillStyle='rgba(60,50,40,0.4)';g.lineWidth=0.3;
  for(let i=0;i<4;i++){for(let j=0;j<2;j++){
   const tX=(i+0.5)/4,tY=(j+0.5)/2;
   const pp=P(x+w*tX,y+h*tY,0.5);
   g.beginPath();g.arc(pp[0]+(i*7%3-1),pp[1]+(j*5%3-1),1.4,0,7);g.fill();
  }}
 };
 const shadow=(x,y,w,h,al)=>{g.fillStyle='rgba(16,12,6,'+(al!=null?al:0.22)+')';const c0=P(x+w/2,y+h/2,0);
  g.beginPath();g.ellipse(c0[0],c0[1],(w+h)/2*HWv*0.8,(w+h)/2*HHv*0.8,0,0,7);g.fill()};
 fn({g,P,poly,line,diam,wall,box,roofG,roofP,ell,cyl,fach,winr,door,chim,flag,sign,crate,barrel,shadow,flowerBox,lantern,firewoodPile,cobblePath,warm,W:W/S,H:H/S});
 return {cv:c,ax:ax*S,ay:ay*S};
}

/* --- тайлы земли (половинный масштаб) --- */
export function mkTile(base,deco,seed){
 const c=document.createElement('canvas');c.width=HW2*2+2;c.height=HH2*2+2;
 const g=c.getContext('2d');
 g.translate(1,1);
 g.beginPath();g.moveTo(HW2,-1.3);g.lineTo(HW2*2+1.3,HH2);g.lineTo(HW2,HH2*2+1.3);g.lineTo(-1.3,HH2);g.closePath();
 g.fillStyle=base;g.fill();
 g.save();g.clip();
 if(deco){g.scale(2,2);deco(g,mulberry32(seed||1))}
 g.restore();
 return c;
}
export function speck(g,r,n,cols){for(let i=0;i<n;i++){g.fillStyle=cols[(r()*cols.length)|0];
 g.fillRect(2+r()*(HW2*2-4),1+r()*(HH2*2-2),2.6,1.6)}}

export function buildTiles(){
 /* трава с мелкими цветочками и кустиками для уюта */
 const grass=b=>[1,2,3].map(i=>mkTile(b,(g,r)=>{
  /* базовая текстура */
  speck(g,r,22,[shade(b,1.16),shade(b,0.82),shade(b,1.3),shade(b,1.05)]);
  /* мелкие цветочки */
  const flowerCols=['#e84a3a','#f0c83a','#e8c0e8','#fff0a0','#ff7a3a'];
  for(let k=0;k<3;k++){
   if(r()<0.6){
    const fx=3+r()*(HW2*2-6),fy=2+r()*(HH2*2-4);
    const cl=flowerCols[(r()*flowerCols.length)|0];
    /* 4 лепестка */
    g.fillStyle=cl;
    g.beginPath();g.arc(fx-0.7,fy,0.55,0,7);g.arc(fx+0.7,fy,0.55,0,7);
    g.arc(fx,fy-0.7,0.55,0,7);g.arc(fx,fy+0.7,0.55,0,7);g.fill();
    /* центр */
    g.fillStyle='#ffe04a';
    g.beginPath();g.arc(fx,fy,0.5,0,7);g.fill();
   }
  }
  /* кустики — округлые комочки зелени */
  for(let k=0;k<2;k++){
   if(r()<0.4){
    const bx=4+r()*(HW2*2-8),by=3+r()*(HH2*2-6);
    g.fillStyle=shade(b,0.65);
    g.beginPath();g.arc(bx,by,1.8,0,7);g.fill();
    g.fillStyle=shade(b,0.85);
    g.beginPath();g.arc(bx-0.6,by-0.7,1.1,0,7);g.fill();
    g.fillStyle=shade(b,1.0);
    g.beginPath();g.arc(bx-0.4,by-1.0,0.6,0,7);g.fill();
   }
  }
 },i*17));
 G.TSPR[T_GRASS]=grass('#7ba046');
 G.TSPR[T_FERT]=[1,2,3].map(i=>mkTile('#6f5733',(g,r)=>{
  g.strokeStyle='#5b4628';g.lineWidth=1;
  for(let k=-2;k<5;k++){g.beginPath();g.moveTo(k*7,HH2*2);g.lineTo(k*7+HW2*2,0);g.stroke()}
  speck(g,r,12,['#8aa050','#7d6038','#94a85a']);
 },i*31));
 G.TSPR[T_SAND]=[1,2].map(i=>mkTile('#cfc08c',(g,r)=>speck(g,r,16,['#e2d4a2','#b8a878','#d8c898']),i*13));
 G.TSPR[T_WATER]=[1,2,3].map(i=>mkTile('#2c6c8c',(g,r)=>{
  g.strokeStyle='rgba(195,232,242,0.26)';g.lineWidth=1;
  for(let k=0;k<2;k++){const y0=4+k*7+(i%2)*1.5,x0=4+((i*5+k*9)%10);
   g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x0+5,y0-1.4,x0+10,y0);g.stroke()}
 },i*7));
 G.TSPR[T_RIVER]=[1,2].map(i=>mkTile('#3f87a4',(g,r)=>{
  g.strokeStyle='rgba(225,246,250,0.32)';g.lineWidth=1;
  for(let k=0;k<2;k++){const y0=4+k*7+(i%2)*1.5,x0=3+((i*7+k*11)%10);
   g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x0+6,y0-1.6,x0+12,y0);g.stroke()}
 },i*11));
 G.TSPR[T_FOREST]=[1,2].map(i=>mkTile('#5e8038',(g,r)=>speck(g,r,18,['#4d6c2c','#6f9444','#5d8438']),i*19));
 G.TSPR[T_HILL]=[1,2].map(i=>mkTile('#88a050',(g,r)=>{
  g.fillStyle='rgba(255,255,235,0.1)';
  g.beginPath();g.ellipse(HW2,HH2*0.8,HW2*0.55,HH2*0.5,0,0,7);g.fill();
  g.fillStyle='rgba(40,50,20,0.12)';
  g.beginPath();g.ellipse(HW2+1,HH2*1.3,HW2*0.55,HH2*0.4,0,0,7);g.fill();
  speck(g,r,12,['#9ab060','#74904a','#86a058']);
 },i*23));
 G.TSPR[T_MTN]=[1].map(i=>mkTile('#8d8a80',(g,r)=>speck(g,r,14,['#a09c92','#75726a','#88857c']),i*29));
 G.TSPR[T_SWAMP]=[1,2].map(i=>mkTile('#566e48',(g,r)=>{
  g.fillStyle='rgba(46,76,96,0.55)';
  for(let k=0;k<2;k++){g.beginPath();g.ellipse(5+r()*20,3+r()*9,4.5,2,0,0,7);g.fill()}
  g.strokeStyle='#3d5230';g.lineWidth=1;
  for(let k=0;k<4;k++){const x0=3+r()*26,y0=4+r()*9;
   g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+(r()*2-1)*2,y0-4);g.stroke()}
 },i*37));
 G.TSPR.road=mkTile('#9c9078',(g,r)=>{
  g.strokeStyle='rgba(70,60,45,0.5)';g.lineWidth=1;
  g.beginPath();g.moveTo(HW2,1);g.lineTo(HW2*2-1,HH2);g.lineTo(HW2,HH2*2-1);g.lineTo(1,HH2);g.closePath();g.stroke();
  for(let k=0;k<7;k++){g.fillStyle=k%2?'#8a8068':'#aaa088';
   g.fillRect(4+r()*(HW2*2-8),2+r()*(HH2*2-4),2.4,1.4)}
 },41);
}
/* --- деревья, скалы --- */

export function mkTree(kind,seed){
 const S=4;
 const c=document.createElement('canvas');c.width=34*S;c.height=58*S;
 const g=c.getContext('2d');g.scale(S,S);g.lineJoin='round';g.lineCap='round';
 const r=mulberry32(seed);const cx=17,fy=55;
 g.fillStyle='rgba(10,16,6,0.25)';g.beginPath();g.ellipse(cx,fy,9,3.4,0,0,7);g.fill();
 g.strokeStyle='#5a432a';g.lineWidth=3;g.beginPath();g.moveTo(cx,fy);g.lineTo(cx,fy-16);g.stroke();
 if(kind==='pine'){
  const cl='#3d6630';
  for(let i=0;i<3;i++){const w=13-i*3.4,y0=fy-13-i*11;
   g.fillStyle=shade(cl,0.85+i*0.12);
   g.beginPath();g.moveTo(cx-w,y0);g.lineTo(cx+w,y0);g.lineTo(cx,y0-15);g.closePath();g.fill();}
 }else{
  const cl=kind==='dark'?'#456b2e':'#5d8a38';
  const bl=[[0,-24,11],[-7,-18,8],[7,-19,8],[0,-33,8]];
  for(const b of bl){g.fillStyle=shade(cl,0.8+r()*0.35);
   g.beginPath();g.arc(cx+b[0],fy+b[1],b[2],0,7);g.fill();}
  g.fillStyle='rgba(255,255,210,0.25)';
  g.beginPath();g.arc(cx-3,fy-30,4,0,7);g.fill();
 }
 return {cv:c,ax:cx*4,ay:fy*4};
}
export function mkRock(seed){
 return mkIso(1,1,56,(u)=>{const{g,P,poly,diam}=u;const r=mulberry32(seed);
  diam(0,0,1,1,0,'#7d7a70');
  const a=P(0.46+r()*0.12,0.46+r()*0.12,30+r()*14);
  poly([P(0.0,0.42,1),P(0.46,0.0,4),a,P(0.06,0.82,8)],'#9d998e');
  poly([P(0.46,0.0,4),P(1.0,0.4,1),P(0.94,0.84,9),a],'#6e6b62');
  poly([P(0.06,0.82,8),a,P(0.94,0.84,9),P(0.5,1.0,0)],'#84817a');
  const sn=[a,[a[0]-5,a[1]+7],[a[0]+1,a[1]+9],[a[0]+6,a[1]+6]];
  poly(sn,'#e8ebe8');
 });
}
/* --- люди (жители, войска, враги, герой) --- */
export function mkMan(o){
 const S=4;
 const W0=o.big?28:20,H0=o.big?36:29;
 const W=W0*S,H=H0*S;
 const c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d');g.scale(S,S);g.lineJoin='round';g.lineCap='round';
 const cx=W0/2,fy=H0-2,bh=o.big?14:10;
 g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(cx,fy,W*0.3,2.8,0,0,7);g.fill();
 if(o.cape){g.fillStyle=o.cape;g.beginPath();
  g.moveTo(cx-4,fy-bh-3);g.lineTo(cx+5,fy-bh-2);g.lineTo(cx+7,fy-1);g.lineTo(cx-2,fy-2);g.closePath();g.fill();}
 if(!o.dress){g.strokeStyle='#39281a';g.lineWidth=2.2;
  g.beginPath();g.moveTo(cx-2.4,fy-7);g.lineTo(cx-3,fy);g.moveTo(cx+2.4,fy-7);g.lineTo(cx+3,fy);g.stroke();}
 g.fillStyle=o.tunic;g.beginPath();
 if(o.dress){g.moveTo(cx-3,fy-bh-2);g.lineTo(cx+3,fy-bh-2);g.lineTo(cx+5.2,fy);g.lineTo(cx-5.2,fy);}
 else{g.moveTo(cx-3.6,fy-bh-2);g.lineTo(cx+3.6,fy-bh-2);g.lineTo(cx+3,fy-6);g.lineTo(cx-3,fy-6);}
 g.closePath();g.fill();
 g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(cx,fy-bh-2,3.4,o.dress?bh-1:bh-5);
 if(o.belt){g.fillStyle='#43301c';g.fillRect(cx-3.6,fy-9.4,7.2,1.7)}
 g.fillStyle=o.skin||'#e8c098';g.beginPath();g.arc(cx,fy-bh-5.6,3.4,0,7);g.fill();
 if(o.hood){g.fillStyle=o.hood;g.beginPath();
  g.arc(cx,fy-bh-6,4.1,Math.PI*0.92,Math.PI*2.08);g.lineTo(cx+3.4,fy-bh-1.5);g.lineTo(cx-3.4,fy-bh-1.5);g.closePath();g.fill();}
 else if(o.helmet){g.fillStyle=o.helmet;g.beginPath();g.arc(cx,fy-bh-6.2,3.9,Math.PI,0);g.fill();
  g.fillRect(cx-3.9,fy-bh-6.4,7.8,1.6);
  if(o.plume){g.strokeStyle=o.plume;g.lineWidth=2;g.beginPath();g.moveTo(cx,fy-bh-10);g.quadraticCurveTo(cx+4,fy-bh-13,cx+6,fy-bh-9);g.stroke();}}
 else if(o.scarf){g.fillStyle=o.scarf;g.beginPath();g.arc(cx,fy-bh-6.4,3.9,Math.PI*0.85,Math.PI*2.15);g.fill();}
 else{g.fillStyle=o.hair||'#5a3c22';g.beginPath();g.arc(cx,fy-bh-6.8,3.2,Math.PI*0.9,Math.PI*2.1);g.fill();}
 if(o.crown){g.fillStyle=PALB.gold;g.beginPath();
  const cy=fy-bh-9.4;
  g.moveTo(cx-3.6,cy+1.6);g.lineTo(cx-3.6,cy-1.4);g.lineTo(cx-1.8,cy);g.lineTo(cx,cy-2.2);g.lineTo(cx+1.8,cy);g.lineTo(cx+3.6,cy-1.4);g.lineTo(cx+3.6,cy+1.6);g.closePath();g.fill();}
 const wx=cx+(o.big?6:5);
 g.strokeStyle='#8a7048';g.lineWidth=1.8;
 if(o.weapon==='spear'){g.beginPath();g.moveTo(wx,fy);g.lineTo(wx+2,fy-bh-13);g.stroke();
  g.fillStyle='#b8bcc2';g.beginPath();g.moveTo(wx+2,fy-bh-13);g.lineTo(wx+0.5,fy-bh-9);g.lineTo(wx+3.5,fy-bh-9);g.closePath();g.fill();}
 else if(o.weapon==='pitch'){g.beginPath();g.moveTo(wx,fy);g.lineTo(wx+1,fy-bh-10);g.stroke();
  g.strokeStyle='#9aa0a8';g.lineWidth=1.3;
  for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(wx+1+k*2,fy-bh-10);g.lineTo(wx+1+k*2,fy-bh-14);g.stroke();}}
 else if(o.weapon==='axe'){g.beginPath();g.moveTo(wx-1,fy-4);g.lineTo(wx+3,fy-bh-8);g.stroke();
  g.fillStyle='#a8acb2';g.beginPath();g.moveTo(wx+3,fy-bh-8);g.lineTo(wx+8,fy-bh-6);g.lineTo(wx+3,fy-bh-3);g.closePath();g.fill();}
 else if(o.weapon==='bow'){g.strokeStyle='#7a5c34';g.lineWidth=1.6;
  g.beginPath();g.arc(wx+1,fy-bh-2,7,-Math.PI*0.42,Math.PI*0.42);g.stroke();
  g.strokeStyle='#d8d2c0';g.lineWidth=0.8;
  g.beginPath();g.moveTo(wx+1+7*Math.cos(-Math.PI*0.42),fy-bh-2+7*Math.sin(-Math.PI*0.42));
  g.lineTo(wx+1+7*Math.cos(Math.PI*0.42),fy-bh-2+7*Math.sin(Math.PI*0.42));g.stroke();}
 else if(o.weapon==='xbow'){g.strokeStyle='#6b5232';g.lineWidth=2;
  g.beginPath();g.moveTo(wx-1,fy-bh-3);g.lineTo(wx+5,fy-bh-3);g.stroke();
  g.beginPath();g.moveTo(wx+2,fy-bh-6);g.lineTo(wx+2,fy-bh);g.stroke();}
 else if(o.weapon==='sword'){g.strokeStyle='#b8bcc4';g.lineWidth=1.8;
  g.beginPath();g.moveTo(wx,fy-6);g.lineTo(wx+4,fy-bh-8);g.stroke();
  g.strokeStyle='#6b5232';g.lineWidth=1.6;g.beginPath();g.moveTo(wx+0.6,fy-8.4);g.lineTo(wx+2.4,fy-7);g.stroke();}
 if(o.shield){g.fillStyle=o.shield;g.beginPath();g.ellipse(cx-5,fy-bh+2,3,4,0,0,7);g.fill();
  g.strokeStyle='rgba(0,0,0,0.35)';g.lineWidth=1;g.stroke();}
 return {cv:c,ax:cx*4,ay:fy*4};
}
export function flipSpr(s){
 const c=document.createElement('canvas');c.width=s.cv.width;c.height=s.cv.height;
 const g=c.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(s.cv,0,0);
 return {cv:c,ax:c.width-s.ax,ay:s.ay};
}

export function buildPeople(){
 G.CIT_M=['#7d5a34','#5d6e46','#6b5870','#8a4a3a'].map(t=>mkMan({tunic:t,belt:1}));
 G.CIT_F=['#8a5a64','#5a7080','#7d6a3c','#4d6850'].map(t=>mkMan({tunic:t,dress:1,scarf:shade(t,1.35)}));
 G.USPR.spear=mkMan({tunic:'#5d6f86',belt:1,helmet:'#9aa2ac',weapon:'spear'});
 G.USPR.sword=mkMan({tunic:'#74604a',belt:1,helmet:'#9aa2ac',weapon:'sword',shield:'#8a3a30'});
 G.USPR.archer=mkMan({tunic:'#56713e',belt:1,hood:'#44582f',weapon:'bow'});
 G.USPR.xbow=mkMan({tunic:'#5a5648',belt:1,helmet:'#8a929c',weapon:'xbow'});
 G.USPR.knight=mkMan({tunic:'#aab2bc',belt:1,helmet:'#c2c8d0',plume:'#c23a3a',weapon:'sword',shield:'#3a5a8a',big:1});
 G.FSPR.bandit=mkMan({tunic:'#4a4038',belt:1,hood:'#332c26',weapon:'sword'});
 G.FSPR.rebel=mkMan({tunic:'#7d5a34',belt:1,weapon:'pitch'});
 G.FSPR.barb=mkMan({tunic:'#6b4a2c',belt:1,hair:'#caa050',weapon:'axe',big:1});
 G.FSPR.lordk=mkMan({tunic:'#3c3a4a',belt:1,helmet:'#6a6878',plume:'#7a3a8a',weapon:'sword',shield:'#56308a',big:1});
 G.HERO_S=mkMan({tunic:'#b08a3a',belt:1,cape:'#9a2a2a',crown:1,weapon:'sword',big:1});
 for(const k in G.USPR)G.PPL_F['u'+k]=flipSpr(G.USPR[k]);
 for(const k in G.FSPR)G.PPL_F['f'+k]=flipSpr(G.FSPR[k]);
 G.PPL_F.hero=flipSpr(G.HERO_S);
 G.CIT_M.forEach((s,i)=>G.PPL_F['m'+i]=flipSpr(s));
 G.CIT_F.forEach((s,i)=>G.PPL_F['f_'+i]=flipSpr(s));
}
/* --- спрайты зданий (средневековый стиль) --- */

export function bs(id,tw,th,pad,fn){G.BSPR[id]=mkIso(tw,th,pad,fn)}
export function logsTex(u,x1,y1,x2,y2,z1,n){
 /* доски с зернистостью: тёмные швы + лёгкие линии волокон */
 for(let k=1;k<n;k++){
  u.line(u.P(x1,y1,k*z1/n),u.P(x2,y2,k*z1/n),'rgba(35,22,8,0.55)',0.6);
 }
 /* светлая линия по середине доски (зерно дерева) */
 for(let k=0;k<n;k++){
  const tZ=(k+0.5)/n;
  u.line(u.P(x1,y1,tZ*z1),u.P(x2,y2,tZ*z1),'rgba(180,140,80,0.18)',0.3);
 }
 /* сучки — тёмные пятна */
 const g=u.g;g.fillStyle='rgba(35,22,8,0.5)';
 for(let k=0;k<n;k++){
  if((k*7+13)%3!==0)continue;
  const tZ=(k+0.5)/n,tX=((k*17+11)%10)/10;
  const bx=x1+(x2-x1)*tX,by=y1+(y2-y1)*tX;
  const pp=u.P(bx,by,tZ*z1);
  g.beginPath();g.arc(pp[0],pp[1],0.7,0,7);g.fill();
 }
}
export function stoneTex(u,x1,y1,x2,y2,z1){
 const g=u.g;
 /* реалистичная кирпичная кладка: горизонтальные швы + вертикальные со смещением через ряд */
 const N=Math.max(3,Math.round(z1/4.5));
 g.strokeStyle='rgba(35,28,18,0.5)';g.lineWidth=0.5;
 for(let k=1;k<N;k++){
  const t=k/N;
  const a=u.P(x1,y1,t*z1),b=u.P(x2,y2,t*z1);
  g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
 }
 /* вертикальные швы (кирпичная кладка с offset через ряд) */
 const COLS=8;
 g.strokeStyle='rgba(35,28,18,0.45)';g.lineWidth=0.45;
 for(let r=0;r<N;r++){
  const t1=r/N,t2=(r+1)/N,off=r%2?0.5/COLS:0;
  for(let c=0;c<COLS;c++){
   const tC=(c+off)/COLS;
   const bx=x1+(x2-x1)*tC,by=y1+(y2-y1)*tC;
   const a=u.P(bx,by,t1*z1),b=u.P(bx,by,t2*z1);
   g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
  }
 }
 /* лёгкие блики на отдельных камнях для текстуры */
 g.strokeStyle='rgba(255,240,210,0.06)';g.lineWidth=0.3;
 for(let r=0;r<N;r++){
  const off=r%2?0.5/COLS:0;
  for(let c=0;c<COLS;c+=2){
   const tC=(c+off+0.1)/COLS,tC2=(c+off+0.4)/COLS;
   const bx1=x1+(x2-x1)*tC,by1=y1+(y2-y1)*tC;
   const bx2=x1+(x2-x1)*tC2,by2=y1+(y2-y1)*tC2;
   const zH=(r+0.3)/N*z1;
   const a=u.P(bx1,by1,zH),b=u.P(bx2,by2,zH);
   g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
  }
 }
}
export function buildSprites(){
 /* — жильё, 7 уровней — */
 G.HSPR[0]=mkIso(2,2,46,u=>{const{box,roofG,door,shadow}=u;shadow(0.2,0.2,1.6,1.6);
  box(0.35,0.4,1.3,1.3,0,11,'#8a6a44');logsTex(u,0.35,1.7,1.65,1.7,11,3);
  roofG(0.22,0.27,1.56,1.56,11,20,0,'#a8924e','thatch');door(0.75,1.7,1.05,1.7,8)});
 G.HSPR[1]=mkIso(2,2,52,u=>{const{box,roofG,door,winr,shadow}=u;shadow(0.15,0.15,1.7,1.7);
  box(0.25,0.25,1.5,1.5,0,13,'#7d5f3c');logsTex(u,0.25,1.75,1.75,1.75,13,4);logsTex(u,1.75,1.75,1.75,0.25,13,4);
  roofG(0.1,0.1,1.8,1.8,13,28,0,PALB.thatch,'thatch');
  door(0.8,1.75,1.12,1.75,10);winr(1.75,1.5,1.75,0.5,3,6,1)});
 G.HSPR[2]=mkIso(2,2,58,u=>{const{box,roofG,door,winr,fach,shadow}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.2,0.2,1.6,1.6,0,17,PALB.plaster);
  fach(0.2,1.8,1.8,1.8,0,17,3);fach(1.8,1.8,1.8,0.2,0,17,3);
  roofG(0.08,0.08,1.84,1.84,17,34,0,PALB.thatch,'thatch');
  door(0.78,1.8,1.1,1.8,11);winr(1.8,1.55,1.8,0.4,5,7,2)});
 G.HSPR[3]=mkIso(2,2,62,u=>{const{box,roofG,door,winr,chim,shadow,flowerBox,lantern,cobblePath}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.18,0.18,1.64,1.64,0,19,PALB.stone);stoneTex(u,0.18,1.82,1.82,1.82,19);stoneTex(u,1.82,1.82,1.82,0.18,19);
  roofG(0.06,0.06,1.88,1.88,19,37,1,PALB.tile,'tile');chim(1.45,0.35,33,9);
  door(0.72,1.82,1.06,1.82,12);winr(1.25,1.82,1.72,1.82,6,8,1);winr(1.82,1.6,1.82,0.35,6,8,2);
  /* цветочный ящик под боковым окном */
  flowerBox(1.82,1.55,1.82,0.4,6);
  /* фонарь у входа */
  lantern(0.62,1.82,0,9);
  /* мощёная дорожка перед домом */
  cobblePath(0.62,1.82,0.5,0.2)});
 G.HSPR[4]=mkIso(2,2,74,u=>{const{box,roofG,door,winr,fach,chim,shadow,flowerBox,lantern,firewoodPile,cobblePath}=u;shadow(0.08,0.08,1.84,1.84);
  box(0.15,0.15,1.7,1.7,0,14,PALB.stoneD);
  box(0.12,0.12,1.76,1.76,14,31,PALB.plaster);
  fach(0.12,1.88,1.88,1.88,14,31,4);fach(1.88,1.88,1.88,0.12,14,31,4);
  roofG(0.04,0.04,1.92,1.92,31,50,0,PALB.tile,'tile');chim(0.45,0.4,44,9);
  door(0.74,1.85,1.1,1.85,12);winr(1.85,1.6,1.85,0.35,3,8,2);winr(0.3,1.88,1.7,1.88,18,9,2);
  /* цветочные ящики под окнами 2-го этажа */
  flowerBox(0.3,1.88,1.7,1.88,18);
  /* фонарь у входа */
  lantern(0.65,1.88,0,12);
  /* поленница у боковой стены */
  firewoodPile(1.88,0.95,0.04,0.6);
  /* мощёная дорожка */
  cobblePath(0.6,1.85,0.6,0.15)});
 G.HSPR[5]=mkIso(2,2,82,u=>{const{box,roofG,door,winr,fach,chim,shadow,flowerBox,lantern,cobblePath}=u;shadow(0.05,0.05,1.9,1.9);
  box(0.08,0.08,1.84,1.0,0,27,PALB.plaster);
  fach(0.08,1.08,1.92,1.08,0,27,5);
  roofG(0.02,0.02,1.96,1.12,27,46,0,PALB.tile,'tile');
  box(0.12,1.02,0.95,0.9,0,21,PALB.stone);stoneTex(u,0.12,1.92,1.07,1.92,21);
  roofG(0.06,0.98,1.07,0.98,21,36,1,PALB.tile,'tile');
  chim(1.6,0.28,52,10);door(0.45,1.92,0.78,1.92,13);
  winr(1.18,1.08,1.85,1.08,8,9,2);winr(1.92,0.95,1.92,0.15,8,9,2);
  flowerBox(1.18,1.08,1.85,1.08,8);
  flowerBox(1.92,0.95,1.92,0.15,8);
  lantern(0.35,1.92,0,13);
  cobblePath(0.35,1.92,0.55,0.15)});
 G.HSPR[6]=mkIso(2,2,96,u=>{const{box,roofG,roofP,door,winr,cyl,flag,shadow,flowerBox,lantern,cobblePath}=u;shadow(0.03,0.03,1.94,1.94);
  box(0.1,0.1,1.8,1.8,0,31,PALB.stone);stoneTex(u,0.1,1.9,1.9,1.9,31);
  winr(0.35,1.9,1.85,1.9,6,8,3);winr(0.35,1.9,1.85,1.9,19,8,3);
  winr(1.9,1.7,1.9,0.2,6,8,2);winr(1.9,1.7,1.9,0.2,19,8,2);
  roofG(0.04,0.04,1.92,1.92,31,49,1,PALB.slate,'slate');
  cyl(1.55,0.45,0.28,0,42,PALB.stoneD);roofP(1.27,0.17,0.56,0.56,42,62,PALB.slate);
  flag(1.55,0.45,62,9,'#c23a3a');door(0.7,1.9,1.08,1.9,13);
  flowerBox(0.35,1.9,1.85,1.9,6);
  flowerBox(1.9,1.7,1.9,0.2,6);
  lantern(0.6,1.9,0,13);lantern(1.18,1.9,0,13);
  cobblePath(0.55,1.9,0.7,0.2)});
 /* — еда — */
 bs('farm',3,3,54,u=>{const{g,diam,box,roofG,line,P,shadow,door}=u;
  diam(0,0,3,3,0,'#705836');
  for(let k=1;k<9;k++)line(P(0,k*3/9),P(3,k*3/9),'#5b4628',1.2);
  g.fillStyle='#8fae54';for(let k=0;k<26;k++){const pp=P(0.2+(k*37%26)/26*2.6,0.25+(k*53%24)/24*2.4,1.5);g.fillRect(pp[0],pp[1],2,1.4)}
  shadow(1.9,0.05,1.05,0.95,0.18);
  box(1.95,0.12,0.95,0.82,0,13,PALB.wood);logsTex(u,1.95,0.94,2.9,0.94,13,3);
  roofG(1.88,0.05,1.08,0.96,13,26,0,PALB.thatch,'thatch');door(2.3,0.94,2.56,0.94,9);
  for(let k=0;k<=6;k++){const a=P(k/2,3,0),b=P(k/2,3,6);line(a,b,'#6b5232',1.6)}
  line(P(0,3,5),P(3,3,5),'#6b5232',1.3)});
 bs('garden',2,2,30,u=>{const{g,diam,line,P,box,roofG}=u;
  diam(0,0,2,2,0,'#6f5733');
  for(const ry of [0.35,0.95,1.55]){diam(0.15,ry-0.18,1.45,0.36,1,'#5d8838');
   g.fillStyle='#7fae4e';for(let k=0;k<6;k++){const pp=P(0.25+k*0.22,ry,3);g.fillRect(pp[0]-1,pp[1],2.4,1.8)}}
  box(1.7,1.55,0.26,0.36,0,9,PALB.wood);roofG(1.64,1.5,0.38,0.46,9,15,0,'#9a824a','thatch')});
 bs('pasture',3,3,40,u=>{const{g,diam,line,P,ell}=u;
  diam(0.02,0.02,2.96,2.96,0,'#86a64e');
  const post=(x,y)=>line(P(x,y,0),P(x,y,8),'#6b5232',1.8);
  for(let k=0;k<=5;k++){post(k*0.6,3);post(3,k*0.6);post(k*0.6,0);post(0,k*0.6)}
  line(P(0,3,6),P(3,3,6),'#7a6038',1.4);line(P(3,3,6),P(3,0,6),'#6b5232',1.4);
  line(P(0,0,6),P(3,0,6),'#7a6038',1.2);line(P(0,0,6),P(0,3,6),'#7a6038',1.2);
  const sheep=(x,y)=>{ell(x,y,0.16,5,'#ece6da');ell(x+0.1,y+0.1,0.07,7,'#d8d2c6');
   g.fillStyle='#3a3026';const pp=P(x+0.14,y+0.14,8);g.fillRect(pp[0]-1.5,pp[1],3,2.4)};
  sheep(0.8,1.0);sheep(1.8,1.9);sheep(1.1,2.2);
  ell(2.3,0.7,0.2,4,'#8a6438');ell(2.3,0.7,0.15,5,'#4a6c8a')});
 bs('fisher',2,2,46,u=>{const{box,roofG,door,diam,line,P,barrel,shadow}=u;shadow(0.2,0.2,1.2,1.2,0.18);
  box(0.25,0.3,1.0,1.0,0,12,'#7d6240');logsTex(u,0.25,1.3,1.25,1.3,12,3);
  roofG(0.15,0.2,1.2,1.2,12,24,0,'#9a8a52','thatch');door(0.6,1.3,0.9,1.3,9);
  diam(1.2,1.25,0.75,0.4,2,'#8a6a42');
  for(let k=0;k<3;k++)line(P(1.3+k*0.25,1.25,2),P(1.3+k*0.25,1.65,2),'#6b5232',1);
  line(P(1.25,1.65,2),P(1.25,1.65,-4),'#5d4426',2);line(P(1.9,1.62,2),P(1.9,1.62,-4),'#5d4426',2);
  barrel(0.45,1.6);
  const g=u.g;g.strokeStyle='rgba(220,220,200,0.6)';g.lineWidth=0.8;
  const n0=P(1.55,0.5,14);for(let k=0;k<3;k++){g.beginPath();g.moveTo(n0[0]+k*3,n0[1]);g.lineTo(n0[0]+k*3-4,n0[1]+12);g.stroke()}});
 bs('hunter',2,2,48,u=>{const{box,roofG,door,line,P,shadow,ell}=u;shadow(0.18,0.18,1.5,1.5,0.18);
  box(0.25,0.25,1.3,1.3,0,13,'#73583a');logsTex(u,0.25,1.55,1.55,1.55,13,4);logsTex(u,1.55,1.55,1.55,0.25,13,4);
  roofG(0.15,0.15,1.5,1.5,13,26,0,'#8a7846','thatch');door(0.7,1.55,1.0,1.55,10);
  ell(1.75,1.25,0.13,3,'#6b4f2e');ell(1.75,1.25,0.13,7,'#7d5f3a');ell(1.75,1.25,0.13,11,'#6b4f2e');
  line(P(1.2,1.55,18),P(1.45,1.55,26),'#caa860',1.6);
  const g=u.g;g.strokeStyle='#7a5c34';g.lineWidth=1.6;const bp=P(0.35,1.55,18);
  g.beginPath();g.arc(bp[0],bp[1],6,-1.2,1.2);g.stroke()});
 bs('mill',2,2,96,u=>{const{cyl,roofP,line,poly,P,shadow,door,g}=u;shadow(0.15,0.15,1.7,1.7);
  cyl(1,1.05,0.55,0,36,PALB.stone);
  cyl(1,1.05,0.42,36,46,'#7a5c36');roofP(0.6,0.65,0.8,0.8,46,60,'#8a4a30');
  door(0.78,1.55,1.1,1.5,11);
  const hub=P(0.6,1.3,44);
  g.strokeStyle='#4a3826';g.lineWidth=2.6;
  g.beginPath();g.moveTo(hub[0]+9,hub[1]-3);g.lineTo(hub[0],hub[1]);g.stroke();
  for(let k=0;k<4;k++){const a=k*Math.PI/2+0.62;
   const dx=Math.cos(a),dy=Math.sin(a)*0.92;
   poly([[hub[0]+dx*5-dy*4,hub[1]+dy*5+dx*4],[hub[0]+dx*37-dy*7,hub[1]+dy*37+dx*7],
     [hub[0]+dx*37+dy*7,hub[1]+dy*37-dx*7],[hub[0]+dx*5+dy*4,hub[1]+dy*5-dx*4]],'rgba(236,224,192,0.95)');
   line([hub[0]+dx*5,hub[1]+dy*5],[hub[0]+dx*37,hub[1]+dy*37],'#54402a',1.6);
   for(let q=1;q<4;q++){const t=q/4;
    line([hub[0]+dx*37*t-dy*6,hub[1]+dy*37*t+dx*6],[hub[0]+dx*37*t+dy*6,hub[1]+dy*37*t-dx*6],'rgba(96,76,46,0.55)',1)}}
  g.fillStyle='#3c2e1c';g.beginPath();g.arc(hub[0],hub[1],3.6,0,7);g.fill()});
 bs('bakery',2,2,56,u=>{const{box,roofG,door,winr,chim,sign,shadow,g,P}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.4,1.4,0,16,PALB.plaster);u.fach(0.2,1.6,1.6,1.6,0,16,3);
  roofG(0.1,0.1,1.6,1.56,16,31,0,PALB.tile,'tile');
  const dm=P(1.65,1.25,0);g.fillStyle='#9a8a78';g.beginPath();g.arc(dm[0],dm[1]-6,9,Math.PI,0);g.fill();
  g.fillStyle='#2a2018';g.beginPath();g.arc(dm[0],dm[1]-4,4,Math.PI,0);g.fill();
  g.fillStyle='#e89a4a';g.beginPath();g.arc(dm[0],dm[1]-4,2.4,Math.PI,0);g.fill();
  chim(1.62,1.06,14,12);door(0.65,1.6,0.95,1.6,11);sign(1.18,1.6,1.45,1.6,20,'#c8923a')});
 bs('dairy',2,2,54,u=>{const{box,roofG,door,winr,sign,shadow}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.55,1.55,0,15,'#e2dcc8');logsTex(u,0.2,1.75,1.75,1.75,15,2);
  roofG(0.1,0.1,1.76,1.76,15,30,1,PALB.wood,'tile');
  door(0.7,1.75,1.05,1.75,11);winr(1.75,1.5,1.75,0.45,5,6,2);sign(1.3,1.75,1.6,1.75,19,'#e8c84a')});
 bs('vineyard',2,2,40,u=>{const{g,diam,line,P}=u;
  diam(0,0,2,2,0,'#74683c');
  for(const rx of [0.4,1.0,1.6]){
   line(P(rx,0.2,6),P(rx,1.8,6),'#5d4a2c',1.3);
   for(let k=0;k<5;k++){const y=0.25+k*0.36;line(P(rx,y,0),P(rx,y,8),'#54402a',1.4);
    g.fillStyle=k%2?'#5d8838':'#6f9c44';const pp=P(rx,y,9);
    g.beginPath();g.arc(pp[0],pp[1],3.4,0,7);g.fill();
    g.fillStyle='#6a3a7a';g.beginPath();g.arc(pp[0]+2,pp[1]+3,1.4,0,7);g.fill()}}});
 /* — сырьё — */
 bs('lumber',2,2,52,u=>{const{box,roofG,door,line,P,g,shadow,cyl}=u;shadow(0.15,0.15,1.7,1.7,0.18);
  box(0.2,0.2,1.2,1.2,0,13,'#73583a');logsTex(u,0.2,1.4,1.4,1.4,13,4);
  roofG(0.1,0.1,1.4,1.4,13,25,0,'#8a7846','thatch');door(0.6,1.4,0.9,1.4,10);
  for(let k=0;k<3;k++){const y=1.5+k*0.001,z=k<2?3:9,xo=k<2?(k?1.05:0.75):0.9;
   const a=P(xo,1.78,z),b=P(xo+0.65,1.52,z);
   g.strokeStyle=k%2?'#8a6438':'#7a5630';g.lineWidth=6;
   g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
   g.fillStyle='#caa05e';g.beginPath();g.arc(a[0],a[1],3,0,7);g.fill()}
  cyl(1.65,0.5,0.14,0,7,'#7d5f3a');
  line(P(1.65,0.5,7),P(1.85,0.35,18),'#8a7048',1.8)});
 bs('quarry',2,2,36,u=>{const{diam,box,line,P,g,crate}=u;
  diam(0,0,2,2,0,'#8d8a80');
  diam(0.25,0.25,1.5,1.5,-2,'#75726a');diam(0.5,0.5,1.0,1.0,-5,'#5d5a54');
  g.strokeStyle='#4d4a44';g.lineWidth=1;
  line(P(0.25,0.25,-2),P(0.5,0.5,-5),'#4d4a44',1);line(P(1.75,1.75,-2),P(1.5,1.5,-5),'#4d4a44',1);
  box(1.55,0.15,0.32,0.32,0,9,'#b2aca0');box(1.5,0.55,0.3,0.3,0,8,'#a6a094');
  box(0.15,1.6,0.3,0.3,0,8,'#aaa498');
  line(P(1,1,-5),P(1.35,0.7,16),'#6b5232',2);line(P(1.35,0.7,16),P(1.7,0.95,10),'#6b5232',1.4)});
 bs('claypit',2,2,34,u=>{const{diam,box,line,P}=u;
  diam(0,0,2,2,0,'#9a6a48');
  diam(0.3,0.3,1.4,1.4,-2,'#8a5638');diam(0.55,0.55,0.9,0.9,-4,'#7a4a30');
  for(let k=0;k<3;k++)box(1.55,0.2+k*0.001,0.3,0.28,k*7,k*7+6,'#b4663e');
  line(P(0.9,0.9,-4),P(0.55,1.5,8),'#6b5232',1.8)});
 bs('ironmine',2,2,52,u=>{const{poly,P,line,g,crate,shadow}=u;shadow(0.1,0.1,1.8,1.8,0.18);
  poly([P(0.1,1.9,0),P(0.1,0.2,0),P(0.7,0.05,26),P(1.6,0.1,30),P(1.95,0.9,18),P(1.9,1.9,0)],'#8a7a64');
  poly([P(0.1,1.9,0),P(0.55,1.0,22),P(1.2,1.1,24),P(1.9,1.9,0)],'#9a8a72');
  g.fillStyle='#1d1812';g.beginPath();const e=P(1.0,1.72,0);
  g.ellipse(e[0],e[1]-7,9,11,0,Math.PI,0);g.fill();g.fillRect(e[0]-9,e[1]-7,18,7);
  line(P(0.72,1.78,0),P(0.72,1.78,16),'#54402a',2.4);line(P(1.28,1.66,0),P(1.28,1.66,16),'#54402a',2.4);
  line(P(0.7,1.8,16),P(1.32,1.64,16),'#54402a',2.6);
  crate(1.6,1.5,0.26)});
 bs('coalmine',2,2,52,u=>{const{poly,P,line,g,shadow,ell}=u;shadow(0.1,0.1,1.8,1.8,0.18);
  poly([P(0.1,1.9,0),P(0.1,0.2,0),P(0.7,0.05,24),P(1.6,0.1,28),P(1.95,0.9,16),P(1.9,1.9,0)],'#6e665c');
  poly([P(0.1,1.9,0),P(0.55,1.0,20),P(1.2,1.1,22),P(1.9,1.9,0)],'#7d756a');
  g.fillStyle='#15110d';g.beginPath();const e=P(1.0,1.72,0);
  g.ellipse(e[0],e[1]-7,9,11,0,Math.PI,0);g.fill();g.fillRect(e[0]-9,e[1]-7,18,7);
  line(P(0.72,1.78,0),P(0.72,1.78,15),'#473522',2.4);line(P(1.28,1.66,0),P(1.28,1.66,15),'#473522',2.4);
  line(P(0.7,1.8,15),P(1.32,1.64,15),'#473522',2.6);
  for(let k=0;k<5;k++)ell(1.55+(k%3)*0.12,1.45+((k*7)%3)*0.12,0.09,2+k,'#26221e')});
 /* — ремёсла — */
 bs('sawmill',2,2,52,u=>{const{box,roofG,line,P,g,shadow}=u;shadow(0.12,0.12,1.76,1.76,0.18);
  for(const pp of [[0.2,0.2],[1.6,0.2],[0.2,1.6],[1.6,1.6]])line(P(pp[0],pp[1],0),P(pp[0],pp[1],16),'#5d4a2c',3);
  roofG(0.05,0.05,1.9,1.9,16,28,0,PALB.wood,'tile');
  const sc=P(0.95,1.1,8);g.fillStyle='#9aa0a8';g.beginPath();g.arc(sc[0],sc[1],8,0,7);g.fill();
  g.strokeStyle='#6e747c';for(let k=0;k<8;k++){const a2=k*Math.PI/4;
   g.beginPath();g.moveTo(sc[0],sc[1]);g.lineTo(sc[0]+Math.cos(a2)*9.5,sc[1]+Math.sin(a2)*9.5);g.stroke()}
  g.fillStyle='#54402a';g.beginPath();g.arc(sc[0],sc[1],2,0,7);g.fill();
  for(let k=0;k<3;k++){const a=P(0.3,1.85,2+k*3),b=P(1.5,1.7,2+k*3);
   g.strokeStyle=k%2?'#caa05e':'#b8924e';g.lineWidth=4;
   g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}});
 bs('carpenter',2,2,56,u=>{const{box,roofG,door,winr,fach,sign,shadow,g,P}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.5,1.5,0,16,PALB.plaster);fach(0.2,1.7,1.7,1.7,0,16,3);fach(1.7,1.7,1.7,0.2,0,16,3);
  roofG(0.1,0.1,1.7,1.7,16,32,0,PALB.wood,'tile');door(0.7,1.7,1.0,1.7,11);
  for(let k=0;k<3;k++){const a=P(1.78,1.45,2+k*3),b=P(1.82,0.6,2+k*3);
   g.strokeStyle=k%2?'#caa05e':'#b8924e';g.lineWidth=3.4;
   g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
  sign(1.2,1.7,1.5,1.7,20,'#9a6a3a')});
 bs('smelter',2,2,64,u=>{const{box,diam,chim,wall,shadow,g,P}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.25,0.25,1.4,1.4,0,22,PALB.stoneD);stoneTex(u,0.25,1.65,1.65,1.65,22);stoneTex(u,1.65,1.65,1.65,0.25,22);
  diam(0.45,0.45,1.0,1.0,23,'#3a2a1a');diam(0.55,0.55,0.8,0.8,23,'#e8742a');diam(0.7,0.7,0.5,0.5,23,'#ffc23a');
  wall(0.75,1.65,1.15,1.65,3,10,'#1d150d');wall(0.82,1.65,1.08,1.65,3,7,'#ff8a3a');
  chim(1.42,0.42,22,18)});
 bs('smith',2,2,52,u=>{const{box,roofG,line,P,g,shadow,wall,cyl,firewoodPile}=u;shadow(0.12,0.12,1.76,1.76,0.18);
  box(0.2,0.2,1.5,0.9,0,15,PALB.stoneD);stoneTex(u,0.2,1.1,1.7,1.1,15);
  roofG(0.1,0.1,1.7,1.1,15,27,0,'#6e5a40','tile');
  for(const pp of [[0.25,1.75],[1.6,1.75]])line(P(pp[0],pp[1],0),P(pp[0],pp[1],13),'#5d4a2c',2.6);
  roofG(0.12,1.2,1.66,0.66,13,20,0,'#7a6448','tile');
  cyl(0.6,1.5,0.12,0,6,'#6b5232');
  g.fillStyle='#4a4e54';const av=P(0.6,1.5,8);g.fillRect(av[0]-5,av[1]-3,10,4);g.fillRect(av[0]-2,av[1]-1,4,3);
  wall(1.1,1.62,1.42,1.62,1,8,'#2a1d10');wall(1.16,1.62,1.36,1.62,1,6,'#ff8a3a');
  /* поленницы дров для горна */
  firewoodPile(1.55,0.25,0.18,0.55);
  firewoodPile(0.2,0.25,0.16,0.55)});
 bs('weaponsm',2,2,56,u=>{const{box,roofG,door,flag,shadow,g,P,ell}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.5,1.5,0,18,PALB.stoneD);stoneTex(u,0.2,1.7,1.7,1.7,18);stoneTex(u,1.7,1.7,1.7,0.2,18);
  roofG(0.1,0.1,1.7,1.7,18,33,1,'#5d6470','slate');door(0.7,1.7,1.0,1.7,12);
  const sh=(x,c)=>{const pp=P(x,1.71,12);g.fillStyle=c;g.beginPath();g.ellipse(pp[0],pp[1],3.4,4.4,0,0,7);g.fill();
   g.fillStyle='#d8d2c0';g.beginPath();g.arc(pp[0],pp[1],1.2,0,7);g.fill()};
  sh(1.2,'#8a3a30');sh(1.45,'#3a5a8a');
  flag(0.35,0.35,33,9,'#8a3a30')});
 bs('weaver',2,2,52,u=>{const{box,roofG,door,winr,shadow,ell}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.45,1.45,0,15,PALB.plaster);u.fach(0.2,1.65,1.65,1.65,0,15,3);
  roofG(0.1,0.1,1.66,1.66,15,30,0,PALB.thatch,'thatch');door(0.68,1.65,0.98,1.65,11);
  ell(1.78,1.35,0.12,4,'#ece6da');ell(1.85,1.05,0.12,4,'#e2dcd0');ell(1.7,1.62,0.12,4,'#ece6da')});
 bs('tailor',2,2,54,u=>{const{box,roofG,door,winr,sign,shadow,poly,P}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.5,1.5,0,16,'#dcd2b4');u.fach(1.7,1.7,1.7,0.2,0,16,3);
  roofG(0.1,0.1,1.7,1.7,16,32,0,PALB.tile,'tile');
  for(let k=0;k<4;k++)poly([P(0.3+k*0.34,1.7,12),P(0.64+k*0.34,1.7,12),P(0.68+k*0.34,1.92,8),P(0.34+k*0.34,1.92,8)],k%2?'#b44a3a':'#e6dcc2');
  door(0.62,1.7,0.92,1.7,11);sign(1.25,1.7,1.55,1.7,20,'#5a7080','✂')});
 bs('jeweler',2,2,58,u=>{const{box,roofG,door,winr,sign,shadow,wall}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.5,1.5,0,18,PALB.stone);stoneTex(u,0.2,1.7,1.7,1.7,18);
  roofG(0.1,0.1,1.7,1.7,18,33,1,PALB.slate,'slate');
  door(0.68,1.7,0.98,1.7,12);
  wall(1.15,1.7,1.5,1.7,6,13,'#241f15');wall(1.2,1.7,1.45,1.7,8,11,'rgba(255,220,120,0.75)');
  sign(1.7,1.4,1.7,1.1,20,PALB.gold,'♦')});
 bs('scriptor',2,2,58,u=>{const{box,roofG,door,winr,sign,shadow}=u;shadow(0.12,0.12,1.76,1.76);
  box(0.2,0.2,1.5,1.5,0,19,PALB.stone);stoneTex(u,0.2,1.7,1.7,1.7,19);stoneTex(u,1.7,1.7,1.7,0.2,19);
  winr(0.35,1.7,1.55,1.7,8,8,2);winr(1.7,1.5,1.7,0.35,8,8,2);
  roofG(0.1,0.1,1.7,1.7,19,35,0,PALB.slate,'slate');
  door(0.68,1.7,0.98,1.7,12);sign(1.25,1.7,1.55,1.7,21,'#e8e0c8','✎')});
 /* — общество — */
 bs('well',1,1,34,u=>{const{cyl,line,P,roofG,g}=u;
  cyl(0.5,0.55,0.27,0,8,PALB.stoneD);
  g.fillStyle='#1d2a36';const wp=P(0.5,0.55,8);g.beginPath();g.ellipse(wp[0],wp[1],8,4,0,0,7);g.fill();
  line(P(0.22,0.55,0),P(0.22,0.55,22),'#5d4a2c',2);line(P(0.78,0.55,0),P(0.78,0.55,22),'#5d4a2c',2);
  roofG(0.1,0.3,0.8,0.5,22,30,0,PALB.wood,'tile');
  line(P(0.5,0.55,21),P(0.5,0.55,12),'#8a7048',1);
  g.fillStyle='#7d5f3a';g.fillRect(wp[0]-2,wp[1]-10,4,4)});
 bs('market',3,3,52,u=>{const{diam,box,poly,P,flag,crate,barrel,shadow,g,line}=u;
  diam(0,0,3,3,0,'#c4b48a');
  g.strokeStyle='rgba(120,100,70,0.4)';
  for(let k=1;k<6;k++){line(P(k*0.5,0,0.5),P(k*0.5,3,0.5),'rgba(120,100,70,0.3)',0.8)}
  const stall=(x,y,c1)=>{box(x,y,0.7,0.55,0,8,'#8a6a42');
   for(let k=0;k<3;k++)poly([P(x-0.06+k*0.28,y-0.1,16),P(x+0.22+k*0.28,y-0.1,16),P(x+0.26+k*0.28,y+0.62,11),P(x-0.02+k*0.28,y+0.62,11)],k%2?'#e6dcc2':c1);
   line(P(x-0.06,y-0.08,0),P(x-0.06,y-0.08,16),'#5d4a2c',1.6);line(P(x+0.76,y-0.08,0),P(x+0.76,y-0.08,16),'#5d4a2c',1.6)};
  stall(0.3,0.5,'#b44a3a');stall(1.7,0.4,'#3a6a4a');stall(0.5,1.9,'#4a5a8a');
  crate(1.9,1.7,0.3);crate(2.2,1.95,0.26);barrel(1.6,2.3);barrel(2.5,1.3);
  flag(1.5,1.4,0,30,'#c8923a')});
 bs('church',3,3,108,u=>{const{box,roofG,roofP,door,winr,line,P,shadow,flag,g,lantern,cobblePath}=u;shadow(0.05,0.05,2.9,2.9);
  box(0.2,1.05,2.55,1.5,0,26,PALB.stone);stoneTex(u,0.2,2.55,2.75,2.55,26);stoneTex(u,2.75,2.55,2.75,1.05,26);
  winr(0.5,2.55,2.5,2.55,9,12,3);
  roofG(0.1,0.95,2.75,1.7,26,47,0,PALB.slate,'slate');
  box(0.35,0.3,0.95,0.95,0,55,PALB.stone);stoneTex(u,0.35,1.25,1.3,1.25,55);
  winr(0.5,1.25,1.15,1.25,38,9,1);winr(1.3,1.1,1.3,0.45,38,9,1);
  roofP(0.28,0.23,1.1,1.1,55,80,PALB.slate);
  const cp=P(0.83,0.78,80);line([cp[0],cp[1]],[cp[0],cp[1]-9],PALB.gold,2);line([cp[0]-3.4,cp[1]-6],[cp[0]+3.4,cp[1]-6],PALB.gold,2);
  door(1.55,2.55,1.95,2.55,15);
  lantern(1.35,2.55,0,15);lantern(2.15,2.55,0,15);
  cobblePath(1.35,2.55,0.8,0.25);
  /* каменная арка над дверью */
  const arP=P(1.75,2.55,18);
  g.fillStyle='#9a8e76';g.strokeStyle='#5a5040';g.lineWidth=0.6;
  g.beginPath();g.arc(arP[0],arP[1],11,Math.PI*1.0,Math.PI*2.0);g.fill();g.stroke();
  /* розетка-витраж с крестом */
  const rsP=P(1.75,2.55,22);
  g.fillStyle='#a89c84';
  g.beginPath();g.arc(rsP[0],rsP[1],7,0,7);g.fill();
  g.strokeStyle='#5a5040';g.lineWidth=0.8;g.stroke();
  /* тёплое цветное стекло */
  g.fillStyle='rgba(220,170,80,0.78)';
  g.beginPath();g.arc(rsP[0],rsP[1],5.5,0,7);g.fill();
  /* блик стекла */
  g.fillStyle='rgba(255,235,170,0.55)';
  g.beginPath();g.arc(rsP[0]-1.8,rsP[1]-1.8,2.0,0,7);g.fill();
  /* золотой крест */
  g.strokeStyle=PALB.gold;g.lineWidth=1.4;
  g.beginPath();
  g.moveTo(rsP[0]-4.5,rsP[1]);g.lineTo(rsP[0]+4.5,rsP[1]);
  g.moveTo(rsP[0],rsP[1]-4.5);g.lineTo(rsP[0],rsP[1]+4.5);
  g.stroke();
  /* свечение */
  const churchGlow=g.createRadialGradient(rsP[0],rsP[1],0,rsP[0],rsP[1],14);
  churchGlow.addColorStop(0,'rgba(255,220,140,0.3)');
  churchGlow.addColorStop(1,'rgba(255,220,140,0)');
  g.fillStyle=churchGlow;g.fillRect(rsP[0]-14,rsP[1]-14,28,28)});
 bs('school',2,2,58,u=>{const{box,roofG,door,winr,poly,P,shadow,g}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.18,0.18,1.64,1.64,0,18,PALB.plaster);u.fach(0.18,1.82,1.82,1.82,0,18,4);
  winr(1.82,1.6,1.82,0.35,6,8,2);
  roofG(0.06,0.06,1.88,1.88,18,35,0,PALB.tile,'tile');
  poly([P(0.85,0.95,35),P(1.15,0.95,35),P(1.0,0.95,46)],'#8a7458');
  g.fillStyle='#3a3026';const bp=P(1.0,0.95,38);g.beginPath();g.arc(bp[0],bp[1],2.4,0,7);g.fill();
  door(0.72,1.82,1.06,1.82,12)});
 bs('hospital',3,3,64,u=>{const{box,roofG,door,winr,wall,line,P,diam,shadow,g}=u;shadow(0.05,0.05,2.9,2.9);
  box(0.15,0.15,2.7,1.5,0,20,'#e6dcc4');u.fach(0.15,1.65,2.85,1.65,0,20,6);
  winr(2.85,1.5,2.85,0.3,7,9,2);
  roofG(0.05,0.05,2.9,1.7,20,38,0,PALB.tile,'tile');
  wall(1.2,1.65,1.8,1.65,8,18,'#ece6da');
  line(P(1.5,1.65,10),P(1.5,1.65,16),'#b03030',2.6);line(P(1.35,1.65,13),P(1.65,1.65,13),'#b03030',2.6);
  diam(0.4,1.95,2.2,0.85,1,'#6f8c46');
  g.fillStyle='#86a852';for(let k=0;k<8;k++){const pp=P(0.6+(k%4)*0.5,2.15+((k/4)|0)*0.4,3);g.fillRect(pp[0]-2,pp[1],4,2.4)}
  door(1.35,1.65,1.7,1.65,0)});
 /* — досуг — */
 bs('tavern',2,2,62,u=>{const{box,roofG,door,winr,sign,barrel,shadow,fach,flowerBox,lantern,firewoodPile,cobblePath}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.18,0.18,1.6,1.6,0,12,PALB.stoneD);
  box(0.15,0.15,1.66,1.66,12,26,PALB.plaster);
  fach(0.15,1.81,1.81,1.81,12,26,4);fach(1.81,1.81,1.81,0.15,12,26,4);
  roofG(0.05,0.05,1.86,1.86,26,44,0,PALB.thatch,'thatch');
  door(0.7,1.81,1.04,1.81,11);winr(1.81,1.55,1.81,0.4,16,8,2);
  barrel(1.62,1.55);barrel(1.78,1.3);
  flowerBox(1.81,1.55,1.81,0.4,16);
  lantern(0.55,1.81,0,11);lantern(1.18,1.81,0,11);
  firewoodPile(0.2,1.84,0.18,0.05);
  cobblePath(0.55,1.81,0.62,0.18);
  /* деревянный козырёк-навес над дверью — выступает наружу */
  u.poly([u.P(0.6,1.81,12),u.P(1.14,1.81,12),u.P(1.22,1.95,10.2),u.P(0.52,1.95,10.2)],'#7a5630');
  u.line(u.P(0.6,1.81,12),u.P(1.14,1.81,12),'#3a2818',0.7);
  u.line(u.P(0.52,1.95,10.2),u.P(1.22,1.95,10.2),'rgba(20,12,4,0.75)',0.6);
  /* столбики поддержки козырька */
  u.line(u.P(0.6,1.81,12),u.P(0.52,1.95,10.2),'#3a2818',0.55);
  u.line(u.P(1.14,1.81,12),u.P(1.22,1.95,10.2),'#3a2818',0.55);
  /* L-образный кронштейн с висячей вывеской */
  u.line(u.P(1.4,1.81,20),u.P(1.6,1.81,20),'#3a2818',0.8);
  u.line(u.P(1.6,1.81,20),u.P(1.6,1.81,16),'#5d4a30',0.7);
  /* подвесная цепочка-кольцо */
  const sP=u.P(1.6,1.81,16);
  u.g.fillStyle='#5d4a30';u.g.beginPath();u.g.arc(sP[0],sP[1]+0.5,0.6,0,7);u.g.fill();
  /* сама вывеска */
  sign(1.46,1.81,1.74,1.81,14,'#9a7438','🍺')});
 bs('theatre',3,3,66,u=>{const{box,roofG,poly,P,flag,line,shadow,g}=u;shadow(0.05,0.05,2.9,2.9);
  box(0.2,0.2,2.6,2.6,0,7,'#9a8458');
  box(0.3,0.3,2.4,0.8,7,26,'#7d6038');
  for(let k=0;k<5;k++)poly([P(0.25+k*0.5,1.05,26),P(0.7+k*0.5,1.05,26),P(0.74+k*0.5,1.7,18),P(0.29+k*0.5,1.7,18)],k%2?'#b44a3a':'#e6dcc2');
  line(P(0.25,1.08,0),P(0.25,1.08,26),'#5d4a2c',2);line(P(2.72,1.08,0),P(2.72,1.08,26),'#5d4a2c',2);
  for(let k=0;k<3;k++)box(0.5+k*0.75,2.2,0.5,0.3,7,11,'#8a7448');
  flag(0.35,0.35,26,9,'#7a3a8a');flag(2.6,0.35,26,9,'#c8923a')});
 bs('fair',4,4,72,u=>{const{diam,roofP,box,flag,line,P,poly,crate,barrel,shadow,g}=u;
  diam(0,0,4,4,0,'#c0ae84');
  const tent=(x,y,sz,c1)=>{box(x,y,sz,sz,0,4,'#8a7448');
   roofP(x-0.08,y-0.08,sz+0.16,sz+0.16,4,4+sz*30,c1);
   const a=P(x+sz/2,y+sz/2,4+sz*30);
   g.strokeStyle='#fff4dc';g.lineWidth=1.4;
   g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[0]-sz*HW*0.7,a[1]+sz*30*0.55+sz*HH*0.7);g.stroke();
   g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[0]+sz*HW*0.7,a[1]+sz*30*0.55+sz*HH*0.7);g.stroke();
   flag(x+sz/2,y+sz/2,4+sz*30,7,c1)};
  tent(0.45,0.5,1.2,'#b44a3a');tent(2.3,0.4,1.0,'#3a6a8a');tent(0.7,2.3,1.0,'#3a7a4a');
  const g1=P(2.2,2.2,22),g2=P(3.6,3.0,14);
  line(g1,g2,'#8a7048',1);
  for(let k=1;k<6;k++){const t=k/6;const mx=g1[0]+(g2[0]-g1[0])*t,my=g1[1]+(g2[1]-g1[1])*t+2;
   poly([[mx-2.4,my],[mx+2.4,my],[mx,my+5]],k%2?'#c84a3a':'#e8c84a')}
  line(P(2.2,2.2,0),P(2.2,2.2,22),'#5d4a2c',1.8);line(P(3.6,3.0,0),P(3.6,3.0,14),'#5d4a2c',1.8);
  crate(2.6,2.6,0.3);barrel(3.1,2.3);crate(2.3,3.2,0.26)});
 /* — военные — */
 bs('barracks',3,3,66,u=>{const{box,door,flag,line,P,diam,shadow}=u;shadow(0.05,0.05,2.9,2.9);
  box(0.2,0.2,2.6,2.6,0,24,PALB.stoneD);
  stoneTex(u,0.2,2.8,2.8,2.8,24);stoneTex(u,2.8,2.8,2.8,0.2,24);
  for(let k=0;k<6;k++){box(0.2+k*0.47,2.62,0.22,0.18,24,31,PALB.stoneD);box(2.62,2.62-k*0.47,0.18,0.22,24,31,PALB.stoneD)}
  diam(0.35,0.35,2.3,2.3,25,'#8a8276');
  door(1.25,2.8,1.75,2.8,17);
  for(let k=0;k<3;k++)line(P(0.45+k*0.18,2.81,0),P(0.52+k*0.18,2.81,21),'#8a7048',1.6);
  flag(1.5,1.5,31,12,'#8a3a30')});
 bs('tower',1,1,84,u=>{const{cyl,flag,wall,g,P,box}=u;
  cyl(0.5,0.5,0.36,0,48,PALB.stoneD);
  g.strokeStyle='rgba(50,46,40,0.35)';
  for(let k=1;k<5;k++){const pp=P(0.5,0.5,k*10);g.beginPath();g.ellipse(pp[0],pp[1],0.36*HW*1.414,0.36*HH*1.414,0,0.3,Math.PI-0.3);g.stroke()}
  cyl(0.5,0.5,0.42,48,54,PALB.stone);
  for(let k=0;k<5;k++){const a=k*Math.PI*2/5+0.4;
   const bx=0.5+Math.cos(a)*0.36,by=0.5+Math.sin(a)*0.36;
   box(bx-0.07,by-0.07,0.14,0.14,54,61,PALB.stone)}
  wall(0.5,0.86,0.5,0.7,18,30,'#241f15');
  flag(0.5,0.5,54,12,'#3a5a8a')});
 bs('wall',1,1,40,u=>{const{box,wall,shadow}=u;
  box(0.06,0.06,0.88,0.88,0,18,PALB.stoneD);
  stoneTex(u,0.06,0.94,0.94,0.94,18);stoneTex(u,0.94,0.94,0.94,0.06,18);
  box(0.06,0.06,0.36,0.36,18,25,PALB.stoneD);box(0.56,0.56,0.36,0.36,18,25,PALB.stoneD)});
 bs('arsenal',2,2,58,u=>{const{box,roofG,door,shadow,g,P,flag}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.15,0.15,1.7,1.7,0,20,PALB.stoneD);stoneTex(u,0.15,1.85,1.85,1.85,20);stoneTex(u,1.85,1.85,1.85,0.15,20);
  roofG(0.05,0.05,1.9,1.9,20,36,1,'#5d6470','slate');
  const sh=(x,c)=>{const pp=P(x,1.86,13);g.fillStyle=c;g.beginPath();g.ellipse(pp[0],pp[1],3.6,4.6,0,0,7);g.fill()};
  sh(0.5,'#8a3a30');sh(0.85,'#3a5a8a');sh(1.2,'#c8923a');
  door(1.4,1.86,1.74,1.86,14);flag(0.3,0.3,36,9,'#5d6470')});
 bs('warehouse',2,2,58,u=>{const{box,roofG,door,crate,barrel,shadow}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.2,0.2,1.6,1.6,0,26,PALB.wood);logsTex(u,0.2,1.8,1.8,1.8,26,6);logsTex(u,1.8,1.8,1.8,0.2,26,6);
  roofG(0.1,0.1,1.8,1.8,26,42,0,'#8a6a3a','tile');
  door(1.15,1.82,1.65,1.82,14);
  crate(0.45,1.95,0.3);crate(0.8,2.05,0.26);barrel(1.95,0.55);barrel(2.02,0.9)});
 /* — власть — */
 bs('townhall',3,3,98,u=>{const{box,roofG,roofP,door,winr,fach,poly,P,flag,line,shadow,g,lantern,cobblePath,flowerBox}=u;shadow(0.03,0.03,2.94,2.94);
  box(0.15,0.15,2.7,2.7,0,16,PALB.stone);stoneTex(u,0.15,2.85,2.85,2.85,16);
  box(0.12,0.12,2.76,2.76,16,36,PALB.plaster);
  fach(0.12,2.88,2.88,2.88,16,36,7);fach(2.88,2.88,2.88,0.12,16,36,7);
  winr(0.35,2.88,2.65,2.88,22,10,4);winr(2.88,2.6,2.88,0.4,22,10,3);
  roofG(0.04,0.04,2.92,2.92,36,58,0,PALB.tile,'tile');
  poly([P(1.1,2.92,36),P(1.9,2.92,36),P(1.5,2.92,54)],'#e2d8bc');
  g.fillStyle='#3a3a44';const cp=P(1.5,2.92,43);g.beginPath();g.arc(cp[0],cp[1],4.4,0,7);g.fill();
  g.strokeStyle='#e8d8a0';g.lineWidth=1;g.beginPath();g.moveTo(cp[0],cp[1]);g.lineTo(cp[0],cp[1]-3);g.moveTo(cp[0],cp[1]);g.lineTo(cp[0]+2.2,cp[1]+1);g.stroke();
  box(1.32,1.32,0.36,0.36,58,66,'#8a7458');roofP(1.26,1.26,0.48,0.48,66,78,PALB.slate);
  flag(1.5,1.5,78,12,PALB.gold);
  door(1.28,2.88,1.72,2.88,14);
  flowerBox(0.35,2.88,2.65,2.88,22);
  lantern(1.1,2.88,0,14);lantern(1.9,2.88,0,14);
  cobblePath(1.1,2.88,0.9,0.25);
  /* геральдический щит с короной над входом */
  const hp=P(1.5,2.88,20);
  /* подложка-щит */
  g.fillStyle='#3a2818';
  g.beginPath();
  g.moveTo(hp[0]-9,hp[1]-12);g.lineTo(hp[0]+9,hp[1]-12);
  g.lineTo(hp[0]+9,hp[1]+0.5);g.lineTo(hp[0],hp[1]+7);
  g.lineTo(hp[0]-9,hp[1]+0.5);g.closePath();g.fill();
  /* сам щит */
  g.fillStyle='#a8443a';
  g.beginPath();
  g.moveTo(hp[0]-7,hp[1]-10);g.lineTo(hp[0]+7,hp[1]-10);
  g.lineTo(hp[0]+7,hp[1]-1);g.lineTo(hp[0],hp[1]+5.5);
  g.lineTo(hp[0]-7,hp[1]-1);g.closePath();g.fill();
  g.strokeStyle='#5a1f18';g.lineWidth=0.7;g.stroke();
  /* золотая горизонтальная полоса */
  g.fillStyle=PALB.gold;
  g.fillRect(hp[0]-7,hp[1]-5,14,2.4);
  /* корона над щитом */
  g.fillStyle=PALB.gold;
  g.fillRect(hp[0]-6,hp[1]-13,12,2.8);
  /* три зубца короны */
  for(let kk=0;kk<3;kk++){
   const cx=hp[0]-4+kk*4;
   g.beginPath();g.moveTo(cx,hp[1]-13);g.lineTo(cx+1.6,hp[1]-15.5);g.lineTo(cx+3.2,hp[1]-13);g.closePath();g.fill();
   /* красные камни на зубцах */
   g.fillStyle='#d4382a';
   g.beginPath();g.arc(cx+1.6,hp[1]-14,0.75,0,7);g.fill();
   g.fillStyle=PALB.gold;
  }});
 bs('taxoffice',2,2,58,u=>{const{box,roofG,door,winr,sign,shadow,wall}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.18,0.18,1.64,1.64,0,18,PALB.stone);stoneTex(u,0.18,1.82,1.82,1.82,18);stoneTex(u,1.82,1.82,1.82,0.18,18);
  roofG(0.06,0.06,1.88,1.88,18,34,1,PALB.slate,'slate');
  wall(1.2,1.82,1.55,1.82,7,13,'#241f15');
  u.line(u.P(1.31,1.82,7),u.P(1.31,1.82,13),'#6e6a60',1.4);u.line(u.P(1.43,1.82,7),u.P(1.43,1.82,13),'#6e6a60',1.4);
  door(0.68,1.82,1.0,1.82,12);sign(1.82,1.45,1.82,1.15,20,PALB.gold,'¢')});
 bs('court',2,2,62,u=>{const{box,roofG,cyl,poly,P,door,sign,shadow}=u;shadow(0.1,0.1,1.8,1.8);
  box(0.2,0.2,1.6,1.3,0,20,PALB.stone);stoneTex(u,1.8,1.5,1.8,0.2,20);
  for(let k=0;k<4;k++)cyl(0.34+k*0.44,1.66,0.09,0,18,'#c2bcae');
  poly([P(0.1,1.84,18),P(1.9,1.84,18),P(1.86,1.6,26),P(0.14,1.6,26)],'#b8b2a4');
  poly([P(0.95,1.72,26),P(0.55,1.72,21),P(1.35,1.72,21)],'#cac4b6');
  roofG(0.1,0.1,1.8,1.55,20,32,0,PALB.slate,'slate');
  door(0.8,1.55,1.15,1.55,13);sign(1.55,1.72,1.85,1.72,12,'#8a8478','⚖')});
 /* — особые — */
 bs('tradepost',3,3,62,u=>{const{box,roofG,door,poly,P,crate,barrel,flag,line,shadow,g,ell}=u;shadow(0.05,0.05,2.9,2.9);
  box(0.2,0.2,1.9,1.9,0,18,PALB.wood);logsTex(u,0.2,2.1,2.1,2.1,18,5);logsTex(u,2.1,2.1,2.1,0.2,18,5);
  roofG(0.1,0.1,2.1,2.1,18,36,0,PALB.thatch,'thatch');
  door(0.9,2.1,1.35,2.1,13);
  for(let k=0;k<3;k++)poly([P(2.12,0.4+k*0.5,16),P(2.12,0.85+k*0.5,16),P(2.4,0.9+k*0.5,9),P(2.4,0.45+k*0.5,9)],k%2?'#b44a3a':'#e6dcc2');
  crate(2.45,1.7,0.34);crate(2.2,2.1,0.3);crate(2.55,2.25,0.26);barrel(1.85,2.45);
  ell(0.75,2.55,0.2,3,'#7d5f3a');ell(0.75,2.55,0.2,5,'#8a6a42');
  g.fillStyle='#54402a';const w1=P(0.55,2.72,2),w2=P(1.0,2.6,2);
  g.beginPath();g.arc(w1[0],w1[1],4,0,7);g.arc(w2[0],w2[1],4,0,7);g.fill();
  flag(2.6,0.35,0,30,'#c8923a')});
 bs('palace',5,5,150,u=>{const{box,roofG,roofP,cyl,door,winr,flag,diam,line,P,shadow,g,poly}=u;shadow(0,0,5,5,0.3);
  box(0.15,0.15,4.7,4.7,0,14,PALB.stoneD);
  for(let k=0;k<10;k++){box(0.15+k*0.47,4.66,0.22,0.19,14,20,PALB.stoneD);box(4.66,4.66-k*0.47,0.19,0.22,14,20,PALB.stoneD)}
  diam(0.4,0.4,4.2,4.2,15,'#a89c84');
  box(1.25,1.25,2.5,2.5,15,58,PALB.stone);
  stoneTex(u,1.25,3.75,3.75,3.75,58);stoneTex(u,3.75,3.75,3.75,1.25,58);
  winr(1.5,3.75,3.5,3.75,28,11,3);winr(3.75,3.5,3.75,1.5,28,11,3);
  winr(1.5,3.75,3.5,3.75,44,11,3);winr(3.75,3.5,3.75,1.5,44,11,3);
  roofG(1.15,1.15,2.7,2.7,58,80,0,PALB.slate,'slate');
  const tw=(x,y)=>{cyl(x,y,0.4,0,66,PALB.stone);cyl(x,y,0.47,66,72,PALB.stoneD);
   roofP(x-0.38,y-0.38,0.76,0.76,72,94,'#4a5a8a');flag(x,y,94,11,PALB.gold)};
  tw(0.55,0.55);tw(4.45,0.55);tw(0.55,4.45);tw(4.45,4.45);
  poly([P(2.1,4.7,0),P(2.9,4.7,0),P(2.9,4.7,26),P(2.5,4.7,34),P(2.1,4.7,26)],'#8a8276');
  g.fillStyle='#2a2018';const gp=P(2.5,4.7,0);
  g.beginPath();g.ellipse(gp[0],gp[1]-9,9,12,0,Math.PI,0);g.fill();g.fillRect(gp[0]-9,gp[1]-9,18,9);
  line(P(2.5,2.5,80),P(2.5,2.5,98),'#5d4a2c',2);
  poly([P(2.5,2.5,98),[P(2.5,2.5,98)[0]+16,P(2.5,2.5,98)[1]+4],[P(2.5,2.5,98)[0],P(2.5,2.5,98)[1]+9]],'#c23a3a')});
 bs('ruin',2,2,44,u=>{const{poly,P,ell,diam,g,shadow}=u;shadow(0.15,0.15,1.7,1.7,0.16);
  diam(0.1,0.1,1.8,1.8,0,'#8a8276');
  poly([P(0.2,1.8,0),P(0.2,0.3,0),P(0.2,0.35,20),P(0.2,0.9,14),P(0.2,1.3,18),P(0.2,1.8,6)],'#9a948a');
  poly([P(0.2,1.8,0),P(1.0,1.8,0),P(1.0,1.8,10),P(0.7,1.8,16),P(0.45,1.8,8),P(0.2,1.8,6)],'#a8a296');
  poly([P(1.75,1.4,0),P(1.75,0.4,0),P(1.75,0.45,16),P(1.75,0.9,8),P(1.75,1.4,12)],'#75716a');
  ell(1.3,1.5,0.16,3,'#8d897f');ell(1.05,1.2,0.12,3,'#9a958a');ell(1.5,0.8,0.13,3,'#807c72');
  g.fillStyle='#5d5950';const rp=P(0.6,0.6,1);g.fillRect(rp[0]-4,rp[1]-2,8,3)});
}

/* ============== ЧАНКИ ЗЕМЛИ + МИНИКАРТА ============== */

/* tileSpr — выбор конкретного варианта тайла по координатам (псевдослучайно) */
export function tileSpr(t, x, y) {
  const a = G.TSPR[t] || G.TSPR[T_GRASS];
  return a[(((x * 73856093) ^ (y * 19349663)) >>> 0) % a.length];
}

const GCH = [];
const mcv = document.createElement('canvas');
mcv.width = MW; mcv.height = MW;
const mgx = mcv.getContext('2d');

export { GCH, mcv };
export function getMiniCanvas() { return mcv; }
export function getChunks() { return GCH; }

export function initChunks() {
  for (let j = 0; j < NCH; j++) for (let i = 0; i < NCH; i++) {
    const c = document.createElement('canvas');
    c.width = CHW; c.height = CHH;
    GCH[j * NCH + i] = { cv: c, g: c.getContext('2d'), dirty: true };
  }
}

export function paintChunk(ci, cj) {
  const ch = GCH[cj * NCH + ci]; ch.dirty = false;
  const g = ch.g; g.clearRect(0, 0, CHW, CHH);
  const x0 = ci * CS, y0 = cj * CS;
  const ox = (x0 - y0 - CS) * HW2 - CMX, oy = (x0 + y0) * HH2 - CMT;
  for (let yy = y0 - 1; yy < y0 + CS + 1; yy++) for (let xx = x0 - 1; xx < x0 + CS + 1; xx++) {
    if (!inb(xx, yy)) continue;
    const t = G.state.map[idx(xx, yy)];
    const Lx = (xx - yy) * HW2 - ox, Ly = (xx + yy) * HH2 - oy;
    g.drawImage(tileSpr(t, xx, yy), Lx - HW2 - 1, Ly - 1);
    if (t !== T_WATER && t !== T_RIVER) {
      const nb = (dx, dy) => { const q = ter(xx + dx, yy + dy); return q === T_WATER || q === T_RIVER; };
      g.strokeStyle = 'rgba(245,240,205,0.5)'; g.lineWidth = 1.6;
      const seg = (a, b, c2, d) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); };
      if (nb(0, -1)) seg(Lx, Ly + 0.8, Lx + HW2, Ly + HH2 + 0.8);
      if (nb(1, 0)) seg(Lx + HW2 - 1, Ly + HH2, Lx, Ly + 2 * HH2 - 1);
      if (nb(0, 1)) seg(Lx, Ly + 2 * HH2 - 1, Lx - HW2 + 1, Ly + HH2);
      if (nb(-1, 0)) seg(Lx - HW2 + 1, Ly + HH2, Lx, Ly + 0.8);
    }
    if (G.state.roads[idx(xx, yy)]) g.drawImage(G.TSPR.road, Lx - HW2 - 1, Ly - 1);
  }
}

export function miniPx(x, y) {
  const i = idx(x, y);
  mgx.fillStyle = G.state.roads[i] ? '#9c9078' : TC[G.state.map[i]];
  mgx.fillRect(x, y, 1, 1);
}

export function paintTile(x, y) {
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const ci = Math.floor((x + di) / CS), cj = Math.floor((y + dj) / CS);
    if (ci >= 0 && cj >= 0 && ci < NCH && cj < NCH) GCH[cj * NCH + ci].dirty = true;
  }
  if (inb(x, y)) miniPx(x, y);
}

export function paintAll() {
  for (const ch of GCH) ch.dirty = true;
  for (let y = 0; y < MW; y++) for (let x = 0; x < MW; x++) miniPx(x, y);
}
