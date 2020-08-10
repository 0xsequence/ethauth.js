import { ethers } from 'ethers'
import { Token, Claims } from './token'
import { ValidatorFunc, ValidateEOAToken, ValidateContractAccountToken } from './validate'
import base64url from 'base64url'

export const EWTVersion = '1'

export const EWTPrefix = 'eth'

export const EWTEIP712Domain = {
  name: 'ETHWebToken',
  version: EWTVersion,
}

export class ETHWebToken {
  validators: ValidatorFunc[]
  ethereumJsonRpcURL: string
  provider: ethers.providers.JsonRpcProvider
  chainId: number

  constructor(...validators: ValidatorFunc[]) {
    if (validators.length == 0) {
      this.validators = [ ValidateEOAToken, ValidateContractAccountToken ]
    }else {
      this.validators = validators
    }
  }

  configJsonRpcProvider = async (ethereumJsonRpcURL: string) => {
    this.provider = new ethers.providers.JsonRpcProvider(ethereumJsonRpcURL)

    const netVersion = await this.provider.send('net_version', [])
    this.chainId = parseInt(netVersion.result)
    if (!this.chainId || this.chainId === 0 || this.chainId === NaN) {
      throw new Error('ethwebtoken: unable to get chainId')
    }

    this.ethereumJsonRpcURL = ethereumJsonRpcURL
  }

  configValidators = (...validators: ValidatorFunc[]) => {
    if (validators.length == 0) {
      throw new Error('validators list is empty')
    }
    this.validators = validators
  }

  encodeToken = (token: Token): string => {
    if (token.address.length !== 42 || token.address.slice(0,2) !== '0x') {
      throw new Error('ethwebtoken: invalid address')
    }
    if (token.signature === '' || token.signature.slice(0,2) !== '0x') {
      throw new Error('ethwebtoken: invalid signature')
    }

    const isValid = this.validateToken(token)
    if (!isValid) {
      throw new Error(`ethwebtoken: token is invalid`)
    }

    const claimsJSON = JSON.stringify(token.claims)

    let tokenString =
      EWTPrefix + '.' +
      token.address.toLowerCase() + '.' +
      base64url.encode(claimsJSON) + '.' +
      token.signature

    return tokenString
  }

  decodeToken = (tokenString: string): Token => {
    const parts = tokenString.split('.')
    if (parts.length !== 4) {
      throw new Error('ethwebtoken: invalid token string')
    }

    const [ prefix, address, messageBase64, signature ] = parts

    // check prefix
    if (prefix !== EWTPrefix) {
      throw new Error('ethwebtoken: not an ewt token')
    }

    // decode message base64
    const message = base64url.decode(messageBase64)
    const claims = JSON.parse(message) as Claims

    // prepare token
    const token = new Token({ address, claims, signature })

    // Validate token signature and claims
    const isValid = this.validateToken(token)
    if (!isValid) {
      throw new Error(`ethwebtoken: token is invalid`)
    }

    return token
  }

  validateToken = async (token: Token): Promise<boolean> => {
    const isValidClaims = this.validateTokenClaims(token)
    if (isValidClaims.err) {
      throw new Error(`ethwebtoken: token claims are invalid ${isValidClaims.err}`)
    }

    const isValidSig = await this.validateTokenSignature(token)
    if (isValidSig !== true) {
      throw new Error('ethwebtoken: token signature is invalid')
    }
    
    return true
  }

  validateTokenSignature = async (token: Token): Promise<boolean> => {
    const retIsValid: boolean[] = []

    for (let i=0; i < this.validators.length; i++) {
      try {
        const validator = this.validators[i]
        const { isValid } = await validator(this.provider, this.chainId, token)
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

  validateTokenClaims = (token: Token): { ok: boolean, err?: Error } => {
    return token.validateClaims()
  }
}
