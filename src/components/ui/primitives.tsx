import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

export const SectionWrap = styled.section`
  padding: 5rem 0;
  scroll-margin-top: 4.5rem;
  color: ${theme.colors.textLight};
`;

export const SectionTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  color: ${theme.colors.light};
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
`;

export const SectionLead = styled.p`
  max-width: 62ch;
  opacity: 0.8;
  margin-bottom: ${theme.spacing.lg};
`;

export const Glass = styled.div`
  /* no backdrop-filter: blurring many panels over the animated particle canvas is costly on low-end GPUs */
  background: rgba(42, 45, 62, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
`;

export const Chip = styled.span`
  display: inline-block;
  font-size: 0.78rem;
  line-height: 1;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(0, 255, 255, 0.08);
  border: 1px solid rgba(0, 255, 255, 0.25);
  color: ${theme.colors.light};
`;

const buttonBase = `
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  &:hover { transform: translateY(-2px); }
  &:focus-visible { outline: 2px solid ${theme.colors.accent}; outline-offset: 3px; }
`;

export const PrimaryButton = styled.a`
  ${buttonBase}
  background: ${theme.colors.accent};
  color: ${theme.colors.textDark};
  &:hover { box-shadow: 0 6px 20px rgba(0, 255, 255, 0.3); }
`;

export const GhostButton = styled.a`
  ${buttonBase}
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: ${theme.colors.textLight};
  &:hover { background: rgba(255, 255, 255, 0.12); }
`;

export const PrimaryButtonEl = PrimaryButton.withComponent('button');
export const GhostButtonEl = GhostButton.withComponent('button');
