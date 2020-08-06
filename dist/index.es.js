import { ethers } from 'ethers';
import base64url from 'base64url';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var TypedDataUtils = {
    encodeDigest: function (typedData) {
        var eip191Header = ethers.utils.arrayify('0x1901');
        var domainHash = TypedDataUtils.hashStruct(typedData, 'EIP712Domain', typedData.domain);
        var messageHash = TypedDataUtils.hashStruct(typedData, typedData.primaryType, typedData.message);
        var pack = ethers.utils.solidityPack(['bytes', 'bytes32', 'bytes32'], [eip191Header, ethers.utils.zeroPad(domainHash, 32), ethers.utils.zeroPad(messageHash, 32)]);
        var hashPack = ethers.utils.keccak256(pack);
        return ethers.utils.arrayify(hashPack);
    },
    encodeData: function (typedData, primaryType, data) {
        var args = typedData.types[primaryType];
        if (!args || args.length === 0) {
            throw new Error("TypedDataUtils: " + typedData.primaryType + " type is not unknown");
        }
        var abiCoder = new ethers.utils.AbiCoder();
        var abiTypes = [];
        var abiValues = [];
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            var dataValue = data[arg.name];
            if (!dataValue || dataValue === null || dataValue === undefined || dataValue === '') {
                throw new Error("data value missing for type " + primaryType + " with argument name " + arg.name);
            }
            if (arg.type === 'bytes' || arg.type === 'string') {
                abiTypes.push('bytes32');
                var v = void 0;
                if (arg.type === 'string') {
                    v = ethers.utils.toUtf8Bytes(dataValue);
                }
                else {
                    v = ethers.utils.arrayify(dataValue);
                }
                abiValues.push(ethers.utils.arrayify(ethers.utils.hexZeroPad(ethers.utils.keccak256(v), 32)));
            }
            else {
                abiTypes.push(arg.type);
                abiValues.push(dataValue);
            }
        }
        if (args.length !== abiTypes.length || abiTypes.length !== abiValues.length) {
            throw new Error('argument coding failed to encode all values');
        }
        return ethers.utils.arrayify(abiCoder.encode(abiTypes, abiValues));
    },
    hashStruct: function (typedData, primaryType, data) {
        var typeHash = TypedDataUtils.typeHash(typedData.types, primaryType);
        var encodedData = TypedDataUtils.encodeData(typedData, primaryType, data);
        var pack = ethers.utils.solidityPack(['bytes32', 'bytes'], [ethers.utils.zeroPad(typeHash, 32), encodedData]);
        var hashPack = ethers.utils.keccak256(pack);
        return ethers.utils.arrayify(hashPack);
    },
    typeHash: function (typedDataTypes, primaryType) {
        return ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(TypedDataUtils.encodeType(typedDataTypes, primaryType))));
    },
    encodeType: function (typedDataTypes, primaryType) {
        var args = typedDataTypes[primaryType];
        if (!args || args.length === 0) {
            throw new Error("TypedDataUtils: " + primaryType + " type is not defined");
        }
        var subTypes = [];
        var s = primaryType + '(';
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (typedDataTypes[arg.type] && typedDataTypes[arg.type].length > 0) {
                var set = false;
                for (var x = 0; x < subTypes.length; x++) {
                    if (subTypes[x] === arg.type) {
                        set = true;
                    }
                }
                if (!set) {
                    subTypes.push(arg.type);
                }
            }
            s += arg.type + ' ' + arg.name;
            if (i < args.length - 1) {
                s += ',';
            }
        }
        s += ')';
        subTypes.sort();
        for (var i = 0; i < subTypes.length; i++) {
            var subEncodeType = TypedDataUtils.encodeType(typedDataTypes, subTypes[i]);
            s += subEncodeType;
        }
        return s;
    }
};
var encodeTypedDataDigest = function (typedData) {
    return TypedDataUtils.encodeDigest(typedData);
};

