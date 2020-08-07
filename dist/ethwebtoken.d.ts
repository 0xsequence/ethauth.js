import { ethers } from 'ethers';
import { Token } from './token';
import { ValidatorFunc } from './validate';
export declare const EWTVersion = "1";
export declare const EWTPrefix = "eth";
export declare const EWTEIP712Domain: {
    name: string;
    version: string;
};
export declare class ETHWebToken {
    validators: ValidatorFunc[];
    ethereumJsonRpcURL: string;
    provider: ethers.providers.JsonRpcProvider;
    chainId: number;
    constructor(...validators: ValidatorFunc[]);
    configJsonRpcProvider: (ethereumJsonRpcURL: string) => Promise<void>;
    configValidators: (...validators: ValidatorFunc[]) => void;
    encodeToken: (token: Token) => string;
    decodeToken: (tokenString: string) => Token;
    validateToken: (token: Token) => Promise<boolean>;
    validateTokenSignature: (token: Token) => Promise<boolean>;
    validateTokenClaims: (token: Token) => {
        ok: boolean;
        err?: Error;
    };
}
