import {AbstractContract} from './abstract-contract';
import {TRON_AIRDROP_ADDRESSES} from '../../constants/contracts/tron-airdrop';
import {TRC20_TOKEN_ABI} from '../../../blockchains/constants/trc20';


export class TokenContract extends AbstractContract {
  protected airdropAddress: string;

  constructor(
    tronLink,
    tokenAddress,
    chainId
  ) {
    super(tronLink, TRC20_TOKEN_ABI, tokenAddress);
    this.airdropAddress = TRON_AIRDROP_ADDRESSES[chainId];
  }


  public async getBalance(): Promise<any> {
    // console.log();
    try{
      const balance = await this.contract.balanceOf(this.walletAddress).call();
      console.log(this.tronLink.toDecimal(balance._hex));
      return this.tronLink.toDecimal(balance._hex);
    } catch(err) {
      console.log(err);
    }
  }


  public async getAllowance(): Promise<string> {
    try{
      const balance = await this.contract.allowance(this.walletAddress, this.airdropAddress).call();
      return this.tronLink.toDecimal(balance._hex);
    } catch(err) {
      console.log(err);
    }
  }


  public sendApprove(amount): Promise<string> {
    return this.contract.approve(this.airdropAddress, amount)
      .send({
        from: this.walletAddress
      });
  }

}
