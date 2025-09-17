import { Bytes, Hex, TypedData as oxTypedData } from 'ox';
interface TypedData {
    domain: oxTypedData.Domain;
    types: Record<string, oxTypedData.Parameter[]>;
    message: Record<string, any>;
}
export declare const encodeTypedDataHash: (typedData: TypedData) => Hex.Hex;
export declare const encodeTypedDataDigest: (typedData: TypedData) => Bytes.Bytes;
export type { TypedData };
