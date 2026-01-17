const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const enhanceBtn = document.getElementById('enhanceBtn');
const downloadBtn = document.getElementById('downloadBtn');

let img = new Image();

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};

enhanceBtn.addEventListener('click', () => {
  if (!img.src) return;

  ctx.filter = "contrast(120%) brightness(110%) saturate(115%)";
  ctx.drawImage(img, 0, 0);

  downloadBtn.href = canvas.toDataURL("image/png");
  downloadBtn.classList.remove('disabled');
});
