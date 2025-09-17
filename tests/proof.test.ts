import { Proof, Claims, validateClaims, ETHAuthVersion, ETHAuthPrefix, ETHAuthEIP712Domain } from '../src/proof'

describe('Proof Constants', () => {
  test('ETHAuthVersion constant', () => {
    expect(ETHAuthVersion).toBe('1')
  })

  test('ETHAuthPrefix constant', () => {
    expect(ETHAuthPrefix).toBe('eth')
  })

  test('ETHAuthEIP712Domain constant', () => {
    expect(ETHAuthEIP712Domain).toEqual({
      name: 'ETHAuth',
      version: '1'
    })
  })
})

describe('Proof Class Constructor', () => {
  test('constructor with no arguments', () => {
    const proof = new Proof()

    expect(proof.prefix).toBe('eth')
    expect(proof.address).toBe('')
    expect(proof.signature).toBe('')
    expect(proof.extra).toBe('')
    expect(proof.claims).toEqual({
      app: '',
      iat: 0,
      exp: 0,
      v: '1'
    })
  })

  test('constructor with partial arguments', () => {
    const proof = new Proof({
      address: '0x1234567890123456789012345678901234567890',
      signature: '0xsignature'
    })

    expect(proof.prefix).toBe('eth')
    expect(proof.address).toBe('0x1234567890123456789012345678901234567890')
    expect(proof.signature).toBe('0xsignature')
    expect(proof.extra).toBe('')
    expect(proof.claims).toEqual({
      app: '',
      iat: 0,
      exp: 0,
      v: '1'
    })
  })

  test('constructor with full arguments', () => {
    const customClaims: Claims = {
      app: 'TestApp',
      iat: 1234567890,
      exp: 1234567890 + 3600,
      v: '1',
      n: 42,
      typ: 'testType',
      ogn: 'testOrigin'
    }

    const proof = new Proof({
      address: '0x1234567890123456789012345678901234567890',
      claims: customClaims,
      signature: '0xsignature',
      extra: '0xextra'
    })

    expect(proof.prefix).toBe('eth')
    expect(proof.address).toBe('0x1234567890123456789012345678901234567890')
    expect(proof.signature).toBe('0xsignature')
    expect(proof.extra).toBe('0xextra')
    expect(proof.claims).toEqual(customClaims)
  })

  test('constructor converts address to lowercase', () => {
    const proof = new Proof({
      address: '0X1234567890123456789012345678901234567890'
    })

    expect(proof.address).toBe('0x1234567890123456789012345678901234567890')
  })
})

describe('Proof Class Methods', () => {
  let proof: Proof

  beforeEach(() => {
    proof = new Proof({
      address: '0x1234567890123456789012345678901234567890'
    })
  })

  test('setIssuedAtNow sets iat to current timestamp', () => {
    const beforeTime = Math.round(new Date().getTime() / 1000)
    proof.setIssuedAtNow()
    const afterTime = Math.round(new Date().getTime() / 1000)

    expect(proof.claims.iat).toBeGreaterThanOrEqual(beforeTime)
    expect(proof.claims.iat).toBeLessThanOrEqual(afterTime)
  })

  test('setExpiryIn sets exp to current time + seconds', () => {
    const beforeTime = Math.round(new Date().getTime() / 1000)
    const secondsToAdd = 3600 // 1 hour

    proof.setExpiryIn(secondsToAdd)
    const afterTime = Math.round(new Date().getTime() / 1000)

    expect(proof.claims.exp).toBeGreaterThanOrEqual(beforeTime + secondsToAdd)
    expect(proof.claims.exp).toBeLessThanOrEqual(afterTime + secondsToAdd)
  })

  test('validateClaims calls standalone validateClaims function', () => {
    // Set valid claims
    proof.claims.app = 'TestApp'
    proof.claims.v = '1'
    proof.setIssuedAtNow()
    proof.setExpiryIn(3600)

    const result = proof.validateClaims()
    expect(result.ok).toBe(true)
    expect(result.err).toBeUndefined()
  })

  test('messageTypedData with minimal claims', () => {
    proof.claims.app = 'TestApp'
    proof.claims.v = '1'

    const typedData = proof.messageTypedData()

    expect(typedData.domain).toEqual({
      name: 'ETHAuth',
      version: '1'
    })
    expect(typedData.types.Claims).toEqual([
      { name: 'app', type: 'string' },
      { name: 'v', type: 'string' }
    ])
    expect(typedData.message).toEqual({
      app: 'TestApp',
      v: '1'
    })
  })

  test('messageTypedData with all claims', () => {
    proof.claims = {
      app: 'TestApp',
      iat: 1234567890,
      exp: 1234567890 + 3600,
      n: 42,
      typ: 'testType',
      ogn: 'testOrigin',
      v: '1'
    }

    const typedData = proof.messageTypedData()

    expect(typedData.domain).toEqual({
      name: 'ETHAuth',
      version: '1'
    })
    expect(typedData.types.Claims).toEqual([
      { name: 'app', type: 'string' },
      { name: 'iat', type: 'int64' },
      { name: 'exp', type: 'int64' },
      { name: 'n', type: 'uint64' },
      { name: 'typ', type: 'string' },
      { name: 'ogn', type: 'string' },
      { name: 'v', type: 'string' }
    ])
    expect(typedData.message).toEqual({
      app: 'TestApp',
      iat: 1234567890,
      exp: 1234567890 + 3600,
      n: 42,
      typ: 'testType',
      ogn: 'testOrigin',
      v: '1'
    })
  })

  test('messageTypedData excludes empty/zero values', () => {
    proof.claims = {
      app: 'TestApp',
      iat: 0, // Should be excluded
      exp: 1234567890,
      n: 0, // Should be excluded
      typ: '', // Should be excluded
      ogn: '', // Should be excluded
      v: '1'
    }

    const typedData = proof.messageTypedData()

    expect(typedData.types.Claims).toEqual([
      { name: 'app', type: 'string' },
      { name: 'exp', type: 'int64' },
      { name: 'v', type: 'string' }
    ])
    expect(typedData.message).toEqual({
      app: 'TestApp',
      exp: 1234567890,
      v: '1'
    })
  })

  test('messageDigest throws error for invalid claims', () => {
    // Empty app should make claims invalid
    proof.claims.app = ''
    proof.claims.v = '1'

    expect(() => proof.messageDigest()).toThrow('claims: app is empty')
  })

  test('messageDigest returns Uint8Array for valid claims', () => {
    // Set valid claims
    proof.claims.app = 'TestApp'
    proof.claims.v = '1'
    proof.setIssuedAtNow()
    proof.setExpiryIn(3600)

    const digest = proof.messageDigest()

    expect(digest).toBeInstanceOf(Uint8Array)
    expect(digest.length).toBe(32) // keccak256 produces 32 bytes
  })
})

