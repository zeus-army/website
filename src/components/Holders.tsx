import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';

// Types
interface Holder {
  rank: number;
  address: string;
  ensName: string | null;
  zeusBalance: string;
  wzeusBalance: string;
  totalBalance: string;
  totalBalanceRaw: number;
  usdValue: string;
  supplyPercentage: string;
}

type SortField = 'rank' | 'totalBalanceRaw' | 'usdValue';
type SortOrder = 'asc' | 'desc';

// Styled Components
const HoldersSection = styled.section`
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
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  text-align: center;
  margin-bottom: 1rem;
  background: var(--gradient-zeus);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

const Description = styled.p`
  font-family: var(--font-body);
  font-size: 1.2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const PriceDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-family: var(--font-body);
  font-size: 1.5rem;
  color: var(--color-primary);
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

const TableWrapper = styled.div`
  background: rgba(10, 14, 39, 0.6);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
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
      rgba(255, 215, 0, 0.05),
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

const TableControls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SortButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)'
    : 'rgba(255, 215, 0, 0.1)'};
  border: 2px solid ${props => props.active ? '#FFD700' : 'rgba(255, 215, 0, 0.3)'};
  border-radius: 12px;
  color: ${props => props.active ? '#0a0e27' : '#FFD700'};
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: ${props => props.active ? 'none' : '0 0 10px rgba(255, 215, 0, 0.5)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Table = styled.div`
  width: 100%;
  position: relative;
  z-index: 1;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 150px 150px 150px 150px;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 12px;
  margin-bottom: 1rem;
  font-family: var(--font-body);
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1rem;

  @media (max-width: 1200px) {
    grid-template-columns: 50px 1fr 120px 120px 120px;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 40px 1fr 100px 100px;
    font-size: 0.8rem;
  }
`;

const TableHeaderCell = styled.div`
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5),
  &:nth-child(6) {
    text-align: right;
  }

  @media (max-width: 768px) {
    &:nth-child(3) {
      display: none; // Hide ZEUS balance on mobile
    }
    &:nth-child(4) {
      display: none; // Hide wZEUS balance on mobile
    }
  }
`;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 215, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #FFA500 0%, #FF8C00 100%);
  }
`;

const TableRow = styled.div<{ isTop3: boolean }>`
  display: grid;
  grid-template-columns: 60px 1fr 150px 150px 150px 150px;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.isTop3
    ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)'
    : 'rgba(26, 31, 58, 0.4)'};
  border: 1px solid ${props => props.isTop3 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  margin-bottom: 0.75rem;
  font-family: var(--font-body);
  color: var(--color-text-light);
  transition: all 0.3s ease;
  position: relative;

  ${props => props.isTop3 && `
    box-shadow:
      0 0 20px rgba(255, 215, 0, 0.3),
      inset 0 0 20px rgba(255, 215, 0, 0.1);

    &::before {
      content: '🏆';
      position: absolute;
      top: 50%;
      left: -10px;
      transform: translateY(-50%);
      font-size: 1.5rem;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(-50%); }
      50% { transform: translateY(-60%); }
    }
  `}

  &:hover {
    transform: translateX(5px);
    background: ${props => props.isTop3
      ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.15) 100%)'
      : 'rgba(26, 31, 58, 0.6)'};
    border-color: var(--color-primary);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
  }

  @media (max-width: 1200px) {
    grid-template-columns: 50px 1fr 120px 120px 120px;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 40px 1fr 100px 100px;
    font-size: 0.8rem;
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;

  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5),
  &:nth-child(6) {
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    &:nth-child(3) {
      display: none;
    }
    &:nth-child(4) {
      display: none;
    }
  }
`;

const Rank = styled.div<{ rank: number }>`
  font-weight: 700;
  font-size: 1.2rem;
  color: ${props => {
    if (props.rank === 1) return '#FFD700';
    if (props.rank === 2) return '#C0C0C0';
    if (props.rank === 3) return '#CD7F32';
    return 'var(--color-text-light)';
  }};
`;

const AddressLink = styled.a`
  color: var(--color-secondary);
  text-decoration: none;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;

  &:hover {
    color: var(--color-primary);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
    transform: scale(1.05);
  }
`;

const ENSName = styled.span`
  color: var(--color-primary);
  font-weight: 700;
`;

const Balance = styled.div`
  font-weight: 600;
  color: var(--color-text-light);
`;

