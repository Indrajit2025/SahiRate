import { CLASS_COLORS } from "./colors";
import type { LetterboxInfo } from "./preprocessing";

export interface Detection {
  classId: number;
  className: string;
  confidence: number;
  box: [number, number, number, number]; // [x_min, y_min, width, height]
  maskData?: Float32Array; // 160x160 mask probabilities
}

export function postprocess(
  output0Data: Float32Array,
  output1Data: Float32Array | undefined,

  confThreshold = 0.25,
  iouThreshold = 0.45
): Detection[] {
  // Output0 shape: [1, 43, 8400] (4 coords + 7 classes + 32 mask coeffs)
  const numBoxes = 8400;
  const numClasses = 7;
  const maskChannels = 32;

  // Exact YOLO11 model class order from training metadata:
  // 0: Battary, 1: Display, 2: Motor, 3: PCB, 4: Wire, 5: metal, 6: plastic
  const CLASSES = ["BATTERY", "DISPLAY", "MOTOR", "PCB", "WIRE", "METAL", "PLASTIC"];

  let detections: Detection[] = [];

  for (let i = 0; i < numBoxes; i++) {
    const cx = output0Data[0 * numBoxes + i];
    const cy = output0Data[1 * numBoxes + i];
    const w = output0Data[2 * numBoxes + i];
    const h = output0Data[3 * numBoxes + i];

    let maxConf = 0;
    let maxClassId = -1;

    for (let c = 0; c < numClasses; c++) {
      const conf = output0Data[(4 + c) * numBoxes + i];
      if (conf > maxConf) {
        maxConf = conf;
        maxClassId = c;
      }
    }

    if (maxConf >= confThreshold) {
      const x_min = cx - w / 2;
      const y_min = cy - h / 2;
      
      let maskCoeffs: Float32Array | undefined;
      if (output1Data) {
        maskCoeffs = new Float32Array(maskChannels);
        for (let m = 0; m < maskChannels; m++) {
          maskCoeffs[m] = output0Data[(4 + numClasses + m) * numBoxes + i];
        }
      }

      detections.push({
        classId: maxClassId,
        className: CLASSES[maxClassId],
        confidence: maxConf,
        box: [x_min, y_min, w, h],
        maskData: maskCoeffs
      });
    }
  }

  // NMS
  detections = nonMaxSuppression(detections, iouThreshold);

  // Process masks
  if (output1Data && detections.length > 0) {
    const protoMasks = output1Data; // Shape [1, 32, 160, 160]
    
    for (const det of detections) {
      if (!det.maskData) continue;
      
      const finalMask = new Float32Array(160 * 160);
      const coeffs = det.maskData;
      
      for (let y = 0; y < 160; y++) {
        for (let x = 0; x < 160; x++) {
          let val = 0;
          for (let c = 0; c < maskChannels; c++) {
            val += coeffs[c] * protoMasks[c * 160 * 160 + y * 160 + x];
          }
          finalMask[y * 160 + x] = sigmoid(val) > 0.5 ? 1 : 0;
        }
      }
      det.maskData = finalMask;
    }
  }

  return detections;
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function nonMaxSuppression(detections: Detection[], iouThreshold: number): Detection[] {
  detections.sort((a, b) => b.confidence - a.confidence);
  const selected: Detection[] = [];

  for (const det of detections) {
    let keep = true;
    for (const other of selected) {
      if (det.classId === other.classId) {
        const iou = calculateIoU(det.box, other.box);
        if (iou > iouThreshold) {
          keep = false;
          break;
        }
      }
    }
    if (keep) {
      selected.push(det);
    }
  }

  return selected;
}

function calculateIoU(box1: [number, number, number, number], box2: [number, number, number, number]) {
  const [x1, y1, w1, h1] = box1;
  const [x2, y2, w2, h2] = box2;

  const x_left = Math.max(x1, x2);
  const y_top = Math.max(y1, y2);
  const x_right = Math.min(x1 + w1, x2 + w2);
  const y_bottom = Math.min(y1 + h1, y2 + h2);

  if (x_right < x_left || y_bottom < y_top) return 0;

  const intersection = (x_right - x_left) * (y_bottom - y_top);
  const area1 = w1 * h1;
  const area2 = w2 * h2;

  return intersection / (area1 + area2 - intersection);
}

export async function generateOverlay(
  imageBlob: Blob,
  detections: Detection[],
  letterbox: LetterboxInfo
): Promise<string | undefined> {
  if (detections.length === 0) return undefined;

  let imgUrl: string | undefined;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      imgUrl = URL.createObjectURL(imageBlob);
      el.onload = () => {
        resolve(el);
      };
      el.onerror = (e) => {
        if (imgUrl) URL.revokeObjectURL(imgUrl);
        reject(e);
      };
      el.src = imgUrl;
    });

    const origW = letterbox.originalWidth || img.naturalWidth || img.width;
    const origH = letterbox.originalHeight || img.naturalHeight || img.height;

    const canvas = document.createElement("canvas");
    canvas.width = origW;
    canvas.height = origH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      return undefined;
    }

    // Draw base original photo
    ctx.drawImage(img, 0, 0, origW, origH);
    
    if (imgUrl) {
      URL.revokeObjectURL(imgUrl);
      imgUrl = undefined;
    }

    // Draw instance segmentation masks if available
    const protoW = 160;
    const protoH = 160;
    const protoDx = letterbox.dx / 4;
    const protoDy = letterbox.dy / 4;
    const protoNw = (origW * letterbox.scale) / 4;
    const protoNh = (origH * letterbox.scale) / 4;

    for (const det of detections) {
      const color = CLASS_COLORS[det.className] || {
        stroke: "#10b981",
        fill: "rgba(16, 185, 129, 0.35)",
        rgb: [16, 185, 129],
      };

      if (det.maskData) {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = protoW;
        maskCanvas.height = protoH;
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          const imgData = maskCtx.createImageData(protoW, protoH);
          const buf = imgData.data;
          const [r, g, b] = color.rgb;

          for (let i = 0; i < protoW * protoH; i++) {
            if (det.maskData[i] === 1) {
              buf[i * 4] = r;
              buf[i * 4 + 1] = g;
              buf[i * 4 + 2] = b;
              buf[i * 4 + 3] = 90; // opacity
            }
          }
          maskCtx.putImageData(imgData, 0, 0);

          // Project back to original image space
          ctx.drawImage(
            maskCanvas,
            protoDx,
            protoDy,
            protoNw,
            protoNh,
            0,
            0,
            origW,
            origH
          );
        }
      }

      // Draw bounding box
      const rx = Math.max(0, (det.box[0] - letterbox.dx) / letterbox.scale);
      const ry = Math.max(0, (det.box[1] - letterbox.dy) / letterbox.scale);
      const rw = det.box[2] / letterbox.scale;
      const rh = det.box[3] / letterbox.scale;

      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, rw, rh);

      // Label
      const pct = Math.round(det.confidence * 100);
      const label = `${det.className} ${pct}%`;
      ctx.fillStyle = color.stroke;
      ctx.font = "bold 14px sans-serif";
      const tm = ctx.measureText(label);
      ctx.fillRect(rx, ry - 20, tm.width + 10, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, rx + 5, ry - 5);
    }

    return canvas.toDataURL("image/jpeg", 0.7);
  } catch (err) {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    console.error("Overlay generation failed", err);
    return undefined;
  }
}
