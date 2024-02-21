import { ETHAuth, Claims, validateClaims, Proof, ETHAuthVersion } from '../src/index'
import { ethers } from 'ethers'

describe('ETHAuth', () => {
  test('encode and decode', async () => {
    // TODO/NOTE: this expected value is fixed, but the time in iat and exp moves forward,
    // this test is brittle and eventually will fail.
    const expected = {
      iat: 1668630293,
      exp: 1669630293,
      digestHex: '0x0ccedd3237b173e5d73006f12786c4898be261f25776ed34a0be1b23e01a0247',
      proofString:
        'eth.0xe0c9828dee3411a28ccb4bb82a18d0aad24489e0.eyJhcHAiOiJFVEhBdXRoVGVzdCIsImlhdCI6MTY2ODYzMDI5MywiZXhwIjoxNjY5NjMwMjkzLCJ2IjoiMSJ9.0x6e3ee5417304b569466d50e6c87f621af45e4e54f66b9268a0a2476ebc6e41c336640c3958ce816ec08f3702a26990247a13ced99e9e24f80649e4f93f83909e1b'
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
