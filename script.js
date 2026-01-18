/* ================= TAB SYSTEM ================= */
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tool').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  };
});

/* ================= ENHANCER ================= */
const eUpload = document.getElementById('enhanceUpload');
const eCanvas = document.getElementById('enhanceCanvas');
const eCtx = eCanvas.getContext('2d');
const ePreset = document.getElementById('enhancePreset');
let eImg = new Image();

eUpload.onchange = e => {
  const r = new FileReader();
  r.onload = () => {
    eImg.onload = applyEnhance;
    eImg.src = r.result;
  };
  r.readAsDataURL(e.target.files[0]);
};

ePreset.onchange = applyEnhance;

function applyEnhance() {
  if (!eImg.src) return;
  eCanvas.width = eImg.width;
  eCanvas.height = eImg.height;
  eCtx.filter = {
    portrait: 'brightness(108%) contrast(112%) saturate(115%)',
    lowlight: 'brightness(135%) contrast(110%)',
    old: 'grayscale(100%) sepia(40%)'
  }[ePreset.value];
  eCtx.drawImage(eImg, 0, 0);
  eCtx.filter = 'none';
}

document.getElementById('enhanceDownload').onclick = () => {
  downloadCanvas(eCanvas, 'enhanced.png');
};

/* ================= COMPRESSOR ================= */
const cUpload = document.getElementById('compressUpload');
const cCanvas = document.getElementById('compressCanvas');
const cCtx = cCanvas.getContext('2d');
const quality = document.getElementById('quality');
const qval = document.getElementById('qval');
const format = document.getElementById('format');
let cImg = new Image();

quality.oninput = () => qval.textContent = quality.value;

cUpload.onchange = e => {
  const r = new FileReader();
  r.onload = () => {
    cImg.onload = () => {
      cCanvas.width = cImg.width;
      cCanvas.height = cImg.height;
      cCtx.drawImage(cImg, 0, 0);
    };
    cImg.src = r.result;
  };
  r.readAsDataURL(e.target.files[0]);
};

document.getElementById('compressDownload').onclick = () => {
  downloadCanvas(cCanvas, 'compressed.' + format.value.split('/')[1], format.value, quality.value / 100);
};

/* ================= WATERMARK REMOVER ================= */
/* ================= WATERMARK REMOVER (STABLE VERSION) ================= */

const MAX_FREE = 5;
const today = new Date().toDateString();
let usage = JSON.parse(localStorage.getItem('wm_usage') || '{}');

if (usage.date !== today) {
  usage = { date: today, count: 0 };
  localStorage.setItem('wm_usage', JSON.stringify(usage));
}

const remaining = document.getElementById('remaining');
remaining.textContent = MAX_FREE - usage.count;

const rCanvas = document.getElementById('removeCanvas');
const rCtx = rCanvas.getContext('2d', { willReadFrequently: true });
let rImg = new Image();

/* Upload */
document.getElementById('removeUpload').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    rImg = new Image();
    rImg.onload = () => {
      rCanvas.width = rImg.width;
      rCanvas.height = rImg.height;
      rCtx.drawImage(rImg, 0, 0);
    };
    rImg.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};

/* Process */
document.getElementById('removeProcess').onclick = () => {
  if (!rImg.src) {
    alert('Upload an image first');
    return;
  }

  if (usage.count >= MAX_FREE) {
    alert('Daily free limit reached');
    return;
  }

  const img = rCtx.getImageData(0, 0, rCanvas.width, rCanvas.height);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    // Detect watermark-like pixels (bright + low contrast)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (max > 180 && (max - min) < 18) {
      // Reduce luminance instead of destroying pixels
      d[i]     = r * 0.82;
      d[i + 1] = g * 0.82;
      d[i + 2] = b * 0.82;
    }
  }

  rCtx.putImageData(img, 0, 0);

  usage.count++;
  localStorage.setItem('wm_usage', JSON.stringify(usage));
  remaining.textContent = MAX_FREE - usage.count;
};

/* Download */
document.getElementById('removeDownload').onclick = () => {
  const a = document.createElement('a');
  a.download = 'watermark-reduced.png';
  a.href = rCanvas.toDataURL('image/png');
  a.click();
};
