import { useProgress } from '@react-three/drei';

function CanvasLoader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="canvas-loader-overlay">
      <div className="canvas-loader">
        <div className="canvas-spinner" />
        <p>Loading 3D model... {progress > 0 ? `${Math.round(progress)}%` : ''}</p>
      </div>
    </div>
  );
}

export default CanvasLoader;
