const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const processBtn = document.getElementById("process");
const downloadBtn = document.getElementById("download");

let img = new Image();

/* ================= LOAD IMAGE ================= */
upload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.classList.remove("hidden");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

/* ================= CONFIG ================= */
function getConfig(w, h) {
  if (w > 1024 && h > 1024) {
    return { size: 96, margin: 64, bg: "bg_96.png" };
  }
  return { size: 48, margin: 32, bg: "bg_48.png" };
}

/* ================= REMOVE WATERMARK ================= */
processBtn.onclick = async () => {
  if (!img.src) return alert("Upload image first");

  const { size, margin, bg } = getConfig(canvas.width, canvas.height);

  const x = canvas.width - size - margin;
  const y = canvas.height - size - margin;

  const bgImg = await loadBG(bg, size);
  const alphaMap = getAlphaMap(bgImg, size);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  reverseBlend(imageData, alphaMap, x, y, size);

  ctx.putImageData(imageData, 0, 0);
};

/* ================= DOWNLOAD ================= */
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "gemini-watermark-removed.png";
  a.click();
};

/* ================= HELPERS ================= */
function loadBG(src, size) {
  return new Promise(resolve => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      c.getContext("2d").drawImage(i, 0, 0);
      resolve(c.getContext("2d").getImageData(0, 0, size, size));
    };
    i.src = src;
  });
}

function getAlphaMap(bgData, size) {
  const alpha = new Float32Array(size * size);
  for (let i = 0; i < alpha.length; i++) {
    const idx = i * 4;
    alpha[i] = bgData.data[idx] / 255; // white logo alpha
  }
  return alpha;
}

function reverseBlend(imgData, alphaMap, x, y, size) {
  const d = imgData.data;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const a = alphaMap[r * size + c];
      if (a < 0.01 || a > 0.98) continue;

      const idx = ((y + r) * imgData.width + (x + c)) * 4;
      for (let k = 0; k < 3; k++) {
        const v = (d[idx + k] - a * 255) / (1 - a);
        d[idx + k] = Math.max(0, Math.min(255, v));
      }
    }
  }
}
