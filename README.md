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
import ethwebtoken from 'ethwebtoken'

// TODO!
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