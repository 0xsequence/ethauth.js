import { Bytes, Hex, TypedData } from 'ox';
export declare const encodeTypedDataHash: (typedData: TypedData.MessageDefinition) => Hex.Hex;
export declare const encodeTypedDataDigest: (typedData: TypedData.MessageDefinition) => Bytes.Bytes;
