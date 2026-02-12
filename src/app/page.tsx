"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Bot,
  ScrollText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Activity,
  Swords,
  Trophy,
  BarChart3,
  Brain,
} from "lucide-react";
import { Header } from "@/components/Header";
import { AgentCard } from "@/components/AgentCard";
import { NegotiationChat } from "@/components/NegotiationChat";
import { SmartContractLog } from "@/components/SmartContractLog";
import { ItemSelector } from "@/components/ItemSelector";
import { DeployPanel } from "@/components/DeployPanel";
import { DealHistory } from "@/components/DealHistory";
import { WalletPanel } from "@/components/WalletPanel";
import { BattleArena } from "@/components/BattleArena";
import { Leaderboard } from "@/components/Leaderboard";
import { AgentCustomizer } from "@/components/AgentCustomizer";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { DEFAULT_SELLERS, DEFAULT_BUYERS, createDefaultItems } from "@/data/defaults";
import {
  createNegotiationSession,
  processNegotiationRound,
} from "@/engine/negotiation";
import { useTheme } from "@/hooks/useTheme";
import type {
  Agent,
  NFTItem,
  NegotiationSession,
  ChatMessage,
  SmartContractExecution,
  MarketStats,
  AgentCustomization,
} from "@/types";
import { cn } from "@/utils/cn";
import { v4 as uuidv4 } from 'uuid';

