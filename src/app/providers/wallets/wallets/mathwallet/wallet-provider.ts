import {Observable} from 'rxjs';
import Web3 from 'web3';
import {InterfaceAccount} from '../../wallets';
import {TokenContract} from './token-contract';
import {AirdropContract} from './airdrop-contract';

export class MathWalletService {
  private MathWalletWeb3: any;
  private MathWalletProvider;
  public connectedAccount: InterfaceAccount;
  public subscribers = [];

  constructor() {
    this.setMathWalletWeb3();
  }

  get isAvailable(): boolean {
    return this.MathWalletWeb3 && this.MathWalletWeb3?.isMathWallet;
  }

  private setMathWalletWeb3(): void {
    this.MathWalletWeb3 = (window as any).ethereum;
    if (this.MathWalletWeb3 && this.MathWalletWeb3?.isMathWallet ) {
      (window as any).ethereum.autoRefreshOnNetworkChange = false;
    }
    this.MathWalletProvider = Web3.givenProvider;
  }

  public getConnectedAccount(): Promise<InterfaceAccount> {
    return new Promise((resolve) => {
      if (this.isConnected()) {
        if (this.MathWalletWeb3.selectedAddress || this.MathWalletWeb3.address) {
          this.applyAccount().then(() => {
            resolve(this.connectedAccount);
          });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  public isConnected(): boolean {
    return this.MathWalletWeb3 &&
      (this.MathWalletWeb3?.isMathWallet) &&
      (this.MathWalletWeb3.selectedAddress || this.MathWalletWeb3.address ||
        (this.MathWalletWeb3.accounts ? this.MathWalletWeb3.accounts[0] : false));
  }

  private applyAccount(): Promise<InterfaceAccount> {
    return this.MathWalletWeb3.request({method: 'net_version'}).then((result) => {
      const address =
        this.MathWalletWeb3.selectedAddress ||
        this.MathWalletWeb3.address ||
        (this.MathWalletWeb3.accounts ? this.MathWalletWeb3.accounts[0] : false);
      if (address) {
        this.connectedAccount = {
          address,
          chainId: Number(result)
        };
      } else {
        this.connectedAccount = undefined;
      }
    });
  }

  public subscribe(cb): any {
    return new Observable((observer) => {
      this.subscribers.push(observer);
      observer.next(this.connectedAccount);
      this.iniEventsHandlers();
      return {
        unsubscribe: () => {
          this.MathWalletWeb3.removeAllListeners();
          this.subscribers = this.subscribers.filter((obs) => {
            return obs !== observer;
          });
        },
      };
    }).subscribe((acc) => {
      cb(acc);
    });
  }

  private iniEventsHandlers(): void {
    const applyAccount = (a?) => {
      this.applyAccount().then(() => {
        this.callAllSubscribers();
      });
    };
    this.MathWalletWeb3.on('chainChanged', applyAccount);
    this.MathWalletWeb3.on('accountsChanged', applyAccount);
    this.MathWalletWeb3.on('disconnect', applyAccount);
  }

  private callAllSubscribers(): void {
    this.subscribers.forEach((obs) => {
      obs.next(this.connectedAccount);
    });
  }

  public connect(killOldConnection?): Promise<any> {
    return new Promise((resolve, reject) => {

      const isConnected = this.isConnected();

      if (isConnected) {
        if (killOldConnection) {
          this.MathWalletWeb3.request({
            method: 'wallet_requestPermissions',
            params: [{eth_accounts: {}}],
          }).then(() => {
            resolve(null);
          }, () => {
            reject({});
          });
        } else {
          resolve(null);
        }
        return;
      }

      this.MathWalletWeb3.request({ method: 'eth_requestAccounts' }).then(() => {
        resolve(null);
      }, () => {
        reject({});
      });
    });
  }

  public getTokenContract(tokenAddress): any {
    return new TokenContract(this.MathWalletProvider, tokenAddress);
  }

  public getAirdropContract(): any {
    return new AirdropContract(this.MathWalletProvider);
  }

  public async getBalance(): Promise<any> {
    const web3 = new Web3(this.MathWalletProvider);
    return web3.eth.getBalance(this.connectedAccount.address);
  }
}
