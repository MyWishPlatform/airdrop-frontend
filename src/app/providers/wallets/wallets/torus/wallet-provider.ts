import {Observable} from 'rxjs';
import Web3 from 'web3';
import {InterfaceAccount} from '../../wallets';
import Torus from '@toruslabs/torus-embed';
import OpenLogin from '@toruslabs/openlogin';
import { AbstractProvider } from 'web3-core';
import { AbiType, StateMutabilityType } from 'web3-utils';

import { TORUS_BUILD_ENV_TYPE, VerifierArgs } from '@toruslabs/torus-embed';
import {TokenContract} from './token-contract';
import {AirdropContract} from './airdrop-contract';

import web3Obj from '../torus/helper/helper';

export class TorusService {
  private torus: any;
  private torusWeb3: any;
  public torusProvider;
  public connectedAccount: InterfaceAccount;
  public subscribers = [];
  public publicAddress;
  public chainId;
  public buildEnv = 'testing' as TORUS_BUILD_ENV_TYPE;

  constructor() {
    this.torus = new Torus();
    this.torusWeb3 = new Web3(this.torus.provider);
  }

  get isAvailable(): boolean {
    return true;
  }

  public async connect(): Promise<any> {
    const { torus, web3 } = web3Obj;

    const isConnected = this.isConnected();

    if (isConnected) {
        await torus.logout();
    }

    await torus.init({
      buildEnv: this.buildEnv,
      enabledVerifiers: {
        reddit: false,
      },
      enableLogging: true,
      network: {
        host: 'kovan', // mandatory
        chainId: 42,
        // chainId: 336,
        networkName: 'Kovan',
        // host: 'https://quorum.block360.io/https',
        // ticker: 'DES',
        // tickerName: 'DES Coin',
      },
      showTorusButton: true,
      integrity: {
        // version: '1.11.0',
        check: false,
        // hash: 'sha384-jwXOV6VJu+PM89ksbCSZyQRjf5FdX8n39nWfE/iQBMh4r5m027ua2tkQ+83FPdp9'
      },
      loginConfig:
        this.buildEnv === 'lrc'
          ? {
            'torus-auth0-email-passwordless': {
              name: 'torus-auth0-email-passwordless',
              typeOfLogin: 'passwordless',
              showOnModal: false,
            },
          }
          : undefined,
      skipTKey: true,
    });
    await torus.login();
    web3Obj.setweb3(torus.provider);
    // @ts-ignore
    console.log(torus.provider);
    this.torusProvider = torus.provider;
    torus.provider.on('chainChanged', (resp) => {
      console.log(resp, 'chainchanged');
      this.chainId = parseInt(resp as string, 10);
    });
    torus.provider.on('accountsChanged', (accounts) => {
      console.log(accounts, 'accountsChanged');
      this.publicAddress = (Array.isArray(accounts) && accounts[0]) || '';
    });
    const userInfo = await torus.getUserInfo('');
    this.publicAddress = await torus.getPublicAddress({
      verifier: 'google',
      verifierId: userInfo.verifierId,
    });
  }

  public isConnected(): any {
    return !!this.publicAddress;
  }

  public getConnectedAccount(): Promise<InterfaceAccount> {
    return new Promise((resolve) => {
      if (this.isConnected()) {
        if (this.publicAddress) {
          this.applyAccount();
          resolve(this.connectedAccount);
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  private async applyAccount(): Promise<any> {
    this.connectedAccount = {
      address: this.publicAddress,
      chainId: 42,
    };
  }

  public subscribe(cb): any {
    return new Observable((observer) => {
      this.subscribers.push(observer);
      observer.next(this.connectedAccount);
      this.iniEventsHandlers();
      return {
        unsubscribe: () => {
          // this.torusWeb3.removeAllListeners();
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
    applyAccount();
  }

  private callAllSubscribers(): void {
    this.subscribers.forEach((obs) => {
      obs.next(this.connectedAccount);
    });
  }

  public getTokenContract(tokenAddress): any {
    const web3Provider = this.torusProvider;
    return new TokenContract(web3Provider, tokenAddress);
  }

  public getAirdropContract(): any {
    const web3Provider = this.torusProvider;
    return new AirdropContract(web3Provider);
  }

  public async getBalance(): Promise<any> {
    console.log(229,  web3Obj.web3, this.connectedAccount.address);
    return web3Obj.web3.eth.getBalance(this.connectedAccount.address, '');
  }


}
