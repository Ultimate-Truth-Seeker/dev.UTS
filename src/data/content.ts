import type { L, LL } from '../i18n/context';

/** Small UI strings shared across components. */
export const ui = {
  skip: { en: 'Skip to main content', es: 'Saltar al contenido principal' },
  brand: 'Roberto Nájera',
  paletteHint: { en: 'Search…', es: 'Buscar…' },
  menu: { en: '☰ Menu', es: '☰ Menú' },
  paletteTitle: { en: 'Command palette', es: 'Paleta de comandos' },
  palettePlaceholder: { en: 'Type a command, section or project…', es: 'Escribe un comando, sección o proyecto…' },
  paletteEmpty: { en: 'Nothing found', es: 'Sin resultados' },
  paletteGroupSections: { en: 'Go to', es: 'Ir a' },
  paletteGroupProjects: { en: 'Projects', es: 'Proyectos' },
  paletteGroupLab: { en: 'Lab demos', es: 'Demos del laboratorio' },
  paletteGroupActions: { en: 'Actions', es: 'Acciones' },
  close: { en: 'Close', es: 'Cerrar' },
  language: { en: 'Language', es: 'Idioma' },
  switchTo: { en: 'Cambiar a español', es: 'Switch to English' },
  caseStudy: { en: 'Case study', es: 'Caso de estudio' },
  technicalDetails: { en: 'Technical details', es: 'Detalles técnicos' },
  highlights: { en: 'What I built', es: 'Qué construí' },
  tryDemo: { en: 'Try the interactive demo', es: 'Probar la demo interactiva' },
  viewCase: { en: 'View case study', es: 'Ver caso de estudio' },
  noVisual: { en: 'Interactive demo or code only', es: 'Solo demo interactiva o código' },
  footerRights: { en: 'All rights reserved.', es: 'Todos los derechos reservados.' },
  footerBuilt: { en: 'Built with React, TypeScript and Three.js.', es: 'Hecho con React, TypeScript y Three.js.' },
  currentSection: { en: 'Current section', es: 'Sección actual' },
};

export const hero = {
  greeting: { en: "Hi, I'm", es: 'Hola, soy' },
  name: 'Roberto Nájera',
  role: {
    en: 'Computer Science student · AI systems, backend & parallel computing',
    es: 'Estudiante de Ciencias de la Computación · sistemas con IA, backend y cómputo paralelo',
  },
  blurb: {
    en: 'I build things where correctness and speed both matter: LLM agents that call real tools, services with clean APIs, and numerical code that scales across cores. First place in Guatemala at the ICPC Gran Premio Centroamericano 2026.',
    es: 'Construyo cosas donde importan tanto la corrección como la velocidad: agentes LLM que llaman herramientas reales, servicios con APIs limpias y código numérico que escala entre núcleos. Primer lugar en Guatemala en el ICPC Gran Premio Centroamericano 2026.',
  },
  availability: {
    en: 'Open to internships and remote roles · Guatemala City (UTC−6)',
    es: 'Disponible para pasantías y trabajo remoto · Ciudad de Guatemala (UTC−6)',
  },
  ctaProjects: { en: 'See my work', es: 'Ver mi trabajo' },
  ctaContact: { en: 'Get in touch', es: 'Contáctame' },
  laptopHint: { en: 'Drag to rotate · the screen follows the project you pick', es: 'Arrastra para girar · la pantalla muestra el proyecto que elijas' },
  featuredLabel: { en: 'Featured projects', es: 'Proyectos destacados' },
  stats: [
    { value: '1st', label: { en: 'Guatemala · ICPC GPCA 2026', es: 'Guatemala · ICPC GPCA 2026' } },
    { value: '3.81×', label: { en: 'OpenMP speedup on 4 cores', es: 'speedup OpenMP en 4 núcleos' } },
    { value: '0.3%', label: { en: 'of parameters trained with LoRA', es: 'de los parámetros entrenados con LoRA' } },
  ] as { value: string; label: L }[],
};

