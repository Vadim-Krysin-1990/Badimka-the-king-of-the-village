/* ============== ИГРОВОЙ ДВИЖОК (state + sim + render + input + ui) ============== */

import { G } from './globals.js';
import {
  MW, PT, DAY, SPEEDS, SEASONS, SEASON_FARM,
  T_WATER, T_RIVER, T_SAND, T_GRASS, T_FERT, T_FOREST, T_HILL, T_MTN, T_SWAMP,
  TERNAME, TC, BUILDABLE, PASSABLE,
  HW, HH, HW2, HH2,
  CS, NCH, CMX, CMT, CMB, CHW, CHH, ANCX, ANCY,
  SKEY, PALB
} from './config.js';
import {
  RES_ORDER, RI, FOODS, CATS, BUILD,
  HOUSEN, HICON, HCAP, HRATE, TAXM, TAXN,
  UNITT, FOET, TITLES, STAGES,
  NAM_M, NAM_F, NAM_S, PHR, QUESTS, TECHS, MILESTONES
} from './data.js';
import {
  $, clamp, dist, fmt, pct, mulberry32, hashStr, ri, pick, makeNoise, fbm, shade
} from './utils.js';
import { idx, inb, ter, mapGen, findSpawn } from './map.js';
import {
  mkIso, mkTile, mkTree, mkRock, mkMan, flipSpr, buildPeople, bs,
  buildTiles, buildSprites, tileSpr, speck, logsTex, stoneTex,
  initChunks, paintChunk, paintTile, paintAll, miniPx, GCH, mcv
} from './sprites.js';
import { store } from './store.js';
import { loadSpritesFromFolder, loadSpritesFromFiles } from './customSprites.js';
import { sfx, startMusic, setMusicVol, setSfxVol, toggleMute, getVolumes } from './audio.js';

/* tmul, hasTech — модификаторы и проверка технологий */
function tmul(k) { let m = 1; for (const id of G.state.techDone) { const t = TECHS[id]; if (t.k === k) m *= t.v; } return m; }
function hasTech(id) { return G.state.techDone.includes(id); }

/* ---------- Состояние: создание, сериализация ---------- */


export function initRes(){const r={};for(const k of RES_ORDER)r[k]=0;return r}
export function freshState(seed,peaceful){
 return {v:1,seed,peaceful:!!peaceful,day:0,lastDay:0,paused:false,speed:0,
  gold:300,res:initRes(),taxRate:1,
  map:null,forest:null,roads:new Uint8Array(MW*MW),occ:new Int32Array(MW*MW),
  buildings:[],nextBid:1,citizens:[],nextCid:1,units:[],foes:[],
  hero:null,questIdx:0,techDone:[],research:null,trade:{},nextCaravan:1e9,
  mods:[],evNext:10,raidNext:peaceful?Infinity:28,wave:0,unrest:0,hunger:0,plague:0,
  stats:{bread:0,weapons:0,raids:0,traded:0},happy:55,foodDays:9,variety:1,short:{},
  won:false,festCd:0,lastTax:0,foesWere:false,flags:{},milestones:[],porters:[]};
}
export function newGame(seedStr,peaceful){
 const seed=seedStr?hashStr(seedStr):((Math.random()*0xFFFFFFFF)>>>0);
 const gen=mapGen(seed);
 G.state=freshState(seed,peaceful);
 G.BIDX.clear();
 G.state.map=gen.map;G.state.forest=gen.forest;
 const sp=findSpawn(gen.map);
 let placedR=0,guard=0;
 while(placedR<5&&guard++<500){
  const x=ri(Math.random,4,MW-7),y=ri(Math.random,4,MW-7);
  if(dist(x,y,sp[0],sp[1])<16)continue;
  if(canPlace('ruin',x,y).ok){addBuilding('ruin',x,y);placedR++}
 }
 G.state.res.wood=80;G.state.res.stone=40;G.state.res.bread=60;G.state.res.tools=10;G.state.res.veg=20;
 G.state.hero={hero:true,x:sp[0]+0.5,y:sp[1]+0.5,tx:null,ty:null,hp:120,maxhp:120,lvl:1,xp:0,insCd:0,rally:false,cd:0};
 G.cam.x=sp[0];G.cam.y=sp[1];G.cam.z=innerWidth<880?0.16:0.225;
 G.sel=null;G.buildSel=null;G.floaters=[];
 paintAll();G.covDirty=true;
 toast('🏰 Добро пожаловать, владыка Бадимка! Стройте дома 🛖 и склад 📦 — добыча попадает в казну, только когда носильщик доносит её до склада или ратуши.','good');
}
export function arrToStr(a){let s='';for(let i=0;i<a.length;i++)s+=String.fromCharCode(48+a[i]);return s}
export function strToArr(s){const a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i)-48;return a}
function packStock(st){const o={};for(const k in st)if(st[k]>=0.05)o[k]=+st[k].toFixed(1);return o}
export function serialize(){
 const s=G.state;
 return JSON.stringify({v:1,seed:s.seed,peaceful:s.peaceful,day:s.day,lastDay:s.lastDay,
  gold:Math.floor(s.gold),res:s.res,taxRate:s.taxRate,
  map:arrToStr(s.map),forest:arrToStr(s.forest),roads:arrToStr(s.roads),
  buildings:s.buildings.map(b=>({id:b.id,t:b.type,x:b.x,y:b.y,hp:Math.round(b.hp),on:b.on?1:0,lvl:b.lvl||1,miss:b.miss||0,st:packStock(b.stock||{})})),
  nextBid:s.nextBid,nextCid:s.nextCid,
  citizens:s.citizens.map(c=>({i:c.id,n:c.name,f:c.fem?1:0,a:c.age,h:c.home,w:c.work})),
  units:s.units.map(u=>({t:u.t,x:+u.x.toFixed(1),y:+u.y.toFixed(1),hp:Math.round(u.hp)})),
  hero:{x:s.hero.x,y:s.hero.y,hp:s.hero.hp,lvl:s.hero.lvl,xp:s.hero.xp},
  questIdx:s.questIdx,techDone:s.techDone,research:s.research,trade:s.trade,mods:s.mods,
  evNext:s.evNext,raidNext:s.raidNext===Infinity?-1:s.raidNext,nextCaravan:s.nextCaravan,
  wave:s.wave,unrest:s.unrest,hunger:s.hunger,plague:s.plague,stats:s.stats,happy:s.happy,
  won:s.won,festCd:s.festCd,flags:s.flags,milestones:s.milestones||[]});
}
export function restore(js){
 const o=JSON.parse(js);
 if(!o||o.v!==1)throw new Error('неизвестный формат сохранения');
 G.state=freshState(o.seed,o.peaceful);
 G.BIDX.clear();
 G.state.day=o.day;G.state.lastDay=o.lastDay;G.state.gold=o.gold;
 Object.assign(G.state.res,o.res);
 G.state.taxRate=o.taxRate!=null?o.taxRate:1;
 G.state.techDone=o.techDone||[];
 G.state.map=strToArr(o.map);G.state.forest=strToArr(o.forest);G.state.roads=strToArr(o.roads);
 G.state.nextBid=o.nextBid;G.state.nextCid=o.nextCid;
 G.state.buildings=o.buildings.map(b=>{
  const D=BUILD[b.t];
  const nb={id:b.id,type:b.t,x:b.x,y:b.y,w:D.w,h:D.h,hp:b.hp,maxhp:D.hp*tmul('hp'),on:!!b.on,
   lvl:b.lvl||1,miss:b.miss||0,staff:0,resN:0,buff:0,cd:0,burn:false,cov:{},stock:b.st||{}};
  G.BIDX.set(nb.id,nb);return nb;
 });
 rebuildOccById();
 G.state.citizens=(o.citizens||[]).map(c=>{
  const hb=G.BIDX.get(c.h);
  const pos=hb?center(hb):[MW/2,MW/2];
  return {id:c.i,name:c.n,fem:!!c.f,age:c.a,home:c.h||0,work:c.w||0,
   x:pos[0]+Math.random()-0.5,y:pos[1]+Math.random()-0.5,tx:0,ty:0,st:'home',t:Math.random()*4,
   happy:o.happy||50,vis:false};
 });
 for(const c of G.state.citizens){if(c.work){const b=G.BIDX.get(c.work);if(b&&BUILD[b.type].wk>0)b.staff++;else c.work=0}}
 recountHomes();
 G.state.units=(o.units||[]).map(u=>({t:u.t,x:u.x,y:u.y,hp:u.hp,maxhp:UNITT[u.t].hp*tmul('uhp'),cd:0,hx:u.x,hy:u.y}));
 const ho=o.hero;
 G.state.hero={hero:true,x:ho.x,y:ho.y,tx:null,ty:null,hp:ho.hp,maxhp:100+20*ho.lvl,lvl:ho.lvl,xp:ho.xp,insCd:0,rally:false,cd:0};
 G.state.questIdx=o.questIdx||0;G.state.research=o.research||null;G.state.trade=o.trade||{};
 G.state.mods=o.mods||[];G.state.evNext=o.evNext||G.state.day+10;
 G.state.raidNext=(o.raidNext<0)?Infinity:o.raidNext;
 G.state.nextCaravan=o.nextCaravan||1e9;
 G.state.wave=o.wave||0;G.state.unrest=o.unrest||0;G.state.hunger=o.hunger||0;G.state.plague=o.plague||0;
 if(o.stats)G.state.stats=o.stats;
 G.state.happy=o.happy||50;G.state.won=!!o.won;G.state.festCd=o.festCd||0;G.state.flags=o.flags||{};
 G.state.milestones=o.milestones||[];G.state.porters=[];
 paintAll();G.covDirty=true;coverage();
 G.cam.x=G.state.hero.x;G.cam.y=G.state.hero.y;
 G.sel=null;G.buildSel=null;G.floaters=[];
}
export async function saveSlot(slot,quiet){
 try{
  const js=serialize();
  await store.set(SKEY+slot,js);
  await store.set(SKEY+slot+'-meta',JSON.stringify({day:Math.floor(G.state.day),pop:pop(),date:Date.now()}));
  if(!quiet)toast('💾 Сохранено: '+(slot==='auto'?'автослот':'слот '+slot),'good');
  return true;
 }catch(e){if(!quiet)toast('Не удалось сохранить: '+e.message,'bad');return false}
}
export async function loadSlot(slot){
 const js=await store.get(SKEY+slot);
 if(!js){toast('Слот пуст','bad');return false}
 try{restore(js);toast('📂 Игра загружена','good');return true}
 catch(e){toast('Сейв повреждён: '+e.message,'bad');return false}
}
export function exportSave(){
 const blob=new Blob([serialize()],{type:'application/json'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download='badimka-save-day'+Math.floor(G.state.day)+'.json';
 a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),5000);
 toast('📤 Сохранение выгружено в файл','good');
}
export function importSave(file){
 const r=new FileReader();
 r.onload=()=>{try{restore(r.result);closeM();toast('📥 Сохранение загружено из файла','good')}catch(e){toast('Файл повреждён: '+e.message,'bad')}};
 r.readAsText(file);
}

/* ---------- Здания: размещение, снос, охват ---------- */
export function rebuildOccById(){
 G.state.occ.fill(0);
 for(const b of G.state.buildings)for(let dy=0;dy<b.h;dy++)for(let dx=0;dx<b.w;dx++)G.state.occ[idx(b.x+dx,b.y+dy)]=b.id;
}
export function bAt(x,y){const id=G.state.occ[idx(x,y)];return id?(G.BIDX.get(id)||null):null}
export function center(b){return [b.x+b.w/2,b.y+b.h/2]}
export function cnt(type){let n=0;for(const b of G.state.buildings)if(b.type===type)n++;return n}
export function pop(){return G.state.citizens.length}
export function beds(){let n=0;for(const b of G.state.buildings)if(b.type==='house')n+=HCAP[b.lvl-1];return n}
export function foodStock(){let s=0;for(const f of FOODS)s+=G.state.res[f];return s}
export function houseLvl(l){let n=0;for(const b of G.state.buildings)if(b.type==='house'&&b.lvl>=l)n++;return n}
export function nearTer(x,y,w,h,r,fn){
 let n=0;
 for(let yy=y-r;yy<y+h+r;yy++)for(let xx=x-r;xx<x+w+r;xx++){
  if(inb(xx,yy)&&fn(G.state.map[idx(xx,yy)],xx,yy))n++;
 }
 return n;
}
export function needOk(D,x,y){
 if(!D.need)return true;
 if(D.need==='water')return nearTer(x,y,D.w,D.h,2,t=>t===T_WATER||t===T_RIVER)>0;
 if(D.need==='forest')return nearTer(x,y,D.w,D.h,4,(t,xx,yy)=>t===T_FOREST&&G.state.forest[idx(xx,yy)]>0)>0;
 if(D.need==='mtn')return nearTer(x,y,D.w,D.h,2,t=>t===T_MTN||t===T_HILL)>0;
 if(D.need==='wet')return nearTer(x,y,D.w,D.h,2,t=>t===T_WATER||t===T_RIVER||t===T_SWAMP)>0;
 return true;
}
export function costOf(type){
 const D=BUILD[type],m=tmul('cost'),out={};
 for(const k in D.cost)out[k]=Math.ceil(D.cost[k]*(k==='gold'?1:m));
 return out;
}
export function canAfford(cost){for(const k in cost){if(k==='gold'){if(G.state.gold<cost[k])return false}else if(G.state.res[k]<cost[k])return false}return true}
export function payCost(cost){for(const k in cost){if(k==='gold')G.state.gold-=cost[k];else G.state.res[k]-=cost[k]}}
export function costStr(cost){const p=[];for(const k in cost)p.push((k==='gold'?'🪙':RI[k].i)+cost[k]);return p.join(' ')}
export function canPlace(type,x,y){
 const D=BUILD[type];
 if(D.one&&cnt(type)>=1)return{ok:false,why:'Такое здание может быть только одно'};
 for(let dy=0;dy<D.h;dy++)for(let dx=0;dx<D.w;dx++){
  const xx=x+dx,yy=y+dy;
  if(!inb(xx,yy))return{ok:false,why:'За краем мира'};
  const t=G.state.map[idx(xx,yy)];
  if(!(BUILDABLE(t)||((D.hill||D.isRoad)&&t===T_HILL)))return{ok:false,why:'Нельзя строить: '+TERNAME[t].toLowerCase()};
  if(G.state.occ[idx(xx,yy)])return{ok:false,why:'Место занято'};
  if(D.isRoad&&G.state.roads[idx(xx,yy)])return{ok:false,why:'Дорога уже есть'};
 }
 if(D.fert===2){
  let f=0;
  for(let dy=0;dy<D.h;dy++)for(let dx=0;dx<D.w;dx++)if(G.state.map[idx(x+dx,y+dy)]===T_FERT)f++;
  if(f<D.w*D.h/2)return{ok:false,why:'Нужна плодородная земля'};
 }
 if(!needOk(D,x,y)){
  const wn={water:'Нужна вода рядом',forest:'Нужен лес рядом',mtn:'Нужны горы или холмы рядом',wet:'Нужна вода или болото рядом'};
  return{ok:false,why:wn[D.need]||'Неподходящее место'};
 }
 return{ok:true};
}
export function addBuilding(type,x,y){
 const D=BUILD[type];
 const b={id:G.state.nextBid++,type,x,y,w:D.w,h:D.h,hp:D.hp*tmul('hp'),maxhp:D.hp*tmul('hp'),on:true,
  lvl:1,resN:0,staff:0,buff:0,cd:0,miss:0,burn:false,cov:{},stock:{}};
 G.state.buildings.push(b);
 G.BIDX.set(b.id,b);
 for(let dy=0;dy<D.h;dy++)for(let dx=0;dx<D.w;dx++){
  G.state.occ[idx(x+dx,y+dy)]=b.id;
  if(G.state.roads[idx(x+dx,y+dy)]){G.state.roads[idx(x+dx,y+dy)]=0;paintTile(x+dx,y+dy)}
 }
 G.covDirty=true;
 return b;
}
export function removeBuilding(b,refund){
 for(let dy=0;dy<b.h;dy++)for(let dx=0;dx<b.w;dx++)G.state.occ[idx(b.x+dx,b.y+dy)]=0;
 G.BIDX.delete(b.id);
 G.state.buildings=G.state.buildings.filter(x=>x!==b);
 for(const c of G.state.citizens){
  if(c.home===b.id)c.home=0;
  if(c.work===b.id)c.work=0;
 }
 if(refund){
  if(b.type==='ruin'){G.state.res.stone+=30;G.state.gold+=15;toast('🏚️ Руины разобраны: +30 камня, +15 золота','good')}
  else{
   const cost=BUILD[b.type].cost;
   for(const k in cost){const v=Math.floor(cost[k]*0.3);if(k==='gold')G.state.gold+=v;else G.state.res[k]+=v}
  }
 }
 if(G.sel&&G.sel.type==='b'&&G.sel.id===b.id)select(null);
 G.covDirty=true;
}
export function tryPlace(type,x,y,quiet){
 if(type==='demolish'){
  if(!inb(x,y))return;
  const b=bAt(x,y);
  if(b){const wasRuin=b.type==='ruin';removeBuilding(b,true);if(!wasRuin&&!quiet){toast('Снесено (возврат 30% ресурсов)');sfx('demolish')}}
  else if(G.state.roads[idx(x,y)]){G.state.roads[idx(x,y)]=0;paintTile(x,y)}
  return;
 }
 const D=BUILD[type];
 const cp=canPlace(type,x,y);
 if(!cp.ok){if(!quiet){toast(cp.why,'bad');sfx('rejected')}return}
 const cost=costOf(type);
 if(!canAfford(cost)){if(!quiet){toast('Не хватает ресурсов: '+costStr(cost),'bad');sfx('rejected')}return}
 payCost(cost);
 if(D.isRoad){G.state.roads[idx(x,y)]=1;paintTile(x,y);return}
 addBuilding(type,x,y);
 sfx('build');
 giveXp(2+Object.keys(cost).length);
 if(D.one)setBuild(null);
 if(type==='palace'){toast('👑 Королевский дворец Бадимки воздвигнут!','good');sfx('victory')}
}
export function coverage(){
 G.covDirty=false;
 const srv=[];
 for(const b of G.state.buildings){
  const D=BUILD[b.type];
  if(D.srv&&b.on&&(D.wk===0||b.staff>0)&&!b.burn){
   const c=center(b);
   srv.push({k:D.srv,x:c[0],y:c[1],r:D.rad});
  }
 }
 for(const b of G.state.buildings){
  if(b.type!=='house')continue;
  const hc=center(b);
  const cov={};
  for(const s of srv)if(dist(hc[0],hc[1],s.x,s.y)<=s.r)cov[s.k]=true;
  b.cov=cov;
 }
}

