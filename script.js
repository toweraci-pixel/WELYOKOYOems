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

// ECG monitor - Sinus Rhythm Simulation
const canvas = $("#ecgCanvas");
const ctx = canvas.getContext("2d");

let ecgPoints = [];
let ecgOffset = 0;
let lastFrame = 0;

let heartRate = 75;
let beatTime = 60000 / heartRate;

function resizeCanvas() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(r.width * dpr);
  canvas.height = Math.floor(r.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ecgPoints = [];
}

function sinusECG(ms) {

  // 一个心拍周期
  const cycle = beatTime;
  const t = ms % cycle;

  let y = 0;

  // P wave
  if (t > 80 && t < 140) {
    y -= Math.sin((t - 80) / 60 * Math.PI) * 6;
  }

  // Q wave
  if (t > 220 && t < 240) {
    y += 8;
  }

  // R wave
  if (t >= 240 && t < 260) {
    y -= 45;
  }

  // S wave
  if (t >= 260 && t < 285) {
    y += 20;
  }

  // ST segment
  if (t >= 285 && t < 360) {
    y = 0;
  }

  // T wave
  if (t > 380 && t < 480) {
    y -= Math.sin((t - 380) / 100 * Math.PI) * 10;
  }

  return y;
}


function drawECG(time) {

  if (!lastFrame) lastFrame = time;

  const dt = time - lastFrame;
  lastFrame = time;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  ecgOffset += dt * 0.08;

  if (ecgOffset > w) {
    ecgOffset = 0;
    ecgPoints = [];
  }


  ecgPoints.push({
    x: ecgOffset,
    y: h / 2 + sinusECG(time)
  });


  // 限制点数量，保护手机性能
  if (ecgPoints.length > 500) {
    ecgPoints.shift();
  }


  ctx.beginPath();

  for (let i = 0; i < ecgPoints.length; i++) {

    const p = ecgPoints[i];

    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }

  }


  ctx.strokeStyle = "#65f7df";
  ctx.lineWidth = 2;
  ctx.stroke();


  requestAnimationFrame(drawECG);
}


// HR 60-100
setInterval(() => {

  heartRate = 60 + Math.floor(Math.random() * 41);
  beatTime = 60000 / heartRate;

  $("#hr").textContent = heartRate;

},3000);


// SpO2 90-100
setInterval(() => {

  $("#spo2").textContent =
    90 + Math.floor(Math.random() * 11);

},3000);


window.addEventListener("resize", resizeCanvas);

resizeCanvas();
requestAnimationFrame(drawECG);

// Demo vitals gently vary to keep the monitor alive.
setInterval(()=>{
  $("#hr").textContent = 74 + Math.floor(Math.random()*6);
  $("#spo2").textContent = 98 + Math.floor(Math.random()*2);
  $("#rr").textContent = 15 + Math.floor(Math.random()*3);
},2500);