var Token = /** @class */ (function () {
    function Token(args) {
        this.prefix = EWTPrefix;
        this.address = (args === null || args === void 0 ? void 0 : args.address) ? args.address.toLowerCase() : '';
        this.claims = (args === null || args === void 0 ? void 0 : args.claims) ? args.claims : { app: '', iat: 0, exp: 0, v: EWTVersion };
        this.signature = (args === null || args === void 0 ? void 0 : args.signature) ? args.signature : '';
    }
    Token.prototype.setIssuedAtNow = function () {
        this.claims.iat = Math.round((new Date()).getTime() / 1000);
    };
    Token.prototype.setExpiryIn = function (seconds) {
        this.claims.exp = Math.round((new Date()).getTime() / 1000) + seconds;
    };
    Token.prototype.validateClaims = function () {
        return validateClaims(this.claims);
    };
    Token.prototype.messageDigest = function () {
        var isValid = this.validateClaims();
        if (isValid.err) {
            throw isValid.err;
        }
        return encodeTypedDataDigest(this.messageTypedData());
    };
    Token.prototype.messageTypedData = function () {
        var typedData = {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                ],
                Claims: []
            },
            primaryType: 'Claims',
            domain: EWTEIP712Domain,
            message: {}
        };
        if (this.claims.app && this.claims.app.length > 0) {
            typedData.types.Claims.push({ name: 'app', type: 'string' });
            typedData.message.app = this.claims.app;
        }
        if (this.claims.iat && this.claims.iat > 0) {
            typedData.types.Claims.push({ name: 'iat', type: 'int64' });
            typedData.message.iat = this.claims.iat;
        }
        if (this.claims.exp && this.claims.exp > 0) {
            typedData.types.Claims.push({ name: 'exp', type: 'int64' });
            typedData.message.exp = this.claims.exp;
        }
        if (this.claims.n && this.claims.n > 0) {
            typedData.types.Claims.push({ name: 'n', type: 'uint64' });
            typedData.message.n = this.claims.n;
        }
        if (this.claims.typ && this.claims.typ.length > 0) {
            typedData.types.Claims.push({ name: 'typ', type: 'string' });
            typedData.message.typ = this.claims.typ;
        }
        if (this.claims.ogn && this.claims.ogn.length > 0) {
            typedData.types.Claims.push({ name: 'ogn', type: 'string' });
            typedData.message.ogn = this.claims.ogn;
        }
        if (this.claims.v && this.claims.v.length > 0) {
            typedData.types.Claims.push({ name: 'v', type: 'string' });
            typedData.message.v = this.claims.v;
        }
        return typedData;
    };
    return Token;
}());
var validateClaims = function (claims) {
    if (claims.app === '') {
        return { ok: false, err: new Error('claims: app is empty') };
    }
    var now = Math.round((new Date()).getTime() / 1000);
    var drift = 5 * 60; // 5 minutes
    var max = 60 * 60 * 24 * 365; // 1 year
    if (claims.v === '') {
        return { ok: false, err: new Error('claims: ewt version is empty') };
    }
    if (claims.iat > now + drift || claims.iat < now - max) {
        return { ok: false, err: new Error('claims: iat is invalid') };
    }
    if (claims.exp < now - drift || claims.exp > now + max) {
        return { ok: false, err: new Error('claims: token has expired') };
    }
    return { ok: true };
};

// ValidateEOAToken verifies the account proof of the provided ewt, testing if the
// token has been signed with an EOA (externally owned account) and will return
// success/failture, the account address as a string, and any errors.
var ValidateEOAToken = function (provider, chainId, token) { return __awaiter(void 0, void 0, void 0, function () {
    var messageDigest, address;
    return __generator(this, function (_a) {
        messageDigest = token.messageDigest();
        address = ethers.utils.verifyMessage(messageDigest, token.signature);
        if (address.slice(0, 2) === '0x' && address.length === 42 &&
            address.toLowerCase() === token.address.toLowerCase()) {
            return [2 /*return*/, { isValid: true }];
        }
        else {
            return [2 /*return*/, { isValid: false }];
        }
    });
}); };
// ValidateContractAccountToken verifies the account proof of the provided ewt, testing if the
// token has been signed with a smart-contract based account by calling the EIP-1271
// method of the remote contract. This method will return success/failure, the
// account address as a string, and any errors. The wallet contract must be deployed in
// order for this call to be successful. In order test an undeployed smart-wallet, you
// will have to implement your own custom validator method.
var ValidateContractAccountToken = function (provider, chainId, token) { return __awaiter(void 0, void 0, void 0, function () {
    var messageDigest, walletCode, abi, contract, isValidSignature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!provider || provider === undefined) {
                    return [2 /*return*/, { isValid: false }];
                }
                messageDigest = token.messageDigest();
                return [4 /*yield*/, provider.getCode(token.address)];
            case 1:
                walletCode = _a.sent();
                if (walletCode === '0x' || walletCode.length <= 2) {
                    throw new Error('ValidateContractAccountToken failed. unable to fetch wallet contract code');
                }
                abi = ['function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4 magicValue)'];
                contract = new ethers.Contract(token.address, abi, provider);
                return [4 /*yield*/, contract.isValidSignature(messageDigest, ethers.utils.arrayify(token.signature))];
            case 2:
                isValidSignature = _a.sent();
                if (isValidSignature === IsValidSignatureBytes32) {
                    return [2 /*return*/, { isValid: true }];
                }
                else {
                    return [2 /*return*/, { isValid: false }];
                }
        }
    });
}); };
// IsValidSignatureBytes32 is the EIP-1271 magic value we test
var IsValidSignatureBytes32 = '0x1626ba7e';

