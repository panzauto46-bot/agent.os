import { BarChart3, Target, Wallet, ToggleLeft, ToggleRight, Star, Flame } from 'lucide-react';
import type { Agent } from '../types';
import { cn } from '../utils/cn';

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onToggleDeploy?: () => void;
}

const TIER_COLORS: Record<string, string> = {
  Bronze: 'text-amber-700 bg-amber-100 dark:bg-amber-500/15',
  Silver: 'text-gray-500 bg-gray-100 dark:bg-gray-500/15',
  Gold: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/15',
  Platinum: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/15',
  Diamond: 'text-violet-500 bg-violet-50 dark:bg-violet-500/15',
};

export function AgentCard({ agent, isActive, isSelected, onSelect, onToggleDeploy }: AgentCardProps) {
  const isSeller = agent.type === 'seller';

  return (
    <div
      className={cn(
        'relative group cursor-pointer rounded-2xl border p-4 transition-all duration-200',
        'bg-surface dark:bg-gray-800 hover:shadow-md dark:hover:shadow-none',
        isSelected
          ? isSeller
            ? 'border-seller/40 shadow-sm ring-1 ring-seller/20'
            : 'border-buyer/40 shadow-sm ring-1 ring-buyer/20'
          : 'border-border dark:border-gray-700 hover:border-border-strong dark:hover:border-gray-600',
        isActive && 'ring-2 ring-accent-green/30 border-accent-green/40'
      )}
      onClick={onSelect}
    >
      {/* Active badge */}
      {isActive && (
        <div className="absolute -top-2 right-3 flex items-center gap-1 rounded-full bg-accent-green px-2 py-0.5 shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-bold text-white">LIVE</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl text-xl',
            isSeller
              ? 'bg-orange-50 dark:bg-orange-500/10'
              : 'bg-blue-50 dark:bg-blue-500/10'
          )}>
            {agent.avatar}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary dark:text-white">{agent.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                'text-[11px] font-medium',
                isSeller ? 'text-seller' : 'text-buyer'
              )}>
                {isSeller ? 'Seller Agent' : 'Buyer Agent'}
              </span>
              {/* Reputation Tier Badge */}
              <span className={cn(
                'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase',
                TIER_COLORS[agent.reputation.tier] || TIER_COLORS.Bronze
              )}>
                {agent.reputation.tier}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDeploy?.();
          }}
          className="transition-colors mt-1"
          aria-label="Toggle deploy"
        >
          {agent.deployed ? (
            <ToggleRight className="h-6 w-6 text-accent-green" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-text-muted dark:text-gray-500" />
          )}
        </button>
      </div>

      {/* Strategy */}
      <div className="mb-3 rounded-xl bg-surface-secondary dark:bg-gray-700/50 p-3">
        <p className="text-[11px] text-text-secondary dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-accent-purple dark:text-purple-400">Strategy:</span> &quot;{agent.strategy}&quot;
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        <StatCell icon={<Target className="h-3 w-3" />} label="Deals" value={agent.stats.totalDeals.toString()} />
        <StatCell icon={<BarChart3 className="h-3 w-3" />} label="Win%" value={`${agent.stats.winRate}%`} />
        <StatCell icon={<Star className="h-3 w-3" />} label="Score" value={agent.reputation.score.toString()} />
      </div>

      {/* Streak indicator */}
      {agent.reputation.streak >= 3 && (
        <div className="mt-2 flex items-center gap-1  text-[10px] text-amber-500 font-bold">
          <Flame className="h-3 w-3" />
          <span>{agent.reputation.streak} win streak 🔥</span>
        </div>
      )}

      {/* Balance for buyers */}
      {!isSeller && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-500/10 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-buyer" />
            <span className="text-[11px] text-text-muted dark:text-gray-400 font-medium">Balance</span>
          </div>
          <span className="text-sm font-bold text-buyer">{agent.balance.toLocaleString()} SKL</span>
        </div>
      )}
    </div>
  );
}

function StatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-surface-secondary dark:bg-gray-700/50 px-2.5 py-2">
      <span className="text-text-muted dark:text-gray-500">{icon}</span>
      <span className="text-[9px] text-text-muted dark:text-gray-500 font-medium">{label}</span>
      <span className="ml-auto text-[11px] font-semibold text-text-primary dark:text-gray-200">{value}</span>
    </div>
  );
}
