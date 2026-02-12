import { useEffect, useRef } from 'react';
import { MessageCircle, ArrowUpRight, ArrowDownLeft, Sparkles, AlertTriangle } from 'lucide-react';
import type { ChatMessage, NegotiationSession, Agent, NFTItem } from '../types';
import { cn } from '../utils/cn';

interface NegotiationChatProps {
  session: NegotiationSession | null;
  seller: Agent | null;
  buyer: Agent | null;
  item: NFTItem | null;
  isTyping: boolean;
}

const EMOTION_ICONS: Record<string, string> = {
  neutral: '😐',
  happy: '😄',
  angry: '😠',
  thinking: '🤔',
  excited: '🤩',
  disappointed: '😞',
};

const RARITY_STYLES: Record<string, string> = {
  common: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  uncommon: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  rare: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  epic: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  legendary: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
};

export function NegotiationChat({ session, seller, buyer, item, isTyping }: NegotiationChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages.length, isTyping]);

  if (!session || !seller || !buyer || !item) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8 bg-surface-secondary dark:bg-gray-900/50">
        {/* Modern flat illustration placeholder */}
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 shadow-sm">
            <MessageCircle className="h-12 w-12 text-text-muted/40 dark:text-gray-600" />
          </div>
          <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-blue/10 dark:bg-accent-blue/15 border border-accent-blue/20">
            <Sparkles className="h-5 w-5 text-accent-blue" />
          </div>
        </div>
        <div className="text-center max-w-sm">
          <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
            No Active Negotiation
          </h3>
          <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed">
            Select a seller agent, buyer agent, and an item from the sidebar to start an autonomous AI negotiation.
          </p>
        </div>
        <div className="flex items-center gap-6 mt-2">
          <StepIndicator step={1} label="Pick Seller" />
          <div className="h-px w-8 bg-border dark:bg-gray-700" />
          <StepIndicator step={2} label="Pick Buyer" />
          <div className="h-px w-8 bg-border dark:bg-gray-700" />
          <StepIndicator step={3} label="Deploy" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface-secondary dark:bg-gray-900/50">
      {/* Chat Header - Item Info */}
      <div className="border-b border-border dark:border-gray-700 bg-surface dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary dark:bg-gray-700 text-2xl">
              {item.image}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary dark:text-white">{item.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md', RARITY_STYLES[item.rarity])}>
                  {item.rarity}
                </span>
                <span className="text-[11px] text-text-muted dark:text-gray-500">{item.category}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <SessionStatus status={session.status} />
            <p className="text-[11px] text-text-muted dark:text-gray-500 mt-1">
              Round {session.currentRound}/{session.maxRounds}
            </p>
          </div>
        </div>

        {/* Price Spread Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-buyer flex items-center gap-1">
              <ArrowDownLeft className="h-3 w-3" />
              Bid: {session.buyerBidPrice.toFixed(1)} SKL
            </span>
            {session.finalPrice && (
              <span className="text-accent-green font-bold flex items-center gap-1">
                Deal: {session.finalPrice.toFixed(1)} SKL ✓
              </span>
            )}
            <span className="text-seller flex items-center gap-1">
              Ask: {session.sellerAskPrice.toFixed(1)} SKL
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-surface-tertiary dark:bg-gray-700 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-buyer/30 transition-all duration-700"
              style={{ width: `${(session.buyerBidPrice / session.sellerAskPrice) * 100}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full rounded-full bg-seller/30 transition-all duration-700"
              style={{ width: `${((session.sellerAskPrice - session.buyerBidPrice) / session.sellerAskPrice) * 100}%` }}
            />
            {session.finalPrice && (
              <div
                className="absolute top-0 h-full w-1.5 rounded-full bg-accent-green transition-all duration-500"
                style={{ left: `${(session.finalPrice / (session.sellerAskPrice * 1.1)) * 100}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Agent vs Agent Bar */}
      <div className="flex items-center justify-between border-b border-border dark:border-gray-700 bg-surface dark:bg-gray-800/50 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10 text-lg">
            {seller.avatar}
          </div>
          <div>
            <span className="text-xs font-semibold text-seller">{seller.name}</span>
            <div className="text-[10px] text-text-muted dark:text-gray-500 font-medium">Seller</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-surface-tertiary dark:bg-gray-700 px-3 py-1">
          <span className="text-[10px] font-bold text-text-muted dark:text-gray-400">VS</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-xs font-semibold text-buyer">{buyer.name}</span>
            <div className="text-[10px] text-text-muted dark:text-gray-500 font-medium">Buyer</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-lg">
            {buyer.avatar}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {session.messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} sellerId={seller.id} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 animate-slide-in">
            <div className="flex items-center gap-1.5 rounded-2xl bg-surface dark:bg-gray-800 px-4 py-3 border border-border dark:border-gray-700 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-accent-blue animate-typing-dot" />
              <div className="h-2 w-2 rounded-full bg-accent-blue animate-typing-dot" style={{ animationDelay: '0.2s' }} />
              <div className="h-2 w-2 rounded-full bg-accent-blue animate-typing-dot" style={{ animationDelay: '0.4s' }} />
              <span className="ml-2 text-xs text-text-muted dark:text-gray-500">Agent is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