export const about = {
  title: { en: 'About me', es: 'Acerca de mí' },
  paragraphs: {
    en: [
      "I'm a Computer Science student at Universidad del Valle de Guatemala (expected December 2027) with the highest academic distinction every year since I started.",
      'I got into programming through competitions: first place in Guatemala at the 2026 ICPC Gran Premio Centroamericano (second in 2025), and best team from my university both times. That is where I learned to reason about complexity and to debug under pressure.',
      'Today I like three kinds of problems: making LLMs reliable by giving them tools instead of trusting their arithmetic, building web backends that other people can maintain, and squeezing real speedups out of parallel code, then measuring honestly where it stops scaling.',
    ],
    es: [
      'Soy estudiante de Ciencias de la Computación en la Universidad del Valle de Guatemala (graduación esperada en diciembre de 2027), con la máxima distinción académica cada año desde que empecé.',
      'Llegué a la programación por las competencias: primer lugar en Guatemala en el ICPC Gran Premio Centroamericano 2026 (segundo en 2025) y mejor equipo de mi universidad en ambos años. Ahí aprendí a razonar sobre complejidad y a depurar bajo presión.',
      'Hoy me interesan tres tipos de problemas: hacer confiables a los LLM dándoles herramientas en lugar de confiar en su aritmética, construir backends web que otros puedan mantener y sacar aceleraciones reales del código paralelo, midiendo con honestidad dónde deja de escalar.',
    ],
  } as LL,
  facts: [
    { label: { en: 'Studying', es: 'Estudio' }, value: { en: 'B.Sc. Computer Science & IT, UVG', es: 'Lic. en Ciencias de la Computación y TI, UVG' } },
    { label: { en: 'Languages', es: 'Idiomas' }, value: { en: 'Spanish (native), English (C1)', es: 'Español (nativo), inglés (C1)' } },
    { label: { en: 'Looking for', es: 'Busco' }, value: { en: 'Internships · remote roles · junior positions', es: 'Pasantías · trabajo remoto · puestos junior' } },
    { label: { en: 'Time zone', es: 'Zona horaria' }, value: { en: 'UTC−6, no daylight saving', es: 'UTC−6, sin horario de verano' } },
  ] as { label: L; value: L }[],
};

export const labText = {
  title: { en: 'Lab', es: 'Laboratorio' },
  subtitle: {
    en: 'Three interactive pieces that run entirely in your browser.',
    es: 'Tres piezas interactivas que corren completamente en tu navegador.',
  },
  tabs: {
    quant: { en: 'QuantDesk MCP', es: 'QuantDesk MCP' },
    nbody: { en: 'N-body + Workers', es: 'N-cuerpos + Workers' },
    lora: { en: 'LoRA vs fine-tuning', es: 'LoRA vs fine-tuning' },
  },
};

export interface ExperienceItem {
  id: string;
  title: L;
  org: string;
  period: L;
  place?: L;
  stack?: string;
  bullets: LL;
}

