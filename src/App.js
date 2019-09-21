import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function LogIn() {
  return <h2>LogIn</h2>;
}

function SignUp() {
  return <h2>SignUp</h2>;
}

function Overview() {
  return <h2>Overview</h2>;
}

function Transaction() {
  return <h2>Transaction</h2>;
}

function AppRouter() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">LogIn</Link>
            </li>
            <li>
              <Link to="/signup/">SignUp</Link>
            </li>
            <li>
              <Link to="/overview/">Overview</Link>
            </li>
            <li>
              <Link to="/transaction/">Transaction</Link>
            </li>
          </ul>
        </nav>

        <Route path="/" exact component={LogIn} />
        <Route path="/signup/" component={SignUp} />
        <Route path="/overview/" component={Overview} />
        <Route path="/transaction/" component={Transaction} />
      </div>
    </Router>
  );
}

export default AppRouter;
