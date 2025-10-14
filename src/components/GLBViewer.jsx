import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei'

function Model({ url }) {
  const meshRef = useRef()
  const { scene } = useGLTF(url)

  // Auto-rotate model
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <Center>
      <primitive ref={meshRef} object={scene} />
    </Center>
  )
}

function GLBViewer({ modelUrl }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640
  const cameraDistance = isMobile ? 10 : 7
  const cameraFov = isMobile ? 58 : 55

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: cameraFov }}
        style={{ background: '#1a1a1a' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          
          {modelUrl && <Model url={modelUrl} />}
          
          <Environment preset="city" />
          <OrbitControls
            enableZoom
            enablePan
            minDistance={isMobile ? 2 : 1.5}
            maxDistance={isMobile ? 28 : 22}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default GLBViewer
