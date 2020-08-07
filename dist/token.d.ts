import { TypedData } from 'ethers-eip712';
export declare class Token {
    prefix: string;
    address: string;
    claims: Claims;
    signature: string;
    constructor(args?: {
        address?: string;
        claims?: Claims;
        signature?: string;
    });
    setIssuedAtNow(): void;
    setExpiryIn(seconds: number): void;
    validateClaims(): {
        ok: boolean;
        err?: Error;
    };
    messageDigest(): Uint8Array;
    messageTypedData(): TypedData;
}
export interface Claims {
    app: string;
    iat: number;
    exp: number;
    n?: number;
    typ?: string;
    ogn?: string;
    v: string;
}
export declare const validateClaims: (claims: Claims) => {
    ok: boolean;
    err?: Error;
};
