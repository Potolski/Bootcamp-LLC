import { ReactNode, useMemo, FC } from "react";
import {
  ConnectionProvider as RawConnectionProvider,
  WalletProvider as RawWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider as RawWalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { RPC_URL } from "./config";

// The mobile wallet adapter pulls in @types/react@19 transitively, which makes
// these providers' FC return type incompatible with our React 18 JSX. Casting
// to a plain FC sidesteps the type clash without changing runtime behavior.
const ConnectionProvider = RawConnectionProvider as FC<any>;
const WalletProvider = RawWalletProvider as FC<any>;
const WalletModalProvider = RawWalletModalProvider as FC<any>;

export function Providers({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
