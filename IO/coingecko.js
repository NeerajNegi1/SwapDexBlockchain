const axios = require("axios");

const fetchCryptoPriceUsingId = async (cryptoId) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=inr&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
    );
    response.data[`${cryptoId}`].key = cryptoId;
    return response.data[`${cryptoId}`];
  } catch (error) {
    console.log(error);
  }
};

module.exports = { fetchCryptoPriceUsingId };
