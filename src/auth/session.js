import { response, forbidden } from '@frenchpastries/millefeuille/response.js'
import * as logger from '../utils/logger.js'
import client from '../pg/pg.js'
import * as queries from '../pg/queries.js'
import * as jwt from './jwt.js'

export const createSession = async (uuid, origin) => {
  logger.log({ uuid, origin })
  const token = await jwt.sign(uuid)
  await client.query(queries.session.create({ uuid, token, origin }))
  return response(token)
}

const checkToken = async token => {
  const res = await client.query(queries.session.select(token))
  const [row] = res.rows
  if (row && row.expired) return forbidden('Expired Token')
  const verify = await jwt.verify(token)
  if (verify) return response(verify.uuid)
  await logout(token)
  return forbidden('Invalid Token')
}

const logout = async token => {
  await client.query(queries.session.expire(token))
  return response('OK')
}

export const checkTokenHandler = async ({ body }) => {
  const { token } = JSON.parse(body)
  logger.log(token)
  return checkToken(token)
}

export const logoutHandler = async ({ body }) => {
  const { token } = JSON.parse(body)
  logger.log(token)
  return logout(token)
}
