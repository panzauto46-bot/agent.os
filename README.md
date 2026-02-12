<p align="center">
  <img src="https://img.shields.io/badge/AGENTS.OS-v1.0-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik00LjkgMTkuMUMyIDE3LjIgMiAxNC44IDIgMTJzMC01LjIgMi45LTcuMSIvPjxwYXRoIGQ9Ik0xOS4xIDQuOUMyMSA2LjggMjEgOS4yIDIxIDEyczAgNS4yLTEuOSA3LjEiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIi8+PC9zdmc+" alt="AGENTS.OS" />
</p>

<h1 align="center">AGENTS.OS</h1>
<h3 align="center">The Operating System for Autonomous Commerce</h3>

<p align="center">
  <strong>AI agents that negotiate, trade, and execute deals on-chain — autonomously.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SKALE_Network-00C2FF?style=flat-square&logo=ethereum&logoColor=white" alt="SKALE" />
  <img src="https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/wagmi_v2-35324a?style=flat-square" alt="wagmi" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Zero_Gas-10B981?style=flat-square" alt="Gasless" />
</p>

<p align="center">
  <a href="#the-problem">Problem</a> &bull;
  <a href="#the-solution">Solution</a> &bull;
  <a href="#how-it-works">How It Works</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#smart-contract">Smart Contract</a> &bull;
  <a href="#demo">Demo</a> &bull;
  <a href="#getting-started">Get Started</a>
</p>

---

## The Problem

Today's NFT and digital asset marketplaces are **fundamentally broken**:

| Pain Point | Impact |
|---|---|
| Manual negotiation is slow and exhausting | Users spend hours haggling over prices |
| Fixed-price listings leave money on the table | Sellers underprice, buyers overpay |
| No intelligent price discovery | Market inefficiency everywhere |
| Gas fees kill micro-transactions | Small trades become uneconomical |
| Bots snipe without negotiating | Zero-sum, no value creation |

**What if your AI agent could negotiate the best deal for you — 24/7, autonomously, with zero gas fees?**

---

## The Solution

**AGENTS.OS** is an autonomous commerce protocol where AI agents negotiate, agree on prices, and execute trades on-chain — all without human intervention.

```
 User                    AGENTS.OS                      SKALE
  |                         |                             |
  |-- Deploy Agent -------->|                             |
  |                         |-- Agent A: "I want 520 SKL" |
  |                         |-- Agent B: "I offer 180 SKL"|
  |                         |-- [8 rounds of AI negotiation]
  |                         |-- DEAL at 385 SKL! -------->|
  |                         |                  Escrow ---->|
  |                         |                  Payment --->|
  |                         |                  Transfer -->|
  |<-- Deal Complete! ------|<-- Confirmed (0 gas) -------|
```

### Key Innovation

> **Autonomous Agent-to-Agent Negotiation Protocol (AANP)**
>
> Instead of fixed listings or blind auctions, AGENTS.OS deploys AI agents with distinct personalities and strategies that negotiate in real-time. Each agent uses a dynamic concession algorithm that adapts per round — creating true price discovery.

---

## How It Works

### 1. Choose Your Champions
Select from 6 autonomous AI agents, each with unique trading personalities:

| Agent | Type | Personality | Strategy |
|---|---|---|---|
| VIPER.sell | Seller | Aggressive, holds firm | High price, drops when desperate |
| SILK.trader | Seller | Smooth talker, flexible | Charm, slow concessions, always closes |
| IRON.vault | Seller | Patient, rarely concedes | Hold the line, only worthy buyers |
| SHARK.buy | Buyer | Ruthless bargainer | Lowballs aggressively |
| SNIPE.bot | Buyer | Data-driven, precise | Fair market value, walks if overpriced |
| WHALE.cap | Buyer | Big spender, quality-focused | Moderate negotiation, collects rare items |

### 2. Deploy the Negotiation
Pick a seller, buyer, and target NFT item. Hit **Deploy** — agents start negotiating autonomously through up to 8 rounds of strategic offers and counter-offers.

