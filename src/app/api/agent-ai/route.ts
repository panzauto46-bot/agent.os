import { NextRequest, NextResponse } from 'next/server';
import { generateAgentMessage, generateAgentThinking, generateBattleBidMessage } from '@/lib/groq';

/**
 * AI-Powered Agent API — "The Real Brain" 🧠
 * Uses Groq LLM (Llama 3.3 70B) for real AI reasoning
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'negotiate': {
                const {
                    agentName, agentType, personality, strategy,
                    aggressiveness, patience, flexibility, riskTolerance,
                    itemName, itemCategory, itemRarity, basePrice,
                    currentOffer, opposingOffer, round, maxRounds, context,
                } = body;

                const result = await generateAgentMessage({
                    agentName, agentType, personality, strategy,
                    aggressiveness: aggressiveness || 5,
                    patience: patience || 5,
                    flexibility: flexibility || 5,
                    riskTolerance: riskTolerance || 5,
                    itemName, itemCategory: itemCategory || 'Item', itemRarity: itemRarity || 'rare',
                    basePrice, currentOffer, opposingOffer,
                    round, maxRounds, context: context || '',
                });

                return NextResponse.json({
                    success: true,
                    message: result.message,
                    emotion: result.emotion,
                    suggestedPrice: result.suggestedPrice,
                    aiPowered: true,
                });
            }

            case 'think': {
                const {
                    agentName, agentType, personality,
                    currentPrice, opposingPrice, basePrice,
                    round, maxRounds,
                } = body;

                const thought = await generateAgentThinking({
                    agentName, agentType, personality,
                    currentPrice, opposingPrice, basePrice,
                    round, maxRounds,
                });

                return NextResponse.json({
                    success: true,
                    thought,
                    aiPowered: true,
                });
            }

            case 'battle_bid': {
                const {
                    agentName, personality, aggressiveness, riskTolerance,
                    itemName, bidAmount, highestBid, competitors,
                    round, maxRounds, isEliminated,
                } = body;

                const message = await generateBattleBidMessage({
                    agentName, personality,
                    aggressiveness: aggressiveness || 5,
                    riskTolerance: riskTolerance || 5,
                    itemName, bidAmount, highestBid,
                    competitors: competitors || [],
                    round, maxRounds,
                    isEliminated: isEliminated || false,
                });

                return NextResponse.json({
                    success: true,
                    message,
                    aiPowered: true,
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('AI Agent API error:', error);
        return NextResponse.json(
            {
                error: 'AI processing failed',
                fallback: true,
                message: 'Using fallback response — AI temporarily unavailable',
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        name: 'AGENTS.OS AI Brain API',
        version: '2.0.0',
        description: 'Groq LLM-powered Agent Intelligence',
        model: 'llama-3.3-70b-versatile',
        provider: 'Groq',
        actions: ['negotiate', 'think', 'battle_bid'],
        features: [
            'Real AI-powered negotiation messages',
            'Agent internal reasoning/thinking',
            'Battle Royale bid generation',
            'Personality-driven responses',
        ],
    });
}
