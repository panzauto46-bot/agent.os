import { Activity, Bot, Zap, Sun, Moon, Radio } from 'lucide-react';
import type { MarketStats } from '../types';

interface HeaderProps {
  stats: MarketStats;
  blockNumber: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ stats, blockNumber, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface dark:bg-gray-800/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue text-white shadow-lg shadow-accent-blue/20">
              <Radio className="h-4.5 w-4.5" />
            </div>
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-green border-2 border-surface dark:border-gray-800" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-text-primary dark:text-white">
              AGENTS<span className="text-accent-blue">.OS</span>
            </h1>
            <p className="text-[10px] text-text-muted dark:text-gray-400 font-medium tracking-wide">
              Autonomous Commerce Platform
            </p>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="hidden md:flex items-center gap-2">
          <StatChip
            icon={<Bot className="h-3.5 w-3.5" />}
            label="Agents"
            value={stats.totalAgents.toString()}
          />
          <StatChip
            icon={<Activity className="h-3.5 w-3.5" />}
            label="Active"
            value={stats.activeNegotiations.toString()}
            active
          />
          <StatChip
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Deals"
            value={stats.completedDeals.toString()}
          />

          <div className="h-5 w-px bg-border dark:bg-gray-700 mx-1" />

          <div className="flex items-center gap-1.5 rounded-full bg-accent-green/10 dark:bg-accent-green/15 px-3 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[11px] font-semibold text-accent-green">
              #{blockNumber.toLocaleString()}
            </span>
          </div>

          {stats.totalVolume > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-surface-tertiary dark:bg-gray-700 px-3 py-1.5">
              <span className="text-[11px] font-semibold text-text-primary dark:text-gray-200">
                {stats.totalVolume.toLocaleString()} SKL
              </span>
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Mobile live indicator */}
          <div className="md:hidden flex items-center gap-1.5 rounded-full bg-accent-green/10 px-2.5 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[11px] font-semibold text-accent-green">Live</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-surface-tertiary dark:bg-gray-700 hover:bg-border dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-text-secondary dark:text-gray-300" />
            ) : (
              <Sun className="h-4 w-4 text-text-secondary dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function StatChip({
  icon,
  label,
  value,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-surface-tertiary dark:bg-gray-700 px-3 py-1.5">
      <span className={active ? 'text-accent-green' : 'text-text-muted dark:text-gray-400'}>{icon}</span>
      <span className="text-[10px] text-text-muted dark:text-gray-400 font-medium hidden xl:inline">{label}</span>
      <span className="text-[11px] font-bold text-text-primary dark:text-gray-200">{value}</span>
    </div>
  );
}
