import {
  FastifyInstance,
  RouteShorthandOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import {
  registerDomain,
  ensureDomainExistence,
  createAccount,
  registerAsset,
  mintAsset,
  burnAsset,
  getAllDomain,
  getAllAccount,
  getAllAsset,
  transferAsset,
  getBalance,
} from "../lib/irohaCmd";

async function routes(app: FastifyInstance, options: RouteShorthandOptions) {
  app.get(
    "/domains",
    async (
      req: FastifyRequest,
      res: FastifyReply
    ) => {
      const data: any = await getAllDomain();
      console.log(data)
      return { data };
    }
  );

  app.get(
    "/accounts",
    async (
      req: FastifyRequest,
      res: FastifyReply
    ) => {
      const data: any = await getAllAccount();
      return { data };
    }
  );

  app.get(
    "/assets",
    async (
      req: FastifyRequest,
      res: FastifyReply
    ) => {
      const data: any = await getAllAsset();
      return { data };
    }
  );

  app.get(
    "/get-account/:id",
    async (
      req: FastifyRequest<{
        Params: {
          id: string
        }
      }>,
      res: FastifyReply
    ) => {
      const data: any = await getBalance(req.params.id);
      return { data };
    }
  );

  app.post(
    "/register-domain",
    async (
      req: FastifyRequest<{
        Body: {
          name: string;
        };
      }>,
      res: FastifyReply
    ) => {
      const { name } = req.body;
      const data: any = await registerDomain(name);
      return { data };
    }
  );

  app.post(
    "/register-account",
    async (
      req: FastifyRequest<{
        Body: {
          accountId: string;
          domainId: string;
        };
      }>,
      res: FastifyReply
    ) => {
      const { accountId, domainId } = req.body;
      const data: any = await createAccount({
        accountId,
        domainId
      });
      return { data };
    }
  );

  app.post(
    "/register-asset",
    async (
      req: FastifyRequest<{
        Body: {
          domainId: string;
          assetName: string;
        };
      }>,
      res: FastifyReply
    ) => {
      const { domainId, assetName } = req.body;
      const data: any = await registerAsset({
        assetName,
        domainId,
        mintType: "Infinitely",
      });
      return { data };
    }
  );

  app.post(
    "/mint-asset",
    async (
      req: FastifyRequest<{
        Body: {
          signer: string;
          mintValue: number;
        };
      }>,
      res: FastifyReply
    ) => {
      const { signer, mintValue } =
        req.body;
      const data: any = await mintAsset({
        signer,
        mintValue,
      });
      return { data };
    }
  );

  app.post(
    "/burn-asset",
    async (
      req: FastifyRequest<{
        Body: {
          signer: string;
          burnValue: number;
        };
      }>,
      res: FastifyReply
    ) => {
      const { signer, burnValue } =
        req.body;
      const data: any = await burnAsset({
        signer,
        burnValue,
      });
      return { data };
    }
  );

  app.post(
    "/transfer",
    async (
      req: FastifyRequest<{
        Body: {
          from: string;
          to: string;
          domain: string;
          assetName: string;
          amount: number;
          fromFsp?: boolean;
          fromCentral?: boolean;
          fromEnterprise?: boolean;
        };
      }>,
      res: FastifyReply
    ) => {
      const { from, to, amount } =
        req.body;
      const data: any = await transferAsset({
        from,
        to,
        amount,
      });
      return { data };
    }
  );

  app.get(
    "/check-domain/:name",
    async (
      req: FastifyRequest<{
        Params: {
          name: string;
        };
      }>,
      res: FastifyReply
    ) => {
      const { name } = req.params;
      const data: any = await ensureDomainExistence(name);
      return { data };
    }
  );
}

export default routes;
