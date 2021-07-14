import Web3 from 'web3';
import { WALLETS_NETWORKS } from '../../constants/networks';
import BigNumber from 'bignumber.js';

const gasPricePercentage = 0.1;
const BINANCE_MIN_GAS_PRICE = 5000000000;

export class AbstractContract {
  protected contract;
  protected web3 = new Web3();
  protected walletAddress;
  protected contractAddress;

  private httpClient;

  constructor(
    protected web3Provider,
    contractABI,
    contractAddress
  ) {
    this.web3.setProvider(web3Provider);
    this.contractAddress = contractAddress;
    this.walletAddress = web3Provider.selectedAddress;
    this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
  }

  public async getGasPrice(): Promise<any> {
    const chainParams = WALLETS_NETWORKS[+this.web3Provider.chainId];
    const apiUrl = chainParams.api;
    if (apiUrl) {
      const apikey = chainParams.apiKey.name + '=' + chainParams.apiKey.value;
      const requestUrl = apiUrl + '/api?module=' + (this.isEthereum(chainParams.chain) ? 'gastracker' : 'proxy') + '&action=' + (this.isEthereum(chainParams.chain) ? 'gasoracle' : 'eth_gasPrice') + '&' + apikey;
      return this.httpClient.get(requestUrl).toPromise().then((data) => {
        const result = data.result;
        if (!this.isEthereum(chainParams.chain)) {

          let gasPrice = result.toString(10);

          if (chainParams.chain === 'binance') {
            gasPrice = result > BINANCE_MIN_GAS_PRICE ? result.toString(10) : BINANCE_MIN_GAS_PRICE;
            return [
              result > (BINANCE_MIN_GAS_PRICE + 1000000000) ? (gasPrice * (1 - gasPricePercentage)) : BINANCE_MIN_GAS_PRICE,
              gasPrice,
              gasPrice * (1 + gasPricePercentage)
            ];
          }

          return [
            gasPrice * (1 - gasPricePercentage),
            gasPrice,
            gasPrice * (1 + gasPricePercentage)
          ];

        } else {
          return [
            new BigNumber(result?.SafeGasPrice).times(Math.pow(10, 9)).toString(10),
            new BigNumber(result?.ProposeGasPrice).times(Math.pow(10, 9)).toString(10),
            new BigNumber(result?.FastGasPrice).times(Math.pow(10, 9)).toString(10)
          ];
        }
      }).catch(e => console.error(e));
    }
  }

  private checkTx(txHash, resolve, reject): void {
    this.web3.eth.getTransactionReceipt(txHash, (err, res) => {
      if (err || (res && res.blockNumber && !res.status)) {
        reject(err);
      } else if (res && res.blockNumber) {
        resolve(res);
      } else if (!res) {
        setTimeout(() => {
          this.checkTx(txHash, resolve, reject);
        }, 2000);
      } else { }
    });
  }

  public checkTransaction(txHash): Promise<any> {
    return new Promise((resolve, reject) => {
      this.checkTx(txHash, resolve, reject);
    });
  }

  public setHttpClient(httpClient): void {
    this.httpClient = httpClient;
  }

  public isEthereum(chain: string): boolean {
    return chain === 'ethereum';
  }

}
