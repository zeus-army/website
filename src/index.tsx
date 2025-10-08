import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handlers - DISABLED to prevent blocking clicks
// window.addEventListener('error', (event) => {
//   console.error('Global error caught:', event.error);
//   event.preventDefault();
// });

// window.addEventListener('unhandledrejection', (event) => {
//   console.error('Global unhandled rejection:', event.reason);
//   event.preventDefault();
// });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
