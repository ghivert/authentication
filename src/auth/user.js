const { forbidden, response } = require('@frenchpastries/millefeuille/response')
const argon2 = require('argon2')

const { encrypt } = require('../utils/crypt')
const client = require('../pg')
const queries = require('../pg/queries')
const logger = require('../utils/logger')
const { createSession } = require('./session')
const uuidv4 = require('uuid/v4')
const uuidv5 = require('uuid/v5')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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

const sendMail = (mail, url) => {
  logger.log(mail, url)
  const msg = {
    to: mail,
    from: 'example@example.com',
    subject: 'Reset password',
    text: 'Hello, Click on the link to reset your password',
    html:
      '<a href="https://example.com/resetPassword?id=' +
      url +
      '">click to reset your password</a>',
  }
  sgMail.send(msg)
}

const generateResetUrl = async userName => {
  const cryptedUsername = encrypt(userName)
  let query = {
    text: 'SELECT * FROM users WHERE login = $1',
    values: [cryptedUsername],
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
    values: [uuid, cryptedUsername],
  }

  await client.query(query)
  sendMail(userName, uuid)
  return response('ok')
}

const changePassword = async (url, password) => {
  logger.log(url, password)
  let query = {
    text: 'SELECT * FROM reset_link WHERE id=$1',
    values: [url],
  }
  const res = await client.query(query)
  if (res.rows.length < 1) {
    return forbidden('invalid url')
  }
  const row = res.rows[0]
  logger.log(row)
  logger.log(Date.now() - row.created_at.getTime())
  if (!row.valid || Date.now() - row.created_at.getTime() > 8200000) {
    query = {
      text: 'UPDATE reset_link SET valid=false WHERE id=$1',
      values: [url],
    }
    await client.query(query)
    return forbidden('invalid url')
  }
  const cryptedUsername = row.login
  const hashedPwd = await argon2.hash(password)
  query = {
    text: 'UPDATE users SET password=$1 WHERE login=$2',
    values: [hashedPwd, cryptedUsername],
  }
  await client.query(query)
  logger.log('password changed', cryptedUsername, hashedPwd)
  query = {
    text: 'UPDATE reset_link SET valid=false WHERE id=$1',
    values: [url],
  }
  await client.query(query)
  return response('ok')
}

const generateResetUrlHandler = ({ url }) => {
  const { userName } = url.query
  logger.log(userName)
  return generateResetUrl(userName)
}

const changePasswordHandler = ({ url }) => {
  const { password, uuid } = url.query
  logger.log(uuid, password)
  return changePassword(uuid, password)
}

module.exports = {
  createUserHandler,
  authenticateUserHandler,
  generateResetUrlHandler,
  changePasswordHandler,
}
