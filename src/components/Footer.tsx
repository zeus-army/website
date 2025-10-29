import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterSection = styled.footer`
  background: var(--color-card);
  padding: 3rem 2rem;
  text-align: center;
  border-top: 4px solid var(--color-primary);
  position: relative;
  overflow: hidden;
  margin-top: 5rem;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '🐾';
    position: absolute;
    font-size: 15rem;
    opacity: 0.05;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
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
  position: relative;
  z-index: 1;
`;

const FooterLinkBase = `
  color: var(--color-text-light);
  font-weight: 700;
  font-family: var(--font-alt);
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-decoration: none;

  &:hover {
    background: var(--color-primary);
    color: #000;
    transform: translateY(-2px);
  }
`;

const FooterLink = styled.a`
  ${FooterLinkBase}
`;

const FooterLinkRouter = styled(Link)`
  ${FooterLinkBase}
`;

const Disclaimer = styled.p`
  color: #2C2C2C;
  font-size: 1rem;
  margin: 2rem auto;
  max-width: 800px;
  line-height: 1.6;
  font-family: var(--font-body);
  font-weight: 700;
  background: rgba(255, 229, 92, 0.9);
  padding: 1.5rem;
  border-radius: 20px;
  border: 3px solid var(--color-primary);
  position: relative;
  z-index: 1;
`;

const Copyright = styled.p`
  color: var(--color-text-light);
  font-size: 0.9rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
  font-weight: 600;

  a {
    color: var(--color-primary);
    font-weight: 700;
    text-decoration: underline;
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
          <FooterLink href="/#mission">Mission</FooterLink>
          <FooterLinkRouter to="/makeit">Make It</FooterLinkRouter>
          <FooterLink href="/#leaderboard">Leaders</FooterLink>
          <FooterLinkRouter to="/holders">Holders</FooterLinkRouter>
          <FooterLinkRouter to="/governance">Governance</FooterLinkRouter>
        </FooterLinks>
        
        <Disclaimer>
          ⚠️ Zeus Army is a community of diamond-pawed holders and ZEUS enthusiasts. 
          We are not financial advisors - we're just dogs who love memes! Always DYOR 
          (Do Your Own Research) before aping in. Remember: crypto is risky, you could 
          lose all your treats... I mean, capital! Woof responsibly! 🐕
        </Disclaimer>
        
        <Copyright>
          © 2025 Zeus Army. All paws reserved. |
          Made with 💙 by the pack for the pack |
          <a href="https://zeuscoin.vip" target="_blank" rel="noopener noreferrer"> ZEUS Official</a>
        </Copyright>
      </FooterContent>
    </FooterSection>
  );
};

export default Footer;