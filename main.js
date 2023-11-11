/**
 * @file main.js
 * 
 * @brief Tests de la blockchain avec la cryptomonnaie Godrick Gold [ GGC ]
 * 
 * @author Royal69Pizza
 */

const { Blockchain, Transaction } = require("./blockchain");

/**
 * Courbes elliptiques
 */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('e2b2002101d1033d21991925128b85b7b41450029b7678e0743e0f523870a0f9');
const myWalletAddress = myKey.getPublic('hex');

/**
 *  Create the Godrick Gold blockchain
 */
let GodrickGold = new Blockchain();

console.log('[ i ] Bienvenue sur la blockchain de Godrick Gold !\n');

GodrickGold.createGenesisBlock();

console.log('[ i ] Minage du block ...');
GodrickGold.minePendingTransactions(myWalletAddress);
console.log('[ i ] Solde du wallet de Royal69Pizza -> ', GodrickGold.getBalanceOfAddress(myWalletAddress));

console.log('[ i ] La chaine est valide ? -> ', GodrickGold.isChainValid());

const transaction1 = new Transaction(myWalletAddress, 'public key from x', 10);
transaction1.signTransaction(myKey);
GodrickGold.addTransaction(transaction1);

console.log('[ i ] Minage du block ...');
GodrickGold.minePendingTransactions(myWalletAddress);

console.log('[ i ] La chaine est valide ? -> ', GodrickGold.isChainValid());

console.log('[ i ] Minage du block ...');
GodrickGold.minePendingTransactions(myWalletAddress);

console.log('[ i ] La chaine est valide ? -> ', GodrickGold.isChainValid());

console.log('[ i ] Minage du block ...');
GodrickGold.minePendingTransactions(myWalletAddress);

console.log('[ i ] La chaine est valide ? -> ', GodrickGold.isChainValid());

const transaction2 = new Transaction(myWalletAddress, 'public key from x', 25);
transaction2.signTransaction(myKey);
GodrickGold.addTransaction(transaction2);

console.log('[ i ] Minage du block ...');
GodrickGold.minePendingTransactions(myWalletAddress);
console.log('[ i ] Solde du wallet de Royal69Pizza -> ', GodrickGold.getBalanceOfAddress(myWalletAddress));

console.log('[ i ] La chaine est valide ? -> ', GodrickGold.isChainValid());