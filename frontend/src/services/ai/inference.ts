import * as ort from "onnxruntime-web/wasm";
import { preprocessImage } from "./preprocessing";
import { postprocess, generateOverlay } from "./postprocessing";
import type { Detection } from "./postprocessing";

// Configure WASM paths and single-threaded execution (avoids SharedArrayBuffer & COOP/COEP requirements)
ort.env.wasm.wasmPaths = {
  wasm: "/wasm/ort-wasm-simd-threaded.wasm",
};
ort.env.wasm.numThreads = 1;

let session: ort.InferenceSession | null = null;
let loadPromise: Promise<ort.InferenceSession> | null = null;

export async function loadModel(): Promise<ort.InferenceSession> {
  if (session) return session;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    console.log("[SahiRate AI] Loading YOLO11 ONNX model from /models/best.onnx...");
    const startTime = performance.now();
    try {
      session = await ort.InferenceSession.create("/models/best.onnx", {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      const elapsed = Math.round(performance.now() - startTime);
      console.log(
        `[SahiRate AI] YOLO11 model loaded in ${elapsed}ms. Inputs: [${session.inputNames.join(", ")}], Outputs: [${session.outputNames.join(", ")}]`
      );
      return session;
    } catch (error) {
      console.error("[SahiRate AI] Failed to load YOLO11 model:", error);
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

export interface ClassifiedMaterial {
  material: string;
  materialId: string;
  confidence: number;
  confidencePercent: number;
}

export interface MaterialClassificationResult extends ClassifiedMaterial {
  otherMaterials: ClassifiedMaterial[];
  detections: Detection[];
  overlayUri?: string;
}

let isRunning = false;
let runQueue: (() => void)[] = [];

async function acquireRunLock() {
    if (!isRunning) {
        isRunning = true;
        return;
    }
    await new Promise<void>(resolve => runQueue.push(resolve));
}

function releaseRunLock() {
    if (runQueue.length > 0) {
        const next = runQueue.shift();
        next?.();
    } else {
        isRunning = false;
    }
}

export async function classifyMaterial(
  imageBlob: Blob
): Promise<MaterialClassificationResult | null> {
  const currentSession = await loadModel();

  console.log("[SahiRate AI] Starting classification for image blob of size:", imageBlob.size);
  const t0 = performance.now();

  const { float32Data, letterbox } = await preprocessImage(imageBlob);
  const t1 = performance.now();
  console.log(`[SahiRate AI] Preprocessing complete in ${Math.round(t1 - t0)}ms. Letterbox scale: ${letterbox.scale.toFixed(3)}`);

  const inputTensor = new ort.Tensor("float32", float32Data, [1, 3, 640, 640]);
  const feeds: Record<string, ort.Tensor> = { [currentSession.inputNames[0]]: inputTensor };

  let results: ort.InferenceSession.OnnxValueMapType;
  await acquireRunLock();
  try {
    results = await currentSession.run(feeds);
  } catch (inferErr) {
    console.error("[SahiRate AI] Session run failed:", inferErr);
    throw inferErr;
  } finally {
    releaseRunLock();
  }
  const t2 = performance.now();
  console.log(`[SahiRate AI] Inference completed in ${Math.round(t2 - t1)}ms.`);

  const output0 = results[currentSession.outputNames[0]];
  const output1 = currentSession.outputNames.length > 1 ? results[currentSession.outputNames[1]] : undefined;

  const detections = postprocess(
    output0.data as Float32Array,
    output1?.data as Float32Array | undefined,
    0.25,
    0.45
  );
  const t3 = performance.now();
  console.log(`[SahiRate AI] Postprocessing complete in ${Math.round(t3 - t2)}ms. Found ${detections.length} detections.`);

  try { inputTensor.dispose?.(); } catch {}
  for (const key of Object.keys(results)) {
    try { results[key]?.dispose?.(); } catch {}
  }

  if (detections.length === 0) {
    return null;
  }

  // Group detections by class name to find the best confidence per class
  const grouped = new Map<string, Detection>();
  for (const det of detections) {
    const existing = grouped.get(det.className);
    if (!existing || det.confidence > existing.confidence) {
      grouped.set(det.className, det);
    }
  }

  // Sort groups by confidence descending
  const sortedClasses = Array.from(grouped.values()).sort((a, b) => b.confidence - a.confidence);

  const mapMaterial = (className: string) => {
    let id = className.toUpperCase();
    if (id === "BATTARY") id = "BATTERY";
    return id;
  };

  const mapToResult = (det: Detection): ClassifiedMaterial => ({
    material: det.className,
    materialId: mapMaterial(det.className),
    confidence: det.confidence,
    confidencePercent: Math.round(det.confidence * 100),
  });

  const bestDetection = sortedClasses[0];
  const primaryResult = mapToResult(bestDetection);
  const otherMaterials = sortedClasses.slice(1).map(mapToResult);

  console.log("[SahiRate AI] Detections:");
  console.log(`${primaryResult.materialId}: ${primaryResult.confidence.toFixed(2)}`);
  for (const m of otherMaterials) {
    console.log(`${m.materialId}: ${m.confidence.toFixed(2)}`);
  }

  // Generate visual segmentation overlay
  let overlayUri: string | undefined;
  try {
    overlayUri = await generateOverlay(imageBlob, detections, letterbox);
  } catch (overlayErr) {
    console.warn("[SahiRate AI] Overlay generation skipped:", overlayErr);
  }

  return {
    ...primaryResult,
    otherMaterials,
    detections,
    overlayUri,
  };
}
