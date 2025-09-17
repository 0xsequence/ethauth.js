import { Provider } from 'ox';
import { Proof } from './proof';
export type ValidatorFunc = (provider: Provider.Provider, chainId: number, proof: Proof) => Promise<{
    isValid: boolean;
    address?: string;
}>;
export declare const ValidateEOAProof: ValidatorFunc;
export declare const ValidateContractAccountProof: ValidatorFunc;
export declare const IsValidSignatureBytes32MagicValue = "0x1626ba7e";
