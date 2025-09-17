import { ethers } from 'ethers';
import { Hex } from 'ox';
interface TypedData {
    domain: TypedDataDomain;
    types: Record<string, Array<TypedDataField>>;
    message: Record<string, any>;
}
interface TypedDataDomain {
    name?: string;
    version?: string;
    chainId?: ethers.BigNumberish;
    verifyingContract?: string;
    salt?: ethers.BytesLike;
}
interface TypedDataField {
    name: string;
    type: string;
}
export declare const encodeTypedDataHash: (typedData: TypedData) => Hex.Hex;
export declare const encodeTypedDataDigest: (typedData: TypedData) => Uint8Array<ArrayBufferLike>;
export type { TypedData, TypedDataDomain, TypedDataField };
