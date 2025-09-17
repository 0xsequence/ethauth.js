import { Hex } from 'ox'
import { TypedData, TypedDataDomain, TypedDataField, encodeTypedDataHash } from './typed-data'

export const ETHAuthVersion = '1'

export const ETHAuthPrefix = 'eth'

export const ETHAuthEIP712Domain = {
  name: 'ETHAuth',
  version: ETHAuthVersion
}

export class Proof {
  // "eth" prefix
  prefix: string

  // Account addres
  address: string

  // Claims object, aka, the message key of an EIP712 signature
  claims: Claims

  // Signature of the message by the account address above
  signature: string

  // Extra bytes in hex format used for signature validation
  // ie. useful for counterfactual smart wallets
  extra: string

  constructor(args?: { address?: string; claims?: Claims; signature?: string; extra?: string }) {
    this.prefix = ETHAuthPrefix
    this.address = args?.address ? args.address.toLowerCase() : ''
    this.claims = args?.claims ? args.claims : { app: '', iat: 0, exp: 0, v: ETHAuthVersion }
    this.signature = args?.signature ? args.signature : ''
    this.extra = args?.extra ? args.extra : ''
  }

  setIssuedAtNow() {
    this.claims.iat = Math.round(new Date().getTime() / 1000)
  }

  setExpiryIn(seconds: number) {
    this.claims.exp = Math.round(new Date().getTime() / 1000) + seconds
  }

  validateClaims(): { ok: boolean; err?: Error } {
    return validateClaims(this.claims)
  }

  messageDigest(): Uint8Array {
    const isValid = this.validateClaims()
    if (isValid.err) {
      throw isValid.err
    }
    return Hex.toBytes(encodeTypedDataHash(this.messageTypedData()))
  }

  messageTypedData(): TypedData {
    const domain: TypedDataDomain = {
      ...ETHAuthEIP712Domain
    }
    const types: { [key: string]: TypedDataField[] } = {
      Claims: []
    }
    const message = {}

    const typedData = { domain, types, message }

    if (this.claims.app && this.claims.app.length > 0) {
      typedData.types.Claims.push({ name: 'app', type: 'string' })
      typedData.message['app'] = this.claims.app
    }
    if (this.claims.iat && this.claims.iat > 0) {
      typedData.types.Claims.push({ name: 'iat', type: 'int64' })
      typedData.message['iat'] = this.claims.iat
    }
    if (this.claims.exp && this.claims.exp > 0) {
      typedData.types.Claims.push({ name: 'exp', type: 'int64' })
      typedData.message['exp'] = this.claims.exp
    }
    if (this.claims.n && this.claims.n > 0) {
      typedData.types.Claims.push({ name: 'n', type: 'uint64' })
      typedData.message['n'] = this.claims.n
    }
    if (this.claims.typ && this.claims.typ.length > 0) {
      typedData.types.Claims.push({ name: 'typ', type: 'string' })
      typedData.message['typ'] = this.claims.typ
    }
    if (this.claims.ogn && this.claims.ogn.length > 0) {
      typedData.types.Claims.push({ name: 'ogn', type: 'string' })
      typedData.message['ogn'] = this.claims.ogn
    }
    if (this.claims.v && this.claims.v.length > 0) {
      typedData.types.Claims.push({ name: 'v', type: 'string' })
      typedData.message['v'] = this.claims.v
    }

    return typedData
  }
}

export interface Claims {
  app: string
  exp: number
  iat?: number
  n?: number
  typ?: string
  ogn?: string
  v: string
}

export const validateClaims = (claims: Claims): { ok: boolean; err?: Error } => {
  if (claims.app === '') {
    return { ok: false, err: new Error('claims: app is empty') }
  }

  const now = Math.round(new Date().getTime() / 1000)
  const drift = 5 * 60 // 5 minutes
  const max = 60 * 60 * 24 * 365 + drift // 1 year

  if (claims.v === '') {
    return { ok: false, err: new Error('claims: ethauth version is empty') }
  }
  if (claims.iat && claims.iat !== 0 && (claims.iat > now + drift || claims.iat < now - max)) {
    return { ok: false, err: new Error('claims: iat is invalid') }
  }
  if (claims.exp < now - drift || claims.exp > now + max) {
    return { ok: false, err: new Error('claims: token has expired') }
  }

  return { ok: true }
}
