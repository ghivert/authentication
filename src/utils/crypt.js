const crypto = require('crypto'),
  algorithm = 'aes-256-cbc',
  password = process.env.AES_KEY,
  iv = Buffer.from(process.env.AES_IV, 'hex');

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, password, iv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, password, iv)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
  encrypt,
  decrypt
}