describe('validateClaims Function', () => {
  test('valid claims', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const claims: Claims = {
      app: 'TestApp',
      iat: currentTime,
      exp: currentTime + 3600,
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(true)
    expect(result.err).toBeUndefined()
  })

  test('empty app name', () => {
    const claims: Claims = {
      app: '',
      exp: Math.round(new Date().getTime() / 1000) + 3600,
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(false)
    expect(result.err?.message).toBe('claims: app is empty')
  })

  test('empty version', () => {
    const claims: Claims = {
      app: 'TestApp',
      exp: Math.round(new Date().getTime() / 1000) + 3600,
      v: ''
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(false)
    expect(result.err?.message).toBe('claims: ethauth version is empty')
  })

  test('iat too far in the future', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const claims: Claims = {
      app: 'TestApp',
      iat: currentTime + 600, // 10 minutes in the future (> 5 min drift)
      exp: currentTime + 3600,
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(false)
    expect(result.err?.message).toBe('claims: iat is invalid')
  })

  test('iat too far in the past', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const oneYearAgo = currentTime - 60 * 60 * 24 * 365 - 600 // More than 1 year ago
    const claims: Claims = {
      app: 'TestApp',
      iat: oneYearAgo,
      exp: currentTime + 3600,
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(false)
    expect(result.err?.message).toBe('claims: iat is invalid')
  })

  test('iat = 0 is allowed', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const claims: Claims = {
      app: 'TestApp',
      iat: 0, // Should be allowed
      exp: currentTime + 3600,
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(true)
  })

  test('exp in the past', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const claims: Claims = {
      app: 'TestApp',
      exp: currentTime - 600, // 10 minutes ago (> 5 min drift)
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(false)
    expect(result.err?.message).toBe('claims: token has expired')
  })

  test('exp too far in the future', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const twoYearsFromNow = currentTime + 60 * 60 * 24 * 365 * 2 // 2 years
    const claims: Claims = {
      app: 'TestApp',
      exp: twoYearsFromNow,
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(false)
    expect(result.err?.message).toBe('claims: token has expired')
  })

  test('exp within 5 minute drift is allowed', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const claims: Claims = {
      app: 'TestApp',
      exp: currentTime - 240, // 4 minutes ago (within 5 min drift)
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(true)
  })

  test('all optional fields present', () => {
    const currentTime = Math.round(new Date().getTime() / 1000)
    const claims: Claims = {
      app: 'TestApp',
      iat: currentTime,
      exp: currentTime + 3600,
      n: 12345,
      typ: 'testType',
      ogn: 'testOrigin',
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(true)
    expect(result.err).toBeUndefined()
  })
})

describe('Claims Interface Edge Cases', () => {
  test('claims with undefined optional fields', () => {
    const claims: Claims = {
      app: 'TestApp',
      exp: Math.round(new Date().getTime() / 1000) + 3600,
      v: '1'
      // iat, n, typ, ogn are undefined
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(true)
  })

  test('claims with zero values for numeric optional fields', () => {
    const claims: Claims = {
      app: 'TestApp',
      iat: 0,
      exp: Math.round(new Date().getTime() / 1000) + 3600,
      n: 0,
      v: '1'
    }

    const result = validateClaims(claims)
    expect(result.ok).toBe(true)
  })
})
