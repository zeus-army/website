import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

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

const WalletSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);

  /* Style the RainbowKit button to match our theme */
  button {
    font-family: var(--font-body) !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    border-radius: 60px !important;
    padding: 0.875rem 1.75rem !important;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
    color: #000 !important;
    border: 4px solid #000 !important;
    box-shadow: 0 6px 0 #000, 0 6px 20px rgba(0, 0, 0, 0.3) !important;
    transition: all 0.3s ease !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    max-width: 100% !important;

    &:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 9px 0 #000, 0 9px 25px rgba(0, 0, 0, 0.4) !important;
    }

    /* Style inner elements */
    span, div {
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
  }
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

const GasFreeNotice = styled.div`
  background: linear-gradient(135deg, rgba(75, 183, 73, 0.2), rgba(34, 139, 34, 0.2));
  border: 2px solid #4BB749;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  font-family: var(--font-body);
  color: #4BB749;
  font-weight: 700;
  font-size: 1.1rem;

  strong {
    color: #FFD700;
    text-transform: uppercase;
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

const SuccessBox = styled.div`
  background: linear-gradient(135deg, rgba(75, 183, 73, 0.2), rgba(34, 139, 34, 0.15));
  border: 3px solid #4BB749;
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
`;

const SuccessTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 2rem;
  color: #4BB749;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(75, 183, 73, 0.5);
`;

