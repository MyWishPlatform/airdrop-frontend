import Web3 from 'web3';

export class AbstractContract {
  protected contract;
  protected web3 = new Web3();
  protected walletAddress;
  protected contractAddress;
  constructor(
    web3Provider,
    contractABI,
    contractAddress
  ) {
    this.web3.setProvider(web3Provider);
    this.contractAddress = contractAddress;
    this.walletAddress = web3Provider.selectedAddress;
    this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
  }

  public async getGasPrice(): Promise<any> {
    return await this.web3.eth.getGasPrice();
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
      } else {}
    });
  }

  public checkTransaction(txHash): Promise<any> {
    return new Promise((resolve, reject) => {
      this.checkTx(txHash, resolve, reject);
    });
  }
}
