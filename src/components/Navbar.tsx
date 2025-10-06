import React, { useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../utils/connectors';
import { motion } from 'framer-motion';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-primary);
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  
  span {
    color: var(--color-accent);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: var(--color-text);
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: var(--color-primary);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--color-primary);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const WalletButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: var(--color-background);
  padding: 0.8rem 2rem;
  border-radius: 30px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
  }
`;

const MobileMenu = styled.button`
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 25px;
    height: 3px;
    background: var(--color-primary);
    transition: all 0.3s ease;
  }
`;

const Navbar: React.FC = () => {
  const { active, account, activate, deactivate } = useWeb3React();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const disconnectWallet = () => {
    try {
      deactivate();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <Nav>
      <NavContainer>
        <Logo>
          Zeus <span>Army</span>
        </Logo>
        
        <NavLinks>
          <NavLink href="#about">Quiénes Somos</NavLink>
          <NavLink href="#mission">Misión</NavLink>
          <NavLink href="#roadmap">Roadmap</NavLink>
          <NavLink href="#leaderboard">Leaderboard</NavLink>
          <NavLink href="#join">Únete</NavLink>
          
          <WalletButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={active ? disconnectWallet : connectWallet}
          >
            {active
              ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
              : 'Conectar Wallet'}
          </WalletButton>
        </NavLinks>

        <MobileMenu onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span />
          <span />
          <span />
        </MobileMenu>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;