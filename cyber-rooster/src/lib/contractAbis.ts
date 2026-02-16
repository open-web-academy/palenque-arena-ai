import { parseAbi } from "viem";

export const FACTORY_ABI = parseAbi([
  "function matchCount() view returns (uint256)",
  "function getLastMatch() view returns (address)",
  "function matches(uint256 index) view returns (address)",
]);

export const MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function roosterA() view returns (string)",
  "function roosterB() view returns (string)",
  "function closeTime() view returns (uint256)",
  "function betPoolA() view returns (uint256)",
  "function betPoolB() view returns (uint256)",
  "function totalBoostA() view returns (uint256)",
  "function totalBoostB() view returns (uint256)",
  "function currentOdds() view returns (uint256 pA, uint256 pB)",
  "function winnerA() view returns (bool)",
  "function betsA(address) view returns (uint256)",
  "function betsB(address) view returns (uint256)",
  "function bet(bool side, uint256 amount) payable",
  "function boost(bool side, uint256 amount)",
  "function claimPayout() returns (uint256)",
]);

export const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
]);

export const FACTORY_ADDRESS = "0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3";
export const PAL_TOKEN_ADDRESS = "0x0dfBc608339aeA55F5EEedE640335dAC062a7777";
export const RPC_URL = "https://rpc.monad.xyz";
