const { ethers } = require("ethers");
const getConfig = require("./config");

const connectToWallet = async (network) => {
  if (network.includes("rinkeby")) {
    network = await getConfig("rinkbyRpc");
  }
  let provider = ethers.getDefaultProvider(network);
  let privateKey = await getConfig("walletPrivateKey");
  let wallet = new ethers.Wallet(privateKey, provider);
  return wallet;
};

const getProvider = async (rpcUrl) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  return provider;
};

const getTransactionDetails = async (rpcUrl, hash) => {
  if (rpcUrl.includes("rinkeby")) {
    rpcUrl = await getConfig("rinkbyRpc");
  }
  let providor = await getProvider(rpcUrl);
  let transaction = await providor.getTransaction(hash);
  return transaction;
};

module.exports = {
  getTransactionDetails,
  connectToWallet,
};
