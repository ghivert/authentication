const crypto = require('crypto')

const algorithm = 'aes-256-cbc'
const { AES_KEY, AES_IV } = process.env
const iv = Buffer.from(AES_IV, 'hex')

const encrypt = text => {
  const cipher = crypto.createCipheriv(algorithm, AES_KEY, iv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

const decrypt = text => {
  const decipher = crypto.createDecipheriv(algorithm, AES_KEY, iv)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

module.exports = {
  encrypt,
  decrypt,
}
