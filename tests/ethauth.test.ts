import { ETHAuth } from '../src/ethauth'
import { Claims, validateClaims, Proof, ETHAuthVersion } from '../src/proof'
import { encodeTypedDataHash, encodeTypedDataDigest, TypedData } from '../src/typed-data'
import { Mnemonic, Secp256k1, Address, Hex, PersonalMessage, Signature } from 'ox'

// Create wallet using ox
const privateKey = Mnemonic.toPrivateKey('outdoor sentence roast truly flower surface power begin ocean silent debate funny')
const publicKey = Secp256k1.getPublicKey({ privateKey })
const address = Address.fromPublicKey(publicKey)
const wallet = { privateKey, address }

describe('ETHAuth', () => {
  test('generate expected object with current timestamps', async () => {
    // Generate current timestamps to avoid test brittleness
    const currentTime = Math.round(new Date().getTime() / 1000)
    const iat = currentTime
    const exp = currentTime + 60 * 60 * 24 * 365 // 365 days from now

    // Create proof with current timestamps
    const proof = new Proof({ address: wallet.address })
    proof.claims.app = 'ETHAuthTest'
    proof.claims.iat = iat
    proof.claims.exp = exp
    proof.claims.v = ETHAuthVersion

    // Generate message digest
    const digest = proof.messageDigest()
    const digestHex = Hex.fromBytes(digest)

    // Sign the message
    const signPayload = PersonalMessage.getSignPayload(digest)
    const signatureObj = Secp256k1.sign({
      privateKey: wallet.privateKey,
      payload: signPayload
    })
    proof.signature = Signature.toHex(signatureObj)

    // Encode proof
    const ethAuth = new ETHAuth()
    const proofString = await ethAuth.encodeProof(proof)

    // Output the expected object for future reference
    const expected = {
      iat,
      exp,
      digestHex,
      proofString
    }

    console.log('\n=== GENERATED EXPECTED OBJECT ===')
    console.log('Copy this to update the brittle test:')
    console.log(JSON.stringify(expected, null, 2))
    console.log('===============================\n')

    // Basic validation to ensure the generated object is valid
    expect(typeof expected.iat).toBe('number')
    expect(typeof expected.exp).toBe('number')
    expect(expected.digestHex).toMatch(/^0x[a-fA-F0-9]{64}$/)
    expect(expected.proofString).toMatch(/^eth\./)
    expect(expected.exp).toBeGreaterThan(expected.iat)
  })

  test('encode and decode', async () => {
    // TODO/NOTE: this expected value is fixed, but the time in iat and exp moves forward,
    // this test is brittle and eventually will fail.
    const expected = {
      iat: 1758115038,
      exp: 1789651038,
      digestHex: '0xd584500cb197a42009398e33df6677a989e224115d9d6c2ebf093f8b5163c191',
      proofString:
        'eth.0xe0c9828dee3411a28ccb4bb82a18d0aad24489e0.eyJhcHAiOiJFVEhBdXRoVGVzdCIsImlhdCI6MTc1ODExNTAzOCwiZXhwIjoxNzg5NjUxMDM4LCJ2IjoiMSJ9.0x345032a58a9a2a742890637e1f1f66f1f9d05d1742ce02b1aee7cd6ce6b766c7575be12c4db7a3995bbf649e5660bf3d660eb2d71c8c8ac085351c256bedfa4f1c'
    }

    const claims: Claims = {
      app: 'ETHAuthTest',
      iat: Math.round(new Date().getTime() / 1000),
      exp: Math.round(new Date().getTime() / 1000) + 60 * 60 * 24 * 300,
      v: ETHAuthVersion
    }

    console.log('claims', claims)

    const validClaims = validateClaims(claims)
    console.log(validClaims)

    // create token object
    const proof = new Proof({ address: wallet.address })
    proof.claims.app = 'ETHAuthTest'
    proof.claims.iat = expected.iat
    proof.claims.exp = expected.exp

    console.log('==>', proof.claims)

    // const digest = tt.messageDigest0()
    const digest = proof.messageDigest()

    const digestHex = Hex.fromBytes(digest)
    console.log('digestHex', digestHex)
    expect(digestHex).toEqual(expected.digestHex)

    // Sign the message and set on the token
    const signPayload = PersonalMessage.getSignPayload(digest)
    const signatureObj = Secp256k1.sign({
      privateKey: wallet.privateKey,
      payload: signPayload
    })
    proof.signature = Signature.toHex(signatureObj)

    const ethAuth = new ETHAuth()
    const proofString = await ethAuth.encodeProof(proof)

    console.log('proof:', proof)
    console.log('proofString:', proofString)

    // decode the proof string and assert
    const proof2 = await ethAuth.decodeProof(proofString)
    expect(proof.address).toEqual(proof2.address)
    expect(proof.validateClaims().ok).toEqual(true)
    expect(proof2.validateClaims().ok).toEqual(true)

    // console.log('=> claims1', claims)
    // console.log('=> claims2', token2.claims)

    expect(proofString).toEqual(expected.proofString)

    // Validate the token
    expect(await ethAuth.validateProof(proof)).toEqual(true)
  })
})

