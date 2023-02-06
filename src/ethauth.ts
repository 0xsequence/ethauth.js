import { ethers } from 'ethers'
import { Proof, Claims } from './proof'
import { ValidatorFunc, ValidateEOAProof, ValidateContractAccountProof } from './validate'
import { Base64 } from 'js-base64'

export const ETHAuthVersion = '1'

export const ETHAuthPrefix = 'eth'

export const ETHAuthEIP712Domain = {
  name: 'ETHAuth',
  version: ETHAuthVersion,
}

export interface EncodingOptions {
  skipSignatureValidation?: boolean
}

export class ETHAuth {
  validators: ValidatorFunc[]
  ethereumJsonRpcURL: string
  provider: ethers.providers.JsonRpcProvider
  chainId: number

  constructor(...validators: ValidatorFunc[]) {
    if (validators.length == 0) {
      this.validators = [ ValidateEOAProof, ValidateContractAccountProof ]
    } else {
      this.validators = validators
    }
  }

  configJsonRpcProvider = async (ethereumJsonRpcURL: string) => {
    this.provider = new ethers.providers.JsonRpcProvider(ethereumJsonRpcURL)

    const netVersion = await this.provider.send('net_version', [])
    this.chainId = parseInt(netVersion)

    if (!this.chainId || this.chainId === 0 || this.chainId === NaN) {
      throw new Error('ethauth: unable to get chainId')
    }

    this.ethereumJsonRpcURL = ethereumJsonRpcURL
  }

  configValidators = (...validators: ValidatorFunc[]) => {
    if (validators.length == 0) {
      throw new Error('validators list is empty')
    }
    this.validators = validators
  }

  encodeProof = async (proof: Proof, opts: EncodingOptions): Promise<string> => {
    if (proof.address.length !== 42 || proof.address.slice(0,2) !== '0x') {
      throw new Error('ethauth: invalid address')
    }
    if (proof.signature === '' || proof.signature.slice(0,2) !== '0x') {
      throw new Error('ethauth: invalid signature')
    }
    if (proof.extra && proof.extra.slice(0,2) !== '0x') {
      throw new Error('ethauth: invalid extra encoding, expecting hex data')
    }

    const isValid = await this.validateProof(proof, opts)
    if (!isValid) {
      throw new Error(`ethauth: proof is invalid`)
    }

    const claimsJSON = JSON.stringify(proof.claims)

    let proofString =
      ETHAuthPrefix + '.' +
      proof.address.toLowerCase() + '.' +
      Base64.encode(claimsJSON, true) + '.' +
      proof.signature

    if (proof.extra && proof.extra.length > 0) {
      proofString += '.' + proof.extra
    }

    return proofString
  }

  decodeProof = async (proofString: string, opts: EncodingOptions): Promise<Proof> => {
    const parts = proofString.split('.')
    if (parts.length < 4 || parts.length > 5) {
      throw new Error('ethauth: invalid proof string')
    }

    const [ prefix, address, messageBase64, signature, extra ] = parts

    // check prefix
    if (prefix !== ETHAuthPrefix) {
      throw new Error('ethauth: not an ethauth proof')
    }

    // decode message base64
    const message = Base64.decode(messageBase64)
    const claims = JSON.parse(message) as Claims

    // prepare proof
    const proof = new Proof({ address, claims, signature, extra })

    // Validate proof signature and claims
    const isValid = await this.validateProof(proof, opts)
    if (!isValid) {
      throw new Error(`ethauth: proof is invalid`)
    }

    return proof
  }

  validateProof = async (proof: Proof, opts: EncodingOptions): Promise<boolean> => {
    const isValidClaims = this.validateProofClaims(proof)
    if (isValidClaims.err) {
      throw new Error(`ethauth: proof claims are invalid ${isValidClaims.err}`)
    }

    if (opts.skipSignatureValidation !== true) {
      const isValidSig = await this.validateProofSignature(proof)
      if (isValidSig !== true) {
        throw new Error('ethauth: proof signature is invalid')
      }
    }
    
    return true
  }

  validateProofSignature = async (proof: Proof): Promise<boolean> => {
    const retIsValid: boolean[] = []

    for (let i=0; i < this.validators.length; i++) {
      try {
        const validator = this.validators[i]
        const { isValid } = await validator(this.provider, this.chainId, proof)
        if (isValid === true) {
          // preemptively return true if we've determined it to be valid
          return true
        }
        retIsValid.push(isValid)
      } catch (err) {
        retIsValid.push(false)
      }
    }

    for (let i=0; i < retIsValid.length; i++) {
      if (retIsValid[i]) {
        return true
      }
    }

    return false
  }

  validateProofClaims = (proof: Proof): { ok: boolean, err?: Error } => {
    return proof.validateClaims()
  }
}
