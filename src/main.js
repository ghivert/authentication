require('./pg')

const { get, post, del, notFound, routes } = require('@frenchpastries/assemble')
const MilleFeuille = require('@frenchpastries/millefeuille')
const { response } = require('@frenchpastries/millefeuille/response')
const client = require('@frenchpastries/customer')

const { name, version } = require('../package.json')
const logger = require('./utils/logger')
const {
  createUserHandler,
  authenticateUserHandler,
  generateResetUrlHandler,
  changePasswordHandler,
} = require('./auth/user')
const { checkTokenHandler, logoutHandler } = require('./auth/session')

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
  name,
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

const start = middleware => {
  if (middleware instanceof Function) {
    MilleFeuille.create(bakeryMiddleware(middleware(handler)))
  } else {
    MilleFeuille.create(bakeryMiddleware(handler))
  }
  logger.log('-----> Server up and running.')
}

module.exports = { start }
