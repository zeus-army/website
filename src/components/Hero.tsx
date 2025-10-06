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

const ZeusEmoji = styled(motion.div)`
  font-size: 8rem;
  margin-bottom: 2rem;
  filter: drop-shadow(0 0 30px rgba(75, 183, 73, 0.5));
`;

const Title = styled(motion.h1)`
  font-size: clamp(4rem, 10vw, 8rem);
  margin-bottom: 1rem;
  text-transform: uppercase;
  line-height: 0.9;
  transform: rotate(-2deg);
  
  span {
    display: block;
    font-size: clamp(2rem, 5vw, 4rem);
    color: var(--color-secondary);
    transform: rotate(1deg);
    margin-bottom: 0.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.8rem;
  color: var(--color-text);
  margin-bottom: 3rem;
  font-weight: 700;
  font-family: var(--font-alt);
  background: var(--color-accent);
  padding: 0.5rem 2rem;
  display: inline-block;
  border-radius: 30px;
  transform: rotate(-1deg);
  box-shadow: 5px 5px 0px var(--color-primary);
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(motion.a)`
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
  display: inline-block;
  font-family: var(--font-alt);
  font-size: 1.2rem;
  border: 3px solid var(--color-text);
  position: relative;

  &.primary {
    background: var(--color-primary);
    color: var(--color-text-light);
    box-shadow: 5px 5px 0px var(--color-secondary);

    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: 7px 7px 0px var(--color-secondary);
    }
  }

  &.secondary {
    background: var(--color-secondary);
    color: var(--color-text-light);
    box-shadow: 5px 5px 0px var(--color-primary);

    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: 7px 7px 0px var(--color-primary);
    }
  }
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  font-size: 3rem;
  opacity: 0.7;
  
  &.bone {
    animation: float 6s ease-in-out infinite;
  }
  
  &.paw {
    animation: float 8s ease-in-out infinite reverse;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(10deg); }
  }
`;

const Hero: React.FC = () => {
  const bounceVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <HeroSection>
      <FloatingElement className="bone" style={{ top: '10%', left: '5%' }}>🦴</FloatingElement>
      <FloatingElement className="paw" style={{ top: '20%', right: '10%' }}>🐾</FloatingElement>
      <FloatingElement className="bone" style={{ bottom: '15%', left: '10%' }}>🦴</FloatingElement>
      <FloatingElement className="paw" style={{ bottom: '25%', right: '5%' }}>🐾</FloatingElement>
      <FloatingElement style={{ top: '50%', left: '2%' }}>💚</FloatingElement>
      <FloatingElement style={{ top: '60%', right: '3%' }}>✨</FloatingElement>

      <HeroContent>
        <ZeusEmoji
          animate="animate"
          variants={bounceVariants}
        >
          🐕
        </ZeusEmoji>
        <Title
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ scale: 1.05 }}
        >
          <span>Welcome to the</span>
          ZEUS ARMY
        </Title>
        
        <Subtitle
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: -1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          🌟 Pepe's Best Friend is Here! 🌟
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
            Join the Pack 🚀
          </CTAButton>
          <CTAButton
            href="#leaderboard"
            className="secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Leaderboard 🏆
          </CTAButton>
        </CTAContainer>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero;