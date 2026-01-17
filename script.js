const upload = document.getElementById('upload');
const before = document.getElementById('before');
const after = document.getElementById('after');
const btx = before.getContext('2d');
const atx = after.getContext('2d');
const slider = document.getElementById('slider');
const resize = document.getElementById('resize');
const download = document.getElementById('download');

let img = new Image();
let w, h;

upload.addEventListener('change', e => {
  const reader = new FileReader();
  reader.onload = () => img.src = reader.result;
  reader.readAsDataURL(e.target.files[0]);
});

img.onload = () => {
  w = img.width;
  h = img.height;
  before.width = after.width = w;
  before.height = after.height = h;
  btx.drawImage(img, 0, 0);
  atx.drawImage(img, 0, 0);
};

document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.onclick = () => applyPreset(btn.dataset.preset);
});

function applyPreset(type) {
  atx.filter = {
    portrait: "contrast(120%) brightness(110%) saturate(120%)",
    old: "grayscale(100%) contrast(110%) sepia(30%)",
    lowlight: "brightness(130%) contrast(115%)"
  }[type];
  atx.drawImage(img, 0, 0, w, h);
}

slider.oninput = () => {
  document.getElementById('after')
    .style.clipPath = `inset(0 ${100-slider.value}% 0 0)`;
};

resize.onchange = () => {
  if (resize.value === "ig") resizeCanvas(1080,1080);
  if (resize.value === "yt") resizeCanvas(1280,720);
};

function resizeCanvas(nw, nh) {
  before.width = after.width = nw;
  before.height = after.height = nh;
  btx.drawImage(img, 0, 0, nw, nh);
  atx.drawImage(img, 0, 0, nw, nh);
}

download.onclick = () => {
  const a = document.createElement('a');
  a.href = after.toDataURL();
  a.download = "enhanced-image.png";
  a.click();
};
