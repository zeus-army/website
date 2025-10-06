import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Fredoka:wght@400;600;700&family=Chewy&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --color-primary: #4BB749; /* Pepe Green */
    --color-secondary: #7B68EE; /* Purple */
    --color-accent: #FFE55C; /* Yellow */
    --color-blue: #4A90E2; /* Blue like Pepe's shirt */
    --color-pink: #FF6B9D; /* Pink accents */
    --color-text: #2C2C2C;
    --color-text-light: #FFFFFF;
    --color-background: #F0F8FF; /* Light blue-ish background */
    --color-card: rgba(255, 255, 255, 0.9);
    --font-display: 'Chewy', cursive;
    --font-body: 'Comic Neue', cursive;
    --font-alt: 'Fredoka', sans-serif;
  }

  body {
    font-family: var(--font-body);
    background-color: var(--color-background);
    color: var(--color-text);
    overflow-x: hidden;
    position: relative;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(75, 183, 73, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(123, 104, 238, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(255, 229, 92, 0.1) 0%, transparent 50%);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    letter-spacing: 0.05em;
  }

  h1 {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 700;
    color: var(--color-primary);
    text-shadow: 3px 3px 0px var(--color-secondary),
                 6px 6px 0px rgba(123, 104, 238, 0.3);
  }

  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: var(--color-secondary);
    text-shadow: 2px 2px 0px var(--color-accent);
  }

  h3 {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }

  p {
    line-height: 1.6;
    color: var(--color-text);
    font-weight: 400;
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
    font-weight: 600;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Psychedelic Background */
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
        repeating-conic-gradient(
          from 0deg at 50% 50%,
          rgba(75, 183, 73, 0.05) 0deg,
          rgba(123, 104, 238, 0.05) 60deg,
          rgba(255, 229, 92, 0.05) 120deg,
          rgba(255, 107, 157, 0.05) 180deg,
          rgba(74, 144, 226, 0.05) 240deg,
          rgba(75, 183, 73, 0.05) 360deg
        );
      animation: rotate 60s linear infinite;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 30% 40%, rgba(75, 183, 73, 0.2) 0%, transparent 40%),
        radial-gradient(circle at 70% 60%, rgba(123, 104, 238, 0.2) 0%, transparent 40%);
      animation: pulse 4s ease-in-out infinite alternate;
    }
  }
  
  @keyframes pulse {
    0% { opacity: 0.5; }
    100% { opacity: 0.8; }
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
    width: 15px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-background);
    border: 2px solid var(--color-primary);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
    border-radius: 10px;
    border: 2px solid var(--color-background);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--color-secondary), var(--color-primary));
  }
`;