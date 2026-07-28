# 🔴 The Big Red Button — Solana Billboard

A live-demo dApp for a Solana bootcamp. A big red button sits in the middle of
the screen; above it, an "outdoor" billboard shows the latest message. Anyone
can pay SOL to overwrite the message — and **every change doubles the price**.

- Initial price: **0.1 SOL**
- After each change the price doubles: 0.1 → 0.2 → 0.4 → 0.8 → …
- Payments go to a **treasury** wallet.
- Runs on **devnet**.

## Architecture

| Layer | Path | Tech |
|-------|------|------|
| On-chain program | `programs/redbutton/` | Anchor 0.31 (Rust) |
| Tests | `tests/redbutton.ts` | ts-mocha + chai (5 passing) |
| Frontend | `app/` | Vite + React + wallet-adapter |

### Program design
A single global PDA `["billboard"]` stores:
`authority`, `treasury`, `message`, `current_price`, `change_count`, `bump`.

- `initialize(message)` — creates the billboard, sets the first message for
  free, price = 0.1 SOL.
- `change_message(message)` — transfers `current_price` lamports from the caller
  to the treasury (CPI to the System Program), updates the message, then doubles
  the price. `has_one = treasury` guarantees funds can only go to the real
  treasury.

## Run the tests (no deploy needed)

```bash
anchor test          # spins up a local validator, deploys, runs the suite
```

## Deploy to devnet (when you're ready)

The project is fully built but **not deployed yet**. Steps:

```bash
# 1. Fund the deployer wallet (address printed by the command below)
solana address -k .secrets/deployer.json
#    -> airdrop or send ~3 SOL to that address on devnet

# 2. Point the CLI at devnet + the deployer wallet
solana config set --url devnet --keypair .secrets/deployer.json

# 3. Deploy
anchor deploy --provider.cluster devnet
#    (Anchor.toml [provider] cluster is already "localnet"; the flag overrides it,
#     or edit Anchor.toml to cluster = "devnet")
```

If `anchor build` regenerated the program ID, run `anchor keys sync` and rebuild
before deploying, then re-copy the IDL into the app:
`cp target/idl/redbutton.json app/src/idl/ && cp target/types/redbutton.ts app/src/idl/`.

## Run the frontend

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

Config lives in `app/.env`:
- `VITE_RPC_URL` — devnet RPC
- `VITE_PROGRAM_ID` — the program ID
- `VITE_TREASURY` — where payments land (defaults to the deployer wallet)

### First run
The first person to click the button **initializes** the billboard (free) and
sets the first message. Every click afterwards prompts for a new message and
charges the current (doubling) price. Connect a Phantom/Solflare wallet set to
**devnet** to play.

## Live-demo tips for the class
1. Open the app with the billboard uninitialized → click → show the free launch.
2. Click again → show the wallet popup asking to pay 0.1 SOL → approve.
3. Click a third time → point out the price is now 0.2 SOL. Great moment to
   explain PDAs, CPIs, and on-chain state on Solana Explorer.
