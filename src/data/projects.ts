import type { L, LL } from '../i18n/context';
import type { LabTab } from '../context/ui';

export type Category = 'ai' | 'web' | 'hpc' | 'graphics' | 'systems';

export type Media =
  | { type: 'image'; src: string; caption: L }
  | { type: 'video'; src: string; poster: string; caption: L };

export interface ProjectLink {
  label: L;
  href: string;
}

export interface DetailBlock {
  title: L;
  items: LL;
}

export interface Project {
  id: string;
  title: L;
  category: Category;
  featured?: boolean;
  period: L;
  role: L;
  tagline: L;
  summary: L;
  highlights: LL;
  details: DetailBlock[];
  tech: string[];
  media: Media[];
  links: ProjectLink[];
  /** Opens an interactive demo in the Lab section. */
  demo?: LabTab;
}

export const categoryLabels: Record<Category | 'all', L> = {
  all: { en: 'All', es: 'Todos' },
  ai: { en: 'AI & Data', es: 'IA y datos' },
  web: { en: 'Web', es: 'Web' },
  hpc: { en: 'Parallel computing', es: 'Cómputo paralelo' },
  graphics: { en: 'Graphics', es: 'Gráficas' },
  systems: { en: 'Compilers & systems', es: 'Compiladores y sistemas' },
};

/** Accent colour per category (used by the cover art and the laptop screen). */
export const categoryColor: Record<Category, string> = {
  ai: '#00ffff',
  web: '#7aa2ff',
  hpc: '#ffb86b',
  graphics: '#ff7ad9',
  systems: '#8affb0',
};

const gh = (repo: string) => `https://github.com/Ultimate-Truth-Seeker/${repo}`;
const codeLink: (repo: string) => ProjectLink = (repo) => ({
  label: { en: 'Source code', es: 'Código fuente' },
  href: gh(repo),
});
const m = (file: string) => `media/${file}`;

type RawProject = Omit<Project, 'title'> & { title: string | L };

