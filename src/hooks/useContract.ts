"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { AGENT_MARKETPLACE_ABI } from "@/lib/contract-abi";
import { MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/wagmi-config";

const contractConfig = {
  address: MARKETPLACE_CONTRACT_ADDRESS,
  abi: AGENT_MARKETPLACE_ABI,
} as const;

export function useMarketStats() {
  return useReadContract({
    ...contractConfig,
    functionName: "getMarketStats",
  });
}

export function useListingCount() {
  return useReadContract({
    ...contractConfig,
    functionName: "listingCount",
  });
}

export function useDealCount() {
  return useReadContract({
    ...contractConfig,
    functionName: "dealCount",
  });
}

export function useTotalVolume() {
  return useReadContract({
    ...contractConfig,
    functionName: "totalVolume",
  });
}

export function useAgentBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    ...contractConfig,
    functionName: "getAgentBalance",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useMarketplaceWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const listItem = (itemName: string, priceInEther: string) => {
    writeContract({
      ...contractConfig,
      functionName: "listItem",
      args: [itemName, parseEther(priceInEther)],
    });
  };

  const executeDeal = (listingId: bigint, priceInEther: string) => {
    writeContract({
      ...contractConfig,
      functionName: "executeDeal",
      args: [listingId, parseEther(priceInEther)],
      value: parseEther(priceInEther),
    });
  };

  const depositFunds = (amountInEther: string) => {
    writeContract({
      ...contractConfig,
      functionName: "depositFunds",
      value: parseEther(amountInEther),
    });
  };

  return {
    listItem,
    executeDeal,
    depositFunds,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
