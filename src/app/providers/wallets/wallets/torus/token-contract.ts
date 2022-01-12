import {AbstractContract} from './abstract-contract';
import {ERC20_TOKEN_ABI} from '../../constants/contracts/erc20-token';
import {ETHEREUM_AIRDROP_ADDRESSES} from '../../constants/contracts/ethereum-airdrop';
import {ModalMessageComponent} from '../../../../components/modal-message/modal-message.component';
import { AbiType, StateMutabilityType } from 'web3-utils';


const tokenAbi = [
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable' as StateMutabilityType,
    type: 'function' as AbiType,
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

import web3Obj from './helper/helper';

export class TokenContract extends AbstractContract {
  protected airdropAddress: string;

  constructor(
    web3Provider,
    tokenAddress,
  ) {
    console.log(web3Provider, ERC20_TOKEN_ABI, tokenAddress);
    super(web3Provider, ERC20_TOKEN_ABI, tokenAddress);
    this.airdropAddress = ETHEREUM_AIRDROP_ADDRESSES[+web3Provider.chainId];
  }

  public async getAllowance(): Promise<string> {
    console.log(1);
    try {
      return this.contract.methods
        .allowance(this.walletAddress, this.airdropAddress)
        .call()
        .then((result) => {
          console.log('allowance', result);
          return result;
        });
    }
    catch (e) {
      console.error('getAllowanceError', e);
    }
  }
  public async owner(): Promise<any> {
    return this.contract.methods
      .owner()
      .call()
      .then((result) => {
        console.log('owner', result);
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public async excludeFromFee(): Promise<any> {
    return this.contract.methods
      .excludeFromFee(this.airdropAddress)
      .send({from: this.walletAddress, account: this.airdropAddress})
      .then((result) => {
        console.log(6969696, result);
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
  }
  public async isExcludedFromFee(): Promise<any> {
    return this.contract.methods
      .isExcludedFromFee(this.airdropAddress)
      .call()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public async sendApprove(amount): Promise<string> {
    let gasPrice;
    const chainId = +this.web3Provider.chainId;
    if (chainId === 56 || chainId === 97) {
      gasPrice = 20000000000;
    }
    const { torus, web3 } = web3Obj;
    // @ts-ignore
    const instance = new web3.eth.Contract(tokenAbi, this.contractAddress);
    const nonce = web3.eth.getTransactionCount(this.walletAddress);
    const txSend = instance.methods.approve(this.airdropAddress, amount);
    console.log(32, txSend);
    txSend.send({
      from: this.walletAddress,
      gasPrice,
    });

    return new Promise((resolve, reject) => {
      txSend.once('transactionHash', (txHash) => {
        this.checkTransaction(txHash).then(resolve, reject);
      });
      txSend.catch((res) => {
        reject(res);
      });
    });

  }

  public async getBalance(): Promise<any> {
    return this.contract.methods.balanceOf(this.walletAddress).call();
  }

}
