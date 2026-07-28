use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("G96NupAUcEpd284gAN7FN5ZZiQRCnz36uf5bvVmcveCG");

/// Maximum number of bytes allowed in a billboard message.
pub const MAX_MESSAGE_LEN: usize = 200;

/// Initial price to change the message: 0.1 SOL (in lamports).
pub const INITIAL_PRICE: u64 = 100_000_000;

#[program]
pub mod redbutton {
    use super::*;

    /// Create the single global billboard. The first message is set for free
    /// by whoever initializes the account. Funds from future changes are sent
    /// to `treasury`.
    pub fn initialize(ctx: Context<Initialize>, message: String) -> Result<()> {
        require!(
            message.len() <= MAX_MESSAGE_LEN,
            BillboardError::MessageTooLong
        );

        let billboard = &mut ctx.accounts.billboard;
        billboard.authority = ctx.accounts.authority.key();
        billboard.treasury = ctx.accounts.treasury.key();
        billboard.message = message;
        billboard.current_price = INITIAL_PRICE;
        billboard.change_count = 0;
        billboard.bump = ctx.bumps.billboard;

        msg!(
            "Billboard initialized. Next change costs {} lamports",
            INITIAL_PRICE
        );
        Ok(())
    }

    /// Pay the current price to overwrite the billboard message. After a
    /// successful change the price doubles for the next caller.
    pub fn change_message(ctx: Context<ChangeMessage>, message: String) -> Result<()> {
        require!(
            message.len() <= MAX_MESSAGE_LEN,
            BillboardError::MessageTooLong
        );

        let price = ctx.accounts.billboard.current_price;

        // Charge the caller: move `price` lamports from payer -> treasury.
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            price,
        )?;

        let billboard = &mut ctx.accounts.billboard;
        billboard.message = message;
        billboard.change_count = billboard
            .change_count
            .checked_add(1)
            .ok_or(BillboardError::Overflow)?;
        // Double the price for the next caller.
        billboard.current_price = price.checked_mul(2).ok_or(BillboardError::Overflow)?;

        msg!(
            "Message changed (#{}). Next change costs {} lamports",
            billboard.change_count,
            billboard.current_price
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = Billboard::SPACE,
        seeds = [b"billboard"],
        bump
    )]
    pub billboard: Account<'info, Billboard>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Destination for future payments. Stored on the billboard and
    /// enforced via `has_one` on `change_message`. Not read or written here.
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChangeMessage<'info> {
    #[account(
        mut,
        seeds = [b"billboard"],
        bump = billboard.bump,
        has_one = treasury @ BillboardError::WrongTreasury
    )]
    pub billboard: Account<'info, Billboard>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Must equal `billboard.treasury` (enforced by `has_one`). Only
    /// receives lamports via the system-program CPI.
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Billboard {
    /// Wallet that initialized the billboard.
    pub authority: Pubkey,
    /// Wallet that receives payments.
    pub treasury: Pubkey,
    /// Lamports required for the next message change.
    pub current_price: u64,
    /// How many times the message has been changed.
    pub change_count: u64,
    /// PDA bump.
    pub bump: u8,
    /// The current message shown on the billboard.
    pub message: String,
}

impl Billboard {
    pub const SPACE: usize = 8   // account discriminator
        + 32  // authority
        + 32  // treasury
        + 8   // current_price
        + 8   // change_count
        + 1   // bump
        + 4 + MAX_MESSAGE_LEN; // message (4-byte length prefix + bytes)
}

#[error_code]
pub enum BillboardError {
    #[msg("Message exceeds the maximum allowed length")]
    MessageTooLong,
    #[msg("Treasury account does not match the billboard treasury")]
    WrongTreasury,
    #[msg("Arithmetic overflow")]
    Overflow,
}
