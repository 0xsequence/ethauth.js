import { vi, describe, test, expect } from 'vitest'
import { Base64 } from 'js-base64'
import { ETHAuth } from '../src/ethauth'
import { Claims, Proof, ETHAuthVersion } from '../src/proof'
import { Mnemonic, Secp256k1, Address, PersonalMessage, Signature } from 'ox'

// Test wallet for consistent fixtures
const privateKey = Mnemonic.toPrivateKey('outdoor sentence roast truly flower surface power begin ocean silent debate funny')
const publicKey = Secp256k1.getPublicKey({ privateKey })
const address = Address.fromPublicKey(publicKey)
const wallet = { privateKey, address }

describe('Base64 Encoding Fixtures for Library Migration', () => {
  describe('Claims Base64 Encoding Fixtures', () => {
    // These fixtures capture the exact base64 encoding behavior of js-base64
    // Use these to verify your replacement library produces identical results

    test('minimal claims encoding fixture', () => {
      const claims: Claims = {
        app: 'TestApp',
        exp: 1640995200, // Fixed timestamp: 2022-01-01 00:00:00 UTC
        v: ETHAuthVersion
      }

      const claimsJSON = JSON.stringify(claims)
      const encoded = Base64.encode(claimsJSON, true) // true = URL-safe
      const decoded = Base64.decode(encoded)

      const fixture = {
        description: 'Minimal claims with required fields only',
        input: {
          claims,
          claimsJSON
        },
        expected: {
          encoded,
          decoded,
          decodedParsed: JSON.parse(decoded)
        }
      }

      console.log('Minimal Claims Fixture:', JSON.stringify(fixture, null, 2))

      // Verify round-trip integrity
      expect(decoded).toBe(claimsJSON)
      expect(JSON.parse(decoded)).toEqual(claims)

      // Capture exact encoded value for migration testing
      expect(encoded).toBe('eyJhcHAiOiJUZXN0QXBwIiwiZXhwIjoxNjQwOTk1MjAwLCJ2IjoiMSJ9')
    })

    test('full claims encoding fixture', () => {
      const claims: Claims = {
        app: 'MyDApp',
        exp: 1640995200, // 2022-01-01 00:00:00 UTC
        iat: 1640908800, // 2021-12-31 00:00:00 UTC
        n: 12345,
        typ: 'access_token',
        ogn: 'https://mydapp.example.com',
        v: ETHAuthVersion
      }

      const claimsJSON = JSON.stringify(claims)
      const encoded = Base64.encode(claimsJSON, true)
      const decoded = Base64.decode(encoded)

      const fixture = {
        description: 'Full claims with all optional fields',
        input: {
          claims,
          claimsJSON
        },
        expected: {
          encoded,
          decoded,
          decodedParsed: JSON.parse(decoded)
        }
      }

      console.log('Full Claims Fixture:', JSON.stringify(fixture, null, 2))

      expect(decoded).toBe(claimsJSON)
      expect(JSON.parse(decoded)).toEqual(claims)

      // Capture exact encoded value
      expect(encoded).toBe(
        'eyJhcHAiOiJNeURBcHAiLCJleHAiOjE2NDA5OTUyMDAsImlhdCI6MTY0MDkwODgwMCwibiI6MTIzNDUsInR5cCI6ImFjY2Vzc190b2tlbiIsIm9nbiI6Imh0dHBzOi8vbXlkYXBwLmV4YW1wbGUuY29tIiwidiI6IjEifQ'
      )
    })

    test('special characters encoding fixture', () => {
      const claims: Claims = {
        app: 'Test App with émojis 🚀 and "quotes" & <tags>',
        exp: 1640995200,
        iat: 1640908800,
        ogn: 'https://test.com/path?param=value&other=données',
        v: ETHAuthVersion
      }

      const claimsJSON = JSON.stringify(claims)
      const encoded = Base64.encode(claimsJSON, true)
      const decoded = Base64.decode(encoded)

      const fixture = {
        description: 'Claims with special characters, unicode, and URL encoding',
        input: {
          claims,
          claimsJSON
        },
        expected: {
          encoded,
          decoded,
          decodedParsed: JSON.parse(decoded)
        }
      }

      console.log('Special Characters Fixture:', JSON.stringify(fixture, null, 2))

      expect(decoded).toBe(claimsJSON)
      expect(JSON.parse(decoded)).toEqual(claims)
    })

    test('large numbers encoding fixture', () => {
      const claims: Claims = {
        app: 'BigNumberApp',
        exp: 9007199254740991, // Max safe integer
        iat: 0, // Minimum timestamp
        n: 18446744073709551615, // Large uint64
        v: ETHAuthVersion
      }

      const claimsJSON = JSON.stringify(claims)
      const encoded = Base64.encode(claimsJSON, true)
      const decoded = Base64.decode(encoded)

      const fixture = {
        description: 'Claims with large numbers and edge case timestamps',
        input: {
          claims,
          claimsJSON
        },
        expected: {
          encoded,
          decoded,
          decodedParsed: JSON.parse(decoded)
        }
      }

      console.log('Large Numbers Fixture:', JSON.stringify(fixture, null, 2))

      expect(decoded).toBe(claimsJSON)
      expect(JSON.parse(decoded)).toEqual(claims)
    })
  })

  describe('Complete Proof Encoding Fixtures', () => {
    test('EOA proof encoding fixture', async () => {
      const currentTime = Math.floor(Date.now() / 1000)
      const claims: Claims = {
        app: 'FixtureApp',
        exp: currentTime + 3600, // 1 hour from now
        iat: currentTime,
        v: ETHAuthVersion
      }

      // Create proof
      const proof = new Proof({
        address: wallet.address,
        claims,
        signature: '0x' as any, // Will be set below
        extra: '0x' as any
      })

      // Generate signature
      const digest = proof.messageDigest()
      const signPayload = PersonalMessage.getSignPayload(digest)
      const signatureObj = Secp256k1.sign({
        privateKey: wallet.privateKey,
        payload: signPayload
      })
      proof.signature = Signature.toHex(signatureObj)

      // Encode using ETHAuth
      const ethAuth = new ETHAuth()
      const proofString = await ethAuth.encodeProof(proof, true) // Skip validation for fixture

      // Extract base64 part from proof string
      const parts = proofString.split('.')
      const base64Claims = parts[2]
      const decodedClaims = Base64.decode(base64Claims)

      const fixture = {
        description: 'Complete EOA proof with base64 claims encoding',
        input: {
          address: wallet.address,
          claims,
          signature: proof.signature,
          extra: proof.extra
        },
        base64Analysis: {
          claimsJSON: JSON.stringify(claims),
          base64Encoded: base64Claims,
          base64Decoded: decodedClaims,
          roundTripValid: decodedClaims === JSON.stringify(claims)
        },
        complete: {
          proofString,
          proofParts: parts
        }
      }

      console.log('EOA Proof Fixture:', JSON.stringify(fixture, null, 2))

      // Verify the base64 part specifically
      expect(fixture.base64Analysis.roundTripValid).toBe(true)
      expect(JSON.parse(fixture.base64Analysis.base64Decoded)).toEqual(claims)
    })

    test('proof with extra data encoding fixture', async () => {
      const currentTime = Math.floor(Date.now() / 1000)
      const claims: Claims = {
        app: 'SmartWalletApp',
        exp: currentTime + 3600,
        iat: currentTime,
        n: 42,
        typ: 'smart_wallet',
        v: ETHAuthVersion
      }

      const proof = new Proof({
        address: wallet.address,
        claims,
        signature:
          '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' as any,
        extra: '0xdeadbeefcafebabe' as any
      })

      const ethAuth = new ETHAuth()
      const proofString = await ethAuth.encodeProof(proof, true)

      const parts = proofString.split('.')
      const base64Claims = parts[2]
      const decodedClaims = Base64.decode(base64Claims)

      const fixture = {
        description: 'Proof with extra data and complex claims',
        input: {
          address: proof.address,
          claims,
          signature: proof.signature,
          extra: proof.extra
        },
        base64Analysis: {
          claimsJSON: JSON.stringify(claims),
          base64Encoded: base64Claims,
          base64Decoded: decodedClaims,
          roundTripValid: decodedClaims === JSON.stringify(claims)
        },
        complete: {
          proofString,
          proofParts: parts,
          hasExtraData: parts.length === 5
        }
      }

      console.log('Extra Data Proof Fixture:', JSON.stringify(fixture, null, 2))

      expect(fixture.base64Analysis.roundTripValid).toBe(true)
      expect(fixture.complete.hasExtraData).toBe(true)
    })
  })

  describe('Base64 Edge Cases and Compatibility', () => {
    test('URL-safe vs standard base64 encoding', () => {
      const testString = '{"test": "value with + and / characters"}'

      const urlSafeEncoded = Base64.encode(testString, true)
      const standardEncoded = Base64.encode(testString, false)

      const urlSafeDecoded = Base64.decode(urlSafeEncoded)
      const standardDecoded = Base64.decode(standardEncoded)

      const fixture = {
        description: 'URL-safe vs standard base64 encoding comparison',
        input: testString,
        urlSafe: {
          encoded: urlSafeEncoded,
          decoded: urlSafeDecoded,
          hasUrlSafeChars: !urlSafeEncoded.includes('+') && !urlSafeEncoded.includes('/')
        },
        standard: {
          encoded: standardEncoded,
          decoded: standardDecoded,
          hasStandardChars: standardEncoded.includes('+') || standardEncoded.includes('/')
        },
        compatibility: {
          decodingMatches: urlSafeDecoded === standardDecoded,
          encodingDiffers: urlSafeEncoded !== standardEncoded
        }
      }

      console.log('Base64 Encoding Types Fixture:', JSON.stringify(fixture, null, 2))

      // ETHAuth uses URL-safe encoding
      expect(fixture.urlSafe.hasUrlSafeChars).toBe(true)
      expect(fixture.compatibility.decodingMatches).toBe(true)
    })

    test('empty and whitespace handling', () => {
      const testCases = [
        { description: 'empty string', value: '' },
        { description: 'single space', value: ' ' },
        { description: 'multiple spaces', value: '   ' },
        { description: 'newline', value: '\n' },
        { description: 'tab', value: '\t' },
        { description: 'mixed whitespace', value: ' \n\t ' }
      ]

      const fixtures = testCases.map(testCase => {
        const encoded = Base64.encode(testCase.value, true)
        const decoded = Base64.decode(encoded)

        return {
          description: testCase.description,
          input: testCase.value,
          encoded,
          decoded,
          roundTripValid: decoded === testCase.value,
          inputLength: testCase.value.length,
          encodedLength: encoded.length
        }
      })

      console.log('Whitespace Handling Fixtures:', JSON.stringify(fixtures, null, 2))

      fixtures.forEach(fixture => {
        expect(fixture.roundTripValid).toBe(true)
      })
    })

    test('json serialization consistency', () => {
      // Test that JSON.stringify produces consistent results
      const claims: Claims = {
        app: 'OrderTest',
        v: ETHAuthVersion,
        exp: 1640995200,
        iat: 1640908800,
        n: 123,
        typ: 'test',
        ogn: 'example.com'
      }

      // Test multiple serializations
      const serializations = Array.from({ length: 5 }, () => JSON.stringify(claims))
      const encodings = serializations.map(json => Base64.encode(json, true))

      const fixture = {
        description: 'JSON serialization consistency for base64 encoding',
        claims,
        serializations,
        encodings,
        allSerializationsIdentical: serializations.every(s => s === serializations[0]),
        allEncodingsIdentical: encodings.every(e => e === encodings[0])
      }

      console.log('JSON Consistency Fixture:', JSON.stringify(fixture, null, 2))

      expect(fixture.allSerializationsIdentical).toBe(true)
      expect(fixture.allEncodingsIdentical).toBe(true)
    })
  })

  describe('Migration Validation Helpers', () => {
    test('create validation dataset for library migration', () => {
      // This creates a comprehensive dataset you can use to validate your new library
      const testCases = [
        {
          name: 'minimal_claims',
          claims: { app: 'Test', exp: 1640995200, v: '1' }
        },
        {
          name: 'full_claims',
          claims: { app: 'Full', exp: 1640995200, iat: 1640908800, n: 999, typ: 'token', ogn: 'test.com', v: '1' }
        },
        {
          name: 'unicode_claims',
          claims: { app: 'Test 🚀 émojis', exp: 1640995200, ogn: 'tëst.com/pâth', v: '1' }
        },
        {
          name: 'special_chars',
          claims: { app: 'App with "quotes" & <tags>', exp: 1640995200, v: '1' }
        },
        {
          name: 'large_numbers',
          claims: { app: 'Numbers', exp: 9007199254740991, iat: 0, n: 18446744073709551615, v: '1' }
        }
      ]

      const validationDataset = testCases.map(testCase => {
        const claimsJSON = JSON.stringify(testCase.claims)
        const encoded = Base64.encode(claimsJSON, true)
        const decoded = Base64.decode(encoded)

        return {
          name: testCase.name,
          input: {
            claims: testCase.claims,
            claimsJSON
          },
          js_base64_output: {
            encoded,
            decoded
          },
          validation: {
            roundTripSuccess: decoded === claimsJSON,
            parsedMatch: JSON.stringify(JSON.parse(decoded)) === claimsJSON
          }
        }
      })

      console.log('Migration Validation Dataset:', JSON.stringify(validationDataset, null, 2))

      // All test cases should pass
      validationDataset.forEach(testCase => {
        expect(testCase.validation.roundTripSuccess).toBe(true)
        expect(testCase.validation.parsedMatch).toBe(true)
      })

      // Store this dataset for comparison with your new library
      expect(validationDataset).toHaveLength(testCases.length)

      // Export fixtures to a JSON file for migration validation
      return validationDataset
    })

    test('export comprehensive migration fixtures', () => {
      // This creates a JSON file with all the fixtures for easy migration testing
      const comprehensiveFixtures = {
        description: 'Comprehensive base64 encoding fixtures for js-base64 migration',
        created: new Date().toISOString(),
        library: 'js-base64@3.7.2',
        fixtures: {
          minimal: {
            input: { app: 'Test', exp: 1640995200, v: '1' },
            expectedEncoded: 'eyJhcHAiOiJUZXN0IiwiZXhwIjoxNjQwOTk1MjAwLCJ2IjoiMSJ9'
          },
          full: {
            input: { app: 'Full', exp: 1640995200, iat: 1640908800, n: 999, typ: 'token', ogn: 'test.com', v: '1' },
            expectedEncoded:
              'eyJhcHAiOiJGdWxsIiwiZXhwIjoxNjQwOTk1MjAwLCJpYXQiOjE2NDA5MDg4MDAsIm4iOjk5OSwidHlwIjoidG9rZW4iLCJvZ24iOiJ0ZXN0LmNvbSIsInYiOiIxIn0'
          },
          unicode: {
            input: { app: 'Test 🚀 émojis', exp: 1640995200, ogn: 'tëst.com/pâth', v: '1' },
            expectedEncoded:
              'eyJhcHAiOiJUZXN0IPCfmoAgw6ltb2ppcyIsImV4cCI6MTY0MDk5NTIwMCwib2duIjoidMOrc3QuY29tL3DDonRoIiwidiI6IjEifQ'
          },
          specialChars: {
            input: { app: 'App with "quotes" & <tags>', exp: 1640995200, v: '1' },
            expectedEncoded: 'eyJhcHAiOiJBcHAgd2l0aCBcInF1b3Rlc1wiICYgPHRhZ3M-IiwiZXhwIjoxNjQwOTk1MjAwLCJ2IjoiMSJ9'
          },
          largeNumbers: {
            input: { app: 'Numbers', exp: 9007199254740991, iat: 0, n: 18446744073709552000, v: '1' },
            expectedEncoded:
              'eyJhcHAiOiJOdW1iZXJzIiwiZXhwIjo5MDA3MTk5MjU0NzQwOTkxLCJpYXQiOjAsIm4iOjE4NDQ2NzQ0MDczNzA5NTUyMDAwLCJ2IjoiMSJ9'
          }
        },
        edgeCases: {
          emptyString: { input: '', expected: '' },
          whitespace: { input: ' \n\t ', expected: 'IAoJIA' },
          urlSafeEncoding: {
            note: 'ETHAuth uses URL-safe base64 encoding (no padding, - and _ instead of + and /)',
            example: {
              input: '{"test": "value with + and / characters"}',
              urlSafe: 'eyJ0ZXN0IjogInZhbHVlIHdpdGggKyBhbmQgLyBjaGFyYWN0ZXJzIn0'
            }
          }
        },
        validationInstructions: {
          steps: [
            '1. After swapping base64 libraries, run tests with the new library',
            '2. Compare encoded outputs with expectedEncoded values in fixtures',
            '3. Verify round-trip encoding/decoding produces identical results',
            '4. Pay special attention to URL-safe encoding behavior',
            '5. Test unicode and special character handling'
          ]
        }
      }

      console.log('Comprehensive Migration Fixtures:', JSON.stringify(comprehensiveFixtures, null, 2))

      // Validate all fixtures still work with current library
      Object.entries(comprehensiveFixtures.fixtures).forEach(([name, fixture]) => {
        const json = JSON.stringify(fixture.input)
        const encoded = Base64.encode(json, true)
        expect(encoded).toBe(fixture.expectedEncoded)
      })
    })
  })
})
