import { ethers } from 'ethers';
import { Token } from './token';
export declare type ValidatorFunc = (provider: ethers.providers.JsonRpcProvider, chainId: number, token: Token) => Promise<{
    isValid: boolean;
    address?: string;
}>;
export declare const ValidateEOAToken: ValidatorFunc;
export declare const ValidateContractAccountToken: ValidatorFunc;
