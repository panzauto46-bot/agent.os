import { Rocket, RotateCcw, Pause, Play, Check, Circle } from 'lucide-react';
import { cn } from '../utils/cn';

interface DeployPanelProps {
  selectedSeller: string | null;
  selectedBuyer: string | null;
  selectedItem: string | null;
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  onDeploy: () => void;
  onReset: () => void;
  onTogglePause: () => void;
  onSpeedChange: (speed: number) => void;
}

export function DeployPanel({
  selectedSeller,
  selectedBuyer,
  selectedItem,
  isRunning,
  isPaused,
  speed,
  onDeploy,
  onReset,
  onTogglePause,
  onSpeedChange,
}: DeployPanelProps) {
  const canDeploy = selectedSeller && selectedBuyer && selectedItem && !isRunning;

  return (
    <div className="rounded-2xl border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue/10 dark:bg-accent-blue/15">
          <Rocket className="h-3.5 w-3.5 text-accent-blue" />
        </div>
        Mission Control
      </h3>

      {/* Status Checks */}
      <div className="space-y-2.5 mb-5">
        <CheckItem label="Seller Agent Selected" checked={!!selectedSeller} />
        <CheckItem label="Buyer Agent Selected" checked={!!selectedBuyer} />
        <CheckItem label="Target Item Selected" checked={!!selectedItem} />
      </div>

      {/* Speed Control */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs text-text-secondary dark:text-gray-400 font-medium">Speed</span>
          <span className="text-xs font-bold text-accent-blue">{speed}x</span>
        </div>
        <div className="flex rounded-xl bg-surface-secondary dark:bg-gray-700 p-1 gap-1">
          {[1, 2, 3, 5].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-semibold transition-all',
                speed === s
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-200'
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isRunning ? (
          <button
            onClick={onDeploy}
            disabled={!canDeploy}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
              canDeploy
                ? 'bg-accent-blue hover:bg-accent-blue-light text-white shadow-lg shadow-accent-blue/25 active:scale-[0.98]'
                : 'bg-surface-tertiary dark:bg-gray-700 text-text-muted dark:text-gray-500 cursor-not-allowed'
            )}
          >
            <Rocket className="h-4 w-4" />
            Deploy Negotiation
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onTogglePause}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-all',
                isPaused
                  ? 'bg-accent-green/10 text-accent-green hover:bg-accent-green/20'
                  : 'bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20'
              )}
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {checked ? (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-green/10">
          <Check className="h-3 w-3 text-accent-green" />
        </div>
      ) : (
        <div className="flex h-5 w-5 items-center justify-center">
          <Circle className="h-4 w-4 text-text-muted dark:text-gray-600" />
        </div>
      )}
      <span className={cn(
        'text-sm',
        checked ? 'text-text-primary dark:text-gray-200 font-medium' : 'text-text-muted dark:text-gray-500'
      )}>
        {label}
      </span>
    </div>
  );
}
