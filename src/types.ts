export interface AgentReputation {
  score: number;          // 0-100
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  streak: number;         // consecutive wins
  bestDeal: number;       // best deal price
  fastestDeal: number;    // rounds to close
  totalNegotiations: number;
}

export interface AgentCustomization {
  aggressiveness: number;   // 1-10
  patience: number;         // 1-10
  flexibility: number;      // 1-10
  riskTolerance: number;    // 1-10
}

export interface Agent {
  id: string;
  name: string;
  type: 'seller' | 'buyer';
  avatar: string;
  personality: string;
  strategy: string;
  balance: number;
  deployed: boolean;
  stats: {
    totalDeals: number;
    totalVolume: number;
    winRate: number;
    avgProfit: number;
  };
  reputation: AgentReputation;
  customization: AgentCustomization;
}

export interface NFTItem {
  id: string;
  name: string;
  image: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  basePrice: number;
  currentPrice: number;
  ownerId: string;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentType: 'seller' | 'buyer' | 'system';
  message: string;
  timestamp: number;
  offerAmount?: number;
  isThinking?: boolean;
  emotion?: 'neutral' | 'happy' | 'angry' | 'thinking' | 'excited' | 'disappointed';
}

export interface NegotiationSession {
  id: string;
  sellerId: string;
  buyerId: string;
  itemId: string;
  status: 'waiting' | 'negotiating' | 'deal_reached' | 'deal_failed' | 'completed';
  messages: ChatMessage[];
  currentRound: number;
  maxRounds: number;
  sellerAskPrice: number;
  buyerBidPrice: number;
  finalPrice?: number;
  startedAt: number;
  completedAt?: number;
}

// Multi-Agent Battle Royale
export interface BattleRoyaleSession {
  id: string;
  sellerId: string;
  buyerIds: string[];
  itemId: string;
  status: 'waiting' | 'bidding' | 'completed' | 'cancelled';
  bids: BattleBid[];
  currentRound: number;
  maxRounds: number;
  winnerId?: string;
  winningPrice?: number;
  startedAt: number;
  completedAt?: number;
}

export interface BattleBid {
  id: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  round: number;
  timestamp: number;
  message: string;
  emotion: string;
  eliminated: boolean;
}

export interface SmartContractExecution {
  id: string;
  sessionId: string;
  type: 'escrow_created' | 'payment_sent' | 'item_transferred' | 'deal_completed' | 'deal_cancelled';
  fromAgent: string;
  toAgent: string;
  amount: number;
  itemId: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber: number;
  gasUsed: number;
}

export interface MarketStats {
  totalAgents: number;
  activeNegotiations: number;
  completedDeals: number;
  totalVolume: number;
  averagePrice: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}

// Analytics
export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  itemName: string;
  dealType: 'success' | 'failed';
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  agentType: 'seller' | 'buyer';
  avatar: string;
  reputation: AgentReputation;
  recentDeals: number[];
  trend: 'up' | 'down' | 'stable';
}
