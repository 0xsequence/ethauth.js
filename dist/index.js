'use strict';

var ethers = require('ethers');
var jsBase64 = require('js-base64');

/******************************************************************************
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

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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

var encodeTypedDataHash = function (typedData) {
    return ethers.ethers.utils._TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message);
};
var encodeTypedDataDigest = function (typedData) {
    var hash = encodeTypedDataHash(typedData);
    var digest = ethers.ethers.utils.arrayify(ethers.ethers.utils.keccak256(hash));
    return digest;
};

var Proof = /** @class */ (function () {
    function Proof(args) {
        this.prefix = ETHAuthPrefix;
        this.address = (args === null || args === void 0 ? void 0 : args.address) ? args.address.toLowerCase() : '';
        this.claims = (args === null || args === void 0 ? void 0 : args.claims) ? args.claims : { app: '', iat: 0, exp: 0, v: ETHAuthVersion };
        this.signature = (args === null || args === void 0 ? void 0 : args.signature) ? args.signature : '';
        this.extra = (args === null || args === void 0 ? void 0 : args.extra) ? args.extra : '';
    }
    Proof.prototype.setIssuedAtNow = function () {
        this.claims.iat = Math.round((new Date()).getTime() / 1000);
    };
    Proof.prototype.setExpiryIn = function (seconds) {
        this.claims.exp = Math.round((new Date()).getTime() / 1000) + seconds;
    };
    Proof.prototype.validateClaims = function () {
        return validateClaims(this.claims);
    };
    Proof.prototype.messageDigest = function () {
        var isValid = this.validateClaims();
        if (isValid.err) {
            throw isValid.err;
        }
        return ethers.ethers.utils.arrayify(encodeTypedDataHash(this.messageTypedData()));
    };
    Proof.prototype.messageTypedData = function () {
        var domain = __assign({}, ETHAuthEIP712Domain);
        var types = {
            'Claims': []
        };
        var message = {};
        var typedData = { domain: domain, types: types, message: message };
        if (this.claims.app && this.claims.app.length > 0) {
            typedData.types.Claims.push({ name: 'app', type: 'string' });
            typedData.message['app'] = this.claims.app;
        }
        if (this.claims.iat && this.claims.iat > 0) {
            typedData.types.Claims.push({ name: 'iat', type: 'int64' });
            typedData.message['iat'] = this.claims.iat;
        }
        if (this.claims.exp && this.claims.exp > 0) {
            typedData.types.Claims.push({ name: 'exp', type: 'int64' });
            typedData.message['exp'] = this.claims.exp;
        }
        if (this.claims.n && this.claims.n > 0) {
            typedData.types.Claims.push({ name: 'n', type: 'uint64' });
            typedData.message['n'] = this.claims.n;
        }
        if (this.claims.typ && this.claims.typ.length > 0) {
            typedData.types.Claims.push({ name: 'typ', type: 'string' });
            typedData.message['typ'] = this.claims.typ;
        }
        if (this.claims.ogn && this.claims.ogn.length > 0) {
            typedData.types.Claims.push({ name: 'ogn', type: 'string' });
            typedData.message['ogn'] = this.claims.ogn;
        }
        if (this.claims.v && this.claims.v.length > 0) {
            typedData.types.Claims.push({ name: 'v', type: 'string' });
            typedData.message['v'] = this.claims.v;
        }
        return typedData;
    };
    return Proof;
}());
var validateClaims = function (claims) {
    if (claims.app === '') {
        return { ok: false, err: new Error('claims: app is empty') };
    }
    var now = Math.round((new Date()).getTime() / 1000);
    var drift = 5 * 60; // 5 minutes
    var max = (60 * 60 * 24 * 365) + drift; // 1 year
    if (claims.v === '') {
        return { ok: false, err: new Error('claims: ethauth version is empty') };
    }
    if (claims.iat && claims.iat !== 0 && (claims.iat > now + drift || claims.iat < now - max)) {
        return { ok: false, err: new Error('claims: iat is invalid') };
    }
    if (claims.exp < now - drift || claims.exp > now + max) {
        return { ok: false, err: new Error('claims: token has expired') };
    }
    return { ok: true };
};