describe('TypedData Functions', () => {
  test('encodeTypedDataHash - basic functionality', () => {
    const typedData: TypedData = {
      domain: {
        name: 'ETHAuth',
        version: '1'
      },
      types: {
        Claims: [
          { name: 'app', type: 'string' },
          { name: 'iat', type: 'int64' },
          { name: 'exp', type: 'int64' },
          { name: 'v', type: 'string' }
        ]
      },
      message: {
        app: 'ETHAuthTest',
        iat: 1720017432,
        exp: 1745937432,
        v: '1'
      }
    }

    const hash = encodeTypedDataHash(typedData)

    // Should return the exact expected hash
    expect(hash).toBe('0x2926d593d635b41fe4adff9c7ca6b9b98879d721c45f7c5bc0a3ca34455b6015')
    console.log('encodeTypedDataHash result:', hash)
  })

  test('encodeTypedDataDigest - basic functionality', () => {
    const typedData: TypedData = {
      domain: {
        name: 'ETHAuth',
        version: '1'
      },
      types: {
        Claims: [
          { name: 'app', type: 'string' },
          { name: 'iat', type: 'int64' },
          { name: 'exp', type: 'int64' },
          { name: 'v', type: 'string' }
        ]
      },
      message: {
        app: 'ETHAuthTest',
        iat: 1720017432,
        exp: 1745937432,
        v: '1'
      }
    }

    const digest = encodeTypedDataDigest(typedData)
    const expectedDigest = new Uint8Array([
      219, 1, 18, 243, 100, 141, 88, 84, 184, 219, 85, 71, 36, 8, 31, 58, 31, 240, 95, 186, 15, 175, 100, 251, 203, 124, 98, 131,
      73, 120, 46, 3
    ])

    // Should return the exact expected digest
    expect(digest).toEqual(expectedDigest)
    expect(digest.length).toBe(32)
    console.log('encodeTypedDataDigest result:', digest)
    console.log('encodeTypedDataDigest as hex:', Array.from(digest, b => b.toString(16).padStart(2, '0')).join(''))
  })

  test('encodeTypedDataHash - consistent results', () => {
    const typedData: TypedData = {
      domain: {
        name: 'ETHAuth',
        version: '1'
      },
      types: {
        Claims: [
          { name: 'app', type: 'string' },
          { name: 'v', type: 'string' }
        ]
      },
      message: {
        app: 'ConsistencyTest',
        v: '1'
      }
    }

    const hash1 = encodeTypedDataHash(typedData)
    const hash2 = encodeTypedDataHash(typedData)

    // Same input should produce same output
    expect(hash1).toEqual(hash2)
  })

  test('encodeTypedDataDigest - consistent results', () => {
    const typedData: TypedData = {
      domain: {
        name: 'ETHAuth',
        version: '1'
      },
      types: {
        Claims: [
          { name: 'app', type: 'string' },
          { name: 'v', type: 'string' }
        ]
      },
      message: {
        app: 'ConsistencyTest',
        v: '1'
      }
    }

    const digest1 = encodeTypedDataDigest(typedData)
    const digest2 = encodeTypedDataDigest(typedData)

    // Same input should produce same output
    expect(digest1).toEqual(digest2)
  })

  test('different typed data produces different hashes', () => {
    const typedData1: TypedData = {
      domain: { name: 'ETHAuth', version: '1' },
      types: { Claims: [{ name: 'app', type: 'string' }] },
      message: { app: 'TestApp1' }
    }

    const typedData2: TypedData = {
      domain: { name: 'ETHAuth', version: '1' },
      types: { Claims: [{ name: 'app', type: 'string' }] },
      message: { app: 'TestApp2' }
    }

    const hash1 = encodeTypedDataHash(typedData1)
    const hash2 = encodeTypedDataHash(typedData2)
    const digest1 = encodeTypedDataDigest(typedData1)
    const digest2 = encodeTypedDataDigest(typedData2)

    // Different inputs should produce different outputs
    expect(hash1).not.toEqual(hash2)
    expect(digest1).not.toEqual(digest2)
  })
})
