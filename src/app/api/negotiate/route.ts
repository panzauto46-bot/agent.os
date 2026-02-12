import { NextRequest, NextResponse } from "next/server";

/**
 * AI Negotiation API — "The Brain"
 * Agent A (Seller) and Agent B (Buyer) negotiate via this endpoint.
 * Each call = one round of negotiation.
 */

interface NegotiateRequest {
  sellerId: string;
  buyerId: string;
  sellerName: string;
  buyerName: string;
  sellerPersonality: string;
  buyerPersonality: string;
  itemName: string;
  itemRarity: string;
  basePrice: number;
  currentAskPrice: number;
  currentBidPrice: number;
  round: number;
  maxRounds: number;
  history: Array<{ agent: string; message: string; offer?: number }>;
}

interface NegotiateResponse {
  sellerMessage: string;
  buyerMessage: string;
  newAskPrice: number;
  newBidPrice: number;
  sellerEmotion: string;
  buyerEmotion: string;
  dealReached: boolean;
  dealFailed: boolean;
  finalPrice?: number;
}

// Seller response templates based on spread
const SELLER_TEMPLATES = {
  high_spread: [
    "Hmm, {offer} SKL? That's insulting for a {rarity} {item}! Best I can do is {counter} SKL.",
    "{offer} SKL?! You must be joking. {counter} SKL, take it or leave it.",
    "LOL {offer}? This is premium quality. {counter} SKL minimum.",
  ],
  mid_spread: [
    "Getting warmer! {offer} is decent but I need {counter} SKL. We can make this work!",
    "I appreciate {offer} SKL. How about {counter}? Fair for both of us.",
    "{offer} is tempting... tell you what, {counter} SKL and it's yours.",
  ],
  deal_close: [
    "DEAL! {price} SKL! Smart Contract executing... pleasure doing business!",
    "SOLD for {price} SKL! Contract deploying... enjoy your new {item}!",
    "{price} SKL works! Let's lock it in! Initiating contract...",
  ],
  reject: [
    "Sorry, can't go that low for this {item}. Maybe next time!",
    "We're too far apart. I'll find another buyer.",
    "No deal. This {item} deserves a better price. Goodbye!",
  ],
};

// Buyer response templates
const BUYER_TEMPLATES = {
  high_spread: [
    "{ask} SKL? Way too high! My data says {counter} SKL is fair for this {rarity}.",
    "Nah {ask} is overpriced. {counter} SKL and that's generous.",
    "In THIS market?! {counter} SKL max. I have other options.",
  ],
  mid_spread: [
    "OK I can go to {counter} SKL. We're almost there!",
    "Let me bump to {counter} SKL. Fair compromise right?",
    "Fine, {counter} SKL. That's my best offer. Take it!",
  ],
  deal_close: [
    "DEAL! {price} SKL! Sending payment via smart contract now!",
    "{price} SKL accepted! Contract executing... can't wait!",
    "Done! {price} SKL is fair. Payment incoming!",
  ],
  reject: [
    "Too expensive. Gonna find a better deal elsewhere.",
    "Can't justify that price. My algorithm says PASS.",
    "Not happening at those numbers. I gotta walk.",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function processNegotiation(req: NegotiateRequest): NegotiateResponse {
  const {
    itemName,
    itemRarity,
    basePrice,
    currentAskPrice,
    currentBidPrice,
    round,
    maxRounds,
  } = req;

  const spread = currentAskPrice - currentBidPrice;
  const spreadPct = spread / currentAskPrice;
  const midPoint = (currentAskPrice + currentBidPrice) / 2;

  // Concession dynamics
  const pressure = round / maxRounds;
  const sellerConcession =
    currentAskPrice * (0.03 + pressure * 0.06) * (0.8 + Math.random() * 0.4);
  const buyerConcession =
    currentBidPrice * (0.04 + pressure * 0.08) * (0.8 + Math.random() * 0.4);

  const newAsk = Math.max(currentAskPrice - sellerConcession, midPoint * 0.9);
  const newBid = Math.min(currentBidPrice + buyerConcession, midPoint * 1.1);

  const newSpread = newAsk - newBid;
  const dealThreshold = basePrice * 0.08;

  // Check deal
  if (newSpread <= dealThreshold || round >= maxRounds - 1) {
    if (newSpread <= basePrice * 0.3 || round >= maxRounds - 1) {
      const finalPrice = Math.round(((newAsk + newBid) / 2) * 10) / 10;
      return {
        sellerMessage: pickRandom(SELLER_TEMPLATES.deal_close)
          .replace("{price}", finalPrice.toFixed(1))
          .replace("{item}", itemName),
        buyerMessage: pickRandom(BUYER_TEMPLATES.deal_close)
          .replace("{price}", finalPrice.toFixed(1))
          .replace("{item}", itemName),
        newAskPrice: newAsk,
        newBidPrice: newBid,
        sellerEmotion: "excited",
        buyerEmotion: "happy",
        dealReached: true,
        dealFailed: false,
        finalPrice,
      };
    } else {
      return {
        sellerMessage: pickRandom(SELLER_TEMPLATES.reject).replace(
          "{item}",
          itemName
        ),
        buyerMessage: pickRandom(BUYER_TEMPLATES.reject),
        newAskPrice: newAsk,
        newBidPrice: newBid,
        sellerEmotion: "disappointed",
        buyerEmotion: "angry",
        dealReached: false,
        dealFailed: true,
      };
    }
  }

  // Regular round
  const isHighSpread = spreadPct > 0.35;
  const sellerTemplates = isHighSpread
    ? SELLER_TEMPLATES.high_spread
    : SELLER_TEMPLATES.mid_spread;
  const buyerTemplates = isHighSpread
    ? BUYER_TEMPLATES.high_spread
    : BUYER_TEMPLATES.mid_spread;

  const sellerMsg = pickRandom(sellerTemplates)
    .replace("{offer}", currentBidPrice.toFixed(1))
    .replace("{counter}", newAsk.toFixed(1))
    .replace("{item}", itemName)
    .replace("{rarity}", itemRarity);

  const buyerMsg = pickRandom(buyerTemplates)
    .replace("{ask}", newAsk.toFixed(1))
    .replace("{counter}", newBid.toFixed(1))
    .replace("{item}", itemName)
    .replace("{rarity}", itemRarity);

  return {
    sellerMessage: sellerMsg,
    buyerMessage: buyerMsg,
    newAskPrice: Math.round(newAsk * 10) / 10,
    newBidPrice: Math.round(newBid * 10) / 10,
    sellerEmotion: isHighSpread ? "angry" : "thinking",
    buyerEmotion: isHighSpread ? "angry" : "thinking",
    dealReached: false,
    dealFailed: false,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: NegotiateRequest = await request.json();

    // Validate required fields
    if (!body.sellerName || !body.buyerName || !body.itemName) {
      return NextResponse.json(
        { error: "Missing required fields: sellerName, buyerName, itemName" },
        { status: 400 }
      );
    }

    const result = processNegotiation(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Negotiation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "AGENTS.OS Negotiation API",
    version: "1.0.0",
    description: "AI Agent-to-Agent Negotiation Engine",
    endpoints: {
      "POST /api/negotiate": "Execute one round of negotiation between seller and buyer agents",
    },
  });
}
