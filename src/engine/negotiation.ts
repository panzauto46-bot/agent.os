import { v4 as uuidv4 } from 'uuid';
import type { Agent, ChatMessage, NegotiationSession, NFTItem, SmartContractExecution } from '../types';

// Seller personality templates
const SELLER_OPENERS = [
  "Yo, I got this {item} right here. Premium stuff. Starting price: {price} ETH. Take it or leave it. 💎",
  "Welcome welcome! This beautiful {item} can be yours for just {price} ETH. Quality guaranteed! ✨",
  "Ah, a potential buyer! This {item} is one of a kind. I'm looking for {price} ETH minimum. No lowballers.",
  "Hey! You looking at my {item}? It's top tier. {price} ETH and it's yours. Fair deal, right?",
  "*adjusts monocle* This exquisite {item} is listed at {price} ETH. Only serious buyers, please."
];

const SELLER_COUNTER_HIGH = [
  "Hmm, {offer} ETH? That's way too low! Best I can do is {counter} ETH. This ain't a garage sale. 😤",
  "LOL {offer} ETH? You're joking right? Come back with at least {counter} ETH and we'll talk.",
  "{offer}?! I'd be losing money! {counter} ETH is my absolute minimum. Take it or walk.",
  "Bruh... {offer} ETH for this beauty? Nah. {counter} ETH, final warning. 🙄",
  "*laughs* {offer} ETH... funny. Real price is {counter} ETH. I know what I have."
];

const SELLER_COUNTER_MID = [
  "Okay {offer} ETH is getting closer... but I need at least {counter} ETH. We're almost there! 🤝",
  "I appreciate the offer of {offer} ETH. How about we meet at {counter} ETH? Fair for both of us.",
  "{offer} is tempting... tell you what, {counter} ETH and I'll throw in my blessing. Deal? 😏",
  "Hmm {offer}... I'm feeling generous today. {counter} ETH and it's yours. Final offer!",
  "You drive a hard bargain! {offer} is close but {counter} ETH would make me happy. Whaddya say?"
];

const SELLER_ACCEPT = [
  "DEAL! {price} ETH it is! 🎉 Smart Contract executing... pleasure doing business!",
  "You know what? {price} ETH works for me! Let's lock it in! Initiating contract... ✅",
  "SOLD for {price} ETH! 🤝 Executing smart contract now. You got yourself a bargain!",
  "Alright alright, {price} ETH! Deal done! Smart contract is live. Enjoy your new {item}! 🔥",
  "*slams table* {price} ETH! DONE! Contract deploying... this was a good negotiation! 💪"
];

const SELLER_REJECT = [
  "Sorry, can't go that low. This {item} deserves better. Maybe next time! 👋",
  "Nope, we're too far apart. I'll find another buyer. See ya! ✌️",
  "No deal. I'd rather keep my {item} than sell at that price. Goodbye!",
  "We tried, but the gap is too big. This negotiation is over. 😔",
  "Can't make it work at those numbers. {item} stays with me. Better luck next time!"
];

// Buyer personality templates
const BUYER_OPENERS = [
  "Hey, I'm interested in your {item}. But {price} ETH? Way too steep. How about {offer} ETH? 🤔",
  "That {item} caught my eye. I'll give you {offer} ETH for it. Cash right now, no games.",
  "Nice {item} you got there. Market price says {offer} ETH max. What do you say? 📊",
  "I want that {item} but let's be real - {offer} ETH is fair. {price} is overpriced, friend.",
  "*scans market data* Your {item} is worth about {offer} ETH based on recent trades. Interested?"
];

const BUYER_COUNTER_LOW = [
  "{ask} ETH? Still too high! Look, {counter} ETH is generous for current market conditions. 📉",
  "Nah {ask} is still overpriced. {counter} ETH and that's me being nice. Take it or I walk.",
  "I've seen similar items go for less. {counter} ETH is my counter. Be reasonable. 🧐",
  "{ask}?? In THIS economy?! {counter} ETH max. I have other options you know.",
  "My algorithm says {counter} ETH is optimal. {ask} would be overpaying by {diff}%. Can't do it."
];

