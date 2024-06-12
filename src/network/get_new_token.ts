import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { AppCodes } from "../models/app_resp_codes";

// Load environment variables from .env file
dotenv.config();
const max_tries_for_associated_token_account = 5;

const API_KEY = "ee3680cf-196e-475b-8f62-812d6b540435";

async function getTransactions(max_tries = 3): Promise<any> {
  if (max_tries == 0) {
    return AppCodes.FAILED_FETCHING_TRANSACTIONS;
  }
  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.helius.xyz/v0/addresses/6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P/transactions",
    params: {
      "api-key": API_KEY,
      limit: 1,
      type: "TOKEN_MINT",
    },
    headers: {},
  };

  try {
    const response: AxiosResponse = await axios(options);
    if (response.data.error) {
      console.error("Error:", response.data.error);
      await new Promise((f) => setTimeout(f, 1000));
      console.log("Retrying... fetcting new Token");

      console.log("Retrying... fetching new Token");
      return getTransactions(max_tries - 1);
    } else {
      return response.data;
    }
  } catch (error) {
    await new Promise((f) => setTimeout(f, 1000)); // Wait for 1 second before retrying
    console.log(`Retrying... due to request error ${error}`);
    return getTransactions(max_tries - 1);
  }
}
export { getTransactions };
