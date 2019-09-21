import React from "react";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Overview from "./pages/Overview";
import Transaction from "./pages/Transaction";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

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
