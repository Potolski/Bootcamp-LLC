import { PublicKey } from "@solana/web3.js";

export const RPC_URL: string =
  import.meta.env.VITE_RPC_URL ?? "https://api.devnet.solana.com";

export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID ??
    "G96NupAUcEpd284gAN7FN5ZZiQRCnz36uf5bvVmcveCG"
);

// Wallet that receives the payments (set in .env to the funded deployer wallet).
export const TREASURY = new PublicKey(
  import.meta.env.VITE_TREASURY ?? PROGRAM_ID.toBase58()
);

// The single global billboard PDA: seeds = ["billboard"].
// Use TextEncoder (not Buffer) so this module never depends on polyfill order.
export const [BILLBOARD_PDA] = PublicKey.findProgramAddressSync(
  [new TextEncoder().encode("billboard")],
  PROGRAM_ID
);
