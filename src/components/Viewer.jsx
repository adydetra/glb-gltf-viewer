// components/Viewer.jsx
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Center, TransformControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function Model({ url, color, scale, showTransform, onPositionChange, fileMap }) {
  const meshRef = useRef();
  const transformRef = useRef();

  const gltf = useLoader(GLTFLoader, url, (loader) => {
    if (fileMap) {
      loader.manager.setURLModifier((assetUrl) => {
        let normalized = assetUrl.replace(/^\.?\/?/, '');

        if (fileMap.has(normalized)) return fileMap.get(normalized);
        const lower = normalized.toLowerCase();
        if (fileMap.has(lower)) return fileMap.get(lower);

        const withPrefix = './' + normalized;
        if (fileMap.has(withPrefix)) return fileMap.get(withPrefix);

        try {
          const decoded = decodeURIComponent(normalized);
          if (fileMap.has(decoded)) return fileMap.get(decoded);
          if (fileMap.has(decoded.toLowerCase())) return fileMap.get(decoded.toLowerCase());
        } catch (_) {}

        const basename = normalized.split('/').pop();
        if (fileMap.has(basename)) return fileMap.get(basename);
        if (fileMap.has(basename.toLowerCase())) return fileMap.get(basename.toLowerCase());

        for (const [key, value] of fileMap.entries()) {
          if (
            key.endsWith('/' + normalized) ||
            key.toLowerCase().endsWith('/' + normalized.toLowerCase()) ||
            key.endsWith('/' + basename) ||
            key.toLowerCase().endsWith('/' + basename.toLowerCase())
          ) {
            return value;
          }
        }
        return assetUrl;
      });
      loader.setResourcePath('');
    }
  });

  const { scene } = gltf;
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(color);
          if (child.material.aoMap && !child.geometry.attributes.uv2) {
            child.material.aoMap = null;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [color]);

  useEffect(() => {
    if (transformRef.current && showTransform) {
      const controls = transformRef.current;
      const handleDragging = (event) => setAutoRotate(!event.value);
      const handleChange = () => {
        if (onPositionChange && meshRef.current) {
          onPositionChange(meshRef.current.position);
        }
      };
      controls.addEventListener('dragging-changed', handleDragging);
      controls.addEventListener('change', handleChange);
      return () => {
        controls.removeEventListener('dragging-changed', handleDragging);
        controls.removeEventListener('change', handleChange);
      };
    }
  }, [showTransform, onPositionChange]);

  useFrame(() => {
    if (meshRef.current && autoRotate && !showTransform) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Center>
      <group ref={meshRef}>
        <primitive object={scene} scale={scale} />
      </group>
      {showTransform && meshRef.current && <TransformControls ref={transformRef} object={meshRef.current} mode="translate" />}
    </Center>
  );
}

function Viewer({ modelUrl, fileMap }) {
  const [color, setColor] = useState('#ffffff');
  const [scale, setScale] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showTransform, setShowTransform] = useState(true);
  const [showGizmo, setShowGizmo] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [directionalIntensity, setDirectionalIntensity] = useState(1);
  const [bgColor, setBgColor] = useState('#1a1a1a');

  const canvasRef = useRef();

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const cameraDistance = isMobile ? 10 : 7;
  const cameraFov = isMobile ? 58 : 55;

  useEffect(() => {
    if (fileMap) {
      // optional: console.log('FileMap size:', fileMap.size)
    }
  }, [fileMap]);

  const handlePositionChange = (newPosition) => {
    setPosition({ x: newPosition.x, y: newPosition.y, z: newPosition.z });
  };

  const handleScreenshot = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `glb-screenshot-${Date.now()}.png`;
        link.click();
      }
    }
  };

  return (
    <div ref={canvasRef} style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, cameraDistance], fov: cameraFov }} style={{ background: bgColor }} gl={{ preserveDrawingBuffer: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={ambientIntensity} />
          <directionalLight position={[10, 10, 5]} intensity={directionalIntensity} />
          <directionalLight position={[-10, -10, -5]} intensity={directionalIntensity * 0.3} />

          {showGrid && (
            <Grid
              args={[50, 50]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#9ca3af"
              fadeDistance={100}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid
            />
          )}

          {modelUrl && <Model url={modelUrl} color={color} scale={scale} showTransform={showTransform} onPositionChange={handlePositionChange} fileMap={fileMap} />}

          <Environment preset="city" />
          <OrbitControls enableZoom enablePan minDistance={isMobile ? 2 : 1} maxDistance={isMobile ? 100 : 80} makeDefault />
          {showGizmo && (
            <GizmoHelper alignment="top-right" margin={[80, 80]}>
              <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
            </GizmoHelper>
          )}
        </Suspense>
      </Canvas>

      <div className="floating-controls">
        <button className="screenshot-btn" onClick={handleScreenshot} title="Take Screenshot">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        <button className="controls-toggle" onClick={() => setShowControls(!showControls)} title="Toggle Controls">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
          </svg>
        </button>
      </div>

      {showControls && (
        <div className="config-panel">
          <div className="config-header">
            <h3>Configuration</h3>
            <button className="close-btn" onClick={() => setShowControls(false)}>
              ×
            </button>
          </div>

          <div className="config-group">
            <label>
              <span>Color</span>
              <div className="color-input-wrapper">
                <div className="color-preview">
                  <div className="color-preview-inner" style={{ backgroundColor: color }}></div>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-input" />
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
                  max="30" // tetap 30 sesuai perubahanmu
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
              <button className={`toggle-switch ${showGrid ? 'active' : ''}`} onClick={() => setShowGrid(!showGrid)} aria-label="Toggle Grid">
                <span className="toggle-slider"></span>
              </button>
            </label>
          </div>

          <div className="config-group">
            <label className="toggle-label">
              <span>Transform Controls</span>
              <button className={`toggle-switch ${showTransform ? 'active' : ''}`} onClick={() => setShowTransform(!showTransform)} aria-label="Toggle Transform Controls">
                <span className="toggle-slider"></span>
              </button>
            </label>
          </div>

          <div className="config-group">
            <label className="toggle-label">
              <span>Gizmo</span>
              <button className={`toggle-switch ${showGizmo ? 'active' : ''}`} onClick={() => setShowGizmo(!showGizmo)} aria-label="Toggle Gizmo">
                <span className="toggle-slider"></span>
              </button>
            </label>
          </div>

          <div className="config-divider"></div>

          <div className="config-group">
            <label>
              <span>Ambient Light</span>
              <div className="scale-controls">
                <input type="range" min="0" max="2" step="0.1" value={ambientIntensity} onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))} className="scale-slider" />
                <span className="scale-value">{ambientIntensity.toFixed(1)}</span>
              </div>
            </label>
          </div>

          <div className="config-group">
            <label>
              <span>Directional Light</span>
              <div className="scale-controls">
                <input type="range" min="0" max="3" step="0.1" value={directionalIntensity} onChange={(e) => setDirectionalIntensity(parseFloat(e.target.value))} className="scale-slider" />
                <span className="scale-value">{directionalIntensity.toFixed(1)}</span>
              </div>
            </label>
          </div>

          <div className="config-group">
            <label>
              <span>Background Color</span>
              <div className="color-input-wrapper">
                <div className="color-preview">
                  <div className="color-preview-inner" style={{ backgroundColor: bgColor }}></div>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="color-input" />
                </div>
                <div className="color-info">
                  <span className="color-value">{bgColor}</span>
                  <span className="color-label">BACKGROUND</span>
                </div>
              </div>
            </label>
          </div>

          <div className="config-actions">
            <button
              className="preset-btn"
              onClick={() => {
                setColor('#ffffff');
                setScale(1);
                setShowGrid(true);
                setShowTransform(true);
                setShowGizmo(true);
                setAmbientIntensity(0.5);
                setDirectionalIntensity(1);
                setBgColor('#1a1a1a');
              }}
            >
              Reset Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Viewer;
