import path from 'path'
import fs from 'fs'

const keysFromEnvironment = () => {
  const { RSA_PRIVATE_KEY, RSA_PUBLIC_KEY } = process.env
  if (RSA_PRIVATE_KEY && RSA_PUBLIC_KEY) {
    return { publicKey: RSA_PUBLIC_KEY, privateKey: RSA_PRIVATE_KEY }
  }
}

const keysFromFileSystem = () => {
  const keysPath = path.resolve(process.cwd(), 'keys')
  const publicPath = path.resolve(keysPath, 'public_key.pem')
  const privatePath = path.resolve(keysPath, 'private_key.pem')
  const publicKey = fs.readFileSync(publicPath, 'utf8')
  const privateKey = fs.readFileSync(privatePath, 'utf8')
  if (publicKey && privateKey) return { publicKey, privateKey }
}

export const getRSA = () => {
  try {
    const result = keysFromEnvironment() || keysFromFileSystem()
    if (result) return result
    throw new Error()
  } catch (error) {
    console.log('No keys found, exiting.')
    process.exit(1)
  }
}
