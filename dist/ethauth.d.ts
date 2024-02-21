import { ethers } from 'ethers';
import { Proof } from './proof';
import { ValidatorFunc } from './validate';
export declare class ETHAuth {
    validators: ValidatorFunc[];
    ethereumJsonRpcURL: string;
    provider: ethers.JsonRpcProvider;
    chainId: number;
    constructor(...validators: ValidatorFunc[]);
    configJsonRpcProvider: (ethereumJsonRpcURL: string) => Promise<void>;
    configValidators: (...validators: ValidatorFunc[]) => void;
    encodeProof: (proof: Proof, skipSignatureValidation?: boolean) => Promise<string>;
    decodeProof: (proofString: string, skipSignatureValidation?: boolean) => Promise<Proof>;
    validateProof: (proof: Proof, skipSignatureValidation?: boolean) => Promise<boolean>;
    validateProofSignature: (proof: Proof) => Promise<boolean>;
    validateProofClaims: (proof: Proof) => {
        ok: boolean;
        err?: Error;
    };
}
