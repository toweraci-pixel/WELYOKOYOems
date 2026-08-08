const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function japanTime() {
  const now = new Date();
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).format(now);
}
function tickTime(){
  const t = japanTime();
  $("#heroTime").textContent = "Japan " + t.split(" ").pop();
  $("#monitorTime").textContent = "JST " + t.split(" ").pop();
}
tickTime(); setInterval(tickTime,1000);

// Mobile nav: simple jump menu.
$("#menuBtn")?.addEventListener("click", () => {
  const links = ["home","about","ems","interests","gallery"];
  const current = Math.max(0, links.indexOf(location.hash.slice(1)));
  location.hash = links[(current + 1) % links.length];
});

// Lightbox
const lightbox = $("#lightbox"), lightboxImg = $("#lightboxImg");
function openLightbox(src, alt=""){
  lightboxImg.src = src; lightboxImg.alt = alt; lightbox.classList.add("open");
}
$$("[data-lightbox]").forEach(el => el.addEventListener("click", () => {
  const img = el.querySelector("img");
  openLightbox(el.dataset.lightbox, img?.alt || "");
}));
function closeLightbox(){ lightbox.classList.remove("open"); lightboxImg.src=""; }
$("#closeLightbox").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if(e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") closeLightbox(); });

// ECG demo
const canvas = $("#ecgCanvas"), ctx = canvas.getContext("2d");
let phase = 0;
function resizeCanvas(){
  const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1,2);
  canvas.width = Math.floor(r.width*dpr); canvas.height = Math.floor(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function ecgWave(x){
  const period = 175;
  const p = ((x + phase) % period + period) % period;
  let y = 0;
  if (p > 18 && p < 40) y += Math.sin((p-18)/22*Math.PI)*-5;
  if (p > 55 && p < 59) y += -14;
  if (p >= 59 && p < 64) y += 48*(1-(p-59)/5);
  if (p >= 64 && p < 69) y += -105*(1-Math.abs(p-66.5)/2.5);
  if (p >= 69 && p < 76) y += 62*(1-(p-69)/7);
  if (p > 100 && p < 135) y += Math.sin((p-100)/35*Math.PI)*-11;
  return y;
}
function drawECG(){
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  ctx.beginPath();
  for(let x=0;x<=w;x+=2){
    const y = h/2 + ecgWave(x);
    if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.strokeStyle="#65f7df"; ctx.lineWidth=2; ctx.shadowColor="#65f7df"; ctx.shadowBlur=8; ctx.stroke(); ctx.shadowBlur=0;
  phase += 2.5;
  requestAnimationFrame(drawECG);
}
window.addEventListener("resize",resizeCanvas); resizeCanvas(); drawECG();

// Demo vitals gently vary to keep the monitor alive.
setInterval(()=>{
  $("#hr").textContent = 74 + Math.floor(Math.random()*6);
  $("#spo2").textContent = 98 + Math.floor(Math.random()*2);
  $("#rr").textContent = 15 + Math.floor(Math.random()*3);
},2500);