### 3. Watch the Magic
Real-time negotiation chat with:
- Dynamic price spread visualization
- Emotion indicators per agent
- Live offer/counter-offer tracking
- Round-by-round progression

### 4. Auto-Execute on Deal
When agents agree on a price, the smart contract auto-executes:
```
Escrow Created  ->  Payment Sent  ->  NFT Transferred  ->  Deal Finalized
     (0 gas)           (0 gas)            (0 gas)              (0 gas)
```
**Zero gas fees.** Powered by SKALE Network.

---

## Architecture

```
+----------------------------------------------------------+
|                    AGENTS.OS Frontend                      |
|                    Next.js 14 + React 18                   |
+------------------+-------------------+-------------------+
|   Agent Panel    |  Negotiation UI   |  Contract Events  |
|   - 6 AI Agents  |  - Real-time Chat |  - Escrow Log     |
|   - Wallet Panel |  - Price Spread   |  - Tx History     |
|   - Item Selector|  - Emotion States |  - Block Tracker  |
+------------------+-------------------+-------------------+
                          |
                 +--------+--------+
                 |   API Routes    |
                 | /api/negotiate  |  <-- AI Negotiation Engine
                 | /api/market     |  <-- Market Stats
                 +--------+--------+
                          |
              +-----------+-----------+
              |    Web3 Layer         |
              |  wagmi v2 + viem     |
              |  RainbowKit          |
              +-----------+-----------+
                          |
              +-----------+-----------+
              |   SKALE Network       |
              |   Nebula Testnet      |
              |   AgentMarketplace.sol|
              |   (Gasless L2)        |
              +-----------------------+
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14, React 18, TypeScript | SSR + API Routes in one framework |
| Styling | Tailwind CSS 3, Dark/Light Mode | Rapid UI development, modern look |
| Blockchain | SKALE Nebula (L2) | **Zero gas fees** — perfect for agent micro-transactions |
| Smart Contract | Solidity 0.8.19 | Battle-tested, industry standard |
| Web3 | wagmi v2 + viem | Type-safe, modern React hooks for Ethereum |
| Wallet | RainbowKit + MetaMask | Best-in-class wallet UX |
| AI Engine | Custom negotiation algorithm | Dynamic concession, personality-driven |
| Deploy | Vercel | Zero-config, instant global CDN |

---

## Smart Contract

**`AgentMarketplace.sol`** — The on-chain backbone of autonomous commerce.

> **Deployed on SKALE Nebula Testnet:** [`0x49Ee39851956df07E5d3B430dC91e5A00B7E6059`](https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com/address/0x49Ee39851956df07E5d3B430dC91e5A00B7E6059)

```solidity
// Core Functions
function listItem(string itemName, uint256 price) -> uint256 listingId
function executeDeal(uint256 listingId, uint256 agreedPrice) payable -> uint256 dealId
function depositFunds() payable
function withdrawFunds(uint256 amount)

// Events
event ItemListed(uint256 listingId, address seller, string itemName, uint256 price)
event DealCompleted(uint256 dealId, address seller, address buyer, uint256 price)
event FundsDeposited(address agent, uint256 amount)
```

**Key Features:**
- Escrow-based deal execution
- Auto-refund on overpayment
- On-chain deal history
- Agent balance tracking
- View functions for market stats

---

## AI Negotiation Engine

The core innovation — a multi-round negotiation algorithm that simulates human-like bargaining:

```
Round 0: Opening offers (seller asks high, buyer bids low)
Round 1-7: Strategic concessions
  - Seller: Drops 3-9% per round (pressure increases)
  - Buyer: Raises 4-12% per round (urgency increases)
  - Emotions adapt: angry -> thinking -> excited
Round 8: Final round — deal or walk away

Deal Trigger: When spread < 8% of base price
  -> Auto-execute smart contract
  -> Escrow -> Payment -> Transfer -> Complete
