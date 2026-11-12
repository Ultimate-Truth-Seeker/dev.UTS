import { useState } from 'react';
import styled from '@emotion/styled';
import { FaEnvelope, FaGithub, FaLinkedin, FaTrophy } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useLang } from '../../i18n/context';
import { contact } from '../../data/content';
import { siteConfig } from '../../config';
import { asset } from '../../utils/asset';
import { theme } from '../../styles/theme';
import { GhostButton, GhostButtonEl, Glass, PrimaryButton, SectionLead, SectionTitle, SectionWrap } from '../ui/primitives';

const Box = styled(Glass)`
  padding: 2rem;
  display: grid;
  gap: 1.4rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  align-items: center;
`;

const Social = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all ${theme.transitions.default};
    &:hover {
      color: ${theme.colors.light};
      border-color: ${theme.colors.accent};
      transform: translateY(-2px);
    }
    &:focus-visible {
      outline: 2px solid ${theme.colors.accent};
      outline-offset: 2px;
    }
  }
`;

export default function Contact() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${siteConfig.email}`;
    }
  };

  const socials = [
    { name: contact.links.github, href: siteConfig.github, icon: <FaGithub aria-hidden="true" /> },
    { name: contact.links.linkedin, href: siteConfig.linkedin, icon: <FaLinkedin aria-hidden="true" /> },
    { name: contact.links.icpc, href: siteConfig.icpc, icon: <FaTrophy aria-hidden="true" /> },
    { name: contact.links.x, href: siteConfig.x, icon: <FaXTwitter aria-hidden="true" /> },
  ];

  return (
    <SectionWrap id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionTitle id="contact-title">{t(contact.title)}</SectionTitle>
        <SectionLead>{t(contact.blurb)}</SectionLead>
        <Box>
          <Row>
            <PrimaryButton href={`mailto:${siteConfig.email}`}>
              <FaEnvelope aria-hidden="true" /> {t(contact.email)}
            </PrimaryButton>
            <GhostButtonEl type="button" onClick={copyEmail} aria-live="polite">
              {copied ? t(contact.copied) : `${t(contact.copy)} · ${siteConfig.email}`}
            </GhostButtonEl>
          </Row>

          <Social aria-label="Social">
            {socials.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.icon} {s.name}
                </a>
              </li>
            ))}
          </Social>

          {siteConfig.cv.enabled && (
            <Row aria-label={t(contact.cvTitle)}>
              <GhostButton href={asset(siteConfig.cv.en)} download>
                ⬇ {t(contact.cvEn)}
              </GhostButton>
              <GhostButton href={asset(siteConfig.cv.es)} download>
                ⬇ {t(contact.cvEs)}
              </GhostButton>
            </Row>
          )}
        </Box>
      </div>
    </SectionWrap>
  );
}
