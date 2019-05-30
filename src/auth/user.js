const { forbidden } = require('@frenchpastries/millefeuille/response')
const argon2 = require('argon2')

const { encrypt } = require('../utils/crypt')
const client = require('../pg')
const { log } = require('../utils/logger')
const { createSession } = require('./session')

const createUser = async (userName, password) => {
  const cryptedUsername = encrypt(userName)
  const hashedPwd = await argon2.hash(password)
  const query = {
    text: 'INSERT INTO users (login, password) VALUES ($1, $2)',
    values: [ cryptedUsername, hashedPwd ],
  }
  await client.query(query)
  return authenticateUser(userName, password, 'ikigai')
}

const authenticateUser = async (userName, password, origin) => {
  const cryptedUsername = encrypt(userName)
  const query = {
    text: 'SELECT * FROM users WHERE login = $1',
    values: [cryptedUsername],
  }
  const res = await client.query(query)
  const row = res.rows[0]
  log(row)
  const correct = await argon2.verify(row.password, password)
  if (correct) {
    return createSession(row.id, origin)
  } else {
    return forbidden('bad credentials')
  }
}

const createUserHandler = ({ url }) => {
  const { userName, password } = url.query
  log({ userName, password })
  return createUser(userName, password)
}

const authenticateUserHandler = ({ url }) => {
  const { userName, password, origin } = url.query
  log({ userName, password, origin })
  return authenticateUser(userName, password, origin)
}

module.exports = {
  createUserHandler,
  authenticateUserHandler,
}
