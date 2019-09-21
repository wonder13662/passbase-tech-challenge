import React from "react";
import axios from "axios";
import utils from "../utils";
import { Redirect, Link } from "react-router-dom";

class LogIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      isLoggedIn: false
    };

    this.handleOnChangeEmail = this.handleOnChangeEmail.bind(this);
    this.handleOnChangePassword = this.handleOnChangePassword.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnChangeEmail(e) {
    this.setState({ email: e.target.value });
  }

  handleOnChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  handleOnSubmit(e) {
    e.preventDefault();
    console.log("handleOnSubmit at Login");

    if (!this.state.email) {
      alert("Please check email");
      return;
    } else if (!this.state.password) {
      alert("Please check password");
      return;
    }

    axios
      .post("http://localhost:3001/api/login", {
        email_address: this.state.email,
        password: this.state.password
      })
      .then(response => {
        if (response.status === 200 && response.data.success) {
          console.log(response);
          sessionStorage.setItem("userid", response.data.userid);
          // TODO Redirect to Overview page
          this.setState({ isLoggedIn: true });
        } else {
          alert("Email or password is wrong. Please try again.");
        }
      })
      .catch(error => {
        console.log(error);
        utils.alertError();
      });
  }

  render() {
    if (this.state.isLoggedIn) {
      return <Redirect to="/overview" />;
    }

    return (
      <form action="/api/login" method="post">
        <div>
          <label>
            E-mail:
            <input
              type="email"
              value={this.state.email}
              onChange={this.handleOnChangeEmail}
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={this.state.password}
              onChange={this.handleOnChangePassword}
            />
          </label>
        </div>
        <div className="button" onClick={this.handleOnSubmit}>
          <button type="submit">Submit</button>
        </div>
        <Link to="/signup/">Don't you have account? Create new one</Link>
      </form>
    );
  }
}

export default LogIn;
