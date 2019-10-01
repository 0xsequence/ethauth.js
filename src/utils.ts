import * as ethers from 'ethers'
import web3utils from 'web3-utils'
import * as ethjsutil from 'ethereumjs-util'
import privateKeyToAddress from 'ethereum-private-key-to-address'

export { privateKeyToAddress }
export const Wallet = ethers.Wallet
export const verifyMessage = ethers.utils.verifyMessage
export const isHexString = ethers.utils.isHexString
export const keccak256 = web3utils.keccak256
export const toChecksumAddress = (address: string): string => ethers.utils.getAddress(address)
export const removeHexPrefix = (str: string) => (str || '').replace(/^0x/, '')

export const publicKeyToAddress = (publicKey: string) => {
  return '0x' + ethjsutil.pubToAddress(Buffer.from(removeHexPrefix(publicKey), 'hex')).toString('hex')
}

export const isAddress = (address: string): boolean => {
  try {
    ethers.utils.getAddress(address)
    return true
  } catch (err) {
    return false
  }
}
