import React from "react";
import axios from "axios";
import utils from "../utils";
import { Redirect, Link } from "react-router-dom";

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: sessionStorage.getItem("userid"),
      isLoggedIn: !!sessionStorage.getItem("userid"),
      transactionHistoryList: []
    };
    this.handleOnLogOut = this.handleOnLogOut.bind(this);
  }

  componentDidMount() {
    // 1. fetch transaction list
    axios
      .get(`http://localhost:3001/api/transaction/list/${this.state.userId}`)
      .then(response => {
        console.log("response:", response);

        if (response.status === 200) {
          this.setState({ isSignedUp: true });
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

    return (
      <div>
        <Link to="/transaction">Go to Transaction</Link>
        <br />
        <Link to="/" onClick={this.handleOnLogOut}>
          Log out
        </Link>
      </div>
    );
  }
}

export default Overview;
