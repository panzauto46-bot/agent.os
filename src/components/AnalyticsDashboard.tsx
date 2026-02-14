'use client';

import { BarChart3, TrendingUp, TrendingDown, DollarSign, Zap, Target, Clock, Award, Activity } from 'lucide-react';
import type { NegotiationSession, Agent } from '@/types';
import { cn } from '@/utils/cn';

interface AnalyticsDashboardProps {
    sessions: NegotiationSession[];
    agents: Agent[];
}

export function AnalyticsDashboard({ sessions, agents }: AnalyticsDashboardProps) {
    const successfulDeals = sessions.filter(s => s.status === 'deal_reached');
    const failedDeals = sessions.filter(s => s.status === 'deal_failed');
    const totalVolume = successfulDeals.reduce((sum, s) => sum + (s.finalPrice || 0), 0);
    const avgPrice = successfulDeals.length > 0 ? totalVolume / successfulDeals.length : 0;
    const winRate = sessions.length > 0 ? (successfulDeals.length / sessions.length * 100) : 0;
    const avgRounds = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.currentRound, 0) / sessions.length : 0;

    // Mini price chart (last 10 deals)
    const priceHistory = successfulDeals.slice(-10).map(s => s.finalPrice || 0);
    const maxPrice = Math.max(...priceHistory, 1);
    const minPrice = Math.min(...priceHistory, 0);
    const priceRange = maxPrice - minPrice || 1;

    // Agent performance
    const agentPerformance = agents.map(agent => {
        const agentSessions = sessions.filter(s => s.sellerId === agent.id || s.buyerId === agent.id);
        const wins = agentSessions.filter(s => s.status === 'deal_reached').length;
        const total = agentSessions.length;
        return {
            ...agent,
            sessionWins: wins,
            sessionTotal: total,
            rate: total > 0 ? (wins / total * 100) : 0,
        };
    }).sort((a, b) => b.rate - a.rate);

    return (
        <div className="rounded-2xl border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border dark:border-gray-700 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10">
                <h3 className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue/10 dark:bg-accent-blue/20">
                        <BarChart3 className="h-3.5 w-3.5 text-accent-blue" />
                    </div>
                    Market Analytics
                </h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-px bg-border dark:bg-gray-700">
                <StatBox
                    icon={<DollarSign className="h-3.5 w-3.5 text-accent-green" />}
                    label="Total Volume"
                    value={`${totalVolume.toLocaleString()} ETH`}
                    change={totalVolume > 0 ? '+' : ''}
                    changeColor="text-accent-green"
                />
                <StatBox
                    icon={<Target className="h-3.5 w-3.5 text-accent-blue" />}
                    label="Win Rate"
                    value={`${winRate.toFixed(0)}%`}
                    change={winRate >= 50 ? '↑' : winRate > 0 ? '↓' : '—'}
                    changeColor={winRate >= 50 ? 'text-accent-green' : 'text-accent-red'}
                />
                <StatBox
                    icon={<Zap className="h-3.5 w-3.5 text-accent-orange" />}
                    label="Deals"
                    value={`${successfulDeals.length}/${sessions.length}`}
                    change={`${failedDeals.length} failed`}
                    changeColor="text-text-muted"
                />
                <StatBox
                    icon={<Clock className="h-3.5 w-3.5 text-accent-purple" />}
                    label="Avg Rounds"
                    value={avgRounds.toFixed(1)}
                    change={avgRounds <= 4 ? 'Fast' : 'Slow'}
                    changeColor={avgRounds <= 4 ? 'text-accent-green' : 'text-accent-orange'}
                />
            </div>

            {/* Mini Price Chart */}
            {priceHistory.length > 0 && (
                <div className="p-4 border-t border-border dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wider">Price History</span>
                        <span className="text-[10px] font-bold text-accent-green">
                            Avg: {avgPrice.toFixed(0)} ETH
                        </span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                        {priceHistory.map((price, idx) => {
                            const height = ((price - minPrice) / priceRange) * 100;
                            const isLast = idx === priceHistory.length - 1;
                            return (
                                <div
                                    key={idx}
                                    className="flex-1 flex flex-col items-center justify-end gap-0.5"
                                >
                                    <span className={cn(
                                        'text-[8px] font-bold',
                                        isLast ? 'text-accent-green' : 'text-text-muted dark:text-gray-500'
                                    )}>
                                        {price.toFixed(0)}
                                    </span>
                                    <div
                                        className={cn(
                                            'w-full rounded-t-sm transition-all duration-500',
                                            isLast ? 'bg-accent-green' : 'bg-accent-blue/40 dark:bg-accent-blue/30'
                                        )}
                                        style={{ height: `${Math.max(height, 8)}%` }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Top Performers */}
            {agentPerformance.some(a => a.sessionTotal > 0) && (
                <div className="p-4 border-t border-border dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Award className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wider">Session Performance</span>
                    </div>
                    <div className="space-y-2">
                        {agentPerformance.filter(a => a.sessionTotal > 0).slice(0, 4).map((agent) => (
                            <div key={agent.id} className="flex items-center gap-2">
                                <span className="text-sm">{agent.avatar}</span>
                                <span className="text-[11px] font-semibold text-text-primary dark:text-gray-200 flex-1 truncate">{agent.name}</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-12 h-1.5 rounded-full bg-surface-tertiary dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full',
                                                agent.rate >= 80 ? 'bg-accent-green' : agent.rate >= 50 ? 'bg-accent-orange' : 'bg-accent-red'
                                            )}
                                            style={{ width: `${agent.rate}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-text-primary dark:text-gray-200 w-10 text-right">
                                        {agent.rate.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {sessions.length === 0 && (
                <div className="p-6 flex flex-col items-center gap-2">
                    <Activity className="h-8 w-8 text-text-muted/30 dark:text-gray-600" />
                    <p className="text-xs text-text-muted dark:text-gray-500 font-medium text-center">
                        Run negotiations to see analytics
                    </p>
                </div>
            )}
        </div>
    );
}

function StatBox({ icon, label, value, change, changeColor }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: string;
    changeColor: string;
}) {
    return (
        <div className="bg-surface dark:bg-gray-800 p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
                {icon}
                <span className="text-[10px] text-text-muted dark:text-gray-500 font-medium">{label}</span>
            </div>
            <p className="text-sm font-black text-text-primary dark:text-white">{value}</p>
            <p className={cn('text-[9px] font-medium mt-0.5', changeColor)}>{change}</p>
        </div>
    );
}
