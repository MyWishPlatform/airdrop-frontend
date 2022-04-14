import {Injectable} from '@angular/core';
import {TRON} from './constants/blockchains';
import TronWeb from 'tronweb';
import {AbstractControl, AsyncValidatorFn} from '@angular/forms';
import {TRC20_TOKEN_ABI} from './constants/trc20';


@Injectable({
  providedIn: 'root',
})
export class TronwebService {
  private chainClient: TronWeb;
  private provider;
  private isDeflationary = false;
  constructor() {}

  public setChain(chain: string): void {}

  public setTestnet(isTestnet: boolean): void {
    const network = isTestnet ? 'testnet' : 'mainnet';
    this.provider = TRON[network];
    this.chainClient = new TronWeb(
      this.provider.providerParams.fullNode,
      this.provider.providerParams.solidityNode,
      this.provider.providerParams.eventServer,
      this.provider.providerParams.privateKey
    );
  }

  public setDeflationary(isDeflationary: boolean): void {
    this.isDeflationary = isDeflationary;
  }


  public async getContract(address): Promise<any> {
    const contract = await this.chainClient.trx.getContract(address).then((res) => {
      return res;
    }, () => {
      return false;
    });
    return contract ? this.chainClient.contract(
      contract.abi?.entrys || TRC20_TOKEN_ABI as any[],
      contract.contract_address
    ) : false;
  }

  public addressValidator = (address: string) => {
    return this.chainClient.isAddress(address);
  }


  public async getTokenInfo(address): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const contractModel = await this.getContract(address);
      if (!contractModel) {
        return reject();
      }
      const tokenInfoPromises = [
        contractModel.decimals().call(),
        contractModel.symbol().call()
      ];
      Promise.all(tokenInfoPromises).then((result) => {
        resolve({
          decimals: result[0].toNumber ? result[0].toNumber() : result[0],
          symbol: result[1]
        });
      }).catch((e) => {
        console.log(e);
        reject();
      });
    });
  }


  public getExplorerLink(chain, isTestnet, address, type?): string {
    type = type || 'address';
    const network = isTestnet ? 'testnet' : 'mainnet';
    const providerParams = TRON[network];

    switch (type) {
      case 'address':
        return `${providerParams.chainInfo.explorer}/#/address/${address}`;
      case 'token':
        return `${providerParams.chainInfo.explorer}/#/contract/${address}`;
      case 'tx':
        return `${providerParams.chainInfo.explorer}/#/transaction/${address}`
    }
  }

  public getChainParams(): any {
    return this.provider.chainInfo;
  }

}

