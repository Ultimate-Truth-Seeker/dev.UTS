import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useMediaQuery } from "react-responsive"
import HeroLights from "./HeroLights"
import { Model } from "./Macbook_laptop"

const HeroExperience = () => {
    const isTablet = useMediaQuery({query: '(max-width: 768px'})
    const isMobile = useMediaQuery({query: '(max-width: 768px'})
    return (
        <Canvas camera={{position: [0, 0, 5], fov:45}}>
            <HeroLights/>

            <OrbitControls
                enablePan={false}
                enableZoom={!isTablet}
                maxDistance={20}
                minDistance={5}
                minPolarAngle={Math.PI / 5}
                maxPolarAngle={Math.PI / 2}
            />

            <group scale={isMobile? 7 : 10} position={isMobile? [-67*0.7, -5*0.7, -20*0.7]: [-67, -5, -20]}>
                <Model/>
            </group>

        </Canvas>
    )
}
export default HeroExperience