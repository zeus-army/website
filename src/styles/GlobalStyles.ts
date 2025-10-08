import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Bungee+Shade&family=Fredoka:wght@400;600;700;900&family=Comic+Neue:wght@400;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    /* Rainbow colors from Zeus's tongue */
    --color-red: #FF6B6B;
    --color-orange: #FF9F40;
    --color-yellow: #FFD700; /* Zeus Gold */
    --color-green: #4BB749; /* Pepe Green */
    --color-blue: #1E90FF; /* Zeus Electric Blue */
    --color-purple: #A55EEA;
    --color-pink: #FF6B9D;

    /* Main colors - Zeus theme */
    --color-primary: #FFD700; /* Zeus Gold/Yellow */
    --color-secondary: #1E90FF; /* Zeus Electric Blue */
    --color-accent: #4BB749; /* Pepe Green accent */

    /* UI colors */
    --color-text: #2C2C2C;
    --color-text-light: #FFFFFF;
    --color-background: #0a0e27; /* Deep blue night sky */
    --color-card: rgba(10, 14, 39, 0.85);
    --color-card-light: rgba(255, 255, 255, 0.1);

    /* Fonts */
    --font-display: 'Bungee', cursive;
    --font-body: 'Comic Neue', cursive;
    --font-alt: 'Fredoka', sans-serif;
    --font-special: 'Bungee Shade', cursive;

    /* Rainbow gradient */
    --gradient-rainbow: linear-gradient(90deg,
      #FF6B6B 0%,
      #FF9F40 16.66%,
      #FFD700 33.33%,
      #4BB749 50%,
      #1E90FF 66.66%,
      #A55EEA 83.33%,
      #FF6B9D 100%);

    /* Zeus gradients */
    --gradient-zeus: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
    --gradient-sky: linear-gradient(180deg, #1E90FF 0%, #4169E1 50%, #0047AB 100%);
    --gradient-lightning: linear-gradient(45deg, #FFD700 0%, #FFFFFF 50%, #1E90FF 100%);
  }

  body {
    font-family: var(--font-body);
    background: linear-gradient(180deg,
      #B0E0E6 0%,
      #87CEEB 50%,
      #B0E0E6 100%
    );
    color: var(--color-text);
    overflow-x: hidden;
    position: relative;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    letter-spacing: 0.05em;
  }

  h1 {
    font-size: clamp(4rem, 10vw, 8rem);
    font-weight: 900;
    text-transform: uppercase;
    background: linear-gradient(
      180deg,
      #FFFFFF 0%,
      #FFDD59 25%,
      #FF9F40 50%,
      #FF6B6B 75%,
      #A55EEA 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    letter-spacing: 0.02em;
    
    /* 3D effect */
    &::before {
      content: attr(data-text);
      position: absolute;
      left: 0;
      top: 0;
      z-index: -1;
      background: linear-gradient(
        180deg,
        #1a1a1a 0%,
        #2d2d2d 50%,
        #1a1a1a 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translate(4px, 4px);
    }
    
    /* Glow effect */
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      top: 0;
      z-index: -2;
      filter: blur(20px);
      opacity: 0.7;
      background: var(--gradient-rainbow);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  h2 {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    text-transform: uppercase;
    color: #FFFFFF;
    text-shadow: 
      0 0 30px rgba(255, 221, 89, 0.8),
      0 0 60px rgba(255, 107, 107, 0.6),
      0 0 90px rgba(165, 94, 234, 0.4),
      3px 3px 0px #000000,
      4px 4px 0px #1a1a1a,
      5px 5px 0px #2d2d2d,
      6px 6px 10px rgba(0, 0, 0, 0.5);
    position: relative;
    letter-spacing: 0.05em;
  }

  h3 {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 800;
    text-transform: uppercase;
    color: var(--color-text-light);
    text-shadow: 
      0 0 20px rgba(75, 183, 73, 0.7),
      2px 2px 0px #000000,
      3px 3px 5px rgba(0, 0, 0, 0.5);
  }

  p {
    line-height: 1.6;
    color: var(--color-text-light);
    font-weight: 400;
    opacity: 0.9;
  }

  a {
    text-decoration: none;
    color: var(--color-primary);
    transition: all 0.3s ease;
    font-weight: 700;

    &:hover {
      color: var(--color-secondary);
      transform: scale(1.05);
    }
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* Glow text utility */
  .glow {
    text-shadow: 
      0 0 20px currentColor,
      0 0 40px currentColor,
      0 0 60px currentColor;
  }
  
  /* Rainbow text animation */
  @keyframes rainbow-text {
    0% { color: var(--color-red); }
    16.66% { color: var(--color-orange); }
    33.33% { color: var(--color-yellow); }
    50% { color: var(--color-green); }
    66.66% { color: var(--color-blue); }
    83.33% { color: var(--color-purple); }
    100% { color: var(--color-red); }
  }
  
  .rainbow-animate {
    animation: rainbow-text 5s linear infinite;
  }

  /* Rainbow Psychedelic Background */
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
      background: 
        conic-gradient(
          from 0deg at 50% 50%,
          transparent 0deg,
          rgba(255, 107, 107, 0.1) 60deg,
          transparent 120deg,
          rgba(255, 159, 64, 0.1) 180deg,
          transparent 240deg,
          rgba(255, 221, 89, 0.1) 300deg,
          transparent 360deg
        );
      animation: rotate 30s linear infinite;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: 
        conic-gradient(
          from 180deg at 50% 50%,
          transparent 0deg,
          rgba(75, 183, 73, 0.1) 60deg,
          transparent 120deg,
          rgba(92, 195, 255, 0.1) 180deg,
          transparent 240deg,
          rgba(165, 94, 234, 0.1) 300deg,
          transparent 360deg
        );
      animation: rotate 40s linear infinite reverse;
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
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(13, 14, 35, 0.8);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--gradient-rainbow);
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--color-pink), var(--color-purple), var(--color-blue));
  }
`;