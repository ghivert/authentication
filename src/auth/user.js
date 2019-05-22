const {encrypt} = require('../utils/crypt')
const {response, forbidden} = require('@frenchpastries/millefeuille/response')
const argon2 = require('argon2')
const client = require('../pg')
const {log} = require('../utils/logger')
const {createSession} = require('./session')

const createUser = async (userName, password) => {
  const cryptedUsername = encrypt(userName)
  const hashedPwd = await argon2.hash(password)
  const query = {
    text: 'INSERT INTO users (login, password) VALUES($1, $2)',
    values: [cryptedUsername, hashedPwd]
  }
  await client.query(query)
  return authenticateUser(userName, password, 'ikigai')
}

const authenticateUser = async (userName, password, origin) => {
  const cryptedUsername = encrypt(userName)
  const query = {
    text: 'SELECT * FROM users WHERE login=$1',
    values: [cryptedUsername]
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

const createUserHandler = ({url}) => {
  log({userName: url.query.userName, password: url.query.password})
  const userName = url.query.userName
  const password = url.query.password
  return createUser(userName, password)
}

const authenticateUserHandler = ({url}) => {
  log({userName: url.query.userName, password: url.query.password, origin: url.query.origin})
  const userName = url.query.userName
  const password = url.query.password
  const origin = url.query.origin
  return authenticateUser(userName, password, origin)
}

module.exports = {
  createUserHandler,
  authenticateUserHandler
}
