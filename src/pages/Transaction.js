import React from "react";
import { Link } from "react-router-dom";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Link to="/">Log out</Link>
      </div>
    );
  }
}

export default Transaction;
