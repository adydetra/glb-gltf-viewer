import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Center, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function Model({ url, color, useCustomColor, scale, showTransform, fileMap }) {
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
        } catch {
          void 0;
        }

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
    if (meshRef.current && typeof meshRef.current.traverse === 'function') {
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          if (!child.userData.hasClonedMaterial) {
            child.material = child.material.clone();
            child.userData.hasClonedMaterial = true;
            if (child.material.color) {
              child.userData.originalColor = child.material.color.clone();
            }
          }

          if (useCustomColor && color) {
            child.material.color = new THREE.Color(color);
          } else if (child.userData.originalColor) {
            child.material.color.copy(child.userData.originalColor);
          }

          if (child.material.aoMap && !child.geometry.attributes.uv2) {
            child.material.aoMap = null;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [color, useCustomColor]);

  useEffect(() => {
    if (transformRef.current && showTransform) {
      const controls = transformRef.current;
      const handleDragging = (event) => setAutoRotate(!event.value);
      controls.addEventListener('dragging-changed', handleDragging);
      return () => {
        controls.removeEventListener('dragging-changed', handleDragging);
      };
    }
  }, [showTransform]);

  useFrame(() => {
    if (meshRef.current && autoRotate && !showTransform) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      <Center>
        <group ref={meshRef}>
          <primitive object={scene} scale={scale} />
        </group>
      </Center>
      {showTransform && <TransformControls ref={transformRef} object={meshRef} mode="translate" />}
    </>
  );
}

export default Model;
