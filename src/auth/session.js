const {log} = require('../utils/logger')
const {response, forbidden} = require('@frenchpastries/millefeuille/response')
const jwt = require('jsonwebtoken')
const client = require('../pg')

const createSession = async (uuid, origin) => {
  log({uuid, origin})
  const token = await jwt.sign({
    uuid
  }, process.env.RSA_PRIVATE_KEY, {
    expiresIn: '10y',
    algorithm: 'RS256'
  })

  const query = {
    text: 'INSERT INTO sessions (user_id,  token,  origin) VALUES($1, $2, $3)',
    values: [uuid, token, origin]
  }
  await client.query(query)
  return response(token)
}

const checkToken = async (token) => {
  const query = {
    text: 'SELECT * FROM sessions WHERE token=$1',
    values: [token]
  }
  const res = await client.query(query)
  const row = res.rows[0]
  if (row.expired) {
    return forbidden('token expired')
  }
  const verify = await jwt.verify(token, process.env.RSA_PUBLIC_KEY)
  if(!verify){
    logout(token)
    return forbidden('token invalid')
  }
  return response(verify.uuid)
}

const logout = async (token) => {
  const query = {
    text: 'UPDATE sessions SET expired = true WHERE token=$1',
    values: [token]
  }
  await client.query(query)
  return response('ok')
}

const checkTokenHandler = async ({url}) => {
  const token = url.query.token
  log(token)
  return checkToken(token)
}

const logoutHandler = async ({url}) => {
  const token  = url.query.token
  log(token)
  return logout(token)
}

module.exports = {
  createSession,
  checkTokenHandler,
  logoutHandler
}
