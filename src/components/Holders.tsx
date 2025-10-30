import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';

// Types
interface Holder {
  rank: number;
  address: string;
  ensName: string | null;
  zeusBalance: string;
  wzeusBalance: string;
  lpZeusBalance: string;
  totalBalance: string;
  totalBalanceRaw: number;
  usdValue: string;
  supplyPercentage: string;
}

// Known addresses mapping (exchanges, services, etc.)
const KNOWN_ADDRESSES: { [key: string]: string } = {
  '0x000000000000000000000000000000000000dead': 'Liquidity Renounced',
  '0xf97503af8230a7e72909d6614f45e88168ff3c10': 'Uniswap',
  '0xa56b06aa7bfa6cbad8a0b5161ca052d86a5d88e9': 'wZEUS',
  '0xf335788b2251dec93332310d96d15500cdc4c34b': 'CoinEx',
  '0x58edf78281334335effa23101bbe3371b6a36a51': 'Kucoin',
  '0x2933782b5a8d72f2754103d1489614f29bfa4625': 'Kucoin',
  '0x120051a72966950b8ce12eb5496b5d1eeec1541b': 'L3Bank',
  '0xd6216fc19db775df9774a6e33526131da7d19a2c': 'Kucoin',
  '0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23': 'Kucoin',
};

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

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 2rem;
`;

const SearchWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  background: rgba(10, 14, 39, 0.8);
  color: var(--color-text-light);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchButton = styled.button`
  padding: 1rem 2rem;
  border-radius: 12px;
  border: 3px solid #000;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 6px 0 #000, 0 6px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 0 #000, 0 8px 25px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 0 #000, 0 3px 15px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const HistoryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const HistoryButton = styled.button<{ $isActive: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 2px solid ${props => props.$isActive ? 'var(--color-primary)' : 'rgba(255, 215, 0, 0.4)'};
  background: ${props => props.$isActive
    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.3) 100%)'
    : 'rgba(26, 31, 58, 0.6)'};
  color: ${props => props.$isActive ? 'var(--color-primary)' : 'var(--color-text-light)'};
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: ${props => props.$isActive ? '700' : '600'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${props => props.$isActive
    ? '0 0 15px rgba(255, 215, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.2)'
    : 'none'};

  &:hover {
    background: ${props => props.$isActive
      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.4) 100%)'
      : 'rgba(26, 31, 58, 0.9)'};
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DeleteIcon = styled.span`
  color: #ff6b6b;
  font-weight: 900;
  font-size: 1.1rem;
  line-height: 1;

  &:hover {
    color: #ff4757;
  }
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
  overflow: visible; /* Changed from hidden to visible to show trophy */

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
    pointer-events: none;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }
`;

const Table = styled.div`
  width: 100%;
  position: relative;
  z-index: 1;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 130px 130px 130px 150px 150px;
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
    grid-template-columns: 50px 1fr 110px 110px 110px 120px;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 35px 1fr 80px 90px;
    gap: 0.3rem;
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
`;

