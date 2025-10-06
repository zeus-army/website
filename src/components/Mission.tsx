import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const MissionSection = styled.section`
  padding: 5rem 2rem;
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

const MissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
`;

const MissionCard = styled(motion.div)`
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: var(--color-primary);
    transform: translateY(-5px);
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
      rgba(255, 215, 0, 0.1) 70%,
      transparent
    );
    animation: rotate 20s linear infinite;
    pointer-events: none;
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 20px;
  position: relative;
  z-index: 1;
`;

const MissionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
  position: relative;
  z-index: 1;
`;

const MissionDescription = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const missions = [
  {
    icon: '⚔️',
    title: 'Dominar el Olimpo',
    description: 'Establecer a ZEUS como la memecoin más poderosa y reconocida del ecosistema crypto.'
  },
  {
    icon: '🤝',
    title: 'Comunidad Inquebrantable',
    description: 'Construir una hermandad de holders comprometidos que trabajen juntos por el éxito común.'
  },
  {
    icon: '📈',
    title: 'Crecimiento Divino',
    description: 'Implementar estrategias innovadoras para aumentar el valor y la adopción de ZEUS.'
  },
  {
    icon: '🎯',
    title: 'Marketing Épico',
    description: 'Ejecutar campañas virales que posicionen a ZEUS en el top de las memecoins.'
  },
  {
    icon: '🌍',
    title: 'Expansión Global',
    description: 'Llevar el mensaje de ZEUS a todos los rincones del mundo crypto.'
  },
  {
    icon: '💎',
    title: 'Holders de Diamante',
    description: 'Cultivar una cultura de holding a largo plazo para fortalecer el proyecto.'
  }
];

const Mission: React.FC = () => {
  return (
    <MissionSection id="mission">
      <Container>
        <SectionTitle
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Nuestra Misión
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