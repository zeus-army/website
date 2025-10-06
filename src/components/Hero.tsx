import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  position: relative;
  overflow: hidden;
`;

const HeroContent = styled.div`
  text-align: center;
  z-index: 1;
  max-width: 1000px;
`;

const Title = styled(motion.h1)`
  font-size: clamp(4rem, 10vw, 8rem);
  margin-bottom: 1rem;
  text-transform: uppercase;
  line-height: 0.9;
  
  span {
    display: block;
    font-size: clamp(2rem, 5vw, 4rem);
    color: var(--color-text);
    -webkit-text-fill-color: initial;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  margin-bottom: 3rem;
  font-weight: 300;
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(motion.a)`
  padding: 1rem 3rem;
  border-radius: 50px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
  display: inline-block;

  &.primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    color: var(--color-background);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
    }
  }

  &.secondary {
    border: 2px solid var(--color-primary);
    color: var(--color-primary);
    background: transparent;

    &:hover {
      background: var(--color-primary);
      color: var(--color-background);
    }
  }
`;

const Lightning = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  svg {
    position: absolute;
    width: 100px;
    height: 200px;
    fill: var(--color-primary);
    opacity: 0.3;
  }
`;

const Hero: React.FC = () => {
  const lightningVariants = {
    animate: {
      opacity: [0, 1, 0],
      transition: {
        duration: 0.2,
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 2
      }
    }
  };

  return (
    <HeroSection>
      <Lightning
        initial={{ opacity: 0 }}
        animate="animate"
        variants={lightningVariants}
        style={{ top: '20%', left: '10%' }}
      >
        <svg viewBox="0 0 100 200">
          <path d="M40,0 L20,80 L40,80 L10,200 L50,70 L30,70 L60,0 Z" />
        </svg>
      </Lightning>

      <Lightning
        initial={{ opacity: 0 }}
        animate="animate"
        variants={lightningVariants}
        style={{ top: '30%', right: '15%' }}
      >
        <svg viewBox="0 0 100 200">
          <path d="M40,0 L20,80 L40,80 L10,200 L50,70 L30,70 L60,0 Z" />
        </svg>
      </Lightning>

      <HeroContent>
        <Title
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span>Bienvenido a la</span>
          Zeus Army
        </Title>
        
        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          La comunidad más poderosa del Olimpo crypto
        </Subtitle>
        
        <CTAContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <CTAButton
            href="#join"
            className="primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Únete a la Army
          </CTAButton>
          <CTAButton
            href="#leaderboard"
            className="secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ver Leaderboard
          </CTAButton>
        </CTAContainer>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero;