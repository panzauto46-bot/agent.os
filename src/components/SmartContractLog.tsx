import { FileCheck, ArrowRight, Clock, Hash, Fuel } from 'lucide-react';
import type { SmartContractExecution } from '../types';
import { cn } from '../utils/cn';

interface SmartContractLogProps {
  events: SmartContractExecution[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  escrow_created: { label: 'Escrow Created', color: 'text-accent-blue', bgColor: 'bg-accent-blue/10', icon: '🔐' },
  payment_sent: { label: 'Payment Sent', color: 'text-accent-green', bgColor: 'bg-accent-green/10', icon: '💸' },
  item_transferred: { label: 'NFT Transferred', color: 'text-accent-purple', bgColor: 'bg-accent-purple/10', icon: '📦' },
  deal_completed: { label: 'Deal Finalized', color: 'text-accent-orange', bgColor: 'bg-accent-orange/10', icon: '✅' },
  deal_cancelled: { label: 'Deal Cancelled', color: 'text-accent-red', bgColor: 'bg-accent-red/10', icon: '❌' },
};

export function SmartContractLog({ events }: SmartContractLogProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary dark:bg-gray-800 border border-border dark:border-gray-700">
          <FileCheck className="h-7 w-7 text-text-muted/40 dark:text-gray-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-text-secondary dark:text-gray-400">No events yet</p>
          <p className="text-xs text-text-muted dark:text-gray-500 mt-1 max-w-[200px]">
            Smart contracts auto-execute when agents reach a deal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 p-4 overflow-y-auto max-h-full">
      {events.map((event, i) => {
        const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.deal_completed;
        return (
          <div
            key={event.id}
            className="animate-slide-in rounded-xl border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 p-3.5 shadow-sm"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{config.icon}</span>
                <span className={cn('text-xs font-semibold', config.color)}>
                  {config.label}
                </span>
              </div>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                event.status === 'confirmed'
                  ? 'bg-accent-green/10 text-accent-green'
                  : event.status === 'pending'
                  ? 'bg-accent-orange/10 text-accent-orange'
                  : 'bg-accent-red/10 text-accent-red'
              )}>
                {event.status === 'confirmed' ? 'Confirmed' : event.status === 'pending' ? 'Pending' : 'Failed'}
              </span>
            </div>

            {/* From → To */}
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="text-text-primary dark:text-gray-300 truncate max-w-[100px] font-medium">{event.fromAgent}</span>
              <ArrowRight className="h-3 w-3 text-text-muted dark:text-gray-500 flex-shrink-0" />
              <span className="text-text-primary dark:text-gray-300 truncate max-w-[100px] font-medium">{event.toAgent}</span>
            </div>

            {/* Amount */}
            {event.amount > 0 && (
              <div className="mb-2.5 rounded-lg bg-accent-green/5 dark:bg-accent-green/10 px-2.5 py-1.5 inline-block">
                <span className="text-sm font-bold text-accent-green">
                  {event.amount.toFixed(1)} SKL
                </span>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-text-muted dark:text-gray-500">
              <div className="flex items-center gap-1">
                <Hash className="h-2.5 w-2.5" />
                <span className="truncate font-mono">{event.txHash.slice(0, 16)}...</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Clock className="h-2.5 w-2.5" />
                <span>#{event.blockNumber.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <Fuel className="h-2.5 w-2.5" />
                <span>Gas: {event.gasUsed.toLocaleString()}</span>
                <span className="ml-1 text-accent-green font-medium">(Gasless on SKALE)</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
