import React from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import { Jumbotron, Container, Row, Col, Button, Form } from "react-bootstrap";
import utils from "../utils";

class LogIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      isLoggedIn: !!sessionStorage.getItem("userid")
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
          sessionStorage.setItem("userid", response.data.userid);
          this.setState({ isLoggedIn: true });
        } else {
          alert("Email or password is wrong. Please try again.");
        }
      })
      .catch(error => {
        utils.alertError();
      });
  }

  render() {
    if (this.state.isLoggedIn) {
      return <Redirect to="/overview" />;
    }

    return (
      <Container>
        <Row>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
          <Col>&nbsp;</Col>
          <Col xs={5}>
            <Jumbotron>
              <Form>
                <h3>Log in</h3>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={this.state.email}
                    onChange={this.handleOnChangeEmail}
                  />
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handleOnChangePassword}
                  />
                </Form.Group>
                <Button variant="primary" onClick={this.handleOnSubmit}>
                  Submit
                </Button>
                <div>
                  <Link to="/signup/">
                    Do you need an account? Create new one
                  </Link>
                </div>
              </Form>
            </Jumbotron>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
        <Row></Row>
      </Container>
    );
  }
}

export default LogIn;
