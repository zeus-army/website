import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AnnouncementSection = styled.section`
  position: relative;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(165, 94, 234, 0.15) 100%);
  border-top: 3px solid rgba(255, 215, 0, 0.5);
  border-bottom: 3px solid rgba(255, 215, 0, 0.5);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 215, 0, 0.1),
      transparent
    );
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Badge = styled(motion.span)`
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  font-family: var(--font-body);
  font-weight: 900;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 25px;
  border: 3px solid #000;
  box-shadow: 0 4px 0 #000;
  margin-bottom: 1rem;
`;

const Title = styled(motion.h2)`
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: #FFFFFF;
  margin-bottom: 1rem;
  text-shadow:
    0 0 20px rgba(255, 221, 89, 0.8),
    3px 3px 0px #000000,
    4px 4px 0px #1a1a1a;
  text-transform: uppercase;
  line-height: 1.2;
`;

const Description = styled(motion.p)`
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 0;

  strong {
    background: var(--gradient-zeus);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButton = styled(motion(Link))`
  padding: 1.5rem 3rem;
  border-radius: 60px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-family: var(--font-display);
  font-size: 1.3rem;
  border: 5px solid #000;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
  box-shadow:
    0 8px 0 #000,
    0 10px 30px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  display: inline-block;
  text-decoration: none;
  position: relative;
  transform: rotate(-2deg);

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

  @media (max-width: 768px) {
    width: 100%;
    padding: 1.2rem 2rem;
    font-size: 1.1rem;
  }
`;

const FloatingEmoji = styled(motion.div)`
  font-size: 4rem;
  opacity: 0.7;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
  position: absolute;
  pointer-events: none;
  z-index: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ENSAnnouncement: React.FC = () => {
  return (
    <AnnouncementSection>
      <FloatingEmoji
        style={{ top: '10%', left: '5%' }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        ⚡
      </FloatingEmoji>

      <FloatingEmoji
        style={{ top: '20%', right: '8%' }}
        animate={{
          y: [0, -30, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        🌟
      </FloatingEmoji>

      <FloatingEmoji
        style={{ bottom: '15%', right: '5%' }}
        animate={{
          y: [0, -25, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        ✨
      </FloatingEmoji>

      <Container>
        <Content>
          <Badge
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: -2 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          >
            🔥 New Feature
          </Badge>

          <Title
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get Your Zeus Army ENS! 🌟
          </Title>

          <Description
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <strong>Stand out in the community</strong> with your own{' '}
            <strong>zeuscc8.eth</strong> subdomain! Make your Ethereum address memorable
            and show your commitment to Zeus Army. <strong>6+ characters are FREE!</strong> 🎉
          </Description>
        </Content>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CTAButton
            to="/ens"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Claim Now! 🚀
          </CTAButton>
        </motion.div>
      </Container>
    </AnnouncementSection>
  );
};

export default ENSAnnouncement;
