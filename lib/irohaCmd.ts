import {
  AccountId,
  AssetDefinition,
  AssetDefinitionId,
  AssetId,
  AssetValueType,
  DomainId,
  EvaluatesToIdBox,
  EvaluatesToRegistrableBox,
  EvaluatesToValue,
  Executable,
  Expression,
  IdBox,
  IdentifiableBox,
  Instruction,
  MapNameValue,
  Metadata,
  MintBox,
  Mintable,
  NewAccount,
  NewDomain,
  NewRole,
  NumericValue,
  OptionIpfsPath,
  PublicKey,
  QueryBox,
  RegisterBox,
  Role,
  RoleId,
  Value,
  VecInstruction,
  VecPublicKey,
  VecToken,
  BurnBox,
  TransferBox,
  FindAccountById,
  EvaluatesToAccountId,
  FindAccountsWithAsset,
  EvaluatesToAssetDefinitionId,
  FindAssetsByAccountId
} from "@iroha2/data-model";
import { client, toriiRequirements } from "../config/iroha";
import { crypto } from "@iroha2/crypto-target-node";
import { Client, Signer } from "@iroha2/client";

export const registerDomain = async (domainName: string) => {
  const registerBox = RegisterBox({
    object: EvaluatesToRegistrableBox({
      expression: Expression(
        "Raw",
        Value(
          "Identifiable",
          IdentifiableBox(
            "NewDomain",
            NewDomain({
              id: DomainId({
                name: domainName,
              }),
              metadata: Metadata({ map: MapNameValue(new Map()) }),
              logo: OptionIpfsPath("None"),
            })
          )
        )
      ),
    }),
  });

  const data = await client.submitExecutable(
    toriiRequirements,
    Executable(
      "Instructions",
      VecInstruction([Instruction("Register", registerBox)])
    )
  );
  return data;
};

export const ensureDomainExistence = async (domainName: string) => {
  // Query all domains
  const result = await client.requestWithQueryBox(
    toriiRequirements,
    QueryBox("FindAllDomains", null)
  );
  console.log("%o", result);
  // Display the request status
  console.log("%o", result.as("Ok"));
  const data = result.as("Ok").result.enum.as("Vec");
  const domain = data
    .map((x) => {
      console.log(x.enum.as("Identifiable").enum.as("Domain").id.name);
      return x.enum.as("Identifiable").enum.as("Domain").id.name;
    })
    .find((y) => y === domainName);
  if (!domain) {
    console.log("Domain not found & new domain will be registered");
    await registerDomain(domainName);
  } else {
    console.log(domain);
  }

  return data;
};

export const getAllDomain = async () => {
  const result = await client.requestWithQueryBox(
    toriiRequirements,
    QueryBox("FindAllDomains", null)
  );

  const domains = result
    .as("Ok")
    .result.enum.as("Vec")
    .map((x) => x.enum.as("Identifiable").enum.as("Domain"));
  console.log("domain", domains);

  return domains;
};

export const getAllAccount = async () => {
  const result = await client.requestWithQueryBox(
    toriiRequirements,
    QueryBox("FindAllAccounts", null)
  );

  const accounts = result
    .as("Ok")
    .result.enum.as("Vec")
    .map((x) => x.enum.as("Identifiable").enum.as("Account"));
  return accounts;
};

export const getAllAsset = async () => {
  const result = await client.requestWithQueryBox(
    toriiRequirements,
    QueryBox("FindAllAssets", null)
  );

  const assets = result
    .as("Ok")
    .result.enum.as("Vec")
    .map((x) => x.enum.as("Identifiable").enum.as("Asset"));

  return assets;
};

export const getBalance = async (accountId: string) => {
  const evaluatesToAccountId = (accountId: AccountId): EvaluatesToAccountId =>
    EvaluatesToAccountId({
      expression: Expression('Raw', Value('Id', IdBox("AccountId", accountId))),
    })
  const result = await client.requestWithQueryBox(
    toriiRequirements,
    QueryBox("FindAssetsByAccountId", FindAssetsByAccountId({
      account_id: evaluatesToAccountId(AccountId({
        name: accountId.split("@")[0],
        domain_id: DomainId({
          name: accountId.split("@")[1],
        }),
      }))
    }))
  );
  const assets = result.as("Ok").result.enum.as("Vec").map((x) => x.enum.as("Identifiable").enum.as("Asset"));

  return assets
};

