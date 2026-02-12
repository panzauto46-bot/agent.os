export const AGENT_MARKETPLACE_ABI = [
  // Events
  {
    type: "event",
    name: "ItemListed",
    inputs: [
      { name: "listingId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "itemName", type: "string", indexed: false },
      { name: "price", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "NegotiationStarted",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "listingId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DealCompleted",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DealCancelled",
    inputs: [{ name: "dealId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "FundsDeposited",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FundsWithdrawn",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  // Functions
  {
    type: "function",
    name: "listItem",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_itemName", type: "string" },
      { name: "_price", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "depositFunds",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "executeDeal",
    stateMutability: "payable",
    inputs: [
      { name: "_listingId", type: "uint256" },
      { name: "_agreedPrice", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "cancelListing",
    stateMutability: "nonpayable",
    inputs: [{ name: "_listingId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawFunds",
    stateMutability: "nonpayable",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getListing",
    stateMutability: "view",
    inputs: [{ name: "_listingId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "seller", type: "address" },
          { name: "itemName", type: "string" },
          { name: "price", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getDeal",
    stateMutability: "view",
    inputs: [{ name: "_dealId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "listingId", type: "uint256" },
          { name: "seller", type: "address" },
          { name: "buyer", type: "address" },
          { name: "agreedPrice", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "completed", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getAgentBalance",
    stateMutability: "view",
    inputs: [{ name: "_agent", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getMarketStats",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "_listings", type: "uint256" },
      { name: "_deals", type: "uint256" },
      { name: "_volume", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "listingCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "dealCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalVolume",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
