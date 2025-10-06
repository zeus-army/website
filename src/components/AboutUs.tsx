import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutSection = styled.section`
  padding: 5rem 2rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(75, 183, 73, 0.05), rgba(123, 104, 238, 0.05));
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '🎈';
    position: absolute;
    font-size: 10rem;
    opacity: 0.1;
    top: 10%;
    right: 5%;
    animation: float 10s ease-in-out infinite;
  }
  
  &::after {
    content: '🌟';
    position: absolute;
    font-size: 8rem;
    opacity: 0.1;
    bottom: 10%;
    left: 5%;
    animation: float 8s ease-in-out infinite reverse;
  }
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
  border-radius: 30px;
  overflow: hidden;
  border: 3px solid var(--color-text);
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 5px 5px 0px var(--color-primary);
  
  &:hover {
    transform: translate(-3px, -3px) rotate(-1deg);
    box-shadow: 8px 8px 0px var(--color-primary);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(180deg, var(--color-secondary), transparent);
    opacity: 0.3;
  }
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  margin: 2rem auto;
  border-radius: 50%;
  background: var(--color-background);
  border: 4px solid var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 30px rgba(75, 183, 73, 0.3);
  
  &:hover {
    animation: bounce 0.5s ease;
  }
  
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const ProfileContent = styled.div`
  padding: 2rem;
  text-align: center;
`;

const ProfileName = styled.h3`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-family: var(--font-display);
  text-transform: uppercase;
`;

const ProfileENS = styled.p`
  color: var(--color-secondary);
  margin-bottom: 1rem;
  font-family: var(--font-alt);
  font-size: 1rem;
  font-weight: 600;
  background: var(--color-accent);
  padding: 0.3rem 1rem;
  border-radius: 20px;
  display: inline-block;
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
    color: var(--color-secondary);
    margin-top: 0.3rem;
    font-family: var(--font-display);
  }
`;

const teamMembers = [
  {
    nickname: 'Dog Father',
    ens: 'dogfather.eth',
    zeusPercentage: '5.2%',
    avatar: '👑',
    role: 'Founder & Chief Woof'
  },
  {
    nickname: 'Bone Master',
    ens: 'bonemaster.eth',
    zeusPercentage: '3.8%',
    avatar: '🦴',
    role: 'Strategy & Treats'
  },
  {
    nickname: 'Paw Captain',
    ens: 'pawcaptain.eth',
    zeusPercentage: '2.9%',
    avatar: '🐾',
    role: 'Community Pack Leader'
  }
];

const AboutUs: React.FC = () => {
  return (
    <AboutSection id="about">
      <Container>
        <SectionTitle
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
        >
          The Pack Leaders 🐶
        </SectionTitle>
        
        <motion.p
          style={{ 
            textAlign: 'center', 
            fontSize: '1.3rem', 
            maxWidth: '800px', 
            margin: '0 auto',
            fontFamily: 'var(--font-alt)',
            fontWeight: '600',
            color: 'var(--color-text)',
            background: 'var(--color-card)',
            padding: '2rem',
            borderRadius: '30px',
            border: '3px solid var(--color-primary)',
            boxShadow: '5px 5px 0px var(--color-secondary)'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          We are Pepe's best friends, leading the most loyal pack in the memecoin universe! 
          Zeus Army is where diamond paws meet legendary gains. Woof! 🚀🐾
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