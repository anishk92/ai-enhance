import { ALPHA, WHITE, getGeminiConfig } from './config.js';

export function removeGeminiWatermark(img, beforeCtx, afterCtx) {
  const w = img.width;
  const h = img.height;

  beforeCtx.canvas.width = afterCtx.canvas.width = w;
  beforeCtx.canvas.height = afterCtx.canvas.height = h;

  beforeCtx.drawImage(img, 0, 0);
  afterCtx.drawImage(img, 0, 0);

  const { size, margin } = getGeminiConfig(w, h);
  const x = w - size - margin;
  const y = h - size - margin;

  const data = afterCtx.getImageData(x, y, size, size);
  const d = data.data;

  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = (d[i + c] - ALPHA * WHITE) / (1 - ALPHA);
      d[i + c] = Math.max(0, Math.min(255, v));
    }
  }

  afterCtx.putImageData(data, x, y);
}
