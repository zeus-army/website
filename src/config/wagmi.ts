import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Zeus Army',
  projectId: '2e7f74f9ce3e956d379731c703c5bfe8',
  chains: [mainnet],
  ssr: false,
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
        trustWallet,
        ledgerWallet,
      ],
    },
  ],
});
