export const ALPHA = 0.18;
export const WHITE = 255;

export function getGeminiConfig(w, h) {
  if (w > 1024 && h > 1024) {
    return { size: 96, margin: 64 };
  }
  return { size: 48, margin: 32 };
}
