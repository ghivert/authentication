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

const { ORIGIN, SENDGRID_API_KEY } = process.env

sgMail.setApiKey(SENDGRID_API_KEY)

const sendMail = (mail, url) => {
  logger.log(mail, url)
  const msg = {
    to: mail,
    from: 'example@example.com',
    subject: 'Reset password',
    text: 'Hello, Click on the link to reset your password',
    html:
      `<a href="https://example.com/resetPassword?id=${url}">
        click to reset your password
      </a>`,
  }
  sgMail.send(msg)
}

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

const generateResetUrl = async username => {
  const cryptedUsername = encrypt(username)
  const res = await client.query(queries.user.select(cryptedUsername))
  const [row] = res.rows
  if (row) {
    if (process.env.NODE_ENV === 'development') {
      const seed = uuidv4()
      const uuid = uuidv5(cryptedUsername, seed)
      await client.query(queries.resetLink.create(uuid, cryptedUsername))
      sendMail(username, uuid)
      return response('ok')
    } else {
      return { statusCode: 500 }
    }
  } else {
    return forbidden('Bad Credentials')
  }
}

const changePassword = async (resetId, password) => {
  logger.log(resetId, password)
  const res = await client.query(queries.resetLink.select(resetId))
  const [row] = res.row
  if (row) {
    const { valid, login, created_at } = row
    logger.log(row)
    logger.log(Date.now() - created_at.getTime())
    if (!valid || Date.now() - created_at.getTime() > 8200000) {
      await client.query(queries.resetLink.invalid(resetId))
      return forbidden('Invalid URL')
    } else {
      const cryptedUsername = login
      const hashedPwd = await argon2.hash(password)
      await client.query(queries.user.updatePassword(hashedPwd, cryptedUsername))
      logger.log('Password changed:', cryptedUsername, hashedPwd)
      await client.query(queries.resetLink.invalidResetLink(resetId))
      return response('OK')
    }
  } else {
    return forbidden('Invalid URL')
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

const generateResetUrlHandler = ({ body }) => {
  const { username } = JSON.parse(body)
  logger.log(username)
  return generateResetUrl(username)
}

const changePasswordHandler = ({ body }) => {
  const { password, uuid } = JSON.parse(body)
  logger.log(uuid, password)
  return changePassword(uuid, password)
}

module.exports = {
  createUserHandler,
  authenticateUserHandler,
  generateResetUrlHandler,
  changePasswordHandler,
}
