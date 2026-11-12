/** Single place for personal links and switches. Edit here, not in the components. */
export const siteConfig = {
  name: 'Roberto Nájera',
  email: 'robertonajeratics@gmail.com',
  githubUser: 'Ultimate-Truth-Seeker',
  github: 'https://github.com/Ultimate-Truth-Seeker',
  linkedin: 'https://www.linkedin.com/in/roberto-samuel-najera-marroquin-3249b9263/',
  icpc: 'https://icpc.global/ICPCID/ZXJ8FOXZVN20',
  x: 'https://x.com/TruthSeeker2378',
  url: 'https://ultimate-truth-seeker.github.io/dev.UTS/',
  /**
   * CV download buttons. The PDFs in /public/cv are the PUBLIC versions (no phone number).
   * Set `enabled` to false to hide every CV button and command without touching anything else.
   */
  cv: {
    enabled: true,
    en: 'cv/Roberto_Najera_CV_EN.pdf',
    es: 'cv/Roberto_Najera_CV_ES.pdf',
  },
} as const;
