import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
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

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.error('Error boundary caught:', this.state.error);
      // Don't return null, return children anyway to prevent blocking
      return this.props.children;
    }

    return this.props.children;
  }
}

function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider);
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
