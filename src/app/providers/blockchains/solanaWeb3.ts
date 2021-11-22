import * as solanaWeb3 from '@solana/web3.js';
import {Injectable} from '@angular/core';
import {SOLANA} from './constants/blockchains';
import Web3 from 'web3';
import * as splToken from '@solana/spl-token';

@Injectable({
  providedIn: 'root',
})
export class SolanaWeb3Service {
  private chainsProviders = {
    solana: SOLANA
  };
  constructor() {
  }

  private selectedChain: string;
  private isTestnet = true;
  private isDeflationary = false;
  private provider;

  public async getContract(address): Promise<any> {
      // console.log('3MoHgE6bJ2Ak1tEvTt5SVgSN2oXiwt6Gk5s6wbBxdmmN');
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
      const base58publicKey = new solanaWeb3.PublicKey(address);
      const resultTokenSupply = await connection.getTokenSupply(base58publicKey);

      return resultTokenSupply;
  }

  public setChain(chain: string): void {
    this.selectedChain = chain;
  }

  public setTestnet(isTestnet: boolean): void {
    this.isTestnet = isTestnet;
    this.setProvider();
  }

  private setProvider(): void {
    this.provider = this.chainsProviders[this.selectedChain][this.isTestnet ? 'mainnet' : 'testnet'];
  }

  public getExplorerLink(chain, isTestnet, address, type?): string {
    console.log(chain, isTestnet, address, type);
    type = type || 'address';
    const network = isTestnet ? 'testnet' : 'mainnet';
    const providerParams = this.chainsProviders[chain][network];

    switch (type) {
      case 'address':
        return `${providerParams.chainInfo.explorer}/address/${address}`;
      case 'token':
        return `${providerParams.chainInfo.explorer}/token/${address}`;
      case 'tx':
        return `${providerParams.chainInfo.explorer}/tx/${address}`;
    }
  }

  public getChainParams(): any {
    return this.provider.chainInfo;
  }

  public addressValidator = async (address: string) => {
    try {
      // console.log('3MoHgE6bJ2Ak1tEvTt5SVgSN2oXiwt6Gk5s6wbBxdmmN');
      // 'CnDBoxvmMh9axeLFZekjyV5ZrJaeLyNopShQ4zdBuURs'
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
      const base58publicKey = new solanaWeb3.PublicKey(address);
      const owner58 = new solanaWeb3.PublicKey('8DKrEMD4H6WWT18PSz2AbwsMcMyK51Vi7GJevS1kXzfF');
      const resultAddressValidator = await connection.getTokenSupply(base58publicKey);

      return !!resultAddressValidator;
    } catch (e) {
      return false;
    }
  }

  public accountValidator = async (address: string) => {
    try {
      console.log(address);
      // console.log('3MoHgE6bJ2Ak1tEvTt5SVgSN2oXiwt6Gk5s6wbBxdmmN');
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
      const base58publicKey = new solanaWeb3.PublicKey(address);
      const resultAddressValidator = await connection.getAccountInfo(base58publicKey);



      return !!resultAddressValidator;
    } catch (e) {
      return false;
    }
  }

  public getTokenInfo(address): any {

    return new Promise((resolve, reject) => {
      const contractModel = this.getContract(address);
      try {
        contractModel.then((res) => {
          resolve({
            decimals: res.value.decimals,
            symbol: ''
          });
        }).catch(() => {
          return reject();
        });
      } catch (e) {
        reject();
      }
    });
  }


}
