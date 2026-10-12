import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import CanvasLoader from './CanvasLoader';
import ModelErrorBoundary from './ModelErrorBoundary';
import Model from './Model';
import ConfigPanel from './ConfigPanel';
import FloatingActions from './FloatingActions';
import ScreenshotToast from './ScreenshotToast';

const DEFAULT_CONFIG = {
  color: '#ffffff',
  useCustomColor: false,
  scale: 1,
  showGrid: true,
  showTransform: true,
  showGizmo: true,
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  bgColor: '#1a1a1a',
};

function Viewer({ modelUrl, fileMap }) {
  const [color, setColor] = useState(DEFAULT_CONFIG.color);
  const [useCustomColor, setUseCustomColor] = useState(DEFAULT_CONFIG.useCustomColor);
  const [scale, setScale] = useState(DEFAULT_CONFIG.scale);
  const [showControls, setShowControls] = useState(false);
  const [showGrid, setShowGrid] = useState(DEFAULT_CONFIG.showGrid);
  const [showTransform, setShowTransform] = useState(DEFAULT_CONFIG.showTransform);
  const [showGizmo, setShowGizmo] = useState(DEFAULT_CONFIG.showGizmo);
  const [screenshotNotice, setScreenshotNotice] = useState('');

  const [ambientIntensity, setAmbientIntensity] = useState(DEFAULT_CONFIG.ambientIntensity);
  const [directionalIntensity, setDirectionalIntensity] = useState(DEFAULT_CONFIG.directionalIntensity);
  const [bgColor, setBgColor] = useState(DEFAULT_CONFIG.bgColor);
  const [loadError, setLoadError] = useState(null);

  const canvasRef = useRef(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const cameraDistance = isMobile ? 10 : 7;
  const cameraFov = isMobile ? 58 : 55;

  const handleResetConfig = useCallback(() => {
    setColor(DEFAULT_CONFIG.color);
    setUseCustomColor(DEFAULT_CONFIG.useCustomColor);
    setScale(DEFAULT_CONFIG.scale);
    setShowGrid(DEFAULT_CONFIG.showGrid);
    setShowTransform(DEFAULT_CONFIG.showTransform);
    setShowGizmo(DEFAULT_CONFIG.showGizmo);
    setAmbientIntensity(DEFAULT_CONFIG.ambientIntensity);
    setDirectionalIntensity(DEFAULT_CONFIG.directionalIntensity);
    setBgColor(DEFAULT_CONFIG.bgColor);
  }, []);

  const handleScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.querySelector('canvas');
      if (canvas) {
        try {
          const timestamp = Date.now();
          const filename = `glb-screenshot-${timestamp}.png`;

          const triggerDownload = (url) => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setScreenshotNotice(`Screenshot saved: ${filename}`);
            setTimeout(() => setScreenshotNotice(''), 3000);
          };

          if (typeof canvas.toBlob === 'function') {
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                triggerDownload(url);
                setTimeout(() => URL.revokeObjectURL(url), 2000);
              } else {
                triggerDownload(canvas.toDataURL('image/png'));
              }
            }, 'image/png');
          } else {
            triggerDownload(canvas.toDataURL('image/png'));
          }
        } catch (err) {
          console.error('Failed to capture screenshot:', err);
        }
      }
    }
  }, []);

  return (
    <div ref={canvasRef} style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <CanvasLoader />
      {loadError && (
        <div className="model-error-banner" role="alert">
          <span>Failed to load 3D model. Please verify the asset file.</span>
        </div>
      )}
      <Canvas camera={{ position: [0, 0, cameraDistance], fov: cameraFov }} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={[bgColor]} />
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

          {modelUrl && (
            <ModelErrorBoundary resetKey={modelUrl} onError={(err) => setLoadError(err)}>
              <Model
                url={modelUrl}
                color={color}
                useCustomColor={useCustomColor}
                scale={scale}
                showTransform={showTransform}
                fileMap={fileMap}
              />
            </ModelErrorBoundary>
          )}

          <Environment preset="city" />
          <OrbitControls enableZoom enablePan minDistance={isMobile ? 2 : 1} maxDistance={isMobile ? 100 : 80} makeDefault />
          {showGizmo && (
            <GizmoHelper alignment="top-right" margin={[80, 80]}>
              <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
            </GizmoHelper>
          )}
        </Suspense>
      </Canvas>

      <ScreenshotToast message={screenshotNotice} />

      <FloatingActions onScreenshot={handleScreenshot} onToggleControls={() => setShowControls((prev) => !prev)} />

      <ConfigPanel
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        color={color}
        setColor={setColor}
        useCustomColor={useCustomColor}
        setUseCustomColor={setUseCustomColor}
        scale={scale}
        setScale={setScale}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showTransform={showTransform}
        setShowTransform={setShowTransform}
        showGizmo={showGizmo}
        setShowGizmo={setShowGizmo}
        ambientIntensity={ambientIntensity}
        setAmbientIntensity={setAmbientIntensity}
        directionalIntensity={directionalIntensity}
        setDirectionalIntensity={setDirectionalIntensity}
        bgColor={bgColor}
        setBgColor={setBgColor}
        onReset={handleResetConfig}
      />
    </div>
  );
}

export default Viewer;
