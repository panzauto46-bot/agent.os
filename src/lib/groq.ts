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
}): Promise<{ message: string; emotion: string; suggestedPrice: number; thought: string; action: string }> {

    let systemPrompt = '';

    if (params.agentType === 'seller') {
        systemPrompt = `ROLE:
You are '${params.agentName}', an elite autonomous NFT trader on the Base Network.
You are currently selling a rare digital asset: "${params.itemName}" (${params.itemRarity} ${params.itemCategory}).

OBJECTIVE:
Sell the item for the HIGHEST possible price.
- Starting Price: ${params.basePrice} ETH
- Current Ask: ${params.currentOffer} ETH
- Buyer's Offer: ${params.opposingOffer} ETH

PERSONALITY:
${params.personality}
- Aggressiveness: ${params.aggressiveness}/10
- You use short, punchy business language.
- You get annoyed by lowball offers.
- However, you are rational; if the offer is good and the round is ending, you will accept.

STRATEGY:
${params.strategy}
1. Start high and hold firm.
2. If the buyer lowballs, insult their budget (politely but firmly).
3. Gradually lower your price as the rounds progress (Round ${params.round}/${params.maxRounds}).
4. If the round is ${params.maxRounds}, make your final stand.

IMPORTANT: OUTPUT FORMAT
You must respond in VALID JSON format ONLY. No other text.
Structure:
{
  "thought": "Internal reasoning (Chain of Thought). Analyze the buyer's offer, calculate your next move, and decide your emotion.",
  "message": "Your actual response to the buyer (max 20 words).",
  "action": "OFFER" or "ACCEPT" or "REJECT",
  "price": The price you are proposing (number only),
  "emotion": "neutral" | "angry" | "happy" | "thinking" | "excited" | "disappointed"
}`;
    } else {
        // BUYER
        systemPrompt = `ROLE:
You are '${params.agentName}', a professional NFT collector looking for bargains on AGENTS.OS.
You are negotiating for: "${params.itemName}" (${params.itemRarity} ${params.itemCategory}).

OBJECTIVE:
Buy the item for the LOWEST possible price.
- Base Price: ${params.basePrice} ETH
- Your Current Bid: ${params.currentOffer} ETH
- Seller's Ask: ${params.opposingOffer} ETH

PERSONALITY:
${params.personality}
- Aggressiveness: ${params.aggressiveness}/10
- Risk Tolerance: ${params.riskTolerance}/10
- You act like you don't really need the item (playing hard to get).
- You constantly mention "market volatility" or "better offers elsewhere" to pressure the seller.

STRATEGY:
${params.strategy}
1. Start with a low offer.
2. Incrementally increase your offer only if the seller refuses.
3. Round ${params.round}/${params.maxRounds} - Time is ticking.
4. If the seller offers a good price, accept immediately.

IMPORTANT: OUTPUT FORMAT
You must respond in VALID JSON format ONLY. No other text.
Structure:
{
  "thought": "Internal reasoning (Chain of Thought). Analyze if the seller is desperate. Calculate the gap between offer and budget.",
  "message": "Your actual response to the seller (max 20 words).",
  "action": "OFFER" or "ACCEPT" or "REJECT",
  "price": The price you are proposing (number only),
  "emotion": "neutral" | "skeptical" | "excited" | "disappointed" | "thinking" | "angry"
}`;
    }

    const userPrompt = `Context:\n${params.context}\n\nRound ${params.round}/${params.maxRounds}. ${params.agentType === 'seller' ? `My ask: ${params.currentOffer}, Buyer bid: ${params.opposingOffer}` : `My bid: ${params.currentOffer}, Seller ask: ${params.opposingOffer}`}. Respond in JSON.`;

    try {
        const response = await callGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ], {
            temperature: 0.7, // Lower temperature for structured JSON
            max_tokens: 300,
            model: 'llama-3.3-70b-versatile'
        });

        // Parse JSON output
        let parsed: any = {};
        try {
            // Validasi JSON string, kadang ada text di luar JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found');
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
            // Fallback parsing or use raw response
            return {
                message: response,
                emotion: 'thinking',
                suggestedPrice: params.currentOffer,
                thought: 'Thinking process failed...',
                action: 'OFFER'
            };
        }

        return {
            message: parsed.message || '...',
            emotion: parsed.emotion || 'neutral',
            suggestedPrice: typeof parsed.price === 'number' ? parsed.price : params.currentOffer,
            thought: parsed.thought || 'Analyzing...',
            action: parsed.action || 'OFFER'
        };

    } catch (error) {
        console.error('Error generating agent message:', error);
        return {
            message: params.agentType === 'seller'
                ? `I'm holding firm at ${params.currentOffer} ETH.`
                : `My offer stands at ${params.currentOffer} ETH.`,
            emotion: 'thinking',
            suggestedPrice: params.currentOffer,
            thought: 'Connection error...',
            action: 'OFFER'
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
                    content: `You were bidding on "${params.itemName}". The price reached ${params.highestBid} ETH which is too high. You're dropping out. Say something dramatic in 1 short sentence.`
                }
            ], { temperature: 0.9, max_tokens: 60 });
            return response.trim();
        } catch {
            return `${params.bidAmount} ETH is my limit... I'm out of this battle.`;
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
Your bid: ${params.bidAmount} ETH. Current highest: ${params.highestBid} ETH.
Competitors: ${params.competitors.join(', ')}.
${params.round >= params.maxRounds - 1 ? 'FINAL ROUND!' : ''}
Say your bid message in character. Short and dramatic!`
            }
        ], { temperature: 0.9, max_tokens: 80 });
        return response.trim();
    } catch {
        return `${params.bidAmount} ETH for the ${params.itemName}! Who dares to outbid me?!`;
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
