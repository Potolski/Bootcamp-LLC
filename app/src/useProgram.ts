import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { Redbutton } from "./idl/redbutton";
import idl from "./idl/redbutton.json";

/**
 * Builds an Anchor `Program` bound to the connected wallet. Returns null until
 * a wallet capable of signing is connected.
 */
export function useProgram(): Program<Redbutton> | null {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions!,
      },
      { commitment: "confirmed" }
    );

    return new Program<Redbutton>(idl as Redbutton, provider);
  }, [connection, wallet.publicKey, wallet.signTransaction]);
}
