import { ethers } from 'ethers'
import { Token } from './token'

export type ValidatorFunc = (provider: ethers.providers.JsonRpcProvider, chainId: number, token: Token) => Promise<{ isValid: boolean, address?: string }>

// ValidateEOAToken verifies the account proof of the provided ewt, testing if the
// token has been signed with an EOA (externally owned account) and will return
// success/failture, the account address as a string, and any errors.
export const ValidateEOAToken: ValidatorFunc = async (provider: ethers.providers.JsonRpcProvider, chainId: number, token: Token): Promise<{ isValid: boolean, address?: string }> => {

  // Compute eip712 message digest from the token claims
  const messageDigest = token.messageDigest()

  // Recover address from digest + signature
  const address = ethers.utils.verifyMessage(messageDigest, token.signature)
  if (address.slice(0,2) === '0x' && address.length === 42 &&
  address.toLowerCase() === token.address.toLowerCase()) {
    return { isValid: true }
  } else {
    return { isValid: false }
  }
}

// ValidateContractAccountToken verifies the account proof of the provided ewt, testing if the
// token has been signed with a smart-contract based account by calling the EIP-1271
// method of the remote contract. This method will return success/failure, the
// account address as a string, and any errors. The wallet contract must be deployed in
// order for this call to be successful. In order test an undeployed smart-wallet, you
// will have to implement your own custom validator method.
export const ValidateContractAccountToken: ValidatorFunc = async (provider: ethers.providers.JsonRpcProvider, chainId: number, token: Token): Promise<{ isValid: boolean, address?: string }> => {

  if (!provider || provider === undefined) {
    return { isValid: false }
  }

  // Compute eip712 message digest from the token claims
  const messageDigest = token.messageDigest()

  // Early check to ensure the contract wallet has been deployed
  const walletCode = await provider.getCode(token.address)
  if (walletCode === '0x' || walletCode.length <= 2) {
    throw new Error('ValidateContractAccountToken failed. unable to fetch wallet contract code')
  }

  // Call EIP-1271 IsValidSignature(bytes32, bytes) method on the deployed wallet. Note: for undeployed
  // wallets, you will need to implement your own ValidatorFunc with the additional context.
  const abi = [ 'function isValidSignature(bytes32, bytes) public view returns (bytes4)' ]
  const contract = new ethers.Contract(token.address, abi, provider)

  // hash the message digest as required by isValidSignature
  const messageHash = ethers.utils.arrayify(ethers.utils.keccak256(messageDigest))

  const isValidSignature = await contract.isValidSignature(messageHash, ethers.utils.arrayify(token.signature))

  if (isValidSignature === IsValidSignatureBytes32MagicValue) {
    return { isValid: true }
  } else {
    return { isValid: false }
  }
}

// IsValidSignatureBytes32 is the EIP-1271 magic value we test
export const IsValidSignatureBytes32MagicValue = '0x1626ba7e'
