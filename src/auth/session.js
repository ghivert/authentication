const path = require('path')
const fs = require('fs')
const { response, forbidden } = require('@frenchpastries/millefeuille/response')
const jwt = require('jsonwebtoken')

const logger = require('../utils/logger')
const client = require('../pg')
const queries = require('../pg/queries')

const getRSAKeys = () => {
  try {
    const { RSA_PRIVATE_KEY, RSA_PUBLIC_KEY } = process.env
    if (RSA_PRIVATE_KEY && RSA_PUBLIC_KEY) {
      return {
        publicKey: RSA_PUBLIC_KEY,
        privateKey: RSA_PRIVATE_KEY,
      }
    }
    const keysPath = path.resolve(process.cwd(), 'keys')
    const publicPath = path.resolve(keysPath, 'public_key.pem')
    const privatePath = path.resolve(keysPath, 'private_key.pem')
    const publicKey = fs.readFileSync(publicPath, 'utf8')
    const privateKey = fs.readFileSync(privatePath, 'utf8')
    if (publicKey && privateKey) {
      return { publicKey, privateKey }
    }
    console.log('No keys found, exiting.')
    process.exit(1)
  } catch (error) {
    console.log('No keys found, exiting.')
    process.exit(1)
  }
}

const { publicKey, privateKey } = getRSAKeys()

const signJWT = uuid => {
  const options = {
    expiresIn: '10y',
    algorithm: 'RS256',
  }
  return new Promise((resolve, reject) => {
    jwt.sign({ uuid }, publicKey, options, (err, res) =>
      err ? reject(err) : resolve(res)
    )
  })
}

const verifyJWT = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, privateKey, (err, res) =>
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
