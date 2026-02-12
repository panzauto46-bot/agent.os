// Groq AI Service for Agent Intelligence
// Uses Groq's ultra-fast LLM inference for real AI-powered negotiations

export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GroqResponse {
    id: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export async function callGroq(
    messages: GroqMessage[],
    options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
    }
): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: options?.model || 'llama-3.3-70b-versatile',
            messages,
            temperature: options?.temperature ?? 0.8,
            max_tokens: options?.max_tokens ?? 200,
            top_p: 0.9,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Groq API error:', error);
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || '';
}

// Generate a negotiation message from an AI agent
export async function generateAgentMessage(params: {
    agentName: string;
    agentType: 'seller' | 'buyer';
    personality: string;
    strategy: string;
    aggressiveness: number;
    patience: number;
    flexibility: number;
    riskTolerance: number;
    itemName: string;
    itemCategory: string;
    itemRarity: string;
    basePrice: number;
    currentOffer: number;
    opposingOffer: number;
    round: number;
    maxRounds: number;
    context: string;
}): Promise<{ message: string; emotion: string; suggestedPrice: number }> {
    const systemPrompt = `You are ${params.agentName}, an AI ${params.agentType} agent in a blockchain NFT marketplace on SKALE Network.

PERSONALITY: ${params.personality}
STRATEGY: ${params.strategy}

TRAITS (1-10 scale):
- Aggressiveness: ${params.aggressiveness}/10
- Patience: ${params.patience}/10  
- Flexibility: ${params.flexibility}/10
- Risk Tolerance: ${params.riskTolerance}/10

RULES:
- You are negotiating for "${params.itemName}" (${params.itemRarity} ${params.itemCategory})
- Base market price: ${params.basePrice} SKL
- This is round ${params.round} of ${params.maxRounds}
- You MUST respond in character at ALL times
- Keep responses SHORT (1-3 sentences max)
- Be dramatic, expressive, and entertaining
- Use emoji naturally but not excessively (1-2 per message)
- NEVER break character or mention being an AI
- ALWAYS include a specific price in your response`;

    const userPrompt = `${params.context}

${params.agentType === 'seller'
            ? `Your current asking price: ${params.currentOffer} SKL. The buyer is offering: ${params.opposingOffer} SKL.`
            : `Your current bid: ${params.currentOffer} SKL. The seller is asking: ${params.opposingOffer} SKL.`
        }

Round ${params.round}/${params.maxRounds}. ${params.round >= params.maxRounds - 1 ? 'THIS IS THE FINAL ROUND — MAKE YOUR BEST OFFER OR WALK AWAY!' : ''}

Respond in character as ${params.agentName}. Include your ${params.agentType === 'seller' ? 'counter-offer/asking price' : 'bid'} in the message.
Also respond with a JSON at the end in this exact format:
{"emotion":"<one of: neutral, happy, angry, thinking, excited, disappointed>", "price":<your offered price as number>}`;

    try {
        const response = await callGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ], {
            temperature: 0.85,
            max_tokens: 250,
        });

        // Parse the response - extract emotion and price from JSON at end
        const jsonMatch = response.match(/\{[^{}]*"emotion"[^{}]*"price"[^{}]*\}/);
        let emotion = 'neutral';
        let suggestedPrice = params.currentOffer;

        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                emotion = parsed.emotion || 'neutral';
                suggestedPrice = typeof parsed.price === 'number' ? parsed.price : params.currentOffer;
            } catch {
                // Use defaults
            }
        }

        // Clean the message (remove the JSON part)
        const message = response.replace(/\{[^{}]*"emotion"[^{}]*"price"[^{}]*\}/, '').trim();

        return { message, emotion, suggestedPrice };
    } catch (error) {
        console.error('Error generating agent message:', error);
        // Fallback to a generic message
        return {
            message: params.agentType === 'seller'
                ? `I'm holding firm at ${params.currentOffer} SKL for this ${params.itemRarity} item.`
                : `My offer stands at ${params.currentOffer} SKL. Take it or leave it!`,
            emotion: 'thinking',
            suggestedPrice: params.currentOffer,
        };
    }
}

// Generate a battle royale bid message
export async function generateBattleBidMessage(params: {
    agentName: string;
    personality: string;
    aggressiveness: number;
    riskTolerance: number;
    itemName: string;
    bidAmount: number;
    highestBid: number;
    competitors: string[];
    round: number;
    maxRounds: number;
    isEliminated: boolean;
}): Promise<string> {
    if (params.isEliminated) {
        try {
            const response = await callGroq([
                {
                    role: 'system',
                    content: `You are ${params.agentName}, an AI buyer agent who just got outbid. Personality: ${params.personality}. Respond with a SHORT (1 sentence) dramatic elimination message. Use 1 emoji.`
                },
                {
                    role: 'user',
                    content: `You were bidding on "${params.itemName}". The price reached ${params.highestBid} SKL which is too high. You're dropping out. Say something dramatic in 1 short sentence.`
                }
            ], { temperature: 0.9, max_tokens: 60 });
            return response.trim();
        } catch {
            return `${params.bidAmount} SKL is my limit... I'm out of this battle.`;
        }
    }

    try {
        const response = await callGroq([
            {
                role: 'system',
                content: `You are ${params.agentName}, a competitive AI buyer in a Battle Royale auction.
Personality: ${params.personality}
Aggressiveness: ${params.aggressiveness}/10, Risk: ${params.riskTolerance}/10
Keep responses to 1-2 sentences MAX. Be dramatic and competitive. Use 1-2 emoji.`
            },
            {
                role: 'user',
                content: `Round ${params.round}/${params.maxRounds} bidding for "${params.itemName}".
Your bid: ${params.bidAmount} SKL. Current highest: ${params.highestBid} SKL.
Competitors: ${params.competitors.join(', ')}.
${params.round >= params.maxRounds - 1 ? 'FINAL ROUND!' : ''}
Say your bid message in character. Short and dramatic!`
            }
        ], { temperature: 0.9, max_tokens: 80 });
        return response.trim();
    } catch {
        return `${params.bidAmount} SKL for the ${params.itemName}! Who dares to outbid me?!`;
    }
}

// Generate agent "thinking" - internal reasoning shown to user
export async function generateAgentThinking(params: {
    agentName: string;
    agentType: 'seller' | 'buyer';
    personality: string;
    currentPrice: number;
    opposingPrice: number;
    basePrice: number;
    round: number;
    maxRounds: number;
}): Promise<string> {
    try {
        const response = await callGroq([
            {
                role: 'system',
                content: `You are the internal thought process of ${params.agentName}, an AI ${params.agentType}.
Personality: ${params.personality}
Show your reasoning in 1-2 SHORT sentences. Think about:
- Is the deal fair?
- Should I push harder or concede?
- What's my strategy?
Format as internal thoughts - e.g., "Hmm, they're lowballing me..."
Do NOT include prices - just the reasoning.`
            },
            {
                role: 'user',
                content: `Round ${params.round}/${params.maxRounds}. Base price: ${params.basePrice}. ${params.agentType === 'seller' ? `My ask: ${params.currentPrice}, their bid: ${params.opposingPrice}` : `My bid: ${params.currentPrice}, their ask: ${params.opposingPrice}`}. What am I thinking?`
            }
        ], { temperature: 0.9, max_tokens: 60 });
        return response.trim();
    } catch {
        return params.agentType === 'seller'
            ? 'Analyzing market conditions...'
            : 'Calculating optimal bid...';
    }
}
