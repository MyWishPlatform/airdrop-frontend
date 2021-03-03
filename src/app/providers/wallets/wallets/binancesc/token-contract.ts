import {ETHEREUM_AIRDROP_ADDRESSES} from '../../constants/contracts/ethereum-airdrop';
import {ERC20_TOKEN_ABI} from '../../constants/contracts/erc20-token';
import {AbstractContract} from './abstract-contract';

export class TokenContract extends AbstractContract {
  private airdropAddress;
  constructor(
    binanceChain,
    tokenAddress
  ) {
    super(binanceChain, ERC20_TOKEN_ABI, tokenAddress);
    this.airdropAddress = ETHEREUM_AIRDROP_ADDRESSES[+binanceChain.chainId];
  }

  public async getAllowance(): Promise<string> {
    const walletAddress = (await this.binanceChain.request({ method: 'eth_requestAccounts' }))[0];
    return this.callMethod(walletAddress, 'allowance', [walletAddress, this.airdropAddress]);
  }

  public async sendApprove(amount): Promise<string> {
    const chainId = +this.binanceChain.chainId;
    let gasPrice;
    if (chainId === 56 || chainId === 97) {
      gasPrice = 20000000000;
    }
    const walletAddress = (await this.binanceChain.request({ method: 'eth_requestAccounts' }))[0];
    return this.sendMethod(walletAddress, 'approve', [this.airdropAddress, amount], 0, gasPrice);
  }

  public async getBalance(): Promise<any> {
    const walletAddress = (await this.binanceChain.request({ method: 'eth_requestAccounts' }))[0];
    return this.callMethod(walletAddress, 'balanceOf', [walletAddress]);
  }

}