const TableHeaderCell = styled.div`
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5),
  &:nth-child(6),
  &:nth-child(7) {
    text-align: right;
  }

  @media (max-width: 1200px) {
    &:nth-child(5) {
      display: none; // Hide LP ZEUS balance on medium screens
    }
  }

  @media (max-width: 768px) {
    &:nth-child(3) {
      display: none; // Hide ZEUS balance on mobile
    }
    &:nth-child(4) {
      display: none; // Hide wZEUS balance on mobile
    }
    &:nth-child(5) {
      display: none; // Hide LP ZEUS balance on mobile
    }
  }
`;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
  overflow-x: visible; /* Allow trophy emoji to show */
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
  grid-template-columns: 60px 1fr 130px 130px 130px 150px 150px;
  gap: 1rem;
  padding: 1rem;
  padding-left: ${props => props.isTop3 ? '3rem' : '1rem'}; /* Extra padding for trophy */
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
      left: 0.5rem;
      transform: translateY(-50%);
      font-size: 1.5rem;
      animation: bounce 2s infinite;
      z-index: 1;
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
    grid-template-columns: 50px 1fr 110px 110px 110px 120px;
    gap: 0.5rem;
    font-size: 0.9rem;
    padding-left: ${props => props.isTop3 ? '2.5rem' : '1rem'};

    ${props => props.isTop3 && `
      &::before {
        font-size: 1.2rem;
        left: 0.4rem;
      }
    `}
  }

  @media (max-width: 768px) {
    grid-template-columns: 35px 1fr 80px 90px;
    gap: 0.3rem;
    padding: 0.75rem 0.5rem;
    padding-left: 0.5rem; /* Remove extra padding since trophy is hidden */
    font-size: 0.75rem;

    ${props => props.isTop3 && `
      &::before {
        display: none; /* Hide trophy on mobile */
      }
    `}
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  word-break: break-word;
  overflow: hidden;

  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5),
  &:nth-child(6),
  &:nth-child(7) {
    justify-content: flex-end;
  }

  @media (max-width: 1200px) {
    &:nth-child(5) {
      display: none; // Hide LP ZEUS balance on medium screens
    }
  }

  @media (max-width: 768px) {
    &:nth-child(3) {
      display: none;
    }
    &:nth-child(4) {
      display: none;
    }
    &:nth-child(5) {
      display: none;
    }

    /* Ensure address doesn't overflow */
    &:nth-child(2) {
      min-width: 0;
      overflow: hidden;
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

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const AddressLink = styled.a`
  color: var(--color-secondary);
  text-decoration: none;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--color-primary);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const ENSName = styled.span<{ $isZeusENS?: boolean }>`
  ${props => props.$isZeusENS ? `
    background: linear-gradient(
      90deg,
      #FF0080 0%,
      #FF8C00 16.67%,
      #FFD700 33.33%,
      #00FF00 50%,
      #00CED1 66.67%,
      #4169E1 83.33%,
      #8B00FF 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% auto;
    animation: rainbow-shift 3s linear infinite;

    @keyframes rainbow-shift {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
  ` : `
    color: var(--color-primary);
  `}
  font-weight: 700;
`;

const Balance = styled.div`
  font-weight: 600;
  color: var(--color-text-light);

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const USDValue = styled.div`
  font-weight: 700;
  color: #4BB749;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.5rem;
  transition: transform 0.3s ease;

  &.expanded {
    transform: rotate(90deg);
  }

  &:hover {
    transform: scale(1.2);
  }

  &.expanded:hover {
    transform: rotate(90deg) scale(1.2);
  }
`;

const SubRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 130px 130px 130px 150px 150px;
  gap: 1rem;
  padding: 0.75rem 1rem 0.75rem 4rem;
  background: rgba(165, 94, 234, 0.1);
  border-left: 3px solid rgba(165, 94, 234, 0.5);
  margin: 0.25rem 0 0.25rem 3rem;
  border-radius: 8px;
  font-family: var(--font-body);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(165, 94, 234, 0.15);
    border-left-color: rgba(165, 94, 234, 0.8);
  }

  @media (max-width: 1200px) {
    grid-template-columns: 50px 1fr 110px 110px 110px 120px;
    padding-left: 3.5rem;
    margin-left: 2.5rem;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 95px;
    padding: 0.5rem 0.5rem 0.5rem 1.5rem;
    margin: 0.15rem 0 0.15rem 1rem;
    gap: 0.5rem;
    font-size: 0.7rem;

    /* Hide rank, ZEUS, wZEUS, LP ZEUS, Total columns on mobile */
    & > div:nth-child(1),
    & > div:nth-child(3),
    & > div:nth-child(4),
    & > div:nth-child(5),
    & > div:nth-child(6) {
      display: none;
    }
  }
`;

const ShowMoreLPButton = styled.button`
  margin: 0.5rem 0 0.5rem 3rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(165, 94, 234, 0.3), rgba(138, 75, 194, 0.3));
  border: 2px solid rgba(165, 94, 234, 0.5);
  border-radius: 8px;
  color: var(--color-text-light);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(165, 94, 234, 0.4), rgba(138, 75, 194, 0.4));
    border-color: rgba(165, 94, 234, 0.8);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    margin-left: 1.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
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

