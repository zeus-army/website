# Zeus Army Website - Development Guide 🐕⚡

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop or OrbStack (for local Redis)
- An Ethereum wallet (MetaMask recommended)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**

Create a `.env.local` file for local development:
```bash
REDIS_URL=redis://localhost:6379
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

### Local Development

#### Option 1: With Redis (Recommended)

1. **Start Redis with Docker:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Start API server (Terminal 1):**
```bash
vercel dev --listen 3001
```

3. **Start React (Terminal 2):**
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001

#### Option 2: Frontend Only (no leaderboard functionality)

If you only want to see UI changes without APIs:

```bash
npm start
```

### 🏗️ Architecture

#### Frontend (React + TypeScript)
- **Framework**: React 19 with TypeScript
- **Styling**: Styled Components
- **Animations**: Framer Motion
- **Web3**: wagmi v2 + RainbowKit v2 + viem

#### Backend (Vercel Serverless Functions)
- **API Routes**: `/api/leaderboard`, `/api/join`, `/api/auth/*`
- **Database**: Redis (local) or Vercel KV (production)
- **Smart Contracts**: ZEUS and wZEUS tokens on Ethereum Mainnet

#### File Structure
```
zeus-army-website/
├── src/
│   ├── components/        # React components
│   │   ├── Leaderboard.tsx  # Leadership Registry
│   │   ├── Governance.tsx   # wZEUS wrapping/unwrapping
│   │   ├── Footer.tsx       # Footer
│   │   └── ...
│   └── styles/
│       └── GlobalStyles.ts  # Global styles
├── api/                   # Vercel Serverless Functions
│   ├── leaderboard.js    # GET endpoint
│   ├── refresh-balances.js # POST endpoint to refresh balances
│   ├── auth/
│   │   ├── twitter.js    # Initiate Twitter OAuth
│   │   └── callback/
│   │       └── twitter.js # Twitter OAuth callback
│   └── admin/
│       └── delete-wallet.js # Admin endpoint
├── public/               # Static assets
└── docker-compose.dev.yml # Redis for development
```

### 🔑 Implemented Features

#### ✅ Leadership Registry (formerly Leaderboard)
1. **Connect Wallet**: Users can connect via RainbowKit (MetaMask, Rainbow, Coinbase, etc.)
2. **Sign Message**: Message signing for authentication with accountability statement
3. **Balance Verification**: Automatically queries ZEUS + wZEUS balance
4. **Twitter OAuth**: Full OAuth 2.0 flow with Twitter
5. **Public Registry**: Displays leaders ranked by total holdings (ZEUS + wZEUS)

#### ✅ Governance Page
- Wrap ZEUS to wZEUS (for voting)
- Unwrap wZEUS back to ZEUS
- Check both balances
- Full ERC20Wrapper integration

#### ✅ UI Improvements
- Favicon from zeuscoin.vip
- "Buy ZEUS Now" link points to correct Uniswap pair
- Twitter column in leaderboard with direct links
- All dog emojis replaced with Zeus circular image
- Mobile responsive throughout

### 🧪 Local Testing

To test full functionality:

1. **Connect your wallet** in the browser (ensure MetaMask is installed)
2. **Click "Register as Leader"** in the Leadership Registry
3. **Sign the message** when prompted
4. **Authenticate with Twitter** via OAuth flow
5. **Confirm registration**

The system will:
- Verify your signature
- Query your ZEUS + wZEUS balance
- Add you to the leadership registry
- Sort by total holdings

### 📦 Deployment on Vercel

#### Environment Variables in Vercel

Configure these secrets in your Vercel project:

1. **KV Storage** (Vercel KV):
   - Create a KV Store in Vercel dashboard
   - Variables `KV_REST_API_URL` and `KV_REST_API_TOKEN` are configured automatically

2. **Twitter OAuth**:
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   TWITTER_CALLBACK_URL=https://your-domain.com/api/auth/callback/twitter
   ```

3. **Admin**:
   ```
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Optional - Custom RPC**:
   ```
   ETHEREUM_RPC_URL=your_rpc_url_here
   ```

#### Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 🐛 Troubleshooting

**Error: "Cannot connect to Redis"**
- Ensure Docker is running
- Verify Redis is active: `docker ps | grep redis`
- Restart Redis: `docker-compose -f docker-compose.dev.yml restart`

**Error: "Failed to fetch leaderboard"**
- Verify API server is running on port 3001
- Check logs: `vercel dev --debug`

**Wallet doesn't connect**
- Ensure MetaMask is installed
- Verify you're on Ethereum Mainnet
- Reload the page

**ZEUS balance doesn't appear**
- RPC may be slow, wait a few seconds
- Verify you have ZEUS in your wallet
- Check contract: `0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8`

### 🔗 Important Links

- ZEUS Token: `0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8`
- wZEUS Token: `0xA56B06AA7Bfa6cbaD8A0b5161ca052d86a5D88E9`
- Uniswap Swap: https://app.uniswap.org/swap?chain=mainnet&inputCurrency=NATIVE&outputCurrency=0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8
- Vercel Docs: https://vercel.com/docs
- Vercel KV Docs: https://vercel.com/docs/storage/vercel-kv

### 🤝 Contributing

This project is ready for deployment. Future improvements could include:

- [ ] Caching system to reduce RPC queries
- [ ] ENS names support
- [ ] Notification system
- [ ] Integration with more wallets
- [ ] Unit and integration tests

---

**Built with 💙 by the Zeus Army** 🐕⚡
