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

  /* Background image from zeuscoin.vip */
  background-image: url('/images/hero-bg.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;

  /* Overlay for better text readability */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 14, 39, 0.3);
    z-index: 0;
  }

  /* Additional decorative layer */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/images/hero-bg2.webp');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.6;
    z-index: 0;
    animation: fadeInOut 8s ease-in-out infinite;
  }

  @keyframes fadeInOut {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const HeroContent = styled.div`
  text-align: center;
  z-index: 10;
  max-width: 1000px;
  position: relative;
`;

const ZeusEmoji = styled(motion.div)`
  margin-bottom: 2rem;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    border: 5px solid transparent;
    background-image: linear-gradient(#fff, #fff), var(--gradient-rainbow);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    box-shadow:
      0 0 40px rgba(165, 94, 234, 0.8),
      0 0 80px rgba(30, 144, 255, 0.6),
      0 10px 50px rgba(0, 0, 0, 0.5);
    animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite alternate;

    &:hover {
      animation: spin 1s linear infinite, float 3s ease-in-out infinite;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes glow {
    0% { box-shadow: 0 0 40px rgba(165, 94, 234, 0.8), 0 0 80px rgba(30, 144, 255, 0.6), 0 10px 50px rgba(0, 0, 0, 0.5); }
    100% { box-shadow: 0 0 60px rgba(165, 94, 234, 1), 0 0 100px rgba(30, 144, 255, 0.8), 0 10px 50px rgba(0, 0, 0, 0.5); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Title = styled(motion.h1)`
  font-size: clamp(4rem, 10vw, 8rem);
  margin-bottom: 1rem;
  text-transform: uppercase;
  line-height: 0.9;
  transform: rotate(-2deg);
  position: relative;
  z-index: 1;
  
  span {
    display: block;
    font-size: clamp(2rem, 5vw, 4rem);
    background: linear-gradient(90deg, var(--color-yellow), var(--color-pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: rotate(1deg);
    margin-bottom: 0.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.8rem;
  color: var(--color-text-light);
  margin-bottom: 3rem;
  font-weight: 700;
  font-family: var(--font-alt);
  background: var(--gradient-rainbow);
  padding: 0.8rem 2.5rem;
  display: inline-block;
  border-radius: 50px;
  transform: rotate(-1deg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3),
              inset 0 2px 10px rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(motion.a)`
  padding: 1.5rem 3.5rem;
  border-radius: 60px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  transition: all 0.3s ease;
  display: inline-block;
  font-family: var(--font-display);
  font-size: 1.4rem;
  border: 5px solid #000;
  position: relative;
  cursor: pointer !important;
  pointer-events: auto !important;
  z-index: 100;
  transform: rotate(-2deg);

  &.primary {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #000;
    box-shadow:
      0 8px 0 #000,
      0 10px 30px rgba(0, 0, 0, 0.4);
    text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);

    &:hover {
      transform: translateY(-5px) rotate(-2deg) scale(1.05);
      box-shadow:
        0 12px 0 #000,
        0 15px 40px rgba(255, 215, 0, 0.6);
    }

    &:active {
      transform: translateY(0) rotate(-2deg);
      box-shadow:
        0 4px 0 #000,
        0 5px 20px rgba(0, 0, 0, 0.4);
    }
  }

  &.secondary {
    background: linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%);
    color: #000;
    box-shadow:
      0 8px 0 #000,
      0 10px 30px rgba(0, 0, 0, 0.4);
    text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
    transform: rotate(2deg);

    &:hover {
      transform: translateY(-5px) rotate(2deg) scale(1.05);
      box-shadow:
        0 12px 0 #000,
        0 15px 40px rgba(30, 144, 255, 0.6);
    }

    &:active {
      transform: translateY(0) rotate(2deg);
      box-shadow:
        0 4px 0 #000,
        0 5px 20px rgba(0, 0, 0, 0.4);
    }
  }
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  font-size: 3rem;
  opacity: 0.7;
  filter: brightness(1.5);
  pointer-events: none;
  z-index: 0;

  &.bone {
    animation: float 6s ease-in-out infinite;
    filter: drop-shadow(0 0 10px var(--color-yellow));
  }

  &.paw {
    animation: float 8s ease-in-out infinite reverse;
    filter: drop-shadow(0 0 10px var(--color-pink));
  }

  &.rainbow {
    font-size: 4rem;
    animation: rainbowFloat 10s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(10deg); }
  }
  
  @keyframes rainbowFloat {
    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
    25% { transform: translateY(-20px) rotate(5deg) scale(1.1); }
    50% { transform: translateY(-40px) rotate(-5deg) scale(1); }
    75% { transform: translateY(-20px) rotate(5deg) scale(1.1); }
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
      <FloatingElement className="bone" style={{ top: '10%', left: '5%' }}>⚡</FloatingElement>
      <FloatingElement className="paw" style={{ top: '20%', right: '10%' }}>☁️</FloatingElement>
      <FloatingElement className="rainbow" style={{ top: '15%', left: '50%' }}>🌈</FloatingElement>
      <FloatingElement className="bone" style={{ bottom: '15%', left: '10%' }}>⚡</FloatingElement>
      <FloatingElement className="paw" style={{ bottom: '25%', right: '5%' }}>☁️</FloatingElement>
      <FloatingElement className="rainbow" style={{ bottom: '20%', right: '40%' }}>🌈</FloatingElement>
      <FloatingElement style={{ top: '50%', left: '2%' }}>⚡</FloatingElement>
      <FloatingElement style={{ top: '60%', right: '3%' }}>✨</FloatingElement>
      <FloatingElement className="bone" style={{ top: '35%', left: '15%' }}>☁️</FloatingElement>
      <FloatingElement className="paw" style={{ bottom: '40%', right: '15%' }}>⚡</FloatingElement>

      <HeroContent>
        <ZeusEmoji
          animate="animate"
          variants={bounceVariants}
        >
          <img src="/images/zeus.jpg" alt="Zeus" />
        </ZeusEmoji>
        <Title
          data-text="ZEUS ARMY"
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
            Leaders 🏆
          </CTAButton>
        </CTAContainer>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero;