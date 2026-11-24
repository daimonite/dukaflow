/**
 * Reads a picked photo and returns a small JPEG data URL, so a product image
 * stays a few kilobytes in the local snapshot and the cloud row.
 */
export const fileToDownscaledDataUrl = (
  file: File,
  maxSize = 480,
  quality = 0.72
): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Chagua faili la picha (JPEG, PNG au WebP).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Imeshindikana kusoma picha hiyo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Picha hiyo haiwezi kufunguliwa.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Kifaa hiki hakiwezi kuchakata picha.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
