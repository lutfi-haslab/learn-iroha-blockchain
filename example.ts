import {
  Client,
  Signer,
  ToriiRequirementsForApiHttp,
  ToriiRequirementsForApiWebSocket,
  ToriiRequirementsForTelemetry,
  setCrypto
} from '@iroha2/client'
import { cryptoTypes } from '@iroha2/crypto-core'
import { crypto } from '@iroha2/crypto-target-node'
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
  NewAccount,
  NewDomain,
  OptionIpfsPath,
  PublicKey,
  QueryBox,
  RegisterBox,
  Value,
  VecInstruction,
  VecPublicKey
} from '@iroha2/data-model'
// @ts-ignore
import { adapter as WS } from '@iroha2/client/web-socket/node'
import nodeFetch from 'node-fetch'
// another alternative

setCrypto(crypto)
// const keyPair: cryptoTypes.KeyPair = crypto.KeyPair.fromJSON({
//   public_key: 'ed0120fa3542a08d76ef33f8bc292ba4788e83703080093a96bcc7f69af42631a7073e',
//   private_key: {
//     digest_function: 'ed25519',
//     payload:
//       '7b9e02ee9f9c69ca7f473f0678eb852f05a2b12fe278cdf1f559877cc3b1f774fa3542a08d76ef33f8bc292ba4788e83703080093a96bcc7f69af42631a7073e',
//   },
// })

const keyPair: cryptoTypes.KeyPair = crypto.KeyPair.fromJSON({
  public_key: 'ed0120e97730197bb1aefaa7d1c01b13534a3a5311babf67b7c00c5bfaaa1498ecf634',
  private_key: {
    digest_function: 'ed25519',
    payload:
      '8fa4d172764a00b87a39359c81f6e883284132bea533c31810c50a6f184267cbe97730197bb1aefaa7d1c01b13534a3a5311babf67b7c00c5bfaaa1498ecf634',
  },
})

const accountId = AccountId({
  // Account name
  name: 'admin',
  // The domain where this account is registered
  domain_id: DomainId({
    name: 'looking_glass',
  }),
})

const signer = new Signer(accountId, keyPair)
console.log(signer)

const client = new Client({ signer })


const toriiRequirements: ToriiRequirementsForApiHttp &
  ToriiRequirementsForApiWebSocket &
  ToriiRequirementsForTelemetry = {
  apiURL: 'http://127.0.0.1:8080',
  telemetryURL: 'http://127.0.0.1:8180',
  ws: WS,
  // type assertion is acceptable here
  // you can pass `undiciFetch` here as well
  fetch: nodeFetch as typeof fetch,
}

async function registerDomain(domainName: string) {
  const registerBox = RegisterBox({
    object: EvaluatesToRegistrableBox({
      expression: Expression(
        'Raw',
        Value(
          'Identifiable',
          IdentifiableBox(
            'NewDomain',
            NewDomain({
              id: DomainId({
                name: domainName,
              }),
              metadata: Metadata({ map: MapNameValue(new Map()) }),
              logo: OptionIpfsPath('None'),
            }),
          ),
        ),
      ),
    }),
  })

  await client.submitExecutable(
    toriiRequirements,
    Executable('Instructions', VecInstruction([Instruction('Register', registerBox)])),
  )
}

async function ensureDomainExistence(domainName: string) {
  // Query all domains
  const result = await client.requestWithQueryBox(
    toriiRequirements,
    QueryBox('FindAllDomains', null),
  )

  // Display the request status
  console.log('%o', result.as('Ok'))
  const data = result.as('Ok').result.enum.as('Vec')
  const domain = data.map(x => {
    console.log(x.enum.as('Identifiable').enum.as('Domain').id.name)
    return x.enum.as('Identifiable').enum.as('Domain').id.name
  }).find(y => y === domainName)
  if (!domain) {
    console.log("Domain not found & new domain will be registered")
    await registerDomain(domainName)
  } else {
    console.log(domain)
  }
}



await ensureDomainExistence('pchain1')


async function createAccount() {
  const accountId2 = AccountId({
    name: 'admin2',
    domain_id: DomainId({
      name: 'looking_glass',
    }),
  })

  const public_key = 'ed0120e97730197bb1aefaa7d1c01b13534a3a5311babf67b7c00c5bfaaa1498ecf634';
  const hexString = public_key.substring(6)
  function hexToUint8Array(hex) {
    const uint8Array = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      const byteValue = parseInt(hex.substr(i, 2), 16);
      uint8Array[i / 2] = byteValue;
    }
    return uint8Array;
  }

  const pubKey = PublicKey({
    payload: hexToUint8Array(hexString),
    digest_function: 'ed25519',
  })

  

  console.log(pubKey)

  const account = RegisterBox({
    object: EvaluatesToRegistrableBox({
      expression: Expression(
        'Raw',
        Value(
          'Identifiable',
          IdentifiableBox(
            'NewAccount',
            NewAccount({
              id: accountId2,
              signatories: VecPublicKey([pubKey]),
              metadata: Metadata({ map: MapNameValue(new Map()) }),
            }),
          ),
        ),
      ),
    }),
  })

  await client.submitExecutable(
    toriiRequirements,
    Executable('Instructions', VecInstruction([Instruction('Register', account)])),
  )
}

createAccount()