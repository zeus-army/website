import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { GlobalStyles } from './styles/GlobalStyles';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Roadmap from './components/Roadmap';
import Leaderboard from './components/Leaderboard';
import Mission from './components/Mission';
import JoinUs from './components/JoinUs';
import Footer from './components/Footer';

function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Router>
        <GlobalStyles />
        <div className="lightning-bg"></div>
        <Navbar />
        <main>
          <Hero />
          <AboutUs />
          <Mission />
          <Roadmap />
          <Leaderboard />
          <JoinUs />
        </main>
        <Footer />
      </Router>
    </Web3ReactProvider>
  );
}

export default App;
