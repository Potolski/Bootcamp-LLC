import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Solana web3 / wallet-adapter stack expects Node globals (Buffer, global)
// in the browser. We shim them here and in src/main.tsx.
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});
