import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Section = styled.section`
  margin-top: 4rem;
  padding: 3rem 0;
`;

const Title = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  text-align: center;
  margin-bottom: 2rem;
  background: var(--gradient-zeus);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Card = styled(motion.a)`
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(165, 94, 234, 0.1) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
  text-decoration: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 215, 0, 0.6);
    box-shadow: 0 5px 30px rgba(255, 215, 0, 0.3);
  }
`;

const Avatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 215, 0, 0.5);
  object-fit: cover;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.div`
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 900;
  color: #FFD700;
  margin-bottom: 0.3rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const Subtext = styled.div`
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: rgba(255, 100, 100, 0.9);
  font-size: 1.2rem;
  padding: 2rem;
`;

interface Subname {
  name: string;
  label: string;
  avatar?: string;
  createdAt?: string;
}

const RecentENSRegistrations: React.FC = () => {
  const [subnames, setSubnames] = useState<Subname[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentRegistrations = async () => {
      try {
        const apiUrl = process.env.NODE_ENV === 'production'
          ? '/api/ens/recent'
          : 'http://localhost:3000/api/ens/recent';

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success && data.subnames) {
          // Extract subnames from the response
          // The structure may vary, adjust based on actual API response
          const subnameList = data.subnames.items || data.subnames.data || data.subnames;

          if (Array.isArray(subnameList)) {
            setSubnames(subnameList.slice(0, 9));
          } else {
            setSubnames([]);
          }
        } else {
          setError('No registrations found');
        }
      } catch (err) {
        console.error('Error fetching recent registrations:', err);
        setError('Unable to load recent registrations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRegistrations();
  }, []);

  if (loading) {
    return (
      <Section>
        <Title>⚡ Recent Registrations ⚡</Title>
        <LoadingMessage>Loading recent registrations...</LoadingMessage>
      </Section>
    );
  }

  if (error || subnames.length === 0) {
    return (
      <Section>
        <Title>⚡ Recent Registrations ⚡</Title>
        <ErrorMessage>{error || 'No registrations yet. Be the first!'}</ErrorMessage>
      </Section>
    );
  }

  return (
    <Section>
      <Title>⚡ Recent Registrations ⚡</Title>
      <Grid>
        {subnames.map((subname, index) => {
          // Build full ENS name
          const fullName = subname.name || `${subname.label}.zeuscc8.eth`;

          return (
            <Card
              key={fullName || index}
              href={`https://app.ens.domains/${fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
            <Avatar
              src={subname.avatar || '/images/zeus-avatar.jpg'}
              alt={subname.label}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/zeus-avatar.jpg';
              }}
            />
            <Info>
              <Name>{subname.label}</Name>
              <Subtext>.zeuscc8.eth</Subtext>
            </Info>
          </Card>
        );
        })}
      </Grid>
    </Section>
  );
};

export default RecentENSRegistrations;
