const getConfig = require("../utils/config");
const axios = require("axios");
const { encryptString } = require("../utils/encryptDecrypt");
const { consumerSendTxn } = require("../utils/kafkaSetup");
const logger = require("../utils/logger");
const { connectToWallet } = require("../utils/wallet");
const { ethers } = require("ethers");

const updateOrderData = async (orderId, swapDexQuotationsUrl, status) => {
  let encryptData = await encryptString({
    quotationId: orderId,
    status,
  });
  await axios.post(`${swapDexQuotationsUrl}/change-quotation-status`, {
    data: encryptData,
  });
};

const getOrderData = async (orderId, swapDexQuotationsUrl) => {
  let {
    data: { data: orderDetails },
  } = await axios.get(`${swapDexQuotationsUrl}/fetch-quotation/${orderId}`);

  return orderDetails;
};

const getLivePrices = async (orderData, swapDexQuotationsUrl) => {
  let response = await axios.post(`${swapDexQuotationsUrl}/fetch-quotations`, {
    buyTokenId: orderData.buyCoinDetails.defaultCoin.uniqueId,
    sellTokenId: orderData.sellCoinDetails.defaultCoin.uniqueId,
    sellTokenAmount:
      orderData.sellCoinAmount /
      10 ** orderData.sellCoinDetails.defaultCoin.decimals,
  });
  return response ? response.data.data.totalBuyTokenReceivedByUser : 0;
};

const sendTxn = async (orderId) => {
  let swapDexQuotationsUrl = await getConfig("swapDexQuotations");
  try {
    let orderData = await getOrderData(orderId, swapDexQuotationsUrl);
    if (orderData.status === "Success") {
      console.log("already successfull txn");
      return;
    }
    await updateOrderData(orderId, swapDexQuotationsUrl, "TransferringCoins");

    let fetchTokenAmountToSent = await getLivePrices(
      orderData,
      swapDexQuotationsUrl
    );
    let wallet = await connectToWallet(orderData.buyCoinDetails.rpc[0]);
    let provider = wallet.provider;

    let txData = {
      to: orderData.userWalletAddress,
      value: ethers.utils.parseUnits(
        `${fetchTokenAmountToSent}`,
        orderData.sellCoinDetails.defaultCoin.decimals
      ),
    };

    let tx = await wallet.sendTransaction(txData);
    await tx.wait();

    let verifyTxn = await provider.getTransaction(tx.hash);

    console.log(tx, "transaction data", verifyTxn);

    if (
      !verifyTxn ||
      verifyTxn.to.toLowerCase() !==
        orderData.userWalletAddress.toLowerCase() ||
      !verifyTxn.blockNumber
    ) {
      // throw Error("Transaction not verified and has been failed");
      console.log("Transaction not verified and has been failed");
      await updateOrderData(orderId, swapDexQuotationsUrl, "Failed");
      return;
    }
    await updateOrderData(orderId, swapDexQuotationsUrl, "Success");
    return;
  } catch (error) {
    // have to return back coins of the user
    console.log(error, "from the send transaction");
    await updateOrderData(orderId, swapDexQuotationsUrl, "Failed");
    return;
  }
};

const consumerFn = async () => {
  try {
    await consumerSendTxn.connect();
    await consumerSendTxn.subscribe({
      topic: "send-txn",
      fromBeginning: true,
    });
    await consumerSendTxn.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("---------------Started Here----------------");
        console.log("orderId", message.value.toString());
        await sendTxn(message.value.toString());
        console.log("---------------Ended Here----------------");
      },
    });
  } catch (error) {
    logger.error({
      message: "error in the consumerFn kafka consumer.",
      data: error,
    });
    consumerFn();
  }
};

consumerFn();
// sendTxn("62cf28dfb04482df7a2cd226");
// sendTxn("62d04e72b04482df7a2cd2da");
// sendTxn("62d05e41b04482df7a2cd474");
// sendTxn("62d06489b04482df7a2cd591");
// sendTxn("62d2f9de977985fc3d5c6744");
