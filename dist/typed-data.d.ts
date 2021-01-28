import { ethers } from 'ethers';
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
export declare const encodeTypedDataHash: (typedData: TypedData) => string;
export declare const encodeTypedDataDigest: (typedData: TypedData) => Uint8Array;
export type { TypedData, TypedDataDomain, TypedDataField };
