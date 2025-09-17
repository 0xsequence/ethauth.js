import { ethers } from 'ethers'
import { Hex } from 'ox'

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

export const encodeTypedDataHash = (typedData: TypedData): Hex.Hex => {
  return ethers.TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message) as Hex.Hex
}

export const encodeTypedDataDigest = (typedData: TypedData) => {
  const hash = encodeTypedDataHash(typedData)
  const digest = ethers.getBytes(ethers.keccak256(hash))
  return digest
}

export type { TypedData, TypedDataDomain, TypedDataField }
