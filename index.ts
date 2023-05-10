import { crypto } from "@iroha2/crypto-target-node";
import {
  Client,
  setCrypto,
  Signer,
  ToriiRequirementsForApiHttp,
  ToriiRequirementsForApiWebSocket,
  ToriiRequirementsForTelemetry,
} from "@iroha2/client";
import {
  AccountId,
  DomainId,
  EvaluatesToRegistrableBox,
  Executable,
  Expression,
  IdentifiableBox,
  Instruction,
  MapNameValue,
  Metadata,
  NewDomain,
  OptionIpfsPath,
  QueryBox,
  RegisterBox,
  Value,
  VecInstruction,
} from "@iroha2/data-model";
// @ts-ignore
import { adapter as WS } from "@iroha2/client/web-socket/node";

import nodeFetch from "node-fetch";
import { cryptoTypes } from "@iroha2/crypto-core";

const init = async () => {
  setCrypto(crypto);

  const keyPair = crypto.KeyPair.fromJSON({
    public_key: 'ed01207233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0',
    private_key: {
      digest_function: 'ed25519',
      payload:
        '9ac47abf59b356e0bd7dcbbbb4dec080e302156a48ca907e47cb6aea1d32719e7233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0',
    },
  })

  const accountId = AccountId({
    // Account name
    name: "alice",
    // The domain where this account is registered
    domain_id: DomainId({
      name: "wonderland",
    }),
  });

  const signer = new Signer(accountId, keyPair);
  const toriiRequirements: ToriiRequirementsForApiHttp &
    ToriiRequirementsForApiWebSocket &
    ToriiRequirementsForTelemetry = {
    apiURL: "http://103.183.75.63:8080", //"http://127.0.0.1:8080"
    telemetryURL: "http://103.183.75.63:8180", //"http://127.0.0.1:8180"
    ws: WS,
    // type assertion is acceptable here
    // you can pass `undiciFetch` here as well
    fetch: nodeFetch as typeof fetch,
  };

  const client = new Client({ signer });

  // async function registerDomain(domainName: string) {
  //   const registerBox = RegisterBox({
  //     object: EvaluatesToRegistrableBox({
  //       expression: Expression(
  //         "Raw",
  //         Value(
  //           "Identifiable",
  //           IdentifiableBox(
  //             "NewDomain",
  //             NewDomain({
  //               id: DomainId({
  //                 name: domainName,
  //               }),
  //               metadata: Metadata({ map: MapNameValue(new Map()) }),
  //               logo: OptionIpfsPath("None"),
  //             })
  //           )
  //         )
  //       ),
  //     }),
  //   });

  //   await client.submitExecutable(
  //     toriiRequirements,
  //     Executable(
  //       "Instructions",
  //       VecInstruction([Instruction("Register", registerBox)])
  //     )
  //   );
  // }

  // async function ensureDomainExistence(domainName: string) {
  //   // Query all domains
  //   const result = await client.requestWithQueryBox(
  //     toriiRequirements,
  //     QueryBox('FindAllDomains', null),
  //   )
  //   console.log('%o', result)
  //   // Display the request status
  //   console.log('%o', result.as('Ok'))
  //   const data = result.as('Ok').result.enum.as('Vec')
  //   const domain = data.map(x => {
  //     console.log(x.enum.as('Identifiable').enum.as('Domain').id.name)
  //     return x.enum.as('Identifiable').enum.as('Domain').id.name
  //   }).find(y => y === domainName)
  //   if (!domain) {
  //     console.log("Domain not found & new domain will be registered")
  //     await registerDomain(domainName)
  //   } else {
  //     console.log(domain)
  //   }
  // }

  // await registerDomain('looking_glass')
  // await ensureDomainExistence('looking_glass')
};

init();
