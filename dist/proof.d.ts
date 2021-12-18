import { TypedData } from './typed-data';
export declare class Proof {
    prefix: string;
    address: string;
    claims: Claims;
    signature: string;
    extra: string;
    constructor(args?: {
        address?: string;
        claims?: Claims;
        signature?: string;
        extra?: string;
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
    exp: number;
    iat?: number;
    n?: number;
    typ?: string;
    ogn?: string;
    v: string;
}
export declare const validateClaims: (claims: Claims) => {
    ok: boolean;
    err?: Error;
};
