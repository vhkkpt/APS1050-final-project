# APS 1050 Project: Book Store - Instruction for Setup

> Zhenyuan Xiang, 1006739488

## Version Info

| Name        | Version          |
| ----------- | ---------------- |
| Node.js     | 12.13.0          |
| lite-server | 2.4.0            |
| Solidity    | 0.5.16 (solc-js) |
| web3        | 0.19.0           |
| Truffle     | 5.1.10           |
| Ganache     | 2.7.1            |

Front-end framework: JQuery.

System: Windows 10 (x64)



## Setup Environment

### 1. Install Node.Js

[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

### 2. Install Truffle

```bash
npm uninstall -g truffle
npm install -g truffle@v5.1.10
```

### 3. Install Liteserver

```bash
npm install -g lite-server
```

### 4. Install Ganache

[http://truffleframework.com/ganache](http://truffleframework.com/ganache)

Open Ganache, new workspace: bookstore, then ADD PROJECT: navigate and select `truffle-config.js` in the project directory.

Save workspace.

### 5. Install Metamask

[https://metamask.io/download.html](https://metamask.io/download.html)

Open the Metamask tab in your browser, click get started and "No, I already have a seed phrase".

Click import using account seed phrase.

Copy the MNEMONIC from Ganache and paste it into the text box under: “Enter your secret twelve word phrase here to restore your vault. Seed phrase”.

Confirm a password, then import.

Open "Main Ethereum Network" dropdown list, add a new network (Custom RPC).

Copy RPC server address from Ganache (`HTTP://127.0.0.1:7545` by default), and paste it to New RPC URL Chain ID field.

Save.

Then change your network to the newly added one if needed.

### 6. Change Recipient

Open `Contracts/BookStore.sol`, find `address payable constant recipient`, change the address to your recipient address.

Open a terminal in the project root directory. You can do this on Windows by typing "cmd" in the file explorer address bar then hit enter.

Run command:

```bash
truffle migrate --reset
```

### 7. Start Web Service

In the terminal, run command:

```bash
npm run dev
```

Then the service should be running at [http://localhost:3000/](http://localhost:3000/), and you should be able to access it in your browser.