/* ---------- Дома: эволюция уровней ---------- */
export const HREQ=[
 [],
 ['water','food'],
 ['water','food','market'],
 ['water','food','market','church','clothes'],
 ['water','food','market','church','clothes','tavern','furn'],
 ['water','food','market','church','clothes','tavern','furn','fun','sec','wine'],
 ['water','food','market','church','clothes','tavern','furn','fun','sec','wine','books','jewel']
];
export const REQN={water:'Вода',food:'Еда',market:'Рынок',church:'Церковь',clothes:'Одежда',tavern:'Таверна',
 furn:'Мебель',fun:'Развлечения',sec:'Безопасность',wine:'Вино',books:'Книги',jewel:'Украшения'};
export function reqMet(b,key){
 switch(key){
  case 'water':return !!b.cov.water;
  case 'food':return G.state.hunger===0&&foodStock()>pop()*0.5;
  case 'market':return !!b.cov.market;
  case 'church':return !!b.cov.church;
  case 'tavern':return !!b.cov.tavern;
  case 'fun':return !!b.cov.fun;
  case 'sec':return !!b.cov.sec;
  case 'clothes':return G.state.res.clothes>1&&!!b.cov.market;
  case 'furn':return G.state.res.furn>1&&!!b.cov.market;
  case 'wine':return G.state.res.wine>1&&!!b.cov.market;
  case 'books':return G.state.res.books>1&&!!b.cov.market;
  case 'jewel':return G.state.res.jewel>0.5&&!!b.cov.market;
 }
 return false;
}
export function houseReqs(b,lvl){for(const k of HREQ[lvl-1])if(!reqMet(b,k))return false;return true}
export function evolveHouses(){
 for(const b of G.state.buildings){
  if(b.type!=='house')continue;
  if(b.lvl<7&&houseReqs(b,b.lvl+1)){
   b.miss=0;b.lvl++;
   if(b.lvl>=3&&Math.random()<0.25){toast('🏡 Дом вырос: «'+HOUSEN[b.lvl-1]+'»','good');sfx('evolve')}
  }else if(!houseReqs(b,b.lvl)){
   b.miss=(b.miss||0)+1;
   if(b.miss>=3&&b.lvl>1){
    b.lvl--;b.miss=0;
    let over=(b.resN||0)-HCAP[b.lvl-1];
    if(over>0)for(const c of G.state.citizens){if(over<=0)break;if(c.home===b.id){c.home=0;over--;b.resN--}}
   }
  }else b.miss=0;
 }
}
export function recountHomes(){
 for(const b of G.state.buildings)if(b.type==='house')b.resN=0;
 for(const c of G.state.citizens){
  if(!c.home)continue;
  const b=G.BIDX.get(c.home);
  if(b&&b.type==='house')b.resN=(b.resN||0)+1;
  else c.home=0;
 }
}

/* ---------- Жители ---------- */
export function mkCitizen(homeId,age){
 const fem=Math.random()<0.5;
 const name=(fem?pick(Math.random,NAM_F):pick(Math.random,NAM_M))+' '+pick(Math.random,NAM_S)+(fem?'а':'');
 const hb=G.BIDX.get(homeId);
 const pos=hb?center(hb):[G.state.hero.x,G.state.hero.y];
 const c={id:G.state.nextCid++,name,fem,age:age!=null?age:ri(Math.random,16,40),home:homeId||0,work:0,
  x:pos[0]+Math.random()-0.5,y:pos[1]+Math.random()-0.5,tx:0,ty:0,st:'home',t:Math.random()*4,
  happy:G.state.happy,vis:false};
 G.state.citizens.push(c);
 return c;
}
export function removeCitizen(i){
 const c=G.state.citizens[i];
 if(!c)return;
 if(c.work){const b=G.BIDX.get(c.work);if(b&&b.staff>0)b.staff--}
 G.state.citizens.splice(i,1);
}
export function edgePoint(){
 for(let i=0;i<200;i++){
  const side=Math.floor(Math.random()*4);
  let x,y;
  if(side===0){x=ri(Math.random,2,MW-3);y=1}
  else if(side===1){x=ri(Math.random,2,MW-3);y=MW-2}
  else if(side===2){x=1;y=ri(Math.random,2,MW-3)}
  else{x=MW-2;y=ri(Math.random,2,MW-3)}
  if(PASSABLE(G.state.map[idx(x,y)]))return[x+0.5,y+0.5];
 }
 return [G.state.hero.x,G.state.hero.y];
}
export function immigration(){
 recountHomes();
 const free=beds()-pop();
 if(free<=0)return;
 if(G.state.happy<45||foodStock()<pop()*1.5+5)return;
 const n=Math.min(free,3+Math.ceil(pop()*0.04),14);
 const homes=G.state.buildings.filter(b=>b.type==='house'&&b.resN<HCAP[b.lvl-1]);
 let placed=0;
 for(let i=0;i<n;i++){
  const h=homes.find(b=>b.resN<HCAP[b.lvl-1]);
  if(!h)break;
  const c=mkCitizen(h.id);
  const e=edgePoint();
  c.x=e[0];c.y=e[1];c.st='tohome';setTarget(c,...center(h));
  h.resN++;placed++;
 }
 if(placed>0&&Math.random()<0.4)toast('🧳 Прибыли переселенцы: +'+placed);
}
export function homelessTick(){
 for(let i=G.state.citizens.length-1;i>=0;i--){
  const c=G.state.citizens[i];
  if(c.home)continue;
  const h=G.state.buildings.find(b=>b.type==='house'&&b.resN<HCAP[b.lvl-1]);
  if(h){c.home=h.id;h.resN++;c.st='tohome';setTarget(c,...center(h));c.leave=0}
  else{c.leave=(c.leave||0)+1;if(c.leave>4)removeCitizen(i)}
 }
}
export function assignWork(){
 const jobs=[];
 for(const b of G.state.buildings){
  if(b.type==='house'||!b.on||b.burn)continue;
  const D=BUILD[b.type];
  if(D.wk>0&&b.staff<D.wk)jobs.push(b);
 }
 if(!jobs.length)return;
 const pr={'Еда':0,'Сырьё':1,'Общество':2};
 for(const c of G.state.citizens){
  if(c.work||c.age<14||c.age>62||!c.home)continue;
  let best=null,bd=1e9;
  const hb=G.BIDX.get(c.home);
  const hc=hb?center(hb):[c.x,c.y];
  for(const j of jobs){
   if(j.staff>=BUILD[j.type].wk)continue;
   const jc=center(j);
   const d=dist(hc[0],hc[1],jc[0],jc[1])+(pr[BUILD[j.type].cat]!==undefined?pr[BUILD[j.type].cat]:3)*9;
   if(d<bd){bd=d;best=j}
  }
  if(!best)break;
  c.work=best.id;best.staff++;
 }
}
export function setTarget(c,x,y){c.tx=x+(Math.random()-0.5)*1.2;c.ty=y+(Math.random()-0.5)*1.2}
export function moveAgent(a,spd,sdt){
 if(a.tx==null)return true;
 const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy);
 if(d<0.18)return true;
 let sp=spd;
 const ti=idx(clamp(Math.floor(a.x),0,MW-1),clamp(Math.floor(a.y),0,MW-1));
 if(G.state.roads[ti])sp*=1.6;
 else if(G.state.map[ti]===T_SWAMP)sp*=0.5;
 else if(G.state.map[ti]===T_RIVER)sp*=0.45;
 const st=Math.min(d,sp*sdt);
 const ox=a.x,oy=a.y;
 let nx=a.x+dx/d*st,ny=a.y+dy/d*st;
 const tt=G.state.map[idx(clamp(Math.floor(nx),0,MW-1),clamp(Math.floor(ny),0,MW-1))];
 if(!PASSABLE(tt)){
  const tX=G.state.map[idx(clamp(Math.floor(nx),0,MW-1),clamp(Math.floor(a.y),0,MW-1))];
  const tY=G.state.map[idx(clamp(Math.floor(a.x),0,MW-1),clamp(Math.floor(ny),0,MW-1))];
  if(PASSABLE(tX))ny=a.y;
  else if(PASSABLE(tY))nx=a.x;
  else{
   nx=a.x+(Math.random()-0.5)*0.4;ny=a.y+(Math.random()-0.5)*0.4;
   const tr=G.state.map[idx(clamp(Math.floor(nx),0,MW-1),clamp(Math.floor(ny),0,MW-1))];
   if(!PASSABLE(tr)){nx=a.x;ny=a.y}
  }
 }
 a.x=clamp(nx,0.5,MW-0.5);a.y=clamp(ny,0.5,MW-0.5);
 if(st>1e-4&&Math.hypot(a.x-ox,a.y-oy)<st*0.15){
  a.stk=(a.stk||0)+sdt;
  if(a.stk>8){
   a.stk=0;
   if(a.hero)return true;
   a.x=clamp(a.tx,0.5,MW-0.5);a.y=clamp(a.ty,0.5,MW-0.5);
   return true;
  }
 }else a.stk=0;
 return false;
}
export function nearestB(x,y,type){
 let best=null,bd=1e9;
 for(const b of G.state.buildings){
  if(b.type!==type||b.burn)continue;
  const c=center(b);
  const d=dist(x,y,c[0],c[1]);
  if(d<bd){bd=d;best=b}
 }
 return best;
}
export function goHome(c){const h=G.BIDX.get(c.home);if(h)setTarget(c,...center(h));else{c.tx=c.x;c.ty=c.y}}
export function citizenAI(c,sdt){
 c.t-=sdt;
 if(G.state.foes.length>0&&c.st!=='panic'){c.st='panic';goHome(c)}
 switch(c.st){
  case 'panic':
   if(moveAgent(c,2.7,sdt)&&!G.state.foes.length){c.st='home';c.t=1}
   else if(!G.state.foes.length){c.st='home';c.t=0.5}
   break;
  case 'home':
   if(c.t<=0){
    if(c.work){const w=G.BIDX.get(c.work);if(w){c.st='towork';setTarget(c,...center(w));break}else c.work=0}
    const m=nearestB(c.x,c.y,'market');
    if(m&&Math.random()<0.4){c.st='tomarket';setTarget(c,...center(m))}
    else c.t=2+Math.random()*4;
   }
   break;
  case 'towork':{
   const w=G.BIDX.get(c.work);
   if(!w){c.st='home';c.t=1;break}
   if(moveAgent(c,1.7,sdt)){c.st='work';c.t=6+Math.random()*6}
   break;
  }
  case 'work':
   if(c.t<=0){
    const m=nearestB(c.x,c.y,'market');
    if(m&&Math.random()<0.5){c.st='tomarket';setTarget(c,...center(m))}
    else{c.st='tohome';goHome(c)}
   }
   break;
  case 'tomarket':
   if(moveAgent(c,1.7,sdt)){c.st='market';c.t=2+Math.random()*2}
   break;
  case 'market':
   if(c.t<=0){c.st='tohome';goHome(c)}
   break;
  case 'tohome':
   if(moveAgent(c,1.7,sdt)){c.st='home';c.t=3+Math.random()*5}
   break;
  default:c.st='home';c.t=1;
 }
}

/* ---------- Бадимка ---------- */
export function heroTitle(){let t='Староста';for(const p of TITLES)if(G.state.hero.lvl>=p[0])t=p[1];return t}
export function xpNeed(l){return Math.floor(100*Math.pow(l,1.4))}
export function giveXp(n){
 const h=G.state.hero;
 h.xp+=n;
 while(h.xp>=xpNeed(h.lvl)){
  h.xp-=xpNeed(h.lvl);h.lvl++;
  h.maxhp=100+20*h.lvl;h.hp=h.maxhp;
  toast('⭐ Бадимка достиг уровня '+h.lvl+'! Титул: '+heroTitle(),'good');
 }
}
export function heroTick(sdt){
 const h=G.state.hero;
 if(h.tx!=null){if(moveAgent(h,3.4,sdt)){h.tx=null;h.ty=null}}
 if(h.insCd>0)h.insCd-=sdt/DAY;
 if(!G.state.foes.length&&h.hp<h.maxhp)h.hp=Math.min(h.maxhp,h.hp+sdt*0.8);
 if(G.state.foes.length){
  let tgt=null,bd=1e9;
  for(const f of G.state.foes){const d=dist(h.x,h.y,f.x,f.y);if(d<bd){bd=d;tgt=f}}
  if(tgt&&bd<1.8){
   h.cd-=sdt;
   if(h.cd<=0){tgt.hp-=8+h.lvl*2;h.cd=0.8;pf(tgt.x,tgt.y,'⚔️')}
  }
 }
}
export function inspect(b){
 const h=G.state.hero;
 const c=center(b);
 if(dist(h.x,h.y,c[0],c[1])>4.5){toast('Бадимка слишком далеко — подведите его к зданию','bad');return}
 if(h.insCd>0){toast('Инспекция недавно была — подождите','bad');return}
 b.buff=G.state.day+1.5;h.insCd=0.5;
 giveXp(5);
 pf(c[0],c[1],'👑 +25%');
 toast('👑 Инспекция: «'+(b.type==='house'?HOUSEN[b.lvl-1]:BUILD[b.type].n)+'» работает на +25% один день');
}
export function festival(){
 const s=G.state;
 if(cnt('townhall')<1){toast('Для праздника нужна ратуша','bad');return}
 if(s.festCd>s.day){toast('Праздник недавно отгремел — подождите пару дней','bad');return}
 const cost=Math.floor(50+pop()*0.6);
 if(s.gold<cost){toast('Не хватает золота: нужно '+cost+' 🪙','bad');return}
 s.gold-=cost;s.festCd=s.day+10;
 addMod('happy',12,5,'Праздник');
 giveXp(12);
 pf(s.hero.x,s.hero.y,'🎉');
 sfx('festival');
 toast('🎉 Бадимка устроил праздник за '+cost+' 🪙! +12 к счастью на 5 дней','good');
}

