export const NETWORKS = {
  'ethereum:mainnet': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Mainnet',
    explorer: 'https://etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 1,
    coin: 'ETH',
    api: 'https://api.etherscan.io/',
    apiKey: {
      name: 'apikey',
      value: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
    }
  },
  'ethereum:ropsten': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Ropsten Testnet',
    explorer: 'https://ropsten.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 3,
    coin: 'rETH'
  },
  'ethereum:rinkeby': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Rinkeby Testnet',
    explorer: 'https://rinkeby.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 4,
    coin: 'rETH'
  },
  'ethereum:kovan': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Kovan Testnet',
    explorer: 'https://kovan.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 42,
    coin: 'kETH',
    api: 'https://api-kovan.etherscan.io/',
    apiKey: {
      name: 'apikey',
      value: 'FHD3PHDXXPVBDCBT36DX8IUCDGM66756BD'
    }
  },
  'ethereum:goerli': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Goerli Testnet',
    explorer: 'https://goerli.etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 5,
    coin: 'gETH'
  },
  'binance:mainnet': {
    chain: 'binance',
    icon: './assets/images/icons/coins/binance.svg',
    name: 'Binance Smart Chain Mainnet',
    explorer: 'https://bscscan.com',
    csvExample: './assets/csv-examples/binance.csv',
    chainId: 56,
    coin: 'BNB',
    api: 'https://api.bscscan.com',
    apiKey: {
      name: 'apikey',
      value: 'DKJ7CFIZ14QC9RZ4SJ5ZYD3YQAKJ5D6WED'
    }
  },
  'binance:testnet': {
    chain: 'binance',
    icon: './assets/images/icons/coins/binance.svg',
    name: 'Binance Smart Chain Testnet',
    explorer: 'https://testnet.bscscan.com',
    csvExample: './assets/csv-examples/binance.csv',
    chainId: 97,
    coin: 'tBNB',
    api: 'https://api-testnet.bscscan.com',
    apiKey: {
      name: 'apikey',
      value: 'DKJ7CFIZ14QC9RZ4SJ5ZYD3YQAKJ5D6WED'
    }
  },
  'tron:mainnet': {
    chain: 'tron',
    icon: './assets/images/icons/coins/tron.svg',
    name: 'TRON Mainnet',
    explorer: 'https://tronscan.org/',
    csvExample: './assets/csv-examples/tron.csv',
    chainId: 'tron:mainnet',
    coin: 'TRON'
  },
  'tron:shasta': {
    chain: 'tron',
    icon: './assets/images/icons/coins/tron.svg',
    name: 'TRON Shasta Testnet',
    explorer: 'https://shasta.tronscan.org',
    csvExample: './assets/csv-examples/tron.csv',
    chainId: 'tron:shasta',
    coin: 'sTRON'
  },
  'polygon:mainnet': {
    chain: 'polygon',
    icon: './assets/images/icons/coins/polygon.svg',
    name: 'Polygon Mainnet',
    explorer: 'https://polygonscan.com',
    csvExample: './assets/csv-examples/polygon.csv',
    chainId: 137,
    coin: 'MATIC',
    api: 'https://gasstation-mainnet.matic.network/',
    apiKey: {
      name: 'apikey',
      value: 'MTG1UGK2SCNNMYFSAPJTU8YPZSQCZU841Q'
    }
  },
  'polygon:testnet': {
    chain: 'polygon',
    icon: './assets/images/icons/coins/polygon.svg',
    name: 'Polygon Mumbai Testnet',
    explorer: 'https://mumbai.polygonscan.com/',
    csvExample: './assets/csv-examples/polygon.csv',
    chainId: 80001,
    coin: 'MATIC',
    api: 'https://api-testnet.polygonscan.com',
    apiKey: {
      name: 'apikey',
      value: 'MTG1UGK2SCNNMYFSAPJTU8YPZSQCZU841Q'
    }
  }
};

