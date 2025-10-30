import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

const PAYMENT_ADDRESS = '0xeD85dd7540b916d909641645d96c738D9e7d0873';
const PARENT_ENS = 'zeuscc8.eth';

const MintingContainer = styled.div`
  background: rgba(10, 14, 39, 0.8);
  border: 3px solid rgba(255, 215, 0, 0.4);
  border-radius: 25px;
  padding: 3rem;
  backdrop-filter: blur(15px);
  box-shadow:
    0 10px 40px 0 rgba(31, 38, 135, 0.37),
    inset 0 0 30px rgba(255, 215, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  text-align: center;
  margin-bottom: 2rem;
  color: #FFFFFF;
  text-shadow:
    0 0 30px rgba(255, 221, 89, 0.8),
    3px 3px 0px #000000,
    4px 4px 0px #1a1a1a;
  text-transform: uppercase;
`;

const InputGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-family: var(--font-body);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(26, 31, 58, 0.6);
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 1.25rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--color-text-light);
  font-family: var(--font-body);
  font-size: 1.3rem;
  font-weight: 600;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ENSSuffix = styled.span`
  padding: 1.25rem 1.5rem;
  font-family: var(--font-body);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary);
  background: rgba(255, 215, 0, 0.1);
  border-left: 2px solid rgba(255, 215, 0, 0.3);
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    border-left: none;
    border-top: 2px solid rgba(255, 215, 0, 0.3);
    text-align: center;
  }
`;

const PricingInfo = styled.div`
  background: linear-gradient(135deg, rgba(165, 94, 234, 0.15), rgba(138, 75, 194, 0.15));
  border: 2px solid rgba(165, 94, 234, 0.4);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const PricingTitle = styled.h3`
  font-family: var(--font-body);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
  text-align: center;
`;

const PricingItem = styled.div<{ highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${props => props.highlight
    ? 'rgba(255, 215, 0, 0.15)'
    : 'rgba(26, 31, 58, 0.4)'};
  border-radius: 10px;
  border: 2px solid ${props => props.highlight
    ? 'rgba(255, 215, 0, 0.5)'
    : 'transparent'};
  transition: all 0.3s ease;
  font-family: var(--font-body);
  color: rgba(255, 255, 255, 0.9);

  &:last-child {
    margin-bottom: 0;
  }

  ${props => props.highlight && `
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    animation: glow 2s ease-in-out infinite;

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
      50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.6); }
    }
  `}

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
`;

const StatusMessage = styled.div<{ type: 'info' | 'success' | 'error' | 'warning' }>`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  text-align: center;
  background: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(75, 183, 73, 0.2)';
      case 'error': return 'rgba(255, 107, 107, 0.2)';
      case 'warning': return 'rgba(255, 159, 64, 0.2)';
      default: return 'rgba(30, 144, 255, 0.2)';
    }
  }};
  border: 2px solid ${props => {
    switch (props.type) {
      case 'success': return '#4BB749';
      case 'error': return '#FF6B6B';
      case 'warning': return '#FF9F40';
      default: return '#1E90FF';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#4BB749';
      case 'error': return '#FF6B6B';
      case 'warning': return '#FF9F40';
      default: return '#1E90FF';
    }
  }};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1.25rem 3rem;
  border-radius: 60px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-family: var(--font-display);
  font-size: 1.2rem;
  border: 5px solid #000;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: rotate(-2deg);
  position: relative;
  z-index: 10;

  background: ${props => props.variant === 'secondary'
    ? 'linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%)'
    : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'};

  color: #000;
  box-shadow:
    0 8px 0 #000,
    0 10px 30px rgba(0, 0, 0, 0.4);
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);

  &:hover:not(:disabled) {
    transform: translateY(-5px) rotate(-2deg) scale(1.05);
    box-shadow:
      0 12px 0 #000,
      0 15px 40px ${props => props.variant === 'secondary'
        ? 'rgba(30, 144, 255, 0.6)'
        : 'rgba(255, 215, 0, 0.6)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0) rotate(-2deg);
    box-shadow:
      0 4px 0 #000,
      0 5px 20px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: rotate(-2deg);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }
`;

const WalletConnectWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;

  /* Style the RainbowKit button to match our theme */
  button {
    font-family: var(--font-body) !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    border-radius: 60px !important;
    padding: 1rem 2rem !important;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
    color: #000 !important;
    border: 4px solid #000 !important;
    box-shadow: 0 6px 0 #000, 0 6px 20px rgba(0, 0, 0, 0.3) !important;
    transition: all 0.3s ease !important;

    &:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 9px 0 #000, 0 9px 25px rgba(0, 0, 0, 0.4) !important;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ENSMinting: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [subname, setSubname] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [priceUSD, setPriceUSD] = useState<number>(0);
  const [checking, setChecking] = useState(false);
  const [minting, setMinting] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error' | 'warning', text: string } | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(0);

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
        setEthPrice(3000); // Fallback price
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate price based on length
  const calculatePrice = (name: string): { eth: number, usd: number } => {
    const length = name.length;

    if (length >= 6) {
      return { eth: 0, usd: 0 }; // FREE!
    } else if (length >= 4) {
      const ethAmount = ethPrice > 0 ? 50 / ethPrice : 0.016; // $50
      return { eth: ethAmount, usd: 50 };
    } else if (length >= 1) {
      const ethAmount = ethPrice > 0 ? 200 / ethPrice : 0.067; // $200
      return { eth: ethAmount, usd: 200 };
    }

    return { eth: 0, usd: 0 };
  };

  // Handle subname input change
  const handleSubnameChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubname(sanitized);

    if (sanitized.length > 0) {
      const prices = calculatePrice(sanitized);
      setPrice(prices.eth);
      setPriceUSD(prices.usd);
      setAvailable(null);
      setMessage(null);
    } else {
      setPrice(0);
      setPriceUSD(0);
      setAvailable(null);
      setMessage(null);
    }
  };

  // Check availability
  const checkAvailability = async () => {
    if (!subname || subname.length === 0) {
      setMessage({ type: 'warning', text: 'Please enter a subname' });
      return;
    }

    setChecking(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/ens/check?subname=${subname}`);
      const data = await response.json();

      if (data.available) {
        setAvailable(true);
        setMessage({ type: 'success', text: `🎉 ${subname}.${PARENT_ENS} is available!` });
      } else {
        setAvailable(false);
        setMessage({ type: 'error', text: `😢 ${subname}.${PARENT_ENS} is already taken` });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setMessage({ type: 'error', text: 'Error checking availability. Please try again.' });
    } finally {
      setChecking(false);
    }
  };

  // Mint subname
  const mintSubname = async () => {
    if (!isConnected || !address) {
      setMessage({ type: 'warning', text: 'Please connect your wallet first' });
      return;
    }

    if (!available) {
      setMessage({ type: 'warning', text: 'Please check availability first' });
      return;
    }

    setMinting(true);
    setMessage({ type: 'info', text: 'Processing... Please wait ⚡' });

    try {
      // Step 1: Send payment if needed
      if (price > 0) {
        setMessage({ type: 'info', text: 'Sending payment... Please confirm in your wallet 💰' });

        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const tx = await signer.sendTransaction({
          to: PAYMENT_ADDRESS,
          value: ethers.utils.parseEther(price.toFixed(18)),
        });

        setMessage({ type: 'info', text: 'Payment sent! Waiting for confirmation... ⏳' });
        await tx.wait();
        setMessage({ type: 'success', text: 'Payment confirmed! Creating your ENS... 🎉' });
      }

      // Step 2: Mint via API
      setMessage({ type: 'info', text: 'Minting your ENS subname... ✨' });

      const response = await fetch('/api/ens/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subname,
          address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `🎊 Success! ${subname}.${PARENT_ENS} is now yours! Welcome to Zeus Army! 🚀`,
        });
        setSubname('');
        setAvailable(null);
        setPrice(0);
        setPriceUSD(0);
      } else {
        throw new Error(data.error || 'Minting failed');
      }
    } catch (error: any) {
      console.error('Error minting subname:', error);
      setMessage({
        type: 'error',
        text: `Failed to mint: ${error.message || 'Unknown error'}. Please try again.`,
      });
    } finally {
      setMinting(false);
    }
  };

  const getPriceTier = (name: string) => {
    const length = name.length;
    if (length >= 6) return 'free';
    if (length >= 4) return 'medium';
    return 'premium';
  };

  const currentTier = subname ? getPriceTier(subname) : null;

  return (
    <MintingContainer>
      <SectionTitle>⚡ Claim Your ENS ⚡</SectionTitle>

      <PricingInfo>
        <PricingTitle>💰 Pricing</PricingTitle>
        <PricingItem highlight={currentTier === 'free'}>
          <span>6+ characters</span>
          <strong style={{ color: '#4BB749' }}>FREE! 🎉</strong>
        </PricingItem>
        <PricingItem highlight={currentTier === 'medium'}>
          <span>4-5 characters</span>
          <strong style={{ color: '#FFD700' }}>$50 USD (≈ {ethPrice > 0 ? (50 / ethPrice).toFixed(4) : '0.016'} ETH)</strong>
        </PricingItem>
        <PricingItem highlight={currentTier === 'premium'}>
          <span>1-3 characters (Premium)</span>
          <strong style={{ color: '#FF6B6B' }}>$200 USD (≈ {ethPrice > 0 ? (200 / ethPrice).toFixed(4) : '0.067'} ETH)</strong>
        </PricingItem>
      </PricingInfo>

      <InputGroup>
        <Label>Choose Your Subname:</Label>
        <InputWrapper>
          <Input
            type="text"
            placeholder="yourname"
            value={subname}
            onChange={(e) => handleSubnameChange(e.target.value)}
            disabled={minting}
          />
          <ENSSuffix>.{PARENT_ENS}</ENSSuffix>
        </InputWrapper>
      </InputGroup>

      {subname && (
        <StatusMessage type="info">
          Price: {priceUSD > 0 ? `$${priceUSD} (≈ ${price.toFixed(4)} ETH)` : 'FREE! 🎉'}
        </StatusMessage>
      )}

      {message && (
        <StatusMessage type={message.type}>
          {message.text}
        </StatusMessage>
      )}

      {!isConnected ? (
        <WalletConnectWrapper>
          <ConnectButton />
        </WalletConnectWrapper>
      ) : (
        <ButtonGroup>
          <ActionButton
            variant="secondary"
            onClick={checkAvailability}
            disabled={!subname || checking || minting}
          >
            {checking && <LoadingSpinner />}
            {checking ? 'Checking...' : 'Check Availability'}
          </ActionButton>

          <ActionButton
            variant="primary"
            onClick={mintSubname}
            disabled={!available || minting}
          >
            {minting && <LoadingSpinner />}
            {minting ? 'Minting...' : (priceUSD > 0 ? `Mint for $${priceUSD}` : 'Mint FREE! 🎉')}
          </ActionButton>
        </ButtonGroup>
      )}
    </MintingContainer>
  );
};

export default ENSMinting;
