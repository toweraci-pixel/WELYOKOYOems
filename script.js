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

let ecgTime = 0;
let lastFrame = 0;
let ecgPoints = [];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ecgPoints = [];
  ecgTime = 0;
}

function ecgWave(t) {
  // 约75 BPM
  const cycle = 0.8;
  const p = t % cycle;

  let v = 0;

  // P wave
  if (p > 0.10 && p < 0.18) {
    v -= Math.sin((p - 0.10) / 0.08 * Math.PI) * 7;
  }

  // Q wave
  if (p > 0.27 && p < 0.30) {
    v += Math.sin((p - 0.27) / 0.03 * Math.PI) * 12;
  }

  // R wave
  if (p > 0.30 && p < 0.34) {
    v -= Math.sin((p - 0.30) / 0.04 * Math.PI) * 55;
  }

  // S wave
  if (p > 0.34 && p < 0.39) {
    v += Math.sin((p - 0.34) / 0.05 * Math.PI) * 25;
  }

  // T wave
  if (p > 0.52 && p < 0.70) {
    v -= Math.sin((p - 0.52) / 0.18 * Math.PI) * 15;
  }

  return v;
}

function drawECG(time) {
  if (!lastFrame) lastFrame = time;

  const delta = (time - lastFrame) / 1000;
  lastFrame = time;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ecgTime += delta;

  const x = (ecgTime * 120) % w;

  if (x < 2) {
    ecgPoints = [];
  }

  ecgPoints.push({
    x,
    y: h / 2 + ecgWave(ecgTime)
  });

  ctx.clearRect(0, 0, w, h);

  ctx.beginPath();

  for (let i = 0; i < ecgPoints.length; i++) {
    const point = ecgPoints[i];

    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
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
