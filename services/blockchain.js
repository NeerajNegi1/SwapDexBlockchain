const axios = require("axios");
const getConfig = require("../utils/config");
const { encryptString } = require("../utils/encryptDecrypt");
const { getTransactionDetails } = require("../utils/wallet");

const verifyOrderService = async ({ orderId, transactionHash }) => {
  try {
    if (!orderId || !transactionHash) {
      throw Error("Order id or transaction hash is missing");
    }
    let swapDexQuotationsUrl = await getConfig("swapDexQuotations");
    let {
      data: { data: orderDetails },
    } = await axios.get(`${swapDexQuotationsUrl}/fetch-quotation/${orderId}`);

    let tx = await getTransactionDetails(
      orderDetails.sellCoinDetails.rpc[0],
      transactionHash
    );
    if (
      !tx ||
      tx.from.toLowerCase() !== orderDetails.userWalletAddress.toLowerCase() ||
      !tx.blockNumber
    ) {
      return false;
    }
    let encryptData = await encryptString({
      quotationId: orderId,
      status: "CoinsReceived",
    });

    await axios.post(`${swapDexQuotationsUrl}/change-quotation-status`, {
      data: encryptData,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = { verifyOrderService };
