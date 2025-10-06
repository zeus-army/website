import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutSection = styled.section`
  padding: 5rem 2rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: rgba(26, 26, 26, 0.5);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
`;

const TeamCard = styled(motion.div)`
  background: var(--color-card);
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  }
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  margin: 2rem auto;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    z-index: -1;
    filter: blur(10px);
    opacity: 0.5;
  }
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const ProfileContent = styled.div`
  padding: 2rem;
  text-align: center;
`;

const ProfileName = styled.h3`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
`;

const ProfileENS = styled.p`
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
`;

const ProfileStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const Stat = styled.div`
  text-align: center;
  
  .label {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-top: 0.3rem;
  }
`;

const teamMembers = [
  {
    nickname: 'Thunder Lord',
    ens: 'thunderlord.eth',
    zeusPercentage: '5.2%',
    avatar: '⚡',
    role: 'Fundador'
  },
  {
    nickname: 'Olympus Guard',
    ens: 'olympusguard.eth',
    zeusPercentage: '3.8%',
    avatar: '🛡️',
    role: 'Estratega'
  },
  {
    nickname: 'Lightning Strike',
    ens: 'lightningstrike.eth',
    zeusPercentage: '2.9%',
    avatar: '🌩️',
    role: 'Community Lead'
  }
];

const AboutUs: React.FC = () => {
  return (
    <AboutSection id="about">
      <Container>
        <SectionTitle
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Quiénes Somos
        </SectionTitle>
        
        <motion.p
          style={{ textAlign: 'center', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Somos la élite del Olimpo crypto, unidos por la pasión hacia ZEUS y comprometidos 
          con llevar este proyecto a las alturas divinas. Nuestra misión es construir la 
          comunidad más fuerte y cohesionada del ecosistema memecoin.
        </motion.p>
        
        <TeamGrid>
          {teamMembers.map((member, index) => (
            <TeamCard
              key={member.ens}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <ProfileImage>
                <span>{member.avatar}</span>
              </ProfileImage>
              
              <ProfileContent>
                <ProfileName>{member.nickname}</ProfileName>
                <ProfileENS>{member.ens}</ProfileENS>
                
                <ProfileStats>
                  <Stat>
                    <div className="label">Zeus Holdings</div>
                    <div className="value">{member.zeusPercentage}</div>
                  </Stat>
                  <Stat>
                    <div className="label">Role</div>
                    <div className="value">{member.role}</div>
                  </Stat>
                </ProfileStats>
              </ProfileContent>
            </TeamCard>
          ))}
        </TeamGrid>
      </Container>
    </AboutSection>
  );
};

export default AboutUs;