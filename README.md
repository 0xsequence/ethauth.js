# ethwebtoken.js

> Ethereum Web Token

**NOTE: in specification stage**

## Spec

### Format

`ewt = eth.<address>.<payload>.<proof>`


### address

the ethereum public address in plain-text: `"0xabc..."`


### payload

a base64 encoded JSON hash containing information such as:
  * EIP712Domain (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md)
  * Message, ie. "Login to SkyWeaver.net"
  * IssuedAt timestamp
  * ExpiresAt timestamp (optional)


### proof

`proof = eth_signTypedData(payload)`


### Authorization

http request header:

`Authorization: Bearer <ewt>`

## Getting started

```js
import { EthWebToken } from 'ethwebtoken'

const address = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
const payload = "Please sign this message!"
const proof = "0x0a390122d3c539f45f76b918a8211d3bf928443589871ad4ecbd7c5e1ea39f3b7dae1238ed784b03da2f0dc3e3def70d45796c5dba0bd580e407207f129bfbd71c"

const ewt = EthWebToken.encodeToken(address, payload, proof)
const token = ewt.encode()

const ewt2 = EthWebToken.decodeToken(token)
console.log(ewt2.getAddress()) === address) // true
```

## Test

Run tests:

```bash
npm test
```

## Development

Install dependencies:

```bash
npm install
```

Run compile watcher:

```bash
npm run dev
```

Build library:

```bash
npm run build
```

## LICENSE

[MIT](LICENSE)