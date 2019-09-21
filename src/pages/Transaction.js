import React from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import utils from "../utils";
import Const from "../const";
import CurrencyRateTable from "./CurrencyRateTable";
import BalanceTable from "./BalanceTable";
import Select from "react-select";
import "./Transaction.css";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    const userId = sessionStorage.getItem("userid");
    this.state = {
      userId,
      isLoggedIn: !!userId,
      userList: [],
      currencyRateMap: {},
      selectedReceiverList: [],
      transactionHistoryList: [],
      sourceCurrency: { value: Const.CURRENCY.USD, label: Const.CURRENCY.USD },
      sourceAmount: 0,
      targetCurrency: { value: Const.CURRENCY.USD, label: Const.CURRENCY.USD },
      targetAmount: 0
    };

    this.handleOnLogOut = this.handleOnLogOut.bind(this);
    this.getCurrencyRate = this.getCurrencyRate.bind(this);
  }

  componentDidMount() {
    // 1. fetch user list
    axios
      .get(`http://localhost:3001/api/user/list`)
      .then(response => {
        console.log("response:", response); // REMOVE ME
        if (!!response.data && response.data.length > 0) {
          this.setState({
            userList: response.data
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
          this.setState({
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

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/" />;
    }

    const curUser = this.state.userList.find(
      user => user.id === this.state.userId
    );

    const options = this.state.userList
      .filter(user => user.id !== this.state.userId)
      .map(user => {
        return { value: user.id, label: user.name };
      });

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
            options={options}
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
              this.setState({ sourceAmount: e.target.value });
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
              this.setState({ targetAmount: e.target.value });
            }}
          />
        </div>
      </div>
    );
  }
}

export default Transaction;
