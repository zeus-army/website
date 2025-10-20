import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther, formatUnits } from 'viem';

// Contract addresses
const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';
const WZEUS_TOKEN_ADDRESS = '0xA56B06AA7Bfa6cbaD8A0b5161ca052d86a5D88E9';

// 10^18 for wei conversion (18 decimals)
const WEI_DIVISOR = BigInt("1000000000000000000");

// ABIs
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const WZEUS_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const GovernanceSection = styled.section`
  padding: 5rem 2rem;
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  background: linear-gradient(180deg,
    rgba(255, 250, 205, 0.3) 0%,
    rgba(176, 224, 230, 0.2) 50%,
    rgba(255, 250, 205, 0.3) 100%
  );

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

const SubSection = styled(motion.div)`
  background: rgba(13, 14, 35, 0.9);
  border-radius: 30px;
  padding: 3rem;
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

const SubSectionTitle = styled.h3`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-light);
  font-family: var(--font-display);
  text-transform: uppercase;
  text-shadow: 0 0 30px rgba(255, 221, 89, 0.5);
`;

const Description = styled.div`
  color: var(--color-text-light);
  opacity: 0.9;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  font-family: var(--font-alt);
  font-weight: 600;
  line-height: 1.8;

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

  strong {
    color: var(--color-primary);
  }
`;

const DAOLink = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000 !important;
  padding: 1rem 2.5rem;
  border-radius: 60px;
  font-weight: 900;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-family: var(--font-display);
  border: 4px solid #000;
  box-shadow:
    0 6px 0 #000,
    0 8px 20px rgba(0, 0, 0, 0.4);
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  transform: rotate(-1deg);
  text-decoration: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px) rotate(-1deg) scale(1.05);
    box-shadow:
      0 10px 0 #000,
      0 12px 30px rgba(255, 215, 0, 0.6);
  }

  &:active {
    transform: translateY(0) rotate(-1deg);
    box-shadow:
      0 3px 0 #000,
      0 4px 15px rgba(0, 0, 0, 0.4);
  }
`;

const WrapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 2rem;
`;

const BalanceCard = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BalanceItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const BalanceLabel = styled.div`
  font-size: 0.9rem;
  color: var(--color-text-light);
  opacity: 0.7;
  margin-bottom: 0.5rem;
  font-family: var(--font-alt);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const BalanceAmount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-display);
  background: var(--gradient-rainbow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px rgba(255, 221, 89, 0.3));
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 1.2rem;
  font-family: var(--font-alt);
  font-weight: 600;
  color: var(--color-text-light);
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const MaxButton = styled.button`
  background: rgba(255, 215, 0, 0.2);
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.5rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: var(--font-alt);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 215, 0, 0.3);
    transform: scale(1.05);
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled(motion.button)`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  padding: 1.3rem 2rem;
  border-radius: 60px;
  font-weight: 900;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-family: var(--font-display);
  border: 4px solid #000;
  box-shadow:
    0 6px 0 #000,
    0 8px 20px rgba(0, 0, 0, 0.4);
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  transform: rotate(-1deg);
  cursor: pointer;
  position: relative;

  &:hover:not(:disabled) {
    transform: translateY(-4px) rotate(-1deg) scale(1.03);
    box-shadow:
      0 10px 0 #000,
      0 12px 30px rgba(255, 215, 0, 0.6);
  }

  &:active:not(:disabled) {
    transform: translateY(0) rotate(-1deg);
    box-shadow:
      0 3px 0 #000,
      0 4px 15px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(50%);
  }
`;

const UnwrapButton = styled(ActionButton)`
  background: linear-gradient(135deg, #1E90FF 0%, #4169E1 100%);
`;

const DisconnectButton = styled(motion.button)`
  background: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  padding: 0.8rem 2rem;
  border-radius: 60px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: var(--font-alt);
  border: 2px solid rgba(255, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(255, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  margin-top: 1.5rem;
  width: 100%;

  &:hover:not(:disabled) {
    background: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 0, 0, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const RadioOption = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  border-radius: 60px;
  background: ${props => props.$checked ?
    'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
    'rgba(255, 255, 255, 0.05)'};
  border: 3px solid ${props => props.$checked ? '#000' : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.$checked ? '#000' : 'var(--color-text-light)'};
  box-shadow: ${props => props.$checked ?
    '0 6px 0 #000, 0 8px 20px rgba(0, 0, 0, 0.4)' :
    '0 2px 10px rgba(0, 0, 0, 0.3)'};

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$checked ? '#000' : 'rgba(255, 215, 0, 0.5)'};
    box-shadow: ${props => props.$checked ?
      '0 8px 0 #000, 0 10px 25px rgba(0, 0, 0, 0.5)' :
      '0 4px 15px rgba(255, 215, 0, 0.3)'};
  }

  input {
    display: none;
  }
`;

const ConnectButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;

  button {
    cursor: pointer !important;
    position: relative !important;
    z-index: 100 !important;
  }
`;

const StatusMessage = styled.p<{ $type: 'success' | 'error' | 'info' }>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;

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

const InfoBox = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 2rem;
  color: var(--color-text-light);
  font-family: var(--font-alt);
  font-weight: 600;
  line-height: 1.6;

  strong {
    color: var(--color-primary);
  }
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

const Governance: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mode, setMode] = useState<'wrap' | 'unwrap'>('wrap');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Read ZEUS balance
  const { data: zeusBalance, refetch: refetchZeus } = useReadContract({
    address: ZEUS_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read wZEUS balance
  const { data: wzeusBalance, refetch: refetchWzeus } = useReadContract({
    address: WZEUS_TOKEN_ADDRESS,
    abi: WZEUS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ZEUS_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, WZEUS_TOKEN_ADDRESS] : undefined,
  });

  // Approve ZEUS
  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveTxLoading, isSuccess: isApproveTxSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wrap (deposit)
  const { writeContract: wrap, data: wrapHash, isPending: isWrapping } = useWriteContract();
  const { isLoading: isWrapTxLoading, isSuccess: isWrapTxSuccess } = useWaitForTransactionReceipt({
    hash: wrapHash,
  });

  // Unwrap (withdraw)
  const { writeContract: unwrap, data: unwrapHash, isPending: isUnwrapping } = useWriteContract();
  const { isLoading: isUnwrapTxLoading, isSuccess: isUnwrapTxSuccess } = useWaitForTransactionReceipt({
    hash: unwrapHash,
  });

  useEffect(() => {
    if (isApproveTxSuccess) {
      setStatus({ type: 'success', message: 'Approval successful! You can now wrap ZEUS.' });
      refetchAllowance();
      setTimeout(() => setStatus(null), 3000);
    }
  }, [isApproveTxSuccess, refetchAllowance]);

  useEffect(() => {
    if (isWrapTxSuccess) {
      setStatus({ type: 'success', message: 'Successfully wrapped ZEUS!' });
      refetchZeus();
      refetchWzeus();
      setAmount('');
      setTimeout(() => setStatus(null), 3000);
    }
  }, [isWrapTxSuccess, refetchZeus, refetchWzeus]);

  useEffect(() => {
    if (isUnwrapTxSuccess) {
      setStatus({ type: 'success', message: 'Successfully unwrapped wZEUS!' });
      refetchZeus();
      refetchWzeus();
      setAmount('');
      setTimeout(() => setStatus(null), 3000);
    }
  }, [isUnwrapTxSuccess, refetchZeus, refetchWzeus]);

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';

    // Convert from wei (18 decimals) to token amount
    const tokenAmount = balance / WEI_DIVISOR;
    const remainder = balance % WEI_DIVISOR;

    // Convert to number for comparison (safe for up to 15 significant digits)
    const tokenAmountNum = Number(tokenAmount);

    // Format with T, B, M, K suffixes for large numbers
    if (tokenAmountNum >= 1_000_000_000_000) {
      // Trillions
      const trillions = tokenAmountNum / 1_000_000_000_000;
      return `${trillions.toFixed(2)}T`;
    } else if (tokenAmountNum >= 1_000_000_000) {
      // Billions
      const billions = tokenAmountNum / 1_000_000_000;
      return `${billions.toFixed(2)}B`;
    } else if (tokenAmountNum >= 1_000_000) {
      // Millions
      const millions = tokenAmountNum / 1_000_000;
      return `${millions.toFixed(2)}M`;
    } else if (tokenAmountNum >= 1_000) {
      // Thousands
      const thousands = tokenAmountNum / 1_000;
      return `${thousands.toFixed(2)}K`;
    } else {
      // Less than 1000, show with 2 decimals
      const remainderStr = remainder.toString().padStart(18, '0');
      const decimals = remainderStr.slice(0, 2);
      return decimals !== '00' ? `${tokenAmount.toLocaleString('en-US')}.${decimals}` : tokenAmount.toLocaleString('en-US');
    }
  };

  const handleSetMax = () => {
    const balance = mode === 'wrap' ? zeusBalance : wzeusBalance;
    if (!balance) return;

    // Convert from wei to token amount without losing precision
    const integerPart = balance / WEI_DIVISOR;
    const remainder = balance % WEI_DIVISOR;

    // Build the full decimal string
    const remainderStr = remainder.toString().padStart(18, '0');
    // Remove trailing zeros from remainder
    const trimmedRemainder = remainderStr.replace(/0+$/, '');

    // Set the amount as a string with full precision
    if (trimmedRemainder) {
      setAmount(`${integerPart}.${trimmedRemainder}`);
    } else {
      setAmount(integerPart.toString());
    }
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    try {
      const amountWei = parseEther(amount);
      approve({
        address: ZEUS_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [WZEUS_TOKEN_ADDRESS, amountWei],
      });
      setStatus({ type: 'info', message: 'Approving ZEUS...' });
    } catch (error: any) {
      console.error('Approve error:', error);
      setStatus({ type: 'error', message: error.message || 'Approval failed' });
    }
  };

  const handleWrap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    try {
      const amountWei = parseEther(amount);

      // Check if approval is needed
      if (!allowance || allowance < amountWei) {
        setStatus({ type: 'info', message: 'Please approve ZEUS first' });
        handleApprove();
        return;
      }

      wrap({
        address: WZEUS_TOKEN_ADDRESS,
        abi: WZEUS_ABI,
        functionName: 'deposit',
        args: [amountWei],
      });
      setStatus({ type: 'info', message: 'Wrapping ZEUS...' });
    } catch (error: any) {
      console.error('Wrap error:', error);
      setStatus({ type: 'error', message: error.message || 'Wrap failed' });
    }
  };

  const handleUnwrap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    try {
      const amountWei = parseEther(amount);
      unwrap({
        address: WZEUS_TOKEN_ADDRESS,
        abi: WZEUS_ABI,
        functionName: 'withdraw',
        args: [amountWei],
      });
      setStatus({ type: 'info', message: 'Unwrapping wZEUS...' });
    } catch (error: any) {
      console.error('Unwrap error:', error);
      setStatus({ type: 'error', message: error.message || 'Unwrap failed' });
    }
  };

  const handleSubmit = () => {
    if (mode === 'wrap') {
      handleWrap();
    } else {
      handleUnwrap();
    }
  };

  // Only consider transaction loading states when we have a valid hash
  const isProcessing = isApproving ||
                      (approveHash && isApproveTxLoading) ||
                      isWrapping ||
                      (wrapHash && isWrapTxLoading) ||
                      isUnwrapping ||
                      (unwrapHash && isUnwrapTxLoading);

  return (
    <GovernanceSection id="governance">
      <Container>
        <SectionTitle
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          GOVERNANCE 🏛️
        </SectionTitle>

        {/* CTO and DAO Section */}
        <SubSection
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <SubSectionTitle>Community Takeover (CTO) 🚀</SubSectionTitle>
          <Description>
            <p>
              The ZEUS Army has spoken! We've launched a <strong>Community Takeover (CTO)</strong> initiative
              to give power back to the holders. No more centralized control - this is YOUR token, YOUR community, YOUR future!
            </p>
            <p>
              We've deployed a <strong>Decentralized Autonomous Organization (DAO)</strong> where every wZEUS holder
              has a voice. This is true decentralization - where the community decides the direction of ZEUS Army!
            </p>
            <p>
              <strong>Why this matters:</strong>
            </p>
            <ul>
              <li>Community-driven decisions - no single entity controls ZEUS</li>
              <li>Transparent governance - all proposals and votes are on-chain</li>
              <li>Equal voting power - 1 wZEUS = 1 vote</li>
              <li>Shape the future - propose ideas and vote on major decisions</li>
              <li>True ownership - be part of something bigger than yourself</li>
            </ul>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <DAOLink
                href="https://www.tally.xyz/gov/zeus-cc8-community-takeover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit DAO on Tally 🗳️
              </DAOLink>
            </div>
          </Description>
        </SubSection>

        {/* Wrap/Unwrap Section */}
        <SubSection
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <SubSectionTitle>Get Your Voting Power 🗳️</SubSectionTitle>
          <Description>
            <p>
              To participate in governance, you need <strong>wZEUS (Wrapped ZEUS)</strong>.
              Wrapping your ZEUS is simple, free (only gas fees), and reversible at any time!
            </p>
            <p>
              <strong>Important:</strong> wZEUS is NOT available on Uniswap or other exchanges.
              You can only get wZEUS by wrapping your ZEUS tokens right here, and you can unwrap them anytime to get your ZEUS back.
            </p>
          </Description>

          {!isConnected ? (
            <ConnectButtonWrapper>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <ActionButton
                    onClick={openConnectModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Connect Wallet to Start
                  </ActionButton>
                )}
              </ConnectButton.Custom>
            </ConnectButtonWrapper>
          ) : (
            <WrapContainer>
              <BalanceCard>
                <BalanceItem>
                  <BalanceLabel>Your ZEUS Balance</BalanceLabel>
                  <BalanceAmount>{formatBalance(zeusBalance)}</BalanceAmount>
                </BalanceItem>
                <BalanceItem>
                  <BalanceLabel>Your wZEUS Balance</BalanceLabel>
                  <BalanceAmount>{formatBalance(wzeusBalance)}</BalanceAmount>
                </BalanceItem>
              </BalanceCard>

              <RadioGroup>
                <RadioOption $checked={mode === 'wrap'}>
                  <input
                    type="radio"
                    name="mode"
                    value="wrap"
                    checked={mode === 'wrap'}
                    onChange={() => {
                      setMode('wrap');
                      setAmount('');
                    }}
                  />
                  Wrap ZEUS
                </RadioOption>
                <RadioOption $checked={mode === 'unwrap'}>
                  <input
                    type="radio"
                    name="mode"
                    value="unwrap"
                    checked={mode === 'unwrap'}
                    onChange={() => {
                      setMode('unwrap');
                      setAmount('');
                    }}
                  />
                  Unwrap wZEUS
                </RadioOption>
              </RadioGroup>

              <InputContainer>
                <InputWrapper>
                  <Input
                    type="number"
                    placeholder={mode === 'wrap' ? 'Amount of ZEUS to wrap' : 'Amount of wZEUS to unwrap'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isProcessing}
                  />
                  <MaxButton onClick={handleSetMax} disabled={isProcessing}>
                    MAX
                  </MaxButton>
                </InputWrapper>

                <ActionButton
                  onClick={handleSubmit}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ marginTop: '1.5rem' }}
                >
                  {isApproving || isApproveTxLoading ? (
                    <>
                      <LoadingSpinner /> Approving...
                    </>
                  ) : isWrapping || isWrapTxLoading ? (
                    <>
                      <LoadingSpinner /> Wrapping...
                    </>
                  ) : isUnwrapping || isUnwrapTxLoading ? (
                    <>
                      <LoadingSpinner /> Unwrapping...
                    </>
                  ) : mode === 'wrap' ? (
                    'Wrap ZEUS → wZEUS'
                  ) : (
                    'Unwrap wZEUS → ZEUS'
                  )}
                </ActionButton>
              </InputContainer>

              {status && (
                <StatusMessage $type={status.type}>
                  {status.message}
                </StatusMessage>
              )}

              <InfoBox>
                <strong>💡 What is wZEUS?</strong><br />
                wZEUS is a <strong>wrapper token</strong> for ZEUS - NOT staking, NOT lock-up. You can get your ZEUS back anytime!<br />
                <br />
                <strong>How it works:</strong><br />
                • <strong>Wrapping</strong>: Deposit your ZEUS → Get wZEUS (1:1 ratio)<br />
                • <strong>Unwrapping</strong>: Return wZEUS → Get your ZEUS back instantly<br />
                • Your funds are ALWAYS yours - no time locks, no penalties<br />
                <br />
                <strong>Why wrap?</strong> wZEUS gives you voting power in the DAO while keeping full control of your tokens.<br />
                <br />
                <strong>🔒 Contract verified on Etherscan:</strong><br />
                <a
                  href="https://etherscan.io/address/0xA56B06AA7Bfa6cbaD8A0b5161ca052d86a5D88E9"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-primary)',
                    textDecoration: 'underline',
                    fontWeight: 'bold'
                  }}
                >
                  View wZEUS Contract →
                </a>
              </InfoBox>

              <DisconnectButton
                onClick={() => disconnect()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Disconnect Wallet
              </DisconnectButton>
            </WrapContainer>
          )}
        </SubSection>
      </Container>
    </GovernanceSection>
  );
};

export default Governance;
