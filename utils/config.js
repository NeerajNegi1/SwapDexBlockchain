const configData = require("../config/localDevelopment.json")
  ? require("../config/localDevelopment.json")
  : require("../config/production.json");

const getConfig = async (key) => {
  if (key) return configData[key];
  return configData;
};
module.exports = getConfig;
