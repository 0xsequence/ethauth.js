import * as utils from './utils'

// Validate the public key address of an Ethereum signed message
export const validateEthSignature = (address: string, message: string, signature: string): boolean => {
  if (!utils.isAddress(address)) {
    throw new Error('ethwebtoken: address is not a valid Ethereum address')
  }

  if (message.length < 1 || signature.length < 1) {
    throw new Error('ethwebtoken: message and signature must not be empty')
  }

  if (message.length > 100 || signature.length > 150) {
    throw new Error('ethwebtoken: message and signature exceed size limit')
  }

  if (!utils.isHexString(signature)) {
    throw new Error('ethwebtoken: signature is an invalid hex string')
  }

  const buf = Buffer.from(utils.removeHexPrefix(signature), 'hex')
  if (buf.byteLength !== 65) {
    throw new Error('ethwebtoken: signature is not of proper length')
  }

  const recoveredAddress = utils.verifyMessage(message, signature)
  const verified = (utils.toChecksumAddress(recoveredAddress) ===
    utils.toChecksumAddress(address))

  if (!verified) {
    throw new Error('ethwebtoken: invalid signature')
  }

  return true
}
