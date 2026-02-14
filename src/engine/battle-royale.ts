import { v4 as uuidv4 } from 'uuid';
import type { Agent, NFTItem, BattleRoyaleSession, BattleBid, SmartContractExecution } from '../types';

const BATTLE_MESSAGES = {
    opening: [
        "🔥 I'm going ALL IN on this {item}! Opening bid: {bid} ETH!",
        "💰 {item} is MINE! Starting at {bid} ETH — try to beat me!",
        "📊 Data analysis says {bid} ETH is fair. My opening bid.",
        "🎯 I want that {item}. Placing {bid} ETH on the table NOW.",
        "⚡ Let's go! {bid} ETH for the {item}. Who dares to outbid?",
    ],
    outbid: [
        "😤 Not so fast! Raising to {bid} ETH! This {item} is MINE!",
        "🔥 Oh you want war? Fine! {bid} ETH! Beat THAT!",
        "💪 I'm not backing down! {bid} ETH — your move!",
        "📈 Algorithm says bid more. Going {bid} ETH! Come at me!",
        "🚀 {bid} ETH! I've got the budget and the will to WIN!",
    ],
    winning: [
        "😏 That's what I thought! {bid} ETH and nobody can touch me!",
        "🏆 Leading at {bid} ETH! Say goodbye to this {item}!",
        "🎉 {bid} ETH stands! Anyone else? ...Didn't think so!",
        "✨ The {item} knows who its real owner should be. Me. {bid} ETH.",
    ],
    eliminated: [
        "😔 Too rich for my blood at {bid} ETH. I'm out...",
        "💸 Can't justify {bid} ETH. Walking away from this one.",
        "🤷 My algorithm says STOP at {bid} ETH. Good luck to the rest!",
        "😩 Budget exceeded! {bid} ETH is beyond my range. GG!",
    ],
    finalBid: [
        "🔥 ALL OR NOTHING! FINAL BID: {bid} ETH for the {item}!",
        "💎 THIS IS IT! {bid} ETH — my absolute maximum!",
        "⚡ LAST CHANCE! {bid} ETH — take it or leave it!",
    ],
};

function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

export function createBattleSession(
    seller: Agent,
    buyers: Agent[],
    item: NFTItem
): BattleRoyaleSession {
    return {
        id: uuidv4(),
        sellerId: seller.id,
        buyerIds: buyers.map(b => b.id),
        itemId: item.id,
        status: 'waiting',
        bids: [],
        currentRound: 0,
        maxRounds: 5,
        startedAt: Date.now(),
    };
}

interface BattleStep {
    bids: BattleBid[];
    contractEvents: SmartContractExecution[];
    sessionUpdate: Partial<BattleRoyaleSession>;
    systemMessage: string;
}

