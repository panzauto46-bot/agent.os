'use client';

import { Trophy, Star, Flame, TrendingUp, Award, Crown, Shield, Zap } from 'lucide-react';
import type { Agent } from '@/types';
import { cn } from '@/utils/cn';

interface LeaderboardProps {
    agents: Agent[];
}

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; glow: string }> = {
    Bronze: { color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-500/15', icon: <Shield className="h-3 w-3" />, glow: '' },
    Silver: { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/15', icon: <Shield className="h-3 w-3" />, glow: '' },
    Gold: { color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/15', icon: <Award className="h-3 w-3" />, glow: 'ring-1 ring-yellow-300/30' },
    Platinum: { color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/15', icon: <Star className="h-3 w-3" />, glow: 'ring-1 ring-cyan-300/30' },
    Diamond: { color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/15', icon: <Crown className="h-3 w-3" />, glow: 'ring-2 ring-violet-400/30' },
};

export function Leaderboard({ agents }: LeaderboardProps) {
    const sorted = [...agents].sort((a, b) => b.reputation.score - a.reputation.score);

    return (
        <div className="rounded-2xl border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border dark:border-gray-700 bg-gradient-to-r from-violet-500/5 to-amber-500/5 dark:from-violet-500/10 dark:to-amber-500/10">
                <h3 className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
                        <Trophy className="h-3.5 w-3.5 text-violet-500" />
                    </div>
                    Agent Leaderboard
                    <span className="ml-auto text-[10px] text-text-muted dark:text-gray-500 font-medium bg-surface-secondary dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {agents.length} Agents
                    </span>
                </h3>
            </div>

            {/* Agent List */}
            <div className="divide-y divide-border dark:divide-gray-700/50">
                {sorted.map((agent, idx) => {
                    const tier = TIER_CONFIG[agent.reputation.tier] || TIER_CONFIG.Bronze;
                    const isTop3 = idx < 3;
                    const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

                    return (
                        <div
                            key={agent.id}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-secondary dark:hover:bg-gray-700/30',
                                isTop3 && 'bg-surface-secondary/50 dark:bg-gray-700/20'
                            )}
                        >
                            {/* Rank */}
                            <div className="flex items-center justify-center w-8 flex-shrink-0">
                                {isTop3 ? (
                                    <span className="text-lg">{rankEmoji}</span>
                                ) : (
                                    <span className="text-xs font-bold text-text-muted dark:text-gray-500">{rankEmoji}</span>
                                )}
                            </div>

                            {/* Avatar + Name */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-xl text-lg',
                                    agent.type === 'seller'
                                        ? 'bg-orange-50 dark:bg-orange-500/10'
                                        : 'bg-blue-50 dark:bg-blue-500/10'
                                )}>
                                    {agent.avatar}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-text-primary dark:text-white truncate">{agent.name}</span>
                                        <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md', tier.bg, tier.color, tier.glow)}>
                                            {tier.icon}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={cn(
                                            'text-[10px] font-medium',
                                            agent.type === 'seller' ? 'text-seller' : 'text-buyer'
                                        )}>{agent.type === 'seller' ? 'Seller' : 'Buyer'}</span>
                                        {agent.reputation.streak > 3 && (
                                            <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-bold">
                                                <Flame className="h-2.5 w-2.5" /> {agent.reputation.streak}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex flex-col items-end flex-shrink-0">
                                <div className="flex items-center gap-1">
                                    <span className={cn('text-sm font-black', tier.color)}>{agent.reputation.score}</span>
                                    <TrendingUp className="h-3 w-3 text-accent-green" />
                                </div>
                                <span className="text-[9px] text-text-muted dark:text-gray-500 font-medium">
                                    {agent.stats.totalDeals} deals
                                </span>
                            </div>

                            {/* Score bar */}
                            <div className="hidden sm:block w-16 flex-shrink-0">
                                <div className="h-1.5 rounded-full bg-surface-tertiary dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all duration-1000',
                                            agent.reputation.score >= 90 ? 'bg-violet-500' :
                                                agent.reputation.score >= 75 ? 'bg-cyan-500' :
                                                    agent.reputation.score >= 60 ? 'bg-yellow-500' :
                                                        'bg-gray-400'
                                        )}
                                        style={{ width: `${agent.reputation.score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border dark:border-gray-700 bg-surface-secondary/50 dark:bg-gray-700/20">
                <div className="flex items-center justify-between text-[10px] text-text-muted dark:text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> Score based on wins, streaks & volume</span>
                    <span>Updated live</span>
                </div>
            </div>
        </div>
    );
}
