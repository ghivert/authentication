const MilleFeuille = require('@frenchpastries/millefeuille')
const { response } = require('@frenchpastries/millefeuille/response')

const handler = request => response('OKK')

MilleFeuille.create(handler)

console.log('-----> Server up and running.')