// ValidateEOAProof verifies the account proof, testing if the proof claims have been signed with an
// EOA (externally owned account) and will return success/failture, the account address as a string, and any errors.
var ValidateEOAProof = function (provider, chainId, proof) { return __awaiter(void 0, void 0, void 0, function () {
    var messageDigest, address;
    return __generator(this, function (_a) {
        messageDigest = proof.messageDigest();
        address = ethers.ethers.utils.verifyMessage(messageDigest, proof.signature);
        if (address.slice(0, 2) === '0x' && address.length === 42 &&
            address.toLowerCase() === proof.address.toLowerCase()) {
            return [2 /*return*/, { isValid: true, address: proof.address }];
        }
        else {
            return [2 /*return*/, { isValid: false }];
        }
    });
}); };
// ValidateContractAccountProof verifies the account proof, testing if the
// proof claims have been signed with a smart-contract based account by calling the EIP-1271
// method of the remote contract. This method will return success/failure, the
// account address as a string, and any errors. The wallet contract must be deployed in
// order for this call to be successful. In order test an undeployed smart-wallet, you
// will have to implement your own custom validator method.
var ValidateContractAccountProof = function (provider, chainId, proof) { return __awaiter(void 0, void 0, void 0, function () {
    var messageDigest, walletCode, abi, contract, isValidSignature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!provider || provider === undefined) {
                    return [2 /*return*/, { isValid: false }];
                }
                messageDigest = proof.messageDigest();
                return [4 /*yield*/, provider.getCode(proof.address)];
            case 1:
                walletCode = _a.sent();
                if (walletCode === '0x' || walletCode.length <= 2) {
                    throw new Error('ValidateContractAccountProof failed. unable to fetch wallet contract code');
                }
                abi = ['function isValidSignature(bytes32, bytes) public view returns (bytes4)'];
                contract = new ethers.ethers.Contract(proof.address, abi, provider);
                return [4 /*yield*/, contract.isValidSignature(messageDigest, ethers.ethers.utils.arrayify(proof.signature))];
            case 2:
                isValidSignature = _a.sent();
                if (isValidSignature === IsValidSignatureBytes32MagicValue) {
                    return [2 /*return*/, { isValid: true, address: proof.address }];
                }
                else {
                    return [2 /*return*/, { isValid: false }];
                }
        }
    });
}); };
// IsValidSignatureBytes32 is the EIP-1271 magic value we test
var IsValidSignatureBytes32MagicValue = '0x1626ba7e';

