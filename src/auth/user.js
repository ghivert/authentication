const { forbidden } = require('@frenchpastries/millefeuille/response')
const argon2 = require('argon2')

const { encrypt } = require('../utils/crypt')
const client = require('../pg')
const queries = require('../pg/queries')
const logger = require('../utils/logger')
const { createSession } = require('./session')

const { ORIGIN } = process.env

const createUser = async (username, password) => {
  const cryptedUsername = encrypt(username)
  const hashedPwd = await argon2.hash(password)
  await client.query(queries.user.create(cryptedUsername, hashedPwd))
  return authenticateUser(username, password, ORIGIN)
}

const authenticateUser = async (username, password, origin) => {
  const cryptedUsername = encrypt(username)
  const res = await client.query(queries.user.select(cryptedUsername))
  const [row] = res.rows
  logger.log(row)
  if (row) {
    const correct = await argon2.verify(row.password, password)
    if (correct) {
      return createSession(row.id, origin)
    } else {
      return forbidden('Bad Credentials')
    }
  } else {
    return forbidden('Bad Credentials')
  }
}

const createUserHandler = ({ body }) => {
  const { username, password } = JSON.parse(body)
  logger.log({ username, password })
  return createUser(username, password)
}

const authenticateUserHandler = ({ body }) => {
  const { username, password, origin } = JSON.parse(body)
  logger.log({ username, password, origin })
  return authenticateUser(username, password, origin)
}

module.exports = {
  createUserHandler,
  authenticateUserHandler,
}
