import { ethers } from 'ethers'

interface TypedData {
  domain: TypedDataDomain
  types: Record<string, Array<TypedDataField>>
  message: Record<string, any>
}

interface TypedDataDomain {
  name?: string
  version?: string
  chainId?: ethers.BigNumberish
  verifyingContract?: string
  salt?: ethers.BytesLike
}

interface TypedDataField {
  name: string
  type: string
}

export const encodeTypedDataHash = (typedData: TypedData) => {
  return ethers.TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message)
}

export const encodeTypedDataDigest = (typedData: TypedData) => {
  const hash = encodeTypedDataHash(typedData)
  const digest = ethers.getBytes(ethers.keccak256(hash))
  return digest
}

export type { TypedData, TypedDataDomain, TypedDataField }
