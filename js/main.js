/* ===== EDIT YOUR CONTACT DETAILS HERE (leave "" to hide) ===== */
const CONTACT = {
  whatsapp: "923315692267",
  email: "",      // e.g. "asfahan@email.com"
  instagram: "fighterxpr0_yt",
  linkedin: ""    // full URL
};

/* Folder -> category & client */
const MAP = {
  "KKPF promo reels":       {cat:"Wedding Films",  client:"KKPF Studio"},
  "Riwa Fragrance":         {cat:"Product & Fragrance", client:"Riwa Fragrance"},
  "Learnify Academy Reels": {cat:"Education Reels", client:"Learnify Academy"},
  "Foodography":            {cat:"Food",           client:"Foodography"},
  "food":                   {cat:"Food",           client:"Food Reel"},
  "Motion Graphics":        {cat:"Motion Graphics",client:"Motion Graphics"},
  "Tronex Solutoin":        {cat:"Motion Graphics",client:"Tronex Solution"},
  "Podcast":                {cat:"Podcasts",       client:"Raja Raza Podcast"},
  "Dilawer":                {cat:"Ads & Promos",   client:"Naval Mart"},
  "bank work":              {cat:"Ads & Promos",   client:"Bank Campaign"},
  "Trade Sync review":      {cat:"Ads & Promos",   client:"Trade Sync"},
  "Gaming videos":          {cat:"Gaming",         client:"Gaming"}
};
const CAT_ORDER = ["Wedding Films","Product & Fragrance","Education Reels","Food","Motion Graphics","Ads & Promos","Podcasts","Gaming"];

const RENAME = {"sequence 01":"Full Podcast Episode","2022-10-09 22-04-27":"Gameplay Montage","final shani":"Shani Food Review"};
const genCount = {};
function niceTitle(raw, client){
  let t = raw.replace(/\[.*?\]/g,"").replace(/\.mp4/gi,"").replace(/[@]/g,"").replace(/\.+$/,"")
             .replace(/\s\./g," ").replace(/\s+final$/i,"").replace(/([a-z])(\d)$/i,"$1 $2")
             .replace(/\s+/g," ").trim();
  if (RENAME[t.toLowerCase()]) return RENAME[t.toLowerCase()];
  if (/^(final|reel|\d+|cap \(1\))$/i.test(t)) { genCount[client]=(genCount[client]||0)+1; return client + " — Reel " + genCount[client]; }
  if (t === t.toUpperCase() || /[A-Z]{4,}/.test(t)) t = t.toLowerCase();
  t = t.replace(/\bad\b/i,"Ad").replace(/\byaer\b/i,"Year").replace(/\bAQUST\b/i,"August").replace(/learfinfy/i,"Learnify")
       .replace(/\bjeery\b/i,"Jerry").replace(/\bnoting\b/i,"Nothing").replace(/\breell\b/i,"Reel")
       .replace(/\bgaldi\b/i,"galti").replace(/\b3th\b/i,"3rd").replace(/tronexr/i,"Tronex")
       .replace(/Promoo/i,"Promo").replace(/Afahan/i,"Asfahan");
  return t.replace(/\b([a-z])/g,(m,c)=>c.toUpperCase()).replace(/\bKkpf\b/,"KKPF").replace(/\bCeo\b/,"CEO").replace(/\bU\b/,"You");
}
const fmtDur = s => { s=Math.round(s); const m=Math.floor(s/60); return m+":"+String(s%60).padStart(2,"0"); };

/* Build dataset (dedupe identical files across folders) */
const seen = new Set();
const DATA = [];
for (const v of window.VIDEOS){
  const folder = (v.orig || v.src).split("/")[1];
  const m = MAP[folder] || {cat:folder, client:folder};
  const key = v.title.toLowerCase()+"|"+v.dur;
  if (seen.has(key)) continue; seen.add(key);
  DATA.push({...v, cat:m.cat, client:m.client, name:niceTitle(v.title, m.client),
             fmt: v.h>v.w*1.1 ? "Vertical" : (v.w>v.h*1.1 ? "Landscape" : "Square")});
}
DATA.sort((a,b)=>CAT_ORDER.indexOf(a.cat)-CAT_ORDER.indexOf(b.cat));

/* ---------- helpers ---------- */
const $ = (q,el=document)=>el.querySelector(q);
const enc = p => p.split("/").map(encodeURIComponent).join("/");
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const tc = (t,fps=25)=>{ const h=Math.floor(t/3600),m=Math.floor(t/60)%60,s=Math.floor(t)%60,f=Math.floor((t%1)*fps); return [h,m,s,f].map(n=>String(n).padStart(2,"0")).join(":"); };
const fmtCls = v => v.fmt==="Vertical"?"v":(v.fmt==="Landscape"?"l":"s");
const byName = n => DATA.find(d=>d.name.toLowerCase()===n.toLowerCase());

