import React from "react";
import axios from "axios";
import utils from "../utils";
import { Redirect, Link } from "react-router-dom";

class SignUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      password: "",
      isSignedUp: false
    };

    this.handleOnChangeName = this.handleOnChangeName.bind(this);
    this.handleOnChangeEmail = this.handleOnChangeEmail.bind(this);
    this.handleOnChangePassword = this.handleOnChangePassword.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnSubmit(e) {
    e.preventDefault();
    console.log("handleOnSubmit at SignUp");

    if (!this.state.name) {
      alert("Please check name");
      return;
    } else if (!this.state.email) {
      alert("Please check email");
      return;
    } else if (!this.state.password) {
      alert("Please check password");
      return;
    }

    // TODO When it's duplicated

    axios
      .post("http://localhost:3001/api/user", {
        name: this.state.name,
        email_address: this.state.email,
        password: utils.encryptStr(this.state.password)
      })
      .then(response => {
        console.log(response);
        if (response.status === 200) {
          alert("Your account has been successfully registerd!");
          this.setState({ isSignedUp: true });
        } else {
          utils.alertError();
        }
      })
      .catch(error => {
        console.log(error);
        utils.alertError();
      });
  }

  handleOnChangeName(e) {
    this.setState({ name: e.target.value });
  }

  handleOnChangeEmail(e) {
    this.setState({ email: e.target.value });
  }

  handleOnChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  render() {
    if (this.state.isSignedUp) {
      return <Redirect to="/overview" />;
    }

    return (
      <form action="/api/signup" method="post">
        <div>
          <label>
            Name:
            <input
              type="text"
              value={this.state.name}
              onChange={this.handleOnChangeName}
            />
          </label>
        </div>
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
        <Link to="/">Log in</Link>
      </form>
    );
  }
}

export default SignUp;
