import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const RoadmapSection = styled.section`
  padding: 5rem 2rem;
  background: rgba(26, 26, 26, 0.5);
  position: relative;
  overflow: hidden;
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
    width: 2px;
    background: linear-gradient(180deg, var(--color-primary), var(--color-accent));
    transform: translateX(-50%);
    
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
  
  @media (max-width: 768px) {
    padding: 0 0 0 4rem;
  }
`;

const TimelineNode = styled.div`
  width: 60px;
  height: 60px;
  background: var(--color-background);
  border: 3px solid var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    left: 30px;
  }
`;

const Phase = styled.h3`
  color: var(--color-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const PhaseTitle = styled.h4`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--color-text);
`;

const PhaseItems = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    margin-bottom: 0.8rem;
    color: var(--color-text-secondary);
    position: relative;
    padding-left: 1.5rem;
    
    &::before {
      content: '⚡';
      position: absolute;
      left: 0;
      color: var(--color-primary);
    }
  }
`;

const roadmapData = [
  {
    phase: 'Fase 1',
    title: 'El Despertar',
    icon: '🌅',
    items: [
      'Lanzamiento de la Zeus Army',
      'Creación de canales de comunicación',
      'Primeros 100 miembros élite',
      'Establecimiento de valores y cultura'
    ]
  },
  {
    phase: 'Fase 2',
    title: 'La Expansión',
    icon: '🚀',
    items: [
      'Campañas de marketing viral',
      'Partnerships estratégicos',
      'Desarrollo del Leaderboard',
      'Eventos exclusivos para holders'
    ]
  },
  {
    phase: 'Fase 3',
    title: 'El Dominio',
    icon: '👑',
    items: [
      'Zeus DAO governance',
      'Utilidades exclusivas para la Army',
      'Expansión internacional',
      'Zeus NFT Collection'
    ]
  },
  {
    phase: 'Fase 4',
    title: 'La Inmortalidad',
    icon: '♾️',
    items: [
      'Ecosistema Zeus completo',
      'Integración DeFi avanzada',
      'Zeus Metaverse',
      'Legado eterno en crypto'
    ]
  }
];

const Roadmap: React.FC = () => {
  return (
    <RoadmapSection id="roadmap">
      <Container>
        <SectionTitle
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Roadmap
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
                <span>{item.icon}</span>
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