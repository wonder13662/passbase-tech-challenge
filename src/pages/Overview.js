import React from "react";
import { Link } from "react-router-dom";

class Overview extends React.Component {
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

export default Overview;
