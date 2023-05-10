import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import cors from '@fastify/cors'
import pino from 'pino';
import Hello from './controllers/hello'
import Iroha from './controllers/iroha'

const server: FastifyInstance = Fastify({
  logger: pino({ level: 'info' })
})

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          pong: {
            type: 'string'
          }
        }
      }
    }
  }
}
server.register(cors)
server.register(Hello, { prefix: '/hello' })
server.register(Iroha, { prefix: '/iroha' })

server.get('/ping', opts, async (req, res) => {
  return { pong: 'it worked!' }
})


const start = async () => {
  try {
    await server.listen({ port: 3001, host: "0.0.0.0" })

    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port
    console.log(`Server listening at ${address} and port ${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()