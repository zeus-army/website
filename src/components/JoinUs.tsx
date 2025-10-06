import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const JoinSection = styled.section`
  padding: 5rem 2rem;
  background: rgba(26, 26, 26, 0.5);
  position: relative;
  overflow: hidden;
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
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-background);
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
`;

const CTAButton = styled(motion.a)`
  display: inline-block;
  padding: 1.2rem 3rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: var(--color-background);
  border-radius: 50px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
  }
`;

const SocialLinks = styled(motion.div)`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 3rem;
`;

const SocialLink = styled(motion.a)`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card);
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-primary);
    transform: translateY(-5px) rotate(10deg);
    
    span {
      filter: brightness(0) invert(1);
    }
  }
`;

const steps = [
  {
    number: "1",
    title: "Obtén ZEUS",
    description: "Compra ZEUS en tu exchange favorito o swap en Uniswap"
  },
  {
    number: "2",
    title: "Únete a la Comunidad",
    description: "Entra a nuestro Telegram y Twitter para estar al día"
  },
  {
    number: "3",
    title: "Participa Activamente",
    description: "Comparte memes, ideas y ayuda a hacer crecer la Army"
  },
  {
    number: "4",
    title: "HODL Como un Dios",
    description: "Mantén tus ZEUS y disfruta del viaje al Olimpo"
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
          Únete a la Zeus Army
        </SectionTitle>
        
        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Conviértete en parte de la comunidad más poderosa del crypto. 
          El Olimpo te espera.
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
            href="https://app.uniswap.org"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Comprar ZEUS ahora
          </CTAButton>
        </CTAContainer>
        
        <SocialLinks
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <SocialLink
            href="https://t.me/zeusarmy"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span>💬</span>
          </SocialLink>
          <SocialLink
            href="https://twitter.com/zeusarmy"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span>🐦</span>
          </SocialLink>
          <SocialLink
            href="https://discord.gg/zeusarmy"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span>💜</span>
          </SocialLink>
        </SocialLinks>
      </Container>
    </JoinSection>
  );
};

export default JoinUs;