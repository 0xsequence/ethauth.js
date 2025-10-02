import { Address, Bytes, Hex, TypedData } from 'ox';
export declare const ETHAuthVersion = "1";
export declare const ETHAuthPrefix = "eth";
export declare const ETHAuthEIP712Domain: {
    name: string;
    version: string;
};
export declare class Proof {
    prefix: string;
    address: Address.Address;
    claims: Claims;
    signature: Hex.Hex;
    extra: Hex.Hex;
    constructor(args?: {
        address?: Address.Address;
        claims?: Claims;
        signature?: Hex.Hex;
        extra?: Hex.Hex;
    });
    setIssuedAtNow(): void;
    setExpiryIn(seconds: number): void;
    validateClaims(): {
        ok: boolean;
        err?: Error;
    };
    messageDigest(): Bytes.Bytes;
    messageTypedData(): TypedData.MessageDefinition;
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
