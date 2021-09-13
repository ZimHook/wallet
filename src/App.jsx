import React, { Component, useState, useEffect } from "react";
import Login from "./pages/Login";
import history from "./History";
import { principalToAccountAddress, rosettaApi} from './utils.jsx';
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
    var icpBalance = await rosettaApi.getAccountBalance(principalToAccountAddress(principal_id));   //获取用户的ICP余额
    var icpBalanceString = icpBalance.toString();   
    console.log(icpBalanceString);
    setBalance(icpBalanceString);
    setIsLogin(true);
    console.log("login success");
    const agent = new HttpAgent({
      identity: identity,
      host: "http://localhost:8000",
    });
    console.log(agent);
    await agent.fetchRootKey();
    console.log("fetchRootKey");
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
        "http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai",
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
          address : {isLogin ? principalToAccountAddress(principalString) : 'not logged in'}
          <br/> 
          ICP balance : {isLogin ? balance : 'not logged in'}
        </h2>
      </Router>
    </div>
  );
};

export default App;