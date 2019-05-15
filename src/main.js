require('dotenv').config()
const MilleFeuille = require('@frenchpastries/millefeuille')
const { get, post, notFound, ...Assemble } = require('@frenchpastries/assemble')
const { response } = require('@frenchpastries/millefeuille/response')
const client = require('@frenchpastries/customer')
const pjson = require('../package.json')

const handler = request => response('OK')

const serviceInfos = {
  "name": pjson.name,
  "version": pjson.version,
  "address": "172.17.0.1:" + process.env.EXPOSED_PORT,
  "state": "good",
  "interface": {
    "type": "REST",
    "value": ""
  }
}

const bakeryMiddleware = client.register({
  hostname: process.env.REGISTRY_HOST,
  port: process.env.REGISTRY_PORT,
  serviceInfos,
})

const allRoutes = Assemble.routes([
  get('/', () => ({ statusCode: 200 })),
])

MilleFeuille.create(
  bakeryMiddleware(allRoutes)
)
console.log('-----> Server up and running.')
