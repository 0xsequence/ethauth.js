import { ethers } from 'ethers'

interface TypedData {
  domain: TypedDataDomain
  types: Record<string, Array<TypedDataField>>
  value: Record<string, any>
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
  return ethers.utils._TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.value)
}

export const encodeTypedDataDigest = (typedData: TypedData) => {
  const hash = encodeTypedDataHash(typedData)
  const digest = ethers.utils.arrayify(ethers.utils.keccak256(hash))
  return digest
}

export type { TypedData, TypedDataDomain, TypedDataField }
