// Must be imported FIRST (before any module that touches Buffer/global).
// The Solana / anchor / wallet-adapter stack expects Node globals in the
// browser; ES import hoisting means this side effect runs before the rest of
// the app's modules evaluate.
import { Buffer } from "buffer";

(globalThis as any).Buffer = (globalThis as any).Buffer ?? Buffer;
(globalThis as any).global = globalThis;
