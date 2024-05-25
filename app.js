const computationsAbi = require('./artifacts/contracts/Computations.sol/Computations.json');

async function execute() {
  // Connect to the network
  const url = 'http://localhost:8545';
  const customProvider = new ethers.JsonRpcProvider(url);

  let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const computationsContract = new ethers.Contract(contractAddress, computationsAbi.abi, customProvider);

  const num1 = 90;
  const num2 = 32;

  console.log(`The sum of ${num1} and ${num2} is: ${await computationsContract.sum(90, 32)}`);
}

execute().then();
