const upload = document.getElementById("upload");
const loading = document.getElementById("loading");
const preview = document.getElementById("preview");
const afterCanvas = document.getElementById("after");
const afterCtx = afterCanvas.getContext("2d", { willReadFrequently: true });

// Configuration for Gemini Watermark
const ALPHA_STRENGTH = 0.18; // Transparency of the logo

/**
 * Your Shared Logic: Calculates the mask of the logo
 */
function calculateAlphaMap(data, width, height) {
    const alphaMap = new Float32Array(width * height);
    for (let i = 0; i < alphaMap.length; i++) {
        const idx = i * 4;
        // Take max brightness of RGB to find the logo pixels
        const maxChannel = Math.max(data[idx], data[idx + 1], data[idx + 2]);
        alphaMap[i] = maxChannel / 255.0;
    }
    return alphaMap;
}

upload.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    loading.classList.remove("hidden");
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => processImage(img);
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
};

function processImage(img) {
    const w = afterCanvas.width = img.width;
    const h = afterCanvas.height = img.height;

    afterCtx.drawImage(img, 0, 0);

    // 1. Identify the Gemini Logo Area (Bottom Right)
    const areaW = Math.floor(w * 0.35); // Scan 35% of width
    const areaH = Math.floor(h * 0.20); // Scan 20% of height
    const startX = w - areaW;
    const startY = h - areaH;

    const imageData = afterCtx.getImageData(startX, startY, areaW, areaH);
    const pixels = imageData.data;

    // 2. Use your Alpha Map logic to identify the logo pixels
    const alphaMap = calculateAlphaMap(pixels, areaW, areaH);

    // 3. Apply Restoration Math
    // We only change pixels where the alphaMap shows "Logo" (brightness > threshold)
    for (let i = 0; i < pixels.length; i += 4) {
        const alphaIndex = i / 4;
        const brightness = alphaMap[alphaIndex];

        // If brightness is high, it's the logo
        if (brightness > 0.5) { 
            // Formula: Reverse the blending of white (255) at the logo's alpha
            for (let c = 0; c < 3; c++) {
                let color = pixels[i + c];
                // Math: (Result - (255 * Alpha)) / (1 - Alpha)
                let corrected = (color - (255 * ALPHA_STRENGTH)) / (1 - ALPHA_STRENGTH);
                pixels[i + c] = Math.max(0, Math.min(255, corrected));
            }
        }
    }

    // 4. Update the Canvas
    afterCtx.putImageData(imageData, startX, startY);

    loading.classList.add("hidden");
    preview.classList.remove("hidden");
    document.getElementById("controls").classList.remove("hidden");
}

// Download functionality
document.getElementById("download").onclick = () => {
    const link = document.createElement("a");
    link.download = "removed_logo.png";
    link.href = afterCanvas.toDataURL();
    link.click();
};
