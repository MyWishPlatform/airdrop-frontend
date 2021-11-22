import * as solanaWeb3 from '@solana/web3.js';

export class AbstractContract {

  protected contract;
  protected walletAddress;
  protected contractAddress;
  protected connectedAccount;
  private httpClient;

  constructor(
    protected phantom,
    contractABI,
    contractAddress,
    connectedAccount?
  ) {
    this.contractAddress = contractAddress;
    this.connectedAccount = connectedAccount;
    this.walletAddress = this.phantom.publicKey.toString();
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
    this.contract = connection;
  }


  public setHttpClient(httpClient): void {
    this.httpClient = httpClient;
  }


}
