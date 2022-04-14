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

  public async isExcludedFromFee(): Promise<any> {
    return this.contract.methods.isExcludedFromFee ?
    this.contract.methods
      .isExcludedFromFee(this.airdropAddress)
      .call()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
      }) : true;
  }

  public async excludeFromFee(): Promise<any> {
    return this.contract.methods
      .excludeFromFee(this.airdropAddress)
      .send({from: this.walletAddress, account: this.airdropAddress})
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
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


  public async sendApprove(amount): Promise<string> {
    return await this.contract.approve(this.airdropAddress, amount)
      .send({
        from: this.walletAddress
      });
  }

}
