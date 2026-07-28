import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Redbutton } from "../target/types/redbutton";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("redbutton billboard", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Redbutton as Program<Redbutton>;
  const authority = provider.wallet as anchor.Wallet;

  // A throwaway account that receives the payments.
  const treasury = Keypair.generate();

  const [billboardPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("billboard")],
    program.programId
  );

  const INITIAL_PRICE = 0.1 * LAMPORTS_PER_SOL;

  it("initializes the billboard with the first message and 0.1 SOL price", async () => {
    await program.methods
      .initialize("gm from the bootcamp!")
      .accounts({
        authority: authority.publicKey,
        treasury: treasury.publicKey,
      })
      .rpc();

    const board = await program.account.billboard.fetch(billboardPda);
    assert.equal(board.message, "gm from the bootcamp!");
    assert.equal(board.currentPrice.toNumber(), INITIAL_PRICE);
    assert.equal(board.changeCount.toNumber(), 0);
    assert.ok(board.treasury.equals(treasury.publicKey));
  });

  it("charges the price, updates the message, and doubles the price", async () => {
    const before = await provider.connection.getBalance(treasury.publicKey);

    await program.methods
      .changeMessage("Solana is fast!")
      .accounts({
        payer: authority.publicKey,
        treasury: treasury.publicKey,
      })
      .rpc();

    const board = await program.account.billboard.fetch(billboardPda);
    const after = await provider.connection.getBalance(treasury.publicKey);

    assert.equal(board.message, "Solana is fast!");
    assert.equal(board.changeCount.toNumber(), 1);
    // Price doubled: 0.1 -> 0.2 SOL.
    assert.equal(board.currentPrice.toNumber(), INITIAL_PRICE * 2);
    // Treasury received exactly the initial price.
    assert.equal(after - before, INITIAL_PRICE);
  });

  it("keeps doubling on each subsequent change (0.2 -> 0.4)", async () => {
    await program.methods
      .changeMessage("third message")
      .accounts({
        payer: authority.publicKey,
        treasury: treasury.publicKey,
      })
      .rpc();

    const board = await program.account.billboard.fetch(billboardPda);
    assert.equal(board.changeCount.toNumber(), 2);
    assert.equal(board.currentPrice.toNumber(), INITIAL_PRICE * 4);
  });

  it("rejects a message longer than the max length", async () => {
    const tooLong = "x".repeat(201);
    try {
      await program.methods
        .changeMessage(tooLong)
        .accounts({
          payer: authority.publicKey,
          treasury: treasury.publicKey,
        })
        .rpc();
      assert.fail("expected MessageTooLong error");
    } catch (err) {
      assert.include(err.toString(), "MessageTooLong");
    }
  });

  it("rejects a change routed to the wrong treasury", async () => {
    const fakeTreasury = Keypair.generate();
    try {
      await program.methods
        .changeMessage("hijack")
        .accounts({
          payer: authority.publicKey,
          treasury: fakeTreasury.publicKey,
        })
        .rpc();
      assert.fail("expected WrongTreasury error");
    } catch (err) {
      assert.include(err.toString(), "WrongTreasury");
    }
  });
});
