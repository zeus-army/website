import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid transparent;
    background-image: linear-gradient(#fff, #fff), var(--gradient-rainbow);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    box-shadow: 0 0 15px rgba(165, 94, 234, 0.6);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.1) rotate(5deg);
    }
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

const NavLinkBase = `
  color: var(--color-text-light);
  font-weight: 700;
  font-family: var(--font-alt);
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  opacity: 0.9;
  text-decoration: none;

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

const NavLink = styled.a`
  ${NavLinkBase}
`;

const NavLinkRouter = styled(Link)`
  ${NavLinkBase}
`;

const MobileMenu = styled.button<{ $isOpen: boolean }>`
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 25px;
    height: 3px;
    background: var(--color-primary);
    transition: all 0.3s ease;

    ${({ $isOpen }) => $isOpen && `
      &:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      &:nth-child(2) {
        opacity: 0;
      }
      &:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
    `}
  }
`;

const MobileMenuContainer = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: rgba(13, 14, 35, 0.98);
    backdrop-filter: blur(20px);
    padding: 2rem;
    gap: 1.5rem;
    transform: ${({ $isOpen }) => $isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border-bottom: 2px solid var(--color-primary);
  }
`;

const MobileNavLink = styled.a`
  color: var(--color-text-light);
  font-weight: 700;
  font-family: var(--font-alt);
  font-size: 1.2rem;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;

  &:hover {
    background: var(--color-primary);
    color: #000;
  }
`;

const MobileNavLinkRouter = styled(Link)`
  color: var(--color-text-light);
  font-weight: 700;
  font-family: var(--font-alt);
  font-size: 1.2rem;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;

  &:hover {
    background: var(--color-primary);
    color: #000;
  }
`;

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Nav>
      <NavContainer>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo>
            <img src="/images/zeus.jpg" alt="Zeus" />
            Zeus <span>Army</span>
          </Logo>
        </Link>

        <NavLinks>
          <NavLink href="/#mission">Mission</NavLink>
          <NavLinkRouter to="/makeit">Make It</NavLinkRouter>
          <NavLink href="/#leaderboard">Leaders</NavLink>
          <NavLinkRouter to="/holders">Holders</NavLinkRouter>
          <NavLinkRouter to="/governance">Governance</NavLinkRouter>
        </NavLinks>

        <MobileMenu $isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span />
          <span />
          <span />
        </MobileMenu>
      </NavContainer>

      <MobileMenuContainer $isOpen={mobileMenuOpen}>
        <MobileNavLink href="/#mission" onClick={() => setMobileMenuOpen(false)}>Mission</MobileNavLink>
        <MobileNavLinkRouter to="/makeit" onClick={() => setMobileMenuOpen(false)}>Make It</MobileNavLinkRouter>
        <MobileNavLink href="/#leaderboard" onClick={() => setMobileMenuOpen(false)}>Leaders</MobileNavLink>
        <MobileNavLinkRouter to="/holders" onClick={() => setMobileMenuOpen(false)}>Holders</MobileNavLinkRouter>
        <MobileNavLinkRouter to="/governance" onClick={() => setMobileMenuOpen(false)}>Governance</MobileNavLinkRouter>
      </MobileMenuContainer>
    </Nav>
  );
};

export default Navbar;