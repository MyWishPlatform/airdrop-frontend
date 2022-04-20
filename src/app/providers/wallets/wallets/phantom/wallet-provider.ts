import {Observable} from 'rxjs';
import Web3 from 'web3';
import {InterfaceAccount} from '../../wallets';
// import {TokenContract} from '../phantom/token-contract';
import {AirdropContract} from '../metamask/airdrop-contract';
import * as solanaWeb3 from '@solana/web3.js';
// import {TokenContract} from './token-contract';
// import {AirdropContract} from './airdrop-contract';

export class PhantomService {
  private phantom: any;
  private isConnectedState: boolean;

  public connectedAccount: InterfaceAccount;
  public subscribers = [];

  constructor() {
    this.phantom = (window as any).solana;
    this.phantom.on('disconnect', () => console.log("disconnected!"));
  }

  public subscribe(cb): any {
    // console.log('subscribe');
    return new Observable((observer) => {
      this.subscribers.push(observer);
      return {
        unsubscribe: () => {
          this.subscribers = this.subscribers.filter((obs) => {
            return obs !== observer;
          });
        },
      };
    }).subscribe((acc) => {
      cb(acc);
    });
  }

  private callAllSubscribers(): void {
    // console.log('callAllSubscribers');
    this.subscribers.forEach((obs) => {
      obs.next(this.connectedAccount);
    });
  }

  public isAvailable(): boolean {
   this.phantom = (window as any).solana;
   // console.log('isAvailable', !!this.phantom);
   return !!this.phantom;
  }

  public async isConnected(): Promise<boolean> {
    console.log('isConnected', 'isAvailable', this.isAvailable, 'connectedAccount', !!this.connectedAccount);
    return this.isAvailable && !!this.connectedAccount;
  }

  private async applyAccount(): Promise<any> {
    // console.log('applyAccount');
    const chainId = 103;
    const address = await this.phantom.publicKey.toString();

    return new Promise((resolve) => {
      if (address) {
        this.connectedAccount = {
          address,
          chainId: Number(chainId),
        };
      } else {
        this.connectedAccount = undefined;
      }
      resolve(null);
    });
  }

  public getConnectedAccount(): Promise<InterfaceAccount> {
    // console.log('getConnectedAccount');
    return new Promise(async (resolve) => {
      const isConnected = await this.isConnected();
      if (isConnected) {
        this.iniEventsHandlers();
        resolve(this.connectedAccount);
      } else {
        resolve(null);
      }
    });
  }

  private iniEventsHandlers(): void {
    console.log('iniEventHandlers');
    const applyAccount = () => {
      this.applyAccount().then(() => {
        this.callAllSubscribers();
      });
    };
    if (!this.isConnectedState) {
      this.phantom.on('chainChanged', applyAccount);
      this.phantom.on('accountsChanged', applyAccount);
      this.phantom.on('disconnect', applyAccount);
      this.isConnectedState = true;
    }
    applyAccount();
  }

  public connect(): Promise<any> {
    console.log('connect');
    return new Promise(async (resolve, reject) => {
      this.phantom.connect();
      this.phantom.on('connect', () => {
        this.iniEventsHandlers();
        resolve(null);
      });
    });
  }

  public getTokenContract(tokenAddress): any {
    // return new TokenContract(this.phantom, tokenAddress, this.connectedAccount);
  }

  public getAirdropContract(): any {
    return new AirdropContract(this.phantom);
  }

  public async getBalance(): Promise<any> {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
    const owner58 = new solanaWeb3.PublicKey(this.connectedAccount.address);
    return connection.getBalance(owner58);
  }
}