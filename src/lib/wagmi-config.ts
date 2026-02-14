import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "viem/chains";

// Base Sepolia Testnet (Chain ID: 84532)
// Using viem's built-in Base Sepolia chain definition
export { baseSepolia };

// Base Mainnet (for future use)
// import { base } from "viem/chains";

export const config = getDefaultConfig({
  appName: "AGENTS.OS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [baseSepolia],
  ssr: true,
});

// Contract address — deployed on Base Sepolia Testnet
export const MARKETPLACE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x49Ee39851956df07E5d3B430dC91e5A00B7E6059";