/** Pacifiko content is intentionally generic: no code, screenshots or business figures. */
export const experience = {
  title: { en: 'Experience', es: 'Experiencia' },
  items: [
    {
      id: 'pacifiko',
      title: { en: 'Full Stack Junior Developer', es: 'Desarrollador Full Stack Junior' },
      org: 'Pacifiko.com',
      period: { en: 'Feb – Jun 2026', es: 'Feb. – Jun. 2026' },
      stack: 'PHP, OpenCart, MySQL, Python, AWS, Jenkins',
      bullets: {
        en: [
          'Integrated AI agent pipelines in Python to automate catalogue enrichment for several thousand products (after discarding low-quality ones), saving hundreds of hours of manual work and improving attribute coverage.',
          'Designed and built an Extended Warranty feature: defined its architecture and refactored legacy warranty logic into a scalable solution, made for electronics but configurable for any category.',
          'Designed the AWS architecture of a planned BNPL (buy now, pay later) platform with external providers for the core lender, identity verification and eligibility analytics, plus databases, the storefront widget, NAT configuration and access permissions.',
        ],
        es: [
          'Integré pipelines de agentes de IA en Python para automatizar el enriquecimiento del catálogo (varios miles de productos, tras descartar los de baja calidad), ahorrando cientos de horas de trabajo manual y mejorando la cobertura de atributos.',
          'Diseñé e implementé la funcionalidad de Garantía Extendida: definí su arquitectura y refactoricé la lógica heredada de garantías hacia una solución escalable, pensada para electrónicos y configurable para cualquier categoría.',
          'Diseñé la arquitectura en AWS de una plataforma BNPL (compra ahora, paga después) planificada, con proveedores externos para el core lender, la verificación de identidad y el análisis de elegibilidad, además de bases de datos, el widget en la tienda, la configuración NAT y los permisos de acceso.',
        ],
      },
    },
    {
      id: 'ta',
      title: { en: 'Undergraduate Teaching Assistant', es: 'Auxiliar de cátedra' },
      org: 'Universidad del Valle de Guatemala',
      period: { en: 'Jan 2025 – Jun 2026', es: 'Ene. 2025 – Jun. 2026' },
      bullets: {
        en: [
          'Teaching assistant for Introduction to IT, Programming Fundamentals and Probability Theory.',
          'Supported grading, project evaluation and concept reinforcement for 100+ students.',
          'Gave special Calculus tutoring to struggling students, who went on to pass the course.',
        ],
        es: [
          'Asistente de cátedra en Introducción a Tecnologías de la Información, Fundamentos de Programación y Teoría de Probabilidades.',
          'Apoyé en la calificación, la evaluación de proyectos y el reforzamiento de conceptos para más de 100 estudiantes.',
          'Brindé tutorías especiales de Cálculo a estudiantes con dificultades, quienes lograron aprobar el curso.',
        ],
      },
    },
    {
      id: 'ada',
      title: { en: 'Spring Bootcamp', es: 'Bootcamp de Spring' },
      org: 'Ada School · Proyecto Innova – Swisscontact',
      period: { en: 'Mar – Jun 2024', es: 'Mar. – Jun. 2024' },
      bullets: {
        en: [
          'Backend design, RESTful APIs, authentication and database systems with Spring.',
          'Practice projects with ACID principles and layered architecture; JWT authentication and SQL/NoSQL connections.',
        ],
        es: [
          'Diseño backend, APIs RESTful, autenticación y sistemas de bases de datos con Spring.',
          'Proyectos prácticos con principios ACID y arquitectura por capas; autenticación JWT y conexiones SQL/NoSQL.',
        ],
      },
    },
    {
      id: 'omegaup',
      title: { en: 'Mentorship programme “Juntos Llenamos la Copa”', es: 'Programa de mentoría «Juntos Llenamos la Copa»' },
      org: 'OmegaUp',
      period: { en: 'May – Oct 2023', es: 'May. – Oct. 2023' },
      bullets: {
        en: ['Selected as a prize for top performance in a programming competition; mentored by Google engineers on software skills and Big Tech work environments.'],
        es: ['Seleccionado como reconocimiento por mi desempeño en una competencia de programación; mentoría de ingenieros de Google sobre habilidades de software y entornos Big Tech.'],
      },
    },
  ] as ExperienceItem[],
};

export interface AwardItem {
  id: string;
  title: L;
  year: string;
  detail: L;
  link?: { label: L; href: string };
}

export const awards = {
  title: { en: 'Awards & competitions', es: 'Premios y competencias' },
  items: [
    {
      id: 'icpc26',
      title: { en: 'ICPC Gran Premio Centroamericano 2026', es: 'ICPC Gran Premio Centroamericano 2026' },
      year: '2026',
      detail: {
        en: '1st place in Guatemala (60 teams; 124 across Central America), within the ICPC Latin American Regional. Best team from UVG.',
        es: '1.er lugar en Guatemala (60 equipos; 124 en Centroamérica), dentro de la Regional Latinoamericana del ICPC. Mejor equipo de la UVG.',
      },
    },
    {
      id: 'icpc25',
      title: { en: 'ICPC Gran Premio Centroamericano 2025', es: 'ICPC Gran Premio Centroamericano 2025' },
      year: '2025',
      detail: {
        en: '2nd place in Guatemala (36 teams; 93 across Central America). Best team from UVG.',
        es: '2.º lugar en Guatemala (36 equipos; 93 en Centroamérica). Mejor equipo de la UVG.',
      },
    },
    {
      id: 'copa',
      title: { en: 'Copa Centroamericana de Programación', es: 'Copa Centroamericana de Programación' },
      year: '2023',
      detail: { en: 'National champion (hosted by OmegaUp).', es: 'Campeón nacional (organizada por OmegaUp).' },
    },
    {
      id: 'oib',
      title: { en: 'Olimpiada Iberoamericana de Biología', es: 'Olimpiada Iberoamericana de Biología' },
      year: '2022',
      detail: { en: 'Silver medal: best result achieved by Guatemala to date.', es: 'Medalla de plata: mejor resultado alcanzado por Guatemala hasta la fecha.' },
    },
    {
      id: 'usac',
      title: { en: 'Olimpiada Nacional de Ciencias USAC', es: 'Olimpiada Nacional de Ciencias USAC' },
      year: '2022',
      detail: { en: 'Silver medal in Biology.', es: 'Medalla de plata en Biología.' },
    },
  ] as AwardItem[],
};