const SuccessText = styled.p`
  font-family: var(--font-body);
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ManageButton = styled.a`
  display: inline-block;
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
  text-decoration: none;
  background: linear-gradient(135deg, #4BB749 0%, #2E7D32 100%);
  color: #000;
  box-shadow:
    0 8px 0 #000,
    0 10px 30px rgba(0, 0, 0, 0.4);
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);

  &:hover {
    transform: translateY(-5px) rotate(-2deg) scale(1.05);
    box-shadow:
      0 12px 0 #000,
      0 15px 40px rgba(75, 183, 73, 0.6);
  }

  &:active {
    transform: translateY(0) rotate(-2deg);
    box-shadow:
      0 4px 0 #000,
      0 5px 20px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }
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
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const [subname, setSubname] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [priceUSD, setPriceUSD] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [mintedSubname, setMintedSubname] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error' | 'warning', text: string } | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [waitingForPayment, setWaitingForPayment] = useState(false);

  // Handle transaction confirmation and mint
  useEffect(() => {
    const completeMint = async () => {
      if (waitingForPayment && txSuccess && !isConfirming && txHash) {
        setMessage({ type: 'success', text: 'Payment confirmed! Creating your ENS... 🎉' });
        setWaitingForPayment(false);

        try {
          // Step 3: Mint via API (gas-free!) with payment proof
          setMessage({ type: 'info', text: 'Minting your ENS subname... ✨ (Gas-free!)' });

          const mintResponse = await fetch('/api/ens/mint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subname,
              address,
              txHash, // Send transaction hash for payment verification
            }),
          });

          const mintData = await mintResponse.json();

          if (mintData.success) {
            setMintedSubname(`${subname}.${PARENT_ENS}`);
            setMessage({
              type: 'success',
              text: `🎊 Success! ${subname}.${PARENT_ENS} is now yours!`,
            });
            setSubname('');
            setPrice(0);
            setPriceUSD(0);
          } else {
            throw new Error(mintData.error || 'Minting failed');
          }
        } catch (error: any) {
          console.error('Error during mint process:', error);
          setMessage({
            type: 'error',
            text: `Failed: ${error.message || 'Unknown error'}. Please try again.`,
          });
        } finally {
          setProcessing(false);
        }
      }
    };

    completeMint();
  }, [txSuccess, isConfirming, waitingForPayment, txHash, subname, address]);

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

    if (length >= 10) {
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
      setMessage(null);
      setMintedSubname(null);
    } else {
      setPrice(0);
      setPriceUSD(0);
      setMessage(null);
      setMintedSubname(null);
    }
  };

  // Combined check and mint function
  const handleMint = async () => {
    if (!isConnected || !address) {
      setMessage({ type: 'warning', text: 'Please connect your wallet first' });
      return;
    }

    if (!subname || subname.length === 0) {
      setMessage({ type: 'warning', text: 'Please enter a subname' });
      return;
    }

    setProcessing(true);
    setMessage({ type: 'info', text: 'Checking availability... 🔍' });

    try {
      // Step 1: Check availability
      const checkResponse = await fetch(`/api/ens/check?subname=${subname}`);
      const checkData = await checkResponse.json();

      if (!checkData.available) {
        setMessage({ type: 'error', text: `😢 ${subname}.${PARENT_ENS} is already taken` });
        setProcessing(false);
        return;
      }

      // Step 2: Send payment if needed
      if (price > 0) {
        setMessage({ type: 'info', text: 'Sending payment... Please confirm in your wallet 💰' });
        setWaitingForPayment(true);

        // Convert price to string with reasonable precision (6 decimals)
        const priceString = price.toFixed(6);

        // Send transaction using wagmi
        sendTransaction({
          to: PAYMENT_ADDRESS,
          value: parseEther(priceString),
        });

        // Wait for the transaction to be sent and confirmed
        // This will be handled by the useEffect below
        return; // Exit here, useEffect will continue the flow
      }

      // Step 3: Mint via API (gas-free!)
      setMessage({ type: 'info', text: 'Minting your ENS subname... ✨ (Gas-free!)' });

      const mintResponse = await fetch('/api/ens/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subname,
          address,
        }),
      });

      const mintData = await mintResponse.json();

      if (mintData.success) {
        setMintedSubname(`${subname}.${PARENT_ENS}`);
        setMessage({
          type: 'success',
          text: `🎊 Success! ${subname}.${PARENT_ENS} is now yours!`,
        });
        setSubname('');
        setPrice(0);
        setPriceUSD(0);
      } else {
        throw new Error(mintData.error || 'Minting failed');
      }
    } catch (error: any) {
      console.error('Error during mint process:', error);
      setMessage({
        type: 'error',
        text: `Failed: ${error.message || 'Unknown error'}. Please try again.`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPriceTier = (name: string) => {
    const length = name.length;
    if (length >= 10) return 'free';
    if (length >= 4) return 'medium';
    return 'premium';
  };

  const currentTier = subname ? getPriceTier(subname) : null;

  return (
    <MintingContainer>
      <SectionTitle>⚡ Mint Your ENS ⚡</SectionTitle>

      <WalletSection>
        <ConnectButton />
      </WalletSection>

      <GasFreeNotice>
        ⚡ <strong>100% Gas-Free Minting!</strong> ⚡<br />
        No blockchain fees - just pay the name price (if applicable)
      </GasFreeNotice>

      <PricingInfo>
        <PricingTitle>💰 Pricing</PricingTitle>
        <PricingItem highlight={currentTier === 'free'}>
          <span>10+ characters</span>
          <strong style={{ color: '#4BB749' }}>FREE! 🎉</strong>
        </PricingItem>
        <PricingItem highlight={currentTier === 'medium'}>
          <span>4-9 characters</span>
          <strong style={{ color: '#FFD700' }}>$50 USD (≈ {ethPrice > 0 ? (50 / ethPrice).toFixed(4) : '0.016'} ETH)</strong>
        </PricingItem>
        <PricingItem highlight={currentTier === 'premium'}>
          <span>1-3 characters (Premium)</span>
          <strong style={{ color: '#FF6B6B' }}>$200 USD (≈ {ethPrice > 0 ? (200 / ethPrice).toFixed(4) : '0.067'} ETH)</strong>
        </PricingItem>
      </PricingInfo>

      {!mintedSubname ? (
        <>
          <InputGroup>
            <Label>Choose Your Subname:</Label>
            <InputWrapper>
              <Input
                type="text"
                placeholder="yourname"
                value={subname}
                onChange={(e) => handleSubnameChange(e.target.value)}
                disabled={processing}
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
                variant="primary"
                onClick={handleMint}
                disabled={!subname || processing}
              >
                {processing && <LoadingSpinner />}
                {processing ? 'Processing...' : (priceUSD > 0 ? `Mint for $${priceUSD}` : 'Mint FREE! 🎉')}
              </ActionButton>
            </ButtonGroup>
          )}
        </>
      ) : (
        <SuccessBox>
          <SuccessTitle>🎊 Congratulations! 🎊</SuccessTitle>
          <SuccessText>
            Your ENS <strong>{mintedSubname}</strong> has been successfully minted!
          </SuccessText>
          <SuccessText>
            Now you can <strong>personalize your ENS</strong> with an avatar, bio, social links, and more on the official ENS app.
            Make your identity truly unique! 🎨✨
          </SuccessText>
          <ManageButton
            href={`https://app.ens.domains/${mintedSubname}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage Your ENS 🎯
          </ManageButton>
        </SuccessBox>
      )}
    </MintingContainer>
  );
};

export default ENSMinting;
