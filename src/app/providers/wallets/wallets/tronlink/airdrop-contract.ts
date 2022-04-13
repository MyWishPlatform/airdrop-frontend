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
  }

  public async getDeployerData(): Promise<any> {
    if(this.isTestnet){
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
  }

  public async getUserData(): Promise<any> {
    console.log(this.walletAddress);
    if(this.isTestnet){
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
    }
  }

  private getAirdropContractBandwidthCost(N: Number | String): Number {
    return 480 + 64 * +N;
  }

  private getAirdropContractEnergyCost(N: Number | String): Number {
    return 48600 + 28746 * +N;
  }

  public async checkDeployerEnergy(N: Number | String): Promise<any> {
    const data = await this.getDeployerData();
    console.log("Deployer:");
    console.log(data);
    return data.EnergyLimit || 0 - data.EnergyUsed || 0 >  this.getAirdropContractEnergyCost(N);
  } 
  public async checkUserEnergy(N: Number | String): Promise<any> {
    const data = await this.getUserData();
    console.log("User:");
    console.log(data);
    return (data.EnergyLimit || 0 - data.EnergyUsed || 0) > this.getAirdropContractEnergyCost(N);
  } 
  public async checkUserBandwidth(N: Number | String): Promise<any> {
    const data = await this.getUserData();
    console.log("User:");
    console.log(data);
    return (data.freeNetLimit || 0 - data.freeNetUsed || 0) + (data.netLimit || 0 - data.netUsed || 0) > this.getAirdropContractBandwidthCost(N);
  } 

  public async getFee(): Promise<any> {
    const fee = await this.contract.fee().call();
    console.log(fee);
    return this.tronLink.toDecimal(fee);
  }
  protected async estimateGas(params): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const promise = this.tronLink.tronWeb.request({
          method: 'eth_estimateGas',
          params
        }).then(resolve, reject);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });

  }

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

  private checkTx(txHash, resolve, reject): void {
    console.log(txHash);
    this.tronLink.trx.getTransaction(txHash).then((res) => {
      console.log(res);
      if (!res.ret) {
        setTimeout(() => {
          this.checkTx(txHash, resolve, reject);
        }, 2000);
      } else if (res.ret[0].contractRet === "SUCCESS") {
        resolve(res);
      } else{
        reject(res);
      }
      
    }).catch(e => {
      console.log(e);
      setTimeout(() => {
        this.checkTx(txHash, resolve, reject);
      }, 2000);
    })
  }

  public checkTransaction(txHash): Promise<any> {
    return new Promise((resolve, reject) => {
      this.checkTx(txHash, resolve, reject);
    });
  }

  public async sendTokensToAddresses(token, addresses, gasLimit, gasPrice): Promise<any> {
    const flag1 = await this.checkUserEnergy(addresses.length);
    const flag2 = await this.checkUserBandwidth(addresses.length);
    const flag3 = await this.checkDeployerEnergy(addresses.length);
    let txSend;
    // if(!flag1){
    //   // console.log("Not enought energy! You need " + this.getAirdropContractEnergyCost(addresses.length));
    // }
    // else{
      console.log(this.getAirdropContractEnergyCost(addresses.length));
      const tx = await this.getTransaction(token, addresses);
      const fee = await this.getFee();
      txSend = tx.send({
        callValue: fee,
        feeLimit: 1000000000,
      });
    // }
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

  private async gasLimit(): Promise<any> {
    const block = await this.tronLink.trx.getCurrentBlock();
    console.log(this.tronLink);
    console.log(this.tronLink.trx);
    console.log(block);
    // return (await this.web3.eth.getBlock('latest')).gasLimit;
  }

  public async tokensMultiSendGas(testTokenAddress): Promise<any> {
    const addressesLengthTest = 346;
    const fee = await this.getFee();
    const blockGasLimit = 10^7;
    console.log(this.contract);
    console.log(this.tronLink);

    const accounts = Array(addressesLengthTest).fill(null);
    const promises = [];
    accounts.forEach(async (address, index) => {
      index++;
      if ((index !== 0) && (index !== (addressesLengthTest - 1))) {
        return;
      }
      const addressesArray = Array(index + 1);
      addressesArray.fill(this.tronLink.createAccount);
      const addresses = await Promise.all(addressesArray.map(async (creator) => {
        const account = await creator();
        return account.address.base58;
      }));

      const amountsArray = Array(addresses.length);
      amountsArray.fill('1');

      const tx = this.contract.multisendToken(
        testTokenAddress,
        addresses,
        amountsArray,
        amountsArray.length.toString(10)
      );
      });
      // tx.send({
      //   callValue: fee
      // });

      // const data = tx.encodeABI();
      // console.trace();
    //   console.log('Fee: ', fee);
    //   console.log('walletAddress: ', this.walletAddress);
    //   console.log('contractAddress: ', this.contractAddress);
    //   this.estimateGas({
    //     from: this.walletAddress,
    //     to: this.contractAddress,
    //     value: fee,
    //     data
    //   }).then(res => console.log(res))
    //   .catch(err => console.log(err));
    //   promises.push(
    //     this.estimateGas({
    //       from: this.walletAddress,
    //       to: this.contractAddress,
    //       value: fee,
    //       data
    //     })
    //   );
    // });
    
    // return new Promise((resolve, reject) => {
    //   Promise.all(promises).then((result) => {
    //     if (!result[0] || !result[1]) {
    //       return reject();
    //     }
    //     const oneAddressAdding = (result[1] - result[0]) / (addressesLengthTest - 1);
    //     const initTransaction = result[0] - oneAddressAdding;
    //     const maxAddressesLength = Math.floor((blockGasLimit - initTransaction) / oneAddressAdding) - 1;
    
    //     console.log('Latest block gas limit:', blockGasLimit);
    //     console.log('Gas limit per address:', oneAddressAdding);
    //     console.log('Gas limit of first address:', initTransaction);
    //     console.log('Max addresses length per tx:', maxAddressesLength);
    
    //     resolve({
    //       maxAddressesLength,
    //       gasLimitPerAddress: oneAddressAdding,
    //       gasLimitForFirstAddress: result[0]
    //     });
    //   }, reject);
    // });

  }
}
