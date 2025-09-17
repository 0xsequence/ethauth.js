import { ethers } from 'ethers'
import { Bytes, Hash, Hex, TypedData as oxTypedData } from 'ox'

interface TypedData {
  domain: oxTypedData.Domain
  types: Record<string, oxTypedData.Parameter[]>
  message: Record<string, any>
}

export const encodeTypedDataHash = (typedData: TypedData): Hex.Hex => {
  return ethers.TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message) as Hex.Hex
}

export const encodeTypedDataDigest = (typedData: TypedData): Bytes.Bytes => {
  const hash = encodeTypedDataHash(typedData)
  const digest = Bytes.fromHex(Hash.keccak256(hash))

  return digest
}

export type { TypedData }
