import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// SKALE Nebula Testnet
export const skaleNebulaTestnet = defineChain({
  id: 37084624,
  name: "SKALE Nebula Hub Testnet",
  nativeCurrency: {
    name: "sFUEL",
    symbol: "sFUEL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/lanky-ill-funny-testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com",
    },
  },
  testnet: true,
});

// SKALE Nebula Mainnet (for future use)
export const skaleNebula = defineChain({
  id: 1482601649,
  name: "SKALE Nebula Hub",
  nativeCurrency: {
    name: "sFUEL",
    symbol: "sFUEL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"],
    },
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com",
    },
  },
  testnet: false,
});

export const config = getDefaultConfig({
  appName: "AGENTS.OS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [skaleNebulaTestnet],
  ssr: true,
});

// Contract address — deployed on SKALE Nebula Testnet
export const MARKETPLACE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x49Ee39851956df07E5d3B430dC91e5A00B7E6059";
