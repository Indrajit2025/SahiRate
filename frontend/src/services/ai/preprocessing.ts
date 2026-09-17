export interface LetterboxInfo {
  scale: number;
  dx: number;
  dy: number;
  originalWidth: number;
  originalHeight: number;
  targetSize: number;
}

export interface PreprocessResult {
  float32Data: Float32Array;
  letterbox: LetterboxInfo;
}

async function loadImage(blob: Blob): Promise<{ img: ImageBitmap | HTMLImageElement, url?: string }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      return { img: bitmap };
    } catch {
      // Fallback if createImageBitmap fails on specific blob format
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      // Do not revoke here, let the caller revoke after drawing
      resolve({ img, url });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image from blob: " + e));
    };
    img.src = url;
  });
}

export async function preprocessImage(imageBlob: Blob): Promise<PreprocessResult> {
  const { img, url } = await loadImage(imageBlob);
  const origW = img.width;
  const origH = img.height;
  const TARGET_SIZE = 640;

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
  if (!ctx) {
    if (url) URL.revokeObjectURL(url);
    if ("close" in img && typeof img.close === "function") img.close();
    throw new Error("Failed to get 2D context for image preprocessing");
  }

  // Letterbox resize calculation
  const scale = Math.min(TARGET_SIZE / origW, TARGET_SIZE / origH);
  const nw = origW * scale;
  const nh = origH * scale;
  const dx = (TARGET_SIZE - nw) / 2;
  const dy = (TARGET_SIZE - nh) / 2;

  // Fill with gray (114, 114, 114) typical for YOLO letterbox
  ctx.fillStyle = "rgb(114, 114, 114)";
  ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
  ctx.drawImage(img, dx, dy, nw, nh);

  // Now it is completely safe to clean up
  if (url) {
    URL.revokeObjectURL(url);
  }
  if ("close" in img && typeof img.close === "function") {
    img.close();
  }

  const imgData = ctx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE);
  const data = imgData.data; // RGBA

  // Convert HWC to CHW and normalize to [0, 1]
  const float32Data = new Float32Array(3 * TARGET_SIZE * TARGET_SIZE);
  const stride = TARGET_SIZE * TARGET_SIZE;

  for (let i = 0; i < stride; i++) {
    float32Data[i] = data[i * 4] / 255.0; // R
    float32Data[stride + i] = data[i * 4 + 1] / 255.0; // G
    float32Data[2 * stride + i] = data[i * 4 + 2] / 255.0; // B
  }

  return {
    float32Data,
    letterbox: {
      scale,
      dx,
      dy,
      originalWidth: origW,
      originalHeight: origH,
      targetSize: TARGET_SIZE,
    },
  };
}
