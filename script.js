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
let currentWidth = 0;
let currentHeight = 0;
let currentPreset = null;

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.onload = drawOriginal;
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

qualitySlider.addEventListener('input', () => {
  qval.textContent = qualitySlider.value;
});

function drawOriginal() {
  currentWidth = img.width;
  currentHeight = img.height;

  before.width = after.width = currentWidth;
  before.height = after.height = currentHeight;

  btx.setTransform(1, 0, 0, 1, 0, 0);
  atx.setTransform(1, 0, 0, 1, 0, 0);

  btx.clearRect(0, 0, currentWidth, currentHeight);
  atx.clearRect(0, 0, currentWidth, currentHeight);

  btx.drawImage(img, 0, 0, currentWidth, currentHeight);
  atx.drawImage(img, 0, 0, currentWidth, currentHeight);

  slider.value = 50;
  updateSlider();
}

document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentPreset = btn.dataset.preset;
    applyPreset();
  });
});

function applyPreset() {
  if (!img.src) return;

  atx.clearRect(0, 0, currentWidth, currentHeight);

  atx.filter = getFilter(currentPreset);
  atx.drawImage(img, 0, 0, currentWidth, currentHeight);
  atx.filter = 'none';
}

function getFilter(preset) {
  switch (preset) {
    case 'portrait':
      return 'brightness(110%) contrast(120%) saturate(120%)';
    case 'old':
      return 'grayscale(100%) sepia(40%) contrast(110%)';
    case 'lowlight':
      return 'brightness(130%) contrast(115%)';
    default:
      return 'none';
  }
}

slider.addEventListener('input', updateSlider);

function updateSlider() {
  after.style.clipPath = `inset(0 ${100 - slider.value}% 0 0)`;
}

resize.addEventListener('change', () => {
  if (!img.src) return;

  if (resize.value === 'ig') resizeCanvas(1080, 1080);
  if (resize.value === 'yt') resizeCanvas(1280, 720);

  if (currentPreset) applyPreset();
});

function resizeCanvas(w, h) {
  currentWidth = w;
  currentHeight = h;

  before.width = after.width = w;
  before.height = after.height = h;

  btx.clearRect(0, 0, w, h);
  atx.clearRect(0, 0, w, h);

  btx.drawImage(img, 0, 0, w, h);
  atx.drawImage(img, 0, 0, w, h);
}

downloadBtn.addEventListener('click', () => {
  if (!img.src) return;

  const quality = parseInt(qualitySlider.value) / 100;
  const format = formatSelect.value;

  const link = document.createElement('a');
  link.href = after.toDataURL(format, quality);
  link.download =
    format === 'image/webp'
      ? 'compressed-image.webp'
      : 'compressed-image.jpg';

  link.click();
});


downloadBtn.addEventListener('click', () => {
  if (!img.src) return;

  const link = document.createElement('a');
  link.href = after.toDataURL('image/png');
  link.download = 'enhanced-image.png';
  link.click();
});
