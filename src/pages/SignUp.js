import React from "react";
import axios from "axios";
import utils from "../utils";
import { Jumbotron, Container, Row, Col, Button, Form } from "react-bootstrap";
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
      .post("http://localhost:3001/api/signup", {
        name: this.state.name,
        email_address: this.state.email,
        password: utils.encryptStr(this.state.password)
      })
      .then(response => {
        console.log("response:", response);
        if (response.status === 200 && response.data.success) {
          alert("Your account has been successfully registerd!");
          sessionStorage.setItem("userid", response.data.userid);
          this.setState({ isSignedUp: true });
        } else {
          if (!!response.data && !!response.data.reason) {
            alert(response.data.reason);
          } else {
            utils.alertError();
          }
        }
      })
      .catch(error => {
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
      <Container>
        <Row>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
          <Col>&nbsp;</Col>
          <Col xs={5}>
            <Jumbotron>
              <Form>
                <h3>Sign up</h3>
                <Form.Group controlId="formName">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Would you tell me your name?"
                    value={this.state.name}
                    onChange={this.handleOnChangeName}
                  />
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

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
                  <Link to="/">Back to Log in</Link>
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

export default SignUp;
