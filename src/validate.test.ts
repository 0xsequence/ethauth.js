import { validateEthSignature } from './validate'
import * as utils from './utils'

test('validateEthSignature', async () => {
  expect(() => validateEthSignature('0xabc', 'some message', 'some signature')).toThrow('ethwebtoken: address is not a valid Ethereum address')
  expect(() => validateEthSignature('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', '', 'some signature')).toThrow('ethwebtoken: message and signature must not be empty')
  expect(() => validateEthSignature('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', 'some message', '')).toThrow('ethwebtoken: message and signature must not be empty')

  expect(() => validateEthSignature('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', 'a'.repeat(200), 'some signature')).toThrow('ethwebtoken: message and signature exceed size limit')
  expect(() => validateEthSignature('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', 'some message', 'a'.repeat(200))).toThrow('ethwebtoken: message and signature exceed size limit')

  const wallet = new utils.Wallet('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d')
  const hash = utils.keccak256('some message')
  const signature = await wallet.signMessage(hash)
  expect(validateEthSignature('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', hash, signature)).toEqual(true)
  expect(() => validateEthSignature('0xffcf8fdee72ac11b5c542428b35eef5769c409f0', hash, signature)).toThrow('ethwebtoken: invalid signature')
})