/* ---------- Симуляция: производство и день ---------- */
export function seasonIdx(){return Math.floor(G.state.day/12)%4}
export function modMult(tag){let m=1;for(const md of G.state.mods)if(md.tag===tag)m*=md.mult;return m}
export function addMod(tag,mult,days,label){G.state.mods.push({tag,mult,until:G.state.day+days,label})}
export function forestNear(b){
 let n=0;
 for(let yy=b.y-4;yy<b.y+b.h+4;yy++)for(let xx=b.x-4;xx<b.x+b.w+4;xx++){
  if(inb(xx,yy)&&G.state.map[idx(xx,yy)]===T_FOREST&&G.state.forest[idx(xx,yy)]>0)n++;
 }
 return n;
}
export function chopNear(b){
 const list=[];
 for(let yy=b.y-4;yy<b.y+b.h+4;yy++)for(let xx=b.x-4;xx<b.x+b.w+4;xx++){
  if(inb(xx,yy)&&G.state.map[idx(xx,yy)]===T_FOREST&&G.state.forest[idx(xx,yy)]>0)list.push([xx,yy]);
 }
 if(!list.length)return;
 const p=list[Math.floor(Math.random()*list.length)];
 const i=idx(p[0],p[1]);
 G.state.forest[i]--;
 if(G.state.forest[i]<=0){G.state.map[i]=T_GRASS;paintTile(p[0],p[1])}
}
export function fertFactor(b){
 let f=0;
 for(let dy=0;dy<b.h;dy++)for(let dx=0;dx<b.w;dx++)if(G.state.map[idx(b.x+dx,b.y+dy)]===T_FERT)f++;
 return 0.6+0.55*(f/(b.w*b.h));
}
/* ---------- Носильщики: продукция копится в здании и доставляется на склад/ратушу ---------- */
export const STOCK_CAP=30,PORTER_MIN=6,PORTER_MAX=12;
export function stockTotal(b){let t=0;for(const k in b.stock)t+=b.stock[k];return t}
export function depotList(){return G.state.buildings.filter(x=>(x.type==='warehouse'||x.type==='townhall')&&x.on&&!x.burn)}
export function nearestDepot(x,y){
 let best=null,bd=1e9;
 for(const d of depotList()){const c=center(d);const dd=dist(x,y,c[0],c[1]);if(dd<bd){bd=dd;best=d}}
 return best;
}
export function maybeSendPorter(b){
 if(b.hasPorter||!b.staff)return;
 if(stockTotal(b)<PORTER_MIN)return;
 const c=center(b);
 const dep=nearestDepot(c[0],c[1]);
 if(!dep)return;
 const carry={};let left=PORTER_MAX;
 for(const k in b.stock){
  if(left<=0)break;
  const take=Math.min(b.stock[k],left);
  if(take>0.05){carry[k]=take;b.stock[k]-=take;left-=take}
  if(b.stock[k]<1e-6)delete b.stock[k];
 }
 const dc=center(dep);
 b.hasPorter=true;
 G.state.porters.push({x:c[0],y:c[1],tx:dc[0]+(Math.random()-0.5),ty:dc[1]+(Math.random()-0.5),
  carry,home:b.id,dep:dep.id,phase:'go',v:b.id&3});
}
export function porterTick(sdt){
 const ps=G.state.porters||(G.state.porters=[]);
 for(let i=ps.length-1;i>=0;i--){
  const p=ps[i];
  if(!moveAgent(p,1.9,sdt))continue;
  if(p.phase==='go'){
   let dep=G.BIDX.get(p.dep);
   if(!dep||dep.burn){
    dep=nearestDepot(p.x,p.y);
    if(dep){p.dep=dep.id;const c=center(dep);p.tx=c[0]+(Math.random()-0.5);p.ty=c[1]+(Math.random()-0.5);continue}
   }
   if(dep){
    let tot=0;
    for(const k in p.carry){G.state.res[k]+=p.carry[k];tot+=p.carry[k]}
    pf(p.x,p.y,'📦 +'+Math.round(tot));
    p.carry=null;
   }
   p.phase='back';
   const hb=G.BIDX.get(p.home);
   if(hb){const c=center(hb);p.tx=c[0];p.ty=c[1]}
   else ps.splice(i,1);
  }else{
   const hb=G.BIDX.get(p.home);
   if(hb){hb.hasPorter=false;if(p.carry)for(const k in p.carry)hb.stock[k]=(hb.stock[k]||0)+p.carry[k]}
   ps.splice(i,1);
  }
 }
}
export function production(d){
 const h=G.state.hero;
 for(const b of G.state.buildings){
  if(b.burn||!b.on)continue;
  const D=BUILD[b.type];
  if(!D.out)continue;
  if(!b.stock)b.stock={};
  b.full=stockTotal(b)>=STOCK_CAP;
  if(b.full){maybeSendPorter(b);continue}
  let eff=D.wk>0?(b.staff/D.wk):1;
  if(eff<=0)continue;
  if(D.sea)eff*=SEASON_FARM[seasonIdx()]*modMult('farm')*tmul('farm');
  if(D.fert)eff*=fertFactor(b);
  if(D.need==='forest'){const f=forestNear(b);eff*=clamp(f/10,0,1);if(eff<=0)continue}
  if(b.buff>G.state.day)eff*=1.25;
  const c=center(b);
  if(dist(h.x,h.y,c[0],c[1])<10)eff*=1.04+h.lvl*0.005;
  if(D.inp){
   let lim=1;
   for(const k in D.inp){
    const need=D.inp[k]*eff*d;
    if(need>1e-9)lim=Math.min(lim,G.state.res[k]/need);
   }
   lim=clamp(lim,0,1);
   eff*=lim;
   if(eff<=1e-6)continue;
   for(const k in D.inp)G.state.res[k]=Math.max(0,G.state.res[k]-D.inp[k]*eff*d);
  }
  for(const k in D.out){
   let v=D.out[k]*eff*d;
   if(k==='books')v*=tmul('books');
   b.stock[k]=(b.stock[k]||0)+v;
   if(k==='bread')G.state.stats.bread+=v;
   if(k==='weapon')G.state.stats.weapons+=v;
  }
  maybeSendPorter(b);
  if(D.need==='forest'&&Math.random()<d*0.8)chopNear(b);
 }
}
export function regrow(){
 for(let i=0;i<30;i++){
  const x=ri(Math.random,1,MW-2),y=ri(Math.random,1,MW-2);
  const ii=idx(x,y);
  const t=G.state.map[ii];
  if(t===T_GRASS&&!G.state.occ[ii]&&!G.state.roads[ii]){
   let nf=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(ter(x+dx,y+dy)===T_FOREST)nf++;
   if(nf>=2&&Math.random()<0.3){G.state.map[ii]=T_FOREST;G.state.forest[ii]=1;paintTile(x,y)}
  }else if(t===T_FOREST&&G.state.forest[ii]<3&&Math.random()<0.3)G.state.forest[ii]++;
 }
}
export function daily(){
 const s=G.state;
 recountHomes();
 const need0=pop();
 let need=need0,variety=0;
 for(const f of FOODS){
  if(need<=0)break;
  const take=Math.min(s.res[f],need);
  if(take>0.01)variety++;
  s.res[f]-=take;need-=take;
 }
 if(need>0.5&&need0>0){
  s.hunger++;
  if(s.hunger===2)toast('🍞 В городе кончается еда!','bad');
  if(s.hunger>5){
   const k=Math.min(pop(),Math.max(1,Math.ceil(need*0.12)));
   for(let i=0;i<k&&s.citizens.length>0;i++)removeCitizen(Math.floor(Math.random()*s.citizens.length));
   toast('💀 Голод унёс '+k+' жителей','bad');
  }
 }else s.hunger=0;
 if(need0===0)variety=FOODS.filter(f=>s.res[f]>1).length;
 s.variety=variety;
 s.foodDays=need0>0?foodStock()/need0:99;
 let r4=0,r5=0,r6=0,r7=0;
 for(const b of s.buildings)if(b.type==='house'){
  if(b.lvl>=4)r4+=b.resN||0;
  if(b.lvl>=5)r5+=b.resN||0;
  if(b.lvl>=6)r6+=b.resN||0;
  if(b.lvl>=7)r7+=b.resN||0;
 }
 const cons=[['clothes',r4*0.02],['furn',r5*0.004],['wine',r6*0.02],['books',r7*0.006],['jewel',r7*0.0015]];
 s.short={};
 for(const p of cons){
  if(p[1]<=0)continue;
  if(s.res[p[0]]<p[1])s.short[p[0]]=true;
  s.res[p[0]]=Math.max(0,s.res[p[0]]-p[1]);
 }
 let tax=0;
 const taxB=s.buildings.filter(b=>b.type==='taxoffice'&&b.staff>0);
 for(const b of s.buildings){
  if(b.type!=='house')continue;
  let m=1;
  const hc=center(b);
  for(const t of taxB){const tc=center(t);if(dist(hc[0],hc[1],tc[0],tc[1])<=BUILD.taxoffice.rad){m=1.3;break}}
  tax+=(b.resN||0)*HRATE[b.lvl-1]*TAXM[s.taxRate]*m;
 }
 tax*=tmul('tax');
 if(cnt('townhall')>0)tax*=1.15;
 s.gold+=tax;s.lastTax=tax;
 happyCalc();
 if(s.lastDay%2===0){assignWork();immigration();homelessTick()}
 if(s.lastDay%3===0){if(G.covDirty)coverage();evolveHouses()}
 if(s.lastDay%4===0)regrow();
 if(s.happy<25&&pop()>15&&!s.peaceful){
  s.unrest++;
  if(s.unrest===3)toast('🔥 В городе зреет смута! Поднимите счастье!','bad');
  if(s.unrest>6){spawnRebels();s.unrest=0}
 }else s.unrest=Math.max(0,s.unrest-1);
 if(s.day>=s.evNext){randomEvent();s.evNext=s.day+ri(Math.random,14,28)}
 if(!s.peaceful&&s.day>=s.raidNext){spawnRaid();s.raidNext=s.day+Math.max(25,ri(Math.random,45,75)-s.wave*2)}
 s.mods=s.mods.filter(m=>m.until>s.day);
 plagueTick();
 caravanTick();
 let up=0;
 for(const u of s.units)up+=UNITT[u.t].up;
 s.gold-=up;
 if(s.gold<0){s.gold=0;if(s.units.length){s.units.pop();toast('💸 Нечем платить войску — один воин покинул службу','bad')}}
 if(s.lastDay>0&&s.lastDay%48===0)yearly();
 questCheck();
 checkMilestones();
 victoryCheck();
}
export function yearly(){
 const s=G.state;
 let died=0,born=0;
 const hosp=cnt('hospital')>0;
 for(let i=s.citizens.length-1;i>=0;i--){
  const c=s.citizens[i];
  c.age++;
  if(c.age>60&&Math.random()<(c.age-60)*0.012+(hosp?0:0.01)){removeCitizen(i);died++}
 }
 recountHomes();
 for(const b of s.buildings){
  if(b.type!=='house')continue;
  if((b.resN||0)>=2&&b.resN<HCAP[b.lvl-1]&&s.happy>55&&Math.random()<0.35){
   const c=mkCitizen(b.id,0);
   const hc=center(b);
   c.x=hc[0];c.y=hc[1];b.resN++;born++;
  }
 }
 if(born||died)toast('📅 Новый год: родилось '+born+', умерло '+died);
}
export function happyCalc(){
 const s=G.state;
 let housesC=0,srvSum=0,secC=0;
 const keys=['water','market','church','tavern','fun'];
 for(const b of s.buildings){
  if(b.type!=='house')continue;
  housesC++;
  let m=0;
  for(const k of keys)if(b.cov[k])m++;
  srvSum+=m/keys.length;
  if(b.cov.sec)secC++;
 }
 const srv=housesC?srvSum/housesC:0;
 const sec=housesC?secC/housesC:0;
 let h=42;
 if(pop()<25)h+=6;
 h+=s.variety*3.2;
 h+=srv*26;
 h+=sec*6;
 h+=[6,0,-9][s.taxRate];
 if(s.hunger>0)h-=18;
 const adults=s.citizens.filter(c=>c.age>=14&&c.age<=62);
 const unemp=adults.length?adults.filter(c=>!c.work).length/adults.length:0;
 if(unemp>0.25)h-=8;
 if(s.citizens.some(c=>!c.home))h-=6;
 for(const m of s.mods)if(m.tag==='happy')h+=m.mult;
 if(cnt('palace')>0)h+=5;
 if(hasTech('edu2')&&cnt('school')>0)h+=4;
 if(s.foes.length)h-=8;
 h+=Math.min(6,s.hero.lvl*0.4);
 s.happy=clamp(h,5,100);
 for(const c of s.citizens)c.happy=clamp(s.happy+((c.id*37)%21)-10,0,100);
}

/* ---------- События ---------- */
export function randomEvent(){
 const s=G.state,r=Math.random;
 const list=['harvest','merchants'];
 if(seasonIdx()<2)list.push('harvest','drought');
 if(pop()>40)list.push('plague');
 if(s.buildings.filter(b=>b.type!=='ruin').length>6)list.push('fire');
 if(cnt('tradepost')>0)list.push('merchants','boom');
 if(!s.peaceful&&s.day>25)list.push('bandits');
 const ev=pick(r,list);
 if(ev==='harvest'){addMod('farm',1.5,12,'Урожайный год');toast('🌾 Урожайный год! Фермы дают +50% (12 дней)','good')}
 else if(ev==='drought'){addMod('farm',0.45,12,'Засуха');toast('☀️ Засуха! Урожай −55% (12 дней)','bad')}
 else if(ev==='plague')startPlague();
 else if(ev==='fire')startFire();
 else if(ev==='boom'){addMod('trade',1.35,15,'Торговый бум');toast('📈 Торговый бум! Цены продажи +35% (15 дней)','good')}
 else if(ev==='merchants'){
  let got=0;
  for(const k of RES_ORDER){
   const extra=s.res[k]-60;
   if(extra>5){const sold=Math.min(extra,30);s.res[k]-=sold;got+=sold*RI[k].p*0.9}
  }
  got=Math.floor(got);
  if(got>0){s.gold+=got;toast('🐫 Заезжие купцы скупили излишки: +'+fmt(got)+' 🪙','good')}
  else toast('🐫 Заезжие купцы заглянули, но не нашли излишков.');
 }
 else if(ev==='bandits'){spawnRaid();toast('⚠️ Разбойники прознали о богатствах города!','bad')}
}
export function startPlague(){
 const s=G.state;
 addMod('happy',-10,15,'Эпидемия');
 s.plague=s.day+15;
 sfx('alert');
 toast('☠️ Эпидемия! '+(cnt('hospital')>0?'Больница сдерживает мор.':'Срочно постройте больницу!'),'bad');
}
export function plagueTick(){
 const s=G.state;
 if(s.plague&&s.day<s.plague){
  const rate=cnt('hospital')>0?0.002:0.008;
  const k=Math.floor(pop()*rate+Math.random()*0.7);
  for(let i=0;i<k&&s.citizens.length>0;i++)removeCitizen(Math.floor(Math.random()*s.citizens.length));
 }
}
export function startFire(){
 const list=G.state.buildings.filter(b=>!b.burn&&b.type!=='wall'&&b.type!=='ruin');
 if(!list.length)return;
 const b=pick(Math.random,list);
 b.burn=true;
 sfx('fire');
 toast('🔥 Пожар: «'+(b.type==='house'?HOUSEN[b.lvl-1]:BUILD[b.type].n)+'»! Колодцы рядом помогают тушить.','bad');
}
export function fireTick(sdt){
 for(const b of G.state.buildings){
  if(!b.burn)continue;
  b.hp-=sdt*6;
  const c=center(b);
  let wells=0;
  for(const w of G.state.buildings)if(w.type==='well'){const wc=center(w);if(dist(c[0],c[1],wc[0],wc[1])<=BUILD.well.rad)wells++}
  if(Math.random()<(0.04+wells*0.12)*sdt){b.burn=false;toast('💧 Пожар потушен')}
  else if(b.hp<=0)wreckB(b);
 }
}
export function wreckB(b){
 const t=b.type,x=b.x,y=b.y,wasLvl=b.lvl;
 toast('💥 Разрушено: «'+(t==='house'?HOUSEN[wasLvl-1]:BUILD[t].n)+'»','bad');
 removeBuilding(b,false);
 if(t!=='wall'&&t!=='ruin'&&BUILD[t].w>=2&&BUILD[t].h>=2&&canPlace('ruin',x,y).ok)addBuilding('ruin',x,y);
}

