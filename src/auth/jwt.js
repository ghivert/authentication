import * as keys from '../utils/keys.js'
import jwt from 'jsonwebtoken'

const { publicKey, privateKey } = keys.getRSA()

export const sign = uuid => {
  const options = { expiresIn: '10y', algorithm: 'RS256' }
  return new Promise((resolve, reject) => {
    jwt.sign({ uuid }, privateKey, options, (err, res) => {
      err ? reject(err) : resolve(res)
    })
  })
}

export const verify = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, (err, res) => {
      err ? reject(err) : resolve(res)
    })
  })
}