type TabView = "agents" | "negotiate" | "contracts";
type NegotiateMode = "1v1" | "battle";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  // Agents
  const [sellers, setSellers] = useState<Agent[]>(DEFAULT_SELLERS);
  const [buyers, setBuyers] = useState<Agent[]>(DEFAULT_BUYERS);
  const [items] = useState<NFTItem[]>(() =>
    createDefaultItems(DEFAULT_SELLERS.map((s) => s.id))
  );

  // Selections
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Negotiation state
  const [activeSession, setActiveSession] =
    useState<NegotiationSession | null>(null);
  const [pastSessions, setPastSessions] = useState<NegotiationSession[]>([]);
  const [contractEvents, setContractEvents] = useState<
    SmartContractExecution[]
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [blockNumber, setBlockNumber] = useState(18_234_567);
  const [aiStatus, setAiStatus] = useState<'idle' | 'thinking' | 'active'>('idle');

  // UI state
  const [mobileTab, setMobileTab] = useState<TabView>("agents");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [negotiateMode, setNegotiateMode] = useState<NegotiateMode>("1v1");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef<NegotiationSession | null>(null);

  useEffect(() => {
    sessionRef.current = activeSession;
  }, [activeSession]);

  // Block number ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber((b) => b + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Computed stats
  const stats: MarketStats = {
    totalAgents: sellers.length + buyers.length,
    activeNegotiations: isRunning ? 1 : 0,
    completedDeals: pastSessions.filter((s) => s.status === "deal_reached")
      .length,
    totalVolume: pastSessions.reduce((sum, s) => sum + (s.finalPrice || 0), 0),
    averagePrice:
      pastSessions.length > 0
        ? pastSessions.reduce((sum, s) => sum + (s.finalPrice || 0), 0) /
        Math.max(
          1,
          pastSessions.filter((s) => s.finalPrice).length
        )
        : 0,
    marketSentiment: "neutral",
  };

  const selectedSeller =
    sellers.find((s) => s.id === selectedSellerId) || null;
  const selectedBuyer = buyers.find((b) => b.id === selectedBuyerId) || null;
  const selectedItem = items.find((i) => i.id === selectedItemId) || null;
  const allAgents = [...sellers, ...buyers];

  // Agent customization handler
  const handleCustomize = useCallback((agentId: string, customization: AgentCustomization) => {
    setSellers((prev) =>
      prev.map((s) => s.id === agentId ? { ...s, customization } : s)
    );
    setBuyers((prev) =>
      prev.map((b) => b.id === agentId ? { ...b, customization } : b)
    );
  }, []);

  // Battle Royale handlers
  const handleBattleComplete = useCallback((winnerId: string, price: number) => {
    setBuyers((prev) =>
      prev.map((b) =>
        b.id === winnerId
          ? {
            ...b,
            balance: b.balance - price,
            stats: { ...b.stats, totalDeals: b.stats.totalDeals + 1, totalVolume: b.stats.totalVolume + price },
            reputation: {
              ...b.reputation,
              score: Math.min(100, b.reputation.score + 3),
              streak: b.reputation.streak + 1,
              totalNegotiations: b.reputation.totalNegotiations + 1,
            },
          }
          : {
            ...b,
            reputation: {
              ...b.reputation,
              totalNegotiations: b.reputation.totalNegotiations + 1,
              streak: 0,
            },
          }
      )
    );
    if (selectedSellerId) {
      setSellers((prev) =>
        prev.map((s) =>
          s.id === selectedSellerId
            ? {
              ...s,
              stats: { ...s.stats, totalDeals: s.stats.totalDeals + 1, totalVolume: s.stats.totalVolume + price },
              reputation: {
                ...s.reputation,
                score: Math.min(100, s.reputation.score + 2),
                streak: s.reputation.streak + 1,
                totalNegotiations: s.reputation.totalNegotiations + 1,
              },
            }
            : s
        )
      );
    }
  }, [selectedSellerId]);

  const handleBattleContractEvents = useCallback((events: SmartContractExecution[]) => {
    setContractEvents((prev) => [...prev, ...events]);
    setBlockNumber((b) => b + events.length);
  }, []);

  // ============================
  // AI-Powered Helpers
  // ============================
  const fetchAIMessage = async (
    agent: Agent,
    item: NFTItem,
    currentOffer: number,
    opposingOffer: number,
    round: number,
    maxRounds: number,
    context: string
  ): Promise<{ message: string; emotion: string } | null> => {
    try {
      const res = await fetch('/api/agent-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'negotiate',
          agentName: agent.name,
          agentType: agent.type,
          personality: agent.personality,
          strategy: agent.strategy,
          aggressiveness: agent.customization.aggressiveness,
          patience: agent.customization.patience,
          flexibility: agent.customization.flexibility,
          riskTolerance: agent.customization.riskTolerance,
          itemName: item.name,
          itemCategory: item.category,
          itemRarity: item.rarity,
          basePrice: item.basePrice,
          currentOffer,
          opposingOffer,
          round,
          maxRounds,
          context,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? { message: data.message, emotion: data.emotion } : null;
    } catch {
      return null;
    }
  };

  const fetchAIThinking = async (
    agent: Agent,
    currentPrice: number,
    opposingPrice: number,
    basePrice: number,
    round: number,
    maxRounds: number
  ): Promise<string | null> => {
    try {
      const res = await fetch('/api/agent-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'think',
          agentName: agent.name,
          agentType: agent.type,
          personality: agent.personality,
          currentPrice,
          opposingPrice,
          basePrice,
          round,
          maxRounds,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? data.thought : null;
    } catch {
      return null;
    }
  };

  // Deploy negotiation (1v1)
  const handleDeploy = useCallback(() => {
    if (!selectedSeller || !selectedBuyer || !selectedItem) return;

    const session = createNegotiationSession(
      selectedSeller,
      selectedBuyer,
      selectedItem
    );
    setActiveSession(session);
    setContractEvents([]);
    setIsRunning(true);
    setIsPaused(false);
    setAiStatus('active');
    setMobileTab("negotiate");

    runNegotiationLoop(session, selectedSeller, selectedBuyer, selectedItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeller, selectedBuyer, selectedItem, speed]);

  // ============================
  // AI-Powered Negotiation Loop
  // ============================
  const runNegotiationLoop = (
    session: NegotiationSession,
    seller: Agent,
    buyer: Agent,
    item: NFTItem
  ) => {
    const delay = Math.max(1200, 3000 / speed);

    const step = async (currentSession: NegotiationSession) => {
      if (
        currentSession.status === "deal_reached" ||
        currentSession.status === "deal_failed"
      ) {
        setIsRunning(false);
        setIsTyping(false);
        setAiStatus('idle');
        setPastSessions((prev) => [...prev, currentSession]);

        // Update reputation
        if (currentSession.status === "deal_reached" && currentSession.finalPrice) {
          setSellers((prev) =>
            prev.map((s) =>
              s.id === seller.id
                ? {
                  ...s,
                  stats: {
                    ...s.stats,
                    totalDeals: s.stats.totalDeals + 1,
                    totalVolume: s.stats.totalVolume + currentSession.finalPrice!,
                  },
                  reputation: {
                    ...s.reputation,
                    score: Math.min(100, s.reputation.score + 2),
                    streak: s.reputation.streak + 1,
                    totalNegotiations: s.reputation.totalNegotiations + 1,
                  },
                }
                : s
            )
          );
          setBuyers((prev) =>
            prev.map((b) =>
              b.id === buyer.id
                ? {
                  ...b,
                  balance: b.balance - currentSession.finalPrice!,
                  stats: {
                    ...b.stats,
                    totalDeals: b.stats.totalDeals + 1,
                    totalVolume: b.stats.totalVolume + currentSession.finalPrice!,
                  },
                  reputation: {
                    ...b.reputation,
                    score: Math.min(100, b.reputation.score + 2),
                    streak: b.reputation.streak + 1,
                    totalNegotiations: b.reputation.totalNegotiations + 1,
                  },
                }
                : b
            )
          );
        } else {
          setSellers((prev) =>
            prev.map((s) =>
              s.id === seller.id
                ? { ...s, reputation: { ...s.reputation, streak: 0, totalNegotiations: s.reputation.totalNegotiations + 1 } }
                : s
            )
          );
          setBuyers((prev) =>
            prev.map((b) =>
              b.id === buyer.id
                ? { ...b, reputation: { ...b.reputation, streak: 0, totalNegotiations: b.reputation.totalNegotiations + 1 } }
                : b
            )
          );
        }
        return;
      }

      // 1. Show "thinking" state
      setIsTyping(true);
      setAiStatus('thinking');

      // 2. Get price calculations from the template engine
      const result = processNegotiationRound(currentSession, seller, buyer, item);

      // 3. Build context from recent messages
      const recentMessages = currentSession.messages.slice(-6)
        .filter(m => m.agentType !== 'system')
        .map(m => `${m.agentName}: ${m.message}`)
        .join('\n');

      // 4. Fetch AI thinking for seller (shows a thinking bubble)
      const sellerThinking = await fetchAIThinking(
        seller,
        currentSession.sellerAskPrice,
        currentSession.buyerBidPrice,
        item.basePrice,
        currentSession.currentRound,
        currentSession.maxRounds
      );

      if (sellerThinking) {
        const thinkingMsg: ChatMessage = {
          id: uuidv4(),
          agentId: seller.id,
          agentName: seller.name,
          agentType: 'seller',
          message: `💭 ${sellerThinking}`,
          timestamp: Date.now(),
          isThinking: true,
          emotion: 'thinking',
        };
        const withThinking: NegotiationSession = {
          ...currentSession,
          messages: [...currentSession.messages, thinkingMsg],
        };
        setActiveSession(withThinking);
        await new Promise(r => setTimeout(r, Math.min(delay * 0.4, 1200)));
      }

      // 5. Fetch real AI messages for both agents in parallel
      const [sellerAI, buyerAI] = await Promise.all([
        fetchAIMessage(
          seller, item,
          currentSession.sellerAskPrice,
          currentSession.buyerBidPrice,
          currentSession.currentRound,
          currentSession.maxRounds,
          `Previous conversation:\n${recentMessages}\n\nYou are the SELLER.`
        ),
        fetchAIMessage(
          buyer, item,
          currentSession.buyerBidPrice,
          currentSession.sellerAskPrice,
          currentSession.currentRound,
          currentSession.maxRounds,
          `Previous conversation:\n${recentMessages}\n\nYou are the BUYER.`
        ),
      ]);

      setIsTyping(false);
      setAiStatus('active');

      // 6. Override template messages with AI-generated ones where available
      const enhancedMessages = result.messages.map((msg) => {
        if (msg.agentId === seller.id && sellerAI) {
          return {
            ...msg,
            message: sellerAI.message,
            emotion: (sellerAI.emotion as ChatMessage['emotion']) || msg.emotion,
          };
        }
        if (msg.agentId === buyer.id && buyerAI) {
          return {
            ...msg,
            message: buyerAI.message,
            emotion: (buyerAI.emotion as ChatMessage['emotion']) || msg.emotion,
          };
        }
        // System messages: add AI badge
        if (msg.agentType === 'system' && !msg.message.includes('SMART CONTRACT') && !msg.message.includes('NEGOTIATION FAILED')) {
          return {
            ...msg,
            message: msg.message + ' | 🧠 Groq AI',
          };
        }
        return msg;
      });

      // Remove thinking messages and add enhanced messages
      const cleanedMessages = currentSession.messages.filter(m => !m.isThinking);

      const updatedSession: NegotiationSession = {
        ...currentSession,
        ...result.sessionUpdate,
        messages: [...cleanedMessages, ...enhancedMessages],
      };

      setActiveSession(updatedSession);

      if (result.contractEvents.length > 0) {
        setContractEvents((prev) => [...prev, ...result.contractEvents]);
        setBlockNumber((b) => b + result.contractEvents.length);
      }

      timerRef.current = setTimeout(() => {
        step(updatedSession);
      }, delay);
    };

    timerRef.current = setTimeout(() => {
      step(session);
    }, 1000);
  };

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveSession(null);
    setContractEvents([]);
    setIsRunning(false);
    setIsPaused(false);
    setIsTyping(false);
    setAiStatus('idle');
  }, []);

  const handleTogglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const handleToggleSellerDeploy = (id: string) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, deployed: !s.deployed } : s))
    );
  };

  const handleToggleBuyerDeploy = (id: string) => {
    setBuyers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, deployed: !b.deployed } : b))
    );
  };

  return (
    <div className="flex h-screen flex-col bg-surface-secondary dark:bg-gray-900 text-text-primary dark:text-gray-200 font-sans overflow-hidden transition-colors duration-300">
      <Header
        stats={stats}
        blockNumber={blockNumber}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-b border-border dark:border-gray-700 bg-surface dark:bg-gray-800">
        {[
          {
            id: "agents" as TabView,
            label: "Agents",
            icon: <Bot className="h-4 w-4" />,
          },
          {
            id: "negotiate" as TabView,
            label: "Negotiate",
            icon: <Sparkles className="h-4 w-4" />,
          },
          {
            id: "contracts" as TabView,
            label: "Events",
            icon: <ScrollText className="h-4 w-4" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all border-b-2",
              mobileTab === tab.id
                ? "text-accent-blue border-accent-blue"
                : "text-text-muted dark:text-gray-500 border-transparent hover:text-text-secondary"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r border-border dark:border-gray-700 bg-surface dark:bg-gray-800/50 transition-all duration-300 overflow-hidden",
            sidebarOpen ? "w-80 lg:w-96" : "w-0"
          )}
        >
          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Wallet Panel */}
              <WalletPanel />

              {/* AI Status Indicator */}
              <div className={cn(
                "flex items-center gap-2.5 rounded-xl px-4 py-3 border transition-all",
                aiStatus === 'thinking'
                  ? "bg-purple-500/10 border-purple-500/30 dark:bg-purple-500/15"
                  : aiStatus === 'active'
                    ? "bg-accent-green/10 border-accent-green/30"
                    : "bg-surface-secondary dark:bg-gray-700 border-border dark:border-gray-600"
              )}>
                <Brain className={cn(
                  "h-4 w-4",
                  aiStatus === 'thinking' ? "text-purple-500 animate-pulse" :
                    aiStatus === 'active' ? "text-accent-green" : "text-text-muted dark:text-gray-500"
                )} />
                <div>
                  <p className="text-[11px] font-bold text-text-primary dark:text-white">
                    🧠 Groq AI Brain
                  </p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">
                    {aiStatus === 'thinking' ? 'Agents are reasoning...' :
                      aiStatus === 'active' ? 'Llama 3.3 70B • Active' : 'Llama 3.3 70B • Ready'}
                  </p>
                </div>
                <div className={cn(
                  "ml-auto h-2 w-2 rounded-full",
                  aiStatus === 'thinking' ? "bg-purple-500 animate-pulse" :
                    aiStatus === 'active' ? "bg-accent-green animate-pulse" : "bg-gray-400"
                )} />
              </div>

              {/* Mode Selector */}
              <div className="flex rounded-xl bg-surface-secondary dark:bg-gray-700 p-1 gap-1">
                <button
                  onClick={() => setNegotiateMode("1v1")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
                    negotiateMode === "1v1"
                      ? "bg-accent-blue text-white shadow-sm"
                      : "text-text-secondary dark:text-gray-400 hover:text-text-primary"
                  )}
                >
                  <Sparkles className="h-3 w-3" /> 1v1 Negotiate
                </button>
                <button
                  onClick={() => setNegotiateMode("battle")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
                    negotiateMode === "battle"
                      ? "bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm"
                      : "text-text-secondary dark:text-gray-400 hover:text-text-primary"
                  )}
                >
                  <Swords className="h-3 w-3" /> Battle Royale
                </button>
              </div>

              {/* Deploy Panel (1v1 mode only) */}
              {negotiateMode === "1v1" && (
                <DeployPanel
                  selectedSeller={selectedSellerId}
                  selectedBuyer={selectedBuyerId}
                  selectedItem={selectedItemId}
                  isRunning={isRunning}
                  isPaused={isPaused}
                  speed={speed}
                  onDeploy={handleDeploy}
                  onReset={handleReset}
                  onTogglePause={handleTogglePause}
                  onSpeedChange={setSpeed}
                />
              )}

              {/* Seller Agents */}
              <div>
                <h2 className="text-xs font-semibold text-seller uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-seller" />
                  Seller Agents
                </h2>
                <div className="space-y-2.5">
                  {sellers.map((agent) => (
                    <div key={agent.id}>
                      <AgentCard
                        agent={agent}
                        isSelected={agent.id === selectedSellerId}
                        isActive={
                          isRunning && agent.id === activeSession?.sellerId
                        }
                        onSelect={() =>
                          setSelectedSellerId(
                            agent.id === selectedSellerId ? null : agent.id
                          )
                        }
                        onToggleDeploy={() =>
                          handleToggleSellerDeploy(agent.id)
                        }
                      />
                      <AgentCustomizer agent={agent} onUpdate={handleCustomize} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Agents */}
              <div>
                <h2 className="text-xs font-semibold text-buyer uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-buyer" />
                  Buyer Agents
                </h2>
                <div className="space-y-2.5">
                  {buyers.map((agent) => (
                    <div key={agent.id}>
                      <AgentCard
                        agent={agent}
                        isSelected={agent.id === selectedBuyerId}
                        isActive={
                          isRunning && agent.id === activeSession?.buyerId
                        }
                        onSelect={() =>
                          setSelectedBuyerId(
                            agent.id === selectedBuyerId ? null : agent.id
                          )
                        }
                        onToggleDeploy={() =>
                          handleToggleBuyerDeploy(agent.id)
                        }
                      />
                      <AgentCustomizer agent={agent} onUpdate={handleCustomize} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Item Selector */}
              <ItemSelector
                items={items}
                selectedId={selectedItemId}
                onSelect={(item) =>
                  setSelectedItemId(
                    item.id === selectedItemId ? null : item.id
                  )
                }
              />

              {/* Leaderboard */}
              <Leaderboard agents={allAgents} />

              {/* Analytics Dashboard */}
              <AnalyticsDashboard sessions={pastSessions} agents={allAgents} />

              {/* Deal History */}
              <div>
                <h2 className="text-xs font-semibold text-text-primary dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-orange/10">
                    <Activity className="h-3.5 w-3.5 text-accent-orange" />
                  </div>
                  Deal History
                </h2>
                <DealHistory
                  sessions={pastSessions}
                  agents={allAgents}
                  items={items}
                />
              </div>
            </div>
          )}
        </aside>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center h-8 w-5 rounded-r-lg bg-surface dark:bg-gray-800 border border-l-0 border-border dark:border-gray-700 hover:bg-surface-tertiary dark:hover:bg-gray-700 transition-all shadow-sm",
            sidebarOpen ? "left-80 lg:left-96" : "left-0"
          )}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3 text-text-muted" />
          ) : (
            <ChevronRight className="h-3 w-3 text-text-muted" />
          )}
        </button>

        {/* ===== MOBILE CONTENT ===== */}
        <div className="md:hidden flex-1 overflow-y-auto">
          {mobileTab === "agents" && (
            <div className="p-4 space-y-4">
              <WalletPanel />

              {/* Mobile AI Status */}
              <div className={cn(
                "flex items-center gap-2.5 rounded-xl px-4 py-3 border transition-all",
                aiStatus === 'thinking'
                  ? "bg-purple-500/10 border-purple-500/30"
                  : aiStatus === 'active'
                    ? "bg-accent-green/10 border-accent-green/30"
                    : "bg-surface-secondary dark:bg-gray-700 border-border"
              )}>
                <Brain className={cn(
                  "h-4 w-4",
                  aiStatus === 'thinking' ? "text-purple-500 animate-pulse" :
                    aiStatus === 'active' ? "text-accent-green" : "text-text-muted"
                )} />
                <span className="text-[11px] font-bold text-text-primary dark:text-white">
                  🧠 Groq AI • {aiStatus === 'thinking' ? 'Thinking...' : aiStatus === 'active' ? 'Active' : 'Ready'}
                </span>
              </div>

              {/* Mobile Mode Selector */}
              <div className="flex rounded-xl bg-surface-secondary dark:bg-gray-700 p-1 gap-1">
                <button
                  onClick={() => setNegotiateMode("1v1")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
                    negotiateMode === "1v1"
                      ? "bg-accent-blue text-white shadow-sm"
                      : "text-text-secondary dark:text-gray-400"
                  )}
                >
                  <Sparkles className="h-3 w-3" /> 1v1
                </button>
                <button
                  onClick={() => setNegotiateMode("battle")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
                    negotiateMode === "battle"
                      ? "bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm"
                      : "text-text-secondary dark:text-gray-400"
                  )}
                >
                  <Swords className="h-3 w-3" /> Battle
                </button>
              </div>

              {negotiateMode === "1v1" && (
                <DeployPanel
                  selectedSeller={selectedSellerId}
                  selectedBuyer={selectedBuyerId}
                  selectedItem={selectedItemId}
                  isRunning={isRunning}
                  isPaused={isPaused}
                  speed={speed}
                  onDeploy={handleDeploy}
                  onReset={handleReset}
                  onTogglePause={handleTogglePause}
                  onSpeedChange={setSpeed}
                />
              )}
              <h2 className="text-xs font-semibold text-seller uppercase tracking-wider flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-seller" />
                Seller Agents
              </h2>
              {sellers.map((agent) => (
                <div key={agent.id}>
                  <AgentCard
                    agent={agent}
                    isSelected={agent.id === selectedSellerId}
                    isActive={
                      isRunning && agent.id === activeSession?.sellerId
                    }
                    onSelect={() =>
                      setSelectedSellerId(
                        agent.id === selectedSellerId ? null : agent.id
                      )
                    }
                    onToggleDeploy={() => handleToggleSellerDeploy(agent.id)}
                  />
                  <AgentCustomizer agent={agent} onUpdate={handleCustomize} />
                </div>
              ))}
              <h2 className="text-xs font-semibold text-buyer uppercase tracking-wider flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-buyer" />
                Buyer Agents
              </h2>
              {buyers.map((agent) => (
                <div key={agent.id}>
                  <AgentCard
                    agent={agent}
                    isSelected={agent.id === selectedBuyerId}
                    isActive={
                      isRunning && agent.id === activeSession?.buyerId
                    }
                    onSelect={() =>
                      setSelectedBuyerId(
                        agent.id === selectedBuyerId ? null : agent.id
                      )
                    }
                    onToggleDeploy={() => handleToggleBuyerDeploy(agent.id)}
                  />
                  <AgentCustomizer agent={agent} onUpdate={handleCustomize} />
                </div>
              ))}
              <ItemSelector
                items={items}
                selectedId={selectedItemId}
                onSelect={(item) =>
                  setSelectedItemId(
                    item.id === selectedItemId ? null : item.id
                  )
                }
              />
              <Leaderboard agents={allAgents} />
              <AnalyticsDashboard sessions={pastSessions} agents={allAgents} />
            </div>
          )}
          {mobileTab === "negotiate" && (
            <div className="h-full">
              {negotiateMode === "battle" ? (
                <BattleArena
                  seller={selectedSeller}
                  buyers={buyers}
                  item={selectedItem}
                  onBattleComplete={handleBattleComplete}
                  onContractEvents={handleBattleContractEvents}
                />
              ) : (
                <NegotiationChat
                  session={activeSession}
                  seller={selectedSeller}
                  buyer={selectedBuyer}
                  item={selectedItem}
                  isTyping={isTyping}
                />
              )}
            </div>
          )}
          {mobileTab === "contracts" && (
            <div className="h-full">
              <SmartContractLog events={contractEvents} />
              <div className="p-4">
                <h2 className="text-xs font-semibold text-text-primary dark:text-white uppercase tracking-wider mb-3">
                  Deal History
                </h2>
                <DealHistory
                  sessions={pastSessions}
                  agents={allAgents}
                  items={items}
                />
              </div>
            </div>
          )}
        </div>

        {/* ===== CENTER - Negotiation Chat or Battle Arena ===== */}
        <main className="hidden md:flex flex-1 flex-col overflow-hidden">
          {negotiateMode === "battle" ? (
            <BattleArena
              seller={selectedSeller}
              buyers={buyers}
              item={selectedItem}
              onBattleComplete={handleBattleComplete}
              onContractEvents={handleBattleContractEvents}
            />
          ) : (
            <NegotiationChat
              session={activeSession}
              seller={selectedSeller}
              buyer={selectedBuyer}
              item={selectedItem}
              isTyping={isTyping}
            />
          )}
        </main>

        {/* ===== RIGHT SIDEBAR - Smart Contract Log ===== */}
        <aside className="hidden lg:flex flex-col w-80 border-l border-border dark:border-gray-700 bg-surface dark:bg-gray-800/50">
          <div className="border-b border-border dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-text-primary dark:text-white flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-green/10">
                <ScrollText className="h-3.5 w-3.5 text-accent-green" />
              </div>
              Contract Events
            </h2>
            <p className="text-[11px] text-text-muted dark:text-gray-500 mt-1 ml-9">
              Auto-executed on deal — no approval needed
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SmartContractLog events={contractEvents} />
          </div>
          <div className="border-t border-border dark:border-gray-700 p-4">
            <h2 className="text-xs font-semibold text-text-primary dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-accent-orange" />
              Deal History
            </h2>
            <div className="max-h-48 overflow-y-auto">
              <DealHistory
                sessions={pastSessions}
                agents={allAgents}
                items={items}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-border dark:border-gray-700 bg-surface dark:bg-gray-800/80 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[11px] text-text-muted dark:text-gray-500 font-medium">
              AGENTS.OS v3.0 — AI-Powered Agent Negotiation • Groq LLM Engine
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-text-muted dark:text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <Brain className="h-3 w-3 text-purple-500" />
              Groq AI
            </span>
            <span>SKALE Nebula</span>
            <span className="text-accent-green">Gasless</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
