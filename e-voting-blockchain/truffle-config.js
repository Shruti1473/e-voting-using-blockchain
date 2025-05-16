module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // Ganache default port
      network_id: "*",
      gas: 8000000, // Increased Gas Limit
      gasPrice: 20000000000,
    },
  },

  ignoreWarnings: [
    {
      module: /source-map-loader/,
    },
  ],

  compilers: {
    solc: {
      version: "0.8.21", // Ensure correct Solidity version
    },
  },
};
