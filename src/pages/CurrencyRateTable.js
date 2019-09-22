import React from "react";
import utils from "../utils";
import Const from "../const";
import Table from "react-bootstrap/Table";

class CurrencyRateTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currencyRateMap: {},
      currencyRateArr: [],
      selectedReceiverList: [],
      currencies: [Const.CURRENCY.USD, Const.CURRENCY.EUR, Const.CURRENCY.GBP],
      senderCurrency: { value: Const.CURRENCY.USD, label: Const.CURRENCY.USD },
      senderAmount: 0,
      receiverCurrency: {
        value: Const.CURRENCY.USD,
        label: Const.CURRENCY.USD
      },
      receiverAmount: 0
    };
  }

  componentDidMount() {
    utils.fetchCurrencyRateArr().then(currencyRateArr => {
      this.setState({ currencyRateArr });
    });
  }

  render() {
    const currencyRateRows = this.state.currencyRateArr.map((item, idx) => (
      <tr key={idx}>
        <td>{item.base}</td>
        <td>{item.currency}</td>
        <td>{`${item.rate}`}</td>
      </tr>
    ));

    return (
      <div className="currency-rate-table-container">
        <h3>Currency rate</h3>
        <Table striped bordered hover size="sm" data-cy="currency-rate-table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Rates</th>
            </tr>
          </thead>
          <tbody>{currencyRateRows}</tbody>
        </Table>
      </div>
    );
  }
}

export default CurrencyRateTable;
