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
/* ================= WATERMARK REMOVER ================= */
const MAX_FREE = 5; // Matches your HTML 5/5
const today = new Date().toDateString();
let usage = JSON.parse(localStorage.getItem('wm_usage') || '{}');

// Fix usage initialization
if (usage.date !== today) {
    usage = { date: today, count: 0 };
    localStorage.setItem('wm_usage', JSON.stringify(usage));
}

// Update the UI counter immediately
const remaining = document.getElementById('remaining');
if (remaining) remaining.textContent = (MAX_FREE - usage.count);

const rCanvas = document.getElementById('removeCanvas');
const rCtx = rCanvas.getContext('2d', { willReadFrequently: true });
let rImg = new Image();

// 1. Handle File Upload
document.getElementById('removeUpload').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        rImg = new Image();
        rImg.onload = () => {
            rCanvas.width = rImg.width;
            rCanvas.height = rImg.height;
            rCtx.drawImage(rImg, 0, 0);
        };
        rImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
};

// 2. The Process Function (REPAIRED LOGIC)
document.getElementById('removeProcess').onclick = () => {
    if (!rImg.src) {
        alert('Please upload an image first');
        return;
    }
    
    if (usage.count >= MAX_FREE) {
        alert('Daily free limit reached. Upgrade for unlimited access.');
        return;
    }

    const imgData = rCtx.getImageData(0, 0, rCanvas.width, rCanvas.height);
    const d = imgData.data;

    /* Gemini uses a semi-transparent white overlay. 
       We target pixels that are bright (threshold) and 
       subtract the white haze (strength).
    */
    const threshold = 160; 
    const strength = 0.18; // Intensity of the watermark removal

    for (let i = 0; i < d.length; i += 4) {
        // Only process pixels that are lighter than the threshold
        if (d[i] > threshold && d[i+1] > threshold && d[i+2] > threshold) {
            
            // MATH: Recover original color from under the white haze
            // Formula: (Result - (255 * Alpha)) / (1 - Alpha)
            d[i]     = (d[i] - (255 * strength)) / (1 - strength);
            d[i + 1] = (d[i + 1] - (255 * strength)) / (1 - strength);
            d[i + 2] = (d[i + 2] - (255 * strength)) / (1 - strength);
            
            // Ensure values stay in 0-255 range
            d[i] = Math.max(0, Math.min(255, d[i]));
            d[i+1] = Math.max(0, Math.min(255, d[i+1]));
            d[i+2] = Math.max(0, Math.min(255, d[i+2]));
        }
    }

    rCtx.putImageData(imgData, 0, 0);

    // Update Usage
    usage.count++;
    localStorage.setItem('wm_usage', JSON.stringify(usage));
    if (remaining) remaining.textContent = (MAX_FREE - usage.count);
};

// 3. Download Logic
document.getElementById('removeDownload').onclick = () => {
    const link = document.createElement('a');
    link.download = 'watermark-removed.png';
    link.href = rCanvas.toDataURL();
    link.click();
};