/* ---------- Война ---------- */
export function unitCap(){return 10+cnt('arsenal')*10+cnt('barracks')*5}
export function trainUnit(t,b){
 const s=G.state,U=UNITT[t];
 if(s.units.length>=unitCap()){toast('Лимит войска: '+unitCap()+'. Постройте арсенал.','bad');return}
 if(!canAfford(U.cost)){toast('Не хватает: '+costStr(U.cost),'bad');return}
 payCost(U.cost);
 const c=center(b);
 s.units.push({t,x:c[0]+Math.random()*2-1,y:c[1]+Math.random()*2-1,hp:U.hp*tmul('uhp'),maxhp:U.hp*tmul('uhp'),cd:0,hx:c[0],hy:c[1]});
 toast('🛡️ Обучен: '+U.n+' ('+s.units.length+'/'+unitCap()+')');
}
export function spawnRaid(){
 const s=G.state;
 s.wave++;
 const n=Math.min(40,2+Math.floor(pop()/30)+Math.floor(s.wave*1.3));
 const e=edgePoint();
 let comp;
 if(s.wave<3)comp=['bandit'];
 else if(s.wave<6)comp=['bandit','bandit','barb'];
 else if(s.wave<10)comp=['bandit','barb','barb'];
 else comp=['barb','barb','lordk'];
 for(let i=0;i<n;i++){
  const t=pick(Math.random,comp);
  const F=FOET[t];
  const hp=F.hp*(1+s.wave*0.04);
  s.foes.push({t,x:e[0]+Math.random()*3-1.5,y:e[1]+Math.random()*3-1.5,hp,maxhp:hp,cd:0});
 }
 toast('⚔️ К городу движется '+(s.wave<3?'шайка разбойников':s.wave<10?'орда варваров':'войско соседнего лорда')+' ('+n+')! К оружию!','bad');
 sfx('raid');
}
export function spawnRebels(){
 const s=G.state;
 const houses=s.buildings.filter(b=>b.type==='house');
 if(!houses.length)return;
 const n=Math.min(12,2+Math.floor(pop()*0.03));
 for(let i=0;i<n;i++){
  const h=pick(Math.random,houses);
  const hc=center(h);
  s.foes.push({t:'rebel',x:hc[0]+Math.random()*2-1,y:hc[1]+Math.random()*2-1,hp:FOET.rebel.hp,maxhp:FOET.rebel.hp,cd:0});
  if(s.citizens.length>5)removeCitizen(Math.floor(Math.random()*s.citizens.length));
 }
 toast('🔥 МЯТЕЖ! '+n+' горожан взялись за вилы! Народ требует хлеба и зрелищ.','bad');
}
export function combat(sdt){
 const s=G.state,h=s.hero;
 if(!s.foes.length&&!s.units.length)return;
 for(const b of s.buildings){
  if(b.type!=='tower'||b.staff<1)continue;
  b.cd-=sdt;
  if(b.cd>0)continue;
  const c=center(b);
  let tgt=null,bd=1e9;
  for(const f of s.foes){const d=dist(c[0],c[1],f.x,f.y);if(d<=8&&d<bd){bd=d;tgt=f}}
  if(tgt){tgt.hp-=7*tmul('dmg');b.cd=1;pf(tgt.x,tgt.y,'➹')}
 }
 for(const u of s.units){
  const U=UNITT[u.t];
  u.cd-=sdt;
  const ax=h.rally?h.x:u.hx,ay=h.rally?h.y:u.hy;
  let tgt=null,bd=1e9;
  for(const f of s.foes){const d=dist(u.x,u.y,f.x,f.y);if(d<bd){bd=d;tgt=f}}
  if(tgt&&bd<(h.rally?14:20)){
   if(bd>U.rng){u.tx=tgt.x;u.ty=tgt.y;moveAgent(u,U.spd,sdt)}
   else if(u.cd<=0){tgt.hp-=U.dmg*tmul('dmg');u.cd=1;pf(tgt.x,tgt.y,'⚔️')}
  }else if(dist(u.x,u.y,ax,ay)>2.5){
   u.tx=ax+(Math.random()-0.5)*2;u.ty=ay+(Math.random()-0.5)*2;
   moveAgent(u,U.spd,sdt);
  }
 }
 for(const f of s.foes){
  const F=FOET[f.t];
  f.cd-=sdt;
  let atk=null,kind=null,tx=0,ty=0,bd=1e9;
  for(const u of s.units){const d=dist(f.x,f.y,u.x,u.y);if(d<9&&d<bd){bd=d;atk=u;kind='u';tx=u.x;ty=u.y}}
  if(!atk){const d=dist(f.x,f.y,h.x,h.y);if(d<7){atk=h;kind='h';tx=h.x;ty=h.y;bd=d}}
  if(!atk){
   let bb=null,bbd=1e9;
   for(const b of s.buildings){
    if(b.type==='ruin')continue;
    const c=center(b);
    const d=dist(f.x,f.y,c[0],c[1]);
    if(d<bbd){bbd=d;bb=b}
   }
   if(bb){atk=bb;kind='b';const c=center(bb);tx=c[0];ty=c[1];bd=bbd}
  }
  if(!atk)continue;
  const reach=kind==='b'?Math.max(atk.w,atk.h)/2+0.9:F.rng;
  if(bd>reach){f.tx=tx;f.ty=ty;moveAgent(f,F.spd,sdt)}
  else if(f.cd<=0){
   f.cd=1;
   if(kind==='b'){atk.hp-=F.dmg;if(atk.hp<=0)wreckB(atk)}
   else{atk.hp-=F.dmg;pf(f.x,f.y,'💥')}
  }
 }
 if(h.hp<=0){
  h.hp=h.maxhp*0.5;
  const th=s.buildings.find(b=>b.type==='townhall')||s.buildings.find(b=>b.type==='house')||s.buildings[0];
  if(th){const c=center(th);h.x=c[0];h.y=c[1]}
  h.tx=null;h.ty=null;
  toast('🩹 Бадимка ранен и отступил перевязать раны!','bad');
 }
 for(let i=s.units.length-1;i>=0;i--)if(s.units[i].hp<=0)s.units.splice(i,1);
 let killed=0;
 for(let i=s.foes.length-1;i>=0;i--)if(s.foes[i].hp<=0){s.foes.splice(i,1);killed++}
 if(killed)giveXp(killed*3);
 if(s.foesWere&&!s.foes.length){
  s.foesWere=false;
  s.stats.raids++;
  giveXp(15+s.wave*4);
  toast('🏆 Нападение отражено! Слава Бадимке!','good');
 }
 if(s.foes.length)s.foesWere=true;
}

/* ---------- Наука, торговля, квесты ---------- */
export function startResearch(id){
 const s=G.state,T=TECHS[id];
 if(s.techDone.includes(id))return;
 if(s.research){toast('Уже идёт исследование','bad');return}
 const prev=Object.keys(TECHS).find(k=>TECHS[k].br===T.br&&TECHS[k].tier===T.tier-1);
 if(prev&&!s.techDone.includes(prev)){toast('Сначала изучите предыдущую ступень ветки','bad');return}
 if(cnt('school')<1){toast('Для исследований нужна школа','bad');return}
 if(s.gold<T.cost.g){toast('Не хватает золота ('+T.cost.g+' 🪙)','bad');return}
 if(T.cost.books&&s.res.books<T.cost.books){toast('Не хватает книг ('+T.cost.books+' 📚)','bad');return}
 s.gold-=T.cost.g;
 if(T.cost.books)s.res.books-=T.cost.books;
 s.research={id,prog:0};
 toast('🔬 Начато исследование: '+T.n);
}
export function researchTick(d){
 const s=G.state;
 if(!s.research)return;
 const T=TECHS[s.research.id];
 s.research.prog+=d*(1+Math.min(3,cnt('school'))*0.15)*tmul('sci');
 if(s.research.prog>=T.days){
  s.techDone.push(s.research.id);
  s.research=null;
  giveXp(20);
  toast('🎓 Исследовано: '+T.n+'! '+T.d,'good');
 }
}
export function caravanTick(){
 const s=G.state;
 const tp=s.buildings.find(b=>b.type==='tradepost'&&b.staff>0);
 if(!tp){s.nextCaravan=1e9;return}
 if(s.nextCaravan>1e8)s.nextCaravan=s.day+8;
 if(s.day<s.nextCaravan)return;
 s.nextCaravan=s.day+8;
 let sold=0,bought=0;
 const tm=tmul('trade')*modMult('trade');
 for(const k of RES_ORDER){
  const rule=s.trade[k];
  if(!rule)continue;
  if(rule.sell!=null&&s.res[k]>rule.sell){
   const amt=Math.min(s.res[k]-rule.sell,80);
   s.res[k]-=amt;
   sold+=amt*RI[k].p*0.75*tm;
  }
  if(rule.buy!=null&&s.res[k]<rule.buy){
   const amt=Math.min(rule.buy-s.res[k],80);
   const g=amt*RI[k].p*1.3;
   if(s.gold-bought>=g){bought+=g;s.res[k]+=amt}
  }
 }
 sold=Math.floor(sold);bought=Math.ceil(bought);
 s.gold+=sold-bought;
 s.stats.traded+=sold;
 if(sold||bought)toast('🐫 Караван: продано на '+fmt(sold)+' 🪙, куплено на '+fmt(bought)+' 🪙');
}
export function questCheck(){
 const s=G.state;
 const q=QUESTS[s.questIdx];
 if(!q)return;
 const H={cnt,foodStock,pop,houseLvl};
 let ok=false;
 try{ok=q.c(s,H)}catch(e){console.warn('[quest] проверка упала:',e);return}
 if(ok){
  s.gold+=q.r.g;
  giveXp(q.r.xp);
  sfx('milestone');
  toast('🎯 Задание выполнено: «'+q.t+'»! Награда: '+q.r.g+' 🪙','good');
  s.questIdx++;
 }
}
export function stageName(){let n='Деревня';for(const p of STAGES)if(pop()>=p[0])n=p[1];return n}
export function victoryCheck(){
 const s=G.state;
 if(s.won)return;
 if(pop()>=5000&&s.happy>=90&&cnt('palace')>=1&&s.gold>=1000000){
  s.won=true;
  sfx('victory');
  victoryM();
 }
}
export function sim(sdt){
 const s=G.state;
 const d=sdt/DAY;
 s.day+=d;
 production(d);
 researchTick(d);
 fireTick(sdt);
 heroTick(sdt);
 combat(sdt);
 porterTick(sdt);
 const N=s.citizens.length;
 const heavy=N>900;
 for(let i=0;i<N;i++){
  const c=s.citizens[i];
  if(!c)break;
  if(heavy&&!c.vis&&((i+G.frameNo)%6!==0))continue;
  citizenAI(c,sdt*(heavy&&!c.vis?6:1));
 }
 while(Math.floor(s.day)>s.lastDay){
  s.lastDay++;
  daily();
 }
}

