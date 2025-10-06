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
  background: var(--color-card);
  backdrop-filter: blur(10px);
  border-bottom: 3px solid var(--color-primary);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
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
  font-size: 2.5rem;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    color: var(--color-secondary);
  }
  
  &::before {
    content: '🐕';
    font-size: 2rem;
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
  font-weight: 700;
  font-family: var(--font-alt);
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 20px;

  &:hover {
    color: var(--color-text-light);
    background: var(--color-primary);
    transform: translateY(-2px) rotate(-1deg);
    box-shadow: 3px 3px 0px var(--color-secondary);
  }
`;

const WalletButton = styled(motion.button)`
  background: var(--color-secondary);
  color: var(--color-text-light);
  padding: 0.8rem 2rem;
  border-radius: 30px;
  font-weight: 700;
  font-family: var(--font-alt);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  border: 3px solid var(--color-text);
  box-shadow: 3px 3px 0px var(--color-primary);

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px var(--color-primary);
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
          <NavLink href="#about">About Us</NavLink>
          <NavLink href="#mission">Mission</NavLink>
          <NavLink href="#roadmap">Roadmap</NavLink>
          <NavLink href="#leaderboard">Leaderboard</NavLink>
          <NavLink href="#join">Join Us</NavLink>
          
          <WalletButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={active ? disconnectWallet : connectWallet}
          >
            {active
              ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
              : 'Connect Wallet'}
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