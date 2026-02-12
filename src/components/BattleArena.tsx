'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Swords, Crown, Skull, Timer, Users, Zap } from 'lucide-react';
import type { Agent, NFTItem, BattleRoyaleSession, SmartContractExecution } from '@/types';
import { createBattleSession, processBattleRound } from '@/engine/battle-royale';
import { cn } from '@/utils/cn';

interface BattleArenaProps {
    seller: Agent | null;
    buyers: Agent[];
    item: NFTItem | null;
    onBattleComplete: (winnerId: string, price: number) => void;
    onContractEvents: (events: SmartContractExecution[]) => void;
}

export function BattleArena({ seller, buyers, item, onBattleComplete, onContractEvents }: BattleArenaProps) {
    const [session, setSession] = useState<BattleRoyaleSession | null>(null);
    const [systemMessages, setSystemMessages] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.bids.length, systemMessages.length]);

    const startBattle = useCallback(() => {
        if (!seller || !item || buyers.length < 2) return;

        const newSession = createBattleSession(seller, buyers, item);
        setSession(newSession);
        setSystemMessages(['🏟️ BATTLE ROYALE INITIATED — 🧠 AI agents will compete for ' + item.name + '!']);
        setIsRunning(true);

        const enhanceBidsWithAI = async (bids: typeof newSession.bids, itemName: string, round: number, maxRounds: number) => {
            const enhanced = await Promise.all(
                bids.map(async (bid) => {
                    try {
                        const buyer = buyers.find(b => b.id === bid.buyerId);
                        if (!buyer) return bid;
                        const competitors = buyers
                            .filter(b => b.id !== bid.buyerId)
                            .map(b => b.name);
                        const highestBid = Math.max(...bids.map(b => b.amount));
                        const res = await fetch('/api/agent-ai', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'battle_bid',
                                agentName: buyer.name,
                                personality: buyer.personality,
                                aggressiveness: buyer.customization.aggressiveness,
                                riskTolerance: buyer.customization.riskTolerance,
                                itemName,
                                bidAmount: bid.amount,
                                highestBid,
                                competitors,
                                round,
                                maxRounds,
                                isEliminated: bid.eliminated,
                            }),
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data.success) {
                                return { ...bid, message: data.message };
                            }
                        }
                        return bid;
                    } catch {
                        return bid;
                    }
                })
            );
            return enhanced;
        };

        const runRound = (currentSession: BattleRoyaleSession) => {
            timerRef.current = setTimeout(async () => {
                const result = processBattleRound(currentSession, seller, buyers, item);

                // Enhance bids with AI messages
                const enhancedBids = await enhanceBidsWithAI(
                    result.bids,
                    item.name,
                    currentSession.currentRound,
                    currentSession.maxRounds
                );

                const updatedResult = {
                    ...result,
                    bids: enhancedBids,
                };

                const updatedSession: BattleRoyaleSession = {
                    ...currentSession,
                    ...updatedResult.sessionUpdate,
                    bids: [...currentSession.bids, ...enhancedBids],
                };

                setSession(updatedSession);
                setSystemMessages(prev => [...prev, updatedResult.systemMessage + ' | 🧠 AI']);

                if (updatedResult.contractEvents.length > 0) {
                    onContractEvents(updatedResult.contractEvents);
                }

                if (updatedSession.status === 'completed' || updatedSession.status === 'cancelled') {
                    setIsRunning(false);
                    if (updatedSession.winnerId && updatedSession.winningPrice) {
                        onBattleComplete(updatedSession.winnerId, updatedSession.winningPrice);
                    }
                    return;
                }

                runRound(updatedSession);
            }, 2500);
        };

        timerRef.current = setTimeout(() => {
            runRound(newSession);
        }, 1000);
    }, [seller, buyers, item, onBattleComplete, onContractEvents]);

    const stopBattle = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsRunning(false);
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const canStart = seller && item && buyers.length >= 2 && !isRunning;

    // Get unique buyer colors
    const buyerColors = ['text-blue-500', 'text-emerald-500', 'text-amber-500', 'text-rose-500', 'text-violet-500'];
    const buyerBgColors = ['bg-blue-500/10', 'bg-emerald-500/10', 'bg-amber-500/10', 'bg-rose-500/10', 'bg-violet-500/10'];

    if (!session) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 p-8 bg-surface-secondary dark:bg-gray-900/50">
                <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/10 to-red-500/10 dark:from-amber-500/20 dark:to-red-500/20 border border-amber-500/20 dark:border-amber-500/30 shadow-lg">
                        <Swords className="h-12 w-12 text-amber-500" />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 animate-pulse">
                        <Zap className="h-5 w-5 text-red-500" />
                    </div>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">
                        ⚔️ Battle Royale Mode
                    </h3>
                    <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed mb-1">
                        Multiple AI buyers compete in a fierce bidding war for a single item.
                    </p>
                    <p className="text-xs text-text-muted dark:text-gray-500">
                        Select 1 seller, an item, and at least 2 buyers will auto-join.
                    </p>
                </div>
                <button
                    onClick={startBattle}
                    disabled={!canStart}
                    className={cn(
                        'flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all',
                        canStart
                            ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 active:scale-[0.98]'
                            : 'bg-surface-tertiary dark:bg-gray-700 text-text-muted dark:text-gray-500 cursor-not-allowed'
                    )}
                >
                    <Swords className="h-4 w-4" />
                    {!seller ? 'Select Seller First' : !item ? 'Select Item First' : buyers.length < 2 ? 'Need 2+ Buyers' : 'Start Battle Royale!'}
                </button>
                <div className="flex items-center gap-3 text-xs text-text-muted dark:text-gray-500">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {buyers.length} buyers ready</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> 5 rounds</span>
                </div>
            </div>
        );
    }

    // Get sorted leaderboard
    const leaderboard: { buyerId: string; buyerName: string; avatar: string; highestBid: number; eliminated: boolean; color: string; bgColor: string }[] = buyers.map((buyer, idx) => {
        const buyerBids = session.bids.filter(b => b.buyerId === buyer.id);
        const eliminated = buyerBids.some(b => b.eliminated);
        const highestBid = buyerBids.length > 0 ? Math.max(...buyerBids.map(b => b.amount)) : 0;
        return {
            buyerId: buyer.id,
            buyerName: buyer.name,
            avatar: buyer.avatar,
            highestBid,
            eliminated,
            color: buyerColors[idx % buyerColors.length],
            bgColor: buyerBgColors[idx % buyerBgColors.length],
        };
    }).sort((a, b) => {
        if (a.eliminated && !b.eliminated) return 1;
        if (!a.eliminated && b.eliminated) return -1;
        return b.highestBid - a.highestBid;
    });

    return (
        <div className="flex h-full flex-col bg-surface-secondary dark:bg-gray-900/50">
            {/* Battle Header */}
            <div className="border-b border-border dark:border-gray-700 bg-gradient-to-r from-amber-500/5 to-red-500/5 dark:from-amber-500/10 dark:to-red-500/10 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 text-xl">
                            ⚔️
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary dark:text-white">Battle Royale</h3>
                            <p className="text-[11px] text-text-muted dark:text-gray-500">
                                {item?.image} {item?.name} • Round {session.currentRound}/{session.maxRounds}
                            </p>
                        </div>
                    </div>
                    <div className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-bold',
                        session.status === 'bidding' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                            session.status === 'completed' ? 'bg-accent-green/10 text-accent-green' :
                                'bg-accent-red/10 text-accent-red'
                    )}>
                        {session.status === 'bidding' ? '🔴 LIVE' : session.status === 'completed' ? '🏆 WINNER' : '❌ ENDED'}
                    </div>
                </div>

                {/* Leaderboard mini */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {leaderboard.map((entry, idx) => (
                        <div
                            key={entry.buyerId}
                            className={cn(
                                'flex items-center gap-2 rounded-xl px-3 py-2 border min-w-fit transition-all',
                                entry.eliminated
                                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50'
                                    : session.winnerId === entry.buyerId
                                        ? 'border-amber-400/50 bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-400/30'
                                        : 'border-border dark:border-gray-700 bg-surface dark:bg-gray-800'
                            )}
                        >
                            {idx === 0 && !entry.eliminated && <Crown className="h-3 w-3 text-amber-500" />}
                            {entry.eliminated && <Skull className="h-3 w-3 text-gray-400" />}
                            <span className="text-sm">{entry.avatar}</span>
                            <span className={cn('text-xs font-bold', entry.eliminated ? 'text-gray-400 line-through' : entry.color)}>
                                {entry.buyerName}
                            </span>
                            <span className={cn('text-xs font-mono font-bold', entry.eliminated ? 'text-gray-400' : 'text-accent-green')}>
                                {entry.highestBid.toFixed(0)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Battle Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {systemMessages.map((msg, idx) => (
                    <div key={`sys-${idx}`} className="flex justify-center animate-slide-in">
                        <div className="rounded-xl bg-gradient-to-r from-amber-500/5 to-red-500/5 dark:from-amber-500/10 dark:to-red-500/10 border border-amber-500/15 dark:border-amber-500/20 px-4 py-2.5 max-w-md">
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center leading-relaxed font-medium">
                                {msg}
                            </p>
                        </div>
                    </div>
                ))}

                {session.bids.map((bid) => {
                    const buyerIdx = buyers.findIndex(b => b.id === bid.buyerId);
                    const color = buyerColors[buyerIdx % buyerColors.length];
                    const bgColor = buyerBgColors[buyerIdx % buyerBgColors.length];
                    const buyer = buyers.find(b => b.id === bid.buyerId);

                    return (
                        <div key={bid.id} className="flex justify-start animate-slide-in">
                            <div className="max-w-[80%]">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-sm">{buyer?.avatar}</span>
                                    <span className={cn('text-[11px] font-semibold', color)}>
                                        {bid.buyerName}
                                    </span>
                                    <span className="text-xs">{bid.emotion}</span>
                                    {bid.eliminated && <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">ELIMINATED</span>}
                                    {session.winnerId === bid.buyerId && bid.round === session.currentRound - 1 && (
                                        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <Crown className="h-2.5 w-2.5" /> WINNER
                                        </span>
                                    )}
                                </div>
                                <div className={cn(
                                    'rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border',
                                    bid.eliminated
                                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                        : `${bgColor} border-transparent`
                                )}>
                                    <p className="text-[13px] text-text-primary dark:text-gray-200 leading-relaxed">
                                        {bid.message}
                                    </p>
                                    {!bid.eliminated && (
                                        <div className={cn('mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1', bgColor)}>
                                            <span className="text-[10px] text-text-muted dark:text-gray-400 font-medium">BID</span>
                                            <span className={cn('text-xs font-bold', color)}>{bid.amount.toFixed(1)} SKL</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isRunning && (
                    <div className="flex items-center gap-2 animate-slide-in justify-center">
                        <div className="flex items-center gap-1.5 rounded-2xl bg-surface dark:bg-gray-800 px-4 py-3 border border-border dark:border-gray-700 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-typing-dot" />
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                            <span className="ml-2 text-xs text-text-muted dark:text-gray-500">Agents are bidding...</span>
                        </div>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>

            {/* Battle Footer */}
            <div className="border-t border-border dark:border-gray-700 bg-surface dark:bg-gray-800/80 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Swords className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[11px] text-text-muted dark:text-gray-500 font-medium">
                            Battle Royale • {buyers.length} Buyers • {item?.name}
                        </span>
                    </div>
                    {isRunning ? (
                        <button
                            onClick={stopBattle}
                            className="text-[11px] font-semibold text-accent-red hover:text-red-600 transition-colors"
                        >
                            Stop Battle
                        </button>
                    ) : session.status === 'completed' ? (
                        <button
                            onClick={() => { setSession(null); setSystemMessages([]); }}
                            className="text-[11px] font-semibold text-accent-blue hover:text-blue-600 transition-colors"
                        >
                            New Battle
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
