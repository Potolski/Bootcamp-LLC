/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/redbutton.json`.
 */
export type Redbutton = {
  address: "G96NupAUcEpd284gAN7FN5ZZiQRCnz36uf5bvVmcveCG";
  metadata: {
    name: "redbutton";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "changeMessage";
      docs: [
        "Pay the current price to overwrite the billboard message. After a",
        "successful change the price doubles for the next caller."
      ];
      discriminator: [220, 166, 95, 27, 38, 126, 47, 157];
      accounts: [
        {
          name: "billboard";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [98, 105, 108, 108, 98, 111, 97, 114, 100];
              }
            ];
          };
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "treasury";
          docs: ["receives lamports via the system-program CPI."];
          writable: true;
          relations: ["billboard"];
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "message";
          type: "string";
        }
      ];
    },
    {
      name: "initialize";
      docs: [
        "Create the single global billboard. The first message is set for free",
        "by whoever initializes the account. Funds from future changes are sent",
        "to `treasury`."
      ];
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "billboard";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [98, 105, 108, 108, 98, 111, 97, 114, 100];
              }
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "treasury";
          docs: [
            "enforced via `has_one` on `change_message`. Not read or written here."
          ];
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "message";
          type: "string";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "billboard";
      discriminator: [202, 110, 74, 104, 87, 241, 119, 9];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "messageTooLong";
      msg: "Message exceeds the maximum allowed length";
    },
    {
      code: 6001;
      name: "wrongTreasury";
      msg: "Treasury account does not match the billboard treasury";
    },
    {
      code: 6002;
      name: "overflow";
      msg: "Arithmetic overflow";
    }
  ];
  types: [
    {
      name: "billboard";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            docs: ["Wallet that initialized the billboard."];
            type: "pubkey";
          },
          {
            name: "treasury";
            docs: ["Wallet that receives payments."];
            type: "pubkey";
          },
          {
            name: "currentPrice";
            docs: ["Lamports required for the next message change."];
            type: "u64";
          },
          {
            name: "changeCount";
            docs: ["How many times the message has been changed."];
            type: "u64";
          },
          {
            name: "bump";
            docs: ["PDA bump."];
            type: "u8";
          },
          {
            name: "message";
            docs: ["The current message shown on the billboard."];
            type: "string";
          }
        ];
      };
    }
  ];
};
