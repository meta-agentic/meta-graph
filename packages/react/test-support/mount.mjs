// Component-test harness: bundles a .jsx component with esbuild (React included, so there
// is one copy) and mounts it in jsdom. node:test only, no test framework.
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Loads the default exports of the given files (relative to the package root) as W0, W1, … */
export async function loadComponents(files) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { pretendToBeVisual: true })
  const { window } = dom
  globalThis.window = window
  globalThis.document = window.document
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  globalThis.ResizeObserver = class { observe() {} disconnect() {} }
  const entry = [
    "export { default as React } from 'react'",
    "export { createRoot } from 'react-dom/client'",
    "export { act } from 'react-dom/test-utils'",
    ...files.map((f, i) => `export { default as W${i} } from ${JSON.stringify(path.join(pkg, f))}`),
  ].join('\n')
  const out = await build({
    stdin: { contents: entry, resolveDir: pkg, loader: 'js' },
    bundle: true, write: false, format: 'esm', platform: 'node', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"test"' },
    loader: { '.jsx': 'jsx' },
  })
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'graph-react-test-')), 'bundle.mjs')
  fs.writeFileSync(file, out.outputFiles[0].text)
  // React's scheduler would hold a ref'd MessagePort open and the run would never exit.
  globalThis.MessageChannel = class {
    constructor() {
      const ch = this
      this.port1 = { onmessage: null }
      this.port2 = { postMessage: () => setImmediate(() => ch.port1.onmessage?.({})) }
    }
  }
  const mod = await import(pathToFileURL(file).href)
  return { ...mod, close: () => window.close() }
}
