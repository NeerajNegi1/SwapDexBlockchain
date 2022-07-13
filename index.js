const express = require("express");
const initialize = require("./initApp");
const app = express();

app.use(express.json());

(async () => {
  // initializing the app
  await initialize(app);
})();