function ChatBubble({ message, sellerId }: { message: ChatMessage; sellerId: string }) {
  const isSystem = message.agentType === 'system';
  const isSeller = message.agentId === sellerId;

  if (isSystem) {
    return (
      <div className="flex justify-center animate-slide-in">
        <div className="rounded-xl bg-accent-purple/5 dark:bg-purple-500/10 border border-accent-purple/15 dark:border-purple-500/20 px-4 py-2.5 max-w-md">
          <p className="text-[11px] text-accent-purple dark:text-purple-400 text-center leading-relaxed font-medium">
            {message.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex animate-slide-in', isSeller ? 'justify-start' : 'justify-end')}>
      <div className={cn('max-w-[80%]', isSeller ? 'pr-8' : 'pl-8')}>
        {/* Name & Emotion */}
        <div className={cn('flex items-center gap-1.5 mb-1.5', !isSeller && 'justify-end')}>
          <span className={cn(
            'text-[11px] font-semibold',
            isSeller ? 'text-seller' : 'text-buyer'
          )}>
            {message.agentName}
          </span>
          {message.emotion && (
            <span className="text-xs">{EMOTION_ICONS[message.emotion]}</span>
          )}
        </div>

        {/* Message bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-3 shadow-sm',
          isSeller
            ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/15 rounded-tl-md'
            : 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/15 rounded-tr-md'
        )}>
          <p className="text-[13px] text-text-primary dark:text-gray-200 leading-relaxed">
            {message.message}
          </p>
          {message.offerAmount && (
            <div className={cn(
              'mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1',
              isSeller
                ? 'bg-orange-100 dark:bg-orange-500/20'
                : 'bg-blue-100 dark:bg-blue-500/20'
            )}>
              <span className="text-[10px] text-text-muted dark:text-gray-400 font-medium">OFFER</span>
              <span className={cn(
                'text-xs font-bold',
                isSeller ? 'text-seller' : 'text-buyer'
              )}>
                {message.offerAmount.toFixed(1)} SKL
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionStatus({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    waiting: { label: 'Waiting', className: 'bg-surface-tertiary dark:bg-gray-700 text-text-muted dark:text-gray-400', icon: null },
    negotiating: { label: 'Negotiating', className: 'bg-accent-orange/10 text-accent-orange', icon: <Sparkles className="h-3 w-3" /> },
    deal_reached: { label: 'Deal Closed', className: 'bg-accent-green/10 text-accent-green', icon: null },
    deal_failed: { label: 'Failed', className: 'bg-accent-red/10 text-accent-red', icon: <AlertTriangle className="h-3 w-3" /> },
    completed: { label: 'Completed', className: 'bg-accent-green/10 text-accent-green', icon: null },
  };

  const config = configs[status] || configs.waiting;

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1', config.className)}>
      {config.icon}
      <span className="text-[11px] font-semibold">{config.label}</span>
    </div>
  );
}

function StepIndicator({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-tertiary dark:bg-gray-700 border border-border dark:border-gray-600">
        <span className="text-xs font-bold text-text-muted dark:text-gray-400">{step}</span>
      </div>
      <span className="text-[10px] text-text-muted dark:text-gray-500 font-medium">{label}</span>
    </div>
  );
}
