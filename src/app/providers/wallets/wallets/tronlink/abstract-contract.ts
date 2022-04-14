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
      contractABI,
      this.contractAddress
    );
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