export interface SkillGroup {
  id: string;
  title: L;
  items: string[];
}

export const skills = {
  title: { en: 'Skills', es: 'Habilidades' },
  groups: [
    { id: 'lang', title: { en: 'Languages', es: 'Lenguajes' }, items: ['Python', 'C / C++', 'SQL', 'Java', 'JavaScript', 'TypeScript', 'Rust', 'PHP', 'Kotlin', 'Go', 'R'] },
    { id: 'ai', title: { en: 'AI & data', es: 'IA y datos' }, items: ['PyTorch', 'Hugging Face', 'LoRA / PEFT', 'LLM agents', 'MCP', 'pandas', 'NumPy', 'SciPy', 'Matplotlib', 'SHAP'] },
    { id: 'web', title: { en: 'Web & backend', es: 'Web y backend' }, items: ['Django', 'Next.js', 'React', 'Node.js', 'Spring Boot', 'OpenCart', 'Vite', 'REST', 'JWT / OAuth'] },
    { id: 'cloud', title: { en: 'Cloud & DevOps', es: 'Nube y DevOps' }, items: ['AWS', 'Google Cloud', 'Docker', 'Jenkins', 'CI/CD', 'Git'] },
    { id: 'hpc', title: { en: 'Parallel, compilers & graphics', es: 'Paralelo, compiladores y gráficas' }, items: ['OpenMP', 'MPI', 'CUDA', 'Rayon', 'ANTLR', 'Three.js', 'Raylib', 'SDL2'] },
  ] as SkillGroup[],
  githubTitle: { en: 'Live from GitHub', es: 'En vivo desde GitHub' },
  githubLoading: { en: 'Loading repositories…', es: 'Cargando repositorios…' },
  githubFallback: {
    en: 'Showing a saved snapshot (GitHub API unavailable).',
    es: 'Mostrando una copia guardada (API de GitHub no disponible).',
  },
  githubUpdated: { en: 'updated', es: 'actualizado' },
  githubRepos: { en: 'public repositories', es: 'repositorios públicos' },
  githubStars: { en: 'stars', es: 'estrellas' },
  githubLatest: { en: 'Recently updated', es: 'Actualizados recientemente' },
  githubLanguages: { en: 'Top languages', es: 'Lenguajes principales' },
};

export const contact = {
  title: { en: "Let's talk", es: 'Hablemos' },
  blurb: {
    en: "I'm looking for internships and remote opportunities where I can contribute from day one and keep learning. The fastest way to reach me is email.",
    es: 'Busco pasantías y oportunidades remotas donde pueda aportar desde el primer día y seguir aprendiendo. La forma más rápida de contactarme es el correo.',
  },
  email: { en: 'Email me', es: 'Escríbeme' },
  copy: { en: 'Copy email', es: 'Copiar correo' },
  copied: { en: 'Copied!', es: '¡Copiado!' },
  cvTitle: { en: 'Résumé', es: 'Currículum' },
  cvEn: { en: 'Download CV (English)', es: 'Descargar CV (inglés)' },
  cvEs: { en: 'Download CV (Spanish)', es: 'Descargar CV (español)' },
  links: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    icpc: 'ICPC',
    x: 'X',
  },
};
