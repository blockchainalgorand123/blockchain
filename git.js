const algosdk = require('algosdk');
const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
const port = '';

const token = {
   'X-API-Key': '5QofGfLJKu1VEnwtNIcz97q4AO4zNSCf7otVJKV8'
}

const algodClient = new algosdk.Algodv2(token, baseServer, port);

const mnemonic = 'fame fat notable swallow fossil scatter affair debate parade design satisfy screen stuff include adjust bless jeans begin state quick adapt side aisle able speed';
const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic); 
console.log(recoveredAccount);
// Function Borrowed from Algorand Inc.
const waitForConfirmation = async function (algodClient, txId) {
   let lastround = (await algodClient.status().do())['last-round'];
    while (true) {
       const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
       if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
         //Got the completed Transaction
         console.log('Transaction confirmed in round ' + pendingInfo['confirmed-round']);
         break;
       }
       lastround++;
       await algodClient.statusAfterBlock(lastround).do();
    }
};

(async() => {
    let params = await algodClient.getTransactionParams().do();

    let txn = {
        "from": recoveredAccount.addr,
        "to": "UUOB7ZC2IEE4A7JO4WY4TXKXWDFNATM43TL73IZRAFIFFOE6ORPKC7Q62E",
        "amount": 10,
        "fee": params.fee,
        "firstRound": params.firstRound,
        "lastRound": params.lastRound,
        "genesisID": params.genesisID,
        "genesisHash": params.genesisHash,
        "note": new Uint8Array(0),
    };

    const signedTxn = algosdk.signTransaction(txn, recoveredAccount.sk);

    const sendTx = await algodClient.sendRawTransaction(signedTxn.blob).do();
    console.log("Transaction sent with ID " + sendTx.txId);
    waitForConfirmation(algodClient, sendTx.txId)
})().catch(e => {
    console.log(e);
});