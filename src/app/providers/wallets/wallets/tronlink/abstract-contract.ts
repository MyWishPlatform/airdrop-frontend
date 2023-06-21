import { TronwebService } from "src/app/providers/blockchains/tronweb";
// import Web3 from "web3";
export class AbstractContract {

  protected contract;
  protected tronWeb;
  protected walletAddress;
  protected contractAddress;
  private httpClient;
  // private web3;
  constructor(
    protected tronLink,
    private contractABI,
    contractAddress
  ) {
    this.tronWeb = new TronwebService();
    // this.web3 = new Web3();
    this.contractAddress = contractAddress;
    this.walletAddress = this.tronLink.defaultAddress.base58;
    this.contract = this.tronLink.contract(
      this.contractABI,
      this.contractAddress
    );
  }

  protected checkTx(txHash, resolve, reject): void {
    let timeout;
    this.tronLink.trx.getTransaction(txHash).then((res) => {
      console.log(res);
      if (!res.ret) {
        timeout = setTimeout(() => {
          this.checkTx(txHash, resolve, reject);
        }, 2000);
      } else if (res.ret[0].contractRet === "SUCCESS") {
        clearTimeout(timeout);
        resolve(res);
      } else{
        clearTimeout(timeout);
        reject(res);
      }
      
    }).catch(e => {
      console.warn(e, txHash);
      timeout =setTimeout(() => {
        this.checkTx(txHash, resolve, reject);
      }, 2000);
    })
  }

  public checkTransaction(txHash): Promise<any> {
    return new Promise((resolve, reject) => {
      this.checkTx(txHash, resolve, reject);
    });
  }

  // protected async decodeMethod(methodName, params): Promise<any>{
  //   const abiElement = this.contractABI.find((abiItem) => {
  //     return abiItem.name === methodName;
  //   });
  //   params[0] = params[0].replace("41", '0x');
  //   params[1] = params[1].map(item => this.tronWeb.chainClient.address.toHex(item).replace("41", '0x'));
  //   console.log(abiElement);
  //   return await this.web3.eth.abi.encodeFunctionCall(abiElement, params);
  // }

  public setHttpClient(httpClient): void {
    this.httpClient = httpClient;
  }


}


