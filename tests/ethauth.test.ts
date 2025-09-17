import { ETHAuth } from '../src/ethauth'
import { Claims, validateClaims, Proof, ETHAuthVersion } from '../src/proof'
import { ValidateEOAProof, ValidateContractAccountProof, ValidatorFunc } from '../src/validate'
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

describe('ETHAuth Class Unit Tests', () => {
  describe('Constructor', () => {
    test('constructor with no validators uses defaults', () => {
      const ethAuth = new ETHAuth()

      expect(ethAuth.validators).toHaveLength(2)
      expect(ethAuth.validators[0]).toBe(ValidateEOAProof)
      expect(ethAuth.validators[1]).toBe(ValidateContractAccountProof)
    })

    test('constructor with custom validators', () => {
      const mockValidator: ValidatorFunc = jest.fn()
      const ethAuth = new ETHAuth(mockValidator)

      expect(ethAuth.validators).toHaveLength(1)
      expect(ethAuth.validators[0]).toBe(mockValidator)
    })

    test('constructor with multiple custom validators', () => {
      const mockValidator1: ValidatorFunc = jest.fn()
      const mockValidator2: ValidatorFunc = jest.fn()
      const ethAuth = new ETHAuth(mockValidator1, mockValidator2)

      expect(ethAuth.validators).toHaveLength(2)
      expect(ethAuth.validators[0]).toBe(mockValidator1)
      expect(ethAuth.validators[1]).toBe(mockValidator2)
    })
  })

  describe('configValidators', () => {
    test('configValidators sets new validators', () => {
      const ethAuth = new ETHAuth()
      const mockValidator: ValidatorFunc = jest.fn()

      ethAuth.configValidators(mockValidator)

      expect(ethAuth.validators).toHaveLength(1)
      expect(ethAuth.validators[0]).toBe(mockValidator)
    })

    test('configValidators throws error for empty list', () => {
      const ethAuth = new ETHAuth()

      expect(() => ethAuth.configValidators()).toThrow('validators list is empty')
    })

    test('configValidators replaces existing validators', () => {
      const mockValidator1: ValidatorFunc = jest.fn()
      const mockValidator2: ValidatorFunc = jest.fn()
      const ethAuth = new ETHAuth(mockValidator1)

      ethAuth.configValidators(mockValidator2)

      expect(ethAuth.validators).toHaveLength(1)
      expect(ethAuth.validators[0]).toBe(mockValidator2)
    })
  })

  describe('encodeProof validation', () => {
    let ethAuth: ETHAuth
    let validProof: Proof

    beforeEach(() => {
      ethAuth = new ETHAuth()
      validProof = new Proof({
        address: wallet.address,
        signature:
          '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
      })
      validProof.claims.app = 'TestApp'
      validProof.claims.v = '1'
      validProof.setIssuedAtNow()
      validProof.setExpiryIn(3600)
    })

    test('encodeProof throws error for invalid address length', async () => {
      validProof.address = '0x123' // Too short

      await expect(ethAuth.encodeProof(validProof, true)) // Skip signature validation
        .rejects.toThrow('ethauth: invalid address')
    })

    test('encodeProof throws error for address not starting with 0x', async () => {
      validProof.address = '1234567890123456789012345678901234567890' // No 0x prefix

      await expect(ethAuth.encodeProof(validProof, true)).rejects.toThrow('ethauth: invalid address')
    })

    test('encodeProof throws error for empty signature', async () => {
      validProof.signature = ''

      await expect(ethAuth.encodeProof(validProof, true)).rejects.toThrow('ethauth: invalid signature')
    })

    test('encodeProof throws error for signature not starting with 0x', async () => {
      validProof.signature =
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'

      await expect(ethAuth.encodeProof(validProof, true)).rejects.toThrow('ethauth: invalid signature')
    })

    test('encodeProof throws error for invalid extra data', async () => {
      validProof.extra = 'invalid' // Should start with 0x

      await expect(ethAuth.encodeProof(validProof, true)).rejects.toThrow('ethauth: invalid extra encoding, expecting hex data')
    })

    test('encodeProof succeeds with valid extra data', async () => {
      validProof.extra = '0x1234'

      const result = await ethAuth.encodeProof(validProof, true)

      expect(result).toMatch(/^eth\./)
      expect(result.split('.').length).toBe(5) // prefix.address.claims.signature.extra
    })

    test('encodeProof succeeds without extra data', async () => {
      const result = await ethAuth.encodeProof(validProof, true)

      expect(result).toMatch(/^eth\./)
      expect(result.split('.').length).toBe(4) // prefix.address.claims.signature
    })
  })

  describe('decodeProof validation', () => {
    let ethAuth: ETHAuth

    beforeEach(() => {
      ethAuth = new ETHAuth()
    })

    test('decodeProof throws error for too few parts', async () => {
      const invalidProof = 'eth.address.claims' // Missing signature

      await expect(ethAuth.decodeProof(invalidProof, true)).rejects.toThrow('ethauth: invalid proof string')
    })

    test('decodeProof throws error for too many parts', async () => {
      const invalidProof = 'eth.address.claims.sig.extra.toomany'

      await expect(ethAuth.decodeProof(invalidProof, true)).rejects.toThrow('ethauth: invalid proof string')
    })

    test('decodeProof throws error for wrong prefix', async () => {
      const invalidProof = 'wrong.address.claims.signature'

      await expect(ethAuth.decodeProof(invalidProof, true)).rejects.toThrow('ethauth: not an ethauth proof')
    })

    test('decodeProof throws error for invalid base64', async () => {
      const invalidProof =
        'eth.0x1234567890123456789012345678901234567890.invalid-base64.0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'

      await expect(ethAuth.decodeProof(invalidProof, true)).rejects.toThrow() // Base64 decode will throw
    })
  })

  describe('validateProofClaims', () => {
    test('validateProofClaims delegates to proof.validateClaims', () => {
      const ethAuth = new ETHAuth()
      const proof = new Proof()
      proof.claims.app = 'TestApp'
      proof.claims.v = '1'
      proof.setIssuedAtNow()
      proof.setExpiryIn(3600)

      // Mock the proof's validateClaims method
      const mockValidate = jest.fn().mockReturnValue({ ok: true })
      proof.validateClaims = mockValidate

      const result = ethAuth.validateProofClaims(proof)

      expect(mockValidate).toHaveBeenCalled()
      expect(result.ok).toBe(true)
    })
  })

  describe('validateProofSignature', () => {
    test('validateProofSignature returns true on first valid validator', async () => {
      const mockValidator1: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: false })
      const mockValidator2: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: true })
      const mockValidator3: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: false })

      const ethAuth = new ETHAuth(mockValidator1, mockValidator2, mockValidator3)
      const proof = new Proof()

      const result = await ethAuth.validateProofSignature(proof)

      expect(result).toBe(true)
      expect(mockValidator1).toHaveBeenCalled()
      expect(mockValidator2).toHaveBeenCalled()
      expect(mockValidator3).not.toHaveBeenCalled() // Should stop at first valid
    })

    test('validateProofSignature returns false when all validators fail', async () => {
      const mockValidator1: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: false })
      const mockValidator2: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: false })

      const ethAuth = new ETHAuth(mockValidator1, mockValidator2)
      const proof = new Proof()

      const result = await ethAuth.validateProofSignature(proof)

      expect(result).toBe(false)
      expect(mockValidator1).toHaveBeenCalled()
      expect(mockValidator2).toHaveBeenCalled()
    })

    test('validateProofSignature handles validator exceptions', async () => {
      const mockValidator1: ValidatorFunc = jest.fn().mockRejectedValue(new Error('Validator error'))
      const mockValidator2: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: true })

      const ethAuth = new ETHAuth(mockValidator1, mockValidator2)
      const proof = new Proof()

      const result = await ethAuth.validateProofSignature(proof)

      expect(result).toBe(true)
      expect(mockValidator1).toHaveBeenCalled()
      expect(mockValidator2).toHaveBeenCalled()
    })

    test('validateProofSignature returns false when all validators throw', async () => {
      const mockValidator1: ValidatorFunc = jest.fn().mockRejectedValue(new Error('Error 1'))
      const mockValidator2: ValidatorFunc = jest.fn().mockRejectedValue(new Error('Error 2'))

      const ethAuth = new ETHAuth(mockValidator1, mockValidator2)
      const proof = new Proof()

      const result = await ethAuth.validateProofSignature(proof)

      expect(result).toBe(false)
    })
  })

  describe('validateProof integration', () => {
    test('validateProof throws error for invalid claims', async () => {
      const ethAuth = new ETHAuth()
      const proof = new Proof()
      proof.claims.app = '' // Invalid - empty app
      proof.claims.v = '1'

      await expect(ethAuth.validateProof(proof)).rejects.toThrow('ethauth: proof claims are invalid')
    })

    test('validateProof skips signature validation when requested', async () => {
      const mockValidator: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: false })
      const ethAuth = new ETHAuth(mockValidator)
      const proof = new Proof()
      proof.claims.app = 'TestApp'
      proof.claims.v = '1'
      proof.setIssuedAtNow()
      proof.setExpiryIn(3600)

      const result = await ethAuth.validateProof(proof, true) // Skip signature validation

      expect(result).toBe(true)
      expect(mockValidator).not.toHaveBeenCalled() // Should be skipped
    })

    test('validateProof throws error for invalid signature', async () => {
      const mockValidator: ValidatorFunc = jest.fn().mockResolvedValue({ isValid: false })
      const ethAuth = new ETHAuth(mockValidator)
      const proof = new Proof()
      proof.claims.app = 'TestApp'
      proof.claims.v = '1'
      proof.setIssuedAtNow()
      proof.setExpiryIn(3600)

      await expect(ethAuth.validateProof(proof, false)) // Don't skip signature validation
        .rejects.toThrow('ethauth: proof signature is invalid')
    })
  })
})
