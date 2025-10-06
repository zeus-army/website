import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;900&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --color-primary: #FFD700; /* Gold */
    --color-secondary: #1a1a1a;
    --color-accent: #4B0082; /* Indigo */
    --color-text: #FFFFFF;
    --color-text-secondary: #B8B8B8;
    --color-background: #000000;
    --color-card: rgba(26, 26, 26, 0.9);
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'Inter', sans-serif;
  }

  body {
    font-family: var(--font-body);
    background-color: var(--color-background);
    color: var(--color-text);
    overflow-x: hidden;
    position: relative;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    letter-spacing: 0.05em;
  }

  h1 {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: var(--color-primary);
  }

  h3 {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }

  p {
    line-height: 1.6;
    color: var(--color-text-secondary);
  }

  a {
    text-decoration: none;
    color: var(--color-primary);
    transition: all 0.3s ease;

    &:hover {
      color: var(--color-accent);
    }
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-weight: 600;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Zeus Lightning Background */
  .lightning-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: -1;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle at center,
        transparent 0%,
        rgba(255, 215, 0, 0.03) 30%,
        rgba(75, 0, 130, 0.05) 60%,
        transparent 100%
      );
      animation: rotate 30s linear infinite;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Glitch effect for titles */
  .glitch {
    position: relative;
    
    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    &::before {
      animation: glitch-1 0.5s infinite;
      color: var(--color-primary);
      z-index: -1;
    }
    
    &::after {
      animation: glitch-2 0.5s infinite;
      color: var(--color-accent);
      z-index: -2;
    }
  }

  @keyframes glitch-1 {
    0% {
      clip: rect(44px, 450px, 56px, 0);
    }
    25% {
      clip: rect(10px, 450px, 140px, 0);
    }
    50% {
      clip: rect(30px, 450px, 70px, 0);
    }
    75% {
      clip: rect(90px, 450px, 120px, 0);
    }
    100% {
      clip: rect(60px, 450px, 100px, 0);
    }
  }

  @keyframes glitch-2 {
    0% {
      clip: rect(65px, 450px, 119px, 0);
      transform: translate(-3px, 0);
    }
    25% {
      clip: rect(79px, 450px, 86px, 0);
      transform: translate(3px, 0);
    }
    50% {
      clip: rect(15px, 450px, 140px, 0);
      transform: translate(-3px, 0);
    }
    75% {
      clip: rect(45px, 450px, 76px, 0);
      transform: translate(3px, 0);
    }
    100% {
      clip: rect(100px, 450px, 30px, 0);
      transform: translate(-3px, 0);
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-accent);
  }
`;