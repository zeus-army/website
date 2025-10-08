import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutSection = styled.section`
  padding: 5rem 2rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;

  /* Light sky background */
  background: linear-gradient(180deg,
    rgba(176, 224, 230, 0.4) 0%,
    rgba(135, 206, 250, 0.3) 50%,
    rgba(176, 224, 230, 0.4) 100%
  );

  /* Top decorative image */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30%;
    background-image: url('/images/buy-bg-top.webp');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    opacity: 0.9;
    z-index: 0;
  }

  /* Decorative bottom image */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 35%;
    background-image: url('/images/about-bottom.webp');
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    opacity: 0.9;
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
`;

const TeamCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  overflow: hidden;
  border: 3px solid transparent;
  background-image: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), var(--gradient-rainbow);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-10px) scale(1.05);
    box-shadow: 0 20px 60px rgba(30, 144, 255, 0.3);
    background: rgba(255, 255, 255, 0.95);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: var(--gradient-rainbow);
    opacity: 0.15;
  }
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  margin: 2rem auto;
  border-radius: 50%;
  background: var(--color-background);
  border: 3px solid transparent;
  background-image: linear-gradient(var(--color-background), var(--color-background)), var(--gradient-rainbow);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 50px rgba(165, 94, 234, 0.5);
  
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
  color: #1a1a2e;
  font-family: var(--font-display);
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(30, 144, 255, 0.3);
`;

const ProfileENS = styled.p`
  color: var(--color-text-light);
  margin-bottom: 1rem;
  font-family: var(--font-alt);
  font-size: 1rem;
  font-weight: 600;
  background: var(--gradient-rainbow);
  padding: 0.3rem 1rem;
  border-radius: 20px;
  display: inline-block;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.3);
`;

const ProfileStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Stat = styled.div`
  text-align: center;
  
  .label {
    font-size: 0.8rem;
    color: var(--color-text-light);
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(90deg, var(--color-green), var(--color-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 0.3rem;
    font-family: var(--font-display);
    filter: drop-shadow(0 0 10px rgba(75, 183, 73, 0.3));
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
          data-text="THE PACK LEADERS"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
        >
          THE PACK LEADERS 🐶
        </SectionTitle>
        
        <motion.p
          style={{
            textAlign: 'center',
            fontSize: '1.4rem',
            maxWidth: '850px',
            margin: '0 auto',
            fontFamily: 'var(--font-alt)',
            fontWeight: '700',
            color: '#1a1a2e',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2.5rem 3rem',
            borderRadius: '40px',
            border: '5px solid #000',
            boxShadow: '0 10px 0 #000, 0 12px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 10,
            lineHeight: '1.8',
            transform: 'rotate(-1deg)'
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