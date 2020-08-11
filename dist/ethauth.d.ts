import { ethers } from 'ethers';
import { Proof } from './proof';
import { ValidatorFunc } from './validate';
export declare const ETHAuthVersion = "1";
export declare const ETHAuthPrefix = "eth";
export declare const ETHAuthEIP712Domain: {
    name: string;
    version: string;
};
export declare class ETHAuth {
    validators: ValidatorFunc[];
    ethereumJsonRpcURL: string;
    provider: ethers.providers.JsonRpcProvider;
    chainId: number;
    constructor(...validators: ValidatorFunc[]);
    configJsonRpcProvider: (ethereumJsonRpcURL: string) => Promise<void>;
    configValidators: (...validators: ValidatorFunc[]) => void;
    encodeProof: (proof: Proof) => Promise<string>;
    decodeProof: (proofString: string) => Promise<Proof>;
    validateProof: (proof: Proof) => Promise<boolean>;
    validateProofSignature: (proof: Proof) => Promise<boolean>;
    validateProofClaims: (proof: Proof) => {
        ok: boolean;
        err?: Error;
    };
}