```

**API Endpoint:** `POST /api/negotiate`

```json
{
  "sellerName": "VIPER.sell",
  "buyerName": "SHARK.buy",
  "itemName": "Void Reaper Blade",
  "currentAskPrice": 520,
  "currentBidPrice": 180,
  "round": 3,
  "maxRounds": 8
}
```

---

## Demo

### Marketplace UI
Three-panel layout: Agent selection, real-time negotiation chat, and blockchain events.

### Features at a Glance
- **6 AI agents** with distinct trading personalities
- **8 NFT items** across 5 rarity tiers (Common to Legendary)
- **Real-time chat** with emotion indicators and offer tracking
- **Smart contract events** with tx hash, block number, gas info
- **Dark/Light mode** with smooth transitions
- **Mobile responsive** with tab-based navigation
- **Wallet integration** (MetaMask via RainbowKit)
- **Speed control** (1x, 2x, 3x, 5x) for negotiation simulation
- **Deal history** with success/failure tracking

---

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/panzauto46-bot/agent.os.git
cd agent.os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start deploying autonomous agents.

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID | For wallet connect |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address on SKALE | After deployment |
| `NEXT_PUBLIC_SKALE_RPC` | SKALE Nebula Testnet RPC URL | Pre-configured |

### Deploy Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `AgentMarketplace.sol` from `contracts/` folder
3. Compile with Solidity 0.8.19
4. Connect MetaMask to SKALE Nebula Testnet
5. Deploy and copy contract address
6. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Set environment variables
# 4. Deploy!
```

---

## Project Structure

```
agent.os/
├── contracts/
│   └── AgentMarketplace.sol      # Solidity smart contract
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout + Web3Provider
│   │   ├── page.tsx              # Main marketplace page
│   │   ├── globals.css           # Global styles
│   │   └── api/
│   │       ├── negotiate/        # AI negotiation engine
│   │       └── market/           # Market stats API
│   ├── components/               # React UI components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Web3 config & providers
│   ├── engine/                   # Negotiation algorithm
│   ├── data/                     # Default agents & items
│   ├── types.ts                  # TypeScript interfaces
│   └── utils/                    # Utilities
├── package.json
├── next.config.js
├── tailwind.config.ts
├── vercel.json
└── PROGRESS.md
```

---

## Why SKALE Network?

| Feature | Benefit for AGENTS.OS |
|---|---|
| **Zero Gas Fees** | Agents can negotiate in micro-rounds without cost |
| **EVM Compatible** | Standard Solidity, standard tools |
| **Fast Finality** | Deals confirm in seconds |
| **High Throughput** | Supports thousands of concurrent negotiations |
| **Decentralized** | No single point of failure |

SKALE's gasless architecture is **essential** for autonomous agent commerce — agents can exchange hundreds of messages and execute deals without worrying about transaction costs.

---

## What Makes This Different

| Traditional Marketplace | AGENTS.OS |
|---|---|
| Manual negotiation | Autonomous AI agents |
| Fixed prices | Dynamic price discovery |
| Human-dependent | 24/7 operation |
| Gas fees on every action | Zero gas (SKALE) |
| Simple buy/sell | Multi-round strategic negotiation |
| No personality | 6 distinct agent personalities |
| Passive listings | Active deal-seeking agents |

---

## Future Roadmap

- [ ] **Multi-agent negotiations** — Multiple buyers competing for one item
- [ ] **Agent training** — Users customize agent strategies with ML
- [ ] **Cross-chain bridge** — Trade across SKALE, Ethereum, Polygon
- [ ] **Agent reputation system** — On-chain agent performance scores
- [ ] **DAO governance** — Community votes on marketplace parameters
- [ ] **Mobile app** — Native iOS/Android agent management

---

## Built For

This project was built for the **SKALE Network Hackathon** — demonstrating the power of gasless transactions for autonomous AI agent commerce.

---

<p align="center">
  <strong>AGENTS.OS</strong> — Where AI agents do the trading, SKALE does the settling.
</p>

<p align="center">
  <sub>Built with Next.js, Solidity, wagmi, and a lot of caffeine.</sub>
</p>
