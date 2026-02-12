'use client';

import { useState } from 'react';
import { Settings2, Flame, Clock, Shuffle, AlertTriangle, RotateCcw } from 'lucide-react';
import type { Agent, AgentCustomization } from '@/types';
import { cn } from '@/utils/cn';

interface AgentCustomizerProps {
    agent: Agent;
    onUpdate: (agentId: string, customization: AgentCustomization) => void;
}

const TRAITS = [
    {
        key: 'aggressiveness' as const,
        label: 'Aggressiveness',
        icon: <Flame className="h-3.5 w-3.5" />,
        description: 'How hard the agent pushes for better deals',
        colorLow: 'text-green-500',
        colorHigh: 'text-red-500',
        bgLow: 'bg-green-500',
        bgHigh: 'bg-red-500',
        labelLow: 'Gentle',
        labelHigh: 'Ruthless',
    },
    {
        key: 'patience' as const,
        label: 'Patience',
        icon: <Clock className="h-3.5 w-3.5" />,
        description: 'How many rounds before getting anxious',
        colorLow: 'text-red-500',
        colorHigh: 'text-blue-500',
        bgLow: 'bg-red-500',
        bgHigh: 'bg-blue-500',
        labelLow: 'Impatient',
        labelHigh: 'Monk-like',
    },
    {
        key: 'flexibility' as const,
        label: 'Flexibility',
        icon: <Shuffle className="h-3.5 w-3.5" />,
        description: 'Willingness to concede on price',
        colorLow: 'text-amber-500',
        colorHigh: 'text-emerald-500',
        bgLow: 'bg-amber-500',
        bgHigh: 'bg-emerald-500',
        labelLow: 'Rigid',
        labelHigh: 'Flexible',
    },
    {
        key: 'riskTolerance' as const,
        label: 'Risk Tolerance',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        description: 'Max budget stretch beyond fair value',
        colorLow: 'text-blue-500',
        colorHigh: 'text-amber-500',
        bgLow: 'bg-blue-500',
        bgHigh: 'bg-amber-500',
        labelLow: 'Safe',
        labelHigh: 'YOLO',
    },
];

export function AgentCustomizer({ agent, onUpdate }: AgentCustomizerProps) {
    const [customization, setCustomization] = useState<AgentCustomization>({ ...agent.customization });
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (key: keyof AgentCustomization, value: number) => {
        const updated = { ...customization, [key]: value };
        setCustomization(updated);
        onUpdate(agent.id, updated);
    };

    const handleReset = () => {
        setCustomization({ ...agent.customization });
        onUpdate(agent.id, agent.customization);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 text-[10px] text-text-muted dark:text-gray-500 hover:text-accent-blue dark:hover:text-accent-blue transition-colors font-medium mt-1"
            >
                <Settings2 className="h-3 w-3" />
                Customize Strategy
            </button>
        );
    }

    return (
        <div className="mt-3 rounded-xl border border-border dark:border-gray-700 bg-surface-secondary dark:bg-gray-700/50 p-3 space-y-3 animate-slide-in">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-text-primary dark:text-white flex items-center gap-1.5">
                    <Settings2 className="h-3 w-3 text-accent-blue" />
                    Strategy Tuner — {agent.name}
                </h4>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleReset}
                        className="text-[9px] text-text-muted hover:text-accent-orange transition-colors"
                        title="Reset to default"
                    >
                        <RotateCcw className="h-3 w-3" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-[9px] text-text-muted hover:text-accent-red transition-colors font-bold p-0.5"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {TRAITS.map((trait) => {
                const value = customization[trait.key];
                const percentage = (value / 10) * 100;

                return (
                    <div key={trait.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <span className="text-text-muted dark:text-gray-400">{trait.icon}</span>
                                <span className="text-[10px] font-semibold text-text-primary dark:text-gray-200">{trait.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={cn('text-[9px] font-bold', value <= 3 ? trait.colorLow : value >= 7 ? trait.colorHigh : 'text-text-muted')}>
                                    {value <= 3 ? trait.labelLow : value >= 7 ? trait.labelHigh : 'Balanced'}
                                </span>
                                <span className="text-[10px] font-black text-text-primary dark:text-white bg-surface dark:bg-gray-600 rounded px-1.5 py-0.5 min-w-[24px] text-center">
                                    {value}
                                </span>
                            </div>
                        </div>

                        {/* Slider */}
                        <div className="relative h-2 rounded-full bg-surface dark:bg-gray-600 overflow-hidden">
                            <div
                                className={cn(
                                    'absolute left-0 top-0 h-full rounded-full transition-all duration-200',
                                    value <= 3 ? trait.bgLow : value >= 7 ? trait.bgHigh : 'bg-gray-400 dark:bg-gray-500'
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={value}
                            onChange={(e) => handleChange(trait.key, parseInt(e.target.value))}
                            className="w-full h-2 bg-transparent appearance-none cursor-pointer -mt-2 relative z-10 opacity-0 hover:opacity-100"
                            style={{ marginTop: '-8px' }}
                        />

                        <p className="text-[9px] text-text-muted dark:text-gray-500 leading-relaxed">{trait.description}</p>
                    </div>
                );
            })}
        </div>
    );
}
