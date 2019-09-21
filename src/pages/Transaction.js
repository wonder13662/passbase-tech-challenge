import React from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import Decimal from "decimal.js-light";
import Select from "react-select";
import Table from "react-bootstrap/Table";
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
    this.handleOnSubmitThenTestFail = this.handleOnSubmitThenTestFail.bind(
      this
    );
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
    if (!this.state.isLoggedIn) {
      return;
    }

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

  addTransaction(url) {
    if (!this.isEnableSubmitWithAlert()) return;

    const {
      selectedReceiverList,
      curUser,
      senderCurrency,
      senderAmount,
      receiverCurrency,
      receiverAmount
    } = this.state;

    let promises = [];
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

      const promise = axios.post(url, transactionData);
      promises.push(promise);
    });

    Promise.all(promises)
      .then(responses => {
        let success = true;
        responses.forEach(res => {
          if (res.status !== 200 || !res.data.success) {
            success = false;
          }
        });

        if (!success) {
          utils.alertError();
        } else {
          this.fetchTransactionList();
          this.setState({ senderAmount: 0, receiverAmount: 0 });
          alert("Your money has been wired successfully!");
        }
      })
      .catch(error => {
        utils.alertError();
      });
  }

  handleOnSubmit(e) {
    this.addTransaction("http://localhost:3001/api/transaction");
  }

  handleOnSubmitThenTestFail(e) {
    this.addTransaction("http://localhost:3001/api/transaction/fail");
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
      return new Decimal(0);
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
    const { senderCurrency, receiverCurrency, currencyRateMap } = this.state;

    if (senderCurrency.value === receiverCurrency.value) {
      return new Decimal(senderAmount);
    }

    const rate = currencyRateMap[senderCurrency.value][receiverCurrency.value];
    return new Decimal(senderAmount).times(rate);
  }

  calculateSenderAmount(receiverAmount) {
    const { senderCurrency, receiverCurrency, currencyRateMap } = this.state;

    if (senderCurrency.value === receiverCurrency.value) {
      return new Decimal(receiverAmount);
    }

    const rate = currencyRateMap[senderCurrency.value][receiverCurrency.value];
    return new Decimal(receiverAmount).dividedBy(rate);
  }

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/" />;
    }

    const {
      userOptionList,
      selectedReceiverList,
      curUser,
      senderAmount,
      receiverAmount
    } = this.state;

    const currencyOptions = Const.CURRENCY_ARR.map(currency => {
      return { value: currency, label: currency };
    });

    const receiverCnt = selectedReceiverList.length;

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
          <Table striped bordered>
            <thead>
              <tr>
                <th>Currency</th>
                <th>Amount</th>
                <th>Receiver number</th>
                <th>Total amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Select
                    value={this.state.senderCurrency}
                    isSearchable={true}
                    onChange={value => {
                      this.setState({ senderCurrency: value });
                    }}
                    options={currencyOptions}
                  />
                </td>
                <td>
                  <input
                    value={senderAmount}
                    onChange={e => {
                      const safeNum =
                        e.target.value === ""
                          ? new Decimal(0)
                          : new Decimal(e.target.value);
                      const accountBalance = this.getAccountBalance();
                      const senderAmount = accountBalance.lessThan(safeNum)
                        ? accountBalance
                        : safeNum;
                      const receiverAmount = this.calculateReceiverAmount(
                        senderAmount
                      );
                      this.setState({
                        senderAmount: senderAmount.toString(),
                        receiverAmount: receiverAmount.toString()
                      });
                    }}
                  />
                </td>
                <td>{`X ${receiverCnt} =`}</td>
                <td>
                  <input value={senderAmount * receiverCnt} disabled />
                </td>
              </tr>
              <tr>
                <td colSpan="2">Currency Rate</td>
                <td colSpan="2">{this.getCurrencyRate()}</td>
              </tr>
              <tr>
                <td>
                  <Select
                    value={this.state.receiverCurrency}
                    isSearchable={true}
                    onChange={value => {
                      this.setState({ receiverCurrency: value });
                    }}
                    options={currencyOptions}
                  />{" "}
                </td>
                <td>
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
                      const senderAmount = this.calculateSenderAmount(
                        receiverAmount
                      );

                      this.setState({
                        senderAmount: senderAmount.toString(),
                        receiverAmount: receiverAmount.toString()
                      });
                    }}
                  />
                </td>
                <td>{`X ${receiverCnt} =`}</td>
                <td>
                  <input value={receiverAmount * receiverCnt} disabled />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  {this.isEnableSubmit(false) ? (
                    <Button
                      variant="primary"
                      onClick={this.handleOnSubmit}
                      size="lg"
                    >
                      Send
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={this.handleOnSubmit}
                      size="lg"
                      disabled
                    >
                      Send
                    </Button>
                  )}
                </td>
                <td colSpan="2">
                  {this.isEnableSubmit(false) ? (
                    <Button
                      variant="danger"
                      onClick={this.handleOnSubmitThenTestFail}
                      size="lg"
                    >
                      Test transaction failure
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={this.handleOnSubmitThenTestFail}
                      size="lg"
                      disabled
                    >
                      Test transaction failure
                    </Button>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    );
  } //
}

export default Transaction;
