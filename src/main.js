import 'dotenv/config'
import './pg/pg.js'
import { get, post, del, notFound, routes } from '@frenchpastries/assemble'
import millefeuille from '@frenchpastries/millefeuille'
import { response } from '@frenchpastries/millefeuille/response.js'
import client from '@frenchpastries/customer'
import * as logger from './utils/logger.js'
import {
  createUserHandler,
  authenticateUserHandler,
  generateResetUrlHandler,
  changePasswordHandler,
} from './auth/user.js'
import { checkTokenHandler, logoutHandler } from './auth/session.js'
const { version } = require('../package.json')

const { PORT, REGISTRY_HOST, REGISTRY_PORT, HOSTNAME } = process.env

const ok = () => response('OK')

const handler = routes([
  get('/', ok),
  post('/sign-up', createUserHandler),
  post('/sign-in', authenticateUserHandler),
  del('/sign-out', logoutHandler),
  post('/check-token', checkTokenHandler),
  post('/reset-password', changePasswordHandler),
  post('/send-mail-reset', generateResetUrlHandler),
  notFound(() => ({ statusCode: 404 })),
])

const serviceInfos = {
  name: 'authentication',
  version,
  address: `${HOSTNAME}:${PORT}`,
  state: 0,
  interface: {
    type: 'REST',
    value: handler.exportRoutes(),
  },
}

const bakeryMiddleware = client.register({
  hostname: REGISTRY_HOST,
  port: REGISTRY_PORT,
  serviceInfos,
})

export const start = middleware => {
  const h = middleware instanceof Function ? middleware(handler) : handler
  const _server = millefeuille.create(bakeryMiddleware(h))
  logger.log('-----> Server up and running.')
}
