import { Bytes, Hash, Hex, TypedData } from 'ox'

export const encodeTypedDataHash = (typedData: TypedData.MessageDefinition): Hex.Hex => {
  return TypedData.getSignPayload(typedData)
}

export const encodeTypedDataDigest = (typedData: TypedData.MessageDefinition): Bytes.Bytes => {
  const hash = encodeTypedDataHash(typedData)
  const digest = Bytes.fromHex(Hash.keccak256(hash))

  return digest
}
