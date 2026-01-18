const upload = document.getElementById("upload");
const loading = document.getElementById("loading");
const preview = document.getElementById("preview");
const controls = document.getElementById("controls");
const beforeCanvas = document.getElementById("before");
const afterCanvas = document.getElementById("after");
const beforeCtx = beforeCanvas.getContext("2d");
const afterCtx = afterCanvas.getContext("2d", { willReadFrequently: true });
const downloadBtn = document.getElementById("download");
const resetBtn = document.getElementById("reset");

let img = new Image();

/* ================= CONFIG ================= */
// Gemini's watermark is approx 15-20% opacity white
const STRENGTH = 0.18; 

/* ================= UPLOAD & AUTO PROCESS ================= */
upload.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    resetUI();
    loading.classList.remove("hidden");

    const reader = new FileReader();
    reader.onload = () => {
        img = new Image();
        img.onload = () => {
            // Delay slightly to show loading animation
            setTimeout(processImage, 500);
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
};

function processImage() {
    const w = img.width;
    const h = img.height;

    // Set canvas sizes
    beforeCanvas.width = afterCanvas.width = w;
    beforeCanvas.height = afterCanvas.height = h;

    // Draw original
    beforeCtx.drawImage(img, 0, 0);
    afterCtx.drawImage(img, 0, 0);

    /* SCAN AREA: Gemini watermarks are always in the bottom right.
       We scan the bottom 25% and right 40% of the image.
    */
    const scanW = Math.floor(w * 0.4);
    const scanH = Math.floor(h * 0.25);
    const startX = w - scanW;
    const startY = h - scanH;

    const imageData = afterCtx.getImageData(startX, startY, scanW, scanH);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Only target bright/whitish pixels (the logo) 
        // to avoid messing up the actual image colors.
        if (r > 150 && g > 150 && b > 150) {
            // Reverse Alpha Formula
            data[i]     = (r - 255 * STRENGTH) / (1 - STRENGTH);
            data[i + 1] = (g - 255 * STRENGTH) / (1 - STRENGTH);
            data[i + 2] = (b - 255 * STRENGTH) / (1 - STRENGTH);
        }
    }

    afterCtx.putImageData(imageData, startX, startY);

    loading.classList.add("hidden");
    preview.classList.remove("hidden");
    controls.classList.remove("hidden");
    document.getElementById("uploadBox").classList.add("hidden");
}

/* ================= UTILS ================= */
downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = afterCanvas.toDataURL("image/png");
    a.download = "cleaned_image.png";
    a.click();
};

resetBtn.onclick = () => {
    location.reload(); // Cleanest way to reset state
};

function resetUI() {
    preview.classList.add("hidden");
    controls.classList.add("hidden");
}