export function processBattleRound(
    session: BattleRoyaleSession,
    seller: Agent,
    buyers: Agent[],
    item: NFTItem
): BattleStep {
    const round = session.currentRound;
    const maxRounds = session.maxRounds;
    const newBids: BattleBid[] = [];
    const contractEvents: SmartContractExecution[] = [];

    // Get active buyers (not eliminated)
    const eliminatedIds = new Set(
        session.bids.filter(b => b.eliminated).map(b => b.buyerId)
    );
    const activeBuyers = buyers.filter(b => !eliminatedIds.has(b.id));

    if (activeBuyers.length === 0) {
        return {
            bids: [],
            contractEvents: [],
            sessionUpdate: {
                status: 'cancelled',
                currentRound: round + 1,
                completedAt: Date.now(),
            },
            systemMessage: '❌ BATTLE CANCELLED — All buyers eliminated!',
        };
    }

    // Find current highest bid
    const currentHighest = session.bids.length > 0
        ? Math.max(...session.bids.filter(b => !b.eliminated).map(b => b.amount))
        : item.currentPrice * 0.4;

    // Round 0: Opening bids
    if (round === 0) {
        activeBuyers.forEach((buyer, idx) => {
            const baseBid = item.currentPrice * (0.35 + Math.random() * 0.25);
            const personalityMultiplier = buyer.customization.aggressiveness / 10;
            const bid = baseBid * (0.8 + personalityMultiplier * 0.4);

            const message = randomPick(BATTLE_MESSAGES.opening)
                .replace('{item}', item.name)
                .replace('{bid}', bid.toFixed(1));

            newBids.push({
                id: uuidv4(),
                buyerId: buyer.id,
                buyerName: buyer.name,
                amount: Math.round(bid * 10) / 10,
                round: 0,
                timestamp: Date.now() + idx * 200,
                message,
                emotion: '🔥',
                eliminated: false,
            });
        });

        const highest = Math.max(...newBids.map(b => b.amount));

        return {
            bids: newBids,
            contractEvents: [],
            sessionUpdate: {
                status: 'bidding',
                currentRound: 1,
                bids: [...session.bids, ...newBids],
            },
            systemMessage: `🏟️ BATTLE ROYALE ROUND 1/${maxRounds} | ${activeBuyers.length} buyers competing | Highest bid: ${highest.toFixed(1)} ETH`,
        };
    }

    // Last round — determine winner
    if (round >= maxRounds - 1) {
        // Final bids
        activeBuyers.forEach((buyer, idx) => {
            const prevBids = session.bids.filter(b => b.buyerId === buyer.id && !b.eliminated);
            const lastBid = prevBids.length > 0 ? prevBids[prevBids.length - 1].amount : currentHighest;
            const urgency = buyer.customization.aggressiveness / 10;
            const finalBid = lastBid * (1.05 + urgency * 0.15);

            const message = randomPick(BATTLE_MESSAGES.finalBid)
                .replace('{item}', item.name)
                .replace('{bid}', finalBid.toFixed(1));

            newBids.push({
                id: uuidv4(),
                buyerId: buyer.id,
                buyerName: buyer.name,
                amount: Math.round(finalBid * 10) / 10,
                round,
                timestamp: Date.now() + idx * 200,
                message,
                emotion: '⚡',
                eliminated: false,
            });
        });

        // Find winner
        const allBids = [...session.bids.filter(b => !b.eliminated), ...newBids];
        const sortedBids = [...allBids].sort((a, b) => b.amount - a.amount);
        const winner = sortedBids[0];

        if (winner) {
            const blockNum = 18000000 + Math.floor(Math.random() * 100000);
            contractEvents.push(
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'escrow_created',
                    fromAgent: winner.buyerName,
                    toAgent: 'Battle Escrow',
                    amount: winner.amount,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 500,
                    status: 'confirmed',
                    blockNumber: blockNum,
                    gasUsed: 55000 + Math.floor(Math.random() * 10000),
                },
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'payment_sent',
                    fromAgent: 'Battle Escrow',
                    toAgent: seller.name,
                    amount: winner.amount,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 600,
                    status: 'confirmed',
                    blockNumber: blockNum + 1,
                    gasUsed: 21000 + Math.floor(Math.random() * 5000),
                },
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'item_transferred',
                    fromAgent: seller.name,
                    toAgent: winner.buyerName,
                    amount: 0,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 700,
                    status: 'confirmed',
                    blockNumber: blockNum + 2,
                    gasUsed: 65000 + Math.floor(Math.random() * 15000),
                },
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'deal_completed',
                    fromAgent: 'Battle Royale Protocol',
                    toAgent: 'Marketplace',
                    amount: winner.amount,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 800,
                    status: 'confirmed',
                    blockNumber: blockNum + 3,
                    gasUsed: 35000 + Math.floor(Math.random() * 8000),
                }
            );

            return {
                bids: newBids,
                contractEvents,
                sessionUpdate: {
                    status: 'completed',
                    currentRound: round + 1,
                    bids: [...session.bids, ...newBids],
                    winnerId: winner.buyerId,
                    winningPrice: winner.amount,
                    completedAt: Date.now(),
                },
                systemMessage: `🏆 BATTLE ROYALE WINNER: ${winner.buyerName} at ${winner.amount.toFixed(1)} ETH! Contract executing...`,
            };
        }
    }

    // Regular bidding round — each active buyer bids
    let eliminatedThisRound: string[] = [];

    activeBuyers.forEach((buyer, idx) => {
        const prevBids = session.bids.filter(b => b.buyerId === buyer.id && !b.eliminated);
        const lastBid = prevBids.length > 0 ? prevBids[prevBids.length - 1].amount : currentHighest * 0.5;

        // Decide whether to bid higher or drop out
        const maxBudgetRatio = (buyer.customization.riskTolerance + buyer.customization.aggressiveness) / 20;
        const maxBudget = item.currentPrice * (0.8 + maxBudgetRatio * 0.6);

        const increment = currentHighest * (0.03 + (buyer.customization.aggressiveness / 10) * 0.12);
        let newBid = Math.max(lastBid, currentHighest) + increment;
        newBid = Math.round(newBid * 10) / 10;

        if (newBid > maxBudget || newBid > buyer.balance) {
            // Eliminated!
            const message = randomPick(BATTLE_MESSAGES.eliminated)
                .replace('{bid}', currentHighest.toFixed(1))
                .replace('{item}', item.name);

            newBids.push({
                id: uuidv4(),
                buyerId: buyer.id,
                buyerName: buyer.name,
                amount: lastBid,
                round,
                timestamp: Date.now() + idx * 200,
                message,
                emotion: '😔',
                eliminated: true,
            });
            eliminatedThisRound.push(buyer.id);
        } else {
            const isHighest = newBid >= currentHighest;
            const messagePool = isHighest ? BATTLE_MESSAGES.winning : BATTLE_MESSAGES.outbid;
            const message = randomPick(messagePool)
                .replace('{bid}', newBid.toFixed(1))
                .replace('{item}', item.name);

            newBids.push({
                id: uuidv4(),
                buyerId: buyer.id,
                buyerName: buyer.name,
                amount: newBid,
                round,
                timestamp: Date.now() + idx * 200,
                message,
                emotion: isHighest ? '😏' : '😤',
                eliminated: false,
            });
        }
    });

    const remainingAfter = activeBuyers.length - eliminatedThisRound.length;
    const highest = Math.max(...newBids.filter(b => !b.eliminated).map(b => b.amount), 0);

    // If only 1 buyer remaining, they win automatically
    if (remainingAfter <= 1 && highest > 0) {
        const winnerBid = newBids.find(b => !b.eliminated);
        if (winnerBid) {
            const blockNum = 18000000 + Math.floor(Math.random() * 100000);
            contractEvents.push(
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'escrow_created',
                    fromAgent: winnerBid.buyerName,
                    toAgent: 'Battle Escrow',
                    amount: winnerBid.amount,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 500,
                    status: 'confirmed',
                    blockNumber: blockNum,
                    gasUsed: 55000,
                },
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'payment_sent',
                    fromAgent: 'Battle Escrow',
                    toAgent: seller.name,
                    amount: winnerBid.amount,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 600,
                    status: 'confirmed',
                    blockNumber: blockNum + 1,
                    gasUsed: 21000,
                },
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'item_transferred',
                    fromAgent: seller.name,
                    toAgent: winnerBid.buyerName,
                    amount: 0,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 700,
                    status: 'confirmed',
                    blockNumber: blockNum + 2,
                    gasUsed: 65000,
                },
                {
                    id: uuidv4(),
                    sessionId: session.id,
                    type: 'deal_completed',
                    fromAgent: 'Battle Royale Protocol',
                    toAgent: 'Marketplace',
                    amount: winnerBid.amount,
                    itemId: item.id,
                    txHash: generateTxHash(),
                    timestamp: Date.now() + 800,
                    status: 'confirmed',
                    blockNumber: blockNum + 3,
                    gasUsed: 35000,
                }
            );

            return {
                bids: newBids,
                contractEvents,
                sessionUpdate: {
                    status: 'completed',
                    currentRound: round + 1,
                    bids: [...session.bids, ...newBids],
                    winnerId: winnerBid.buyerId,
                    winningPrice: winnerBid.amount,
                    completedAt: Date.now(),
                },
                systemMessage: `🏆 LAST BUYER STANDING: ${winnerBid.buyerName} wins at ${winnerBid.amount.toFixed(1)} ETH!`,
            };
        }
    }

    return {
        bids: newBids,
        contractEvents,
        sessionUpdate: {
            currentRound: round + 1,
            bids: [...session.bids, ...newBids],
        },
        systemMessage: `🏟️ ROUND ${round + 1}/${maxRounds} | ${remainingAfter} buyers remaining | Highest: ${highest.toFixed(1)} ETH | ${eliminatedThisRound.length} eliminated`,
    };
}
