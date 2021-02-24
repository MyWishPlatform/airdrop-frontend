import {AbstractContract} from './abstract-contract';
import {ERC20_TOKEN_ABI} from '../../constants/contracts/erc20-token';
import {ETHEREUM_AIRDROP_ADDRESSES} from '../../constants/contracts/ethereum-airdrop';

export class TokenContract extends AbstractContract {
  protected airdropAddress: string;

  constructor(
    web3Provider,
    tokenAddress
  ) {
    super(web3Provider, ERC20_TOKEN_ABI, tokenAddress);
    this.airdropAddress = ETHEREUM_AIRDROP_ADDRESSES[+web3Provider.chainId];

  }

  public async getAllowance(): Promise<string> {
    return this.contract.methods
      .allowance(this.walletAddress, this.airdropAddress)
      .call()
      .then((result) => {
        return result;
      });
  }

  public sendApprove(amount): Promise<string> {
    return this.contract.methods
      .approve(this.airdropAddress, amount)
      .send({
        from: this.walletAddress
      })
      .then((result) => {
        return this.checkTransaction(result.transactionHash);
      });
  }

  public async getBalance(): Promise<any> {
    return this.contract.methods.balanceOf(this.walletAddress).call();
  }

}
