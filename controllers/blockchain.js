const { verifyOrderService } = require("../services/blockchain");
const logger = require("../utils/logger");

const verifyOrder = async (req, res) => {
  try {
    logger.info({
      description: "Inside verifyOrder controller.",
    });
    let txStatus = await verifyOrderService(req.body);

    logger.info({
      success: txStatus,
      description: txStatus
        ? "Successfully verifed the transaction."
        : "Failed to verify the transaction.",
      txStatus,
    });

    if (txStatus) {
      return res.status(200).json({
        success: true,
        message: "Successfully verifed the transaction.",
        txStatus,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to verify the transaction.",
        txStatus,
      });
    }
  } catch (error) {
    logger.error({
      success: false,
      description: "Something went wrong inside verifyOrder.",
    });
    return res.status(400).json({
      success: false,
      description: "Something went wrong",
      txStatus: false,
    });
  }
};

module.exports = { verifyOrder };
