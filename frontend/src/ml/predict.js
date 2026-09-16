import * as ort from 'onnxruntime-web'
import { MODEL_URL, MODEL_SIZE, PROTOTYPE_STRIDE, CLASS_NAMES } from './settings'
import { nms } from './nms'
import { loadImage, preprocess } from './preprocess'


// Add this line to bypass the local 25MB limit:
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

let sessionPromise
const now = () => performance.now()
const sigmoid = (value) => 1 / (1 + Math.exp(-value))
async function getSession() {
  if (!sessionPromise) sessionPromise = (async () => {
    try { return { session: await ort.InferenceSession.create(MODEL_URL, { executionProviders: ['webgpu'] }), provider: 'webgpu' } }
    catch (error) { console.info('WebGPU unavailable; using local WASM.', error); return { session: await ort.InferenceSession.create(MODEL_URL, { executionProviders: ['wasm'] }), provider: 'wasm' } }
  })()
  return sessionPromise
}
function parseDetections(tensor, settings) {
  const [batch, channels, count] = tensor.dims
  if (batch !== 1 || channels !== 43) throw new Error(`Unexpected detection output [${tensor.dims}]. Expected [1, 43, N].`)
  const result = [], data = tensor.data
  for (let i = 0; i < count; i++) {
    let classId = -1, score = -Infinity
    for (let c = 0; c < 7; c++) { const raw = data[(4 + c) * count + i], value = raw >= 0 && raw <= 1 ? raw : sigmoid(raw); if (value > score) { score = value; classId = c } }
    if (score < settings.confidenceThreshold) continue
    const cx = data[i], cy = data[count + i], w = data[2 * count + i], h = data[3 * count + i]
    const x1 = Math.max(0, cx - w / 2), y1 = Math.max(0, cy - h / 2), x2 = Math.min(MODEL_SIZE, cx + w / 2), y2 = Math.min(MODEL_SIZE, cy + h / 2)
    if (w <= 0 || h <= 0 || x2 <= x1 || y2 <= y1) continue
    const coefficients = new Float32Array(32)
    for (let m = 0; m < 32; m++) coefficients[m] = data[(11 + m) * count + i]
    result.push({ classId, score, x1, y1, x2, y2, area: (x2 - x1) * (y2 - y1), coefficients })
  }
  return result
}
function composeMasks(detections, prototypes, transform, threshold) {
  const [, channels, protoH, protoW] = prototypes.dims
  if (channels !== 32) throw new Error(`Unexpected prototype output [${prototypes.dims}]. Expected [1, 32, H, W].`)
  const { sourceWidth: width, sourceHeight: height, scale, padX, padY } = transform, ownerClass = new Int16Array(width * height), ownerScore = new Float32Array(width * height), proto = prototypes.data
  ownerClass.fill(-1)
  for (const d of detections) {
    const probabilities = new Float32Array(protoW * protoH)
    for (let py = 0; py < protoH; py++) for (let px = 0; px < protoW; px++) {
      const ix = (px + .5) * PROTOTYPE_STRIDE, iy = (py + .5) * PROTOTYPE_STRIDE
      if (ix < d.x1 || ix > d.x2 || iy < d.y1 || iy > d.y2) continue
      const location = py * protoW + px; let raw = 0
      for (let c = 0; c < 32; c++) raw += d.coefficients[c] * proto[c * protoW * protoH + location]
      probabilities[location] = sigmoid(raw)
    }
    const sx1 = Math.max(0, Math.floor((d.x1 - padX) / scale)), sy1 = Math.max(0, Math.floor((d.y1 - padY) / scale)), sx2 = Math.min(width, Math.ceil((d.x2 - padX) / scale)), sy2 = Math.min(height, Math.ceil((d.y2 - padY) / scale))
    for (let y = sy1; y < sy2; y++) { const py = Math.min(protoH - 1, Math.max(0, Math.floor((y * scale + padY) / PROTOTYPE_STRIDE))); for (let x = sx1; x < sx2; x++) { const px = Math.min(protoW - 1, Math.max(0, Math.floor((x * scale + padX) / PROTOTYPE_STRIDE))), probability = probabilities[py * protoW + px], pixel = y * width + x; if (probability >= threshold && probability > ownerScore[pixel]) { ownerScore[pixel] = probability; ownerClass[pixel] = d.classId } } }
  }
  const counts = new Uint32Array(7); for (const classId of ownerClass) if (classId >= 0) counts[classId]++
  const total = counts.reduce((sum, value) => sum + value, 0)
  return { ownerClass, width, height, total, composition: Array.from(counts, (pixels, classId) => ({ classId, pixels, percentage: total ? pixels * 100 / total : 0 })).filter((item) => item.pixels).sort((a, b) => b.percentage - a.percentage), protoH, protoW }
}
function renderOverlay(image, mask, detections, transform) {
  const canvas = document.createElement('canvas'); canvas.width = mask.width; canvas.height = mask.height; const context = canvas.getContext('2d'); context.drawImage(image, 0, 0, mask.width, mask.height)
  const pixels = context.getImageData(0, 0, mask.width, mask.height), colors = [[255,91,91],[255,200,87],[101,214,173],[93,181,255],[197,140,255],[170,183,196],[255,139,184]]
  for (let i = 0; i < mask.ownerClass.length; i++) { const classId = mask.ownerClass[i]; if (classId < 0) continue; const at = i * 4, color = colors[classId]; pixels.data[at] = pixels.data[at] * .48 + color[0] * .52; pixels.data[at + 1] = pixels.data[at + 1] * .48 + color[1] * .52; pixels.data[at + 2] = pixels.data[at + 2] * .48 + color[2] * .52 }
  context.putImageData(pixels, 0, 0); context.strokeStyle = '#fff'; context.fillStyle = '#fff'; context.lineWidth = Math.max(2, Math.min(mask.width, mask.height) / 300); context.font = `${Math.max(12, Math.min(mask.width, mask.height) / 35)}px sans-serif`
  for (const d of detections) { const x = Math.max(0, (d.x1 - transform.padX) / transform.scale), y = Math.max(0, (d.y1 - transform.padY) / transform.scale), w = (d.x2 - d.x1) / transform.scale, h = (d.y2 - d.y1) / transform.scale; context.strokeRect(x, y, w, h); context.fillText(`${CLASS_NAMES[d.classId]} ${(d.score * 100).toFixed(0)}%`, x + 3, Math.max(15, y - 5)) }
  return canvas.toDataURL('image/jpeg', .92)
}
export async function predict(imageUrl, settings) {
  const started = now(), image = await loadImage(imageUrl), modelStart = now(), { session, provider } = await getSession(), modelLoad = now() - modelStart
  const prepStart = now(), prepared = preprocess(image), preprocessing = now() - prepStart, inferenceStart = now(), outputs = await session.run({ [session.inputNames[0]]: prepared.tensor }), inference = now() - inferenceStart
  const postStart = now(), tensors = session.outputNames.map((name) => outputs[name]), detectionTensor = tensors.find((tensor) => tensor.dims.length === 3 && tensor.dims[1] === 43), prototypeTensor = tensors.find((tensor) => tensor.dims.length === 4 && tensor.dims[1] === 32)
  if (!detectionTensor || !prototypeTensor) throw new Error(`Could not identify expected YOLO outputs: ${tensors.map((tensor) => `[${tensor.dims}]`).join(', ')}`)
  const confidencePassed = parseDetections(detectionTensor, settings), detections = nms(confidencePassed, settings.nmsIouThreshold), mask = composeMasks(detections, prototypeTensor, prepared.transform, settings.maskThreshold), overlayUrl = renderOverlay(image, mask, detections, prepared.transform), postprocess = now() - postStart
  return { overlayUrl, composition: mask.composition, provider, timings: { modelLoad, preprocess: preprocessing, inference, postprocess, total: now() - started }, debug: { input: session.inputMetadata, outputShapes: tensors.map((t) => t.dims), provider, confidencePassed: confidencePassed.length, detectionsAfterNms: detections.length, detectedClasses: [...new Set(detections.map((d) => CLASS_NAMES[d.classId]))], prototypeMask: [mask.protoH, mask.protoW], sourceImage: [mask.width, mask.height], detectedMaterialPixels: mask.total, settings } }
}
