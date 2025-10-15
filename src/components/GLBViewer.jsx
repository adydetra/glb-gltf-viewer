import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center, TransformControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import * as THREE from 'three'

function Model({ url, color, scale, showTransform, onPositionChange }) {
  const meshRef = useRef()
  const transformRef = useRef()
  const { scene } = useGLTF(url)
  const [autoRotate, setAutoRotate] = useState(true)

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

  useEffect(() => {
    if (transformRef.current && showTransform) {
      const controls = transformRef.current
      const handleDragging = (event) => {
        setAutoRotate(!event.value)
      }
      const handleChange = () => {
        if (onPositionChange && meshRef.current) {
          onPositionChange(meshRef.current.position)
        }
      }
      controls.addEventListener('dragging-changed', handleDragging)
      controls.addEventListener('change', handleChange)
      return () => {
        controls.removeEventListener('dragging-changed', handleDragging)
        controls.removeEventListener('change', handleChange)
      }
    }
  }, [showTransform, onPositionChange])

  useFrame(() => {
    if (meshRef.current && autoRotate && !showTransform) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <Center>
      <group ref={meshRef}>
        <primitive object={scene} scale={scale} />
      </group>
      {showTransform && meshRef.current && (
        <TransformControls ref={transformRef} object={meshRef.current} mode="translate" />
      )}
    </Center>
  )
}

function GLBViewer({ modelUrl, onExport }) {
  const [color, setColor] = useState('#ffffff')
  const [scale, setScale] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showTransform, setShowTransform] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640
  const cameraDistance = isMobile ? 10 : 7
  const cameraFov = isMobile ? 58 : 55

  const handleExport = () => {
    onExport({ color, scale })
  }

  const handlePositionChange = (newPosition) => {
    setPosition({ x: newPosition.x, y: newPosition.y, z: newPosition.z })
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
          
          {showGrid && (
            <Grid
              args={[20, 20]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#9ca3af"
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={true}
            />
          )}
          
          {modelUrl && (
            <Model 
              url={modelUrl} 
              color={color} 
              scale={scale}
              showTransform={showTransform}
              onPositionChange={handlePositionChange}
            />
          )}
          
          <Environment preset="city" />
          <OrbitControls
            enableZoom
            enablePan
            minDistance={isMobile ? 2 : 1.5}
            maxDistance={isMobile ? 28 : 22}
            makeDefault
          />
          <GizmoHelper alignment="top-right" margin={[80, 80]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
          </GizmoHelper>
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
                <div className="color-preview">
                  <div className="color-preview-inner" style={{ backgroundColor: color }}></div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="color-input"
                  />
                </div>
                <div className="color-info">
                  <span className="color-value">{color}</span>
                  <span className="color-label">HEX COLOR</span>
                </div>
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

          <div className="config-group">
            <label className="toggle-label">
              <span>Show Grid</span>
              <button
                className={`toggle-switch ${showGrid ? 'active' : ''}`}
                onClick={() => setShowGrid(!showGrid)}
                aria-label="Toggle Grid"
              >
                <span className="toggle-slider"></span>
              </button>
            </label>
          </div>

          <div className="config-group">
            <label className="toggle-label">
              <span>Transform Controls</span>
              <button
                className={`toggle-switch ${showTransform ? 'active' : ''}`}
                onClick={() => setShowTransform(!showTransform)}
                aria-label="Toggle Transform Controls"
              >
                <span className="toggle-slider"></span>
              </button>
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
