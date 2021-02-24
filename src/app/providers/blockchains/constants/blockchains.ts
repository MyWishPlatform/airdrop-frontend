import {NETWORKS} from './networks';

export const ETHEREUM = {
  testnet: {
    providerParams: {
      providerAddress: 'https://kovan.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    },
    chainInfo: NETWORKS['ethereum:kovan']
  },
  mainnet: {
    providerParams: {
      providerAddress: 'https://mainnet.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    },
    chainInfo: NETWORKS['ethereum:mainnet']
  }
};


export const BINANCE = {
  testnet: {
    providerParams: {
      providerAddress: 'https://data-seed-prebsc-1-s2.binance.org:8545/',
    },
    chainInfo: NETWORKS['binance:testnet']
  },
  mainnet: {
    providerParams: {
      providerAddress: 'https://bsc-dataseed1.binance.org',
    },
    chainInfo: NETWORKS['binance:mainnet']
  }
};


export const TRON = {
  testnet: {
    providerParams: {
      fullNode: 'https://api.shasta.trongrid.io',
      solidityNode: 'https://api.shasta.trongrid.io',
      eventServer: 'https://api.shasta.trongrid.io',
      api: 'https://api.shasta.trongrid.io',
      privateKey: 'd6814d99156f78ea09b729f6ff2f01509fc80f29cdb2ecdeff59a81ca82b7477'
    },
    chainInfo: NETWORKS['tron:shasta']
  },
  mainnet: {
    providerParams: {
      fullNode: 'https://api.trongrid.io',
      solidityNode: 'https://api.trongrid.io',
      eventServer: 'https://api.trongrid.io',
      api: 'https://apilist.tronscan.org',
      privateKey: 'd6814d99156f78ea09b729f6ff2f01509fc80f29cdb2ecdeff59a81ca82b7477'
    },
    chainInfo: NETWORKS['tron:mainnet']
  }
};