/* ---------- stats ---------- */
const clients = [...new Set(DATA.map(d=>d.client))].filter(c=>!/Motion Graphics|Gaming|Food Reel/.test(c));
const cats = CAT_ORDER.filter(c=>DATA.some(d=>d.cat===c));
const STAT = {edits:DATA.length, clients:clients.length, cats:cats.length, mins:Math.round(DATA.reduce((s,d)=>s+d.dur,0)/60)};
function countUp(el,to){ const t0=performance.now(), D=1400;
  (function f(t){ const p=Math.min(1,(t-t0)/D), e=1-Math.pow(1-p,3); el.textContent=Math.round(to*e)+(p===1?"+":""); if(p<1) requestAnimationFrame(f); })(t0); }

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return;
  e.target.classList.add("in"); io.unobserve(e.target);
  if(e.target.classList.contains("stats")) e.target.querySelectorAll("[data-count]").forEach(b=>countUp(b,STAT[b.dataset.count]));
}),{threshold:.15});
function observeReveals(root=document){ root.querySelectorAll(".reveal:not(.in)").forEach(el=>io.observe(el)); }

/* ---------- lightbox ---------- */
const lb=$("#lb"), lbV=$("#lbVideo"); let lbList=[], lbI=0;
function openLB(list,i){ lbList=list; lbI=(i+list.length)%list.length; const v=list[lbI];
  lbV.src=enc(v.src); lbV.play().catch(()=>{});
  $("#lbTitle").textContent=v.name;
  $("#lbSub").textContent=`${v.client.toUpperCase()}  ·  ${tc(v.dur).slice(3,8)}  ·  ${lbI+1}/${list.length}`;
  lb.classList.add("open"); document.body.style.overflow="hidden"; }
function closeLB(){ lb.classList.remove("open"); lbV.pause(); lbV.removeAttribute("src"); lbV.load(); document.body.style.overflow=""; }
$("#lbClose").onclick=closeLB;
$("#lbPrev").onclick=()=>openLB(lbList,lbI-1);
$("#lbNext").onclick=()=>openLB(lbList,lbI+1);
lb.addEventListener("click",e=>{ if(e.target===lb) closeLB(); });
document.addEventListener("keydown",e=>{ if(!lb.classList.contains("open"))return;
  if(e.key==="Escape")closeLB(); if(e.key==="ArrowRight")openLB(lbList,lbI+1); if(e.key==="ArrowLeft")openLB(lbList,lbI-1); });

/* ---------- featured editor ---------- */
(function(){
  const F = byName("Barat Promo") || DATA.find(d=>d.fmt==="Landscape") || DATA[0];
  const viewer=$(".viewer"), vid=$("#featVideo"), ph=$("#playhead"), tl=$("#timeline");
  $("#featName").textContent = "KKPF_" + F.name.replace(/\s+/g,"_") + "_Final.mp4";
  viewer.style.backgroundImage=`url("${F.name==="Barat Promo"?"assets/featured.jpg":F.thumb}")`;
  // ruler labels
  $("#ruler").innerHTML = Array.from({length:10},(_,i)=>`<span style="left:${i*10}%">${tc(F.dur*i/10).slice(3,8)}</span>`).join("");
  // V1 clips = thumbnails from other edits
  const pool = DATA.filter(d=>d!==F).sort((a,b)=>a.thumb<b.thumb?-1:1);
  const w=[1.4,.8,1.1,1.7,.7,1,1.3,.9,1.5,.8,1.2,1];
  $("#clipsV").innerHTML = w.map((g,i)=>`<span style="flex:${g};background-image:url('${pool[(i*7)%pool.length].thumb}')"></span>`).join("");
  // A1 waveform
  let seed=7; const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  $(".wave").innerHTML = Array.from({length:150},(_,i)=>`<i style="height:${Math.round(18+70*Math.abs(Math.sin(i/5))*rnd()+10*rnd())}%"></i>`).join("");
  const start=()=>{ if(!vid.src) vid.src=enc(F.src); viewer.classList.add("started"); vid.controls=true; vid.play().catch(()=>{}); };
  $("#featPlay").onclick=start;
  const L=62, R=18;
  const place=()=>{ const p=vid.duration?vid.currentTime/vid.duration:0; ph.style.left=(L+p*(tl.clientWidth-L-R))+"px"; $("#featTC").textContent=tc(vid.currentTime||0); };
  vid.addEventListener("timeupdate",place); addEventListener("resize",place);
  tl.addEventListener("click",e=>{ const r=tl.getBoundingClientRect(); const p=Math.min(1,Math.max(0,(e.clientX-r.left-L)/(r.width-L-R)));
    start(); const go=()=>{ vid.currentTime=p*vid.duration; place(); };
    vid.readyState>=1?go():vid.addEventListener("loadedmetadata",go,{once:true}); });
})();

