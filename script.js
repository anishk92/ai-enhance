const upload = document.getElementById('upload');
const before = document.getElementById('before');
const after = document.getElementById('after');
const slider = document.getElementById('slider');
const resize = document.getElementById('resize');
const downloadBtn = document.getElementById('download');
const qualitySlider = document.getElementById('quality');
const qval = document.getElementById('qval');
const formatSelect = document.getElementById('format');

const btx = before.getContext('2d');
const atx = after.getContext('2d');

let img = new Image();
let width = 0;
let height = 0;
let activePreset = 'portrait';

upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    img.onload = drawOriginal;
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function drawOriginal() {
  width = img.width;
  height = img.height;

  before.width = after.width = width;
  before.height = after.height = height;

  btx.clearRect(0, 0, width, height);
  atx.clearRect(0, 0, width, height);

  btx.drawImage(img, 0, 0, width, height);
  applyPreset();
  updateSlider();
}

document.getElementById('btn-enhance').onclick = () => {
  activePreset = 'portrait';
  applyPreset();
};

document.getElementById('btn-old-photo').onclick = () => {
  activePreset = 'old';
  applyPreset();
};

function applyPreset() {
  if (!img.src) return;

  atx.clearRect(0, 0, width, height);
  atx.filter = getFilter(activePreset);
  atx.drawImage(img, 0, 0, width, height);
  atx.filter = 'none';
}

function getFilter(preset) {
  switch (preset) {
    case 'portrait':
      return 'brightness(108%) contrast(112%) saturate(115%)';
    case 'old':
      return 'grayscale(100%) sepia(45%) contrast(95%)';
    default:
      return 'none';
  }
}

slider.oninput = updateSlider;
function updateSlider() {
  after.style.clipPath = `inset(0 ${100 - slider.value}% 0 0)`;
}

resize.onchange = () => {
  if (!img.src) return;

  const map = {
    ig: [1080, 1080],
    yt: [1280, 720],
    fb: [1200, 630]
  };

  if (!map[resize.value]) return;

  [width, height] = map[resize.value];

  before.width = after.width = width;
  before.height = after.height = height;

  btx.clearRect(0, 0, width, height);
  atx.clearRect(0, 0, width, height);

  btx.drawImage(img, 0, 0, width, height);
  applyPreset();
};

qualitySlider.oninput = () => {
  qval.textContent = qualitySlider.value;
};

downloadBtn.onclick = () => {
  if (!img.src) return;

  const quality = qualitySlider.value / 100;
  const format = formatSelect.value;

  // BLOCK unsupported formats
  if (format === 'image/avif') {
    alert('AVIF export not supported in browser. Use WebP.');
    return;
  }

  const link = document.createElement('a');
  link.href = after.toDataURL(format, quality);
  link.download = `processed-image.${format.split('/')[1]}`;
  link.click();
};
