import { forbidden, response } from '@frenchpastries/millefeuille/response.js'
import argon2 from 'argon2'
import { encrypt } from '../utils/crypt.js'
import client from '../pg/pg.js'
import * as queries from '../pg/queries.js'
import * as logger from '../utils/logger.js'
import { createSession } from './session.js'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import sgMail from '@sendgrid/mail'

const { ORIGIN, SENDGRID_API_KEY } = process.env

sgMail.setApiKey(SENDGRID_API_KEY)

const sendMail = (mail, url) => {
  logger.log(mail, url)
  const msg = {
    to: mail,
    from: 'example@example.com',
    subject: 'Reset password',
    text: 'Hello, Click on the link to reset your password',
    html: `<a href="https://example.com/resetPassword?id=${url}">
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
  if (!row) return forbidden('Bad Credentials')
  const correct = await argon2.verify(row.password, password)
  if (correct) {
    return createSession(row.id, origin)
  } else {
    return forbidden('Bad Credentials')
  }
}

const generateResetUrl = async username => {
  const cryptedUsername = encrypt(username)
  const res = await client.query(queries.user.select(cryptedUsername))
  const [row] = res.rows
  if (!row) return forbidden('Bad Credentials')
  if (process.env.NODE_ENV === 'development') {
    const seed = uuidv4()
    const uuid = uuidv5(cryptedUsername, seed)
    await client.query(queries.resetLink.create(uuid, cryptedUsername))
    sendMail(username, uuid)
    return response('OK')
  } else {
    return { statusCode: 500 }
  }
}

const changePassword = async (resetId, password) => {
  logger.log(resetId, password)
  const res = await client.query(queries.resetLink.select(resetId))
  const [row] = res.row
  if (!row) return forbidden('Invalid URL')
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
    await client.query(queries.resetLink.invalid(resetId))
    return response('OK')
  }
}

export const createUserHandler = async ({ body }) => {
  try {
    const { username, password } = JSON.parse(body)
    logger.log({ username, password })
    return await createUser(username, password)
  } catch (error) {
    console.error(error)
    return { statusCode: 503, body: 'Email already in database.' }
  }
}

export const authenticateUserHandler = ({ body }) => {
  const { username, password, origin } = JSON.parse(body)
  logger.log({ username, password, origin })
  return authenticateUser(username, password, origin)
}

export const generateResetUrlHandler = ({ body }) => {
  const { username } = JSON.parse(body)
  logger.log(username)
  return generateResetUrl(username)
}

export const changePasswordHandler = ({ body }) => {
  const { password, resetId } = JSON.parse(body)
  logger.log(resetId, password)
  return changePassword(resetId, password)
}
