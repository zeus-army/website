import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const RoadmapSection = styled.section`
  padding: 5rem 2rem;
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  /* Main roadmap background image */
  background-image: url('/images/roadmap-bg.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;

  /* Top decorative clouds */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 25%;
    background-image: url('/images/roadmap-top.webp');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    opacity: 0.9;
    z-index: 0;
  }

  /* Light overlay for better readability */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.05);
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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

const Timeline = styled.div`
  position: relative;
  padding: 2rem 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--gradient-rainbow);
    transform: translateX(-50%);
    box-shadow: 0 0 20px rgba(255, 221, 89, 0.5);
    
    @media (max-width: 768px) {
      left: 30px;
    }
  }
`;

const TimelineItem = styled(motion.div)<{ $align: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  margin-bottom: 4rem;
  position: relative;
  
  ${props => props.$align === 'left' ? `
    flex-direction: row-reverse;
    text-align: right;
  ` : `
    flex-direction: row;
    text-align: left;
  `}
  
  @media (max-width: 768px) {
    flex-direction: row;
    text-align: left;
  }
`;

const TimelineContent = styled.div<{ $align: 'left' | 'right' }>`
  flex: 1;
  padding: ${props => props.$align === 'left' ? '0 2rem 0 0' : '0 0 0 2rem'};
  background: rgba(13, 14, 35, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 2rem;
    margin-left: 4rem;
  }
`;

const TimelineNode = styled.div`
  width: 90px;
  height: 90px;
  background: var(--color-background);
  border: 3px solid transparent;
  background-image: linear-gradient(var(--color-background), var(--color-background)), var(--gradient-rainbow);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  font-size: 2.5rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  box-shadow: 0 0 40px rgba(165, 94, 234, 0.6);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(-50%) scale(1.1);
    box-shadow: 0 0 60px rgba(255, 221, 89, 0.8);
  }
  
  @media (max-width: 768px) {
    left: 30px;
  }
`;

const Phase = styled.h3`
  color: var(--color-secondary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: var(--font-display);
`;

const PhaseTitle = styled.h4`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-text-light);
  font-family: var(--font-display);
  text-shadow: 0 0 20px currentColor;
`;

const PhaseItems = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    margin-bottom: 1rem;
    color: var(--color-text-light);
    opacity: 0.9;
    position: relative;
    padding-left: 2rem;
    font-family: var(--font-alt);
    font-weight: 600;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border-radius: 20px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(5px);
    }
    
    &::before {
      content: '🌈';
      position: absolute;
      left: 0.8rem;
      font-size: 1.2rem;
    }
  }
`;

const roadmapData = [
  {
    phase: 'Phase 1',
    title: 'The Awakening',
    icon: '/images/zeus.jpg',
    items: [
      'Create token-gated Telegram channels',
      'Alpha for whales in the Telegram Whales channel',
      'Periodic video interviews with NDhaus (creator of ZEUS)'
    ]
  },
  {
    phase: 'Phase 2',
    title: 'Fetch the Moon',
    icon: '🌙',
    items: [
      'Launch a staking system for ZEUS',
      'Port ZEUS to Solana and other networks with wrappers that have liquidity',
      'Integrate ZEUS with DeFi protocols and AMMs on various networks',
      'List ZEUS on Perps platforms like Aster and Hyperliquid'
    ]
  },
  {
    phase: 'Phase 3',
    title: 'Alpha Dog Status',
    icon: '🎆',
    items: [
      'Launch exclusive NFTs for the community',
      'List ZEUS on CEX exchanges',
      'Explore models to sublicense the ZEUS brand with the official ZEUS team'
    ]
  }
];

const Roadmap: React.FC = () => {
  return (
    <RoadmapSection id="roadmap">
      <Container>
        <SectionTitle
          data-text="ROADMAP"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          ROADMAP
        </SectionTitle>
        
        <Timeline>
          {roadmapData.map((item, index) => (
            <TimelineItem
              key={index}
              $align={index % 2 === 0 ? 'right' : 'left'}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
              viewport={{ once: true }}
            >
              <TimelineNode>
                {item.icon.startsWith('/') ? (
                  <img src={item.icon} alt={item.title} />
                ) : (
                  <span>{item.icon}</span>
                )}
              </TimelineNode>
              
              <TimelineContent $align={index % 2 === 0 ? 'right' : 'left'}>
                <Phase>{item.phase}</Phase>
                <PhaseTitle>{item.title}</PhaseTitle>
                <PhaseItems>
                  {item.items.map((point, pointIndex) => (
                    <motion.li
                      key={pointIndex}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + (0.1 * pointIndex) }}
                      viewport={{ once: true }}
                    >
                      {point}
                    </motion.li>
                  ))}
                </PhaseItems>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
    </RoadmapSection>
  );
};

export default Roadmap;