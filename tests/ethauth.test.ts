import { ETHAuth, Claims, validateClaims, Proof, ETHAuthVersion, ValidatorFunc, IsValidSignatureBytes32MagicValue } from '../src/index'
import { ethers } from 'ethers'

describe('ETHAuth', () => {

  test('encode and decode', async () => {
    // TODO/NOTE: this expected value is fixed, but the time in iat and exp moves forward,
    // this test is brittle and eventually will fail.
    const expected = {
      iat: 1637067580,
      exp: 1662987692,
      digestHex: '0xc6d086cf48108f73cf7db47b824337360df01aa4d1be7247c9993f95d958f53b',
      proofString: 'eth.0xe0c9828dee3411a28ccb4bb82a18d0aad24489e0.eyJhcHAiOiJFVEhBdXRoVGVzdCIsImlhdCI6MTYzNzA2NzU4MCwiZXhwIjoxNjYyOTg3NjkyLCJ2IjoiMSJ9.0xb4bc7d56413b1090f0eeb68bf6290c52e77ee87310604128cb91accab3c917ea79e6135003163c2c5750a57b95ab048c695917df80c1b0718049084754a108561b'
  }
  
    //--
  
    // const wallet = ethers.Wallet.createRandom()
    const wallet = ethers.Wallet.fromMnemonic('outdoor sentence roast truly flower surface power begin ocean silent debate funny')
  
    const claims: Claims = {
      app: 'ETHAuthTest',
      iat: Math.round((new Date()).getTime() / 1000),
      exp: Math.round((new Date()).getTime() / 1000) + (60*60*24*300),
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
  
    // console.log('==>', proof.claims)
  
    // const digest = tt.messageDigest0()
    const digest = proof.messageDigest()
  
    const digestHex = ethers.utils.hexlify(digest)
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
