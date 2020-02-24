const { response, forbidden } = require('@frenchpastries/millefeuille/response')
const jwt = require('jsonwebtoken')

const keys = require('../utils/keys')
const logger = require('../utils/logger')
const client = require('../pg')
const queries = require('../pg/queries')

const { publicKey, privateKey } = keys.getRSA()

const signJWT = uuid => {
  const options = {
    expiresIn: '10y',
    algorithm: 'RS256',
  }
  return new Promise((resolve, reject) => {
    jwt.sign({ uuid }, privateKey, options, (err, res) =>
      err ? reject(err) : resolve(res)
    )
  })
}

const verifyJWT = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, (err, res) =>
      err ? reject(err) : resolve(res)
    )
  })
}

const createSession = async (uuid, origin) => {
  logger.log({ uuid, origin })
  const token = await signJWT(uuid)
  await client.query(queries.session.create({ uuid, token, origin }))
  return response(token)
}

const checkToken = async token => {
  const res = await client.query(queries.session.select(token))
  const [row] = res.rows
  if (row && row.expired) {
    return forbidden('Expired Token')
  } else {
    const verify = await verifyJWT(token)
    if (!verify) {
      logout(token)
      return forbidden('Invalid Token')
    } else {
      return response(verify.uuid)
    }
  }
}

const logout = async token => {
  await client.query(queries.session.expire(token))
  return response('OK')
}

const checkTokenHandler = async ({ body }) => {
  const { token } = JSON.parse(body)
  logger.log(token)
  return checkToken(token)
}

const logoutHandler = async ({ body }) => {
  const { token } = JSON.parse(body)
  logger.log(token)
  return logout(token)
}

module.exports = {
  createSession,
  checkTokenHandler,
  logoutHandler,
}