var EWTVersion = '1';
var EWTPrefix = 'eth';
var EWTEIP712Domain = {
    name: 'ETHWebToken',
    version: EWTVersion,
};
var ETHWebToken = /** @class */ (function () {
    function ETHWebToken() {
        var _this = this;
        var validators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            validators[_i] = arguments[_i];
        }
        this.configJsonRpcProvider = function (ethereumJsonRpcURL) { return __awaiter(_this, void 0, void 0, function () {
            var network;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.provider = new ethers.providers.JsonRpcProvider(ethereumJsonRpcURL);
                        return [4 /*yield*/, this.provider.detectNetwork()];
                    case 1:
                        network = _a.sent();
                        this.chainId = network.chainId;
                        this.ethereumJsonRpcURL = ethereumJsonRpcURL;
                        return [2 /*return*/];
                }
            });
        }); };
        this.configValidators = function () {
            var validators = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                validators[_i] = arguments[_i];
            }
            if (validators.length == 0) {
                throw new Error('validators list is empty');
            }
            _this.validators = validators;
        };
        this.encodeToken = function (token) {
            if (token.address.length !== 42 || token.address.slice(0, 2) !== '0x') {
                throw new Error('ethwebtoken: invalid address');
            }
            if (token.signature === '' || token.signature.slice(0, 2) !== '0x') {
                throw new Error('ethwebtoken: invalid signature');
            }
            var isValid = _this.validateToken(token);
            if (!isValid) {
                throw new Error("ethwebtoken: token is invalid");
            }
            var claimsJSON = JSON.stringify(token.claims);
            var tokenString = EWTPrefix + '.' +
                token.address.toLowerCase() + '.' +
                base64url.encode(claimsJSON) + '.' +
                token.signature;
            return tokenString;
        };
        this.decodeToken = function (tokenString) {
            var parts = tokenString.split('.');
            if (parts.length !== 4) {
                throw new Error('ethwebtoken: invalid token string');
            }
            var prefix = parts[0], address = parts[1], messageBase64 = parts[2], signature = parts[3];
            // check prefix
            if (prefix !== EWTPrefix) {
                throw new Error('ethwebtoken: not an ewt token');
            }
            // decode message base64
            var message = base64url.decode(messageBase64);
            var claims = JSON.parse(message);
            // prepare token
            var token = new Token({ address: address, claims: claims, signature: signature });
            // Validate token signature and claims
            var isValid = _this.validateToken(token);
            if (!isValid) {
                throw new Error("ethwebtoken: token is invalid");
            }
            return token;
        };
        this.validateToken = function (token) { return __awaiter(_this, void 0, void 0, function () {
            var isValidClaims, isValidSig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isValidClaims = this.validateTokenClaims(token);
                        if (isValidClaims.err) {
                            throw new Error("ethwebtoken: token claims are invalid " + isValidClaims.err);
                        }
                        return [4 /*yield*/, this.validateTokenSignature(token)];
                    case 1:
                        isValidSig = _a.sent();
                        if (isValidSig !== true) {
                            throw new Error('ethwebtoken: token signature is invalid');
                        }
                        return [2 /*return*/, true];
                }
            });
        }); };
        this.validateTokenSignature = function (token) { return __awaiter(_this, void 0, void 0, function () {
            var retIsValid, i, validator, isValid, err_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        retIsValid = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.validators.length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        validator = this.validators[i];
                        return [4 /*yield*/, validator(this.provider, this.chainId, token)];
                    case 3:
                        isValid = (_a.sent()).isValid;
                        retIsValid.push(isValid);
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        retIsValid.push(false);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        for (i = 0; i < retIsValid.length; i++) {
                            if (retIsValid[i]) {
                                return [2 /*return*/, true];
                            }
                        }
                        return [2 /*return*/, false];
                }
            });
        }); };
        this.validateTokenClaims = function (token) {
            return token.validateClaims();
        };
        if (validators.length == 0) {
            this.validators = [ValidateEOAToken, ValidateContractAccountToken];
        }
        else {
            this.validators = validators;
        }
    }
    return ETHWebToken;
}());

export { ETHWebToken, EWTEIP712Domain, EWTPrefix, EWTVersion, Token, TypedDataUtils, ValidateContractAccountToken, ValidateEOAToken, encodeTypedDataDigest, validateClaims };
