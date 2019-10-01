import * as utils from './utils'

test('isAddress', async () => {
  expect(utils.isAddress('0xabc')).toEqual(false)
  expect(utils.isAddress('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1')).toEqual(true)
})
