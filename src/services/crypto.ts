/* tslint:disable */
/**
 * Created by kevin on 15-7-19.
 * from https://github.com/stkevintan/Cube/blob/master/src/model/Crypto.js
 */
const bigInt = require('big-integer')
import crypto from 'crypto'
import qs from 'querystring'

function addPadding (s: string, size: number) {
    while (s.length < size) s = "0" + s;
    return s;
}

function aesEncrypt(text: string, secKey: string): string {
    var cipher = crypto.createCipheriv('AES-128-CBC', secKey, '0102030405060708');
    return cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
}

/**
 * RSA Encryption algorithm.
 * @param text {string} - raw data to encrypt
 * @param exponent {string} - public exponent
 * @param modulus {string} - modulus
 * @returns {string} - encrypted data: reverseText^pubKey%modulus
 */
function rsaEncrypt(text: string, exponent: string, modulus: string) {
    var rText = '', radix = 16;
    for (var i = text.length - 1; i >= 0; i--) rText += text[i];//reverse text
    var biText = bigInt(new Buffer(rText).toString('hex'), radix),
        biEx = bigInt(exponent, radix),
        biMod = bigInt(modulus, radix),
        biRet = biText.modPow(biEx, biMod);
    return addPadding(biRet.toString(radix), 256);
}

function createSecretKey(size: number) {
    var keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var key = "";
    for (var i = 0; i < size; i++) {
        var pos = Math.random() * keys.length;
        pos = Math.floor(pos);
        key = key + keys.charAt(pos)
    }
    return key;
}
const modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
const nonce = '0CoJUm6Qyw8W8jud';
const pubKey = '010001';

export function encryptedMD5 (text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
}
export function encryptedRequest (text: Object) {
    const secKey = createSecretKey(16);
    const encBody = {
        params: aesEncrypt(aesEncrypt(JSON.stringify(text), nonce), secKey),
        encSecKey: rsaEncrypt(secKey, pubKey, modulus)
    }
    return qs.stringify(encBody) 
}
