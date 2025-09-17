import { Address, Mnemonic, PersonalMessage, Secp256k1, Signature } from 'ox'
import { ETHAuthVersion, Proof } from '../src/proof'
import { IsValidSignatureBytes32MagicValue, ValidateContractAccountProof, ValidateEOAProof } from '../src/validate'

// Create wallet using ox
const privateKey = Mnemonic.toPrivateKey('outdoor sentence roast truly flower surface power begin ocean silent debate funny')
const publicKey = Secp256k1.getPublicKey({ privateKey })
const address = Address.fromPublicKey(publicKey)
const wallet = { privateKey, address }

describe('Validation Functions', () => {
  test('IsValidSignatureBytes32MagicValue constant', () => {
    // EIP-1271 magic value should be correct
    expect(IsValidSignatureBytes32MagicValue).toBe('0x1626ba7e')
  })

  test('ValidateEOAProof - valid signature', async () => {
    // Create a proof with a valid signature
    const currentTime = Math.round(new Date().getTime() / 1000)
    const proof = new Proof({ address: wallet.address })
    proof.claims.app = 'ValidationTest'
    proof.claims.iat = currentTime
    proof.claims.exp = currentTime + 3600 // 1 hour
    proof.claims.v = ETHAuthVersion

    // Sign the message digest
    const digest = proof.messageDigest()
    const signPayload = PersonalMessage.getSignPayload(digest)
    const signatureObj = Secp256k1.sign({
      privateKey: wallet.privateKey,
      payload: signPayload
    })
    proof.signature = Signature.toHex(signatureObj)

    // Mock provider (not actually needed for EOA validation)
    const mockProvider = null as any

    const result = await ValidateEOAProof(mockProvider, 1, proof)

    expect(result.isValid).toBe(true)
    expect(result.address).toBe(proof.address)
  })

  test('ValidateEOAProof - invalid signature', async () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const proof = new Proof({ address: wallet.address })
    proof.claims.app = 'ValidationTest'
    proof.claims.iat = currentTime
    proof.claims.exp = currentTime + 3600
    proof.claims.v = ETHAuthVersion

    // Use an invalid signature - proper length but invalid data (all zeros)
    proof.signature =
      '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

    const mockProvider = null as any

    // Invalid signatures throw errors in ethers.verifyMessage
    await expect(ValidateEOAProof(mockProvider, 1, proof)).rejects.toThrow() // Will throw due to invalid signature format
  })

  test('ValidateEOAProof - wrong address', async () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const proof = new Proof({ address: '0x1234567890123456789012345678901234567890' })
    proof.claims.app = 'ValidationTest'
    proof.claims.iat = currentTime
    proof.claims.exp = currentTime + 3600
    proof.claims.v = ETHAuthVersion

    // Sign with our wallet but claim a different address
    const digest = proof.messageDigest()
    const signPayload = PersonalMessage.getSignPayload(digest)
    const signatureObj = Secp256k1.sign({
      privateKey: wallet.privateKey,
      payload: signPayload
    })
    proof.signature = Signature.toHex(signatureObj)

    const mockProvider = null as any
    const result = await ValidateEOAProof(mockProvider, 1, proof)

    expect(result.isValid).toBe(false)
    expect(result.address).toBeUndefined()
  })

  test('ValidateContractAccountProof - no provider', async () => {
    const proof = new Proof({ address: '0x1234567890123456789012345678901234567890' })
    proof.signature = '0x1234'

    const result = await ValidateContractAccountProof(undefined as any, 1, proof)

    expect(result.isValid).toBe(false)
  })

  test('ValidateContractAccountProof - no contract code', async () => {
    const proof = new Proof({ address: '0x1234567890123456789012345678901234567890' })
    proof.claims.app = 'ValidationTest'
    proof.claims.iat = Math.round(new Date().getTime() / 1000)
    proof.claims.exp = Math.round(new Date().getTime() / 1000) + 3600
    proof.claims.v = ETHAuthVersion
    proof.signature = '0x1234'

    // Mock provider that returns empty code (no contract deployed)
    const mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x')
    } as any

    await expect(ValidateContractAccountProof(mockProvider, 1, proof)).rejects.toThrow(
      'ValidateContractAccountProof failed. unable to fetch wallet contract code'
    )

    expect(mockProvider.getCode).toHaveBeenCalledWith(proof.address)
  })

  test('ValidateContractAccountProof - contract interaction (basic coverage)', async () => {
    // Note: These tests focus on the code paths we can test without complex ethers mocking.
    // Full integration tests would require actual blockchain interaction or more sophisticated mocking.

    const contractAddress = '0x1234567890123456789012345678901234567890'
    const proof = new Proof({ address: contractAddress })
    proof.claims.app = 'ValidationTest'
    proof.claims.iat = Math.round(new Date().getTime() / 1000)
    proof.claims.exp = Math.round(new Date().getTime() / 1000) + 3600
    proof.claims.v = ETHAuthVersion
    proof.signature =
      '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

    // Mock provider with contract code that throws on contract call
    const mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x1234567890abcdef') // Has contract code
    } as any

    // This test will likely throw when it tries to create the ethers.Contract
    // In a real scenario, we would need proper provider setup
    await expect(ValidateContractAccountProof(mockProvider, 1, proof)).rejects.toThrow() // Will throw due to contract interaction complexity

    expect(mockProvider.getCode).toHaveBeenCalledWith(contractAddress)
  })
})
