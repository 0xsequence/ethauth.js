import { ETHAuth, Claims, validateClaims, Proof, ETHAuthVersion, ValidatorFunc, IsValidSignatureBytes32MagicValue } from '../src/index'
import { ethers } from 'ethers'

describe('ETHAuth', () => {

  test('encode and decode', async () => {
    const expected = {
      iat: 1596215115,
      exp: 1627751115,
      digestHex: '0x7c5b1bf6b2a5dd7c710292f2584c88f246af2a4bb0860bfba34de6db16684d23',
      proofString: 'eth.0xe0c9828dee3411a28ccb4bb82a18d0aad24489e0.eyJhcHAiOiJFVEhBdXRoVGVzdCIsImlhdCI6MTU5NjIxNTExNSwiZXhwIjoxNjI3NzUxMTE1LCJ2IjoiMSJ9.0xe3f42d661cc0fa50b86011cdf4c1fc0e1077fd8b3a0fa53e8ee3a978bdc229861996e35009f10ef44de120257c06dfb32684497000c4932ba7ea0957985777411b'
  }
  
    //--
  
    // const wallet = ethers.Wallet.createRandom()
    const wallet = ethers.Wallet.fromMnemonic('outdoor sentence roast truly flower surface power begin ocean silent debate funny')
  
    const claims: Claims = {
      app: 'ETHAuthTest',
      iat: Math.round((new Date()).getTime() / 1000),
      exp: Math.round((new Date()).getTime() / 1000) + (60*60*24*365),
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
