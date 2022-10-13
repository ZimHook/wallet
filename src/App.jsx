import React, { Component, useState, useEffect } from "react";
import Login from "./pages/Login";
import history from "./History";
import { principalToAccountAddress, to32bits} from './utils.jsx';
import {ledgerIDL} from './candid/ledger.did.js';
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { BrowserRouter, Route, Switch, Link, Router } from "react-router-dom";
import { icp2usd } from "./pages/conv";
import "./App.css";

const App = () => {
  console.log(JSON.stringify({alternativeOrigins: ["http://localhost:3000"]}))
  const [principalString, setPrincipalString] = useState("");
  const [balance, setBalance] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authActor, setAuthActor] = useState({});
  var authClient = null;
  var identity = null;
  const goToLoginPage = () =>
    history.push({
      pathname: "/login",
    });

  const handleLogin = async () => {
    console.log("handle login");
    const authClient = await AuthClient.create();
    await authClient.login({
      derivationOrigin: "https://e2zec-lyaaa-aaaah-abnya-cai.raw.ic0.app",
      onSuccess: async () => {
        handleAuthenticated(authClient);
      },
      identityProvider:
      "https://identity.ic0.app/",
    });
  };

  async function handleAuthenticated(authClient) {      //登陆后的主要操作
    history.push({ pathname: "/home" });
    identity = await authClient.getIdentity();
    // authActor = await Actor.create;
    var principal_id = identity.getPrincipal().toText();    //获取用户的Principal
    console.log(principal_id);
    setPrincipalString(principal_id);
    setIsLogin(true);
    console.log("login success");
    const agent = new HttpAgent({
      identity: identity,
      host: "ic0.app",
    });
    console.log(agent);
    await agent.fetchRootKey();
    console.log("fetchRootKey");

    let ledgerAuthActor = Actor.createActor(ledgerIDL, {
      agent,
      canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    });

    setAuthActor(ledgerAuthActor);

  }
  useEffect(async () => {
    console.log("Check login!");
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      handleAuthenticated(authClient);
    } else {
      console.log("go to login page!");
      goToLoginPage();
    }
  }, []);

  async function transfer(){
    let to_address = document.getElementById("transfer_to_address").value;
    let amount = 100000000 * parseFloat(document.getElementById("transfer_amount").value);
    console.log(amount);
    console.log( parseInt(document.getElementById("transfer_amount").value));
    var args = {
      'to' : to_address,
      "fee" : { "e8s" : 10000 },
      'memo' : 0,
      "from_subaccount" : [Array(28).fill(0).concat(to32bits(0))], 
      'created_at_time' : [],
      "amount" : { "e8s" : amount },
    };

    var height = await authActor.send_dfx(args);
    console.log(height);
  };

  async function conv(){
    console.log('query')
    const e = await icp2usd();
    console.log(e)
  };

  async function getICPBanlance(){
    console.log(principalString);
    let address = principalToAccountAddress(principalString, 0);
    console.log(address);
    var args = {'account' : address};

    var icpBalance = await authActor.account_balance_dfx(args);
    console.log(icpBalance);
    console.log(icpBalance.e8s);
    var numICPBalance = parseInt(icpBalance.e8s);
    console.log(numICPBalance);
    setBalance(numICPBalance);
  };


  return (
    <div className="app">
      <Router history={history}>
        <Route
          exact
          path="/login"
          component={(props) => {
            let obj = Object.assign({}, { handleLogin: handleLogin }, props);
            return <Login {...obj} />;
          }}
        />
        <h2>
          principal : {isLogin ? principalString : 'not logged in'}
          <br/> 
          address : {isLogin ? principalToAccountAddress(principalString, 0) : 'not logged in'}
          <br/> 
          ICP balance : {isLogin ? balance/100000000 : 'not logged in'} 
          <button onClick={getICPBanlance} disabled={!isLogin}>
          refresh balance
          </button>
        </h2>
        
        <textarea
          id="transfer_to_address"
          defaultValue={"the address you transfer to"}
        />
        <br/>
        <textarea
          id="transfer_amount"
          defaultValue={"the amount of ICP you want to transfer"}
        />
        <br/>
        <button onClick={transfer} disabled={!isLogin}>
          transfer
        </button>
        <button onClick={conv}>
          conv
        </button>
      </Router>
    </div>
  );
};

export default App;