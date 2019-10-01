import base64 from 'base64url'
import { validateEthSignature } from './validate'
import * as utils from './utils'

const ewtPrefix = 'eth'

export class EthWebToken {
	// "eth" prefix
  private prefix: string

	// Account addres
  private address: string

	// Messaged passed to the ethSignedTypedData
  private payload: string

	// Signature of the message by the account address above
  private proof: string

  constructor (opts: any) {
    this.prefix = opts.prefix
    this.address = utils.toChecksumAddress(opts.address)
    this.payload = opts.payload.toString()
    this.proof = opts.proof
  }

  public getAddress (): string {
    return this.address
  }

  public getPayload (): string {
    return this.payload
  }

  public getProof (): string {
    return this.proof
  }

  public isValid (): boolean {
    if (this.prefix !== ewtPrefix) {
      throw new Error('ethwebtoken: validation failed, invalid prefix')
    }

    if (this.address.length !== 42 || this.address.slice(0,2) !== '0x') {
      throw new Error('ethwebtoken: validation failed, invalid address')
    }

    if (this.payload.length === 0) {
      throw new Error('ethwebtoken: validation failed, invalid payload')
    }

    if (this.proof.length < 2 || this.proof.slice(0,2) !== '0x') {
      throw new Error('ethwebtoken: validation failed, invalid proof')
    }

    return validateEthSignature(this.address, this.payload, this.proof)
  }

  public encode (): string {
    if (this.address === '' || this.address.length !== 42 || this.address.slice(0,2) !== '0x') {
      throw new Error('ethwebtoken: invalid address')
    }

    if (this.payload === '') {
      throw new Error('ethwebtoken: invalid payload')
    }

    if (this.proof === '' || this.proof.slice(0,2) !== '0x') {
      throw new Error('ethwebtoken: invalid proof')
    }

    // Validate the contents
    const valid = validateEthSignature(this.address, this.payload, this.proof)
    if (!valid) {
      throw new Error('ethwebtoken: validation failed during encoding')
    }

    // TODO: add ValidatePayload()
    // and ensure we have basic contents for convensions of the subject, exp, iat, etc..

    let ewt: Buffer = Buffer.alloc(0)

    // prefix
    ewt = Buffer.concat([ewt, Buffer.from(ewtPrefix), Buffer.from('.')])

    // address
    ewt = Buffer.concat([ewt, Buffer.from(this.address), Buffer.from('.')])

    // payload
    ewt = Buffer.concat([ewt, Buffer.from(base64.encode(Buffer.from(this.payload))), Buffer.from('.')])

    // proof
    ewt = Buffer.concat([ewt, Buffer.from(this.proof)])

    return ewt.toString()
  }

  public signAndEncodeToken (address: string, payload: string): EthWebToken {
    throw new Error('not implemented')
  }

  public static encodeToken (address: string, payload: string, proof: string): EthWebToken {
    const ewt = new EthWebToken({
      prefix:  ewtPrefix,
      address: address.toLowerCase(),
      payload: payload,
      proof:   proof
    })

    return ewt
  }

  // DecodeToken will parse a ewt token string and validate its contents
  public static decodeToken (token: string): EthWebToken {
    const parts = token.split('.')
    if (parts.length !== 4) {
      throw new Error('ethwebtoken: invalid token string')
    }

    const prefix = parts[0]
    const address = parts[1]
    const payloadBase64 = parts[2]
    const proof = parts[3]

    // decode payload
    let payloadBytes
    try {
      payloadBytes = base64.toBuffer(payloadBase64)
    } catch (err) {
      throw new Error('ethwebtoken: decode failed, invalid payload')
    }

    let ewt = new EthWebToken({
      prefix: prefix,
      address: address,
      payload: payloadBytes.toString(),
      proof: proof
    })

    const isValid = ewt.isValid()
    if (!isValid) {
      throw new Error('ethwebtoken: decode failed, invalid token')
    }

    return ewt
  }
}
