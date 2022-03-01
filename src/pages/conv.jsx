import { idlFactory as cyclesIDL } from "../candid/cycles.did"
import { Actor, HttpAgent } from "@dfinity/agent";
import axios from "axios";

const CYCLES_CANISTER_ID = "rkp4c-7iaaa-aaaaa-aaaca-cai";

export const icp2usd = async () => {
    let anonymousAgent = new HttpAgent({ ...{ host: 'https://boundary.ic0.app/' }});
    if (process.env.NODE_ENV !== "production") {
        await anonymousAgent.fetchRootKey()
    }
    let cycles = await Actor.createActor(cyclesIDL, {
        agent: anonymousAgent,
        canisterId: CYCLES_CANISTER_ID,
      });
    //@ts-ignore
    const res = await cycles.get_icp_xdr_conversion_rate();
    const fee = Number(res.data.xdr_permyriad_per_icp)/10000
    console.log("icp => xdr", fee);
    let xusd = await xdr2usd();
    console.log("xdr => usd", xusd);
    return fee * xusd;
  }
  
  const xdr2usd = () => {
    return axios.get('https://free.currconv.com/api/v7/convert', {
      params: {
        q: 'XDR_USD',
        compact: 'ultra',
        apiKey: '6daf11d9cd914eaa171e'
      }
    }).then(resp => {
      return resp.data.XDR_USD;
    }).catch(err => {
      console.log(err);
      return 0
    });
  }