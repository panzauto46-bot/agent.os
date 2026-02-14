import { Package } from 'lucide-react';
import type { NFTItem } from '../types';
import { cn } from '../utils/cn';

interface ItemSelectorProps {
  items: NFTItem[];
  selectedId: string | null;
  onSelect: (item: NFTItem) => void;
}

const RARITY_BADGE: Record<string, string> = {
  common: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  uncommon: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  rare: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  epic: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  legendary: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
};

export function ItemSelector({ items, selectedId, onSelect }: ItemSelectorProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-purple/10 dark:bg-purple-500/15">
          <Package className="h-3.5 w-3.5 text-accent-purple" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary dark:text-white">
          Available Items
        </h3>
        <span className="ml-auto text-xs text-text-muted dark:text-gray-500 font-medium">{items.length}</span>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {items.map((item) => {
          const isSelected = item.id === selectedId;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl border p-3 transition-all text-left',
                'hover:shadow-sm',
                isSelected
                  ? 'border-accent-blue/40 bg-accent-blue/5 dark:bg-accent-blue/10 ring-1 ring-accent-blue/20 shadow-sm'
                  : 'border-border dark:border-gray-700 bg-surface dark:bg-gray-800 hover:border-border-strong dark:hover:border-gray-600'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary dark:bg-gray-700 text-xl flex-shrink-0">
                {item.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary dark:text-gray-200 truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={cn('text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md', RARITY_BADGE[item.rarity])}>
                    {item.rarity}
                  </span>
                  <span className="text-[10px] text-text-muted dark:text-gray-500">{item.category}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-accent-green">{item.currentPrice} ETH</p>
                <p className="text-[10px] text-text-muted dark:text-gray-500">base: {item.basePrice}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
