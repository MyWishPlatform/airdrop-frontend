import {AbstractContract} from '../phantom/abstract-contract';
import {ModalMessageComponent} from '../../../../components/modal-message/modal-message.component';
import {SOLANA_AIRDROP_ABI} from '../../constants/contracts/solana-airdrop';
import bs58 from 'bs58';
import BigNumber from 'bignumber.js';
import * as solanaWeb3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';

export class TokenContract extends AbstractContract {
  protected airdropAddress: string;


  constructor(
    phantom,
    tokenAddress,
    connectedAccount
  ) {
    super(phantom, SOLANA_AIRDROP_ABI, tokenAddress, connectedAccount);
    this.airdropAddress = '';
  }

  public async getBalance(): Promise<any> {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
    const tokenAddress58publicKey = new solanaWeb3.PublicKey(this.contractAddress);
    const owner58 = new solanaWeb3.PublicKey(this.connectedAccount.address);

    const programId = splToken.TOKEN_PROGRAM_ID;
    const secretKey = Uint8Array.from([
      202, 171, 192, 129, 150, 189, 204, 241, 142,  71, 205,
      2,  81,  97,   2, 176,  48,  81,  45,   1,  96, 138,
      220, 132, 231, 131, 120,  77,  66,  40,  97, 172,  91,
      245,  84, 221, 157, 190,   9, 145, 176, 130,  25,  43,
      72, 107, 190, 229,  75,  88, 191, 136,   7, 167, 109,
      91, 170, 164, 186,  15, 142,  36,  12,  23
    ]);
    const test = new splToken.Token(connection, tokenAddress58publicKey, programId, {publicKey: owner58, secretKey});
    const resultGetOrCreateAssociatedAccountInfo = await test.getOrCreateAssociatedAccountInfo(owner58);
    const resultGetTokenSupply = await connection.getTokenSupply(tokenAddress58publicKey);

    const balance = new BigNumber(resultGetOrCreateAssociatedAccountInfo.amount
      .toString())
      .dividedBy(new BigNumber(10)
      .pow(resultGetTokenSupply.value.decimals));
    return balance;
  }


  public async getAllowance(): Promise<any> {
    return true;
  }

  public async isExcludedFromFee(): Promise<any> {
    return true;
  }


  public sendApprove(amount): Promise<string> {
    return this.contract.approve(this.airdropAddress, amount)
      .send({
        from: this.walletAddress
      });
  }
}
