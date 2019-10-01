import { EthWebToken } from './ethwebtoken'

test('encode and decode', async () => {
  const address = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
  const payload = 'Please sign this message!'
  const proof = '0x0a390122d3c539f45f76b918a8211d3bf928443589871ad4ecbd7c5e1ea39f3b7dae1238ed784b03da2f0dc3e3def70d45796c5dba0bd580e407207f129bfbd71c'

  const ewt = EthWebToken.encodeToken(address, payload, proof)
  const token = ewt.encode()

  const ewt2 = EthWebToken.decodeToken(token)
  expect(ewt2.getAddress()).toEqual(address)
})
