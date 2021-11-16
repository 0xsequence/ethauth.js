import { ethers } from 'ethers'
import { Proof } from './proof'

export type ValidatorFunc = (provider: ethers.providers.JsonRpcProvider, chainId: number, proof: Proof) => Promise<{ isValid: boolean, address?: string }>

// ValidateEOAProof verifies the account proof, testing if the proof claims have been signed with an
// EOA (externally owned account) and will return success/failture, the account address as a string, and any errors.
export const ValidateEOAProof: ValidatorFunc = async (provider: ethers.providers.JsonRpcProvider, chainId: number, proof: Proof): Promise<{ isValid: boolean, address?: string }> => {

  // Compute eip712 message digest from the proof claims
  const messageDigest = proof.messageDigest()

  // Recover address from digest + signature
  const address = ethers.utils.verifyMessage(messageDigest, proof.signature)
  if (address.slice(0,2) === '0x' && address.length === 42 &&
  address.toLowerCase() === proof.address.toLowerCase()) {
    return { isValid: true, address: proof.address }
  } else {
    return { isValid: false }
  }
}

// ValidateContractAccountProof verifies the account proof, testing if the
// proof claims have been signed with a smart-contract based account by calling the EIP-1271
// method of the remote contract. This method will return success/failure, the
// account address as a string, and any errors. The wallet contract must be deployed in
// order for this call to be successful. In order test an undeployed smart-wallet, you
// will have to implement your own custom validator method.
export const ValidateContractAccountProof: ValidatorFunc = async (provider: ethers.providers.JsonRpcProvider, chainId: number, proof: Proof): Promise<{ isValid: boolean, address?: string }> => {

  if (!provider || provider === undefined) {
    return { isValid: false }
  }

  // Compute eip712 message digest from the proof claims
  const messageDigest = proof.messageDigest()

  // Early check to ensure the contract wallet has been deployed
  const walletCode = await provider.getCode(proof.address)
  if (walletCode === '0x' || walletCode.length <= 2) {
    throw new Error('ValidateContractAccountProof failed. unable to fetch wallet contract code')
  }

  // Call EIP-1271 IsValidSignature(bytes32, bytes) method on the deployed wallet. Note: for undeployed
  // wallets, you will need to implement your own ValidatorFunc with the additional context.
  const abi = [ 'function isValidSignature(bytes32, bytes) public view returns (bytes4)' ]
  const contract = new ethers.Contract(proof.address, abi, provider)

  // hash the message digest as required by isValidSignature
  const messageHash = ethers.utils.arrayify(ethers.utils.keccak256(messageDigest))

  const isValidSignature = await contract.isValidSignature(messageHash, ethers.utils.arrayify(proof.signature))

  if (isValidSignature === IsValidSignatureBytes32MagicValue) {
    return { isValid: true, address: proof.address }
  } else {
    return { isValid: false }
  }
}

// ValidateTrue will always return a proof to be valid. This is useful if you'd like to have
// a noop validator, or to skip validation at this level. Such a feature is useful if you're
// validating in another code path and want to optimize double-validations.
export const ValidateTrue: ValidatorFunc = async () => {
  return { isValid: true }
}

// IsValidSignatureBytes32 is the EIP-1271 magic value we test
export const IsValidSignatureBytes32MagicValue = '0x1626ba7e'
