import React from "react";
import { Link } from "react-router-dom";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnLogOut = this.handleOnLogOut.bind(this);
  }

  handleOnLogOut(e) {
    sessionStorage.removeItem("userid");
  }

  render() {
    return (
      <div>
        <Link to="/overview">Overview</Link>
        <br />
        <Link to="/" onClick={this.handleOnLogOut}>
          Log out
        </Link>
      </div>
    );
  }
}

export default Transaction;