/* ---------- work rows ---------- */
function card(v,list,i){
  const el=document.createElement("div"); el.className="card";
  el.style.aspectRatio=`${v.w}/${v.h}`;
  el.innerHTML=`<img loading="lazy" src="${v.thumb}" alt="${v.name}">
    <video muted loop playsinline preload="none"></video>
    <div class="shade"></div>
    <div class="top"><span class="fmt ${fmtCls(v)}">${v.fmt}</span><span class="tc">${tc(v.dur).slice(3,8)}</span></div>
    <div class="play"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg></div>
    <div class="meta"><h4>${v.name}</h4><span>${v.client}</span></div>`;
  const vid=el.querySelector("video"); let tmr;
  el.addEventListener("mouseenter",()=>{ tmr=setTimeout(()=>{ if(!vid.src) vid.src=enc(v.src)+"#t="+Math.min(3,v.dur/4); vid.play().then(()=>el.classList.add("playing")).catch(()=>{}); },250); });
  el.addEventListener("mouseleave",()=>{ clearTimeout(tmr); vid.pause(); el.classList.remove("playing"); });
  el.addEventListener("click",()=>openLB(list,i));
  return el;
}
const rowsEl=$("#rows");
$("#jump").innerHTML = cats.map(c=>`<a href="#row-${slug(c)}">${c}<small>${DATA.filter(d=>d.cat===c).length}</small></a>`).join("");
cats.forEach((c,ci)=>{
  const list=DATA.filter(d=>d.cat===c);
  const row=document.createElement("div"); row.className="row"; row.id="row-"+slug(c);
  row.innerHTML=`<div class="wrap row-head reveal"><h3><small><b>${String(ci+1).padStart(2,"0")}</b> · ${list.length} edits</small>${c}</h3>
      <div class="arrows"><button aria-label="Scroll left">‹</button><button aria-label="Scroll right">›</button></div></div>
    <div class="track-x"></div>`;
  const tr=row.querySelector(".track-x");
  list.forEach((v,i)=>tr.appendChild(card(v,list,i)));
  const [l,r]=row.querySelectorAll(".arrows button");
  l.onclick=()=>tr.scrollBy({left:-tr.clientWidth*.8}); r.onclick=()=>tr.scrollBy({left:tr.clientWidth*.8});
  rowsEl.appendChild(row);
});

/* ---------- services backgrounds ---------- */
document.querySelectorAll(".svc[data-cat]").forEach(el=>{
  const list=DATA.filter(d=>d.cat===el.dataset.cat);
  const wideCard=el.classList.contains("big")||el.classList.contains("wide");
  const prefer = el.dataset.cat==="Wedding Films" ? byName("Walima Promo") : null;
  const v = prefer || (wideCard && list.find(d=>d.fmt==="Landscape")) || list[0];
  const img = el.dataset.cat==="Wedding Films" ? "assets/svc-wedding.jpg" : v && v.thumb;
  if(img) el.querySelector(".svc-bg").style.backgroundImage=`url("${img}")`;
});

/* ---------- clients marquee ---------- */
const names=clients.map(c=>`<span>${c}</span>`).join("");
$("#marquee").innerHTML=names+names;

/* ---------- contact mosaic ---------- */
const verts=DATA.filter(d=>d.fmt==="Vertical");
$("#mosaic").innerHTML=Array.from({length:36},(_,i)=>`<img loading="lazy" alt="" src="${verts[(i*5)%verts.length].thumb}">`).join("");

/* ---------- contact links ---------- */
const L=[];
if(CONTACT.whatsapp) L.push(`<a class="btn btn-primary" target="_blank" href="https://wa.me/${CONTACT.whatsapp}">WhatsApp Me</a>`);
if(CONTACT.email) L.push(`<a class="btn btn-ghost" href="mailto:${CONTACT.email}">${CONTACT.email}</a>`);
if(CONTACT.instagram) L.push(`<a class="btn btn-ghost" target="_blank" href="https://instagram.com/${CONTACT.instagram}">Instagram</a>`);
if(CONTACT.linkedin) L.push(`<a class="btn btn-ghost" target="_blank" href="${CONTACT.linkedin}">LinkedIn</a>`);
if(!L.length) L.push(`<a class="btn btn-primary" href="#work">▶ Browse the Work</a>`);
$("#contactLinks").innerHTML=L.join("");

/* ---------- nav + misc ---------- */
const nav=$("#nav");
addEventListener("scroll",()=>nav.classList.toggle("solid",scrollY>40),{passive:true});
$("#yr").textContent=new Date().getFullYear();
observeReveals();