var ETHAuthVersion = '1';
var ETHAuthPrefix = 'eth';
var ETHAuthEIP712Domain = {
    name: 'ETHAuth',
    version: ETHAuthVersion,
};
var ETHAuth = /** @class */ (function () {
    function ETHAuth() {
        var validators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            validators[_i] = arguments[_i];
        }
        var _this = this;
        this.configJsonRpcProvider = function (ethereumJsonRpcURL) { return __awaiter(_this, void 0, void 0, function () {
            var netVersion;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.provider = new ethers.ethers.providers.JsonRpcProvider(ethereumJsonRpcURL);
                        return [4 /*yield*/, this.provider.send('net_version', [])];
                    case 1:
                        netVersion = _a.sent();
                        this.chainId = parseInt(netVersion);
                        if (!this.chainId || this.chainId === 0 || this.chainId === NaN) {
                            throw new Error('ethauth: unable to get chainId');
                        }
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
        this.encodeProof = function (proof, skipSignatureValidation) {
            if (skipSignatureValidation === void 0) { skipSignatureValidation = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var isValid, claimsJSON, proofString;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (proof.address.length !== 42 || proof.address.slice(0, 2) !== '0x') {
                                throw new Error('ethauth: invalid address');
                            }
                            if (proof.signature === '' || proof.signature.slice(0, 2) !== '0x') {
                                throw new Error('ethauth: invalid signature');
                            }
                            if (proof.extra && proof.extra.slice(0, 2) !== '0x') {
                                throw new Error('ethauth: invalid extra encoding, expecting hex data');
                            }
                            return [4 /*yield*/, this.validateProof(proof, skipSignatureValidation)];
                        case 1:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new Error("ethauth: proof is invalid");
                            }
                            claimsJSON = JSON.stringify(proof.claims);
                            proofString = ETHAuthPrefix + '.' +
                                proof.address.toLowerCase() + '.' +
                                jsBase64.Base64.encode(claimsJSON, true) + '.' +
                                proof.signature;
                            if (proof.extra && proof.extra.length > 0) {
                                proofString += '.' + proof.extra;
                            }
                            return [2 /*return*/, proofString];
                    }
                });
            });
        };
        this.decodeProof = function (proofString, skipSignatureValidation) {
            if (skipSignatureValidation === void 0) { skipSignatureValidation = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var parts, prefix, address, messageBase64, signature, extra, message, claims, proof, isValid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            parts = proofString.split('.');
                            if (parts.length < 4 || parts.length > 5) {
                                throw new Error('ethauth: invalid proof string');
                            }
                            prefix = parts[0], address = parts[1], messageBase64 = parts[2], signature = parts[3], extra = parts[4];
                            // check prefix
                            if (prefix !== ETHAuthPrefix) {
                                throw new Error('ethauth: not an ethauth proof');
                            }
                            message = jsBase64.Base64.decode(messageBase64);
                            claims = JSON.parse(message);
                            proof = new Proof({ address: address, claims: claims, signature: signature, extra: extra });
                            return [4 /*yield*/, this.validateProof(proof, skipSignatureValidation)];
                        case 1:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new Error("ethauth: proof is invalid");
                            }
                            return [2 /*return*/, proof];
                    }
                });
            });
        };
        this.validateProof = function (proof, skipSignatureValidation) {
            if (skipSignatureValidation === void 0) { skipSignatureValidation = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var isValidClaims, isValidSig;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isValidClaims = this.validateProofClaims(proof);
                            if (isValidClaims.err) {
                                throw new Error("ethauth: proof claims are invalid ".concat(isValidClaims.err));
                            }
                            if (!(skipSignatureValidation !== true)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.validateProofSignature(proof)];
                        case 1:
                            isValidSig = _a.sent();
                            if (isValidSig !== true) {
                                throw new Error('ethauth: proof signature is invalid');
                            }
                            _a.label = 2;
                        case 2: return [2 /*return*/, true];
                    }
                });
            });
        };
        this.validateProofSignature = function (proof) { return __awaiter(_this, void 0, void 0, function () {
            var retIsValid, i, validator, isValid, i;
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
                        return [4 /*yield*/, validator(this.provider, this.chainId, proof)];
                    case 3:
                        isValid = (_a.sent()).isValid;
                        if (isValid === true) {
                            // preemptively return true if we've determined it to be valid
                            return [2 /*return*/, true];
                        }
                        retIsValid.push(isValid);
                        return [3 /*break*/, 5];
                    case 4:
                        _a.sent();
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
        this.validateProofClaims = function (proof) {
            return proof.validateClaims();
        };
        if (validators.length == 0) {
            this.validators = [ValidateEOAProof, ValidateContractAccountProof];
        }
        else {
            this.validators = validators;
        }
    }
    return ETHAuth;
}());

exports.ETHAuth = ETHAuth;
exports.ETHAuthEIP712Domain = ETHAuthEIP712Domain;
exports.ETHAuthPrefix = ETHAuthPrefix;
exports.ETHAuthVersion = ETHAuthVersion;
exports.IsValidSignatureBytes32MagicValue = IsValidSignatureBytes32MagicValue;
exports.Proof = Proof;
exports.ValidateContractAccountProof = ValidateContractAccountProof;
exports.ValidateEOAProof = ValidateEOAProof;
exports.encodeTypedDataDigest = encodeTypedDataDigest;
exports.encodeTypedDataHash = encodeTypedDataHash;
exports.validateClaims = validateClaims;
