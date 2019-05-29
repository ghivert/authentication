const crypto = require('crypto')
const algorithm = 'aes-256-cbc'
const password = process.env.AES_KEY
const iv = Buffer.from(process.env.AES_IV, 'hex')

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, password, iv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

const decrypt = (text) => {
  const decipher = crypto.createDecipheriv(algorithm, password, iv)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

module.exports = {
  encrypt,
  decrypt,
}
