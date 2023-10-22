import { hexToUint8Array } from "./lib/hex2uint";
import { Signer } from "@iroha2/client";
import {
  PublicKey,
  AccountId,
  DomainId
} from "@iroha2/data-model";
import { cryptoTypes } from '@iroha2/crypto-core'
import { crypto } from '@iroha2/crypto-target-node'

// const keyPair: cryptoTypes.KeyPair = crypto.KeyPair.fromJSON({
//   public_key: 'ed0120fa3542a08d76ef33f8bc292ba4788e83703080093a96bcc7f69af42631a7073e',
//   private_key: {
//     digest_function: 'ed25519',
//     payload:
//       '7b9e02ee9f9c69ca7f473f0678eb852f05a2b12fe278cdf1f559877cc3b1f774fa3542a08d76ef33f8bc292ba4788e83703080093a96bcc7f69af42631a7073e',
//   },
// })

// const accountId = AccountId({
//   // Account name
//   name: 'admin',
//   // The domain where this account is registered
//   domain_id: DomainId({
//     name: 'looking_glass',
//   }),
// })

// const signer = new Signer(accountId, keyPair)
// console.log(signer)

const public_key = 'ed0120e97730197bb1aefaa7d1c01b13534a3a5311babf67b7c00c5bfaaa1498ecf634';
const hexString = public_key.substring(6)
console.log(hexToUint8Array(hexString))

// @ts-ignore
const pubKey = PublicKey({
  payload: hexToUint8Array(hexString),
  digest_function: 'ed25519',
})



console.log(pubKey)