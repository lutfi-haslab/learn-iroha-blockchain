import {
  Client,
  setCrypto,
  Signer,
  ToriiRequirementsForApiHttp,
  ToriiRequirementsForApiWebSocket,
  ToriiRequirementsForTelemetry,
} from "@iroha2/client";
import { crypto } from "@iroha2/crypto-target-node";
import { AccountId, DomainId } from "@iroha2/data-model";
// @ts-ignore
import { adapter as WS } from "@iroha2/client/web-socket/node";

import nodeFetch from "node-fetch";

setCrypto(crypto);

// account default
const pubKey =
  "ed01207233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0";
const privKey =
  "9ac47abf59b356e0bd7dcbbbb4dec080e302156a48ca907e47cb6aea1d32719e7233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0";

// account lutfi@hasdev
// const pubKey =
("ed0120fa3542a08d76ef33f8bc292ba4788e83703080093a96bcc7f69af42631a7073e");
// const privKey =
("7b9e02ee9f9c69ca7f473f0678eb852f05a2b12fe278cdf1f559877cc3b1f774fa3542a08d76ef33f8bc292ba4788e83703080093a96bcc7f69af42631a7073e");

"ed0120fa3542a08d76ef33f8bc292ba4788e83703080093a96bcc7f69af42631a7073e"
const keyPair = crypto.KeyPair.fromJSON({
  public_key: "ed01207233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0",
  private_key: {
    digest_function: "ed25519",
    payload: "9ac47abf59b356e0bd7dcbbbb4dec080e302156a48ca907e47cb6aea1d32719e7233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0",
  },
});

const accountId = AccountId({
  // Account name
  name: "superuser", //superuser
  // The domain where this account is registered
  domain_id: DomainId({
    name: "bank_indonesia", //bank_indonesia
  }),
});

export const signer = new Signer(accountId, keyPair);
export const toriiRequirements: ToriiRequirementsForApiHttp &
  ToriiRequirementsForApiWebSocket &
  ToriiRequirementsForTelemetry = {
  apiURL: `${process.env.IROHA_SERVER}:8081`, //"http://127.0.0.1:8080"
  telemetryURL: `${process.env.IROHA_SERVER}:8181`, //"http://127.0.0.1:8180"
  ws: WS,
  // type assertion is acceptable here
  // you can pass `undiciFetch` here as well
  fetch: nodeFetch as unknown as typeof fetch,
};

export const client = new Client({ signer });
