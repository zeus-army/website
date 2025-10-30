import React from 'react';
import styled from 'styled-components';
import ENSMinting from '../components/ENSMinting';

const ENSPageSection = styled.section`
  min-height: 100vh;
  padding: 120px 20px 80px;
  background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(30, 144, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const PageTitle = styled.h1`
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 5rem);
  text-align: center;
  margin-bottom: 1rem;
  background: var(--gradient-zeus);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 4px;
    background: var(--gradient-zeus);
    border-radius: 2px;
  }
`;

const Subtitle = styled.p`
  font-family: var(--font-body);
  font-size: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  font-weight: 700;
`;

const IntroBox = styled.div`
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(165, 94, 234, 0.1) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 30px rgba(165, 94, 234, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 215, 0, 0.1),
      transparent
    );
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }
`;

const IntroText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  font-size: 1.1rem;

  strong {
    background: var(--gradient-zeus);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  position: relative;
  z-index: 1;
`;

const FeatureItem = styled.li`
  color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 0;
  padding-left: 2rem;
  position: relative;
  font-size: 1.1rem;

  &::before {
    content: '⚡';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.3rem;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ENSPage: React.FC = () => {
  return (
    <ENSPageSection>
      <Container>
        <PageTitle data-text="GET YOUR ENS">
          Get Your ENS 🌟
        </PageTitle>

        <Subtitle>
          Customize your Ethereum address with zeuscc8.eth!
        </Subtitle>

        <IntroBox>
          <IntroText>
            <strong>Transform your wallet address</strong> into something memorable!
            Instead of <code>0x1234...5678</code>, be known as <strong>yourname.zeuscc8.eth</strong>
          </IntroText>

          <IntroText>
            🏆 <strong>Your ENS will be your nickname in the Leadership Registry!</strong> Show your identity
            to the community and be recognized by your chosen name instead of a wallet address.
          </IntroText>

          <FeatureList>
            <FeatureItem>
              <strong>Stand out</strong> in the Zeus Army community
            </FeatureItem>
            <FeatureItem>
              <strong>Appear in the Leaderboard</strong> with your custom nickname instead of your wallet address
            </FeatureItem>
            <FeatureItem>
              <strong>Easy to remember</strong> - No more copying and pasting long addresses
            </FeatureItem>
            <FeatureItem>
              <strong>Show your commitment</strong> - Be recognized as a true Zeus Army soldier
            </FeatureItem>
            <FeatureItem>
              <strong>Special pricing</strong> - 6+ characters are FREE! 🎉
            </FeatureItem>
          </FeatureList>

          <IntroText>
            Join the ranks and claim your identity in the Zeus Army. Let's make it! 🚀
          </IntroText>
        </IntroBox>

        <ENSMinting />
      </Container>
    </ENSPageSection>
  );
};

export default ENSPage;
