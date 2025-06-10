import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

export default function ParticlesBackground() {
  // Carga completa de tsparticles (para poder usar todos los plugins)
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: 'transparent' },
          style: {
            position: 'absolute',
            inset: '0',
            zIndex: '0',
          },
          fpsLimit: 60,

          // ====================
          // CONFIGURACIÓN DE PARTÍCULAS “CIBERNÉTICA”
          // ====================
          particles: {
            number: {
              value: 60,
              density: { enable: true, area: 800 },
            },
            color: {
              value: ['#00FFFF', '#0FF', '#0FA'], // Varias tonalidades de cian/neón
            },
            shape: {
              type: ['circle', 'triangle'], // Formas circulares y triangulares
            },
            opacity: {
              value: 0.7,
              random: { enable: true, minimumValue: 0.2 },
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.2,
                sync: false,
              },
            },
            size: {
              value: { min: 2, max: 5 },
              random: true,
              anim: {
                enable: true,
                speed: 3,
                size_min: 1,
                sync: false,
              },
            },
            move: {
              enable: true,
              speed: 1.2,
              direction: 'none',
              random: true,
              straight: false,
              outModes: {
                default: 'bounce', // Rebota en los bordes
              },
            },

            // Líneas de conexión entre partículas
            links: {
              enable: true,
              distance: 150,
              color: '#00FFFF',
              opacity: 0.4,
              width: 1,
            },

            // Efecto “twinkle”: destellos de partículas y/o líneas
            twinkle: {
              particles: {
                enable: true,
                frequency: 0.005,
                opacity: 0.8,
              },
              lines: {
                enable: true,
                frequency: 0.002,
                opacity: 0.5,
              },
            },
          },

          // ====================
          // INTERACTIVIDAD
         // ====================
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: 'grab', // Al pasar el mouse “agarra” partículas con líneas
              },
              onClick: {
                enable: true,
                mode: 'push', // Al hacer clic “inserta” nuevas partículas
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 200,
                links: {
                  opacity: 0.6,
                },
              },
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 120,
                duration: 0.4,
              },
            },
          },

          detectRetina: true,
        }}
      />
    </div>
  );
}