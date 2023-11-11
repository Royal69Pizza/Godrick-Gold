/**
 * @file keygenerator.js
 * 
 * @brief Générateur d'une paire de clés par la courbe elliptique
 * 
 * @author Royal69Pizza
 */

/**
 * Courbes elliptiques
 */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log('Private Key : ', privateKey);
console.log('Public Key : ', publicKey);