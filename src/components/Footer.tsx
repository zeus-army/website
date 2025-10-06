import React from 'react';
import styled from 'styled-components';

const FooterSection = styled.footer`
  background: var(--color-secondary);
  padding: 3rem 2rem;
  text-align: center;
  border-top: 1px solid var(--color-primary);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h3`
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  
  span {
    color: var(--color-accent);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FooterLink = styled.a`
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const Disclaimer = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 2rem auto;
  max-width: 800px;
  line-height: 1.6;
  opacity: 0.8;
`;

const Copyright = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  
  a {
    color: var(--color-primary);
    font-weight: 600;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterSection>
      <FooterContent>
        <Logo>
          Zeus <span>Army</span>
        </Logo>
        
        <FooterLinks>
          <FooterLink href="#about">Quiénes Somos</FooterLink>
          <FooterLink href="#mission">Misión</FooterLink>
          <FooterLink href="#roadmap">Roadmap</FooterLink>
          <FooterLink href="#leaderboard">Leaderboard</FooterLink>
          <FooterLink href="#join">Únete</FooterLink>
        </FooterLinks>
        
        <Disclaimer>
          Zeus Army es una comunidad independiente de holders y entusiastas de ZEUS. 
          No somos asesores financieros. Siempre haz tu propia investigación (DYOR) 
          antes de invertir en cualquier criptomoneda. Las criptomonedas son inversiones 
          de alto riesgo y puedes perder todo tu capital.
        </Disclaimer>
        
        <Copyright>
          © 2024 Zeus Army. Todos los derechos reservados. | 
          Hecho con ⚡ por la comunidad para la comunidad | 
          <a href="https://zeuscoin.vip" target="_blank" rel="noopener noreferrer"> ZEUS Official</a>
        </Copyright>
      </FooterContent>
    </FooterSection>
  );
};

export default Footer;