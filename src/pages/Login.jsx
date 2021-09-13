import React, { Component } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Button } from "@material-ui/core";
import dfinityicon from "../assets/dfinity.png";
import history from "../History";
import "./Login.css";
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      islogin: false,
    };
  }

  render() {
    return (
      <div>
        <Button
          variant="contained"
          onClick={this.props.handleLogin}
          className="Login_LoginButton"
        >
          Login with &nbsp;&nbsp;{" "}
          <img src={dfinityicon} style={{ height: "16px" }} />
        </Button>
      </div>
    );
  }
}