const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let img = new Image();

upload.addEventListener('change', e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => img.src = reader.result;
  reader.readAsDataURL(file);
});

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};

function enhance() {
  ctx.filter = "contrast(120%) brightness(110%) saturate(110%)";
  ctx.drawImage(img, 0, 0);
  document.getElementById('download').href = canvas.toDataURL();
}
