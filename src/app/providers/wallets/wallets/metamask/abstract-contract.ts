import Web3 from 'web3';
import { WALLETS_NETWORKS } from '../../constants/networks';
import BigNumber from 'bignumber.js';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

const gasPricePercentage = 0.1;
const BINANCE_MIN_GAS_PRICE = 5000000000;

interface ResponseFormatIterface {
  safe: string,
  average: string,
  fast: string
}

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
    const apis = chainParams.apis;

    const requests = apis.reduce((acc, req) => {

      let requestUrl = `${req.url}?`;

      for (let param in req.params) {
        requestUrl += `${param}=${req.params[param]}&`
      }

      return [
        ...acc,
        this.httpClient.get(requestUrl).pipe(
          map((gasPrices: { result: ResponseFormatIterface } | ResponseFormatIterface) => {

            let multiplier = req.multiplier;

            if ('result' in gasPrices && typeof gasPrices.result === 'string') {

              if (multiplier) {

                return {
                  safe: new BigNumber(gasPrices.result).times(Math.pow(10, multiplier).toString(10)),
                  average: new BigNumber(gasPrices.result).times(Math.pow(10, multiplier).toString(10)),
                  fast: new BigNumber(gasPrices.result).times(Math.pow(10, multiplier).toString(10)),
                }

              }

              return {
                safe: new BigNumber(gasPrices.result),
                average: new BigNumber(gasPrices.result),
                fast: new BigNumber(gasPrices.result)
              }
            }

            if ('result' in gasPrices) {

              if (multiplier) {
                return {
                  safe: new BigNumber(gasPrices.result[req.responseFormat['result'].safe]).times(Math.pow(10, multiplier).toString(10)),
                  average: new BigNumber(gasPrices.result[req.responseFormat['result'].average]).times(Math.pow(10, multiplier).toString(10)),
                  fast: new BigNumber(gasPrices.result[req.responseFormat['result'].fast]).times(Math.pow(10, multiplier).toString(10)),
                }
              }

              return {
                safe: new BigNumber(gasPrices.result[req.responseFormat['result'].safe]),
                average: new BigNumber(gasPrices.result[req.responseFormat['result'].average]),
                fast: new BigNumber(gasPrices.result[req.responseFormat['result'].fast]),
              }
            }

            if (multiplier) {
              return {
                safe: new BigNumber(gasPrices[req.responseFormat.safe]).times(Math.pow(10, multiplier).toString(10)),
                average: new BigNumber(gasPrices[req.responseFormat.average]).times(Math.pow(10, multiplier).toString(10)),
                fast: new BigNumber(gasPrices[req.responseFormat.fast]).times(Math.pow(10, multiplier).toString(10)),
              }
            }

            return {
              safe: new BigNumber(gasPrices[req.responseFormat.safe]),
              average: new BigNumber(gasPrices[req.responseFormat.average]),
              fast: new BigNumber(gasPrices[req.responseFormat.fast]),
            }

          }),
          catchError((e) => of(null))
        )
      ]
    }, [])

    const results$ = forkJoin(requests)
      .subscribe(gasPrices => {

        for(let pr of gasPrices) {

          const rr: any = pr;

          for(let i in rr) {
            console.log(i, rr[i].valueOf())
          }

        }

      })
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
