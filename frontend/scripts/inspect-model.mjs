import { readFile } from 'node:fs/promises'
import * as ort from 'onnxruntime-web'

const model = await readFile(new URL('../public/models/best.onnx', import.meta.url))
const session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'] })
const outputs = await session.run({ images: new ort.Tensor('float32', new Float32Array(1 * 3 * 640 * 640), [1, 3, 640, 640]) })
console.log(JSON.stringify({ inputNames: session.inputNames, outputNames: session.outputNames, inputMetadata: session.inputMetadata, outputMetadata: session.outputMetadata, verifiedRunOutputShapes: Object.values(outputs).map((tensor) => tensor.dims) }, null, 2))
