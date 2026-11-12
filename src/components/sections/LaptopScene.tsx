import { useEffect } from 'react';
import type { Texture } from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMediaQuery } from 'react-responsive';
import HeroLights from './HeroLights';
import { Model } from './Macbook_laptop';

/** The canvas renders on demand; this asks for a new frame whenever the screen texture changes. */
function Invalidator({ version }: { version: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [version, invalidate]);
  return null;
}

interface Props {
  texture: Texture;
  version: number;
}

export default function LaptopScene({ texture, version }: Props) {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.75]} frameloop="demand">
      <HeroLights />
      <Invalidator version={version} />
      <OrbitControls
        enablePan={false}
        enableZoom={!isMobile}
        maxDistance={20}
        minDistance={5}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2}
      />
      <group scale={isMobile ? 7 : 10} position={isMobile ? [-67 * 0.7, -5 * 0.7, -20 * 0.7] : [-67, -5, -20]}>
        <Model screenTexture={texture} />
      </group>
    </Canvas>
  );
}
