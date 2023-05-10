import { FastifyInstance, RouteShorthandOptions, FastifyRequest, FastifyReply } from 'fastify'
import { registerDomain, ensureDomainExistence } from '../lib/irohaCmd';

async function routes(app: FastifyInstance, options: RouteShorthandOptions) {
  app.get('/register-domain', async (req: FastifyRequest, res: FastifyReply) => {
    const data: any = await registerDomain('looking_glass');
    return { data }
  })

  app.get('/check-domain', async (req: FastifyRequest, res: FastifyReply) => {
    const data: any = await ensureDomainExistence('looking_glass')
    return { data }
  })
}

export default routes