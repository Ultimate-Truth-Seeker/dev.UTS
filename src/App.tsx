import { lazy, Suspense } from 'react';
import { ThemeProvider } from '@emotion/react';
import { Layout } from './components/layout/Layout';
import { Hero } from './components/sections/Hero';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { LanguageProvider } from './i18n/LanguageProvider';
import { UIProvider } from './context/UIProvider';

// Everything below the fold is split out so the hero (LCP) loads first.
const About = lazy(() => import('./components/sections/About'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Playground = lazy(() => import('./components/sections/Playground'));
const Experience = lazy(() => import('./components/sections/Experience'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Contact = lazy(() => import('./components/sections/Contact'));
const ProjectModal = lazy(() => import('./components/sections/ProjectModal'));

function App() {
  return (
    <LanguageProvider>
      <UIProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Layout>
            <Hero />
            <Suspense fallback={null}>
              <About />
              <Projects />
              <Playground />
              <Experience />
              <Skills />
              <Contact />
              <ProjectModal />
            </Suspense>
          </Layout>
        </ThemeProvider>
      </UIProvider>
    </LanguageProvider>
  );
}

export default App;
