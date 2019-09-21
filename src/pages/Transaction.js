import React from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import utils from "../utils";
import Const from "../const";
import CurrencyRateTable from "./CurrencyRateTable";
import BalanceTable from "./BalanceTable";
import Select from "react-select";
import "./Transaction.css";
import Button from "react-bootstrap/Button";
import Decimal from "decimal.js-light";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    const userId = sessionStorage.getItem("userid");
    this.state = {
      userId,
      isLoggedIn: !!userId,
      userList: [],
      userOptionList: [],
      currencyRateMap: {},
      selectedReceiverList: [],
      accountBalanceArr: [],
      transactionHistoryList: [],
      sourceCurrency: { value: Const.CURRENCY.USD, label: Const.CURRENCY.USD },
      sourceAmount: 0,
      targetCurrency: { value: Const.CURRENCY.USD, label: Const.CURRENCY.USD },
      targetAmount: 0
    };

    this.handleOnLogOut = this.handleOnLogOut.bind(this);
    this.getCurrencyRate = this.getCurrencyRate.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.isEnableSubmit = this.isEnableSubmit.bind(this);
    this.isEnableSubmitWithAlert = this.isEnableSubmitWithAlert.bind(this);
    this.isEnableSubmitWithoutAlert = this.isEnableSubmitWithoutAlert.bind(
      this
    );
    this.calculateTargetAmount = this.calculateTargetAmount.bind(this);
    this.getAccountBalance = this.getAccountBalance.bind(this);
  }

  componentDidMount() {
    // 1. fetch user list
    axios
      .get(`http://localhost:3001/api/user/list`)
      .then(response => {
        if (!!response.data && response.data.length > 0) {
          const options = response.data
            .filter(user => user.id !== this.state.userId)
            .map(user => {
              return { value: user.id, label: user.name };
            });

          this.setState({
            userList: response.data,
            userOptionList: options,
            selectedReceiverList: options.slice(0, 1)
          });
        }
      })
      .catch(error => {
        utils.alertError();
      });

    // 1. fetch transaction list
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

    // 2. fetch the currency rate
    utils.fetchCurrencyRateMap().then(currencyRateMap => {
      this.setState({ currencyRateMap });
    });
  }

  handleOnLogOut(e) {
    sessionStorage.removeItem("userid");
  }

  handleOnSubmit(e) {
    this.isEnableSubmitWithAlert();
  }

  getCurrencyRate() {
    const sourceCurrency = this.state.sourceCurrency.value;
    const targetCurrency = this.state.targetCurrency.value;
    const currencyRateMap = this.state.currencyRateMap;

    if (
      sourceCurrency === targetCurrency ||
      !currencyRateMap ||
      !currencyRateMap[sourceCurrency]
    )
      return 1;

    return currencyRateMap[sourceCurrency][targetCurrency];
  }

  getAccountBalance() {
    const { accountBalanceArr, sourceCurrency } = this.state;
    const idx = Const.CURRENCY_ARR.indexOf(sourceCurrency.value);
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
      sourceAmount,
      sourceCurrency,
      selectedReceiverList
    } = this.state;
    const idx = Const.CURRENCY_ARR.indexOf(sourceCurrency.value);
    const curAccountBalance = accountBalanceArr[idx];

    if (selectedReceiverList.length < 1) {
      // 3. Receiver should be assinged
      if (!!isShowingAlert) alert("No one receive your money");
      return false;
    }

    const totalSourceAmount = sourceAmount * selectedReceiverList.length;
    if (totalSourceAmount > curAccountBalance) {
      // 1. Transit amount should be lower or equal to balance amount
      if (!!isShowingAlert)
        alert("Amount should be equal or less than balance amount");
      return false;
    }

    if (totalSourceAmount <= 0) {
      // 2. Transit amount should be bigger than 0
      if (!!isShowingAlert) alert("Amount should be bigger than 0");
      return false;
    }

    return true;
  }

  calculateTargetAmount(sourceAmount) {
    const {
      sourceCurrency,
      targetCurrency,
      selectedReceiverList,
      currencyRateMap
    } = this.state;

    if (sourceCurrency.value === targetCurrency.value) {
      return sourceAmount;
    }

    const totalSourceAmount = sourceAmount * selectedReceiverList.length;
    const rate = currencyRateMap[sourceCurrency.value][targetCurrency.value];
    const targetAmount = totalSourceAmount * rate;

    return targetAmount;
  }

  calculateSourceAmount(targetAmount) {
    const {
      sourceCurrency,
      targetCurrency,
      selectedReceiverList,
      currencyRateMap
    } = this.state;

    if (sourceCurrency.value === targetCurrency.value) {
      return targetAmount;
    }

    const totalTargetAmount = new Decimal(targetAmount).times(
      selectedReceiverList.length
    );
    const rate = currencyRateMap[sourceCurrency.value][targetCurrency.value];
    const sourceAmount = totalTargetAmount.dividedBy(rate);

    return sourceAmount;
  }

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/" />;
    }

    const { userList, userOptionList } = this.state;

    const curUser = userList.find(user => user.id === this.state.userId);

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
        <div className="source-currency-box">
          <Select
            value={this.state.sourceCurrency}
            isSearchable={true}
            onChange={value => {
              this.setState({ sourceCurrency: value });
            }}
            options={currencyOptions}
          />
          <input
            value={this.state.sourceAmount}
            onChange={e => {
              const safeNum =
                e.target.value === ""
                  ? new Decimal(0)
                  : new Decimal(e.target.value);
              const accountBalance = this.getAccountBalance();
              const sourceAmount = accountBalance.lessThan(safeNum)
                ? accountBalance
                : safeNum;
              const targetAmount = this.calculateTargetAmount(sourceAmount);
              this.setState({
                sourceAmount: sourceAmount.toString(),
                targetAmount: targetAmount.toString()
              });
            }}
          />
        </div>

        <div className="currency-rate-box">{this.getCurrencyRate()}</div>

        <div className="target-currency-box">
          <Select
            value={this.state.targetCurrency}
            isSearchable={true}
            onChange={value => {
              this.setState({ targetCurrency: value });
            }}
            options={currencyOptions}
          />
          <input
            value={this.state.targetAmount}
            onChange={e => {
              const safeNum =
                e.target.value === ""
                  ? new Decimal(0)
                  : new Decimal(e.target.value);
              const accountBalance = this.getAccountBalance();
              const maxTargetAmount = accountBalance.times(
                this.getCurrencyRate()
              );
              const targetAmount = safeNum.lessThan(maxTargetAmount)
                ? safeNum
                : maxTargetAmount;
              const sourceAmount = this.calculateSourceAmount(targetAmount);

              this.setState({
                sourceAmount: sourceAmount.toString(),
                targetAmount: targetAmount.toString()
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
