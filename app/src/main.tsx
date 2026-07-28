import { Buffer } from "buffer";
// Polyfill Node globals required by the Solana wallet-adapter stack.
window.Buffer = window.Buffer ?? Buffer;
(window as any).global = window.globalThis;

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { Providers } from "./Providers";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
