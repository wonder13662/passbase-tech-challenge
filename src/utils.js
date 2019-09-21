import bcrypt from "bcryptjs";
import axios from "axios";
import Const from "./const";

export default {
  encryptStr: function(raw) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(raw, salt);
  },
  alertError: function() {
    alert("Sorry for your unconvenience.\nWe will fix this issue shortly.");
  },
  fetchCurrencyRateAll: function() {
    const promiseUSD = axios.get(`https://api.ratesapi.io/api/latest?base=USD`);
    const promiseEUR = axios.get(`https://api.ratesapi.io/api/latest?base=EUR`);
    const promiseGBP = axios.get(`https://api.ratesapi.io/api/latest?base=GBP`);

    return Promise.all([promiseUSD, promiseEUR, promiseGBP]);
  },
  fetchCurrencyRateArr: function() {
    return this.fetchCurrencyRateMap()
      .then(currencyRateMap => this.convertRateMapToArr(currencyRateMap))
      .catch(error => {
        this.alertError();
      });
  },
  convertRateMapToArr: function(currencyRateMap) {
    const currencyRateList = [];
    Const.CURRENCY_ARR.forEach(outer => {
      Const.CURRENCY_ARR.forEach(inner => {
        if (outer !== inner) {
          currencyRateList.push({
            base: outer,
            currency: inner,
            rate: currencyRateMap[outer][inner]
          });
        }
      });
    });

    return currencyRateList;
  },
  fetchCurrencyRateMap: function() {
    return this.fetchCurrencyRateAll()
      .then(responses => {
        return {
          [Const.CURRENCY.USD]: {
            [Const.CURRENCY.EUR]: responses[0].data.rates[Const.CURRENCY.EUR],
            [Const.CURRENCY.GBP]: responses[0].data.rates[Const.CURRENCY.GBP]
          },
          [Const.CURRENCY.EUR]: {
            [Const.CURRENCY.USD]: responses[1].data.rates[Const.CURRENCY.USD],
            [Const.CURRENCY.GBP]: responses[1].data.rates[Const.CURRENCY.GBP]
          },
          [Const.CURRENCY.GBP]: {
            [Const.CURRENCY.USD]: responses[2].data.rates[Const.CURRENCY.USD],
            [Const.CURRENCY.EUR]: responses[2].data.rates[Const.CURRENCY.EUR]
          }
        };
      })
      .catch(error => {
        this.alertError();
      });
  },
  getAccountBalanceArr(transactionHistoryList, userId) {
    // Sort history by currency
    let accountBalances = new Array(Const.CURRENCY_ARR.length);
    Const.CURRENCY_ARR.forEach((currency, idx) => {
      let balance = 0;
      transactionHistoryList.forEach(history => {
        const {
          amount,
          sender_id,
          receiver_id,
          target_currency,
          source_currency
        } = history;

        const isReceiving =
          userId === receiver_id && currency === target_currency;
        const isSending = userId === sender_id && currency === source_currency;

        if (isReceiving) {
          balance += amount;
        } else if (isSending) {
          balance -= amount;
        }
      });
      return (accountBalances[idx] = balance);
    });

    return accountBalances;
  }
};