export const createAccount = async ({
  accountId,
  domainId,
}: {
  accountId: string;
  domainId: string;
}) => {
  const accountBox = AccountId({
    name: accountId,
    domain_id: DomainId({
      name: domainId,
    }),
  });

  const public_key = "ed01207233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0";
  const hexString = public_key.substring(6);
  function hexToUint8Array(hex: any) {
    const uint8Array = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      const byteValue = parseInt(hex.substr(i, 2), 16);
      uint8Array[i / 2] = byteValue;
    }
    return uint8Array;
  }

  const publicKey = PublicKey({
    payload: hexToUint8Array(hexString),
    digest_function: "ed25519",
  });

  console.log(publicKey);
  // let key: PublicKey = get_key_from_white_rabbit();
  // let create_account =
  //     RegisterBox::new(IdentifiableBox::from(NewAccount::with_signatory(id, key)));
  const account = RegisterBox({
    object: EvaluatesToRegistrableBox({
      expression: Expression(
        "Raw",
        Value(
          "Identifiable",
          IdentifiableBox(
            "NewAccount",
            NewAccount({
              id: accountBox,
              signatories: VecPublicKey([publicKey]),
              metadata: Metadata({ map: MapNameValue(new Map()) }),
            })
          )
        )
      ),
    }),
  });

  const data = await client.submitExecutable(
    toriiRequirements,
    Executable(
      "Instructions",
      VecInstruction([Instruction("Register", account)])
    )
  );

  return data;
};

// Permission
// let alice_id = AccountId::from_str("alice@test")?;
// let bob_id = AccountId::from_str("bob@test")?;
// let alice_xor_id = <Asset as Identifiable>::Id::new(
//     AssetDefinitionId::from_str("xor#test")?,
//     AccountId::from_str("alice@test")?,
// );

// // Create a new `CanTransferUserAssets` permission token
// // that allows to transfer `alice_xor_id` asset
// let permission_token_to_alice: PermissionToken =
//     transfer::CanTransferUserAssets::new(alice_xor_id).into();

// // Create an instruction that grants Bob permission to transfer `alice_xor_id` asset
// let grant = Instruction::Grant(GrantBox::new(
//     permission_token_to_alice,
//     IdBox::AccountId(bob_id),
// ));

export const setRole = async () => {
  //   let role_id = <Role as Identifiable>::Id::from_str("ACCESS_TO_MOUSE_METADATA")?;
  // let role = iroha_data_model::role::Role::new(role_id)
  //     .add_permission(CanSetKeyValueInUserMetadata::new(mouse_id))
  //     .add_permission(CanRemoveKeyValueInUserMetadata::new(mouse_id));
  // let register_role = RegisterBox::new(role);
  const role = Role({
    id: RoleId({
      name: "ACCESS_TO_PCHAIN_METADATA",
    }),
    permissions: VecToken([]),
  });

  const registerRole = RegisterBox({
    object: EvaluatesToRegistrableBox({
      expression: Expression(
        "Raw",
        Value(
          "Identifiable",
          IdentifiableBox(
            "NewRole",
            NewRole({
              inner: role,
            })
          )
        )
      ),
    }),
  });
};

export const canMintUserAsset = () => {
  const accountBox = AccountId({
    name: "lutfi",
    domain_id: DomainId({
      name: "prifa",
    }),
  });

  const assetDefinition = AssetDefinition({
    value_type: AssetValueType("Quantity"),
    id: AssetDefinitionId({
      name: "pchain",
      domain_id: DomainId({ name: "prifa" }),
    }),
    metadata: Metadata({ map: MapNameValue(new Map()) }),
    mintable: Mintable("Infinitely"), // If only we could mint more time.
  });
};

export const registerAsset = async ({
  assetName,
  domainId,
  mintType,
}: {
  assetName: string;
  domainId: string;
  mintType: "Infinitely" | "Not";
}) => {
  const asset = AssetDefinition({
    value_type: AssetValueType("Quantity"),
    id: AssetDefinitionId({
      name: assetName,
      domain_id: DomainId({ name: domainId }),
    }),
    metadata: Metadata({ map: MapNameValue(new Map()) }),
    mintable: Mintable(mintType), // If only we could mint more time.
  });

  const register = Instruction(
    "Register",
    RegisterBox({
      object: EvaluatesToRegistrableBox({
        expression: Expression(
          "Raw",
          Value("Identifiable", IdentifiableBox("AssetDefinition", asset))
        ),
      }),
    })
  );
  const data = await client.submitExecutable(
    toriiRequirements,
    Executable("Instructions", VecInstruction([register]))
  );
  return data;
};

