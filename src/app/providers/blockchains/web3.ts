import {Injectable} from '@angular/core';
import {ETHEREUM, BINANCE, POLYGON, TRON} from './constants/blockchains';
import Web3 from 'web3';
import {AbstractControl} from '@angular/forms';
import {ERC20_TOKEN_ABI} from './constants/erc20';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private chainsProviders = {
    ethereum: ETHEREUM,
    binance: BINANCE,
    polygon: POLYGON
  };

  private isTestnet = false;
  private ethereumTestnet: string | undefined;
  private isDeflationary = false;
  private selectedChain: string;
  private provider;
  private chainClient: Web3;

  constructor() {
  }

  public setChain(chain: string, net?: string): void {
    if (net) this.ethereumTestnet = net;
    this.selectedChain = chain;
  }

  public setTestnet(isTestnet: boolean, net?: string): void {
    console.log('web3 setTestnet net', net);
    this.ethereumTestnet = net;
    this.isTestnet = isTestnet;
    this.setProvider();
  }

  public setDeflationary(isDeflationary: boolean): void {
    this.isDeflationary = isDeflationary;
  }

  private setProvider(): void {
    this.provider = this.chainsProviders[this.selectedChain][this.isTestnet ? 'testnet' : 'mainnet'];
    if (this.selectedChain === 'ethereum' && this.isTestnet) {
      const net = this.ethereumTestnet?.split(' ')[0].toLowerCase();
      this.provider = this.provider[net];
    }
    const currentProvider = new Web3.providers.HttpProvider(
      this.provider.providerParams.providerAddress
    );
    this.chainClient = new Web3(currentProvider);
  }

  public getContract(address, abi?): any {
    return new this.chainClient.eth.Contract(abi || ERC20_TOKEN_ABI as any[], address);
  }

  public addressValidator = (address: string) => {
    return this.chainClient.utils.isAddress(address.toLowerCase());
  }


  public getTokenInfo(address): any {
    return new Promise((resolve, reject) => {
      const contractModel = this.getContract(address);
      try {
        const tokenInfoPromises = [
          contractModel.methods.decimals().call(),
          contractModel.methods.symbol().call()
        ];

        Promise.all(tokenInfoPromises).then((result) => {
          resolve({
            decimals: result[0],
            symbol: result[1]
          });
        }).catch(() => {
          return reject();
        });
      } catch (err) {
        return reject();
      }
    });
  }


  public getExplorerLink(chain, isTestnet, address, type?, ethereumTestnet?): string {
    type = type || 'address';
    const network = isTestnet ? 'testnet' : 'mainnet';
    const providerParams = this.chainsProviders[chain][network];
    let chainInfo = providerParams.chainInfo;
    if (chain === 'ethereum' && isTestnet) {
      chainInfo = providerParams[ethereumTestnet?.split(' ')[0].toLowerCase() === 'ropsten' ? 'ropsten' : 'kovan'].chainInfo;
    }

    switch (type) {
      case 'address':
        return `${chainInfo?.explorer}/address/${address}`;
      case 'token':
        return `${chainInfo?.explorer}/token/${address}`;
      case 'tx':
        return `${chainInfo?.explorer}/tx/${address}`;
    }
  }

  public getChainParams(): any {
    return this.provider.chainInfo;
  }

}