/* ---------- Изометрический рендер ---------- */
export const cv=$('c'),ctx=cv.getContext('2d');
export const mmc=$('mm'),mmx=mmc.getContext('2d');
export function resize(){cv.width=innerWidth;cv.height=innerHeight}
addEventListener('resize',resize);
resize();
export function w2s(x,y){
 const z=G.cam.z;
 return [((x-y)-(G.cam.x-G.cam.y))*HW*z+cv.width/2,((x+y)-(G.cam.x+G.cam.y))*HH*z+cv.height/2];
}
export function s2w(px,py){
 const z=G.cam.z;
 const iX=(px-cv.width/2)/z+(G.cam.x-G.cam.y)*HW;
 const iY=(py-cv.height/2)/z+(G.cam.x+G.cam.y)*HH;
 return [(iX/HW+iY/HH)/2,(iY/HH-iX/HW)/2];
}
export function clampCam(){G.cam.x=clamp(G.cam.x,4,MW-4);G.cam.y=clamp(G.cam.y,4,MW-4);G.cam.z=clamp(G.cam.z,0.09,0.6)}
export function pf(x,y,txt){G.floaters.push({x,y,txt,t:1.4})}
export const SMK=[];
export let lastMini=0;
export function star(g,x,y,r,col){
 g.fillStyle=col;g.beginPath();
 g.moveTo(x,y-r);g.lineTo(x+r*0.3,y-r*0.3);g.lineTo(x+r,y);g.lineTo(x+r*0.3,y+r*0.3);
 g.lineTo(x,y+r);g.lineTo(x-r*0.3,y+r*0.3);g.lineTo(x-r,y);g.lineTo(x-r*0.3,y-r*0.3);
 g.closePath();g.fill();
}
export function drawSpr(s,p,z,a){
 if(a!=null)ctx.globalAlpha=a;
 ctx.drawImage(s.cv,p[0]-s.ax*z,p[1]-s.ay*z,s.cv.width*z,s.cv.height*z);
 if(a!=null)ctx.globalAlpha=1;
}
export function render(now){
 G.frameNo++;
 ctx.fillStyle='#0e1f2e';
 ctx.fillRect(0,0,cv.width,cv.height);
 if(!G.state)return;
 const z=G.cam.z;
 ctx.imageSmoothingEnabled=true;
 /* видимая область мира */
 const c1=s2w(0,0),c2=s2w(cv.width,0),c3=s2w(0,cv.height),c4=s2w(cv.width,cv.height);
 const wx0=Math.floor(Math.min(c1[0],c2[0],c3[0],c4[0]))-3,wx1=Math.ceil(Math.max(c1[0],c2[0],c3[0],c4[0]))+3;
 const wy0=Math.floor(Math.min(c1[1],c2[1],c3[1],c4[1]))-3,wy1=Math.ceil(Math.max(c1[1],c2[1],c3[1],c4[1]))+3;
 /* чанки земли */
 const k2=z*2;
 let extra=0;
 for(let cj=0;cj<NCH;cj++)for(let ci=0;ci<NCH;ci++){
  const ch=GCH[cj*NCH+ci];
  const p=w2s(ci*CS,cj*CS);
  const sx=p[0]-ANCX*k2,sy=p[1]-ANCY*k2,sw=CHW*k2,sh=CHH*k2;
  const vis=sx<cv.width&&sx+sw>0&&sy<cv.height&&sy+sh>0;
  if(ch.dirty&&(vis||extra<2)){paintChunk(ci,cj);if(!vis)extra++}
  if(vis)ctx.drawImage(ch.cv,sx,sy,sw,sh);
 }
 /* объекты с сортировкой по глубине */
 const objs=[];
 const xs0=Math.max(0,wx0),xs1=Math.min(MW-1,wx1),ys0=Math.max(0,wy0),ys1=Math.min(MW-1,wy1);
 const farDec=z<0.55;
 for(let yy=ys0;yy<=ys1;yy++)for(let xx=xs0;xx<=xs1;xx++){
  const t=G.state.map[idx(xx,yy)];
  if(t===T_FOREST&&G.state.forest[idx(xx,yy)]>0){
   if(farDec&&((((xx*73856093)^(yy*19349663))>>>0)&1))continue;
   const hsh=(xx*131+yy*197)&1023;
   const n=z<0.9?1:Math.min(2,G.state.forest[idx(xx,yy)]);
   for(let q=0;q<n;q++){
    const jx=((hsh>>q)%7)/14-0.25+(q?0.3:0),jy=((hsh>>(q+3))%7)/14-0.25+(q?-0.2:0.1);
    objs.push({d:xx+yy+0.5+jy,spr:G.TREES[(hsh+q)&3],wx:xx+0.5+jx,wy:yy+0.5+jy,sc:0.8+((hsh>>q)%40)/100});
   }
  }else if(t===T_MTN){
   const sh=(((xx*73856093)^(yy*19349663))>>>0);
   const edge=ter(xx,yy-1)!==T_MTN||ter(xx,yy+1)!==T_MTN||ter(xx-1,yy)!==T_MTN||ter(xx+1,yy)!==T_MTN;
   if(!edge&&sh%3)continue;
   const hs=sh&255;
   objs.push({d:xx+yy+0.96,spr:G.ROCKS[sh%3],
    wx:xx+((hs&7)-3)/22,wy:yy+(((hs>>3)&7)-3)/22,
    sc:(edge?0.72:1.14)+((hs>>5)%30)/(edge?95:58),iso:1});
  }
 }
 for(const b of G.state.buildings){
  if(b.x+b.w<wx0||b.x>wx1||b.y+b.h<wy0||b.y>wy1)continue;
  const spr=b.type==='house'?G.HSPR[b.lvl-1]:G.BSPR[b.type];
  if(!spr)continue;
  objs.push({d:b.x+b.y+(b.w+b.h)/2,spr,wx:b.x,wy:b.y,sc:1,iso:1,b});
 }
 const pplPush=(a,spr,fspr,d,bobAmp,big)=>{
  if(a.x<wx0||a.x>wx1||a.y<wy0||a.y>wy1)return;
  if(a.tx!=null&&Math.abs(a.tx-a.x)>0.04)a.fc=a.tx<a.x?1:0;
  objs.push({d:a.x+a.y+d,spr:a.fc?fspr:spr,wx:a.x,wy:a.y,sc:big||1,bob:bobAmp,a});
 };
 if(z>=0.45){
  for(const c of G.state.citizens){
   if(c.x<wx0||c.x>wx1||c.y<wy0||c.y>wy1){c.vis=false;continue}
   c.vis=true;
   const v=c.id&3;
   const spr=c.fem?G.CIT_F[v]:G.CIT_M[v];
   const fspr=c.fem?G.PPL_F['f_'+v]:G.PPL_F['m'+v];
   const mv=c.st==='towork'||c.st==='tohome'||c.st==='tomarket'||c.st==='panic';
   if(c.tx!=null&&Math.abs(c.tx-c.x)>0.04)c.fc=c.tx<c.x?1:0;
   objs.push({d:c.x+c.y,spr:c.fc?fspr:spr,wx:c.x,wy:c.y,sc:0.95,bob:mv?1:0,a:c});
  }
 }else for(const c of G.state.citizens)c.vis=false;
 for(const u of G.state.units)pplPush(u,G.USPR[u.t],G.PPL_F['u'+u.t],0.001,1);
 for(const f of G.state.foes)pplPush(f,G.FSPR[f.t],G.PPL_F['f'+f.t],0.002,1);
 for(const pr of (G.state.porters||[]))pplPush(pr,G.CIT_M[pr.v],G.PPL_F['m'+pr.v],0.0015,1);
 {
  const h=G.state.hero;
  if(h.tx!=null&&Math.abs(h.tx-h.x)>0.04)h.fc=h.tx<h.x?1:0;
  objs.push({d:h.x+h.y+0.003,spr:h.fc?G.PPL_F.hero:G.HERO_S,wx:h.x,wy:h.y,sc:1.1,bob:h.tx!=null?1:0,hero:1});
 }
 objs.sort((a,b)=>a.d-b.d);
 /* выделение под объектами: кольцо героя/жителя */
 if(G.sel&&(G.sel.type==='hero'||G.sel.type==='c')){
  let tx=null,ty=null;
  if(G.sel.type==='hero'){tx=G.state.hero.x;ty=G.state.hero.y}
  else{const c=G.state.citizens.find(x=>x.id===G.sel.id);if(c){tx=c.x;ty=c.y}}
  if(tx!=null){
   const p=w2s(tx,ty);
   ctx.strokeStyle='#ffd97a';ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(p[0],p[1],14*z,7*z,0,0,7);ctx.stroke();
  }
 }
 /* радиус выбранного здания */
 if(G.sel&&G.sel.type==='b'){
  const b=G.BIDX.get(G.sel.id);
  if(b&&BUILD[b.type].rad){
   const c0=center(b);
   const p=w2s(c0[0],c0[1]);
   const r=BUILD[b.type].rad*1.414*z;
   ctx.strokeStyle='rgba(255,217,122,0.45)';ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(p[0],p[1],r*HW,r*HH,0,0,7);ctx.stroke();
   ctx.fillStyle='rgba(255,217,122,0.06)';ctx.fill();
  }
 }
 for(const o of objs){
  const p=w2s(o.wx,o.wy);
  if(o.bob)p[1]+=Math.sin(now*0.013+o.wx*9+o.wy*7)*1.3*z;
  const sc=z*(o.sc||1);
  if(o.iso)drawSpr(o.spr,p,sc);
  else drawSpr(o.spr,p,sc);
  const b=o.b;
  if(b){
   const D=BUILD[b.type];
   if(!b.on)
    {ctx.globalAlpha=0.35;ctx.fillStyle='#223';
     const c0=center(b),pc=w2s(c0[0],c0[1]);
     ctx.beginPath();ctx.ellipse(pc[0],pc[1],(b.w+b.h)*HW*0.35*z,(b.w+b.h)*HH*0.35*z,0,0,7);ctx.fill();ctx.globalAlpha=1}
   const top=p[1]-o.spr.ay*sc;
   if(b.hp<b.maxhp-1){
    const bw=Math.max(104,(b.w+b.h)*HW*0.5*z);
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(p[0]-bw/2,top-12,bw,8);
    ctx.fillStyle=b.hp/b.maxhp>0.5?'#7ab050':'#d05a3a';
    ctx.fillRect(p[0]-bw/2,top-12,bw*clamp(b.hp/b.maxhp,0,1),8);
   }
   if(b.buff>G.state.day)star(ctx,p[0],top-13,6.5,'#ffd34a');
   if(D.wk>0&&b.staff<1&&b.on&&!b.burn&&z>=0.7&&b.type!=='ruin'){
    ctx.fillStyle='rgba(230,230,240,0.85)';ctx.font='bold '+Math.floor(36*z+8)+'px Georgia';
    ctx.textAlign='center';ctx.fillText('z\u1d22',p[0]+44*z,top-2);
   }
   if(b.burn){
    const c0=center(b),pc=w2s(c0[0],c0[1]);
    const fl=Math.sin(now*0.02+b.id)*0.25+1;
    ctx.fillStyle='rgba(40,30,20,0.5)';
    ctx.beginPath();ctx.ellipse(pc[0],pc[1]-26*z*fl,10*z,16*z,0,0,7);ctx.fill();
    ctx.fillStyle='#e8742a';
    ctx.beginPath();ctx.ellipse(pc[0],pc[1]-10*z,9*z*fl,15*z*fl,0,0,7);ctx.fill();
    ctx.fillStyle='#ffc23a';
    ctx.beginPath();ctx.ellipse(pc[0],pc[1]-8*z,5*z,9*z*fl,0,0,7);ctx.fill();
   }
   if(G.sel&&G.sel.type==='b'&&G.sel.id===b.id){
    ctx.strokeStyle='#ffd97a';ctx.lineWidth=2;
    const q1=w2s(b.x,b.y),q2=w2s(b.x+b.w,b.y),q3=w2s(b.x+b.w,b.y+b.h),q4=w2s(b.x,b.y+b.h);
    ctx.beginPath();ctx.moveTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1]);ctx.lineTo(q3[0],q3[1]);ctx.lineTo(q4[0],q4[1]);ctx.closePath();ctx.stroke();
   }
   /* дымок над работающим производством */
   if(D.out&&b.staff>0&&b.on&&!b.burn&&z>0.55&&SMK.length<160&&Math.random()<0.025){
    SMK.push({wx:b.x+b.w*0.55,wy:b.y+b.h*0.35,alt:o.spr.ay*0.8,t:1});
   }
  }
  if(o.hero){
   const h=G.state.hero;
   if(h.hp<h.maxhp){
    const top=p[1]-o.spr.ay*sc;
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(p[0]-36,top-10,72,8);
    ctx.fillStyle='#ffd97a';ctx.fillRect(p[0]-36,top-10,72*h.hp/h.maxhp,8);
   }
  }
  const ag=o.a;
  if(ag&&ag.hp!=null&&ag.maxhp&&ag.hp<ag.maxhp){
   const top=p[1]-o.spr.ay*sc;
   ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(p[0]-24,top-9,48,7);
   ctx.fillStyle=G.state.foes.includes(ag)?'#ff7a5a':'#6ab0ff';
   ctx.fillRect(p[0]-24,top-9,48*clamp(ag.hp/ag.maxhp,0,1),7);
  }
 }
 /* дым */
 for(let i=SMK.length-1;i>=0;i--){
  const s=SMK[i];
  s.t-=0.008;s.alt+=0.45;
  if(s.t<=0){SMK.splice(i,1);continue}
  const p=w2s(s.wx,s.wy);
  ctx.globalAlpha=s.t*0.35;
  ctx.fillStyle='#cfd2d6';
  ctx.beginPath();ctx.arc(p[0]+Math.sin(s.alt*0.1)*3*z,p[1]-s.alt*z*0.5,(5+(1-s.t)*7)*z,0,7);ctx.fill();
  ctx.globalAlpha=1;
 }
 /* призрак строительства */
 if(G.buildSel&&mouse.over){
  const gx=Math.floor(mouse.wx),gy=Math.floor(mouse.wy);
  if(G.buildSel==='demolish'){
   if(inb(gx,gy)){
    const q1=w2s(gx,gy),q2=w2s(gx+1,gy),q3=w2s(gx+1,gy+1),q4=w2s(gx,gy+1);
    ctx.strokeStyle='#e05a3a';ctx.lineWidth=2.4;
    ctx.beginPath();ctx.moveTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1]);ctx.lineTo(q3[0],q3[1]);ctx.lineTo(q4[0],q4[1]);ctx.closePath();ctx.stroke();
   }
  }else{
   const D=BUILD[G.buildSel];
   const cp=inb(gx,gy)&&inb(gx+D.w-1,gy+D.h-1)?canPlace(G.buildSel,gx,gy):{ok:false};
   const q1=w2s(gx,gy),q2=w2s(gx+D.w,gy),q3=w2s(gx+D.w,gy+D.h),q4=w2s(gx,gy+D.h);
   ctx.fillStyle=cp.ok?'rgba(110,190,80,0.4)':'rgba(220,80,50,0.4)';
   ctx.beginPath();ctx.moveTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1]);ctx.lineTo(q3[0],q3[1]);ctx.lineTo(q4[0],q4[1]);ctx.closePath();ctx.fill();
   ctx.strokeStyle=cp.ok?'#7ab050':'#e05a3a';ctx.lineWidth=2;ctx.stroke();
   const spr=G.buildSel==='house'?G.HSPR[0]:G.BSPR[G.buildSel];
   if(spr&&!BUILD[G.buildSel].isRoad)drawSpr(spr,q1,z,cp.ok?0.62:0.35);
   if(D.rad){
    const pc=w2s(gx+D.w/2,gy+D.h/2);
    const r=D.rad*1.414*z;
    ctx.strokeStyle=cp.ok?'rgba(120,190,80,0.5)':'rgba(220,90,60,0.4)';
    ctx.lineWidth=1.6;
    ctx.beginPath();ctx.ellipse(pc[0],pc[1],r*HW,r*HH,0,0,7);ctx.stroke();
   }
  }
 }
 /* всплывающие надписи */
 for(let i=G.floaters.length-1;i>=0;i--){
  const f=G.floaters[i];
  f.t-=0.016;f.y-=0.02;
  if(f.t<=0){G.floaters.splice(i,1);continue}
  const p=w2s(f.x,f.y);
  ctx.globalAlpha=clamp(f.t,0,1);
  ctx.font='bold 26px Georgia';ctx.textAlign='center';
  ctx.fillStyle='#ffe8b0';ctx.strokeStyle='rgba(0,0,0,0.55)';ctx.lineWidth=4;
  ctx.strokeText(f.txt,p[0],p[1]-36);ctx.fillText(f.txt,p[0],p[1]-36);
  ctx.globalAlpha=1;
 }
 /* виньетка — тёплое затемнение по краям */
 if(!cv._vignette||cv._vw!==cv.width||cv._vh!==cv.height){
  cv._vw=cv.width;cv._vh=cv.height;
  const vc=document.createElement('canvas');vc.width=cv.width;vc.height=cv.height;
  const vg=vc.getContext('2d');
  const grd=vg.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*0.3,
                                    cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*0.78);
  grd.addColorStop(0,'rgba(0,0,0,0)');
  grd.addColorStop(0.5,'rgba(10,5,0,0.08)');
  grd.addColorStop(1,'rgba(10,5,0,0.55)');
  vg.fillStyle=grd;vg.fillRect(0,0,cv.width,cv.height);
  /* лёгкая золотая верхняя кромка для тепла */
  const grd2=vg.createLinearGradient(0,0,0,cv.height*0.3);
  grd2.addColorStop(0,'rgba(255,200,120,0.05)');
  grd2.addColorStop(1,'rgba(255,200,120,0)');
  vg.fillStyle=grd2;vg.fillRect(0,0,cv.width,cv.height*0.3);
  cv._vignette=vc;
 }
 ctx.drawImage(cv._vignette,0,0);
 if(now-lastMini>500){lastMini=now;drawMini()}
}
export function drawMini(){
 mmx.imageSmoothingEnabled=false;
 mmx.drawImage(mcv,0,0,128,128);
 const k=128/MW;
 for(const b of G.state.buildings){
  mmx.fillStyle=b.type==='house'?'#ffd97a':'#e8e2d2';
  mmx.fillRect(b.x*k,b.y*k,Math.max(1.5,b.w*k),Math.max(1.5,b.h*k));
 }
 mmx.fillStyle='#ff4040';
 for(const f of G.state.foes)mmx.fillRect(f.x*k-1,f.y*k-1,3,3);
 mmx.fillStyle='#40a0ff';
 for(const u of G.state.units)mmx.fillRect(u.x*k-1,u.y*k-1,2,2);
 mmx.fillStyle='#fff';
 mmx.fillRect(G.state.hero.x*k-1,G.state.hero.y*k-1,3,3);
 const cn=[s2w(0,0),s2w(cv.width,0),s2w(cv.width,cv.height),s2w(0,cv.height)];
 mmx.strokeStyle='rgba(255,255,255,0.75)';mmx.lineWidth=1;
 mmx.beginPath();
 mmx.moveTo(clamp(cn[0][0],0,MW)*k,clamp(cn[0][1],0,MW)*k);
 for(let i=1;i<4;i++)mmx.lineTo(clamp(cn[i][0],0,MW)*k,clamp(cn[i][1],0,MW)*k);
 mmx.closePath();mmx.stroke();
}

