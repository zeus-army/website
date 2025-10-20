import React from 'react';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import Roadmap from '../components/Roadmap';
import Leaderboard from '../components/Leaderboard';
import Mission from '../components/Mission';
import JoinUs from '../components/JoinUs';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <AboutUs />
      <Mission />
      <Roadmap />
      <Leaderboard />
      <JoinUs />
    </>
  );
};

export default HomePage;
