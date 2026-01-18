import { loadImageFromFile } from './loader.js';
import { removeGeminiWatermark } from './engine.js';

const fileInput = document.getElementById('fileInput');
const uploadBox = document.getElementById('uploadBox');
const loading = document.getElementById('loading');
const preview = document.getElementById('preview');
const actions = document.getElementById('actions');

const beforeCtx = document.getElementById('before').getContext('2d');
const afterCtx = document.getElementById('after').getContext('2d');

const downloadBtn = document.getElementById('download');
const resetBtn = document.getElementById('reset');

uploadBox.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  loading.classList.remove('hidden');
  preview.classList.add('hidden');
  actions.classList.add('hidden');

  try {
    const img = await loadImageFromFile(file);
    removeGeminiWatermark(img, beforeCtx, afterCtx);
    loading.classList.add('hidden');
    preview.classList.remove('hidden');
    actions.classList.remove('hidden');
  } catch {
    alert('Failed to load image');
  }
};

downloadBtn.onclick = () => {
  const a = document.createElement('a');
  a.href = document.getElementById('after').toDataURL();
  a.download = 'gemini_removed.png';
  a.click();
};

resetBtn.onclick = () => {
  fileInput.value = '';
  preview.classList.add('hidden');
  actions.classList.add('hidden');
};