/* ---------- Ввод ---------- */
export const mouse={x:0,y:0,wx:0,wy:0,over:false,down:false,drag:false,sx:0,sy:0,cx:0,cy:0};
export const ptrs=new Map();

export function pinchTrack(e,phase){
 if(e.pointerType!=='touch')return false;
 if(phase==='down')ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 else if(phase==='move'&&ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 else if(phase==='up')ptrs.delete(e.pointerId);
 if(ptrs.size===2){
  const v=[...ptrs.values()];
  const d=dist(v[0].x,v[0].y,v[1].x,v[1].y);
  if(phase==='move'&&G.pinch!=null){G.cam.z*=d/G.pinch;clampCam()}
  G.pinch=d;
  mouse.down=false;mouse.drag=false;
  return true;
 }
 G.pinch=null;
 return false;
}
cv.addEventListener('pointerdown',e=>{
 cv.setPointerCapture(e.pointerId);
 if(pinchTrack(e,'down'))return;
 mouse.down=true;mouse.drag=false;
 mouse.sx=e.clientX;mouse.sy=e.clientY;
 mouse.cx=G.cam.x;mouse.cy=G.cam.y;
});
cv.addEventListener('pointermove',e=>{
 mouse.x=e.clientX;mouse.y=e.clientY;mouse.over=true;
 const w=s2w(e.clientX,e.clientY);
 mouse.wx=w[0];mouse.wy=w[1];
 if(pinchTrack(e,'move'))return;
 if(!mouse.down)return;
 const dx=e.clientX-mouse.sx,dy=e.clientY-mouse.sy;
 if(Math.abs(dx)+Math.abs(dy)>8)mouse.drag=true;
 if(!mouse.drag)return;
 const dragBuild=G.buildSel==='demolish'||(G.buildSel&&BUILD[G.buildSel]&&(BUILD[G.buildSel].isRoad||G.buildSel==='wall'));
 if(dragBuild)tryPlace(G.buildSel,Math.floor(w[0]),Math.floor(w[1]),true);
 else{
  const wdx=(dx/HW+dy/HH)/(2*G.cam.z),wdy=(dy/HH-dx/HW)/(2*G.cam.z);
  G.cam.x=mouse.cx-wdx;G.cam.y=mouse.cy-wdy;clampCam();
 }
});
cv.addEventListener('pointerup',e=>{
 if(pinchTrack(e,'up'))return;
 if(mouse.down&&!mouse.drag)clickAt(e.clientX,e.clientY);
 mouse.down=false;mouse.drag=false;
});
cv.addEventListener('pointerleave',()=>{mouse.over=false;mouse.down=false});
cv.addEventListener('contextmenu',e=>{
 e.preventDefault();
 if(!G.state||G.mode==='menu')return;
 if(G.buildSel){setBuild(null);return}
 const w=s2w(e.clientX,e.clientY);
 const gx=Math.floor(w[0]),gy=Math.floor(w[1]);
 const b=inb(gx,gy)?bAt(gx,gy):null;
 if(b)select({type:'b',id:b.id});
 else select(null);
});
cv.addEventListener('wheel',e=>{
 e.preventDefault();
 const w1=s2w(e.clientX,e.clientY);
 G.cam.z*=e.deltaY>0?0.88:1.14;
 clampCam();
 const w2=s2w(e.clientX,e.clientY);
 G.cam.x+=w1[0]-w2[0];G.cam.y+=w1[1]-w2[1];
 clampCam();
},{passive:false});
export function clickAt(px,py){
 if(!G.state||G.mode==='menu')return;
 const w=s2w(px,py);
 const wx=w[0],wy=w[1];
 const gx=Math.floor(wx),gy=Math.floor(wy);
 if(G.buildSel){tryPlace(G.buildSel,gx,gy);return}
 const h=G.state.hero;
 if(dist(wx,wy,h.x,h.y)<0.8){select({type:'hero'});return}
 if(G.sel&&G.sel.type==='hero'&&inb(gx,gy)&&PASSABLE(G.state.map[idx(gx,gy)])){
  h.tx=wx;h.ty=wy;
  pf(wx,wy,'🚶');
  return;
 }
 let cc=null,cd=0.7;
 for(const c of G.state.citizens){
  if(!c.vis)continue;
  const d=dist(wx,wy,c.x,c.y);
  if(d<cd){cd=d;cc=c}
 }
 if(cc){select({type:'c',id:cc.id});return}
 const b=inb(gx,gy)?bAt(gx,gy):null;
 if(b){select({type:'b',id:b.id});return}
 select(null);
}
addEventListener('keydown',e=>{
 if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA'))return;
 if(!G.state)return;
 const k=e.key.toLowerCase();
 if(e.code==='Space'){G.state.paused=!G.state.paused;uiTime();e.preventDefault()}
 else if(k>='1'&&k<='4'){G.state.speed=+k-1;G.state.paused=false;uiTime()}
 else if(k==='escape'){
  if($('modal').style.display==='flex')closeM();
  else{setBuild(null);select(null)}
 }
 else if(k==='h'){G.cam.x=G.state.hero.x;G.cam.y=G.state.hero.y;select({type:'hero'})}
 else if(k==='m')menuM();
 else if(k==='arrowup'||k==='w'){G.cam.x-=2.4/G.cam.z;G.cam.y-=2.4/G.cam.z}
 else if(k==='arrowdown'||k==='s'){G.cam.x+=2.4/G.cam.z;G.cam.y+=2.4/G.cam.z}
 else if(k==='arrowleft'||k==='a'){G.cam.x-=2.4/G.cam.z;G.cam.y+=2.4/G.cam.z}
 else if(k==='arrowright'||k==='d'){G.cam.x+=2.4/G.cam.z;G.cam.y-=2.4/G.cam.z}
 clampCam();
});
mmc.addEventListener('pointerdown',e=>{
 const r=mmc.getBoundingClientRect();
 G.cam.x=(e.clientX-r.left)/r.width*MW;
 G.cam.y=(e.clientY-r.top)/r.height*MW;
 clampCam();
});

/* ---------- UI: тосты, верх, панели ---------- */
export function toast(msg,kind){
 const box=$('toasts');
 if(!box)return;
 const t=document.createElement('div');
 t.className='toast'+(kind?' '+kind:'');
 t.textContent=msg;
 box.appendChild(t);
 while(box.children.length>5)box.firstChild.remove();
 setTimeout(()=>{t.style.transition='opacity .6s';t.style.opacity='0';setTimeout(()=>t.remove(),650)},5200);
}
export function chipH(ic,val,title,warn){return '<span class="chip'+(warn?' warn':'')+'" title="'+title+'">'+ic+' <b>'+val+'</b></span>'}
export function uiTop(){
 if(!G.state)return;
 const s=G.state;
 let h='<span class="chip"><b>'+stageName()+'</b></span>';
 h+=chipH('🪙',fmt(s.gold),'Казна',s.gold<20);
 h+=chipH('👥',pop()+'/'+beds(),'Население / мест в домах',pop()>beds());
 h+=chipH('😊',Math.round(s.happy)+'%','Счастье',s.happy<35);
 h+=chipH('🍞',(s.foodDays>=99?'∞':Math.floor(s.foodDays))+'д','Запас еды (в днях)',s.foodDays<3);
 for(const k of ['wood','plank','stone','iron','tools','grain','clothes'])
  h+='<span class="chip" data-act="res" style="cursor:pointer">'+RI[k].i+' <b>'+fmt(s.res[k])+'</b></span>';
 h+='<span class="chip" data-act="res" style="cursor:pointer">📦 <b>ещё…</b></span>';
 $('stats').innerHTML=h;
 const q=QUESTS[s.questIdx];
 $('questline').innerHTML=q
  ?('🎯 <b>Задание короля:</b> '+q.t+' <span class="muted">(+'+q.r.g+' 🪙)</span>')
  :'🏆 Все задания выполнены! Правьте вечно, владыка.';
 $('datelab').innerHTML='<b>'+SEASONS[seasonIdx()]+'</b>, день '+(Math.floor(s.day)%12+1)+'<br>Год '+(Math.floor(s.day/48)+1)+' · '+heroTitle()+' Бадимка';
}
export function uiTime(){
 if(!G.state)return;
 let h='<button class="btn sm'+(G.state.paused?' act':'')+'" data-sp="p" title="Пауза (Пробел)">⏸</button>';
 SPEEDS.forEach((sp,i)=>{h+='<button class="btn sm'+(!G.state.paused&&G.state.speed===i?' act':'')+'" data-sp="'+i+'" title="Клавиша '+(i+1)+'">x'+sp+'</button>'});
 $('timec').innerHTML=h;
}
export function uiMenuBtns(){
 $('menubtns').innerHTML=
  '<button class="btn sm" data-m="hero" title="Клавиша H">👑 Бадимка</button>'+
  '<button class="btn sm" data-m="quests">🎯 Задания</button>'+
  '<button class="btn sm" data-m="tech">🔬 Наука</button>'+
  '<button class="btn sm" data-m="trade">🐫 Торговля</button>'+
  '<button class="btn sm" data-m="menu" title="Клавиша M">📜 Меню</button>';
}
export let curCat='Жильё';
export function uiCats(){
 let h='';
 for(const c of CATS)h+='<button class="btn sm'+(c===curCat?' act':'')+'" data-cat="'+c+'">'+c+'</button>';
 $('cats').innerHTML=h;
}
export function uiItems(){
 let h='';
 for(const id in BUILD){
  const D=BUILD[id];
  if(D.cat!==curCat||D.noBuild)continue;
  const cost=costOf(id);
  const ok=G.state?canAfford(cost):true;
  h+='<div class="bitem'+(G.buildSel===id?' sel':'')+'" data-b="'+id+'" title="'+D.d+'">'+
   '<div class="ic">'+D.i+'</div><div>'+D.n+'</div>'+
   '<div class="cost'+(ok?'':' no')+'">'+(costStr(cost)||'бесплатно')+'</div></div>';
 }
 if(curCat==='Инфра')h+='<div class="bitem'+(G.buildSel==='demolish'?' sel':'')+'" data-b="demolish" title="Снос зданий и дорог"><div class="ic">🧨</div><div>Снос</div><div class="cost">возврат 30%</div></div>';
 $('items').innerHTML=h;
}
export function setBuild(id){
 G.buildSel=id;
 uiItems();
 const bh=$('bhint');
 if(id==='demolish'){bh.style.display='block';bh.textContent='Кликайте (или ведите пальцем) по зданиям и дорогам. Esc — отмена.'}
 else if(id){bh.style.display='block';bh.textContent=BUILD[id].d+' — кликните по карте, чтобы построить. Esc — отмена.'}
 else bh.style.display='none';
}
export function rowH(a,b){return '<div class="row"><span>'+a+'</span><span>'+b+'</span></div>'}
export function select(s){G.sel=s;uiInfo()}
export function uiInfo(){
 const el=$('info');
 if(!G.sel||!G.state){el.style.display='none';return}
 el.style.display='block';
 if(G.sel.type==='hero'){
  const h=G.state.hero;
  el.innerHTML='<h3>👑 Бадимка</h3>'+
   rowH('Титул',heroTitle())+
   rowH('Уровень',h.lvl)+
   '<div class="bar" title="Опыт"><i style="width:'+pct(100*h.xp/xpNeed(h.lvl))+'"></i></div>'+
   '<div class="muted">Опыт: '+Math.floor(h.xp)+' / '+xpNeed(h.lvl)+'</div>'+
   rowH('Здоровье',Math.round(h.hp)+' / '+h.maxhp)+
   rowH('Репутация',Math.round(G.state.happy)+'%')+
   rowH('Аура',' +'+Math.round(4+h.lvl*0.5)+'% к работе рядом')+
   '<div class="acts">'+
   '<button class="btn sm" data-act="rally">'+(h.rally?'🚩 Войско: за мной!':'🚩 Войско: за мной?')+'</button>'+
   '<button class="btn sm" data-act="fest">🎉 Праздник</button>'+
   '<button class="btn sm" data-act="deselect">✕</button></div>'+
   '<p class="muted">Кликните по земле — Бадимка пойдёт туда. Подведите его к зданию и проведите 👑 инспекцию (+25% на день).</p>';
  return;
 }
 if(G.sel.type==='c'){
  const c=G.state.citizens.find(x=>x.id===G.sel.id);
  if(!c){G.sel=null;el.style.display='none';return}
  const hb=G.BIDX.get(c.home),wb=G.BIDX.get(c.work);
  el.innerHTML='<h3>'+(c.fem?'👩':'👨')+' '+c.name+'</h3>'+
   rowH('Возраст',c.age)+
   rowH('Занятие',c.age<14?'Ребёнок':(wb?BUILD[wb.type].n:'Без работы'))+
   rowH('Дом',hb?HOUSEN[hb.lvl-1]:'Бездомный')+
   rowH('Счастье',Math.round(c.happy)+'%')+
   (c.phrase?'<p class="muted" style="font-style:italic">«'+c.phrase+'»</p>':'')+
   '<div class="acts"><button class="btn sm" data-act="talk">💬 Поговорить</button>'+
   '<button class="btn sm" data-act="deselect">✕</button></div>';
  return;
 }
 const b=G.BIDX.get(G.sel.id);
 if(!b){G.sel=null;el.style.display='none';return}
 const D=BUILD[b.type];
 let h='<h3>'+(b.type==='house'?HICON[b.lvl-1]+' '+HOUSEN[b.lvl-1]:D.i+' '+D.n)+'</h3>'+
  '<p class="muted">'+D.d+'</p>'+
  rowH('Прочность',Math.round(b.hp)+' / '+Math.round(b.maxhp));
 if(D.wk>0)h+=rowH('Работники',b.staff+' / '+D.wk);
 if(D.out){
  const parts=[];for(const k in (b.stock||{}))if(b.stock[k]>=0.5)parts.push(RI[k].i+Math.floor(b.stock[k]));
  h+=rowH('Не отправлено',parts.length?parts.join(' '):'—');
  if(b.full)h+='<div class="tag" style="color:#ff9a6a">📦 Хранилище полно — производство стоит</div>';
  if(!depotList().length)h+='<div class="tag" style="color:#ff9a6a">⚠️ Нет склада или ратуши — добыча не попадёт в казну</div>';
  else if(D.wk>0&&!b.staff)h+='<div class="tag" style="color:#ff9a6a">⚠️ Без работника некому нести груз</div>';
 }
 if(b.type==='warehouse'||b.type==='townhall')h+='<div class="tag">📦 Принимает грузы от носильщиков</div>';
 if(b.type==='house'){
  h+=rowH('Жители',(b.resN||0)+' / '+HCAP[b.lvl-1]);
  if(b.lvl<7){
   h+='<div class="muted" style="margin-top:6px">До уровня «'+HOUSEN[b.lvl]+'»:</div><div>';
   for(const k of HREQ[b.lvl])h+='<span class="need '+(reqMet(b,k)?'ok':'no')+'">'+(reqMet(b,k)?'✓':'✗')+' '+REQN[k]+'</span>';
   h+='</div>';
  }else h+='<div class="tag">👑 Высший уровень жилья</div>';
 }
 if(D.out)h+=rowH('Производит',Object.keys(D.out).map(k=>RI[k].i+(+D.out[k].toFixed(2))+'/д').join(' '));
 if(D.inp)h+=rowH('Потребляет',Object.keys(D.inp).map(k=>RI[k].i+(+D.inp[k].toFixed(2))+'/д').join(' '));
 if(D.srv)h+=rowH('Услуга',REQN[D.srv]||D.srv)+rowH('Радиус',D.rad);
 if(b.buff>G.state.day)h+='<div class="tag">👑 Инспекция: +25%</div>';
 if(b.burn)h+='<div class="tag" style="color:#ff9a6a">🔥 Горит! Колодцы рядом тушат быстрее</div>';
 h+='<div class="acts">';
 if(b.type==='barracks'){
  for(const t in UNITT)h+='<button class="btn sm" data-act="train" data-u="'+t+'" title="'+costStr(UNITT[t].cost)+', содержание '+UNITT[t].up+' 🪙/д">'+UNITT[t].i+' '+UNITT[t].n+'</button>';
  h+='<div class="muted" style="width:100%">Войско: '+G.state.units.length+' / '+unitCap()+'. Содержание — из казны ежедневно.</div>';
 }
 if(b.type==='townhall'){
  h+='<button class="btn sm" data-act="fest">🎉 Праздник</button>';
  h+='<select data-act="tax">';
  TAXN.forEach((n,i)=>{h+='<option value="'+i+'"'+(G.state.taxRate===i?' selected':'')+'>Налоги: '+n+'</option>'});
  h+='</select>';
 }
 if(b.type==='tradepost')h+='<button class="btn sm" data-act="trade">🐫 Торговля</button>';
 if(D.wk>0&&b.type!=='ruin')h+='<button class="btn sm" data-act="toggle">'+(b.on?'⏸ Остановить':'▶ Запустить')+'</button>';
 if(b.type!=='ruin')h+='<button class="btn sm" data-act="inspect">👑 Инспекция</button>';
 h+='<button class="btn sm danger" data-act="demol">'+(b.type==='ruin'?'🏚️ Разобрать':'🧨 Снести')+'</button>';
 h+='<button class="btn sm" data-act="deselect">✕</button></div>';
 el.innerHTML=h;
}

/* ---------- Модальные окна ---------- */
export function openM(html){$('mwin').innerHTML='<button class="btn sm mx" data-act="close">✕</button>'+html;$('modal').style.display='flex'}
export function closeM(){$('modal').style.display='none'}
export async function menuM(){
 let slots='';
 for(const sl of ['auto','1','2','3']){
  let lab='— пусто —';
  try{
   const meta=await store.get(SKEY+sl+'-meta');
   if(meta){const m=JSON.parse(meta);lab='День '+m.day+', жителей '+m.pop+'<br>'+new Date(m.date).toLocaleString('ru')}
  }catch(e){}
  slots+='<tr><td><b>'+(sl==='auto'?'⏱ Авто':'💾 Слот '+sl)+'</b><br><span class="muted">'+lab+'</span></td>'+
   '<td style="text-align:right;white-space:nowrap">'+
   (sl==='auto'?'':'<button class="btn sm" data-act="save" data-s="'+sl+'">Сохранить</button> ')+
   '<button class="btn sm" data-act="load" data-s="'+sl+'">Загрузить</button></td></tr>';
 }
 openM('<h2>📜 Меню королевства</h2>'+
  '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'+
  '<button class="btn" data-act="resume">▶ Продолжить</button>'+
  '<button class="btn" data-act="help">❓ Справка</button>'+
  '<button class="btn" data-act="export">📤 Экспорт</button>'+
  '<button class="btn" data-act="import">📥 Импорт</button>'+
  '<input type="file" id="impfile" accept=".json,application/json" style="display:none"></div>'+
  '<h4>Сохранения</h4><table class="t">'+slots+'</table>'+
  '<p class="muted">Автосохранение — каждые 60 секунд и при сворачивании вкладки.</p>'+
  '<h4>Новая игра</h4>'+
  '<p>Зерно мира: <input id="seedinp" placeholder="случайное"> &nbsp; '+
  '<label><input type="checkbox" id="peacechk"> Мирный режим (без врагов)</label></p>'+
  '<button class="btn danger" data-act="newgame">🌍 Начать новый мир</button>'+
  '<p class="muted" style="margin-top:10px">Для модов: window.BADIMKA — G.state, BUILD, RI, TECHS, QUESTS, UNITT.</p>');
}
export function questsM(){
 let h='<h2>🎯 Задания короля</h2><table class="t">';
 QUESTS.forEach((q,i)=>{
  if(i>G.state.questIdx+2&&i<QUESTS.length-1)return;
  const st=i<G.state.questIdx?'✅':(i===G.state.questIdx?'▶️':'🔒');
  h+='<tr><td>'+st+'</td><td'+(i===G.state.questIdx?' style="color:#ffd97a"':'')+'>'+q.t+'</td><td style="white-space:nowrap">'+q.r.g+' 🪙</td></tr>';
 });
 h+='</table><p class="muted">Этап города: <b>'+stageName()+'</b> (растёт с населением). Отражено набегов: '+G.state.stats.raids+'. Испечено хлеба: '+Math.floor(G.state.stats.bread)+'.</p>';
 openM(h);
}
export function techM(){
 const s=G.state;
 let h='<h2>🔬 Древо технологий</h2>';
 if(cnt('school')<1)h+='<p class="muted">⚠️ Для исследований нужна школа.</p>';
 if(s.research){
  const T=TECHS[s.research.id];
  h+='<div class="techcard cur"><b>Идёт: '+T.n+'</b><div class="bar" style="margin-top:5px"><i style="width:'+pct(100*s.research.prog/T.days)+'"></i></div><div class="muted">'+Math.floor(s.research.prog)+' / '+T.days+' дней</div></div>';
 }
 const brs=[];
 for(const id in TECHS)if(!brs.includes(TECHS[id].br))brs.push(TECHS[id].br);
 for(const br of brs){
  h+='<h4>'+br+'</h4>';
  for(const id in TECHS){
   const T=TECHS[id];
   if(T.br!==br)continue;
   const done=s.techDone.includes(id);
   const cur=s.research&&s.research.id===id;
   h+='<div class="techcard'+(done?' done':cur?' cur':'')+'"><b>'+T.tier+'. '+T.n+'</b> — <span class="muted">'+T.d+'</span><br>'+
    '<span class="muted">'+T.cost.g+' 🪙'+(T.cost.books?(' + '+T.cost.books+' 📚'):'')+' · '+T.days+' дней</span> '+
    (done?'<span class="tag">✓ Изучено</span>':cur?'<span class="tag">…изучается</span>':'<button class="btn sm" data-act="research" data-t="'+id+'">Изучить</button>')+
    '</div>';
  }
 }
 openM(h);
}
export function tradeM(){
 const s=G.state;
 if(cnt('tradepost')<1){openM('<h2>🐫 Торговля</h2><p>Постройте <b>торговый пост</b> (категория «Особые») и наймите работников — караваны начнут приходить каждые 8 дней.</p>');return}
 let h='<h2>🐫 Торговый пост</h2>'+
  '<p class="muted">Караван — каждые 8 дней. «Продавать сверх»: излишки выше порога уходят на продажу (75% цены). «Закупать до»: караван докупает до этого запаса (130% цены). Пусто — не торговать.</p>'+
  '<div style="max-height:55vh;overflow:auto"><table class="t"><tr><th>Товар</th><th>Запас</th><th>Цена</th><th>Продавать сверх</th><th>Закупать до</th></tr>';
 for(const k of RES_ORDER){
  const r=s.trade[k]||{};
  h+='<tr><td>'+RI[k].i+' '+RI[k].n+'</td><td>'+fmt(s.res[k])+'</td><td>'+RI[k].p+'</td>'+
   '<td><input type="number" min="0" style="width:70px" data-trade="'+k+'" data-kind="sell" value="'+(r.sell!=null?r.sell:'')+'" placeholder="—"></td>'+
   '<td><input type="number" min="0" style="width:70px" data-trade="'+k+'" data-kind="buy" value="'+(r.buy!=null?r.buy:'')+'" placeholder="—"></td></tr>';
 }
 h+='</table></div>';
 openM(h);
}
export function resM(){
 let h='<h2>📦 Склады королевства</h2><div style="max-height:60vh;overflow:auto"><table class="t"><tr><th>Ресурс</th><th>Запас</th><th>Базовая цена</th></tr>';
 for(const k of RES_ORDER)h+='<tr><td>'+RI[k].i+' '+RI[k].n+'</td><td>'+fmt(G.state.res[k])+'</td><td>'+RI[k].p+' 🪙</td></tr>';
 h+='</table></div>';
 openM(h);
}
export function helpM(){
 openM('<h2>📖 Как править королевством</h2>'+
  '<p><b>Цель:</b> превратить клочок дикой земли в столицу империи. Великая победа — 5000 жителей, счастье 90%, Королевский дворец и 1 000 000 🪙. После победы игра продолжается как песочница.</p>'+
  '<h4>Первые шаги</h4>'+
  '<p>1. Постройте 3–4 дома 🛖 — поселенцы приедут сами.<br>2. Колодец ⛲ и еда: рыбак у воды, огород, ферма.<br>3. Лесопилка и каменоломня — стройматериалы.<br>4. Рынок 🛒 — дома начнут расти в уровне.<br>5. Выполняйте задания короля 🎯 — за них платят золотом.</p>'+
  '<h4>Управление</h4>'+
  '<p>ЛКМ — выбрать / построить · перетаскивание — двигать карту · колесо или щипок — зум · <b>Пробел</b> — пауза · <b>1–4</b> — скорость · <b>H</b> — к Бадимке · <b>M</b> — меню · <b>Esc</b> — отмена. Дороги, стены и снос можно «рисовать» перетаскиванием.</p>'+
  '<h4>Бадимка — ваш герой</h4>'+
  '<p>Выберите его и кликните по земле — он пойдёт. Рядом с ним здания работают лучше (аура). Подведите к зданию и проведите 👑 инспекцию: +25% на день. Через ратушу устраивайте 🎉 праздники. В бою Бадимка дерётся сам, а кнопкой 🚩 ведёт войско за собой.</p>'+
  '<h4>Дома растут сами</h4>'+
  '<p>Лачуга → Хижина → Дом ремесленника → Каменный дом → Особняк → Усадьба → Дворец. Каждый уровень требует новых услуг и товаров — выберите дом и смотрите список ✓/✗. Если требования пропадают — дом деградирует.</p>'+
  '<h4>Экономика</h4>'+
  '<p>Цепочки: зерно→мука→хлеб, железо+уголь→металл→инструменты/оружие, шерсть→ткань→одежда. Налоги собираются с домов (чем выше уровень — тем больше). Торговый пост продаёт излишки караванам. <b>Добыча попадает в казну не сразу:</b> носильщик несёт её с производства на склад 📦 или в ратушу. ПКМ по зданию — быстрая сводка (работники, невывезенный груз).</p>'+
  '<p class="muted">Сохранения: автоматически каждые 60 с, вручную в Меню (📜), плюс экспорт/импорт файлом — удобно переносить между устройствами.</p>'+
  '<h4>📖 Туториал</h4>'+
  '<p>Хотите ещё раз посмотреть пошаговое введение?<br><button class="btn sm" onclick="window.__startTutorial&&window.__startTutorial()">🎓 Запустить туториал</button></p>'+
  '<h4>🖼️ Загрузка PNG-спрайтов</h4>'+
  '<p>Можно заменить процедурную графику на нарисованные спрайты. Имя файла должно начинаться с ID объекта: <code>house_lvl4*.png</code>, <code>tavern*.png</code>, <code>church*.png</code>, <code>tree_oak*.png</code>, <code>rock*.png</code> и т.д. Прозрачный фон (alpha-PNG) обязателен.</p>'+
  '<p><label class="btn sm" style="cursor:pointer">📁 Выбрать PNG-файлы<input type="file" multiple accept="image/png,image/webp,image/jpeg" style="display:none" onchange="window.__loadSprites(this.files);this.value=\'\'"></label> <span class="muted">или положите файлы в папку <code>./sprites/</code> рядом с HTML и обновите страницу (требует http-сервер).</span></p>'+
  '<h4>🔊 Звук</h4>'+
  '<p>Музыка: <input type="range" id="vol-music" min="0" max="100" value="'+Math.round(getVolumes().music*100)+'" style="vertical-align:middle"> <span class="muted">(положите свои mp3 в <code>./audio/music.mp3</code>)</span></p>'+
  '<p>SFX: <input type="range" id="vol-sfx" min="0" max="100" value="'+Math.round(getVolumes().sfx*100)+'" style="vertical-align:middle"> <button class="btn sm" id="mute-btn">'+(getVolumes().muted?'🔇 Включить звук':'🔊 Выключить всё')+'</button></p>');
 /* привязка слайдеров — после рендера модалки */
 setTimeout(()=>{
  const m=$('vol-music'),s=$('vol-sfx'),mb=$('mute-btn');
  if(m)m.addEventListener('input',e=>{setMusicVol(+e.target.value/100);startMusic().catch(()=>{})});
  if(s)s.addEventListener('input',e=>{setSfxVol(+e.target.value/100);sfx('toast')});
  if(mb)mb.addEventListener('click',()=>{const v=toggleMute();mb.textContent=v?'🔇 Включить звук':'🔊 Выключить всё'});
 },50);
}
export function victoryM(){
 openM('<h2 style="text-align:center">👑 ВЕЛИКАЯ ПОБЕДА! 👑</h2>'+
  '<p style="text-align:center;font-size:15px">Бадимка прошёл путь от старосты глухой деревушки до <b>Короля</b>!<br>5000 подданных живут счастливо, казна ломится от золота,<br>а Королевский дворец сияет над столицей империи.</p>'+
  '<p style="text-align:center">Летописцы уже слагают легенды о великом правителе.</p>'+
  '<p style="text-align:center"><b>Игра продолжается в режиме «Песочница»</b> — правьте вечно!</p>'+
  '<div style="text-align:center"><button class="btn" data-act="resume">🏰 Править дальше</button></div>');
}

/* ============== ПРОМЕЖУТОЧНЫЕ ВЕХИ ============== */
const MILESTONE_KEY='bvk-milestone-seen';

export function checkMilestones(){
 const s=G.state;
 if(!s||s._preview)return;
 if(!s.milestones)s.milestones=[];
 const p=pop();
 for(let i=0;i<MILESTONES.length;i++){
  if(s.milestones.includes(i))continue;
  const m=MILESTONES[i];
  if(p>=m.pop){
   s.milestones.push(i);
   s.gold+=m.gold;
   giveXp(m.xp);
   sfx('milestone');
   milestoneM(m);
   break;  /* по одной вехе за раз — пусть игрок насладится */
  }
 }
}

export function milestoneM(m){
 openM(
  '<div style="text-align:center;padding:8px 0">'+
   '<div style="font-size:88px;line-height:1;margin-bottom:6px;text-shadow:0 4px 16px rgba(212,160,64,0.45)">'+m.icon+'</div>'+
   '<h2 style="margin:6px 0;color:#ffd97a;letter-spacing:2px;text-shadow:0 2px 12px #000a">🏆 '+m.title.toUpperCase()+'</h2>'+
   '<div style="font-size:13px;color:#d8c084;letter-spacing:1px;margin-bottom:14px">население достигло <b>'+m.pop+'</b> жителей</div>'+
   '<p style="font-size:15px;line-height:1.55;max-width:520px;margin:0 auto 18px;color:#e8dcb8">'+m.text+'</p>'+
   '<div style="background:rgba(212,160,64,0.12);border:1px solid #8c6534;border-radius:8px;padding:12px;display:inline-block;margin-bottom:14px">'+
    '<div style="font-size:13px;color:#d8c084;margin-bottom:6px">Награда правителю:</div>'+
    '<span style="font-size:18px">🪙 <b>+'+m.gold+'</b> &nbsp; ⭐ <b>+'+m.xp+' XP</b></span>'+
   '</div>'+
   '<div><button class="btn" data-act="close" style="background:linear-gradient(180deg,#d4a040 0%,#8c6534 100%);color:#2a1f12;font-weight:800;padding:11px 28px;font-size:15px">🏰 Так точно, владыка!</button></div>'+
  '</div>'
 );
}

/* ============== ТУТОРИАЛ ============== */
const TUTORIAL_KEY='bvk-tutorial-done';
let tutStep=0;

const TUTORIAL=[
 {
  icon:'🏰',title:'Добро пожаловать, владыка!',
  body:'Перед вами клочок дикой земли. Вы — <b>Бадимка</b>, староста и герой. Цель — превратить эту пустошь в столицу империи: <b>5000 жителей, счастье 90%, Королевский дворец и миллион золотых</b>.<br><br>Не торопитесь. Великие города не строятся за день.'
 },
 {
  icon:'🖱️',title:'Управление',
  body:'<b>ЛКМ</b> — выбрать объект или построить здание<br><b>Перетаскивание</b> — двигать карту<br><b>Колесо или щипок</b> — приблизить/отдалить<br><b>Пробел</b> — пауза, <b>1–4</b> — скорость игры<br><b>H</b> — найти Бадимку, <b>M</b> — меню<br><br>Дороги, стены и снос можно "рисовать", удерживая мышь.'
 },
 {
  icon:'🛖',title:'Первые шаги',
  body:'1. Постройте <b>3–4 дома 🛖</b> — поселенцы приедут сами<br>2. <b>Склад 📦</b> — носильщики относят туда добычу, без него она не попадёт в казну<br>3. <b>Колодец ⛲</b> рядом с домами<br>4. <b>Ферму 🌾</b> или <b>Огород 🥕</b> — иначе голод<br>5. <b>Лесопилку 🪓</b> у леса и <b>Каменоломню ⛏️</b> у гор<br>6. <b>Рынок 🛒</b> — дома начнут расти в уровне<br><br>ПКМ по зданию — сводка: работники и невывезенный груз. За задания короля 🎯 платят золотом.'
 },
 {
  icon:'👑',title:'Бадимка — ваш герой',
  body:'Выберите Бадимку и кликните по земле — он пойдёт туда. Подведите к зданию и нажмите <b>👑 Инспекцию</b> — здание получит +25% к работе на день.<br><br>Через ратушу можно устроить <b>🎉 Праздник</b> — поднимет счастье.<br><br>В бою Бадимка дерётся сам, а кнопкой <b>🚩</b> ведёт за собой войско.'
 },
 {
  icon:'⚔️',title:'Готовы править?',
  body:'Дома эволюционируют сами, когда жители получают всё нужное: <b>Лачуга → Хижина → Дом ремесленника → Каменный дом → Особняк → Усадьба → Дворец</b>.<br><br>Будут пожары, эпидемии, разбойники. Будут урожайные годы и торговые бумы. Будут промежуточные триумфы — 50, 200, 500 жителей и далее.<br><br>В путь, владыка!'
 }
];

export function startTutorial(){
 tutStep=0;
 showTutorialStep();
}

function showTutorialStep(){
 const t=TUTORIAL[tutStep];
 if(!t){
  closeM();
  try{localStorage.setItem(TUTORIAL_KEY,'1')}catch(e){}
  return;
 }
 const last=tutStep===TUTORIAL.length-1;
 openM(
  '<div style="text-align:center;padding:8px 0">'+
   '<div style="font-size:96px;line-height:1;margin-bottom:8px;text-shadow:0 4px 16px rgba(212,160,64,0.45)">'+t.icon+'</div>'+
   '<h2 style="margin:6px 0;color:#ffd97a;letter-spacing:2px">'+t.title+'</h2>'+
   '<div style="font-size:13px;color:#a8987a;margin-bottom:14px">шаг '+(tutStep+1)+' из '+TUTORIAL.length+'</div>'+
   '<p style="font-size:15px;line-height:1.6;max-width:540px;margin:0 auto 22px;color:#e8dcb8;text-align:left">'+t.body+'</p>'+
   '<div style="display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap">'+
    (tutStep>0?'<button class="btn" data-tut="back">← Назад</button>':'')+
    '<button class="btn" data-tut="skip" style="opacity:0.7">Пропустить</button>'+
    '<button class="btn" data-tut="next" style="background:linear-gradient(180deg,#d4a040 0%,#8c6534 100%);color:#2a1f12;font-weight:800;padding:10px 24px">'+
     (last?'⚔️ В путь, владыка!':'Дальше →')+
    '</button>'+
   '</div>'+
  '</div>'
 );
}

function tutorialAlreadySeen(){
 try{return localStorage.getItem(TUTORIAL_KEY)==='1'}catch(e){return false}
}

/* ---------- Делегаты событий UI ---------- */
$('stats').addEventListener('click',e=>{if(e.target.closest('[data-act="res"]'))resM()});
$('questline').addEventListener('click',()=>questsM());
$('timec').addEventListener('click',e=>{
 const b=e.target.closest('[data-sp]');
 if(!b||!G.state)return;
 if(b.dataset.sp==='p')G.state.paused=!G.state.paused;
 else{G.state.speed=+b.dataset.sp;G.state.paused=false}
 uiTime();
});
$('menubtns').addEventListener('click',e=>{
 const b=e.target.closest('[data-m]');
 if(!b)return;
 sfx('click');
 const m=b.dataset.m;
 if(m==='hero'){G.cam.x=G.state.hero.x;G.cam.y=G.state.hero.y;clampCam();select({type:'hero'})}
 else if(m==='quests')questsM();
 else if(m==='tech')techM();
 else if(m==='trade')tradeM();
 else if(m==='menu')menuM();
});
$('cats').addEventListener('click',e=>{
 const b=e.target.closest('[data-cat]');
 if(!b)return;
 sfx('click');
 curCat=b.dataset.cat;
 uiCats();uiItems();
});
$('items').addEventListener('click',e=>{
 const d=e.target.closest('[data-b]');
 if(!d)return;
 sfx('click');
 setBuild(G.buildSel===d.dataset.b?null:d.dataset.b);
});
$('info').addEventListener('click',e=>{
 const a=e.target.closest('[data-act]');
 if(!a||!G.state)return;
 const act=a.dataset.act;
 if(act==='deselect')select(null);
 else if(act==='talk'){
  const c=G.state.citizens.find(x=>x.id===G.sel.id);
  if(c){
   const mood=c.happy<40?'bad':c.happy<70?'mid':'good';
   c.phrase=pick(Math.random,PHR[mood]);
   pf(c.x,c.y,'💬');
   uiInfo();
  }
 }
 else if(act==='rally'){G.state.hero.rally=!G.state.hero.rally;toast(G.state.hero.rally?'🚩 Войско следует за Бадимкой':'🚩 Войско вернулось на посты');uiInfo()}
 else if(act==='fest')festival();
 else if(G.sel&&G.sel.type==='b'){
  const b=G.BIDX.get(G.sel.id);
  if(!b)return;
  if(act==='train')trainUnit(a.dataset.u,b);
  else if(act==='toggle'){b.on=!b.on;G.covDirty=true;uiInfo()}
  else if(act==='inspect')inspect(b);
  else if(act==='demol')removeBuilding(b,true);
  else if(act==='trade')tradeM();
 }
});
$('info').addEventListener('change',e=>{
 const a=e.target.closest('[data-act="tax"]');
 if(a&&G.state){G.state.taxRate=+a.value;toast('Уровень налогов: '+TAXN[G.state.taxRate])}
});
$('modal').addEventListener('click',e=>{
 if(e.target.id==='modal'){closeM();return}
 /* туториал */
 const tut=e.target.closest('[data-tut]');
 if(tut){
  sfx('click');
  const t=tut.dataset.tut;
  if(t==='next'){tutStep++;showTutorialStep()}
  else if(t==='back'){tutStep=Math.max(0,tutStep-1);showTutorialStep()}
  else if(t==='skip'){closeM();try{localStorage.setItem(TUTORIAL_KEY,'1')}catch(e){}}
  return;
 }
 const a=e.target.closest('[data-act]');
 if(!a)return;
 const act=a.dataset.act;
 if(act==='close'||act==='resume')closeM();
 else if(act==='newgame'){
  const seed=$('seedinp')?$('seedinp').value.trim():'';
  const peaceful=$('peacechk')?$('peacechk').checked:false;
  newGame(seed,peaceful);
  closeM();
  uiTime();uiItems();uiTop();
 }
 else if(act==='save')saveSlot(a.dataset.s).then(()=>menuM());
 else if(act==='load')loadSlot(a.dataset.s).then(ok=>{if(ok){closeM();uiTime();uiItems();uiTop()}});
 else if(act==='export')exportSave();
 else if(act==='import'){const f=$('impfile');if(f)f.click()}
 else if(act==='help')helpM();
 else if(act==='research'){startResearch(a.dataset.t);techM()}
});
$('modal').addEventListener('change',e=>{
 if(e.target.id==='impfile'&&e.target.files&&e.target.files[0]){importSave(e.target.files[0]);e.target.value=''}
 const tr=e.target.closest('[data-trade]');
 if(tr&&G.state){
  const k=tr.dataset.trade,kind=tr.dataset.kind;
  const v=tr.value===''?null:Math.max(0,Math.floor(+tr.value)||0);
  if(!G.state.trade[k])G.state.trade[k]={sell:null,buy:null};
  G.state.trade[k][kind]=v;
 }
});

/* Делегаты главного меню */
$('mainmenu').addEventListener('click',e=>{
 const btn=e.target.closest('[data-mm]');
 if(!btn||btn.disabled)return;
 sfx('click');
 const a=btn.dataset.mm;
 if(a==='new')startNewGameFromMenu();
 else if(a==='continue')continueFromMenu();
 else if(a==='help')helpM();
 else if(a==='settings')helpM();  /* пока то же — там слайдеры громкости */
});

/* Кнопка "В меню" в правом верхнем углу основной игры */
$('to-menu-btn').addEventListener('click',()=>{
 sfx('click');
 returnToMenu();
});

/* ---------- Главный цикл и запуск ---------- */
export let lastT=performance.now(),uiAcc=0,autoAcc=0,saving=false;
export function frame(t){
 const dtR=Math.min(0.05,Math.max(0,(t-lastT)/1000));
 lastT=t;
 if(G.mode==='menu'&&G.state){
  /* В меню: панорамируем камеру медленно по окружности вокруг центра */
  G.menuTime+=dtR;
  const r=8,sp=0.08;
  G.cam.x=64+Math.cos(G.menuTime*sp)*r;
  G.cam.y=64+Math.sin(G.menuTime*sp*0.7)*r;
  G.cam.z=0.34+Math.sin(G.menuTime*0.05)*0.04;
  render(t);
 }else if(G.state){
  const modalOpen=$('modal').style.display==='flex';
  if(!G.state.paused&&!modalOpen)sim(dtR*SPEEDS[G.state.speed]);
  render(t);
  uiAcc+=dtR;
  if(uiAcc>0.4){uiAcc=0;uiTop();uiItems();if(G.sel)uiInfo()}
  autoAcc+=dtR;
  if(autoAcc>60){autoAcc=0;if(!saving){saving=true;saveSlot('auto',true).then(()=>{saving=false}).catch(()=>{saving=false})}}
 }
 requestAnimationFrame(frame);
}
export async function boot(){
 uiMenuBtns();uiCats();
 /* Тихо пробуем подгрузить кастомные спрайты из ./sprites/. */
 loadSpritesFromFolder('./sprites/').catch(()=>{});
 /* Музыка стартует на первый клик/тач (требование браузеров для автоплея) */
 const startAudio=()=>{
  startMusic().catch(()=>{});
  window.removeEventListener('pointerdown',startAudio);
  window.removeEventListener('keydown',startAudio);
 };
 window.addEventListener('pointerdown',startAudio,{once:true});
 window.addEventListener('keydown',startAudio,{once:true});
 /* Проверяем наличие автосейва (для кнопки "Продолжить") */
 let hasSave=false;
 try{
  const js=await store.get(SKEY+'auto');
  if(js)hasSave=true;
 }catch(e){}
 /* Показываем главное меню */
 showMainMenu(hasSave);
 requestAnimationFrame(frame);
}

/* ============== ГЛАВНОЕ МЕНЮ ============== */

export function showMainMenu(hasSave){
 G.mode='menu';
 G.menuTime=0;
 document.body.classList.add('in-menu');
 /* активируем кнопку Продолжить если есть автосейв */
 const contBtn=document.querySelector('[data-mm="continue"]');
 if(contBtn)contBtn.disabled=!hasSave;
 /* генерируем preview-сцену для фона если её ещё нет */
 if(!G.state||G.state._preview!==true){
  genPreviewScene();
 }
 /* центрируем камеру на городе */
 G.cam.x=64;G.cam.y=64;G.cam.z=0.34;
}

export function hideMainMenu(){
 G.mode='playing';
 document.body.classList.remove('in-menu');
}

/* Создаёт красивую сцену с уже отстроенной деревней для фона главного меню.
   Использует фиксированный seed для воспроизводимости. */
function genPreviewScene(){
 G.state=freshState(0x6AD195A,true);
 const gen=mapGen(0x6AD195A);
 G.BIDX.clear();
 G.state.map=gen.map;G.state.forest=gen.forest;
 G.state._preview=true;
 const sp=findSpawn(gen.map);
 const [cx,cy]=sp;
 /* Расставляем здания вокруг центра спавна */
 const place=(t,dx,dy)=>{
  const x=cx+dx,y=cy+dy;
  if(canPlace(t,x,y).ok){addBuilding(t,x,y);return true}
  return false;
 };
 /* 8-10 домов разного уровня */
 place('house',-6,-4);place('house',-3,-4);place('house',0,-4);place('house',3,-4);
 place('house',-6,4);place('house',-3,4);place('house',0,4);place('house',3,4);
 place('house',-9,0);place('house',6,0);
 /* Центр — общественные */
 place('townhall',-2,-1);
 place('church',2,-2);
 place('market',-2,2);
 place('tavern',2,2);
 /* Производство по краям */
 place('farm',-12,-3);
 place('mill',-12,1);
 place('lumber',8,-3);
 place('smith',8,1);
 place('well',-1,1);place('well',1,-1);
 /* Прокачиваем дома до 3-5 уровня */
 for(const b of G.state.buildings){
  if(b.type==='house'){
   b.lvl=2+Math.floor(Math.random()*4);  // 2-5
   b.miss=0;
  }
 }
 /* Добавляем жителей */
 for(let i=0;i<30;i++){
  const hx=cx+(Math.random()-0.5)*18, hy=cy+(Math.random()-0.5)*10;
  G.state.citizens.push({
   id:G.state.nextCid++,
   name:NAM_M[i%NAM_M.length]+' '+NAM_S[i%NAM_S.length],
   fem:Math.random()<0.5,age:18+(Math.random()*30)|0,
   home:0,work:0,
   x:hx,y:hy,tx:hx,ty:hy,
   spd:1.6+Math.random()*0.4,
   say:null,sayT:0,mood:'mid'
  });
 }
 /* Герой в центре */
 G.state.hero={hero:true,x:cx+0.5,y:cy+0.5,tx:null,ty:null,hp:120,maxhp:120,lvl:5,xp:0,insCd:0,rally:false,cd:0};
 paintAll();G.covDirty=true;
}

/* Запуск новой игры из меню */
export function startNewGameFromMenu(){
 newGame('',false);
 hideMainMenu();
 sfx('milestone');
 if(!tutorialAlreadySeen()){
  /* первая игра — показываем туториал */
  setTimeout(()=>startTutorial(),250);
 }else{
  toast('🏰 Добро пожаловать, владыка Бадимка!','good');
 }
}

/* Продолжить из автосейва */
export async function continueFromMenu(){
 try{
  const js=await store.get(SKEY+'auto');
  if(js){
   restore(js);
   hideMainMenu();
   toast('📂 Игра загружена. Доброго возвращения, владыка!','good');
  }else{
   toast('Автосохранения нет','bad');
  }
 }catch(e){toast('Не удалось загрузить','bad')}
}

/* Вернуться в меню из игры */
export async function returnToMenu(){
 if(G.state&&!G.state._preview){
  /* сохраняем перед выходом */
  await saveSlot('auto',true).catch(()=>{});
 }
 G.sel=null;G.buildSel=null;
 showMainMenu(true);  /* кнопка Продолжить будет активна */
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.state)saveSlot('auto',true)});
window.addEventListener('error',e=>{
 const d=$('err');
 if(d){d.style.display='block';d.textContent='⚠️ Ошибка: '+e.message+'\n'+((e.error&&e.error.stack)||'')}
});
