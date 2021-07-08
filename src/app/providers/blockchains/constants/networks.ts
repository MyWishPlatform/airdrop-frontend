export const NETWORKS = {
  'ethereum:mainnet': {
    chain: 'ethereum',
    icon: './assets/images/icons/coins/ethereum.svg',
    name: 'Ethereum Mainnet',
    explorer: 'https://etherscan.io',
    csvExample: './assets/csv-examples/ethereum.csv',
    chainId: 1,
    coin: 'ETH',
    etherscanAPI: 'https://api.etherscan.io/',
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
    etherscanAPI: 'https://api-kovan.etherscan.io/',
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
    coin: 'BNB'
  },
  'binance:testnet': {
    chain: 'binance',
    icon: './assets/images/icons/coins/binance.svg',
    name: 'Binance Smart Chain Testnet',
    explorer: 'https://testnet.bscscan.com',
    csvExample: './assets/csv-examples/binance.csv',
    chainId: 97,
    coin: 'tBNB'
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
    chain: '',
    icon: './assets/images/icons/coins/polygon.svg',
    name: 'Polygon Mainnet',
    explorer: '',
    csvExample: '',
    chainId: '',
    coin: ''
  },
  'polygon:mumbai': {
    chain: '',
    icon: './assets/images/icons/coins/polygon.svg',
    name: 'Polygon Mumbai Testnet',
    explorer: '',
    csvExample: '',
    chainId: '',
    coin: ''
  }
};
