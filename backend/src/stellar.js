const { SorobanRpc, Networks, Contract } = require('@stellar/stellar-sdk');

let _server = null;

function getServer() {
  if (!_server) {
    const url = process.env.STELLAR_RPC_URL;
    if (!url) throw new Error('STELLAR_RPC_URL is not set');
    _server = new SorobanRpc.Server(url);
  }
  return _server;
}

const networkPassphrase =
  process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;

function getContract(contractId) {
  return new Contract(contractId);
}

module.exports = { getServer, networkPassphrase, getContract };
