import {
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
  VecInstruction
} from "@iroha2/data-model";
import { client, toriiRequirements } from "../config/iroha";


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

  await client.submitExecutable(
    toriiRequirements,
    Executable(
      "Instructions",
      VecInstruction([Instruction("Register", registerBox)])
    )
  );
}

export const ensureDomainExistence = async (domainName: string) => {
  // Query all domains
  const result = await client.requestWithQueryBox(
    toriiRequirements,
    QueryBox('FindAllDomains', null),
  )
  console.log('%o', result)
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

  return data
  
}