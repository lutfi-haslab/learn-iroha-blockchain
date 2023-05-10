import { FastifyInstance, RouteShorthandOptions, FastifyRequest, FastifyReply } from 'fastify'

async function routes(app: FastifyInstance, options: RouteShorthandOptions) {
  app.get('/', async (req: FastifyRequest, res: FastifyReply) => {
    return { hello: 'world' }
  })
}

export default routes