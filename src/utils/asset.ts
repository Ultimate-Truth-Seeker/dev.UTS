/** Resolves a path inside /public honoring Vite's `base` (GitHub Pages serves under /dev.UTS/). */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
