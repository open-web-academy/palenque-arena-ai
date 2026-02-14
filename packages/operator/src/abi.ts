// Contract ABIs for Monad
export const FACTORY_ABI = [
  {
    type: "function",
    name: "createMatch",
    inputs: [
      { name: "roosterA", type: "string" },
      { name: "roosterB", type: "string" },
      { name: "startTime", type: "uint256" },
      { name: "closeDuration", type: "uint256" },
    ],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getLastMatch",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "matchCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const MATCH_ABI = [
  {
    type: "function",
    name: "state",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }], // 0=Open, 1=Closed, 2=Settled
    stateMutability: "view",
  },
  {
    type: "function",
    name: "roosterA",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "roosterB",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "closeTime",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "closeBets",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "commit",
    inputs: [{ name: "_commitHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "reveal",
    inputs: [{ name: "seed", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Committed",
    inputs: [{ name: "commitHash", type: "bytes32", indexed: false }],
  },
  {
    type: "event",
    name: "Settled",
    inputs: [{ name: "winnerIsA", type: "bool", indexed: false }],
  },
] as const;
