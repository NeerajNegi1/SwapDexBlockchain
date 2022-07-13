const mongoose = require("mongoose");

const blockchain = require("./routes/blockchain");
const getConfig = require("./utils/config");
const logger = require("./utils/logger");

const initRoutes = async (app) => {
  app.get("/health", async (req, res) => {
    return res.status(200).json({
      status: "OK",
      message: "SwapDexBlockchain Server is running 🔥",
    });
  });

  // custom routes
  app.use("/", blockchain);

  // 404 route
  app.use((req, res) => {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  });
};

const connectToDB = async () => {
  try {
    await mongoose.connect(await getConfig("dbUrl"));
    logger.info({ description: "Connection to database is successful." });
  } catch (error) {
    logger.error({ description: "Connection to database is failed.", error });
  }
};

const initialize = async (app) => {
  connectToDB(); // connecting to db
  await initRoutes(app); // initiating the routes of the application
  const port = await getConfig("port");
  app.listen(port, async () => {
    logger.info({
      description: `🚀 SwapDexBlockchain server is started on port ${port} 🚀`,
    });
  });
};

module.exports = initialize;
