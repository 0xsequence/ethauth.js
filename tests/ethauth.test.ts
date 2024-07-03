import { ETHAuth, Claims, validateClaims, Proof, ETHAuthVersion } from '../src/index'
import { ethers } from 'ethers'

describe('ETHAuth', () => {
  test('encode and decode', async () => {
    // TODO/NOTE: this expected value is fixed, but the time in iat and exp moves forward,
    // this test is brittle and eventually will fail.
    const expected = {
      iat: 1720017432,
      exp: 1745937432,
      digestHex: '0x2926d593d635b41fe4adff9c7ca6b9b98879d721c45f7c5bc0a3ca34455b6015',
      proofString:
        'eth.0xe0c9828dee3411a28ccb4bb82a18d0aad24489e0.eyJhcHAiOiJFVEhBdXRoVGVzdCIsImlhdCI6MTcyMDAxNzQzMiwiZXhwIjoxNzQ1OTM3NDMyLCJ2IjoiMSJ9.0x9ebacaa66ef188d5dfd136c930ef3953d0539e9126d0daeb120613643d5490b127f3cb89b0dfad281f39a1af9f40441acb98be640544b3ac552e5ca46791952a1c'
    }

    //--

    // const wallet = ethers.Wallet.createRandom()
    const wallet = ethers.Wallet.fromPhrase('outdoor sentence roast truly flower surface power begin ocean silent debate funny')

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

    const digestHex = ethers.hexlify(digest)
    console.log('digestHex', digestHex)
    expect(digestHex).toEqual(expected.digestHex)

    // Sign the message and set on the token
    proof.signature = await wallet.signMessage(digest)

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
