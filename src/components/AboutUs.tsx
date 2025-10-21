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
  overflow: hidden;

  &:hover {
    animation: bounce 0.5s ease;
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  img {
    width: 100%;
    height: 100%;
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
  color: #1a1a2e;
  font-family: var(--font-display);
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(30, 144, 255, 0.3);
`;

const ProfileSubtitle = styled.p<{ $isLeft?: boolean }>`
  font-size: ${props => props.$isLeft ? '1.1rem' : '0.8rem'};
  color: ${props => props.$isLeft ? '#d63031' : '#666'};
  margin-top: -0.3rem;
  margin-bottom: 0.5rem;
  font-style: ${props => props.$isLeft ? 'normal' : 'italic'};
  opacity: ${props => props.$isLeft ? '1' : '0.8'};
  font-weight: ${props => props.$isLeft ? '900' : '400'};
  text-transform: ${props => props.$isLeft ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.$isLeft ? '0.05em' : 'normal'};
  background: ${props => props.$isLeft ? 'rgba(214, 48, 49, 0.1)' : 'transparent'};
  padding: ${props => props.$isLeft ? '0.5rem 1rem' : '0'};
  border-radius: ${props => props.$isLeft ? '10px' : '0'};
  border: ${props => props.$isLeft ? '2px solid #d63031' : 'none'};
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
    color: #1a1a2e;
    font-weight: 700;
    opacity: 1;
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
    nickname: 'Alberto Gómez Toribio',
    subtitle: 'Left Oct 21, 2025',
    ens: 'gotoalberto.eth',
    zeusPercentage: '1.15%',
    avatar: '/images/gotoalberto.jpg',
    role: 'Former Leader'
  },
  {
    nickname: 'Position Vacant',
    ens: 'No active leadership',
    zeusPercentage: 'N/A',
    avatar: '❌',
    role: 'Inactive'
  },
  {
    nickname: 'Position Vacant',
    ens: 'No active leadership',
    zeusPercentage: 'N/A',
    avatar: '❌',
    role: 'Inactive'
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

        <motion.div
          style={{
            textAlign: 'center',
            fontSize: '1.6rem',
            maxWidth: '900px',
            margin: '0 auto 2rem',
            fontFamily: 'var(--font-alt)',
            fontWeight: '700',
            color: '#fff',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            padding: '2.5rem 3rem',
            borderRadius: '40px',
            border: '5px solid #d63031',
            boxShadow: '0 10px 0 #a02020, 0 12px 40px rgba(255, 0, 0, 0.4)',
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
          ⚠️ <strong>INITIATIVE ENDED</strong> ⚠️<br/>
          <span style={{ fontSize: '1.2rem', marginTop: '1rem', display: 'block' }}>
            As of October 21, 2025, this community initiative is no longer active.
            Alberto has left the project and there is currently no active leadership.
            The initiative has concluded without achieving its goals.
          </span>
        </motion.div>

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
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          This was an attempt to create a community-led initiative for ZEUS holders.
          We stepped forward with transparency and commitment, proving our dedication with our own bags.
          Unfortunately, the initiative did not gain the traction needed to succeed.
          We have no affiliation with the official ZEUS team, do not represent ZEUS CC8 INC.,
          and hold no formal relationship or position with them.
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
                {member.avatar.startsWith('/') || member.avatar.startsWith('http') ? (
                  <img src={member.avatar} alt={member.nickname} />
                ) : (
                  <span>{member.avatar}</span>
                )}
              </ProfileImage>
              
              <ProfileContent>
                <ProfileName>{member.nickname}</ProfileName>
                {member.subtitle && (
                  <ProfileSubtitle $isLeft={member.subtitle.includes('Left')}>
                    {member.subtitle}
                  </ProfileSubtitle>
                )}
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