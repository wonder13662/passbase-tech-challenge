import React from "react";
import axios from "axios";
import utils from "../utils";
import Const from "../const";
import "./Overview.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Redirect, Link } from "react-router-dom";
import Table from "react-bootstrap/Table";

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: sessionStorage.getItem("userid"),
      isLoggedIn: !!sessionStorage.getItem("userid"),
      transactionHistoryList: [],
      currencyRates: []
    };
    this.handleOnLogOut = this.handleOnLogOut.bind(this);
  }

  componentDidMount() {
    // 1. fetch transaction list
    axios
      .get(`http://localhost:3001/api/transaction/list/${this.state.userId}`)
      .then(response => {
        if (response.status === 200 && !!response.data) {
          this.setState({
            isSignedUp: true,
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
    const promiseUSD = axios.get(`https://api.ratesapi.io/api/latest?base=USD`);
    const promiseEUR = axios.get(`https://api.ratesapi.io/api/latest?base=EUR`);
    const promiseGBP = axios.get(`https://api.ratesapi.io/api/latest?base=GBP`);

    Promise.all([promiseUSD, promiseEUR, promiseGBP])
      .then(responses => {
        console.log(responses);

        const currencyRates = [
          {
            base: Const.CURRENCY.USD,
            rates: [
              {
                name: Const.CURRENCY.EUR,
                rate: responses[0].data.rates[Const.CURRENCY.EUR]
              },
              {
                name: Const.CURRENCY.GBP,
                rate: responses[0].data.rates[Const.CURRENCY.GBP]
              }
            ]
          },
          {
            base: Const.CURRENCY.EUR,
            rates: [
              {
                name: Const.CURRENCY.USD,
                rate: responses[1].data.rates[Const.CURRENCY.USD]
              },
              {
                name: Const.CURRENCY.GBP,
                rate: responses[1].data.rates[Const.CURRENCY.GBP]
              }
            ]
          },
          {
            base: Const.CURRENCY.GBP,
            rates: [
              {
                name: Const.CURRENCY.USD,
                rate: responses[2].data.rates[Const.CURRENCY.USD]
              },
              {
                name: Const.CURRENCY.EUR,
                rate: responses[2].data.rates[Const.CURRENCY.EUR]
              }
            ]
          }
        ];

        console.log("currencyRates:", currencyRates);

        this.setState({ currencyRates });
      })
      .catch(error => {
        utils.alertError();
      });
  }

  handleOnLogOut(e) {
    sessionStorage.removeItem("userid");
  }

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/" />;
    }

    const currencyRateRows = this.state.currencyRates.map((item, idx) => (
      <tr key={idx}>
        <td>{item.base}</td>
        <td>{item.rates[0].name}</td>
        <td>{`${item.rates[0].rate}`}</td>
        <td>{item.rates[1].name}</td>
        <td>{`${item.rates[1].rate}`}</td>
      </tr>
    ));

    const rows = this.state.transactionHistoryList.map((item, idx) => (
      <tr key={item._id}>
        <td>{idx}</td>
        <td>{item.sender_name}</td>
        <td>{item.receiver_name}</td>
        <td>{item.amount}</td>
        <td>{item.source_currency}</td>
        <td>{item.target_currency}</td>
        <td>{item.created_at}</td>
      </tr>
    ));

    return (
      <div>
        <Link to="/transaction">Go to Transaction</Link>
        <br />
        <Link to="/" onClick={this.handleOnLogOut}>
          Log out
        </Link>
        <div className="currency-rate-table-container">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Base</th>
                <th>Currency name</th>
                <th>Rates</th>
                <th>Currency name</th>
                <th>Rates</th>
              </tr>
            </thead>
            <tbody>{currencyRateRows}</tbody>
          </Table>
        </div>
        <div className="transaction-table-container">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Id</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Amount</th>
                <th>Source currency</th>
                <th>Target currency</th>
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default Overview;
