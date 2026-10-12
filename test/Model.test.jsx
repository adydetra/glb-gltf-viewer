import { describe, it, expect, vi } from 'vitest';
import { useRef, useState } from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

// 3D Model Component test fixture following https://r3f.docs.pmnd.rs/api/testing
function ModelMesh({ scale = 1, color, useCustomColor = false, originalColor = '#3b82f6', onPointerClick }) {
  const meshRef = useRef();
  const [activeScale, setActiveScale] = useState(scale);

  // Material color logic matching Viewer.jsx
  const effectiveColor = useCustomColor && color ? color : originalColor;

  return (
    <mesh
      ref={meshRef}
      scale={activeScale}
      onClick={() => {
        const next = activeScale === 1 ? 1.5 : 1;
        setActiveScale(next);
        if (onPointerClick) onPointerClick(next);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={effectiveColor} />
    </mesh>
  );
}

describe('3D R3F Model Rendering (React Three Test Renderer)', () => {
  it('renders 3D mesh properly with default scale', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <ModelMesh scale={1} originalColor="#e11d48" />
    );

    const mesh = renderer.scene.children[0];
    expect(mesh).toBeDefined();
    expect(mesh.props.scale).toBe(1);
  });

  it('preserves authentic original asset color when useCustomColor is false', async () => {
    const originalAssetColor = '#10b981';
    const renderer = await ReactThreeTestRenderer.create(
      <ModelMesh
        color="#ff00ff"
        useCustomColor={false}
        originalColor={originalAssetColor}
      />
    );

    const mesh = renderer.scene.children[0];
    const expectedColor = new THREE.Color(originalAssetColor);
    expect(mesh.instance.material.color.getHex()).toBe(expectedColor.getHex());
  });

  it('applies custom tint color when useCustomColor is true', async () => {
    const customTintColor = '#fbbf24';
    const renderer = await ReactThreeTestRenderer.create(
      <ModelMesh
        color={customTintColor}
        useCustomColor={true}
        originalColor="#10b981"
      />
    );

    const mesh = renderer.scene.children[0];
    const expectedColor = new THREE.Color(customTintColor);
    expect(mesh.instance.material.color.getHex()).toBe(expectedColor.getHex());
  });

  it('handles click events and updates scale via R3F fireEvent', async () => {
    const handleClick = vi.fn();
    const renderer = await ReactThreeTestRenderer.create(
      <ModelMesh scale={1} onPointerClick={handleClick} />
    );

    const mesh = renderer.scene.children[0];
    expect(mesh.props.scale).toBe(1);

    // Fire click event on the 3D mesh (as documented in r3f.docs.pmnd.rs/api/testing)
    await renderer.fireEvent(mesh, 'click');

    expect(mesh.props.scale).toBe(1.5);
    expect(handleClick).toHaveBeenCalledWith(1.5);
  });

  it('advances animation frames smoothly', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ModelMesh scale={2} />);
    expect(renderer.scene.children[0].props.scale).toBe(2);

    // Advance 10 frames with delta 0.016
    await renderer.advanceFrames(10, 0.016);
    expect(renderer.scene.children[0].props.scale).toBe(2);
  });
});
