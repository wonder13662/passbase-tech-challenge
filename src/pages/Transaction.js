import React from "react";
import { Redirect, Link } from "react-router-dom";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: !!sessionStorage.getItem("userid")
    };
    this.handleOnLogOut = this.handleOnLogOut.bind(this);
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
        <Link to="/overview">Go to Overview</Link>
        <br />
        <Link to="/" onClick={this.handleOnLogOut}>
          Log out
        </Link>
      </div>
    );
  }
}

export default Transaction;
