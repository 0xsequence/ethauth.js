import { describe, test, expect } from 'vitest'

import { encodeTypedDataDigest, encodeTypedDataHash, TypedData } from '../src/typed-data'

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
