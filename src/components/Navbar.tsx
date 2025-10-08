import React, { useState } from 'react';
import styled from 'styled-components';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(13, 14, 35, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid transparent;
  border-image: var(--gradient-rainbow) 1;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.5);
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
  background: var(--gradient-rainbow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
  
  span {
    background: linear-gradient(90deg, var(--color-pink), var(--color-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  &::before {
    content: '🐕';
    font-size: 2rem;
    filter: drop-shadow(0 0 10px rgba(75, 183, 73, 0.5));
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
  color: var(--color-text-light);
  font-weight: 700;
  font-family: var(--font-alt);
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  opacity: 0.9;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--gradient-rainbow);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
    
    &::after {
      width: 80%;
    }
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <NavLink href="#leaderboard">Whales</NavLink>
          <NavLink href="#join">Join Us</NavLink>
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