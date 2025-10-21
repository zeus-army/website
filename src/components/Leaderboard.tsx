import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import axios from 'axios';

const LeaderboardSection = styled.section`
  padding: 5rem 2rem;
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  /* Light background */
  background: linear-gradient(180deg,
    rgba(255, 250, 205, 0.3) 0%,
    rgba(176, 224, 230, 0.2) 50%,
    rgba(255, 250, 205, 0.3) 100%
  );

  /* Top decorative */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 25%;
    background-image: url('/images/buy-bg-bottom.webp');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    opacity: 0.8;
    z-index: 0;
  }

  /* Bottom decorative */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 25%;
    background-image: url('/images/tokenomics-top.webp');
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    opacity: 0.6;
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
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

const JoinContainer = styled(motion.div)`
  background: rgba(13, 14, 35, 0.9);
  border-radius: 30px;
  padding: 3rem;
  text-align: center;
  margin-bottom: 3rem;
  border: 2px solid transparent;
  background-image: linear-gradient(rgba(13, 14, 35, 0.9), rgba(13, 14, 35, 0.9)), var(--gradient-rainbow);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  position: relative;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: var(--gradient-rainbow);
    opacity: 0.05;
    animation: rotate 20s linear infinite;
  }
`;

const JoinTitle = styled.h3`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-light);
  font-family: var(--font-display);
  text-transform: uppercase;
  text-shadow: 0 0 30px rgba(255, 221, 89, 0.5);
`;

const JoinDescription = styled.div`
  color: var(--color-text-light);
  opacity: 0.9;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  font-family: var(--font-alt);
  font-weight: 600;
  line-height: 1.8;
  text-align: left;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  p {
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  li {
    padding: 0.5rem 0 0.5rem 2rem;
    position: relative;

    &:before {
      content: '⚡';
      position: absolute;
      left: 0;
      color: var(--color-primary);
      font-size: 1.3rem;
    }
  }
`;

const JoinButton = styled(motion.button)`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  padding: 1.3rem 3.5rem;
  border-radius: 60px;
  font-weight: 900;
  font-size: 1.3rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-family: var(--font-display);
  border: 5px solid #000;
  box-shadow:
    0 8px 0 #000,
    0 10px 30px rgba(0, 0, 0, 0.4);
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  transform: rotate(-1deg);
  cursor: pointer !important;
  pointer-events: auto !important;
  position: relative;
  z-index: 100;

  &:hover:not(:disabled) {
    transform: translateY(-5px) rotate(-1deg) scale(1.05);
    box-shadow:
      0 12px 0 #000,
      0 15px 40px rgba(255, 215, 0, 0.6);
  }

  &:active:not(:disabled) {
    transform: translateY(0) rotate(-1deg);
    box-shadow:
      0 4px 0 #000,
      0 5px 20px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(50%);
  }
`;

const RainbowButtonWrapper = styled.div`
  display: flex;
  justify-content: center;

  /* Override RainbowKit button styles to match design */
  button {
    cursor: pointer !important;
    pointer-events: auto !important;
    position: relative !important;
    z-index: 100 !important;
  }
`;

const LeaderboardTable = styled.div`
  background: rgba(13, 14, 35, 0.9);
  border-radius: 30px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
`;

const TableHeader = styled.div`
  background: var(--gradient-rainbow);
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 120px 1fr 200px;
  gap: 1rem;
  color: var(--color-text-light);
  font-weight: 700;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 1.1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 200px;

    & > div:first-child {
      display: none;
    }
  }
`;

const TableRow = styled(motion.div)<{ $rank: number }>`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 120px 1fr 200px;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  text-align: center;

  ${props => props.$rank <= 3 && `
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(${props.$rank === 1 ? '255, 221, 89' : props.$rank === 2 ? '192, 192, 192' : '205, 127, 50'}, 0.1) 50%,
      transparent 100%);
    border-left: 3px solid ${props.$rank === 1 ? 'var(--color-yellow)' : props.$rank === 2 ? '#C0C0C0' : '#CD7F32'};
  `}

  @media (max-width: 768px) {
    grid-template-columns: 1fr 200px;
  }
`;

const Rank = styled.div<{ $rank: number }>`
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: ${props => props.$rank === 1 ? 'var(--color-yellow)' :
          props.$rank === 2 ? '#C0C0C0' :
          props.$rank === 3 ? '#CD7F32' : 'var(--color-text-light)'};
  text-align: center;
  text-shadow: 0 0 20px currentColor;

  ${props => props.$rank <= 3 && `
    &::after {
      content: '${props.$rank === 1 ? '👑' : props.$rank === 2 ? '🥈' : '🥉'}';
      margin-left: 0.5rem;
      font-size: 1.5rem;
    }
  `}

  @media (max-width: 768px) {
    display: none;
  }
`;

const Balance = styled.div`
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  font-family: var(--font-display);
  background: var(--gradient-rainbow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px rgba(255, 221, 89, 0.3));
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.p<{ $type: 'success' | 'error' | 'info' }>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;

  ${props => props.$type === 'success' && `
    background: rgba(0, 255, 0, 0.1);
    color: #00ff00;
    border: 1px solid rgba(0, 255, 0, 0.3);
  `}

  ${props => props.$type === 'error' && `
    background: rgba(255, 0, 0, 0.1);
    color: #ff6b6b;
    border: 1px solid rgba(255, 0, 0, 0.3);
  `}

  ${props => props.$type === 'info' && `
    background: rgba(255, 215, 0, 0.1);
    color: var(--color-primary);
    border: 1px solid rgba(255, 215, 0, 0.3);
  `}
