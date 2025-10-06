import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import { injected } from '../utils/connectors';

const LeaderboardSection = styled.section`
  padding: 5rem 2rem;
  min-height: 100vh;
  position: relative;
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

const JoinContainer = styled(motion.div)`
  background: var(--color-card);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  margin-bottom: 3rem;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    z-index: -1;
  }
`;

const JoinTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
`;

const JoinDescription = styled.p`
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const JoinButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: var(--color-background);
  padding: 1rem 3rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LeaderboardTable = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.2);
`;

const TableHeader = styled.div`
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 60px 1fr 200px;
  gap: 1rem;
  color: var(--color-background);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const TableRow = styled(motion.div)<{ $rank: number }>`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 60px 1fr 200px;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 215, 0, 0.05);
  }
  
  ${props => props.$rank <= 3 && `
    background: rgba(255, 215, 0, ${0.1 - (props.$rank * 0.02)});
  `}
`;

const Rank = styled.div<{ $rank: number }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$rank === 1 ? 'var(--color-primary)' : 
          props.$rank === 2 ? '#C0C0C0' : 
          props.$rank === 3 ? '#CD7F32' : 'var(--color-text)'};
  text-align: center;
  
  ${props => props.$rank <= 3 && `
    &::after {
      content: '${props.$rank === 1 ? '👑' : props.$rank === 2 ? '🥈' : '🥉'}';
      margin-left: 0.5rem;
    }
  `}
`;

const WalletInfo = styled.div`
  .address {
    font-family: monospace;
    color: var(--color-text);
    font-size: 0.9rem;
  }
  
  .ens {
    color: var(--color-primary);
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.3rem;
  }
`;

const Balance = styled.div`
  text-align: right;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
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

interface LeaderboardEntry {
  wallet_address: string;
  ens_name: string | null;
  zeus_balance: string;
}

const Leaderboard: React.FC = () => {
  const { active, account, activate, library } = useWeb3React();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [joining, setJoining] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const connectAndJoin = async () => {
    if (!active) {
      try {
        await activate(injected);
      } catch (error) {
        setStatus({ type: 'error', message: 'Error al conectar la wallet' });
        return;
      }
    }
  };

  const joinLeaderboard = useCallback(async () => {
    if (!account || !library) return;

    setJoining(true);
    setStatus({ type: 'info', message: 'Firmando mensaje...' });

    try {
      const timestamp = Date.now();
      const message = `Welcome to Zeus Army!\n\nBy signing this message, you join the elite ranks of ZEUS holders.\n\nWallet: ${account}\nTimestamp: ${timestamp}`;
      
      const signer = library.getSigner();
      const signature = await signer.signMessage(message);

      setStatus({ type: 'info', message: 'Uniéndote a la Zeus Army...' });

      const response = await axios.post('http://localhost:3001/api/join', {
        address: account,
        signature,
        message: { timestamp }
      });

      if (response.data.success) {
        setStatus({ type: 'success', message: '¡Bienvenido a la Zeus Army! 🌩️' });
        fetchLeaderboard();
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setStatus({ type: 'info', message: 'Ya eres miembro de la Zeus Army' });
      } else {
        setStatus({ type: 'error', message: error.message || 'Error al unirse' });
      }
    } finally {
      setJoining(false);
    }
  }, [account, library]);

  useEffect(() => {
    if (active && account && !joining) {
      joinLeaderboard();
    }
  }, [active, account, joining, joinLeaderboard]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
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
          Leaderboard de Ballenas
        </SectionTitle>

        {!leaderboard.find(entry => entry.wallet_address === account?.toLowerCase()) && (
          <JoinContainer
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <JoinTitle>¿Eres una ballena de ZEUS?</JoinTitle>
            <JoinDescription>
              Conecta tu wallet y firma un mensaje para unirte al leaderboard exclusivo de la Zeus Army
            </JoinDescription>
            <JoinButton
              onClick={connectAndJoin}
              disabled={joining}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {joining ? <LoadingSpinner /> : active ? 'Firmar y Unirse' : 'Conectar Wallet'}
            </JoinButton>
            {status && (
              <StatusMessage $type={status.type}>
                {status.message}
              </StatusMessage>
            )}
          </JoinContainer>
        )}

        <LeaderboardTable>
          <TableHeader>
            <div>Rank</div>
            <div>Wallet</div>
            <div>ZEUS Balance</div>
          </TableHeader>
          
          {leaderboard.map((entry, index) => (
            <TableRow
              key={entry.wallet_address}
              $rank={index + 1}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.05 * index }}
              viewport={{ once: true }}
            >
              <Rank $rank={index + 1}>{index + 1}</Rank>
              <WalletInfo>
                {entry.ens_name && <div className="ens">{entry.ens_name}</div>}
                <div className="address">{formatAddress(entry.wallet_address)}</div>
              </WalletInfo>
              <Balance>{formatBalance(entry.zeus_balance)} ZEUS</Balance>
            </TableRow>
          ))}
          
          {leaderboard.length === 0 && (
            <TableRow
              $rank={999}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                Sé el primero en unirte al leaderboard
              </div>
            </TableRow>
          )}
        </LeaderboardTable>
      </Container>
    </LeaderboardSection>
  );
};

export default Leaderboard;