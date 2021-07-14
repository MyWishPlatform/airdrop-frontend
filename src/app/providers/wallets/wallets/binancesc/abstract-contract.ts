import Web3 from 'web3';
import {WALLETS_NETWORKS} from '../../constants/networks';
import BigNumber from 'bignumber.js';

const gasPricePercentage = 0.1;
const BINANCE_MIN_GAS_PRICE = 5000000000;

export class AbstractContract {
  protected contract;
  protected web3 = new Web3();
  protected walletAddress;
  private httpClient;

  constructor(
    protected binanceChain,
    private contractABI,
    protected contractAddress
  ) {
    this.contractAddress = contractAddress;
  }


  protected decodeMethod(methodName, params): any {
    const abiElement = this.contractABI.find((abiItem) => {
      return abiItem.name === methodName;
    });
    return this.web3.eth.abi.encodeFunctionCall(abiElement, params);
  }


  protected callMethod(walletAddress, methodName, params): Promise<any> {
    const data = this.decodeMethod(methodName, params);
    return this.binanceChain.request({
      method: 'eth_call',
      params: [{
        to: this.contractAddress,
        data,
      }]

    });
  }

  protected sendMethod(walletAddress, methodName, params, value?, gasPrice?, gas?, hashFunc?): Promise<any> {
    const data = this.decodeMethod(methodName, params);
    return this.binanceChain.request({
      method: 'eth_sendTransaction',
      params: [{
        to: this.contractAddress,
        from: walletAddress,
        value,
        gasPrice,
        gas,
        data,
      }]
    }).then((result) => {
      if (hashFunc) {
        hashFunc(result);
      }
      return this.checkTransaction(result);
    }, (err) => {
      console.log(err);
      return err;
    });
  }

  private checkTx(txHash, resolve, reject): void {
    return this.binanceChain.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    }).then((res) => {
      if (!res) {
        setTimeout(() => {
          this.checkTx(txHash, resolve, reject);
        }, 2000);
      } else if (res && res.blockNumber) {
        !res.status ? reject() : resolve(res);
      }
    }, (err) => {
      reject(err);
    });
  }

  public checkTransaction(txHash): Promise<any> {
    return new Promise((resolve, reject) => {
      this.checkTx(txHash, resolve, reject);
    });
  }

  protected async getBlock(): Promise<any> {
    return this.binanceChain.request({
      method: 'eth_blockNumber',
      params: []
    }).then((blockNumber) => {
      return this.binanceChain.request({
        method: 'eth_getBlockByNumber',
        params: [blockNumber, false]
      });
    });
  }

  protected async estimateGas(params): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const promise = this.binanceChain.request({
          method: 'eth_estimateGas',
          params
        }).then(resolve, reject);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });

  }


  public async getGasPrice(): Promise<any> {
    const chainParams = WALLETS_NETWORKS[+this.binanceChain.chainId];
    const apiUrl = chainParams.api;
    if (apiUrl) {
      const apikey = chainParams.apiKey.name + '=' + chainParams.apiKey.value;
      const requestUrl = apiUrl + '/api?module=' + (this.isBinance(chainParams.chain) ? 'proxy' : 'gastracker') + '&action=' + ( this.isBinance(chainParams.chain) ? 'eth_gasPrice' : 'gasoracle' ) + '&' + apikey;
      return this.httpClient.get(requestUrl).toPromise().then((data) => {
        const result = data.result;
        if (this.isBinance(chainParams.chain)) {
          const gasPrice = result > BINANCE_MIN_GAS_PRICE ? result.toString(10) : BINANCE_MIN_GAS_PRICE; 
          return [
            result > ( BINANCE_MIN_GAS_PRICE + 1000000000 ) ? ( gasPrice * (1 - gasPricePercentage) ) : BINANCE_MIN_GAS_PRICE, 
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
      });
    }

  }


  public setHttpClient(httpClient): void {
    this.httpClient = httpClient;
  }

  public isBinance(chain: string): boolean {
    return chain === 'binance';
  }

}
