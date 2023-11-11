/**
 * @file blockchain.js
 * 
 * @brief Blockchain basée sur SHA256 avec le proof of work
 * 
 * @author Royal69Pizza
 */

const SHA256 = require('crypto-js/sha256');

/**
 * Courbes elliptiques
 */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

/**
 * Classe Transaction
 */
class Transaction {

    /**
     * @param {string} fromAddress
     * @param {string} toAddress
     * @param {number} amount
     */
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    /**
     * Crée un hash en SHA256 de la transaction
     *
     * @returns {string}
     */
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount+ this.timestamp).toString();
    }

    /**
     * Signe une transaction avec une paire de clés asymétriques grâce à l'algorithme de la courbe elliptique
     *
     * @param {string} signingKey
     */
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error("[ ! ] Impossible de signer des transactions pour d'autres wallets !");
        }
        
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    /**
     * Vérifie si la signature est valide
     *
     * @returns {boolean}
     */
    isValid() {
        
        if (this.fromAddress === null) {
            return true;
        }

        if (!this.signature || this.signature.length === 0) {
            throw new Error("[ ! ] Il n'y a pas de signature sur cette transaction !");
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

/**
 * Classe Block
 */
class Block {

    /**
     * @param {number} timestamp
     * @param {Transaction[]} transactions
     * @param {string} previousHash
     */
    constructor(timestamp, transactions, previoushash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previoushash = previoushash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    /**
     * Donne le hash SHA256 du block
     *
     * @returns {string}
     */
    calculateHash() {
        return SHA256(this.index + this.previoushash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    /**
     * Starts the mining process on the block. It changes the 'nonce' until the hash
     * of the block starts with enough zeros (= difficulty)
     *
     * @param {number} difficulty
     */
    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('[ i ] Block miné : ' + this.hash);
    }

    /**
     * Vérifie le hash du block et la signature 
     *
     * @returns {boolean}
     */
    hasValidTransactions() {
        for (const aTransaction of this.transactions) {
            if (!aTransaction.isValid()) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Class Blockchain
 */
class Blockchain {

    /**
     * @param {Block[]} chain
     * @param {number} difficulty
     * @param {Transaction[]} pendingTransactions
     * @param {number} miningReward
     */
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    /**
     * @returns {Block}
     */
    createGenesisBlock() {
        return new Block(Date.parse('2023-11-11'), "Block 0", "0");
    }

    /**
     * Retourne le block précédent
     *
     * @returns {Block[]}
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Ajoute manuellement un block
     *
    addBlock(newBlock) {
        newBlock.previoushash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    */

    /**
     * Mine le block de transactions et ajoute une transaction au vainqueur
     *
     * @param {string} miningRewardAddress
     */
    minePendingTransactions(miningRewardAddress) {

        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('[ i ] Le block à été miné ! ');

        this.chain.push(block);
        this.pendingTransactions = [];
    }

    /**
     * Ajoute une transaction
     *
     * @param {Transaction} transaction
     */
    addTransaction(transaction) {

        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error("[ ! ] Il faut une adresse de wallet d'envoi et de dépot !");
        }

        if (!transaction.isValid()) {
            throw new Error("[ ! ] Impossible d'ajouter une transaction invalide à la chaine !");
        }

        if (transaction.amount <= 0) {
            throw new Error("[ ! ] Une transaction doit être supérieure à 0 !");
        }

        const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
        if (walletBalance < transaction.amount) {
            throw new Error("[ ! ] Solde inférieur à la transaction !");
        }

        const pendingTxForWallet = this.pendingTransactions.filter(
            tx => tx.fromAddress === transaction.fromAddress
        );

        if (pendingTxForWallet.length > 0) {
            const totalPendingAmount = pendingTxForWallet
            .map(tx => tx.amount)
            .reduce((prev, curr) => prev + curr);
    
            const totalAmount = totalPendingAmount + transaction.amount;
            if (totalAmount > walletBalance) {
                throw new Error('[ ! ] Les transactions pour ce wallet sont supérieures à son solde !');
            }
        }

        this.pendingTransactions.push(transaction);
    }

    /**
     * Retourne le montant du wallet
     *
     * @param {string} address
     * @returns {number}
     */
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const aTransaction of block.transactions) {

                if (aTransaction.fromAddress === address) {
                    balance -= aTransaction.amount;
                }

                if (aTransaction.toAddress === address) {
                    balance += aTransaction.amount;
                }
            }
        }

        return balance;
    }

     /**
     * Retourne les transactions d'un wallet
     *
     * @param  {string} address
     * @return {Transaction[]}
     */
    getAllTransactionsForWallet(address) {
        const txs = [];

        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.fromAddress === address || tx.toAddress === address) {
                txs.push(tx);
                }
            }
        }

        return txs;
    }

    /**
     * Vérifie la liaison de tous les blocs et que les transactions sont signées
     *
     * @returns {boolean}
     */
    isChainValid() {

        const realGenesis = JSON.stringify(this.createGenesisBlock());

        if (realGenesis !== JSON.stringify(this.chain[0])) {
            return false;
        }

        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previoushash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;