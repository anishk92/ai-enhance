document.addEventListener("DOMContentLoaded", () => {

  const uploadBox = document.getElementById("uploadBox");
  const fileInput = document.getElementById("fileInput");

  const loading = document.getElementById("loading");
  const preview = document.getElementById("preview");
  const actions = document.getElementById("actions");

  const beforeCanvas = document.getElementById("before");
  const afterCanvas = document.getElementById("after");

  const beforeCtx = beforeCanvas.getContext("2d");
  const afterCtx = afterCanvas.getContext("2d");

  const downloadBtn = document.getElementById("download");
  const resetBtn = document.getElementById("reset");

  const img = new Image();

  /* === Gemini watermark constants === */
  const ALPHA = 0.18;
  const WHITE = 255;

  /* === Open file dialog === */
  uploadBox.onclick = () => fileInput.click();

  /* === Handle upload === */
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;

    resetUI();
    loading.classList.remove("hidden");

    const reader = new FileReader();
    reader.onload = e => {
      img.onload = () => processImage();
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  /* === Process automatically === */
  function processImage() {
    const w = img.width;
    const h = img.height;

    if (!w || !h) {
      alert("Image failed to load");
      return;
    }

    beforeCanvas.width = afterCanvas.width = w;
    beforeCanvas.height = afterCanvas.height = h;

    beforeCtx.drawImage(img, 0, 0);
    afterCtx.drawImage(img, 0, 0);

    const size = (w > 1024 && h > 1024) ? 96 : 48;
    const margin = size === 96 ? 64 : 32;

    const x = w - size - margin;
    const y = h - size - margin;

    const imgData = afterCtx.getImageData(x, y, size, size);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const v = (d[i + c] - ALPHA * WHITE) / (1 - ALPHA);
        d[i + c] = Math.max(0, Math.min(255, v));
      }
    }

    afterCtx.putImageData(imgData, x, y);

    loading.classList.add("hidden");
    preview.classList.remove("hidden");
    actions.classList.remove("hidden");
  }

  /* === Download === */
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = afterCanvas.toDataURL("image/png");
    a.download = "watermark_removed.png";
    a.click();
  };

  /* === Reset === */
  resetBtn.onclick = () => {
    fileInput.value = "";
    resetUI();
  };

  function resetUI() {
    loading.classList.add("hidden");
    preview.classList.add("hidden");
    actions.classList.add("hidden");
    beforeCtx.clearRect(0,0,beforeCanvas.width,beforeCanvas.height);
    afterCtx.clearRect(0,0,afterCanvas.width,afterCanvas.height);
  }
});
