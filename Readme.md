# Solana Sniper Bot for Pump.fun

This is a Solana sniper bot designed for purchasing new token launches on the Solana blockchain, specifically targeting the Pump.fun platform. The bot helps users to grab early shares of meme tokens during launches, maximizing the chances of securing tokens at the best possible price. It is built using TypeScript and Node.js, leveraging the web3 library for blockchain interactions, and Helius API for node connection, while directly transacting with Pump.fun to avoid unnecessary fees from third-party API providers such as PumpPortal.

## Features

- **Token Sniping**: Automatically purchases new token launches on Pump.fun to grab early shares of meme tokens.
- **Direct Transactions**: Avoid third-party fees by interacting directly with the Pump.fun platform on the Solana blockchain.
- **Web3 Integration**: Connects to Solana blockchain using the web3 library for efficient token operations.
- **Helius API**: Connects to the Solana node for reliable blockchain communication.
- **Solana Token Program**: Facilitates token-related operations like purchasing and transferring tokens.

## Technologies Used

- **Node.js**
- **TypeScript**
- **Web3.js**
- **Solana Token Program**
- **Helius API**

## Installation Guide

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **Solana CLI** (optional, but helpful for blockchain operations)

### Step 1: Clone the Repository

```bash
git clone <https://github.com/wajahat414/solana-sniper-bot-pump-fun>
cd solana-sniper-bot-pump-fun
```

### Step 2: Install Dependencies

Install the required Node.js packages by running:

```bash
npm install
```

### Step 3: Set Up Wallets

1. Create a directory named `wallet` inside the project root.
2. Add your Solana wallet keypair files in the `wallet` directory. The bot will use these wallets to execute transactions on the blockchain.

### Step 4: Configure Environment Variables

Create a `.env` file in the project root and add the following variables:

```
SOLANA_CLUSTER=mainnet-beta
HELIUS_API_KEY=<Your Helius API Key>
WALLET_PATH=wallet/<Your-Wallet-File>.json
```

Replace `<Your Helius API Key>` with your API key from Helius, and `<Your-Wallet-File>.json` with the correct wallet file name.

### Step 5: Run the Bot

Once everything is set up, you can start the bot using:

```bash
npm run start
```

The bot will begin monitoring new token launches on Pump.fun and attempt to snipe early shares of new tokens.

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a clear explanation of your changes.

Please make sure your contributions align with the project's overall goals and coding standards.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