const USDValue = styled.div`
  font-weight: 700;
  color: #4BB749;
  font-size: 1.1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--color-primary);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid #ff6b6b;
  border-radius: 12px;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 2rem auto 0;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  border: 4px solid #000;
  border-radius: 15px;
  color: #0a0e27;
  font-family: var(--font-body);
  font-size: 1.2rem;
  font-weight: 900;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow:
    0 8px 0 #000,
    0 8px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 11px 0 #000,
      0 11px 25px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(2px);
    box-shadow:
      0 4px 0 #000,
      0 4px 15px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Component
const Holders: React.FC = () => {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const tableBodyRef = useRef<HTMLDivElement>(null);

  // Fetch holders
  const fetchHolders = useCallback(async (offsetVal: number, limitVal: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/holders?offset=${offsetVal}&limit=${limitVal}`);
      const data = await response.json();

      if (data.success) {
        if (append) {
          setHolders(prev => [...prev, ...data.data]);
        } else {
          setHolders(data.data);
        }
        setPrice(data.price);
        setHasMore(data.count === limitVal);
      } else {
        setError(data.error || 'Failed to fetch holders');
      }
    } catch (err) {
      setError('Failed to fetch holders');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHolders(0, 10);
  }, [fetchHolders]);

  // Load more handlers
  const handleLoadMore = () => {
    const newOffset = offset + 10;
    setOffset(newOffset);
    fetchHolders(newOffset, 10, true);
  };

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc for balance/price, asc for rank
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  // Apply sorting
  const sortedHolders = [...holders].sort((a, b) => {
    let compareValue = 0;

    if (sortField === 'rank') {
      compareValue = a.rank - b.rank;
    } else if (sortField === 'totalBalanceRaw') {
      compareValue = a.totalBalanceRaw - b.totalBalanceRaw;
    } else if (sortField === 'usdValue') {
      compareValue = parseFloat(a.usdValue) - parseFloat(b.usdValue);
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Format address for display
  const formatAddress = (address: string, ensName: string | null) => {
    const zapperUrl = `https://zapper.xyz/es/account/${ensName || address}`;

    if (ensName) {
      return (
        <AddressLink href={zapperUrl} target="_blank" rel="noopener noreferrer">
          <ENSName>{ensName}</ENSName>
        </AddressLink>
      );
    }

    const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <AddressLink href={zapperUrl} target="_blank" rel="noopener noreferrer">
        {shortened}
      </AddressLink>
    );
  };

  if (loading) {
    return (
      <HoldersSection>
        <Container>
          <SectionTitle>Top Holders</SectionTitle>
          <LoadingMessage>Loading holders... ⚡</LoadingMessage>
        </Container>
      </HoldersSection>
    );
  }

  if (error) {
    return (
      <HoldersSection>
        <Container>
          <SectionTitle>Top Holders</SectionTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </Container>
      </HoldersSection>
    );
  }

  return (
    <HoldersSection>
      <Container>
        <SectionTitle>Top Holders</SectionTitle>
        <Description>
          Leaderboard of ZEUS + wZEUS holders aggregated by address.
          1:1 ratio between both tokens.
        </Description>

        {price > 0 && (
          <PriceDisplay>
            ZEUS Price: ${price.toFixed(6)}
          </PriceDisplay>
        )}

        <TableWrapper>
          <TableControls>
            <SortButton
              active={sortField === 'rank'}
              onClick={() => handleSort('rank')}
            >
              Sort by Rank {sortField === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
            </SortButton>
            <SortButton
              active={sortField === 'totalBalanceRaw'}
              onClick={() => handleSort('totalBalanceRaw')}
            >
              Sort by Balance {sortField === 'totalBalanceRaw' && (sortOrder === 'asc' ? '↑' : '↓')}
            </SortButton>
            <SortButton
              active={sortField === 'usdValue'}
              onClick={() => handleSort('usdValue')}
            >
              Sort by USD Value {sortField === 'usdValue' && (sortOrder === 'asc' ? '↑' : '↓')}
            </SortButton>
          </TableControls>

          <Table>
            <TableHeader>
              <TableHeaderCell>Rank</TableHeaderCell>
              <TableHeaderCell>Address / ENS</TableHeaderCell>
              <TableHeaderCell>ZEUS</TableHeaderCell>
              <TableHeaderCell>wZEUS</TableHeaderCell>
              <TableHeaderCell>Total</TableHeaderCell>
              <TableHeaderCell>USD Value</TableHeaderCell>
            </TableHeader>

            <TableBody ref={tableBodyRef}>
              {sortedHolders.map((holder) => (
                <TableRow key={holder.address} isTop3={holder.rank <= 3}>
                  <TableCell>
                    <Rank rank={holder.rank}>#{holder.rank}</Rank>
                  </TableCell>
                  <TableCell>
                    {formatAddress(holder.address, holder.ensName)}
                  </TableCell>
                  <TableCell>
                    <Balance>{holder.zeusBalance}</Balance>
                  </TableCell>
                  <TableCell>
                    <Balance>{holder.wzeusBalance}</Balance>
                  </TableCell>
                  <TableCell>
                    <Balance>{holder.totalBalance}</Balance>
                  </TableCell>
                  <TableCell>
                    <USDValue>${holder.usdValue}</USDValue>
                  </TableCell>
                </TableRow>
              ))}

              {loadingMore && (
                <LoadingMessage>Loading more holders... ⚡</LoadingMessage>
              )}
            </TableBody>
          </Table>

          {hasMore && !loadingMore && (
            <LoadMoreButton onClick={handleLoadMore}>
              Load More
            </LoadMoreButton>
          )}
        </TableWrapper>
      </Container>
    </HoldersSection>
  );
};

export default Holders;
