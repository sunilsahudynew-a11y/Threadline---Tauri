/**
 * Utility for resizing and compressing images before saving into manuscript lore.
 * Prevents localStorage QuotaExceededError and improves rendering performance.
 */

export async function compressImageFile(
  file: File,
  maxDimension = 512,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const compressed = resizeAndExportCanvas(img, maxDimension, quality);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file.'));
    };

    img.src = objectUrl;
  });
}

export async function compressDataUrl(
  dataUrl: string,
  maxDimension = 512,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!dataUrl.startsWith('data:image/')) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      try {
        const compressed = resizeAndExportCanvas(img, maxDimension, quality);
        resolve(compressed);
      } catch (err) {
        // Fallback to original if canvas fails
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      // If image loading fails, return original dataUrl
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

function resizeAndExportCanvas(
  img: HTMLImageElement,
  maxDimension: number,
  quality: number
): string {
  let { width, height } = img;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  // Ensure minimum dimensions
  width = Math.max(1, width);
  height = Math.max(1, height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.');
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // White background in case of transparent PNGs converted to JPEG
  ctx.fillStyle = '#FAF6EE';
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(img, 0, 0, width, height);

  // Export as WebP if supported, otherwise JPEG
  try {
    return canvas.toDataURL('image/jpeg', quality);
  } catch (e) {
    return canvas.toDataURL('image/png');
  }
}
