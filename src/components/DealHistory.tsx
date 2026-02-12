import { History, CheckCircle2, XCircle } from 'lucide-react';
import type { NegotiationSession, Agent, NFTItem } from '../types';
import { cn } from '../utils/cn';

interface DealHistoryProps {
  sessions: NegotiationSession[];
  agents: Agent[];
  items: NFTItem[];
}

export function DealHistory({ sessions, agents, items }: DealHistoryProps) {
  const completedSessions = sessions.filter(
    (s) => s.status === 'deal_reached' || s.status === 'deal_failed'
  );

  if (completedSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary dark:bg-gray-700">
          <History className="h-5 w-5 text-text-muted/40 dark:text-gray-600" />
        </div>
        <p className="text-xs text-text-muted dark:text-gray-500 font-medium">No completed deals yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {completedSessions.map((session) => {
        const seller = agents.find((a) => a.id === session.sellerId);
        const buyer = agents.find((a) => a.id === session.buyerId);
        const item = items.find((i) => i.id === session.itemId);
        const success = session.status === 'deal_reached';

        return (
          <div
            key={session.id}
            className={cn(
              'rounded-xl border p-3.5 transition-all',
              success
                ? 'border-accent-green/20 bg-accent-green/5 dark:bg-accent-green/5'
                : 'border-accent-red/20 bg-accent-red/5 dark:bg-accent-red/5'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {success ? (
                  <CheckCircle2 className="h-4 w-4 text-accent-green" />
                ) : (
                  <XCircle className="h-4 w-4 text-accent-red" />
                )}
                <span className={cn(
                  'text-xs font-semibold',
                  success ? 'text-accent-green' : 'text-accent-red'
                )}>
                  {success ? 'Deal Closed' : 'Deal Failed'}
                </span>
              </div>
              {session.finalPrice && (
                <span className="text-sm font-bold text-accent-green">
                  {session.finalPrice.toFixed(1)} SKL
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-text-primary dark:text-gray-300">
              <span className="text-base">{item?.image}</span>
              <span className="truncate font-medium">{item?.name}</span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-muted dark:text-gray-500">
              <span className="text-seller font-medium">{seller?.name}</span>
              <span>↔</span>
              <span className="text-buyer font-medium">{buyer?.name}</span>
              <span className="ml-auto font-medium">{session.currentRound} rounds</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
