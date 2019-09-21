import React from "react";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Overview from "./pages/Overview";
import Transaction from "./pages/Transaction";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function AppRouter() {
  return (
    <Router>
      <div>
        <Route path="/" exact component={LogIn} />
        <Route path="/signup/" component={SignUp} />
        <Route path="/overview/" component={Overview} />
        <Route path="/transaction/" component={Transaction} />
      </div>
    </Router>
  );
}

export default AppRouter;