export const mintAsset = async ({
  signer,
  mintValue,
}: {
  signer: string;
  mintValue: number;
}) => {
  if (signer !== "superuser@bank_indonesia") {
    throw new Error('Only Bank Indonesia super user can mint assets');
  } else {
    const mint = Instruction(
      "Mint",
      MintBox({
        object: EvaluatesToValue({
          expression: Expression(
            "Raw",
            Value("Numeric", NumericValue("U32", mintValue))
          ),
        }),
        destination_id: EvaluatesToIdBox({
          expression: Expression(
            "Raw",
            Value(
              "Id",
              IdBox(
                "AssetId",
                AssetId({
                  account_id: AccountId({
                    name: "superuser",
                    domain_id: DomainId({
                      name: "bank_indonesia",
                    }),
                  }),
                  definition_id: AssetDefinitionId({
                    name: "didr",
                    domain_id: DomainId({ name: "bank_indonesia" }),
                  }),
                })
              )
            )
          ),
        }),
      })
    );

    const data = await client.submitExecutable(
      toriiRequirements,
      Executable("Instructions", VecInstruction([mint]))
    );
    return data;
  }
};

export const burnAsset = async ({
  signer,
  burnValue,
}: {
  signer: string;
  burnValue: number;
}) => {
  if (signer !== "superuser@bank_indonesia") {
    throw new Error('Only Bank Indonesia super user can mint assets');
  } else {
    const burn = Instruction(
      "Burn",
      BurnBox({
        object: EvaluatesToValue({
          expression: Expression(
            "Raw",
            Value("Numeric", NumericValue("U32", burnValue))
          ),
        }),
        destination_id: EvaluatesToIdBox({
          expression: Expression(
            "Raw",
            Value(
              "Id",
              IdBox(
                "AssetId",
                AssetId({
                  account_id: AccountId({
                    name: "superuser",
                    domain_id: DomainId({
                      name: "bank_indonesia",
                    }),
                  }),
                  definition_id: AssetDefinitionId({
                    name: "didr",
                    domain_id: DomainId({ name: "bank_indonesia" }),
                  }),
                })
              )
            )
          ),
        }),
      })
    );
    await client.submitExecutable(
      toriiRequirements,
      Executable("Instructions", VecInstruction([burn]))
    );
    return burn;
  }
};

export const transferAsset = async ({
  from,
  to,
  amount,
}: {
  from: string;
  to: string;
  amount: number;
}) => {

  const setFrom = from.split('@');
  const setTo = to.split('@');
  const domainFsp = ["bank_mandiri", "bank_bni", "bank_bca"];

  const fromAccount = AccountId({
    name: setFrom[0],
    domain_id: DomainId({
      name: setFrom[1],
    }),
  })

  const toAccount = AccountId({
    name: setTo[0],
    domain_id: DomainId({
      name: setTo[1],
    }),
  })


  const assetDefinitionId = AssetDefinitionId({
    name: "didr",
    domain_id: DomainId({
      name: "bank_indonesia",
    }),
  })

  const amountToTransfer = Value('Numeric', NumericValue('U32', amount));

  if (setFrom[1] == "app_wallet" && setTo[1] == "bank_indonesia") {
    throw new Error(`Cannot send money from app wallet to bank indonesia`);
  } else if (domainFsp.includes(setFrom[1]) && setTo[1] == "bank_indonesia") {
    throw new Error(`Cannot send money from ${setFrom[0]} (${setFrom[1]}) to bank indonesia`);
  } else {
    const evaluatesToAssetId = (assetId: AssetId): EvaluatesToIdBox =>
      EvaluatesToIdBox({
        expression: Expression('Raw', Value('Id', IdBox('AssetId', assetId))),
      })

    const transferAssetInstruction = Instruction(
      'Transfer',
      TransferBox({
        source_id: evaluatesToAssetId(
          AssetId({
            definition_id: assetDefinitionId,
            account_id: fromAccount,
          }),
        ),
        destination_id: evaluatesToAssetId(
          AssetId({
            definition_id: assetDefinitionId,
            account_id: toAccount,
          }),
        ),
        object: EvaluatesToValue({
          expression: Expression('Raw', amountToTransfer),
        }),
      }),
    )

    const keyPair = crypto.KeyPair.fromJSON({
      public_key: "ed01207233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0",
      private_key: {
        digest_function: "ed25519",
        payload: "9ac47abf59b356e0bd7dcbbbb4dec080e302156a48ca907e47cb6aea1d32719e7233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0",
      },
    });

    const signer = new Signer(fromAccount, keyPair);

    const client = new Client({ signer });

    await client.submitExecutable(
      toriiRequirements,
      Executable("Instructions", VecInstruction([transferAssetInstruction]))
    );
    return transferAssetInstruction;
  }
};
