import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const JoinSection = styled.section`
  padding: 5rem 2rem;
  position: relative;
  overflow: hidden;
  min-height: 90vh;

  /* Main join background */
  background-image: url('/images/join-bg.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;

  /* Light overlay for better readability */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
`;

const SectionTitle = styled(motion.h2)`
  margin-bottom: 2rem;
  position: relative;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const StepCard = styled(motion.div)`
  background: var(--color-card);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-5px);
    
    .step-number {
      transform: scale(1.1);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      transparent,
      rgba(255, 215, 0, 0.05) 70%,
      transparent
    );
    animation: rotate 30s linear infinite;
    pointer-events: none;
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  border: 5px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  color: #000;
  font-family: var(--font-display);
  box-shadow:
    0 6px 0 #000,
    0 8px 20px rgba(0, 0, 0, 0.3);
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
`;

const StepTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
`;

const StepDescription = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
`;

const CTAContainer = styled(motion.div)`
  margin-top: 4rem;
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

const steps = [
  {
    number: "1",
    title: "Get ZEUS",
    description: "Buy ZEUS on your favorite exchange or swap on Uniswap"
  },
  {
    number: "2",
    title: "Join the Telegram Channel",
    description: "Connect with the community and stay updated"
  },
  {
    number: "3",
    title: "Be Active",
    description: "Share memes, ideas and help grow the Army"
  }
];

const JoinUs: React.FC = () => {
  return (
    <JoinSection id="join">
      <Container>
        <SectionTitle
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Join the Zeus Army
        </SectionTitle>

        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Become part of the most loyal pack in crypto.
          The moon awaits! 🌙
        </Subtitle>
        
        <StepsContainer>
          {steps.map((step, index) => (
            <StepCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <StepNumber className="step-number">{step.number}</StepNumber>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </StepCard>
          ))}
        </StepsContainer>
        
        <CTAContainer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <CTAButton
            href="https://app.uniswap.org/swap?chain=mainnet&inputCurrency=NATIVE&outputCurrency=0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8"
            target="_blank"
            rel="noopener noreferrer"
            className="primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Buy ZEUS Now
          </CTAButton>
          <CTAButton
            href="https://era.guild.xyz/zeus/"
            target="_blank"
            rel="noopener noreferrer"
            className="secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Telegram
          </CTAButton>
        </CTAContainer>
      </Container>
    </JoinSection>
  );
};

export default JoinUs;