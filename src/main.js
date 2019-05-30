require('dotenv').config()
//init pg
require('./pg')
const { get, notFound, ...Assemble } = require('@frenchpastries/assemble')
const MilleFeuille = require('@frenchpastries/millefeuille')
const { response } = require('@frenchpastries/millefeuille/response')
const client = require('@frenchpastries/customer')

const pjson = require('../package.json')
const { log } = require('./utils/logger')
const { createUserHandler, authenticateUserHandler } = require('./auth/user')
const { checkTokenHandler, logoutHandler } = require('./auth/session')

const ok = () => response('OK')

const handler = Assemble.routes([
  get('/', ok),
  get('/createUser', createUserHandler),
  get('/auth', authenticateUserHandler),
  get('/checkToken', checkTokenHandler),
  get('/logout', logoutHandler),
  notFound(() => ({ statusCode: 404 })),
])

const serviceInfos = {
  "name": pjson.name,
  "version": pjson.version,
  "address": "172.17.0.1:" + process.env.EXPOSED_PORT,
  "state": "good",
  "interface": {
    "type": "REST",
    "value": "",
  },
}

const bakeryMiddleware = client.register({
  hostname: process.env.REGISTRY_HOST,
  port: process.env.REGISTRY_PORT,
  serviceInfos,
})

const corsMiddleware = handler => request => {
  if (request.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  } else {
    const response = handler(request)
    return Promise.resolve(response)
      .then(res => ({
        ...res,
        headers: {
          ...res.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }))
  }
}

MilleFeuille.create(
  corsMiddleware(
    // bakeryMiddleware(
      handler
    // )
  )
)

log('-----> Server up and running.')
