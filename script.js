const upload = document.getElementById("upload");
const loading = document.getElementById("loading");
const preview = document.getElementById("preview");
const controls = document.getElementById("controls");

const beforeCanvas = document.getElementById("before");
const afterCanvas = document.getElementById("after");

const beforeCtx = beforeCanvas.getContext("2d");
const afterCtx = afterCanvas.getContext("2d");

const downloadBtn = document.getElementById("download");
const resetBtn = document.getElementById("reset");

let img = new Image();

/* ================= CONFIG ================= */
const ALPHA = 0.18;
const LOGO = 255;

/* ================= UPLOAD → AUTO PROCESS ================= */
upload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  resetUI();
  loading.classList.remove("hidden");

  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => processImage();
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

/* ================= PROCESS ================= */
function processImage() {
  const w = img.width;
  const h = img.height;

  beforeCanvas.width = afterCanvas.width = w;
  beforeCanvas.height = afterCanvas.height = h;

  beforeCtx.drawImage(img, 0, 0);
  afterCtx.drawImage(img, 0, 0);

  const size = (w > 1024 && h > 1024) ? 96 : 48;
  const margin = size === 96 ? 64 : 32;
  const x = w - size - margin;
  const y = h - size - margin;

  const data = afterCtx.getImageData(x, y, size, size);
  const d = data.data;

  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const original = (d[i + c] - ALPHA * LOGO) / (1 - ALPHA);
      d[i + c] = Math.max(0, Math.min(255, original));
    }
  }

  afterCtx.putImageData(data, x, y);

  loading.classList.add("hidden");
  preview.classList.remove("hidden");
  controls.classList.remove("hidden");
}

/* ================= DOWNLOAD ================= */
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.href = afterCanvas.toDataURL("image/png");
  a.download = "gemini-watermark-removed.png";
  a.click();
};

/* ================= RESET ================= */
resetBtn.onclick = () => {
  upload.value = "";
  resetUI();
};

function resetUI() {
  preview.classList.add("hidden");
  controls.classList.add("hidden");
  loading.classList.add("hidden");
  beforeCtx.clearRect(0,0,beforeCanvas.width,beforeCanvas.height);
  afterCtx.clearRect(0,0,afterCanvas.width,afterCanvas.height);
}
