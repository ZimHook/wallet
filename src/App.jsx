import React, { Component, useState, useEffect } from "react";
import Login from "./pages/Login";
import history from "./History";
import { principalToAccountAddress, rosettaApi, to32bits} from './utils.jsx';
import {ledgerIDL} from './candid/ledger.did.js';
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { BrowserRouter, Route, Switch, Link, Router } from "react-router-dom";
import "./App.css";

const App = () => {
  const [principalString, setPrincipalString] = useState("");
  const [balance, setBalance] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  var authClient = null;
  var authActor = null;
  var identity = null;
  const goToLoginPage = () =>
    history.push({
      pathname: "/login",
    });

    
  async function handleAuthenticated(authClient) {      //登陆后的主要操作
    history.push({ pathname: "/home" });
    identity = await authClient.getIdentity();
    // authActor = await Actor.create;
    var principal_id = identity.getPrincipal().toText();    //获取用户的Principal
    console.log(principal_id);
    setPrincipalString(principal_id);
    var icpBalance = await rosettaApi.getAccountBalance(principalToAccountAddress(principal_id, 0));   //获取用户的ICP余额
    var icpBalanceString = icpBalance.toString();   
    console.log(icpBalanceString);
    setBalance(icpBalanceString);
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
    
    var args = {'account' : principalToAccountAddress(principal_id, 0)};
    var test = await ledgerAuthActor.account_balance_dfx(args);
    console.log(test);

    var args2 = {
      'to' : "3eeb9be63bad108529004dcea20318618fadda9226c7729dc531572134ff9fb8",
      "fee" : { "e8s" : 10000 },
      'memo' : 0,
      "from_subaccount" : [Array(28).fill(0).concat(to32bits(0))], 
      'created_at_time' : [],
      "amount" : { "e8s" : 10000 },
    };
    var height = await ledgerAuthActor.send_dfx(args2);
    console.log(height);
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


  const handleLogin = async () => {
    console.log("handle login");
    const authClient = await AuthClient.create();
    await authClient.login({
      onSuccess: async () => {
        handleAuthenticated(authClient);
      },
      identityProvider:
      "https://identity.ic0.app/",
    });
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
          ICP balance : {isLogin ? balance : 'not logged in'}
        </h2>
      </Router>
    </div>
  );
};

export default App;