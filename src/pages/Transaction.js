import React from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import utils from "../utils";
import Select from "react-select";
import "./Transaction.css";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    const userId = sessionStorage.getItem("userid");
    this.state = {
      userId,
      isLoggedIn: !!userId,
      userList: [],
      selectedUserList: []
    };
    this.handleOnLogOut = this.handleOnLogOut.bind(this);
  }

  componentDidMount() {
    // 1. fetch user list

    axios
      .get(`http://localhost:3001/api/user/list`)
      .then(response => {
        console.log("response:", response); // REMOVE ME
        if (!!response.data && response.data.length > 0) {
          this.setState({
            userList: response.data
          });
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
    const options = this.state.userList
      .filter(user => user.id !== this.state.userId)
      .map(user => {
        return { value: user.id, label: user.name };
      });

    return (
      <div>
        <Link to="/overview">Go to Overview</Link>
        <br />
        <Link to="/" onClick={this.handleOnLogOut}>
          Log out
        </Link>
        <div className="receiver-box">
          <Select
            value={this.state.selectedOptions}
            isMulti={true}
            isSearchable={true}
            onChange={e => {
              console.log(e);
            }}
            options={options}
          />
        </div>
      </div>
    );
  }
}

export default Transaction;
