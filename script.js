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
document.getElementById('removeProcess').onclick = () => {
  if (usage.count >= MAX_FREE) {
    alert('Daily free limit reached. Upgrade for unlimited access.');
    return;
  }

  // 1. Get image data from canvas
  const imgData = rCtx.getImageData(0, 0, rCanvas.width, rCanvas.height);
  const d = imgData.data;

  /**
   * ADJUST THESE SETTINGS:
   * threshold: Only affects bright pixels (prevents ruining dark areas)
   * strength: How much "white" to remove (0.1 to 0.2 is best for Gemini)
   */
  const threshold = 160; 
  const strength = 0.15; 

  for (let i = 0; i < d.length; i += 4) {
    // Check if the pixel is bright enough to be part of the logo
    if (d[i] > threshold && d[i+1] > threshold && d[i+2] > threshold) {
      
      // Reverse Alpha Blending Formula:
      // OriginalColor = (CurrentColor - (White * Strength)) / (1 - Strength)
      d[i]     = (d[i] - (255 * strength)) / (1 - strength);     // Red
      d[i + 1] = (d[i + 1] - (255 * strength)) / (1 - strength); // Green
      d[i + 2] = (d[i + 2] - (255 * strength)) / (1 - strength); // Blue
      
      // Note: We keep d[i+3] (Alpha) at 255 so the image stays solid
    }
  }

  // 2. Put the corrected pixels back
  rCtx.putImageData(imgData, 0, 0);

  // 3. Update usage
  usage.count++;
  localStorage.setItem('wm_usage', JSON.stringify(usage));
  remaining.textContent = MAX_FREE - usage.count;
};
