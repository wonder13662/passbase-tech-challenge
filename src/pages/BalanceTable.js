import React from "react";
import Const from "../const";
import utils from "../utils";
import "./Overview.css";
import Table from "react-bootstrap/Table";

class BalaceTable extends React.Component {
  constructor(props) {
    super(props);
    const userId = sessionStorage.getItem("userid");
    this.state = {
      userId: !!userId ? userId : ""
    };
  }

  render() {
    // 1. Calculate account balance
    const accountBalances = utils.getAccountBalanceArr(
      this.props.transactionHistoryList,
      this.state.userId
    );
    const balanceRows = Const.CURRENCY_ARR.map((currency, idx) => (
      <tr key={idx}>
        <td>{currency}</td>
        <td data-cy={`balance-${currency.toLowerCase()}`}>
          {accountBalances[idx]}
        </td>
      </tr>
    ));

    return (
      <div className="balance-table-container">
        <h3>Balances</h3>
        <Table striped bordered hover size="sm" data-cy="balance-table">
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
