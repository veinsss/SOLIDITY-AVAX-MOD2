# The Vault

The Vault is a decentralized web application built using Javascript and Solidity where it uses Ethereum as a currency. 

# Features
- An API call that collects the current price of Ethereum in the current market
- Multiplies the current balance of Ethereum into real world price (USD)
- Transanction History where it collects information about the recent transanctions made through the Web App

# Requirements 
- Javascript Package Managers
    - Yarn
    - NPM
- Metamask wallet (other wallets are not supported)

# Running the application
1. Clone the repository
```
git clone https://github.com/veinsss/SOLIDITY-AVAX-MOD2.git
```
2. Once done open the folder in your preferred code editor
3. Open a terminal in the location of the repository run yarn init || npm init
4. Set up your local blockchain npm hardhat node
5. Setup the startup scrpt for hardhat in order to gain 100 Ethereum npx hardhat run --network localhost scripts/deploy.js
6. On the terminal type npm run dev in order to start the front end locally
