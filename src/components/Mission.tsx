import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const MissionSection = styled.section`
  padding: 5rem 2rem;
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  /* Light background */
  background: linear-gradient(180deg,
    rgba(135, 206, 250, 0.2) 0%,
    rgba(176, 224, 230, 0.3) 50%,
    rgba(135, 206, 250, 0.2) 100%
  );

  /* Top decorative cloud */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30%;
    background-image: url('/images/charity-top.webp');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    opacity: 0.8;
    z-index: 0;
  }

  /* Bottom decorative cloud */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30%;
    background-image: url('/images/charity-bottom.webp');
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    opacity: 0.8;
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: var(--color-primary);
  }
`;

const MissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
`;

const MissionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.98);
  border: 5px solid #000;
  border-radius: 35px;
  padding: 2.5rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  box-shadow: 0 8px 0 #000, 0 10px 30px rgba(0, 0, 0, 0.25);
  transform: rotate(-1deg);

  &:nth-child(even) {
    transform: rotate(1deg);
  }

  &:hover {
    transform: translateY(-8px) rotate(-1deg) scale(1.05);
    box-shadow: 0 12px 0 #000, 0 15px 45px rgba(255, 215, 0, 0.4);
    background: rgba(255, 255, 255, 1);
  }

  &:nth-child(even):hover {
    transform: translateY(-8px) rotate(1deg) scale(1.05);
  }
`;

const IconWrapper = styled.div`
  width: 90px;
  height: 90px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  border: 5px solid #000;
  position: relative;
  z-index: 1;
  box-shadow: 0 6px 0 #000, 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(360deg) scale(1.15);
    box-shadow: 0 8px 0 #000, 0 10px 30px rgba(255, 215, 0, 0.5);
  }
`;

const MissionTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #000;
  position: relative;
  z-index: 1;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 3px 3px 0px rgba(255, 215, 0, 0.6);
  font-weight: 900;
`;

const MissionDescription = styled.p`
  color: #2d2d44;
  line-height: 1.7;
  position: relative;
  z-index: 1;
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 500;
`;

const missions = [
  {
    icon: '🦴',
    title: 'Top Dog Status',
    description: 'Establish ZEUS as the most powerful and recognized memecoin in the crypto ecosystem.'
  },
  {
    icon: '🐾',
    title: 'Loyal Pack',
    description: 'Build a pack of committed holders working together for the success of the whole family.'
  },
  {
    icon: '📈',
    title: 'Unstoppable Growth',
    description: 'Implement innovative strategies to increase ZEUS value and adoption.'
  },
  {
    icon: '🎯',
    title: 'Viral Barking',
    description: 'Execute viral campaigns that position ZEUS at the top of memecoins.'
  },
  {
    icon: '🌍',
    title: 'Global Pack Expansion',
    description: 'Bring ZEUS to every corner of the crypto world - one good boy at a time.'
  },
  {
    icon: '💎',
    title: 'Diamond Paws',
    description: 'Cultivate a long-term holding culture to strengthen the project.'
  }
];

const Mission: React.FC = () => {
  return (
    <MissionSection id="mission">
      <Container>
        <SectionTitle
          data-text="OUR MISSION"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          OUR MISSION
        </SectionTitle>
        
        <MissionGrid>
          {missions.map((mission, index) => (
            <MissionCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <IconWrapper>
                <span>{mission.icon}</span>
              </IconWrapper>
              <MissionTitle>{mission.title}</MissionTitle>
              <MissionDescription>{mission.description}</MissionDescription>
            </MissionCard>
          ))}
        </MissionGrid>
      </Container>
    </MissionSection>
  );
};

export default Mission;