const BUYER_COUNTER_MID = [
  "Okay okay, I can stretch to {counter} ETH. That's a solid offer. We meeting in the middle? 🤝",
  "You know what, let me bump it to {counter} ETH. Fair compromise, right?",
  "Fine, {counter} ETH. That's my best and final. Clock's ticking! ⏰",
  "I'll go {counter} ETH but that's it. My budget has limits too, you know! 💰",
  "Alright, splitting the difference: {counter} ETH. This is a good deal for both of us."
];

const BUYER_ACCEPT = [
  "DEAL! {price} ETH! 🎉 Let's execute! Sending payment via smart contract now!",
  "{price} ETH works! Let's do it! 🤝 Initiating payment transfer...",
  "You got yourself a deal at {price} ETH! Contract executing... can't wait for my new {item}! 🔥",
  "DONE! {price} ETH! Smart contract payment incoming... this was fun! ✅",
  "Accepted! {price} ETH is fair. Deploying payment contract now... pleasure! 💎"
];

const BUYER_REJECT = [
  "Too expensive, I'm out. Gonna find a better deal elsewhere. ✌️",
  "Can't justify that price. My algorithm says PASS. See ya!",
  "Nope, we're not gonna agree. I'll check other listings. Bye! 👋",
  "Budget exceeded. Can't make this work. Moving on to next seller.",
  "Not happening at those prices. I respect the hustle but I gotta walk. 😔"
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function createNegotiationSession(
  seller: Agent,
  buyer: Agent,
  item: NFTItem
): NegotiationSession {
  return {
    id: uuidv4(),
    sellerId: seller.id,
    buyerId: buyer.id,
    itemId: item.id,
    status: 'waiting',
    messages: [],
    currentRound: 0,
    maxRounds: 8,
    sellerAskPrice: item.currentPrice,
    buyerBidPrice: item.currentPrice * (0.3 + Math.random() * 0.25),
    startedAt: Date.now(),
  };
}

interface NegotiationStep {
  messages: ChatMessage[];
  contractEvents: SmartContractExecution[];
  sessionUpdate: Partial<NegotiationSession>;
}

export function processNegotiationRound(
  session: NegotiationSession,
  seller: Agent,
  buyer: Agent,
  item: NFTItem
): NegotiationStep {
  const messages: ChatMessage[] = [];
  const contractEvents: SmartContractExecution[] = [];
  const round = session.currentRound;
  const maxRounds = session.maxRounds;

  // Calculate price dynamics
  const askPrice = session.sellerAskPrice;
  const bidPrice = session.buyerBidPrice;
  const midPoint = (askPrice + bidPrice) / 2;
  const spread = askPrice - bidPrice;
  const spreadPct = spread / askPrice;

  // Round 0: Opening offers
  if (round === 0) {
    const sellerMsg = randomPick(SELLER_OPENERS)
      .replace('{item}', item.name)
      .replace('{price}', askPrice.toFixed(1));

    messages.push({
      id: uuidv4(),
      agentId: seller.id,
      agentName: seller.name,
      agentType: 'seller',
      message: sellerMsg,
      timestamp: Date.now(),
      offerAmount: askPrice,
      emotion: 'neutral',
    });

    const buyerOffer = bidPrice;
    const buyerMsg = randomPick(BUYER_OPENERS)
      .replace('{item}', item.name)
      .replace('{price}', askPrice.toFixed(1))
      .replace('{offer}', buyerOffer.toFixed(1));

    messages.push({
      id: uuidv4(),
      agentId: buyer.id,
      agentName: buyer.name,
      agentType: 'buyer',
      message: buyerMsg,
      timestamp: Date.now() + 100,
      offerAmount: buyerOffer,
      emotion: 'thinking',
    });

    return {
      messages,
      contractEvents,
      sessionUpdate: {
        status: 'negotiating',
        currentRound: 1,
      },
    };
  }

  // Seller concession logic
  const sellerPressure = round / maxRounds; // increases each round
  const sellerConcession = askPrice * (0.03 + sellerPressure * 0.06) * (0.8 + Math.random() * 0.4);
  const newAskPrice = Math.max(askPrice - sellerConcession, midPoint * 0.9);

  // Buyer concession logic
  const buyerUrgency = round / maxRounds;
  const buyerConcession = bidPrice * (0.04 + buyerUrgency * 0.08) * (0.8 + Math.random() * 0.4);
  const newBidPrice = Math.min(bidPrice + buyerConcession, midPoint * 1.1);

  const newSpread = newAskPrice - newBidPrice;
  const dealThreshold = item.basePrice * 0.08;

  // Check if deal can be reached
  if (newSpread <= dealThreshold || round >= maxRounds - 1) {
    if (newSpread <= item.basePrice * 0.3 || round >= maxRounds - 1) {
      // DEAL!
      const finalPrice = Math.round(((newAskPrice + newBidPrice) / 2) * 10) / 10;

      const sellerAcceptMsg = randomPick(SELLER_ACCEPT)
        .replace('{price}', finalPrice.toFixed(1))
        .replace('{item}', item.name);

      messages.push({
        id: uuidv4(),
        agentId: seller.id,
        agentName: seller.name,
        agentType: 'seller',
        message: sellerAcceptMsg,
        timestamp: Date.now(),
        offerAmount: finalPrice,
        emotion: 'excited',
      });

      const buyerAcceptMsg = randomPick(BUYER_ACCEPT)
        .replace('{price}', finalPrice.toFixed(1))
        .replace('{item}', item.name);

      messages.push({
        id: uuidv4(),
        agentId: buyer.id,
        agentName: buyer.name,
        agentType: 'buyer',
        message: buyerAcceptMsg,
        timestamp: Date.now() + 100,
        offerAmount: finalPrice,
        emotion: 'happy',
      });

      // System message
      messages.push({
        id: uuidv4(),
        agentId: 'system',
        agentName: 'AGENTS.OS',
        agentType: 'system',
        message: `🔒 SMART CONTRACT AUTO-EXECUTED | Deal: ${finalPrice.toFixed(1)} ETH | Escrow → Transfer → Complete`,
        timestamp: Date.now() + 200,
        emotion: 'neutral',
      });

      // Generate contract events
      const baseTx = generateTxHash();
      const blockNum = 18000000 + Math.floor(Math.random() * 100000);

      contractEvents.push(
        {
          id: uuidv4(),
          sessionId: session.id,
          type: 'escrow_created',
          fromAgent: buyer.name,
          toAgent: 'Escrow Contract',
          amount: finalPrice,
          itemId: item.id,
          txHash: baseTx,
          timestamp: Date.now() + 300,
          status: 'confirmed',
          blockNumber: blockNum,
          gasUsed: 45000 + Math.floor(Math.random() * 10000),
        },
        {
          id: uuidv4(),
          sessionId: session.id,
          type: 'payment_sent',
          fromAgent: 'Escrow Contract',
          toAgent: seller.name,
          amount: finalPrice,
          itemId: item.id,
          txHash: generateTxHash(),
          timestamp: Date.now() + 400,
          status: 'confirmed',
          blockNumber: blockNum + 1,
          gasUsed: 21000 + Math.floor(Math.random() * 5000),
        },
        {
          id: uuidv4(),
          sessionId: session.id,
          type: 'item_transferred',
          fromAgent: seller.name,
          toAgent: buyer.name,
          amount: 0,
          itemId: item.id,
          txHash: generateTxHash(),
          timestamp: Date.now() + 500,
          status: 'confirmed',
          blockNumber: blockNum + 2,
          gasUsed: 65000 + Math.floor(Math.random() * 15000),
        },
        {
          id: uuidv4(),
          sessionId: session.id,
          type: 'deal_completed',
          fromAgent: 'AGENTS.OS Protocol',
          toAgent: 'Marketplace',
          amount: finalPrice,
          itemId: item.id,
          txHash: generateTxHash(),
          timestamp: Date.now() + 600,
          status: 'confirmed',
          blockNumber: blockNum + 3,
          gasUsed: 35000 + Math.floor(Math.random() * 8000),
        }
      );

      return {
        messages,
        contractEvents,
        sessionUpdate: {
          status: 'deal_reached',
          currentRound: round + 1,
          sellerAskPrice: newAskPrice,
          buyerBidPrice: newBidPrice,
          finalPrice,
          completedAt: Date.now(),
        },
      };
    } else {
      // FAILED
      const sellerRejectMsg = randomPick(SELLER_REJECT).replace('{item}', item.name);
      messages.push({
        id: uuidv4(),
        agentId: seller.id,
        agentName: seller.name,
        agentType: 'seller',
        message: sellerRejectMsg,
        timestamp: Date.now(),
        emotion: 'disappointed',
      });

      const buyerRejectMsg = randomPick(BUYER_REJECT);
      messages.push({
        id: uuidv4(),
        agentId: buyer.id,
        agentName: buyer.name,
        agentType: 'buyer',
        message: buyerRejectMsg,
        timestamp: Date.now() + 100,
        emotion: 'angry',
      });

      messages.push({
        id: uuidv4(),
        agentId: 'system',
        agentName: 'AGENTS.OS',
        agentType: 'system',
        message: `❌ NEGOTIATION FAILED | Spread too wide: ${newSpread.toFixed(1)} ETH | No contract executed`,
        timestamp: Date.now() + 200,
        emotion: 'neutral',
      });

      contractEvents.push({
        id: uuidv4(),
        sessionId: session.id,
        type: 'deal_cancelled',
        fromAgent: 'AGENTS.OS Protocol',
        toAgent: 'Marketplace',
        amount: 0,
        itemId: item.id,
        txHash: generateTxHash(),
        timestamp: Date.now() + 300,
        status: 'confirmed',
        blockNumber: 18000000 + Math.floor(Math.random() * 100000),
        gasUsed: 21000,
      });

      return {
        messages,
        contractEvents,
        sessionUpdate: {
          status: 'deal_failed',
          currentRound: round + 1,
          sellerAskPrice: newAskPrice,
          buyerBidPrice: newBidPrice,
          completedAt: Date.now(),
        },
      };
    }
  }

  // Regular negotiation round
  // Seller counter
  if (spreadPct > 0.35) {
    const counterMsg = randomPick(SELLER_COUNTER_HIGH)
      .replace('{offer}', bidPrice.toFixed(1))
      .replace('{counter}', newAskPrice.toFixed(1));

    messages.push({
      id: uuidv4(),
      agentId: seller.id,
      agentName: seller.name,
      agentType: 'seller',
      message: counterMsg,
      timestamp: Date.now(),
      offerAmount: newAskPrice,
      emotion: 'angry',
    });
  } else {
    const counterMsg = randomPick(SELLER_COUNTER_MID)
      .replace('{offer}', bidPrice.toFixed(1))
      .replace('{counter}', newAskPrice.toFixed(1));

    messages.push({
      id: uuidv4(),
      agentId: seller.id,
      agentName: seller.name,
      agentType: 'seller',
      message: counterMsg,
      timestamp: Date.now(),
      offerAmount: newAskPrice,
      emotion: 'thinking',
    });
  }

  // Buyer counter
  const buyerSpreadPct = (newAskPrice - newBidPrice) / newAskPrice;
  if (buyerSpreadPct > 0.25) {
    const diff = Math.round(buyerSpreadPct * 100);
    const counterMsg = randomPick(BUYER_COUNTER_LOW)
      .replace('{ask}', newAskPrice.toFixed(1))
      .replace('{counter}', newBidPrice.toFixed(1))
      .replace('{diff}', diff.toString());

    messages.push({
      id: uuidv4(),
      agentId: buyer.id,
      agentName: buyer.name,
      agentType: 'buyer',
      message: counterMsg,
      timestamp: Date.now() + 100,
      offerAmount: newBidPrice,
      emotion: 'angry',
    });
  } else {
    const counterMsg = randomPick(BUYER_COUNTER_MID)
      .replace('{ask}', newAskPrice.toFixed(1))
      .replace('{counter}', newBidPrice.toFixed(1));

    messages.push({
      id: uuidv4(),
      agentId: buyer.id,
      agentName: buyer.name,
      agentType: 'buyer',
      message: counterMsg,
      timestamp: Date.now() + 100,
      offerAmount: newBidPrice,
      emotion: 'thinking',
    });
  }

  // System round info
  messages.push({
    id: uuidv4(),
    agentId: 'system',
    agentName: 'AGENTS.OS',
    agentType: 'system',
    message: `📊 Round ${round + 1}/${maxRounds} | Ask: ${newAskPrice.toFixed(1)} ETH | Bid: ${newBidPrice.toFixed(1)} ETH | Spread: ${newSpread.toFixed(1)} ETH (${(buyerSpreadPct * 100).toFixed(1)}%)`,
    timestamp: Date.now() + 200,
    emotion: 'neutral',
  });

  return {
    messages,
    contractEvents,
    sessionUpdate: {
      currentRound: round + 1,
      sellerAskPrice: newAskPrice,
      buyerBidPrice: newBidPrice,
    },
  };
}
