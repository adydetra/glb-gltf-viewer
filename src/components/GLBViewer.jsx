import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'

function Model({ url, color, scale }) {
  const meshRef = useRef()
  const { scene } = useGLTF(url)

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone()
          child.material.color = new THREE.Color(color)
        }
      })
    }
  }, [color])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <Center>
      <primitive ref={meshRef} object={scene} scale={scale} />
    </Center>
  )
}

function GLBViewer({ modelUrl, onExport }) {
  const [color, setColor] = useState('#ffffff')
  const [scale, setScale] = useState(1)
  const [showControls, setShowControls] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640
  const cameraDistance = isMobile ? 10 : 7
  const cameraFov = isMobile ? 58 : 55

  const handleExport = () => {
    onExport({ color, scale })
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: cameraFov }}
        style={{ background: '#1a1a1a' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          
          {modelUrl && <Model url={modelUrl} color={color} scale={scale} />}
          
          <Environment preset="city" />
          <OrbitControls
            enableZoom
            enablePan
            minDistance={isMobile ? 2 : 1.5}
            maxDistance={isMobile ? 28 : 22}
          />
        </Suspense>
      </Canvas>

      <button 
        className="controls-toggle"
        onClick={() => setShowControls(!showControls)}
        title="Toggle Controls"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"/>
        </svg>
      </button>

      {showControls && (
        <div className="config-panel">
          <div className="config-header">
            <h3>Configuration</h3>
            <button 
              className="close-btn"
              onClick={() => setShowControls(false)}
            >
              ×
            </button>
          </div>

          <div className="config-group">
            <label>
              <span>Color</span>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-input"
                />
                <span className="color-value">{color}</span>
              </div>
            </label>
          </div>

          <div className="config-group">
            <label>
              <span>Scale</span>
              <div className="scale-controls">
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="scale-slider"
                />
                <span className="scale-value">{scale.toFixed(1)}x</span>
              </div>
            </label>
          </div>

          <div className="config-actions">
            <button 
              className="preset-btn"
              onClick={() => { setColor('#ffffff'); setScale(1); }}
            >
              Reset
            </button>
            <button 
              className="export-btn"
              onClick={handleExport}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download GLB
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GLBViewer
