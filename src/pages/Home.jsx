import React, { Component } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { principalToAccountAddress} from '../utils.jsx';
import "./Home.css";

export default class Home extends Component {
  render() {
    return (
      <div className="home">
          <h2>Your principal is {principalToAccountAddress(authClient.getIdentity().getPrincipal().toText())}</h2>
      </div>
    );
  }
}