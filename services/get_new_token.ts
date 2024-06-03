import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const API_KEY = 'ee3680cf-196e-475b-8f62-812d6b540435';

const getTransactions = async () => {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: 'https://api.helius.xyz/v0/addresses/6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P/transactions',
    params: {
      'api-key': API_KEY,
      'limit': 1,
      'type': 'TOKEN_MINT'
    },
    headers: {}
  };

  try {
    const response: AxiosResponse = await axios(options);
    console.log(response.data);
    return response.data;
  } catch (error) {

    console.error('Error making the API request:', error);
    return -1;
  }
};
export {getTransactions}
