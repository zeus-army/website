# Zeus Army Website 🌩️

The official website for Zeus Army - The most powerful community in the crypto Olympus.

## 📋 Project Information

**Production URL**: https://zeus.army
**Repository**: https://github.com/zeus-army/website

## 🚀 Features

- **Epic Design**: Inspired by Greek mythology with golden colors and lightning effects
- **Wallet Connect**: Integration with Web3 wallets (MetaMask, Rainbow, etc.) via RainbowKit
- **Twitter OAuth**: Twitter authentication for identity verification
- **Leadership Registry**: Public accountability system for project leaders
- **Interactive Roadmap**: The 3 phases towards the Olympus
- **Complete Sections**:
  - Hero with animations
  - About Us
  - Mission (6 main objectives)
  - Roadmap (3 phases)
  - Leadership Registry with message signing and Twitter OAuth
  - How to join the Army
  - Footer with links

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript 5.0.4
- **Styling**: Styled Components
- **Animations**: Framer Motion
- **Web3**: wagmi v2 + RainbowKit v2 + viem
- **Backend**: Vercel Serverless Functions
- **Database**: Upstash Redis (Vercel KV)
- **OAuth**: Twitter OAuth 2.0
- **Deployment**: Vercel

### Note on Dependencies

This project uses TypeScript 5.0.4 for compatibility with modern Web3 libraries (wagmi, viem), while `react-scripts@5.0.1` requires TypeScript 4.x. To resolve this peer dependencies conflict:

- ✅ Includes `.npmrc` file with `legacy-peer-deps=true`
- ✅ Allows npm to install both versions without conflicts
- ✅ Build works correctly locally and on Vercel

## 📦 Installation and Local Development

### Prerequisites

- Node.js (v18+)
- Web3 wallet (MetaMask recommended)
- Vercel account
- Upstash Redis account

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/zeus-army/website.git
cd website
```

2. **Install dependencies**
```bash
npm install
```

> **Note**: The project uses `.npmrc` with `legacy-peer-deps=true` to handle conflicts between TypeScript 5.x (required by wagmi/viem) and react-scripts 5.0.1 (requires TypeScript 4.x). Installation will work automatically.

3. **Configure environment variables**

Create a `.env` file in the project root:

```env
# Twitter OAuth (required)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=https://your-domain.com/api/auth/callback/twitter

# Upstash Redis (required for production)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# Optional - defaults are provided
ETHEREUM_RPC_URL=https://eth.llamarpc.com
ADMIN_PASSWORD=your_secure_admin_password
```

4. **Start Vercel development server**
```bash
vercel dev --listen 3001
```

5. **In another terminal, start the frontend**
```bash
PORT=3000 npm start
```

The application will be available at `http://localhost:3000`

## 🔧 Database Configuration

### Redis Structure

The leaderboard uses Redis with the following structure:

- **Hash**: `leaderboard:{address}` - Stores wallet information
  ```json
  {
    "wallet_address": "0x...",
    "twitter_handle": "@username",
    "zeus_balance": "1000.0",
    "wzeus_balance": "500.0",
    "total_balance": "1500.0",
    "supply_percentage": "0.001%",
    "timestamp": "1234567890"
  }
  ```

- **Set**: `leaderboard:wallets` - List of all registered wallet addresses

## 🚢 Deployment on Vercel

### Environment Variables

Configure these environment variables in Vercel Dashboard:

#### Required Variables

1. **TWITTER_CLIENT_ID**
   - Description: Twitter OAuth 2.0 Client ID
   - Get it from: https://developer.twitter.com/en/portal/dashboard

2. **TWITTER_CLIENT_SECRET**
   - Description: Twitter OAuth 2.0 Client Secret
   - Get it from: https://developer.twitter.com/en/portal/dashboard

3. **ADMIN_PASSWORD**
   - Description: Password for admin endpoint to delete wallets
   - Choose a strong, unique password

#### Optional Variables

4. **TWITTER_CALLBACK_URL** (defaults to production URL)
   - Default: `https://zeus.army/api/auth/callback/twitter`

5. **ETHEREUM_RPC_URL** (has default value)
   - Default: `https://eth.llamarpc.com`

#### Automatic Variables

These are configured automatically when you add Vercel KV:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## 💻 Authentication Flow

### Leadership Registry Process

1. **User connects wallet (via RainbowKit)**
   - Supports MetaMask, Rainbow, Coinbase Wallet, and more
   - Verifies ZEUS token balance
   - Token address: `0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8`

2. **Message signing**
   - User signs a message to verify wallet ownership
   - Message includes accountability statement

3. **Twitter authentication**
   - OAuth 2.0 flow initiated with Twitter
   - Wallet signature passed in `state` parameter
   - Endpoint: `/api/auth/twitter`

4. **Twitter callback**
   - Twitter redirects to: `/api/auth/callback/twitter`
   - Wallet signature verified
   - Twitter username obtained
   - ZEUS and wZEUS balances queried
   - Supply percentage calculated

5. **Registration in Redis**
   - Wallet information stored
   - Added to leadership registry
   - User redirected with confirmation

## 🎨 Customization

### Main Colors

- Primary: `#FFD700` (Gold)
- Secondary: `#1a1a1a` (Dark Gray)
- Accent: `#4B0082` (Indigo)

### Fonts

- Display: Bebas Neue
- Body: Inter

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔑 APIs and Services

### Twitter OAuth 2.0

> ⚠️ **Important**: Configure the exact callback URL in Twitter Developer Portal:
> 1. Go to https://developer.twitter.com/en/portal/dashboard
> 2. Select your Zeus Army app
> 3. In "User authentication settings" → "Callback URL"
> 4. Add: `https://your-domain.com/api/auth/callback/twitter`

- **Scopes**: `tweet.read users.read offline.access`

### Ethereum RPC

- **Provider**: LlamaRPC (or your preferred provider)
- **Default URL**: `https://eth.llamarpc.com`

### ZEUS Token

- **Contract Address**: `0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8`
- **Network**: Ethereum Mainnet

### wZEUS Token (Wrapped ZEUS)

- **Contract Address**: `0xA56B06AA7Bfa6cbaD8A0b5161ca052d86a5D88E9`
- **Network**: Ethereum Mainnet
- **Type**: ERC20Wrapper (1:1 ratio with ZEUS)

## 🤝 Contributing

1. Fork the project
2. Create your branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## ⚡ Zeus Army

Join the most powerful crypto community. The Olympus awaits.

- 🌐 Website: [zeus.army](https://zeus.army)
- 💬 Telegram: [@zeusarmy](https://t.me/zeusarmy)
- 🐦 Twitter: [@zeusarmy](https://twitter.com/zeusarmy)

---

Built with ⚡ by the Zeus Army
