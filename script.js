/* ===== TAB SYSTEM ===== */
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tool').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  };
});

/* ===== ENHANCER ===== */
const eUpload = document.getElementById('enhanceUpload');
const eCanvas = document.getElementById('enhanceCanvas');
const eCtx = eCanvas.getContext('2d');
const ePreset = document.getElementById('enhancePreset');

let eImg = new Image();

eUpload.onchange = e => {
  const r = new FileReader();
  r.onload = () => {
    eImg.onload = drawEnhance;
    eImg.src = r.result;
  };
  r.readAsDataURL(e.target.files[0]);
};

function drawEnhance() {
  eCanvas.width = eImg.width;
  eCanvas.height = eImg.height;
  applyEnhance();
}

ePreset.onchange = applyEnhance;

function applyEnhance() {
  if (!eImg.src) return;
  eCtx.clearRect(0,0,eCanvas.width,eCanvas.height);
  eCtx.filter = {
    portrait: 'brightness(108%) contrast(112%) saturate(115%)',
    lowlight: 'brightness(135%) contrast(110%)',
    old: 'grayscale(100%) sepia(40%)'
  }[ePreset.value];
  eCtx.drawImage(eImg,0,0);
  eCtx.filter = 'none';
}

document.getElementById('enhanceDownload').onclick = () => {
  const a = document.createElement('a');
  a.href = eCanvas.toDataURL('image/png');
  a.download = 'enhanced.png';
  a.click();
};

/* ===== COMPRESSOR ===== */
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
      cCtx.drawImage(cImg,0,0);
    };
    cImg.src = r.result;
  };
  r.readAsDataURL(e.target.files[0]);
};

document.getElementById('compressDownload').onclick = () => {
  const a = document.createElement('a');
  a.href = cCanvas.toDataURL(format.value, quality.value / 100);
  a.download = 'compressed.' + format.value.split('/')[1];
  a.click();
};
