import React from "react";
import Const from "../const";
import "./Overview.css";
import Table from "react-bootstrap/Table";

class BalaceTable extends React.Component {
  constructor(props) {
    super(props);
    const userId = sessionStorage.getItem("userid");
    this.state = {
      userId: !!userId ? userId : ""
    };
    this.getAccountBalance = this.getAccountBalance.bind(this);
  }

  getAccountBalance() {
    const { transactionHistoryList } = this.props;
    console.log("transactionHistoryList:", transactionHistoryList); // REMOVE ME

    // Sort history by currency
    let accountBalances = new Array(Const.CURRENCY_ARR.length);
    Const.CURRENCY_ARR.forEach((currency, idx) => {
      // 1. Fetch all transaction which contains this currency
      let balance = 0;
      transactionHistoryList.forEach(history => {
        const isReceiving =
          this.state.userId === history.receiver_id &&
          currency === history.target_currency;
        const isSending =
          this.state.userId === history.sender_id &&
          currency === history.source_currency;

        if (isReceiving) {
          balance += history.amount;
        } else if (isSending) {
          balance -= history.amount;
        }
      });
      return (accountBalances[idx] = balance);
    });

    return accountBalances;
  }

  render() {
    // 1. Calculate account balance
    const accountBalances = this.getAccountBalance();
    const balanceRows = Const.CURRENCY_ARR.map((currency, idx) => (
      <tr key={idx}>
        <td>{currency}</td>
        <td>{accountBalances[idx]}</td>
      </tr>
    ));

    return (
      <div className="balance-table-container">
        <h3>Balances</h3>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Base</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>{balanceRows}</tbody>
        </Table>
      </div>
    );
  }
}

export default BalaceTable;