const raw: RawProject[] = [
  /* ───────────────────────── AI ───────────────────────── */
  {
    id: 'quantdesk',
    title: 'QuantDesk + quant-mcp',
    category: 'ai',
    featured: true,
    period: { en: 'Sept 2026', es: 'Sept. 2026' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'An LLM that never does the maths itself: it calls tools.',
      es: 'Un LLM que nunca calcula por su cuenta: llama herramientas.',
    },
    summary: {
      en: 'Console chatbot for quantitative portfolio analysis. Claude coordinates; a custom MCP server computes volatility, Sharpe, VaR, correlations and rebalancing.',
      es: 'Chatbot de consola para análisis cuantitativo de portafolios. Claude coordina; un servidor MCP propio calcula volatilidad, Sharpe, VaR, correlaciones y rebalanceo.',
    },
    highlights: {
      en: [
        'Claude (Anthropic API) is the coordinating LLM; every number comes from a tool call, so no result is estimated by the model.',
        'quant-mcp is a custom stdio MCP server with 7 tools: list_available_tickers, get_portfolio_summary, calculate_volatility, calculate_sharpe_ratio, calculate_var, get_correlation_matrix and simulate_rebalance.',
        'The host is an MCP client manager that discovers the tools of several servers (filesystem, official git and quant-mcp), routes each call to the right one and logs all JSON-RPC traffic.',
      ],
      es: [
        'Claude (Anthropic API) es el LLM coordinador; cada número sale de una llamada a herramienta, así que el modelo no estima ningún resultado.',
        'quant-mcp es un servidor MCP propio sobre stdio con 7 herramientas: list_available_tickers, get_portfolio_summary, calculate_volatility, calculate_sharpe_ratio, calculate_var, get_correlation_matrix y simulate_rebalance.',
        'El host es un gestor de clientes MCP que descubre las herramientas de varios servidores (sistema de archivos, git oficial y quant-mcp), enruta cada llamada al servidor correcto y registra todo el tráfico JSON-RPC.',
      ],
    },
    details: [
      {
        title: { en: 'Architecture', es: 'Arquitectura' },
        items: {
          en: [
            'Transport: JSON-RPC 2.0 over stdio, one subprocess per server.',
            'Tool discovery at start-up (tools/list); the merged catalogue is handed to the LLM.',
            'A tap on the transport writes every request and response to mcp_log.jsonl for auditing.',
          ],
          es: [
            'Transporte: JSON-RPC 2.0 sobre stdio, un subproceso por servidor.',
            'Descubrimiento de herramientas al iniciar (tools/list); el catálogo combinado se entrega al LLM.',
            'Un tap sobre el transporte escribe cada petición y respuesta en mcp_log.jsonl para auditoría.',
          ],
        },
      },
      {
        title: { en: 'Numerics', es: 'Numérica' },
        items: {
          en: [
            'pandas / NumPy / SciPy; historical and parametric VaR, annualised Sharpe, correlation matrix, rebalance simulation.',
            'Demo data is synthetic (geometric Brownian motion, seed 42), so results are reproducible.',
          ],
          es: [
            'pandas / NumPy / SciPy; VaR histórico y paramétrico, Sharpe anualizado, matriz de correlación, simulación de rebalanceo.',
            'Los datos de la demo son sintéticos (movimiento browniano geométrico, semilla 42), por lo que los resultados son reproducibles.',
          ],
        },
      },
    ],
    tech: ['Python', 'MCP', 'Anthropic API', 'pandas', 'NumPy', 'SciPy'],
    media: [],
    links: [
      codeLink('quantdesk'),
      { label: { en: 'quant-mcp server', es: 'Servidor quant-mcp' }, href: gh('quant_mcp') },
    ],
    demo: 'quant',
  },
  {
    id: 'lora',
    title: 'LoRA vs. fine-tuning vs. prompting',
    category: 'ai',
    featured: true,
    period: { en: 'Oct – Nov 2026', es: 'Oct. – Nov. 2026' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'Same accuracy as full fine-tuning with 0.3% of the parameters.',
      es: 'La misma precisión que el fine-tuning completo con 0.3% de los parámetros.',
    },
    summary: {
      en: 'Three ways to adapt a language model to Spanish tweet sentiment, compared on accuracy, memory and time with 5 seeds.',
      es: 'Tres formas de adaptar un modelo de lenguaje a sentimiento en tweets en español, comparadas en precisión, memoria y tiempo con 5 semillas.',
    },
    highlights: {
      en: [
        'Zero-shot and few-shot prompting with Qwen2.5-1.5B, full fine-tuning and LoRA on XLM-RoBERTa base.',
        'LoRA (r=8) reached macro F1 0.673 vs 0.667 for full fine-tuning, training 0.89M of 278M parameters, with 1.9 GB vs 5.4 GB peak GPU memory and 33 s vs 422 s of training.',
        'Mean ± std over 5 seeds, ablations on rank and target modules, SHAP error analysis, and a leakage check (a model pretrained on the same tweets was excluded).',
      ],
      es: [
        'Prompting zero-shot y few-shot con Qwen2.5-1.5B, fine-tuning completo y LoRA sobre XLM-RoBERTa base.',
        'LoRA (r=8) alcanzó F1 macro 0.673 vs 0.667 del fine-tuning completo, entrenando 0.89 M de 278 M de parámetros, con 1.9 GB vs 5.4 GB de memoria pico de GPU y 33 s vs 422 s de entrenamiento.',
        'Media ± desviación estándar con 5 semillas, ablaciones en rango y módulos objetivo, análisis de errores con SHAP y control de fuga de datos (se excluyó un modelo preentrenado con los mismos tweets).',
      ],
    },
    details: [
      {
        title: { en: 'Setup', es: 'Configuración' },
        items: {
          en: [
            '870 test tweets, free Colab T4 GPU.',
            'PyTorch + Hugging Face (transformers, peft).',
            'Try the numbers yourself in the Lab tab: switch metric, hover bars.',
          ],
          es: [
            '870 tweets de prueba, GPU T4 gratuita de Colab.',
            'PyTorch + Hugging Face (transformers, peft).',
            'Explora los números en la pestaña Laboratorio: cambia la métrica y pasa el cursor sobre las barras.',
          ],
        },
      },
    ],
    tech: ['PyTorch', 'Hugging Face', 'PEFT / LoRA', 'SHAP', 'scikit-learn'],
    media: [
      {
        type: 'image',
        src: m('dl_curvas.png'),
        caption: { en: 'Training curves from the experiments', es: 'Curvas de entrenamiento de los experimentos' },
      },
      {
        type: 'image',
        src: m('dl_f1_memoria.png'),
        caption: { en: 'Macro F1 vs. peak GPU memory', es: 'F1 macro vs. memoria pico de GPU' },
      },
    ],
    links: [
      codeLink('ProyectoFinalDL'),
      { label: { en: 'Video explainer', es: 'Video explicativo' }, href: 'https://youtu.be/bf50IK5eU04' },
    ],
    demo: 'lora',
  },
  {
    id: 'gambler-ruin',
    title: { en: "Gambler's ruin", es: 'La ruina del jugador' },
    category: 'ai',
    period: { en: 'Nov 2026', es: 'Nov. 2026' },
    role: { en: 'Team of 4', es: 'Equipo de 4' },
    tagline: {
      en: 'Markov chains, agent-based models and networks: can any betting strategy beat the house?',
      es: 'Cadenas de Markov, modelos basados en agentes y redes: ¿puede alguna estrategia vencer a la casa?',
    },
    summary: {
      en: 'Final project for Modelling & Simulation. Spoiler: no strategy beats the house, they only change how you lose.',
      es: 'Proyecto final de Modelación y Simulación. Spoiler: ninguna estrategia vence a la casa, solo cambia cómo se pierde.',
    },
    highlights: {
      en: [
        'Capital as an absorbing Markov chain (ruin and goal): canonical form, fundamental matrix, closed-form results, and an exact Martingale with a table limit.',
        'Vectorised agent-based model with 8 strategies (Martingale, Kelly, fixed bet, percentage of capital…) validated against the chain: max error 0.012 in ruin probability with 20,000 agents.',
        '500 gamblers on Erdős–Rényi, Watts–Strogatz and Barabási–Albert networks imitating their best neighbour; Martingale spreads through survivorship bias, informants on hubs are the best intervention.',
      ],
      es: [
        'El capital como cadena de Markov absorbente (ruina y meta): forma canónica, matriz fundamental, resultados cerrados y Martingala exacta con límite de mesa.',
        'Modelo basado en agentes vectorizado con 8 estrategias (Martingala, Kelly, apuesta fija, porcentaje del capital…) validado contra la cadena: error máximo 0.012 en la probabilidad de ruina con 20 000 agentes.',
        '500 apostadores en redes Erdős–Rényi, Watts–Strogatz y Barabási–Albert que imitan al vecino que más ganó; la Martingala se propaga por sesgo de supervivencia y los informantes en los hubs son la mejor intervención.',
      ],
    },
    details: [
      {
        title: { en: 'Method', es: 'Método' },
        items: {
          en: [
            'Own NumPy ABM instead of Mesa: tens of thousands of agents over thousands of rounds.',
            'Fixed seeds; every figure regenerates from run_part1/2/3.py.',
          ],
          es: [
            'ABM propio con NumPy en lugar de Mesa: decenas de miles de agentes por miles de rondas.',
            'Semillas fijas; cada figura se regenera con run_part1/2/3.py.',
          ],
        },
      },
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'NetworkX', 'Markov chains', 'ABM'],
    media: [
      { type: 'image', src: m('ms_trayectorias.jpg'), caption: { en: 'Capital trajectories', es: 'Trayectorias de capital' } },
      { type: 'image', src: m('ms_ruina.jpg'), caption: { en: 'Ruin probability by strategy', es: 'Probabilidad de ruina por estrategia' } },
      { type: 'image', src: m('ms_redes.jpg'), caption: { en: 'Strategy spreading on networks', es: 'Propagación de estrategias en redes' } },
    ],
    links: [
      codeLink('ProyectoFinalMS'),
      { label: { en: 'Video explainer', es: 'Video explicativo' }, href: 'https://youtu.be/GAGw2TkokRE' },
    ],
  },

  /* ───────────────────────── Web ───────────────────────── */
  {
    id: 'designbetter',
    title: 'DesignBetter',
    category: 'web',
    featured: true,
    period: { en: 'Feb – Dec 2025', es: 'Feb. – Dic. 2025' },
    role: { en: 'Scrum Team Manager · team of 4', es: 'Scrum Team Manager · equipo de 4' },
    tagline: {
      en: 'E-commerce for fashion designs, with interactive 3D garments.',
      es: 'Comercio electrónico de diseños de moda con prendas 3D interactivas.',
    },
    summary: {
      en: 'Full-stack platform where designers and customers create, preview and customise garments. Django REST API + Next.js frontend.',
      es: 'Plataforma full stack donde diseñadores y clientes crean, previsualizan y personalizan prendas. API REST en Django + frontend en Next.js.',
    },
    highlights: {
      en: [
        'Led a team of four as Scrum Team Manager; 100+ story points delivered applying Lean Software Development.',
        'Secure sign-in with Google OAuth and JWT sessions.',
        'Three.js garment viewer; CI/CD on Vercel with automatic builds on every merge to main.',
      ],
      es: [
        'Lideré un equipo de cuatro como Scrum Team Manager; más de 100 story points entregados aplicando Lean Software Development.',
        'Inicio de sesión seguro con Google OAuth y sesiones JWT.',
        'Visor de prendas con Three.js; CI/CD en Vercel con builds automáticos en cada merge a main.',
      ],
    },
    details: [
      {
        title: { en: 'Stack', es: 'Stack' },
        items: {
          en: [
            'Frontend: Next.js 15, React 19, Tailwind, Radix UI, react-three-fiber, Vitest and Cypress tests.',
            'Backend: Django REST + PostgreSQL, Docker. Frontend repository linked below.',
          ],
          es: [
            'Frontend: Next.js 15, React 19, Tailwind, Radix UI, react-three-fiber, pruebas con Vitest y Cypress.',
            'Backend: Django REST + PostgreSQL, Docker. El repositorio del frontend está enlazado abajo.',
          ],
        },
      },
    ],
    tech: ['Next.js', 'React', 'Django', 'PostgreSQL', 'Docker', 'Three.js', 'Vercel'],
    media: [
      { type: 'image', src: m('designbetter_home.jpg'), caption: { en: 'Home (frontend running with sample data)', es: 'Inicio (frontend con datos de ejemplo)' } },
      { type: 'image', src: m('designbetter_templates.jpg'), caption: { en: 'Templates (sample data)', es: 'Plantillas (datos de ejemplo)' } },
      { type: 'image', src: m('designbetter_personalizar.jpg'), caption: { en: 'Customisation (sample data)', es: 'Personalización (datos de ejemplo)' } },
      { type: 'image', src: m('designbetter_patterns.jpg'), caption: { en: 'Patterns (sample data)', es: 'Patrones (datos de ejemplo)' } },
    ],
    links: [{ label: { en: 'Frontend source', es: 'Código del frontend' }, href: gh('DesignBetterFrontend') }],
  },

  /* ───────────────────────── Parallel ───────────────────────── */
  {
    id: 'nbody',
    title: 'N-body: OpenMP scaling study',
    category: 'hpc',
    featured: true,
    period: { en: 'Oct 2026', es: 'Oct. 2026' },
    role: { en: 'Team of 3', es: 'Equipo de 3' },
    tagline: {
      en: 'Speedup, efficiency and where parallelism stops paying off.',
      es: 'Speedup, eficiencia y dónde el paralelismo deja de rendir.',
    },
    summary: {
      en: 'Gravitational N-body in C with OpenMP, measured on 15,000 bodies. Best result: 3.81× on 4 threads, identical checksums in every version.',
      es: 'N-cuerpos gravitacional en C con OpenMP, medido con 15 000 cuerpos. Mejor resultado: 3.81× con 4 hilos y checksums idénticos en todas las versiones.',
    },
    highlights: {
      en: [
        'Sequential baseline 3.508 s (N=15,000, 10 steps, seed 42, 4-core aarch64).',
        'Version B (static schedule): 1.97× on 2 threads, 3.81× on 4, but 3.78× on 8 (efficiency 0.47): past the physical cores it is just oversubscription.',
        'All versions produce the same checksum (1499709.687720), so speed did not cost correctness.',
      ],
      es: [
        'Línea base secuencial: 3.508 s (N=15 000, 10 pasos, semilla 42, aarch64 de 4 núcleos).',
        'Versión B (schedule estático): 1.97× con 2 hilos, 3.81× con 4, pero 3.78× con 8 (eficiencia 0.47): más allá de los núcleos físicos solo hay sobresuscripción.',
        'Todas las versiones producen el mismo checksum (1499709.687720): la velocidad no costó corrección.',
      ],
    },
    details: [
      {
        title: { en: 'Versions', es: 'Versiones' },
        items: {
          en: [
            'B static vs B dynamic (chunk 8): 3.83× at 8 threads, a marginal gain from better load balance.',
            'Version C reached 3.27×: more machinery did not beat the simple parallel-for.',
            'Try it in the browser: the Lab runs a Web Worker version of the same idea.',
          ],
          es: [
            'B estático vs B dinámico (chunk 8): 3.83× con 8 hilos, ganancia marginal por mejor balance de carga.',
            'La versión C llegó a 3.27×: más complejidad no superó al parallel-for simple.',
            'Pruébalo en el navegador: el Laboratorio ejecuta una versión con Web Workers de la misma idea.',
          ],
        },
      },
    ],
    tech: ['C', 'OpenMP', 'Benchmarking', 'Linux'],
    media: [],
    links: [codeLink('lab-pcam-nbody')],
    demo: 'nbody',
  },
  {
    id: 'ecosystem',
    title: { en: 'Ecosystem simulation (OpenMP)', es: 'Simulación de ecosistema (OpenMP)' },
    category: 'hpc',
    period: { en: 'Aug 2026', es: 'Ago. 2026' },
    role: { en: 'Team of 3 · output, benchmarking, docs', es: 'Equipo de 3 · salida, benchmarking, docs' },
    tagline: {
      en: 'Plants, herbivores and carnivores on a 2D grid, updated in parallel.',
      es: 'Plantas, herbívoros y carnívoros en una cuadrícula 2D, actualizados en paralelo.',
    },
    summary: {
      en: 'Plain C + OpenMP grid simulation with a benchmark script that reports speedup against one thread.',
      es: 'Simulación en cuadrícula en C + OpenMP con un script de benchmark que reporta el speedup respecto a un hilo.',
    },
    highlights: {
      en: [
        'Three species that feed, reproduce and die each tick; the grid update is parallelised with OpenMP.',
        'My part: results output, benchmarking (benchmark.sh) and documentation.',
        'No external dependencies: standard C + OpenMP, built with make.',
      ],
      es: [
        'Tres especies que se alimentan, se reproducen y mueren en cada tick; la actualización de la cuadrícula se paraleliza con OpenMP.',
        'Mi parte: salida de resultados, benchmarking (benchmark.sh) y documentación.',
        'Sin dependencias externas: C estándar + OpenMP, compilado con make.',
      ],
    },
    details: [],
    tech: ['C', 'OpenMP', 'Make', 'Bash'],
    media: [],
    links: [codeLink('Miniproyecto1-CPyD')],
  },
  {
    id: 'fogata',
    title: { en: 'Campfire screensaver', es: 'Screensaver de fogata' },
    category: 'hpc',
    period: { en: 'Sept 2026', es: 'Sept. 2026' },
    role: { en: 'Course project', es: 'Proyecto de curso' },
    tagline: {
      en: 'A particle fire with bloom, sequential and OpenMP builds.',
      es: 'Fuego de partículas con bloom, versiones secuencial y OpenMP.',
    },
    summary: {
      en: 'C++17 + SDL2 particle system: buoyancy, drag, sine-sum turbulence and a black-body palette. The same source builds sequential or parallel.',
      es: 'Sistema de partículas en C++17 + SDL2: flotabilidad, arrastre, turbulencia por suma de senos y paleta de cuerpo negro. El mismo código compila secuencial o paralelo.',
    },
    highlights: {
      en: [
        'Particles add light to a floating-point RGB field; only at the end is it tone-mapped to 8 bits through a black-body palette with bloom.',
        'Sequential baseline: 47.4 FPS at 1280×720 with N=3000; 108.2 FPS at 640×480; 34.2 FPS at N=6000; 18.2 FPS at N=12000.',
        'Compiling with -march=native gave roughly 45% more FPS.',
      ],
      es: [
        'Las partículas suman luz a un campo RGB en coma flotante; solo al final se comprime a 8 bits con una paleta de cuerpo negro y bloom.',
        'Línea base secuencial: 47.4 FPS a 1280×720 con N=3000; 108.2 FPS a 640×480; 34.2 FPS con N=6000; 18.2 FPS con N=12000.',
        'Compilar con -march=native dio cerca de 45% más FPS.',
      ],
    },
    details: [
      {
        title: { en: 'Design choices', es: 'Decisiones de diseño' },
        items: {
          en: [
            'Defensive argument validation before SDL starts.',
            'Design document maps every assignment requirement to the code that satisfies it.',
          ],
          es: [
            'Validación defensiva de argumentos antes de iniciar SDL.',
            'El documento de diseño relaciona cada requisito del enunciado con el código que lo cumple.',
          ],
        },
      },
    ],
    tech: ['C++17', 'SDL2', 'OpenMP', 'Make'],
    media: [{ type: 'image', src: m('fogata.jpg'), caption: { en: 'Screenshot of the screensaver', es: 'Captura del screensaver' } }],
    links: [codeLink('Proyecto1-CPyD')],
  },

  /* ───────────────────────── Graphics ───────────────────────── */
  {
    id: 'raytracer',
    title: { en: 'Raytraced diorama', es: 'Diorama con raytracing' },
    category: 'graphics',
    featured: true,
    period: { en: 'Nov 2025', es: 'Nov. 2025' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'A CPU raytracer from scratch in Rust: glass, portals and a day/night sky.',
      es: 'Un raytracer en CPU desde cero en Rust: vidrio, portales y cielo con ciclo día/noche.',
    },
    summary: {
      en: 'Minecraft-inspired diorama rendered entirely by ray–box and ray–triangle intersection, multithreaded with Rayon.',
      es: 'Diorama inspirado en Minecraft renderizado solo con intersecciones rayo–caja y rayo–triángulo, multihilo con Rayon.',
    },
    highlights: {
      en: [
        'Glass with reflection and refraction using Schlick Fresnel and an adjustable index of refraction; transparency continues the ray.',
        'Procedural skybox with sun and moon discs and a day/night cycle; animated nether portal from a sprite sheet with UV warping.',
        'Eight materials, an OBJ loader and floating sprites that are occlusion-tested by a ray.',
      ],
      es: [
        'Vidrio con reflexión y refracción usando Fresnel de Schlick e índice de refracción ajustable; la transparencia continúa el rayo.',
        'Skybox procedural con disco de sol y luna y ciclo día/noche; portal animado a partir de una hoja de sprites con distorsión UV.',
        'Ocho materiales, cargador de OBJ y sprites flotantes con prueba de oclusión mediante un rayo.',
      ],
    },
    details: [
      {
        title: { en: 'Lighting model', es: 'Modelo de iluminación' },
        items: {
          en: [
            'Lambert diffuse + Blinn-Phong specular + Fresnel reflection + hard shadows + emissive term.',
            'Material = albedo, specular strength, shininess, reflectivity, transparency, IOR, texture, emission.',
          ],
          es: [
            'Difuso Lambert + especular Blinn-Phong + reflexión de Fresnel + sombras duras + término emisivo.',
            'Material = albedo, intensidad especular, brillo, reflectividad, transparencia, IOR, textura, emisión.',
          ],
        },
      },
      {
        title: { en: 'Performance & camera', es: 'Rendimiento y cámara' },
        items: {
          en: [
            'One scanline per Rayon task; every pixel runs cast_ray() independently.',
            'Orbit camera in spherical coordinates with a stable forward/right/up basis and a zoom limit.',
          ],
          es: [
            'Una línea de barrido por tarea de Rayon; cada píxel ejecuta cast_ray() de forma independiente.',
            'Cámara orbital en coordenadas esféricas con base forward/right/up estable y límite de zoom.',
          ],
        },
      },
    ],
    tech: ['Rust', 'Raylib', 'Rayon', 'tobj'],
    media: [
      {
        type: 'video',
        src: m('raytracing.mp4'),
        poster: m('raytracing.jpg'),
        caption: { en: 'Real-time capture of the diorama', es: 'Captura en tiempo real del diorama' },
      },
    ],
    links: [codeLink('raytracingrust')],
  },
  {
    id: 'solar-system',
    title: { en: 'Procedural solar system', es: 'Sistema solar procedural' },
    category: 'graphics',
    featured: true,
    period: { en: 'Nov 2025', es: 'Nov. 2025' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'A software rasterizer with noise-based shaders and a flyable ship.',
      es: 'Un rasterizador por software con shaders basados en ruido y una nave controlable.',
    },
    summary: {
      en: 'Own rasterizer in Rust (z-buffer, matrices, vertex and fragment shaders) rendering a sun, rocky and gas planets, rings and a procedural skybox.',
      es: 'Rasterizador propio en Rust (z-buffer, matrices, vertex y fragment shaders) que renderiza un sol, planetas rocosos y gaseosos, anillos y un skybox procedural.',
    },
    highlights: {
      en: [
        'No GPU pipeline: framebuffer, triangle rasterization, depth buffer and projection/viewport matrices written by hand.',
        'Shaders per body: solar (FBM turbulence, temperature gradient, flare displaced in the vertex stage), rocky (value noise + thresholded craters) and stripes (latitude bands with animated distortion for Jupiter and Saturn).',
        'Skybox generated entirely by 3D noise: volumetric nebulae, point stars and shooting stars.',
      ],
      es: [
        'Sin pipeline de GPU: framebuffer, rasterización de triángulos, buffer de profundidad y matrices de proyección/viewport escritos a mano.',
        'Shaders por cuerpo: solar (turbulencia FBM, gradiente de temperatura, flare desplazado en el vertex stage), rocoso (ruido de valor + cráteres por umbral) y bandas (franjas por latitud con distorsión animada para Júpiter y Saturno).',
        'Skybox generado totalmente con ruido 3D: nebulosas volumétricas, estrellas puntuales y estrellas fugaces.',
      ],
    },
    details: [
      {
        title: { en: 'Ship & orbits', es: 'Nave y órbitas' },
        items: {
          en: [
            'Six-degrees-of-freedom ship built on an orthonormal basis (yaw, pitch, roll, strafe).',
            'Each body has its own transform, spin and orbit; lighting depends on the position relative to the Sun.',
          ],
          es: [
            'Nave con seis grados de libertad construida sobre una base ortonormal (yaw, pitch, roll, strafe).',
            'Cada cuerpo tiene su propia transformación, rotación y órbita; la iluminación depende de la posición respecto al Sol.',
          ],
        },
      },
    ],
    tech: ['Rust', 'Raylib', 'Software rasterization', 'Procedural noise'],
    media: [
      {
        type: 'video',
        src: m('sistemasolar.mp4'),
        poster: m('sistemasolar.jpg'),
        caption: { en: 'Flying through the system', es: 'Vuelo por el sistema' },
      },
    ],
    links: [codeLink('sistemasolar')],
  },
  {
    id: 'sun-shader',
    title: { en: 'Solar shader', es: 'Shader solar' },
    category: 'graphics',
    period: { en: 'Nov 2025', es: 'Nov. 2025' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'A pulsing star made of fractal noise, with live temperature and intensity.',
      es: 'Una estrella pulsante hecha de ruido fractal, con temperatura e intensidad en vivo.',
    },
    summary: {
      en: 'Animated sun driven by FBM + 3D value noise; keys change colour temperature and emission in real time.',
      es: 'Sol animado con FBM + ruido de valor 3D; las teclas cambian la temperatura de color y la emisión en tiempo real.',
    },
    highlights: {
      en: [
        'Vertex shader pushes vertices outward with FBM to form a corona and flares.',
        'Fragment shader mixes core brightness, noise and a temperature gradient from orange-red to blue-white.',
      ],
      es: [
        'El vertex shader empuja los vértices hacia afuera con FBM para formar corona y erupciones.',
        'El fragment shader mezcla brillo del núcleo, ruido y un gradiente de temperatura de rojo anaranjado a blanco azulado.',
      ],
    },
    details: [
      {
        title: { en: 'Uniforms', es: 'Uniformes' },
        items: {
          en: ['time, resolution, temp and intensity.', 'fbm(p, octaves, lacunarity, gain) over value_noise3 with hash + fade interpolation.'],
          es: ['time, resolution, temp e intensity.', 'fbm(p, octaves, lacunarity, gain) sobre value_noise3 con hash e interpolación fade.'],
        },
      },
    ],
    tech: ['Rust', 'Raylib', 'Shaders', 'FBM noise'],
    media: [
      { type: 'video', src: m('solrust.mp4'), poster: m('solrust.jpg'), caption: { en: 'The animated sun', es: 'El sol animado' } },
    ],
    links: [codeLink('solrust')],
  },
  {
    id: 'planet-renderer',
    title: { en: 'Procedural planet renderer', es: 'Renderizador de planetas procedural' },
    category: 'graphics',
    period: { en: 'Nov 2025', es: 'Nov. 2025' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'Four toggleable shader layers per planet.',
      es: 'Cuatro capas de shader activables por planeta.',
    },
    summary: {
      en: 'Loads OBJ models and gives each entity an independent orbit and a layered procedural material (rocky, gaseous, ring, moon, star).',
      es: 'Carga modelos OBJ y da a cada entidad una órbita independiente y un material procedural por capas (rocoso, gaseoso, anillo, luna, estrella).',
    },
    highlights: {
      en: [
        'Layers: albedo palette, bands, FBM noise perturbation, scanline/bloom glow; each toggles with a key to inspect its contribution.',
        'Per-entity Material struct (palette radius, ring frequency, FBM octaves, bloom…) with presets.',
      ],
      es: [
        'Capas: paleta de albedo, bandas, perturbación con ruido FBM y brillo con scanlines/bloom; cada una se activa con una tecla para inspeccionar su aporte.',
        'Struct Material por entidad (radio de paleta, frecuencia de anillos, octavas FBM, bloom…) con presets.',
      ],
    },
    details: [],
    tech: ['Rust', 'Raylib', 'OBJ', 'Procedural shaders'],
    media: [
      { type: 'image', src: m('planets.png'), caption: { en: 'Overview of the generated bodies', es: 'Vista general de los cuerpos generados' } },
    ],
    links: [codeLink('planetariosolar')],
  },
  {
    id: 'maze',
    title: { en: 'Maze: a raycaster game', es: 'Maze: juego con raycasting' },
    category: 'graphics',
    period: { en: 'Nov 2025', es: 'Nov. 2025' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'Wolfenstein-style 3D engine written from zero.',
      es: 'Motor 3D estilo Wolfenstein escrito desde cero.',
    },
    summary: {
      en: 'Raycasting engine in Rust with enemies, minimap, HUD, menu screens, music and sound effects at a steady ~60 FPS.',
      es: 'Motor de raycasting en Rust con enemigos, minimapa, HUD, pantallas de menú, música y efectos de sonido a ~60 FPS estables.',
    },
    highlights: {
      en: [
        'One ray per screen column, textured walls, sprite system for enemies and goal, simple z-buffer and wall collision.',
        'Screen state machine: menu, level select, game, pause, victory and defeat; red damage flash and a minimap.',
      ],
      es: [
        'Un rayo por columna de pantalla, paredes texturizadas, sistema de sprites para enemigos y meta, z-buffer simple y colisión con paredes.',
        'Máquina de estados de pantallas: menú, selección de nivel, juego, pausa, victoria y derrota; destello rojo al recibir daño y minimapa.',
      ],
    },
    details: [],
    tech: ['Rust', 'Raylib', 'Raycasting'],
    media: [
      { type: 'video', src: m('maze.mp4'), poster: m('maze.jpg'), caption: { en: 'Gameplay', es: 'Partida' } },
    ],
    links: [codeLink('escapefrommaze2')],
  },
  {
    id: 'game-of-life',
    title: { en: 'Game of Life with RLE patterns', es: 'Juego de la vida con patrones RLE' },
    category: 'graphics',
    period: { en: 'Jul 2025', es: 'Jul. 2025' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'Life within Life: loading Conway patterns into a custom framebuffer.',
      es: 'Vida dentro de la vida: patrones de Conway cargados en un framebuffer propio.',
    },
    summary: {
      en: 'Rust + Raylib implementation with a hand-written framebuffer and an RLE loader (Greyship, Dart, OTCA Metapixel).',
      es: 'Implementación en Rust + Raylib con framebuffer escrito a mano y cargador RLE (Greyship, Dart, OTCA Metapixel).',
    },
    highlights: {
      en: ['Custom framebuffer that draws pixels or blocks.', 'Drop in any .rle pattern and place it anywhere on the grid.'],
      es: ['Framebuffer propio que dibuja píxeles o bloques.', 'Cualquier patrón .rle se puede colocar en cualquier parte de la cuadrícula.'],
    },
    details: [],
    tech: ['Rust', 'Raylib', 'RLE'],
    media: [
      { type: 'video', src: m('gameoflife.mp4'), poster: m('gameoflife.jpg'), caption: { en: 'Patterns evolving', es: 'Patrones evolucionando' } },
    ],
    links: [codeLink('game-of-life-rust')],
  },

  /* ───────────────────────── Systems ───────────────────────── */
  {
    id: 'sitelang',
    title: 'SiteLang',
    category: 'systems',
    period: { en: 'Aug 2026', es: 'Ago. 2026' },
    role: { en: 'Author', es: 'Autor' },
    tagline: {
      en: 'A tiny language that compiles to a website and deploys it.',
      es: 'Un lenguaje pequeño que se compila a un sitio web y lo despliega.',
    },
    summary: {
      en: 'Compiler lab: an ANTLR grammar describes a site; a listener generates index.html, creates a GitHub repository, uploads the file and deploys it through the Vercel API.',
      es: 'Laboratorio de compiladores: una gramática ANTLR describe un sitio; un listener genera index.html, crea un repositorio en GitHub, sube el archivo y lo despliega con la API de Vercel.',
    },
    highlights: {
      en: [
        'Pipeline: SiteLang.g4 → parse tree → SiteListener extracts site data → HTML generation → GitHub repo → Vercel deploy.',
        'Driver in Python reads a .sl program and runs the whole chain.',
      ],
      es: [
        'Pipeline: SiteLang.g4 → árbol de análisis → SiteListener extrae los datos del sitio → generación de HTML → repositorio en GitHub → despliegue en Vercel.',
        'Un driver en Python lee un programa .sl y ejecuta toda la cadena.',
      ],
    },
    details: [],
    tech: ['ANTLR', 'Python', 'GitHub API', 'Vercel API'],
    media: [],
    links: [
      codeLink('lab3-compiladores'),
      { label: { en: 'Video demo', es: 'Video demostrativo' }, href: 'https://youtu.be/3alt9YfJW6Y' },
    ],
  },
];

export const projects: Project[] = raw.map((p) => ({
  ...p,
  title: typeof p.title === 'string' ? { en: p.title, es: p.title } : p.title,
}));

export const projectById = (id: string): Project | undefined => projects.find((p) => p.id === id);

/** Projects featured on the hero chips and the laptop screen, in display order. */
export const featuredProjects = projects.filter((p) => p.featured);

/** Image used as thumbnail / laptop-screen poster, or null when the project has no real capture. */
export function coverImage(p: Project): string | null {
  const first = p.media[0];
  if (!first) return null;
  return first.type === 'video' ? first.poster : first.src;
}
