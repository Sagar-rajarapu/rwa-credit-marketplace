const { SorobanRpc, Networks, Contract } = require('@stellar/stellar-sdk');

const server = new SorobanRpc.Server(process.env.STELLAR_RPC_URL);
const networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;

function getContract(contractId) {
  return new Contract(contractId);
}

module.exports = { server, networkPassphrase, getContract };
