import "./polyfills";

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
