"use strict";
// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
Object.defineProperty(exports, "__esModule", { value: true });
var hmac_1 = require("@stablelib/hmac");
var binary_1 = require("@stablelib/binary");
var wipe_1 = require("@stablelib/wipe");
function deriveKey(hash, password, salt, iterations, length) {
    var prf = new hmac_1.HMAC(hash, password);
    var dlen = prf.digestLength;
    var ctr = new Uint8Array(4);
    var t = new Uint8Array(dlen);
    var u = new Uint8Array(dlen);
    var dk = new Uint8Array(length);
    var saltedState = prf.update(salt).saveState();
    for (var i = 0; i * dlen < length; i++) {
        binary_1.writeUint32BE(i + 1, ctr);
        prf.restoreState(saltedState).update(ctr).finish(u);
        for (var j = 0; j < dlen; j++) {
            t[j] = u[j];
        }
        for (var j = 2; j <= iterations; j++) {
            prf.reset().update(u).finish(u);
            for (var k = 0; k < dlen; k++) {
                t[k] ^= u[k];
            }
        }
        for (var j = 0; j < dlen && i * dlen + j < length; j++) {
            dk[i * dlen + j] = t[j];
        }
    }
    wipe_1.wipe(t);
    wipe_1.wipe(u);
    wipe_1.wipe(ctr);
    prf.cleanSavedState(saltedState);
    prf.clean();
    return dk;
}
exports.deriveKey = deriveKey;
//# sourceMappingURL=pbkdf2.js.map