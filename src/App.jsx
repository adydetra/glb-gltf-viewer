import { useState } from 'react'
import GLBViewer from './components/GLBViewer'
import './assets/styles/App.css'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

function App() {
  const [modelUrl, setModelUrl] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file) => {
    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['glb', 'gltf'].includes(extension)) {
      return
    }

    if (modelUrl) {
      URL.revokeObjectURL(modelUrl)
    }

    const url = URL.createObjectURL(file)
    setModelUrl(url)
    setFileName(file.name)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    processFile(file)
  }

  const handleReset = () => {
    if (modelUrl) {
      URL.revokeObjectURL(modelUrl)
    }
    setModelUrl(null)
    setFileName('')
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    processFile(file)
  }

  const handleExport = async (config) => {
    if (!modelUrl) return

    try {
      const loader = new GLTFLoader()
      
      loader.load(modelUrl, (gltf) => {
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
          (error) => {
            console.error('Export error:', error)
          },
          { binary: true }
        )
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div
      className="app-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && modelUrl && (
        <div className="drop-overlay">
          <p>Drop file GLB atau GLTF untuk mengganti model</p>
        </div>
      )}
      <header className="header">
        <h1>GLB/GLTF Viewer</h1>
        <div className="controls">
          <label htmlFor="file-upload" className="upload-btn">
            {fileName || 'Choose File'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          {modelUrl && (
            <button onClick={handleReset} className="reset-btn">
              Reset
            </button>
          )}
        </div>
      </header>

      {modelUrl ? (
        <GLBViewer modelUrl={modelUrl} onExport={handleExport} />
      ) : (
        <label htmlFor="file-upload" className={`placeholder ${isDragging ? 'drag-active' : ''}`}>
          <svg className="upload-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p>Drop GLB or GLTF file here</p>
          <span>or click the button above</span>
        </label>
      )}
    </div>
  )
}

export default App