`;

const TwitterLink = styled.a`
  color: #1DA1F2 !important;
  font-weight: 700 !important;
  font-family: var(--font-alt) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  text-decoration: underline !important;
  cursor: pointer !important;
  pointer-events: auto !important;
  position: relative !important;
  z-index: 10 !important;
`;

const TwitterIcon = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

interface LeaderboardEntry {
  wallet_address: string;
  twitter_handle: string;
  zeus_balance: string;
  supply_percentage?: string;
  timestamp: number;
}

const Leaderboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [joining, setJoining] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  useEffect(() => {
    fetchLeaderboard();

    // Check if we're coming back from Twitter auth
    const urlParams = new URLSearchParams(window.location.search);
    const twitterConnected = urlParams.get('twitter_connected');
    const error = urlParams.get('error');

    if (twitterConnected === 'true') {
      setStatus({ type: 'success', message: 'Successfully joined Zeus Army! 🌩️' });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        fetchLeaderboard();
        setStatus(null);
      }, 2000);
    } else if (error) {
      let errorMessage = 'An error occurred';
      if (error === 'already_joined') {
        errorMessage = 'You are already a Zeus Army member';
      } else if (error === 'invalid_signature') {
        errorMessage = 'Invalid signature. Please try again.';
      } else if (error === 'signature_mismatch') {
        errorMessage = 'Signature mismatch. Please try again.';
      }
      setStatus({ type: 'error', message: errorMessage });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setStatus(null), 5000);
    }
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const signAndJoin = async () => {
    if (!address || !isConnected) return;

    setJoining(true);
    setStatus({ type: 'info', message: 'Please sign the message in your wallet...' });

    try {
      const timestamp = Date.now();
      const message = `Welcome to Zeus Army!\n\nBy signing this message, you join the elite ranks of ZEUS holders.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

      const signature = await signMessageAsync({ message });

      setJoining(false);
      setStatus({ type: 'info', message: 'Redirecting to Twitter...' });

      // Redirect to Twitter OAuth
      const authResponse = await axios.get('/api/auth/twitter', {
        params: {
          address,
          signature,
          timestamp
        }
      });

      if (authResponse.data.success) {
        // Redirect to Twitter for authentication
        window.location.href = authResponse.data.authUrl;
      } else {
        throw new Error('Failed to initiate Twitter authentication');
      }

    } catch (error: any) {
      console.error('Signature error:', error);
      setStatus({ type: 'error', message: 'Signature rejected' });
      setJoining(false);
    }
  };

  const formatSupplyPercentage = (balance: string) => {
    const TOTAL_SUPPLY = 420.69e12; // 420.69 trillion
    const num = parseFloat(balance);
    const percentage = (num / TOTAL_SUPPLY) * 100;

    if (percentage < 0.001) {
      return '<0.001%';
    }

    return `${percentage.toFixed(3)}%`;
  };

  return (
    <LeaderboardSection id="leaderboard">
      <Container>
        <SectionTitle
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          WHALE LEADERBOARD 🐋
        </SectionTitle>

        {!leaderboard.find(entry => entry.wallet_address === address?.toLowerCase()) && (
          <JoinContainer
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <JoinTitle>Are you a ZEUS whale?</JoinTitle>
            <JoinDescription>
              <p>
                Tired of LARPers pretending to be whales? Stop following influencers who are all bark and no bite!
                The Zeus Army only follows VERIFIED whales - prove you're the real deal or stay in the kennel! 🐕
                If you've got the bags, show them. No more paper-handed posers! 💎🐾
              </p>
              <p><strong>Why join the verified whale pack:</strong></p>
              <ul>
                <li>Prove your commitment to the Zeus Army - no more empty words!</li>
                <li>The ENTIRE community pledges to follow you on Twitter</li>
                <li>Your voice gets maximum visibility - every tweet, every meme, amplified!</li>
                <li>Become a recognized leader in the pack</li>
                <li>Influence the direction of Zeus Army with your ideas</li>
                <li>Show the world you're not just barking - you're HOLDING! 🚀</li>
              </ul>
            </JoinDescription>
            {isConnected ? (
              <>
                <JoinButton
                  onClick={signAndJoin}
                  disabled={joining}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {joining ? <LoadingSpinner /> : 'Sign & Join'}
                </JoinButton>
                {status && (
                  <StatusMessage $type={status.type}>
                    {status.message}
                  </StatusMessage>
                )}
              </>
            ) : (
              <RainbowButtonWrapper>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <JoinButton
                      onClick={openConnectModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Connect Wallet
                    </JoinButton>
                  )}
                </ConnectButton.Custom>
              </RainbowButtonWrapper>
            )}
          </JoinContainer>
        )}

        <LeaderboardTable>
          <TableHeader>
            <div>Rank</div>
            <div>Twitter</div>
            <div>% of Supply</div>
          </TableHeader>

          {leaderboard.slice(0, 20).map((entry, index) => (
            <TableRow
              key={entry.wallet_address}
              $rank={index + 1}
              style={{ pointerEvents: 'auto' }}
            >
              <Rank $rank={index + 1}>{index + 1}</Rank>
              <div>
                {entry.twitter_handle && (
                  <TwitterLink
                    href={`https://twitter.com/${entry.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = `https://twitter.com/${entry.twitter_handle.replace('@', '')}`;
                      console.log('Opening twitter link:', url);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <TwitterIcon>🐦 </TwitterIcon>{entry.twitter_handle}
                  </TwitterLink>
                )}
              </div>
              <Balance>{formatSupplyPercentage(entry.zeus_balance)}</Balance>
            </TableRow>
          ))}

          {leaderboard.length === 0 && (
            <TableRow
              $rank={999}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                Be the first to join the leaderboard
              </div>
            </TableRow>
          )}
        </LeaderboardTable>
      </Container>
    </LeaderboardSection>
  );
};

export default Leaderboard;