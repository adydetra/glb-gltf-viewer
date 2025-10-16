// App.jsx
import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import Viewer from './components/Viewer'
import './assets/styles/App.css'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import JSZip from 'jszip'
import gsap from 'gsap'

function App() {
  const [modelUrl, setModelUrl] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [fileMap, setFileMap] = useState(null)

  // Stabilizer untuk dragleave
  const dragCounter = useRef(0)

  // GSAP refs
  const titleRef = useRef(null)
  const controlsRef = useRef(null)
  const placeholderRef = useRef(null)

  // === Fade-in: title + container tombol (bersamaan) ===
  useLayoutEffect(() => {
    const targets = [titleRef.current, controlsRef.current].filter(Boolean)
    gsap.set(targets, { opacity: 0 })
    gsap.to(targets, {
      opacity: 1,
      duration: 0.6,
      ease: 'power1.out',
      delay: 0.05,
      onComplete() {
        gsap.set(targets, { clearProps: 'opacity' })
      }
    })
  }, [])

  // === Fade-in: UI drag area (placeholder) saat tidak ada model ===
  useEffect(() => {
    if (!modelUrl && placeholderRef.current) {
      gsap.set(placeholderRef.current, { opacity: 0 })
      gsap.to(placeholderRef.current, {
        opacity: 1,
        duration: 0.45,
        ease: 'power1.out',
        onComplete() {
          gsap.set(placeholderRef.current, { clearProps: 'opacity' })
        }
      })
    }
  }, [modelUrl])

  const cleanupUrls = (map) => {
    if (map) for (const url of map.values()) URL.revokeObjectURL(url)
  }

  // === Core loader: bisa handle GLB single OR GLTF folder ===
  const processFiles = (files, isGLB = false) => {
    if (!files || files.length === 0) return

    if (modelUrl) URL.revokeObjectURL(modelUrl)
    cleanupUrls(fileMap)
    setFileMap(null)

    const filesArr = Array.from(files)

    // 1) Kalau dipaksa GLB (via tombol), langsung ambil GLB pertama
    if (isGLB) {
      const glbFile = filesArr.find(f => f.name.toLowerCase().endsWith('.glb'))
      if (glbFile) {
        const url = URL.createObjectURL(glbFile)
        setModelUrl(url)
        setFileName(glbFile.name)
        return
      }
    }

    // 2) Jika ada .gltf -> treat sebagai folder GLTF
    const rootGLTF = filesArr.find(f => f.name.toLowerCase().endsWith('.gltf'))
    if (rootGLTF) {
      const map = new Map()
      for (const f of filesArr) {
        const url = URL.createObjectURL(f)
        const relativePath = f.webkitRelativePath || f.name

        const keys = [
          relativePath, relativePath.toLowerCase(),
          f.name, f.name.toLowerCase(),
          './' + relativePath, './' + relativePath.toLowerCase()
        ]
        keys.forEach(k => { if (!map.has(k)) map.set(k, url) })

        try {
          const decoded = decodeURIComponent(relativePath)
          map.set(decoded, url)
          map.set(decoded.toLowerCase(), url)
          map.set('./' + decoded, url)
          map.set('./' + decoded.toLowerCase(), url)
        } catch {}
      }

      setFileMap(map)
      const rootUrl =
        map.get(rootGLTF.name) ||
        map.get(rootGLTF.name.toLowerCase()) ||
        map.get(rootGLTF.webkitRelativePath) ||
        map.get((rootGLTF.webkitRelativePath || '').toLowerCase())

      setModelUrl(rootUrl || URL.createObjectURL(rootGLTF))
      setFileName(rootGLTF.name)
      return
    }

    // 3) (Perbaikan utama) Jika tidak ada .gltf tapi ADA .glb -> treat sebagai GLB single
    const glbFallback = filesArr.find(f => f.name.toLowerCase().endsWith('.glb'))
    if (glbFallback) {
      const url = URL.createObjectURL(glbFallback)
      setModelUrl(url)
      setFileName(glbFallback.name)
      return
    }

    // 4) Tidak ada yang bisa diproses
    console.warn('No .gltf or .glb found in dropped files.')
  }

  // ===== ZIP → GLTF/GLB fallback (Firefox/Safari) =====
  const extToMime = (name) => {
    const ext = name.split('.').pop().toLowerCase()
    switch (ext) {
      case 'gltf': return 'model/gltf+json'
      case 'bin':  return 'application/octet-stream'
      case 'glb':  return 'model/gltf-binary'
      case 'png':  return 'image/png'
      case 'jpg':
      case 'jpeg': return 'image/jpeg'
      case 'webp': return 'image/webp'
      case 'ktx2': return 'image/ktx2'
      default:     return 'application/octet-stream'
    }
  }

  const processZip = async (zipFile) => {
    try {
      const zip = await JSZip.loadAsync(zipFile)
      const files = []
      let hasGLTF = false
      let glbBlob = null
      let glbName = ''

      const entries = Object.values(zip.files)
      for (const entry of entries) {
        if (entry.dir) continue
        const blob = await entry.async('blob')
        const mime = extToMime(entry.name)
        const base = entry.name.split('/').pop()

        // collect GLTF pack
        if (entry.name.toLowerCase().endsWith('.gltf')) hasGLTF = true

        // keep GLB single if present
        if (entry.name.toLowerCase().endsWith('.glb')) {
          glbBlob = blob
          glbName = base
        }

        const file = new File([blob], base, { type: mime })
        Object.defineProperty(file, 'webkitRelativePath', {
          value: entry.name, writable: false
        })
        files.push(file)
      }

      if (hasGLTF) {
        processFiles(files, false)
        return
      }

      if (glbBlob) {
        // Support ZIP berisi single .glb
        const glbFile = new File([glbBlob], glbName || 'model.glb', { type: 'model/gltf-binary' })
        const url = URL.createObjectURL(glbFile)
        setModelUrl(url)
        setFileName(glbFile.name)
        return
      }

      console.warn('ZIP has no .gltf or .glb file.')
    } catch (err) {
      console.error('Failed to read ZIP:', err)
    }
  }

  // ===== input handlers =====
  const handleGLBUpload = (e) => processFiles(e.target.files, true)
  const handleGLTFUpload = (e) => processFiles(e.target.files, false)
  const handleZipUpload  = (e) => {
    const f = e.target.files?.[0]
    if (f && /\.zip$/i.test(f.name)) processZip(f)
  }

  const handleReset = () => {
    if (modelUrl) URL.revokeObjectURL(modelUrl)
    cleanupUrls(fileMap)
    setModelUrl(null)
    setFileName('')
    setFileMap(null)
  }

  // ===== Drag & Drop (tanpa popup overlay) =====
  const handleDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer?.types?.includes?.('Files')) setIsDragging(true)
  }
  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) setIsDragging(false)
  }
  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)

    const items = e.dataTransfer.items
    const files = []
    let zipHandled = false

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (it.kind !== 'file') continue
        const file = it.getAsFile()

        // ZIP langsung proses
        if (file && /\.zip$/i.test(file.name)) {
          await processZip(file)
          zipHandled = true
          continue
        }

        // Folder traversal (Chromium/WebKit)
        const entry = it.webkitGetAsEntry && it.webkitGetAsEntry()
        if (entry && (entry.isDirectory || entry.isFile)) {
          await traverseFileTree(entry, '', files)
        } else if (file) {
          files.push(file)
        }
      }
    }

    if (zipHandled) return

    if (files.length === 0) {
      // Fallback ke fileList (mis. Firefox)
      const fileList = e.dataTransfer.files
      if (fileList?.[0] && /\.zip$/i.test(fileList[0].name)) {
        await processZip(fileList[0])
        return
      }
      processFiles(fileList)
    } else {
      processFiles(files)
    }
  }

  // Traversal untuk DnD folder (webkitGetAsEntry)
  const traverseFileTree = async (item, path, files) => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          Object.defineProperty(file, 'webkitRelativePath', {
            value: path + file.name, writable: false
          })
          files.push(file); resolve()
        })
      } else if (item.isDirectory) {
        const dirReader = item.createReader()
        const entries = []
        const readAll = () => {
          dirReader.readEntries(async (batch) => {
            if (!batch.length) {
              for (const entry of entries) {
                await traverseFileTree(entry, path + item.name + '/', files)
              }
              resolve()
            } else {
              entries.push(...batch); readAll()
            }
          })
        }
        readAll()
      } else resolve()
    })
  }

  // ===== Export =====
  const handleExport = async (config) => {
    if (!modelUrl) return
    try {
      const loader = new GLTFLoader()
      if (fileMap) {
        loader.manager.setURLModifier((url) => {
          let normalized = url.replace(/^\.?\/?/, '')
          if (fileMap.has(normalized)) return fileMap.get(normalized)
          if (fileMap.has(normalized.toLowerCase())) return fileMap.get(normalized.toLowerCase())
          if (fileMap.has('./' + normalized)) return fileMap.get('./' + normalized)
          try {
            const decoded = decodeURIComponent(normalized)
            if (fileMap.has(decoded)) return fileMap.get(decoded)
            if (fileMap.has(decoded.toLowerCase())) return fileMap.get(decoded.toLowerCase())
          } catch {}
          const basename = normalized.split('/').pop()
          if (fileMap.has(basename)) return fileMap.get(basename)
          if (fileMap.has(basename.toLowerCase())) return fileMap.get(basename.toLowerCase())
          for (const [key, value] of fileMap.entries()) {
            if (
              key.endsWith('/' + normalized) ||
              key.toLowerCase().endsWith('/' + normalized.toLowerCase()) ||
              key.endsWith('/' + basename) ||
              key.toLowerCase().endsWith('/' + basename.toLowerCase())
            ) return value
          }
          return url
        })
      }

      loader.load(
        modelUrl,
        (gltf) => {
          const scene = gltf.scene.clone()
          scene.traverse((child) => {
            if (child.isMesh) {
              child.material = child.material.clone()
              child.material.color = new THREE.Color(config.color)
            }
          })
          scene.scale.set(config.scale, config.scale, config.scale)

          const exporter = new GLTFExporter()
          exporter.parse(
            scene,
            (result) => {
              const blob = new Blob([result], { type: 'application/octet-stream' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${fileName.replace(/\.(glb|gltf)$/i, '')}_modified.glb`
              link.click()
              URL.revokeObjectURL(url)
            },
            (error) => console.error('Export error:', error),
            { binary: true }
          )
        },
        undefined,
        (error) => console.error('Load error:', error)
      )
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div
      className="app-container"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="header">
        <h1 ref={titleRef}>GLB/GLTF Viewer</h1>
        <div className="controls" ref={controlsRef}>
          {/* GLB */}
          <label htmlFor="glb-upload" className="upload-btn">Upload GLB</label>
          <input
            id="glb-upload"
            type="file"
            accept=".glb"
            onChange={handleGLBUpload}
            style={{ display: 'none' }}
          />

          {/* Divider (desktop) */}
          <span className="controls-divider" role="separator" aria-orientation="vertical" />

          {/* GLTF Folder */}
          <label htmlFor="gltf-upload" className="upload-btn" title="Chromium/WebKit only">
            Upload GLTF Folder
          </label>
          <input
            id="gltf-upload"
            type="file"
            multiple
            webkitdirectory="true"
            directory="true"
            accept=".gltf,.bin,.png,.jpg,.jpeg,.webp,.ktx2"
            onChange={handleGLTFUpload}
            style={{ display: 'none' }}
          />

          {/* GLTF Zip (cross-browser) */}
          <label htmlFor="zip-upload" className="upload-btn">Upload GLTF (.zip)</label>
          <input
            id="zip-upload"
            type="file"
            accept=".zip,application/zip"
            onChange={handleZipUpload}
            style={{ display: 'none' }}
          />

          {modelUrl && (
            <button onClick={handleReset} className="reset-btn">Reset</button>
          )}
        </div>
      </header>

      {modelUrl ? (
        <Viewer modelUrl={modelUrl} fileMap={fileMap} onExport={handleExport} />
      ) : (
        <div
          ref={placeholderRef}
          className={`placeholder ${isDragging ? 'drag-active' : ''}`}
          onClick={() => document.getElementById('glb-upload')?.click()}
          title="Klik untuk pilih .glb, atau gunakan tombol upload di atas"
        >
          <svg className="upload-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p>Drop .glb / folder GLTF / .zip here</p>
          <span>or use the buttons above</span>
        </div>
      )}
    </div>
  )
}

export default App
