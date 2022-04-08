import { TronwebService } from "src/app/providers/blockchains/tronweb";

export class AbstractContract {

  protected contract;
  protected tronWeb;
  protected walletAddress;
  protected contractAddress;
  private httpClient;

  constructor(
    protected tronLink,
    contractABI,
    contractAddress
  ) {
    this.tronWeb = new TronwebService();
    this.contractAddress = contractAddress;
    this.walletAddress = this.tronLink.defaultAddress.base58;
    this.contract = this.tronLink.contract(
      contractABI,
      this.contractAddress
    );
  }


  public setHttpClient(httpClient): void {
    this.httpClient = httpClient;
  }


}


