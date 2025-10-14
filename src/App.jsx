import { useState } from 'react'
import GLBViewer from './components/GLBViewer'
import './assets/styles/App.css'

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

  const handleDragEnter = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
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

    const nextTarget = event.relatedTarget
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return
    }

    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    processFile(file)
  }

  return (
    <div
      className={`app-container ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
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
            {fileName || 'Pilih File'}
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
        <GLBViewer modelUrl={modelUrl} />
      ) : (
        <div className={`placeholder ${isDragging ? 'drag-active' : ''}`}>
          <p>
            Drop file GLB atau GLTF di sini
            <br />atau klik tombol di atas
          </p>
        </div>
      )}
    </div>
  )
}

export default App
