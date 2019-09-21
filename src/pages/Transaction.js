import React from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import Decimal from "decimal.js-light";
import Select from "react-select";
import Button from "react-bootstrap/Button";

import utils from "../utils";
import Const from "../const";
import CurrencyRateTable from "./CurrencyRateTable";
import BalanceTable from "./BalanceTable";
import "./Transaction.css";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    const userId = sessionStorage.getItem("userid");
    this.state = {
      userId,
      curUser: {},
      isLoggedIn: !!userId,
      userOptionList: [],
      currencyRateMap: {},
      selectedReceiverList: [],
      accountBalanceArr: [],
      transactionHistoryList: [],
      senderCurrency: { value: Const.CURRENCY.USD, label: Const.CURRENCY.USD },
      senderAmount: 0,
      receiverCurrency: {
        value: Const.CURRENCY.USD,
        label: Const.CURRENCY.USD
      },
      receiverAmount: 0
    };

    this.handleOnLogOut = this.handleOnLogOut.bind(this);
    this.getCurrencyRate = this.getCurrencyRate.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.isEnableSubmit = this.isEnableSubmit.bind(this);
    this.isEnableSubmitWithAlert = this.isEnableSubmitWithAlert.bind(this);
    this.isEnableSubmitWithoutAlert = this.isEnableSubmitWithoutAlert.bind(
      this
    );
    this.calculateReceiverAmount = this.calculateReceiverAmount.bind(this);
    this.getAccountBalance = this.getAccountBalance.bind(this);
    this.fetchUserList = this.fetchUserList.bind(this);
    this.fetchTransactionList = this.fetchTransactionList.bind(this);
  }

  componentDidMount() {
    // 1. fetch user list
    this.fetchUserList();

    // 2. fetch transaction list
    this.fetchTransactionList();

    // 3. fetch the currency rate
    utils.fetchCurrencyRateMap().then(currencyRateMap => {
      this.setState({ currencyRateMap });
    });
  }

  fetchUserList() {
    axios
      .get(`http://localhost:3001/api/user/list`)
      .then(response => {
        if (!!response.data && response.data.length > 0) {
          const userList = response.data;
          const options = userList
            .filter(user => user.id !== this.state.userId)
            .map(user => {
              return { value: user.id, label: user.name };
            });

          const curUser = userList.find(user => user.id === this.state.userId);

          this.setState({
            curUser,
            userOptionList: options,
            selectedReceiverList: options.slice(0, 1)
          });
        }
      })
      .catch(error => {
        utils.alertError();
      });
  }

  fetchTransactionList() {
    axios
      .get(`http://localhost:3001/api/transaction/list/${this.state.userId}`)
      .then(response => {
        if (response.status === 200 && !!response.data) {
          const accountBalanceArr = utils.getAccountBalanceArr(
            response.data,
            this.state.userId
          );
          this.setState({
            accountBalanceArr,
            transactionHistoryList: response.data
          });
        } else {
          utils.alertError();
        }
      })
      .catch(error => {
        utils.alertError();
      });
  }

  handleOnLogOut(e) {
    sessionStorage.removeItem("userid");
  }

  handleOnSubmit(e) {
    if (!this.isEnableSubmitWithAlert()) return;

    const {
      selectedReceiverList,
      curUser,
      senderCurrency,
      senderAmount,
      receiverCurrency,
      receiverAmount
    } = this.state;

    selectedReceiverList.forEach(receiver => {
      const transactionData = {
        sender_id: curUser.id,
        sender_name: curUser.name,
        sender_currency: senderCurrency.value,
        sender_amount: senderAmount,
        receiver_id: receiver.value,
        receiver_name: receiver.label,
        receiver_currency: receiverCurrency.value,
        receiver_amount: receiverAmount,
        exchange_rate: this.getCurrencyRate()
      };

      axios
        .post(`http://localhost:3001/api/transaction`, transactionData)
        .then(response => {
          if (response.status !== 200 || !response.data.success) {
            utils.alertError();
          } else {
            alert("Your money has been wired successfully!");
            this.fetchTransactionList();
            this.setState({ senderAmount: 0, receiverAmount: 0 });
          }
        })
        .catch(error => {
          utils.alertError();
        });
    });
  }

  getCurrencyRate() {
    const senderCurrency = this.state.senderCurrency.value;
    const receiverCurrency = this.state.receiverCurrency.value;
    const currencyRateMap = this.state.currencyRateMap;

    if (
      senderCurrency === receiverCurrency ||
      !currencyRateMap ||
      !currencyRateMap[senderCurrency]
    )
      return 1;

    return currencyRateMap[senderCurrency][receiverCurrency];
  }

  getAccountBalance() {
    const { accountBalanceArr, senderCurrency } = this.state;
    if (
      !accountBalanceArr ||
      accountBalanceArr.length < 1 ||
      !senderCurrency ||
      !senderCurrency.value
    ) {
      return 0;
    }

    const idx = Const.CURRENCY_ARR.indexOf(senderCurrency.value);
    return new Decimal(accountBalanceArr[idx]);
  }

  isEnableSubmitWithAlert() {
    return this.isEnableSubmit(false);
  }

  isEnableSubmitWithoutAlert() {
    return this.isEnableSubmit(false);
  }

  isEnableSubmit(isShowingAlert) {
    const {
      accountBalanceArr,
      senderAmount,
      senderCurrency,
      selectedReceiverList
    } = this.state;
    const idx = Const.CURRENCY_ARR.indexOf(senderCurrency.value);
    const curAccountBalance = accountBalanceArr[idx];

    if (selectedReceiverList.length < 1) {
      // 3. Receiver should be assinged
      if (!!isShowingAlert) alert("No one receive your money");
      return false;
    }

    const totalSenderAmount = senderAmount * selectedReceiverList.length;
    if (totalSenderAmount > curAccountBalance) {
      // 1. Transit amount should be lower or equal to balance amount
      if (!!isShowingAlert)
        alert("Amount should be equal or less than balance amount");
      return false;
    }

    if (totalSenderAmount <= 0) {
      // 2. Transit amount should be bigger than 0
      if (!!isShowingAlert) alert("Amount should be bigger than 0");
      return false;
    }

    return true;
  }

  calculateReceiverAmount(senderAmount) {
    const {
      senderCurrency,
      receiverCurrency,
      selectedReceiverList,
      currencyRateMap
    } = this.state;

    if (senderCurrency.value === receiverCurrency.value) {
      return senderAmount;
    }

    const totalSenderAmount = senderAmount * selectedReceiverList.length;
    const rate = currencyRateMap[senderCurrency.value][receiverCurrency.value];
    const receiverAmount = totalSenderAmount * rate;

    return receiverAmount;
  }

  calculateSenderAmount(receiverAmount) {
    const {
      senderCurrency,
      receiverCurrency,
      selectedReceiverList,
      currencyRateMap
    } = this.state;

    if (senderCurrency.value === receiverCurrency.value) {
      return receiverAmount;
    }

    const totalReceiverAmount = new Decimal(receiverAmount).times(
      selectedReceiverList.length
    );
    const rate = currencyRateMap[senderCurrency.value][receiverCurrency.value];
    const senderAmount = totalReceiverAmount.dividedBy(rate);

    return senderAmount;
  }

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/" />;
    }

    const { userOptionList, curUser } = this.state;

    const currencyOptions = Const.CURRENCY_ARR.map(currency => {
      return { value: currency, label: currency };
    });

    return (
      <div>
        <Link to="/overview">Go to Overview</Link>
        <br />
        <Link to="/" onClick={this.handleOnLogOut}>
          Log out
        </Link>

        <div className="info-box-r">
          <CurrencyRateTable />
          <BalanceTable
            transactionHistoryList={this.state.transactionHistoryList}
          />
        </div>

        {!!curUser ? (
          <div>
            <h3>{`${curUser.name}, You send`}</h3>
          </div>
        ) : null}
        <div className="receiver-box">
          <Select
            value={this.state.selectedReceiverList}
            isMulti={true}
            isSearchable={true}
            onChange={value => {
              this.setState({ selectedReceiverList: !value ? [] : value });
            }}
            options={userOptionList}
          />
        </div>
        <div className="sender-currency-box">
          <Select
            value={this.state.senderCurrency}
            isSearchable={true}
            onChange={value => {
              this.setState({ senderCurrency: value });
            }}
            options={currencyOptions}
          />
          <input
            value={this.state.senderAmount}
            onChange={e => {
              const safeNum =
                e.target.value === ""
                  ? new Decimal(0)
                  : new Decimal(e.target.value);
              const accountBalance = this.getAccountBalance();
              const senderAmount = accountBalance.lessThan(safeNum)
                ? accountBalance
                : safeNum;
              const receiverAmount = this.calculateReceiverAmount(senderAmount);
              this.setState({
                senderAmount: senderAmount.toString(),
                receiverAmount: receiverAmount.toString()
              });
            }}
          />
        </div>

        <div className="currency-rate-box">{this.getCurrencyRate()}</div>

        <div className="receiver-currency-box">
          <Select
            value={this.state.receiverCurrency}
            isSearchable={true}
            onChange={value => {
              this.setState({ receiverCurrency: value });
            }}
            options={currencyOptions}
          />
          <input
            value={this.state.receiverAmount}
            onChange={e => {
              const safeNum =
                e.target.value === ""
                  ? new Decimal(0)
                  : new Decimal(e.target.value);
              const accountBalance = this.getAccountBalance();
              const maxReceiverAmount = accountBalance.times(
                this.getCurrencyRate()
              );
              const receiverAmount = safeNum.lessThan(maxReceiverAmount)
                ? safeNum
                : maxReceiverAmount;
              const senderAmount = this.calculateSenderAmount(receiverAmount);

              this.setState({
                senderAmount: senderAmount.toString(),
                receiverAmount: receiverAmount.toString()
              });
            }}
          />
        </div>
        {this.isEnableSubmit(false) ? (
          <Button variant="primary" onClick={this.handleOnSubmit}>
            Send
          </Button>
        ) : (
          <Button variant="primary" onClick={this.handleOnSubmit} disabled>
            Send
          </Button>
        )}
      </div>
    );
  }
}

export default Transaction;
