const { verifyOrder } = require("../controllers/blockchain");

const router = require("express").Router();

router.post("/verify-order", verifyOrder);

module.exports = router;

// payload validation (joi) and the encryption and decryption of the payload using middleware
