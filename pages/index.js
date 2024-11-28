import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import atm_abi from '../artifacts/contracts/Assessment.sol/Assessment.json';

export default function HomePage() {
    const [ethWallet, setEthWallet] = useState(undefined);
    const [account, setAccount] = useState(undefined);
    const [atm, setATM] = useState(undefined);
    const [balance, setBalance] = useState(undefined);

    // Created use states
    // This gets the current price of Eth using an API call
    const [ethPrice, setEthPrice] = useState(null);
    // Sets the input for deposit to be any positive number
    const [depositAmount, setDepositAmount] = useState('');
    // Sets the input for withdraw to be any positive number
    const [withdrawAmount, setWithdrawAmount] = useState('');
    // Records each transanctions
    const [transactionHistory, setTransactionHistory] = useState([]);

    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const atmABI = atm_abi.abi;

    const getWallet = async () => {
        if (window.ethereum) {
            setEthWallet(window.ethereum);
        }

        if (ethWallet) {
            const account = await ethWallet.request({ method: 'eth_accounts' });
            handleAccount(account);
        }
    };

    const handleAccount = (account) => {
        if (account) {
            console.log('Account connected: ', account);
            setAccount(account);
        } else {
            console.log('No account found');
        }
    };

    const connectAccount = async () => {
        if (!ethWallet) {
            alert('MetaMask wallet is required to connect');
            return;
        }

        const accounts = await ethWallet.request({
            method: 'eth_requestAccounts',
        });
        handleAccount(accounts);

        // once wallet is set we can get a reference to our deployed contract
        getATMContract();
    };

    const getATMContract = () => {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const signer = provider.getSigner();
        const atmContract = new ethers.Contract(
            contractAddress,
            atmABI,
            signer,
        );

        setATM(atmContract);
    };

    const getBalance = async () => {
        if (atm) {
            setBalance((await atm.getBalance()).toNumber());
        }
    };

    // const deposit = async () => {
    //     if (atm) {
    //         let tx = await atm.deposit(1);
    //         await tx.wait();
    //         getBalance();
    //     }
    // };

    // const withdraw = async () => {
    //     if (atm) {
    //         let tx = await atm.withdraw(1);
    //         await tx.wait();
    //         getBalance();
    //     }
    // };

    // if statement checks first if atm is defined in the wallet and if there is an amount of eth to be deposited
    // the number deposit amount converts the value and typecase it into a number
    // if it is sucessful the getbalance() updates the users current balance into the new one
    // set deposit amount just clears the input field after the succesful deposit
    // set transanction history just records the number that is deposited and puts the most recent transanction into the transanction history window
    // used a try catch as well ot catch any type of error occuring it logs and displays a notification to the user
    const Deposit = async () => {
        if (atm && depositAmount) {
            try {
                let tx = await atm.deposit(Number(depositAmount));
                await tx.wait();
                getBalance();
                setDepositAmount(''); 
                setTransactionHistory([
                    ...transactionHistory,
                    `Deposited ${depositAmount} ETH`,
                ]);
            } catch (error) {
                console.error('Deposit failed:', error);
                alert('Deposit failed. Please check the amount and try again.');
            }
        }
    };

    const Withdraw = async () => {
        if (atm && withdrawAmount) {
            try {
                let tx = await atm.withdraw(Number(withdrawAmount));
                await tx.wait();
                getBalance();
                setWithdrawAmount(''); 
                setTransactionHistory([
                    ...transactionHistory,
                    `Withdrew ${withdrawAmount} ETH`,
                ]);
            } catch (error) {
                console.error('Withdrawal failed:', error);
                alert(
                    'Withdrawal failed. Please check the amount and try again.',
                );
            }
        }
    };

    // uses the use state
    // it fetches the eth price via api call
    // waits till the fetchEthPrice functions gets the price of Eth
    // state updates the price with the fetched price
    useEffect(() => {
        const getPrice = async () => {
            const price = await fetchEthPrice();
            setEthPrice(price);
        };
        getPrice();
    }, []);

    // calls the api to get the current value of Eth
    // the structure of the api is the following
    // {"ethereum":{"usd":3609.67}}
    // conts data just parses what the api sends into a javascript object

    const fetchEthPrice = async () => {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        );
        const data = await response.json();
        return data.ethereum.usd;
    };

    // functions calculates the balance of the wallet into the current balance of eth
    // accepts ethprice and balance as parameters
    // if statement first checks if both of the variables have variables if not it is going to throw in a calculating statement
    // it just returns the current price of eth multiplies it by the amount in the wallet with 2 decimal places
    const calculateTotalValue = (balance, ethPrice) => {
        if (balance !== null && ethPrice !== null) {
            return (balance * ethPrice).toFixed(2);
        }
        return 'Calculating...';
    };

    const initUser = () => {
        // Check to see if user has Metamask
        if (!ethWallet) {
            return <p>Please install Metamask in order to use this ATM.</p>;
        }

        // Check to see if user is connected. If not, connect to their account
        if (!account) {
            return (
                <button onClick={connectAccount}>
                    Please connect your Metamask wallet
                </button>
            );
        }

        if (balance == undefined) {
            getBalance();
        }

        // instead of using an external css file I just decided to use inline instead of creating a separate file

        return (
            <div>
                <p>Your Account: {account}</p>
                <p>Your Balance: {balance}</p>
                <p>Current ETH Price: ${ethPrice || 'Loading...'}</p>
                <p>
                    Total Wallet Value: $
                    {calculateTotalValue(balance, ethPrice)}
                </p>

                {/* create an input box with the following elements type, value, onchange, plcaeholder, min, step, classname
                
                for the type it just sets what the input is 
                value just sets the input to be the variable of deposit amount
                on change is what happens if I press the submit button
                placeholder just sets the text before any kind of input 
                min just sets the minimum value to be accepted to be 0 
                set just sets it so it can take decimals
                and classname just sets the CSS style  this is also similar structure to my withdraw statement but instead it uses the withdraw function instead of deposit */}
                
             
                <div className="input-container">
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter deposit amount"
                        min="0"
                        step="0.1"
                        className="rounded-input"
                    />
                    <button onClick={Deposit} className="rounded-button">
                        Deposit
                    </button>
                    <style jsx>
                        {`
                            .input-container {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                margin-top: 20px;
                            }

                            .rounded-input {
                                width: 300px;
                                height: 20px;
                                border-radius: 10px;
                                border: 2px solid #ccc;
                                padding: 10px;
                                font-size: 16px;
                                margin-bottom: 15px;
                                outline: none;
                            }

                            .rounded-input:focus {
                                border-color: #007bff;
                                box-shadow: 0 0 8px rgba(0, 123, 255, 0.6);
                            }

                            .rounded-button {
                                width: 150px;
                                height: 30px;
                                border-radius: 20px;
                                border: none;
                                background-color: #007bff;
                                color: white;
                                font-size: 16px;
                                cursor: pointer;
                                transition: background-color 0.3s ease;
                            }

                            .rounded-button:hover {
                                background-color: #0056b3;
                            }
                        `}
                    </style>
                </div>

                <div className="input-container">
                    <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter withdraw amount"
                        min="0"
                        step="0.1"
                        className="rounded-input"
                    />
                    <button onClick={Withdraw} className="rounded-button">
                        Withdraw
                    </button>
                    <style jsx>
                        {`
                            .input-container {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                margin-top: 20px;
                            }

                            .rounded-input {
                                width: 300px;
                                height: 20px;
                                border-radius: 10px;
                                border: 2px solid #ccc;
                                padding: 10px;
                                font-size: 16px;
                                margin-bottom: 15px;
                                outline: none;
                            }

                            .rounded-input:focus {
                                border-color: #007bff;
                                box-shadow: 0 0 8px rgba(0, 123, 255, 0.6);
                            }

                            .rounded-button {
                                width: 150px;
                                height: 30px;
                                border-radius: 20px;
                                border: none;
                                background-color: #007bff;
                                color: white;
                                font-size: 16px;
                                cursor: pointer;
                                transition: background-color 0.3s ease;
                            }

                            .rounded-button:hover {
                                background-color: #0056b3;
                            }
                        `}
                    </style>
                </div>

                <div className="transaction-history-container">
                    <h3>Transaction History</h3>
                    <ul className="transaction-history">
                        {transactionHistory.length > 0 ? (
                            transactionHistory.map((transaction, index) => (
                                <li key={index}>{transaction}</li>
                            ))
                        ) : (
                            <li>No transactions yet.</li>
                        )}
                    </ul>
                    <style jsx>
                        {`
                            .transaction-history-container {
                                margin-top: 40px;
                                padding: 20px;
                                border: 2px solid #ccc;
                                border-radius: 10px;
                                width: 80%;
                                max-width: 600px;
                                margin-left: auto;
                                margin-right: auto;
                            }

                            .transaction-history-container h3 {
                                margin-bottom: 15px;
                                font-size: 20px;
                                font-weight: bold;
                                text-align: center;
                            }

                            .transaction-history {
                                list-style: none;
                                padding: 0;
                                font-size: 16px;
                            }

                            .transaction-history li {
                                padding: 8px 0;
                                border-bottom: 1px solid #ddd;
                            }

                            .transaction-history li:last-child {
                                border-bottom: none;
                            }
                        `}
                    </style>
                </div>
            </div>
        );
    };

    useEffect(() => {
        getWallet();
    }, []);

    return (
        <main className="container">
            <header>
                <h1>Welcome to the Metacrafters ATM!</h1>
            </header>
            {initUser()}
            <style jsx>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Parkinsans:wght@300..800&display=swap');
                    .container {
                        text-align: center;
                        font-family: 'Parkinsans';
                    }
                    h1 {
                        font-weight: 700;
                    }
                `}
            </style>
        </main>
    );
}
