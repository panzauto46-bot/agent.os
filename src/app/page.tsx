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
} from "lucide-react";
import { Header } from "@/components/Header";
import { AgentCard } from "@/components/AgentCard";
import { NegotiationChat } from "@/components/NegotiationChat";
import { SmartContractLog } from "@/components/SmartContractLog";
import { ItemSelector } from "@/components/ItemSelector";
import { DeployPanel } from "@/components/DeployPanel";
import { DealHistory } from "@/components/DealHistory";
import { WalletPanel } from "@/components/WalletPanel";
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
  SmartContractExecution,
  MarketStats,
} from "@/types";
import { cn } from "@/utils/cn";

type TabView = "agents" | "negotiate" | "contracts";

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

  // UI state
  const [mobileTab, setMobileTab] = useState<TabView>("agents");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Deploy negotiation
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
    setMobileTab("negotiate");

    runNegotiationLoop(session, selectedSeller, selectedBuyer, selectedItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeller, selectedBuyer, selectedItem, speed]);

  const runNegotiationLoop = (
    session: NegotiationSession,
    seller: Agent,
    buyer: Agent,
    item: NFTItem
  ) => {
    const delay = Math.max(800, 2500 / speed);

    const step = (currentSession: NegotiationSession) => {
      if (
        currentSession.status === "deal_reached" ||
        currentSession.status === "deal_failed"
      ) {
        setIsRunning(false);
        setIsTyping(false);
        setPastSessions((prev) => [...prev, currentSession]);

        if (
          currentSession.status === "deal_reached" &&
          currentSession.finalPrice
        ) {
          setSellers((prev) =>
            prev.map((s) =>
              s.id === seller.id
                ? {
                    ...s,
                    stats: {
                      ...s.stats,
                      totalDeals: s.stats.totalDeals + 1,
                      totalVolume:
                        s.stats.totalVolume + currentSession.finalPrice!,
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
                      totalVolume:
                        b.stats.totalVolume + currentSession.finalPrice!,
                    },
                  }
                : b
            )
          );
        }
        return;
      }

      setIsTyping(true);

      timerRef.current = setTimeout(() => {
        setIsTyping(false);

        const result = processNegotiationRound(
          currentSession,
          seller,
          buyer,
          item
        );
        const updatedSession: NegotiationSession = {
          ...currentSession,
          ...result.sessionUpdate,
          messages: [...currentSession.messages, ...result.messages],
        };

        setActiveSession(updatedSession);

        if (result.contractEvents.length > 0) {
          setContractEvents((prev) => [...prev, ...result.contractEvents]);
          setBlockNumber((b) => b + result.contractEvents.length);
        }

        timerRef.current = setTimeout(() => {
          step(updatedSession);
        }, delay);
      }, delay * 0.7);
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

              {/* Deploy Panel */}
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

              {/* Seller Agents */}
              <div>
                <h2 className="text-xs font-semibold text-seller uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-seller" />
                  Seller Agents
                </h2>
                <div className="space-y-2.5">
                  {sellers.map((agent) => (
                    <AgentCard
                      key={agent.id}
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
                    <AgentCard
                      key={agent.id}
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
              <h2 className="text-xs font-semibold text-seller uppercase tracking-wider flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-seller" />
                Seller Agents
              </h2>
              {sellers.map((agent) => (
                <AgentCard
                  key={agent.id}
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
              ))}
              <h2 className="text-xs font-semibold text-buyer uppercase tracking-wider flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-buyer" />
                Buyer Agents
              </h2>
              {buyers.map((agent) => (
                <AgentCard
                  key={agent.id}
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
            </div>
          )}
          {mobileTab === "negotiate" && (
            <div className="h-full">
              <NegotiationChat
                session={activeSession}
                seller={selectedSeller}
                buyer={selectedBuyer}
                item={selectedItem}
                isTyping={isTyping}
              />
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

        {/* ===== CENTER - Negotiation Chat ===== */}
        <main className="hidden md:flex flex-1 flex-col overflow-hidden">
          <NegotiationChat
            session={activeSession}
            seller={selectedSeller}
            buyer={selectedBuyer}
            item={selectedItem}
            isTyping={isTyping}
          />
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
              AGENTS.OS v1.0 — Agent-to-Agent Negotiation Protocol
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-text-muted dark:text-gray-500 font-medium">
            <span>SKALE Nebula</span>
            <span className="text-accent-green">Gasless</span>
            <span>Autonomous Commerce</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
