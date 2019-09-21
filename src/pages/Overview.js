import React from "react";
import axios from "axios";
import utils from "../utils";
import Const from "../const";
import "./Overview.css";
import { Redirect, Link } from "react-router-dom";
import CurrencyRateTable from "./CurrencyRateTable";
import BalanceTable from "./BalanceTable";
import Table from "react-bootstrap/Table";

class Overview extends React.Component {
  constructor(props) {
    super(props);
    const userId = sessionStorage.getItem("userid");
    this.state = {
      userId: !!userId ? userId : "",
      isLoggedIn: !!userId,
      transactionHistoryList: [],
      currencies: [Const.CURRENCY.USD, Const.CURRENCY.EUR, Const.CURRENCY.GBP]
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
  }

  handleOnLogOut(e) {
    sessionStorage.removeItem("userid");
  }

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/" />;
    }

    const rows = this.state.transactionHistoryList.map((item, idx) => (
      <tr key={item._id}>
        <td>{idx}</td>
        <td>{item.sender_name}</td>
        <td>{item.sender_currency}</td>
        <td>{item.sender_amount}</td>
        <td>{item.exchange_rate}</td>
        <td>{item.receiver_name}</td>
        <td>{item.receiver_currency}</td>
        <td>{item.receiver_amount}</td>
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

        <div className="info-box-r">
          <CurrencyRateTable />
          <BalanceTable
            transactionHistoryList={this.state.transactionHistoryList}
          />
        </div>

        <div className="transaction-table-container">
          <h3>Transaction history</h3>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Id</th>
                <th>Sender</th>
                <th>Sender currency</th>
                <th>Sender Amount</th>
                <th>Exchange rate</th>
                <th>Receiver</th>
                <th>Receiver currency</th>
                <th>Receiver Amount</th>
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
