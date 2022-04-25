import BigNumber from 'bignumber.js';
import {TRON_AIRDROP_ABI, TRON_AIRDROP_ADDRESSES} from '../../constants/contracts/tron-airdrop';
import {AbstractContract} from './abstract-contract';

export class AirdropContract extends AbstractContract {
  isTestnet: boolean;
  constructor(
    tronLink,
    chainId,
  ) {
    const airdropAddress = TRON_AIRDROP_ADDRESSES[chainId];
    super(tronLink, TRON_AIRDROP_ABI, airdropAddress);
    this.isTestnet = chainId === "tron:shasta";
    this.tronWeb.setTestnet(this.isTestnet);
    this.checkUserResource(100);
  }

  public async getDeployerData(): Promise<any> {
      let data = await fetch(this.isTestnet 
        ? "https://api.shasta.trongrid.io/wallet/getaccountresource" : 
        "https://api.trongrid.io/wallet/getaccountresource", {
        method: "POST",
        body: JSON.stringify({
          address: this.tronWeb.chainClient.address.toHex("TAFf4cAbDAS7hNdJaSQeb9JETpc3tFRsnv"),
        })
      });
      data = await data.json();
      return data;
  }

  public async getUserData(): Promise<any> {
      try{
        let data = await fetch(this.isTestnet 
          ? "https://api.shasta.trongrid.io/wallet/getaccountresource" : 
          "https://api.trongrid.io/wallet/getaccountresource", {
          method: "POST",
          body: JSON.stringify({
            address: this.tronWeb.chainClient.address.toHex(this.walletAddress),
          })
        });
        data = await data.json();
        return data;
      }catch(err){
        console.log(err);
      }
  }

  private getAirdropContractBandwidthCost(N: Number | String): Number {
    return 480 + 64 * +N;
  }

  private getAirdropContractEnergyCost(N: Number | String): Number {
    return 48600 + 28746 * (+N + 2);
  }

  public async checkDeployerEnergy(N: Number | String): Promise<any> {
    console.log(await this.checkTransaction('732acbf3168f443aa534489d5fdfe9c39e7bf6be4988eb45f44b2846a6db5d04'));
    const data = await this.getDeployerData();
    return data.EnergyLimit || 0 - data.EnergyUsed || 0 >  this.getAirdropContractEnergyCost(N);
  } 
  public async checkUserResource(N: Number | String): Promise<any> {
    const data = await this.getUserData();
    const energyCost = this.getAirdropContractEnergyCost(N);
    const trxBalance = new BigNumber(await this.tronWeb.chainClient.trx.getUnconfirmedBalance(this.walletAddress)).div(Math.pow(10,6));
    const totalEnergy = trxBalance.multipliedBy(Math.pow(10,6)/280).plus((data.EnergyLimit || 0 - data.EnergyUsed || 0)); //10**6 / 280 - current energy for one trx
    return totalEnergy.toNumber() > energyCost;
  } 
  public async checkUserBandwidth(N: Number | String): Promise<any> {
    const data = await this.getUserData();
    return (data.freeNetLimit || 0 - data.freeNetUsed || 0) + (data.netLimit || 0 - data.netUsed || 0) > this.getAirdropContractBandwidthCost(N);
  } 

  public async getFee(): Promise<any> {
    const fee = await this.contract.fee().call();
    return this.tronLink.toDecimal(fee);
  }
  protected async estimateGas(params): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        console.log(this.tronLink);
        const promise = this.tronLink.request({
          "jsonrpc": "2.0",
          "id": 1,
          method: 'eth_estimateGas',
          params
        }).then(resolve, reject);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });

  }
  // private async tryEstimate(){
  //   const addressesLengthTest = 100;
  //   const fee = await this.getFee();
  //   const blockGasLimit = 10^7;

  //   const accounts = Array(addressesLengthTest).fill(null);
  //     const addressesArray = Array(100);
  //     addressesArray.fill(this.tronLink.createAccount);
  //     const addresses = await Promise.all(addressesArray.map(async (creator) => {
  //       const account = await creator();
  //       return account.address.base58;
  //     }));

  //     const amountsArray = Array(addresses.length);
  //     amountsArray.fill('1');

  //     const data = this.decodeMethod('multisendToken', [
  //       this.tronWeb.chainClient.address.toHex("TYMp9gfnseBLdRMcKjNF9AeHJeJn9dJBDf"),
  //       addresses,
  //       amountsArray,
  //       amountsArray.length.toString(10)
  //     ]
  //     ).then(res => {
  //       console.log(res);
  //       this.estimateGas({
  //         from: this.walletAddress,
  //         to: this.contractAddress,
  //         value: fee,
  //         res
  //       }).then(res => console.log(res))
  //       .catch(err => console.log(err));
  //     }).catch(err => console.log(err));
      
  // }
  private async getTransaction(token, addresses): Promise<any> {
    let fullAmount = new BigNumber(0);
    const txParams = addresses.reduce((data, item) => {
      const itemAmount = new BigNumber(item.amount).times(Math.pow(10, token.decimals));
      fullAmount = fullAmount.plus(itemAmount);
      data.addresses.push(item.address);
      data.amounts.push(itemAmount.toString(10));
      return data;
    }, { addresses: [], amounts: [] });
    console.log(token.address,
      txParams.addresses,
      txParams.amounts,
      fullAmount.toString(10));
    try{
      const res = await this.contract.methods.multisendToken(
        token.address,
        txParams.addresses,
        txParams.amounts,
        fullAmount.toString(10)
      )
      return res;
    } catch(e){
      console.log(e);
    }
  }

  public async sendTokensToAddresses(token, addresses, gasLimit, gasPrice): Promise<any> {
    const flag = await this.checkUserResource(addresses.length);
    let txSend;
    console.log(flag);
    if(!flag){
      return'error';
    }
    else{
      const tx = await this.getTransaction(token, addresses);
      const fee = await this.getFee();
      txSend = tx.send({
        callValue: fee,
        feeLimit: 1000000000,
      });
    }
    let txResolver;
    let rejector;

    const checkerPromise = new Promise((resolve, reject) => {
      txResolver = resolve;
      rejector = reject;
    });

    txSend.catch(rejector)


    return {
      checker: checkerPromise.then((transactionHash) => {
        return this.checkTransaction(transactionHash);
      }),
      hash: new Promise((resolve) => {
        txSend.then((res) => {
            txResolver(res);
            resolve(res);
          }
        )
      })
    };
  }
}