// Cookie utilities
const COOKIE_NAME = 'zeusSearchHistory';
const MAX_HISTORY = 10;

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const getSearchHistory = (): string[] => {
  const cookie = getCookie(COOKIE_NAME);
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie));
  } catch {
    return [];
  }
};

const saveSearchHistory = (addresses: string[]) => {
  const encoded = encodeURIComponent(JSON.stringify(addresses));
  setCookie(COOKIE_NAME, encoded);
};

const addToSearchHistory = (address: string) => {
  const history = getSearchHistory();
  const normalized = address.toLowerCase();

  // Remove if already exists
  const filtered = history.filter(addr => addr.toLowerCase() !== normalized);

  // Add to beginning
  const newHistory = [address, ...filtered].slice(0, MAX_HISTORY);
  saveSearchHistory(newHistory);

  return newHistory;
};

const removeFromSearchHistory = (address: string) => {
  const history = getSearchHistory();
  const normalized = address.toLowerCase();
  const filtered = history.filter(addr => addr.toLowerCase() !== normalized);
  saveSearchHistory(filtered);

  return filtered;
};

// Component
const Holders: React.FC = () => {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [marketCap, setMarketCap] = useState<number>(0);
  const [wzeusValue, setWzeusValue] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [lpHolders, setLpHolders] = useState<{ [key: string]: Holder[] }>({});
  const [lpOffset, setLpOffset] = useState<{ [key: string]: number }>({});
  const [lpLoading, setLpLoading] = useState<{ [key: string]: boolean }>({});
  const [totalLPHolders, setTotalLPHolders] = useState<number>(0);
  const [wzeusHolders, setWzeusHolders] = useState<{ [key: string]: Holder[] }>({});
  const [wzeusOffset, setWzeusOffset] = useState<{ [key: string]: number }>({});
  const [wzeusLoading, setWzeusLoading] = useState<{ [key: string]: boolean }>({});
  const [totalWZEUSHolders, setTotalWZEUSHolders] = useState<number>(0);
  const tableBodyRef = useRef<HTMLDivElement>(null);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Fetch holders
  const fetchHolders = useCallback(async (offsetVal: number, limitVal: number, append: boolean = false, address?: string) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const url = address
        ? `/api/holders?address=${encodeURIComponent(address)}`
        : `/api/holders?offset=${offsetVal}&limit=${limitVal}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (append) {
          setHolders(prev => [...prev, ...data.data]);
        } else {
          setHolders(data.data);
        }
        setPrice(data.price);
        setMarketCap(data.marketCap || 0);
        setWzeusValue(data.wzeusValue || 0);
        setHasMore(data.count === limitVal && !address);
        setIsSearching(!!address);
      } else {
        setError(data.error || 'Failed to fetch holders');
        setHolders([]);
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

  // Search handlers
  const handleSearch = () => {
    if (!searchAddress.trim()) return;

    setError('');
    setOffset(0);
    fetchHolders(0, 10, false, searchAddress.trim());

    // Add to history
    const newHistory = addToSearchHistory(searchAddress.trim());
    setSearchHistory(newHistory);
  };

  const handleHistoryClick = (address: string) => {
    // Check if this address is already active (toggle behavior)
    if (searchAddress.toLowerCase() === address.toLowerCase() && isSearching) {
      // Deactivate filter - return to full leaderboard
      setSearchAddress('');
      setError('');
      setOffset(0);
      setIsSearching(false);
      fetchHolders(0, 10);
    } else {
      // Activate filter for this address
      setSearchAddress(address);
      setError('');
      setOffset(0);
      fetchHolders(0, 10, false, address);
    }
  };

  const handleDeleteHistory = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if this address is currently active
    const isCurrentlyActive = searchAddress.toLowerCase() === address.toLowerCase() && isSearching;

    if (isCurrentlyActive) {
      // Deactivate filter but keep in history
      setSearchAddress('');
      setError('');
      setOffset(0);
      setIsSearching(false);
      fetchHolders(0, 10);
    } else {
      // Remove from history
      const newHistory = removeFromSearchHistory(address);
      setSearchHistory(newHistory);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Toggle row expansion for Uniswap pool or wZEUS contract
  const toggleRowExpansion = async (address: string) => {
    console.log('Toggle row expansion for:', address);
    const newExpanded = new Set(expandedRows);
    const isUniswap = address.toLowerCase() === '0xf97503af8230a7e72909d6614f45e88168ff3c10';
    const isWZEUS = address.toLowerCase() === '0xa56b06aa7bfa6cbad8a0b5161ca052d86a5d88e9';

    if (expandedRows.has(address)) {
      // Collapse
      console.log('Collapsing...');
      newExpanded.delete(address);
      setExpandedRows(newExpanded);
    } else {
      // Expand and fetch holders
      console.log('Expanding...');
      newExpanded.add(address);
      setExpandedRows(newExpanded);

      if (isUniswap) {
        // Fetch LP holders
        if (!lpHolders[address]) {
          console.log('Fetching LP holders for first time...');
          await fetchLPHolders(address, 0);
        } else {
          console.log('LP holders already loaded:', lpHolders[address].length);
        }
      } else if (isWZEUS) {
        // Fetch wZEUS holders
        if (!wzeusHolders[address]) {
          console.log('Fetching wZEUS holders for first time...');
          await fetchWZEUSHolders(address, 0);
        } else {
          console.log('wZEUS holders already loaded:', wzeusHolders[address].length);
        }
      }
    }
  };

  // Fetch LP holders for a specific pool address
  const fetchLPHolders = async (poolAddress: string, offset: number) => {
    try {
      console.log(`Fetching LP holders: offset=${offset}, limit=5`);
      setLpLoading({ ...lpLoading, [poolAddress]: true });

      const response = await fetch(`/api/holders?lpOnly=true&lpOffset=${offset}&lpLimit=5`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('LP holders data:', data);

      if (data.success) {
        const existingHolders = lpHolders[poolAddress] || [];
        console.log(`Existing holders: ${existingHolders.length}, New: ${data.data.length}`);
        setLpHolders({
          ...lpHolders,
          [poolAddress]: [...existingHolders, ...data.data]
        });
        setLpOffset({ ...lpOffset, [poolAddress]: offset + data.count });
        setTotalLPHolders(data.totalLPHolders || 0);
        console.log('Total LP holders:', data.totalLPHolders);
      } else {
        console.error('API returned success=false:', data);
      }
    } catch (err) {
      console.error('Failed to fetch LP holders:', err);
    } finally {
      setLpLoading({ ...lpLoading, [poolAddress]: false });
    }
  };

  // Load more LP holders for a pool
  const handleLoadMoreLPHolders = (poolAddress: string) => {
    const currentOffset = lpOffset[poolAddress] || 0;
    fetchLPHolders(poolAddress, currentOffset);
  };

  // Fetch wZEUS holders for the wZEUS contract
  const fetchWZEUSHolders = async (contractAddress: string, offset: number) => {
    try {
      console.log(`Fetching wZEUS holders: offset=${offset}, limit=5`);
      setWzeusLoading({ ...wzeusLoading, [contractAddress]: true });

      const response = await fetch(`/api/holders?wzeusOnly=true&wzeusOffset=${offset}&wzeusLimit=5`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('wZEUS holders data:', data);

      if (data.success) {
        const existingHolders = wzeusHolders[contractAddress] || [];
        console.log(`Existing holders: ${existingHolders.length}, New: ${data.data.length}`);
        setWzeusHolders({
          ...wzeusHolders,
          [contractAddress]: [...existingHolders, ...data.data]
        });
        setWzeusOffset({ ...wzeusOffset, [contractAddress]: offset + data.count });
        setTotalWZEUSHolders(data.totalWZEUSHolders || 0);
        console.log('Total wZEUS holders:', data.totalWZEUSHolders);
      } else {
        console.error('API returned success=false:', data);
      }
    } catch (err) {
      console.error('Failed to fetch wZEUS holders:', err);
    } finally {
      setWzeusLoading({ ...wzeusLoading, [contractAddress]: false });
    }
  };

  // Load more wZEUS holders
  const handleLoadMoreWZEUSHolders = (contractAddress: string) => {
    const currentOffset = wzeusOffset[contractAddress] || 0;
    fetchWZEUSHolders(contractAddress, currentOffset);
  };

  // Format USD value with K/M suffix and American format
  const formatUSD = (value: string): string => {
    const num = parseFloat(value);

    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    } else if (num >= 1) {
      return `$${num.toFixed(2)}`;
    } else if (num >= 0.01) {
      return `$${num.toFixed(2)}`;
    } else if (num > 0) {
      // For values between 0 and 0.01, show <$0.01
      return '<$0.01';
    } else {
      return '$0.00';
    }
  };

  // Format large numbers with K/M/B suffix
  const formatLargeNumber = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // Format address for display
  const formatAddress = (address: string, ensName: string | null) => {
    const zapperUrl = `https://zapper.xyz/es/account/${address}`;

    // Check if it's a known address (exchange, service, etc.)
    const knownName = KNOWN_ADDRESSES[address.toLowerCase()];
    if (knownName) {
      return (
        <AddressLink href={zapperUrl} target="_blank" rel="noopener noreferrer">
          <ENSName $isZeusENS={false}>{knownName}</ENSName>
        </AddressLink>
      );
    }

    // Check for ENS name - only show if it's a zeuscc8.eth subdomain
    if (ensName && ensName.toLowerCase().endsWith('.zeuscc8.eth')) {
      // Show only the nickname part with rainbow colors
      const displayName = ensName.substring(0, ensName.toLowerCase().indexOf('.zeuscc8.eth'));

      return (
        <AddressLink href={zapperUrl} target="_blank" rel="noopener noreferrer">
          <ENSName $isZeusENS={true}>{displayName}</ENSName>
        </AddressLink>
      );
    }

    // Default: show shortened address
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

        {(marketCap > 0 || wzeusValue > 0) && (
          <PriceDisplay>
            {marketCap > 0 && `Market Cap: ${formatLargeNumber(marketCap)}`}
            {marketCap > 0 && wzeusValue > 0 && ' | '}
            {wzeusValue > 0 && `wZEUS Value: ${formatLargeNumber(wzeusValue)}`}
          </PriceDisplay>
        )}

        <SearchContainer>
          <SearchWrapper>
            <SearchInput
              type="text"
              placeholder="Search by address (0x...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SearchButton onClick={handleSearch} disabled={!searchAddress.trim()}>
              Search
            </SearchButton>
          </SearchWrapper>

          {searchHistory.length > 0 && (
            <HistoryContainer>
              {searchHistory.map((addr, index) => {
                const isActive = isSearching && searchAddress.toLowerCase() === addr.toLowerCase();
                return (
                  <HistoryButton
                    key={index}
                    $isActive={isActive}
                    onClick={() => handleHistoryClick(addr)}
                  >
                    {addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr}
                    <DeleteIcon onClick={(e) => handleDeleteHistory(addr, e)}>
                      ×
                    </DeleteIcon>
                  </HistoryButton>
                );
              })}
            </HistoryContainer>
          )}
        </SearchContainer>

        <TableWrapper>
          <Table>
            <TableHeader>
              <TableHeaderCell>Rank</TableHeaderCell>
              <TableHeaderCell>Holder</TableHeaderCell>
              <TableHeaderCell>ZEUS</TableHeaderCell>
              <TableHeaderCell>wZEUS</TableHeaderCell>
              <TableHeaderCell>LP ZEUS</TableHeaderCell>
              <TableHeaderCell>Total</TableHeaderCell>
              <TableHeaderCell>USD Value</TableHeaderCell>
            </TableHeader>

            <TableBody ref={tableBodyRef}>
              {holders.map((holder) => {
                const isUniswap = holder.address.toLowerCase() === '0xf97503af8230a7e72909d6614f45e88168ff3c10';
                const isWZEUS = holder.address.toLowerCase() === '0xa56b06aa7bfa6cbad8a0b5161ca052d86a5d88e9';
                const isExpandable = isUniswap || isWZEUS;
                const isExpanded = expandedRows.has(holder.address);
                const poolLPHolders = lpHolders[holder.address] || [];
                const currentLPOffset = lpOffset[holder.address] || 0;
                const hasMoreLP = currentLPOffset < totalLPHolders;
                const poolWZEUSHolders = wzeusHolders[holder.address] || [];
                const currentWZEUSOffset = wzeusOffset[holder.address] || 0;
                const hasMoreWZEUS = currentWZEUSOffset < totalWZEUSHolders;

                return (
                  <React.Fragment key={holder.address}>
                    <TableRow isTop3={!!holder.rank && holder.rank <= 3}>
                      <TableCell>
                        <Rank rank={holder.rank || 999}>{holder.rank ? `#${holder.rank}` : '>300'}</Rank>
                      </TableCell>
                      <TableCell>
                        {isExpandable && (
                          <ExpandButton
                            className={isExpanded ? 'expanded' : ''}
                            onClick={() => toggleRowExpansion(holder.address)}
                          >
                            ▶
                          </ExpandButton>
                        )}
                        {formatAddress(holder.address, holder.ensName)}
                      </TableCell>
                      <TableCell>
                        <Balance>{holder.zeusBalance}</Balance>
                      </TableCell>
                      <TableCell>
                        <Balance>{holder.wzeusBalance}</Balance>
                      </TableCell>
                      <TableCell>
                        <Balance>{holder.lpZeusBalance}</Balance>
                      </TableCell>
                      <TableCell>
                        <Balance>{holder.totalBalance}</Balance>
                      </TableCell>
                      <TableCell>
                        <USDValue>{formatUSD(holder.usdValue)}</USDValue>
                      </TableCell>
                    </TableRow>

                    {/* Render LP holders if expanded */}
                    {isUniswap && isExpanded && (
                      <>
                        {poolLPHolders.map((lpHolder, idx) => (
                          <SubRow key={`${holder.address}-lp-${idx}`}>
                            <TableCell>
                              <Rank rank={lpHolder.rank}>#{lpHolder.rank}</Rank>
                            </TableCell>
                            <TableCell>
                              {formatAddress(lpHolder.address, lpHolder.ensName)}
                            </TableCell>
                            <TableCell>
                              <Balance>{lpHolder.zeusBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <Balance>{lpHolder.wzeusBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <Balance>{lpHolder.lpZeusBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <Balance>{lpHolder.totalBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <USDValue>{formatUSD(lpHolder.usdValue)}</USDValue>
                            </TableCell>
                          </SubRow>
                        ))}

                        {/* Show more button */}
                        {hasMoreLP && (
                          <ShowMoreLPButton
                            onClick={() => handleLoadMoreLPHolders(holder.address)}
                            disabled={lpLoading[holder.address]}
                          >
                            {lpLoading[holder.address] ? 'Loading...' : `Show More LP Holders (${totalLPHolders - currentLPOffset} remaining)`}
                          </ShowMoreLPButton>
                        )}
                      </>
                    )}

                    {/* Render wZEUS holders if expanded */}
                    {isWZEUS && isExpanded && (
                      <>
                        {poolWZEUSHolders.map((wzeusHolder, idx) => (
                          <SubRow key={`${holder.address}-wzeus-${idx}`}>
                            <TableCell>
                              <Rank rank={wzeusHolder.rank}>#{wzeusHolder.rank}</Rank>
                            </TableCell>
                            <TableCell>
                              {formatAddress(wzeusHolder.address, wzeusHolder.ensName)}
                            </TableCell>
                            <TableCell>
                              <Balance>{wzeusHolder.zeusBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <Balance>{wzeusHolder.wzeusBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <Balance>{wzeusHolder.lpZeusBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <Balance>{wzeusHolder.totalBalance}</Balance>
                            </TableCell>
                            <TableCell>
                              <USDValue>{formatUSD(wzeusHolder.usdValue)}</USDValue>
                            </TableCell>
                          </SubRow>
                        ))}

                        {/* Show more button */}
                        {hasMoreWZEUS && (
                          <ShowMoreLPButton
                            onClick={() => handleLoadMoreWZEUSHolders(holder.address)}
                            disabled={wzeusLoading[holder.address]}
                          >
                            {wzeusLoading[holder.address] ? 'Loading...' : `Show More wZEUS Holders (${totalWZEUSHolders - currentWZEUSOffset} remaining)`}
                          </ShowMoreLPButton>
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })}

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
