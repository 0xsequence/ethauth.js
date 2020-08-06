import { ETHWebToken, Claims, validateClaims, Token, EWTVersion } from '../src/index'
import { ethers } from 'ethers'

describe('ETHWebToken', () => {

  test('encode and decode', async () => {
    const expected = {
    //   iat: 1596075897,
    //   exp: 1627611897,
    //   digestHex: '0x2e56081433b7dc0330e11f9ed04913ac02895844011d6cf33fc9801c3cf0d132',
    //   tokenString: 'eth.0xe0c9828dee3411a28ccb4bb82a18d0aad24489e0.eyJhcHAiOiJFV1RUZXN0IiwiaWF0IjoxNTk2MDc1ODk3LCJleHAiOjE2Mjc2MTE4OTd9.0x177b89012aacafbd9a4e3e48ec44fab58ddbaf9ff018dfacde1f384b54cbaeec01693be0bd9a6f78befe3b3c33fd35cd30be00aa6a020ca3f1c90a72ef3b352a1b'
      iat: 1596215115,
      exp: 1627751115,
      digestHex: '0xb87f1f94926d80234ea2aa9d22b85d254972b2405789897862e6a15735f1801c',
      tokenString: 'eth.0xe0c9828dee3411a28ccb4bb82a18d0aad24489e0.eyJhcHAiOiJFV1RUZXN0IiwiaWF0IjoxNTk2MjE1MTE1LCJleHAiOjE2Mjc3NTExMTUsInYiOiIxIn0.0x82a7c0da6b51d15649ced147bf255ea13c51d8be4f92b4931d70c071fa95ae632c91e4c5f3b78c80bea27124ca63e5aa31eb30ed7d57f0968f72028d64ecadad1b'
  }
  
    //--
  
    // const wallet = ethers.Wallet.createRandom()
    const wallet = ethers.Wallet.fromMnemonic('outdoor sentence roast truly flower surface power begin ocean silent debate funny')
  
    const claims: Claims = {
      app: 'EWTTest',
      iat: Math.round((new Date()).getTime() / 1000),
      exp: Math.round((new Date()).getTime() / 1000) + (60*60*24*365),
      v: EWTVersion
    }
  
    console.log('claims', claims)
  
    const validClaims = validateClaims(claims)
    console.log(validClaims)
  
  
    // create token object
    const token = new Token({ address: wallet.address })
    token.claims.app = 'EWTTest'
    token.claims.iat = expected.iat
    token.claims.exp = expected.exp
  
    // console.log('==>', token.claims)
  
    // const digest = tt.messageDigest0()
    const digest = token.messageDigest()
  
    const digestHex = ethers.utils.hexlify(digest)
    console.log('digestHex', digestHex)
  
    // Sign the message and set on the token
    token.signature = await wallet.signMessage(digest)
  
  
    const ewt = new ETHWebToken()
    const tokenString = ewt.encodeToken(token)
  
    console.log('token:', token)
    console.log('tokenString:', tokenString)
  
  
    // decode the token string and assert
    const token2 = ewt.decodeToken(tokenString)
  
    expect(token.address).toEqual(token2.address)
    expect(token.validateClaims().ok).toEqual(true)
    expect(token2.validateClaims().ok).toEqual(true)
  
    // console.log('=> claims1', claims)
    // console.log('=> claims2', token2.claims)
  
    expect(tokenString).toEqual(expected.tokenString)
  

    // Validate the token
    expect(await ewt.validateToken(token)).toEqual(true)

  })

})
