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

// ECG monitor
const canvas = $("#ecgCanvas");
const ctx = canvas.getContext("2d");

let ecgX = 0;
let lastTime = 0;
let points = [];

function resizeCanvas() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(r.width * dpr);
  canvas.height = Math.floor(r.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  points = [];
  ecgX = 0;
}

function ecgValue(t) {
  const cycle = 0.85;
  const p = t % cycle;

  let y = 0;

  // P wave
  if (p > 0.08 && p < 0.18) {
    y -= Math.sin((p - 0.08) / 0.1 * Math.PI) * 8;
  }

  // Q wave
  if (p > 0.25 && p < 0.28) {
    y += Math.sin((p - 0.25) / 0.03 * Math.PI) * 8;
  }

  // R wave
  if (p > 0.28 && p < 0.32) {
    y -= Math.sin((p - 0.28) / 0.04 * Math.PI) * 45;
  }

  // S wave
  if (p > 0.32 && p < 0.36) {
    y += Math.sin((p - 0.32) / 0.04 * Math.PI) * 18;
  }

  // T wave
  if (p > 0.50 && p < 0.66) {
    y -= Math.sin((p - 0.50) / 0.16 * Math.PI) * 12;
  }

  return y;
}

function drawECG(time) {
  if (!lastTime) lastTime = time;

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  ecgX += dt * 100;

  if (ecgX > w) {
    ecgX = 0;
    points = [];
  }

  points.push({
    x: ecgX,
    y: h / 2 + ecgValue(ecgX / 100)
  });

  ctx.beginPath();

  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      ctx.moveTo(points[i].x, points[i].y);
    } else {
      ctx.lineTo(points[i].x, points[i].y);
    }
  }

  ctx.strokeStyle = "#65f7df";
  ctx.lineWidth = 2;
  ctx.stroke();

  requestAnimationFrame(drawECG);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
requestAnimationFrame(drawECG);

// Demo vitals gently vary to keep the monitor alive.
setInterval(()=>{
  $("#hr").textContent = 74 + Math.floor(Math.random()*6);
  $("#spo2").textContent = 98 + Math.floor(Math.random()*2);
  $("#rr").textContent = 15 + Math.floor(Math.random()*3);
},2500);
