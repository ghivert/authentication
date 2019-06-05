const {forbidden, response} = require('@frenchpastries/millefeuille/response')
const argon2 = require('argon2')
const uuidv4 = require('uuid/v4')
const uuidv5 = require('uuid/v5')

const {encrypt} = require('../utils/crypt')
const client = require('../pg')
const {log} = require('../utils/logger')
const {createSession} = require('./session')

const createUser = async (userName, password) => {
  const cryptedUsername = encrypt(userName)
  const hashedPwd = await argon2.hash(password)
  const query = {
    text: 'INSERT INTO users (login, password) VALUES ($1, $2)',
    values: [cryptedUsername, hashedPwd]
  }
  await client.query(query)
  return authenticateUser(userName, password, 'ikigai')
}

const authenticateUser = async (userName, password, origin) => {
  const cryptedUsername = encrypt(userName)
  const query = {
    text: 'SELECT * FROM users WHERE login = $1',
    values: [cryptedUsername]
  }
  const res = await client.query(query)
  if (res.rows.length < 1) {
    return forbidden('user unknown')
  }
  const row = res.rows[0]
  log(password)
  log(row)
  const correct = await argon2.verify(row.password, password)
  if (correct) {
    return createSession(row.id, origin)
  } else {
    return forbidden('bad credentials')
  }
}

const sendMail = (mail, url) => {
  //TODO
  log(mail, url)
}

const generateResetUrl = async (userName) => {
  const cryptedUsername = encrypt(userName)
  let query = {
    text: 'SELECT * FROM users WHERE login = $1',
    values: [cryptedUsername]
  }
  const res = await client.query(query)
  if (res.rows.length < 1) {
    return forbidden('user unknown')
  }
  //TO CHANGE IN PROD
  const seed = uuidv4()
  const uuid = uuidv5(cryptedUsername, seed)
  query = {
    text: 'INSERT INTO reset_link (id, login) VALUES ($1, $2)',
    values: [uuid, cryptedUsername]
  }

  await client.query(query)
  sendMail(userName, uuid)
  return response('ok')
}

const changePassword = async (url, password) => {
  log(url, password)
  let query = {
    text: 'SELECT * FROM reset_link WHERE id=$1',
    values: [url]
  }
  const res = await client.query(query)
  if (res.rows.length < 1) {
    return forbidden('invalid url')
  }
  const row = res.rows[0]
  log(row)
  log((Date.now() - row.created_at.getTime()))
  if (!row.valid || (Date.now() - row.created_at.getTime()) > 8200000) {
    query = {
      text: 'UPDATE reset_link SET valid=false WHERE id=$1',
      values: [url]
    }
    await client.query(query)
    return forbidden('invalid url')
  }
  const cryptedUsername = encrypt(row.login)
  const hashedPwd = await argon2.hash(password)
  query = {
    text: 'UPDATE users SET password=$1 WHERE login=$2',
    values: [hashedPwd, cryptedUsername]
  }
  await client.query(query)
  log('password changed', cryptedUsername, hashedPwd)
  query = {
    text: 'UPDATE reset_link SET valid=false WHERE id=$1',
    values: [url]
  }
  await client.query(query)
  return response('ok')
}

const createUserHandler = ({url}) => {
  const {userName, password} = url.query
  log({userName, password})
  return createUser(userName, password)
}

const authenticateUserHandler = ({url}) => {
  const {userName, password, origin} = url.query
  log({userName, password, origin})
  return authenticateUser(userName, password, origin)
}

const generateResetUrlHandler = ({url}) => {
  const {userName} = url.query
  log(userName)
  return generateResetUrl(userName)
}

const changePasswordHandler = ({url}) => {
  const {password, uuid} = url.query
  log(uuid, password)
  return changePassword(uuid, password)
}

module.exports = {
  createUserHandler,
  authenticateUserHandler,
  generateResetUrlHandler,
  changePasswordHandler
}
