import { Hex, Bytes, TypedData as oxTypedData } from 'ox';
interface TypedData {
    domain: oxTypedData.Domain;
    types: Record<string, oxTypedData.Parameter[]>;
    primaryType: string;
    message: Record<string, any>;
}
export declare const encodeTypedDataHash: (typedData: TypedData) => Hex.Hex;
export declare const encodeTypedDataDigest: (typedData: TypedData) => Bytes.Bytes;
export type { TypedData };
