import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { Redbutton } from "./idl/redbutton";
import idl from "./idl/redbutton.json";
import { BILLBOARD_PDA, TREASURY } from "./config";
import { useProgram } from "./useProgram";

type Board = {
  message: string;
  currentPrice: BN;
  changeCount: BN;
  treasury: PublicKey;
} | null;

export function App() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const program = useProgram();

  const [board, setBoard] = useState<Board>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Read-only program (no wallet needed) so the billboard is visible to everyone.
  const readBoard = useCallback(async () => {
    const dummy = Keypair.generate();
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: dummy.publicKey,
        signTransaction: async (t: any) => t,
        signAllTransactions: async (t: any) => t,
      } as any,
      { commitment: "confirmed" }
    );
    const ro = new Program<Redbutton>(idl as Redbutton, provider);
    try {
      const acc = await ro.account.billboard.fetch(BILLBOARD_PDA);
      setBoard({
        message: acc.message,
        currentPrice: acc.currentPrice,
        changeCount: acc.changeCount,
        treasury: acc.treasury,
      });
    } catch {
      setBoard(null); // Not initialized yet.
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    readBoard();
    const id = setInterval(readBoard, 5000);
    return () => clearInterval(id);
  }, [readBoard]);

  const priceSol = board
    ? Number(board.currentPrice.toString()) / LAMPORTS_PER_SOL
    : 0.1;

  const handleClick = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    setBusy(true);
    setStatus("");
    try {
      if (!board) {
        // First ever click initializes the billboard for free.
        const first =
          window.prompt(
            "Set the FIRST message on the billboard:",
            "gm from the bootcamp!"
          ) ?? "gm from the bootcamp!";
        await program.methods
          .initialize(first)
          .accountsPartial({ authority: wallet.publicKey, treasury: TREASURY })
          .rpc();
        setStatus("Billboard created! 🎉");
      } else {
        const next = window.prompt(
          `Pay ${priceSol} SOL to change the message. New message:`,
          ""
        );
        if (next === null || next.trim() === "") {
          setBusy(false);
          return;
        }
        await program.methods
          .changeMessage(next)
          .accountsPartial({
            payer: wallet.publicKey,
            treasury: board.treasury,
          })
          .rpc();
        setStatus(`Message changed! You paid ${priceSol} SOL 💸`);
      }
      await readBoard();
    } catch (e: any) {
      setStatus("Error: " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }, [program, wallet.publicKey, board, priceSol, readBoard]);

  const buttonLabel = busy
    ? "Waiting for signature…"
    : !board
    ? "🚀 Launch the billboard (free)"
    : `PAY ${priceSol} SOL TO CHANGE`;

  return (
    <div className="page">
      <header className="topbar">
        <span className="brand">🔴 The Big Red Button</span>
        <WalletMultiButton />
      </header>

      <main className="stage">
        {/* The outdoor / billboard */}
        <div className="outdoor">
          <div className="outdoor-frame">
            <div className="outdoor-screen">
              {loading
                ? "loading…"
                : board
                ? board.message
                : "— no message yet —"}
            </div>
          </div>
          <div className="outdoor-legs">
            <span />
            <span />
          </div>
        </div>

        <div className="meta">
          {board ? (
            <>
              Changed <strong>{board.changeCount.toString()}</strong> times ·
              next change costs <strong>{priceSol} SOL</strong>
            </>
          ) : (
            <>Nobody has posted yet. Be the first — the launch is free.</>
          )}
        </div>

        {/* The big red button */}
        <button
          className="big-red-button"
          onClick={handleClick}
          disabled={!wallet.connected || busy}
        >
          {buttonLabel}
        </button>

        {!wallet.connected && (
          <p className="hint">Connect a devnet wallet to play.</p>
        )}
        {status && <p className="status">{status}</p>}
      </main>
    </div>
  );
}
