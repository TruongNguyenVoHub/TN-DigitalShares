npm i @openzeppelin/contracts
npm i @chainlink/contracts

npx hardhat ignition deploy ignition/modules/StockToken.ts --network sepolia
npx hardhat verify --network sepolia contract_address [constructor_arguments] or npx hardhat ignition verify chain-11155111 --network sepolia

