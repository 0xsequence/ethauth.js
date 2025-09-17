import { ETHAuth, Claims, validateClaims, Proof, ETHAuthVersion } from '../src/index'
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
