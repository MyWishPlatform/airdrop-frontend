import { Component, OnDestroy, OnInit } from '@angular/core';
import { InterfaceAccount, WalletsProvider } from '../../providers/wallets/wallets';
import { BlockchainsProvider } from '../../providers/blockchains/blockchains';
import { AirdropParamsInterface } from '../prepare/prepare.component';
import { Router } from '@angular/router';
import { Subscriber } from 'rxjs';
import BigNumber from 'bignumber.js';
import { ModalWalletsComponent } from '../../components/modal-wallets/modal-wallets';
import { MatDialog } from '@angular/material/dialog';
import { ModalMessageComponent } from '../../components/modal-message/modal-message.component';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponentTron implements OnInit, OnDestroy {
  public isExcludedFromFee: boolean | string;
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private blockchainsProvider: BlockchainsProvider,
    private walletsProvider: WalletsProvider
  ) {

    const airdropState = localStorage.getItem('airdropState');
    if (!airdropState) {
      this.router.navigate(['']);
      return;
    }
    if (airdropState === '1') {
      this.router.navigate(['addresses']);
      return;
    }
    if (airdropState === '2') {
      localStorage.removeItem('txList');
    }

    const storageAirdropParams = localStorage.getItem('proceedAirdrop');
    this.airdropParams = storageAirdropParams ? JSON.parse(storageAirdropParams) : false;
    if (!this.airdropParams) {
      this.router.navigate(['']);
      return;
    }

    this.blockchainsProvider.setChain(this.airdropParams.blockchain);
    this.blockchainsProvider.setTestnet(this.airdropParams.testnet);
    this.chainInfo = this.blockchainsProvider.getChainInfo();

    this.isExcludedFromFee = true;

    if (this.airdropParams.completed) {
      this.airdropInfoData = JSON.parse(localStorage.getItem('airdropInfoData'));
      this.generateTransactionList();
      return;
    }

    this.walletsProvider.setNetwork(
      this.airdropParams.blockchain,
      this.airdropParams.testnet
    );

    this.walletSubscriber = this.walletsProvider.subscribe(async (account) => {
      const oldAccount = this.account;
      if (oldAccount && account && oldAccount.address === account.address && oldAccount.chainId === account.chainId) {
        // this.walletsProvider.validateWallet(this.chainInfo.chainId);
        return;
      }
      this.account = account;
      this.tokenContract = undefined;
      this.airdropContract = undefined;
      this.tokensBalanceError = false;
      if (this.gasPricesInterval) {
        clearInterval(this.gasPricesInterval);
      }

      this.iniStartAirdropInfoData();

      if (this.account) {
        this.walletsProvider.validateWallet(this.chainInfo.chainId);
        if (this.account.valid) {
          this.tokenContract = this.walletsProvider.getTokenContract(
            this.airdropParams.token.address
          );
          const resultIsExcludedFromFee = this.tokenContract.isExcludedFromFee().then((res) => {
            if (+res) {
              res = true;
            }
            this.isExcludedFromFee = res;
            if (this.isExcludedFromFee === true) {
              this.isDeflationaryConfirmed = true;
            }
          });
          this.airdropContract = this.walletsProvider.getAirdropContract();
          this.airdropContract.checkDeployerEnergy();
          this.getInformationProgress = true;
          this.iniAirdropInfo().then(() => {
            this.getInformationProgress = false;
          });
          this.checkAccountTokensBalance().then((error) => {
            if (!error) {
              
            } else {
              this.getInformationProgress = false;
            }
          });

        }
      }
    });
  }

  get balancePercents(): number {
    const transferTokens =
      new BigNumber(this.airdropParams.totalAmount).times(Math.pow(10, this.airdropParams.token.decimals));
    const percent = new BigNumber(this.airdropInfoData.tokenBalance).div(transferTokens).times(100).toNumber();
    return Math.min(100, percent);
  }

  public sendingInProgress: boolean;
  private gasPricesInterval;
  public approveTokens: BigNumber;

  public chainInfo: any;
  public account: InterfaceAccount;
  public airdropParams: AirdropParamsInterface;

  private walletSubscriber: Subscriber<any>;

  private tokenContract: any;
  public airdropContract: any;

  public airdropInfoData;

  public tokensBalanceError;

  public transactionsList = [];

  public getInformationProgress;
  public errApproveInProgress;


  public approveType = 'unlimited';

  public distributedInfo;

  public isDeflationaryConfirmed = true;

  // private initGasPriceInterval(): void {
  //   this.gasPricesInterval = setInterval(() => {
  //     this.updateGasPrices();
  //   }, 10000);
  // }

  private getLeftTokensTransfer(): BigNumber {
    const txList = this.getTxLisStorage();
    if (!txList) {
      return new BigNumber(this.airdropParams.totalAmount)
        .times(Math.pow(10, this.airdropParams.token.decimals));
    } else {
      return txList.reduce((val, tx) => {
        if (!tx.state) {
          return val.plus(tx.tokens);
        }
        return val;
      }, new BigNumber(0));
    }
  }

  private checkTokensErrors(balance, allowance, tokens): any {
    let error;
    if (balance.minus(tokens).isNegative()) {
      const formatNumberParams = { groupSeparator: ',', groupSize: 3, decimalSeparator: '.' };
      const insufficientBalance = new BigNumber(tokens).minus(balance).div(Math.pow(10, this.airdropParams.token.decimals));
      const insufficientBalanceString = insufficientBalance.toFormat(formatNumberParams);
      error = {
        code: 1,
        message: `Insufficient balance, not enough <b class="blue-text">${insufficientBalanceString}</b> tokens.<br/><br/>
                  Top up your wallet or choose another wallet<br/><br/>`
      };
    } else if (allowance.minus(tokens).isNegative()) {
      error = {
        code: 2,
        message: `Approve amount of tokens<br/><br/>`
      };
    }
    return error;
  }

  private async checkAccountTokensBalance(): Promise<any> {
    const balance = new BigNumber(await this.tokenContract.getBalance());
    const allowance = new BigNumber(await this.tokenContract.getAllowance());
    console.log(allowance.toString());
    this.approveTokens = this.getLeftTokensTransfer();
    let error = this.checkTokensErrors(balance, allowance, this.approveTokens);
    if (!error) {
      const coinsBalance = new BigNumber(await this.walletsProvider.getBalance());
      const feeService = new BigNumber(await this.airdropContract.getFee());
      if (coinsBalance.minus(feeService).isNegative()) {
        const formatNumberParams = { groupSeparator: ',', groupSize: 3, decimalSeparator: '.' };
        const insufficientBalance = feeService.div(Math.pow(10, 6));
        const insufficientBalanceString = insufficientBalance.toFormat(formatNumberParams);
        const coinName = this.account.chainInfo.coin;
        error = {
          code: 3,
          message: `Insufficient ${coinName} balance, minimum amount for one transaction
                    <b class="blue-text">${insufficientBalanceString} ${coinName}</b> (Platform fee)<br/><br/>`
        };
      }
    }
    this.tokensBalanceError = error;

    return error;
  }

  private iniStartAirdropInfoData(){
    this.airdropInfoData = {
      addressesCount: this.airdropParams.addresses.length,
      transactionsCount: 0,
      tokens: this.airdropParams.totalAmount,
      energy: 0,
      fee: 0,
      onceFee: 0,
      tokenBalance: 0,
      totalCost: 0,
    };
  }

  private updateTokenBalance(): void {
    this.getTokenBalance().then((res) => {
      this.airdropInfoData.tokenBalance = res.tokenBalance;
    });
  }

  private getTokenBalance(): Promise<any> {
    return this.tokenContract.getBalance().then((tokenBalance) => {
      return {
        tokenBalance
      };
    });
  }

  private async iniAirdropInfo(): Promise<any> {
    if (this.airdropParams.deflationary && !this.isExcludedFromFee) {
      return;
    }
    const feeService = new BigNumber(await this.airdropContract.getFee());
    this.airdropInfoData.onceFee = feeService;
    const promises = [
      this.iniAirdropInfoData(),
      // this.getGasPrice(),
      this.getTokenBalance()
    ];
    return Promise.all(promises).then((results) => {
      results.forEach((res) => {
        this.airdropInfoData = { ...this.airdropInfoData, ...res };
      });
      this.generateTransactionList();
    }, () => {
      this.tokensBalanceError = {
        code: 3,
        message: 'Insufficient balance'
      };
    });
  }

  public calculateCost(): void {
    this.airdropInfoData.totalCost = new BigNumber(this.airdropInfoData.selectedGasPrice)
      .times(this.airdropInfoData.fullGasLimit).div(Math.pow(10, 6)).toString(10);
  }

  public changeGasPrice($event): void {
    this.airdropInfoData.selectedGasPrice = $event.value;
    this.calculateCost();
  }

  public async iniAirdropInfoData(): Promise<any> {
    const maxAddressesLength = this.airdropParams.deflationary ? 70 : 100;
    const gasLimitPerTx = 10^7;
    const addressesCount = this.airdropParams.addresses.length;
    const transactionsCount = Math.ceil(addressesCount / maxAddressesLength);
    const latestTxGasLimit = 10^7;
    const fullGasLimit = gasLimitPerTx * (transactionsCount - 1) + latestTxGasLimit;
    return {
      transactionsCount,
      fee: new BigNumber(this.airdropInfoData.onceFee * transactionsCount).div(Math.pow(10, 6)).toString(10),
      fullGasLimit,
      maxAddressesLength,
      gasLimitPerTx,
      latestTxGasLimit,
      totalCost: this.airdropParams.deflationary ? transactionsCount * 790 : transactionsCount * 844
    };

  }

  ngOnInit(): void {
    if (this.airdropParams.deflationary) {
      this.isDeflationaryConfirmed = false;
    }
  }

  ngOnDestroy(): void {
    if (this.walletSubscriber) {
      this.walletSubscriber.unsubscribe();
    }
    if (this.gasPricesInterval) {
      clearInterval(this.gasPricesInterval);
    }
  }

  private checkDistributedInfo(): void {
    this.distributedInfo = this.transactionsList.reduce((info, txItem) => {
      info.full = info.full.plus(txItem.tokens);
      if (txItem.state === 2) {
        info.distributed = info.distributed.plus(txItem.tokens);
      }
      return info;
    }, { full: new BigNumber(0), distributed: new BigNumber(0) });
    this.distributedInfo.percent = this.distributedInfo.distributed.div(this.distributedInfo.full).times(100).dp(0).toString(10);
  }

  private updateTxLisStorage(): void {
    this.checkDistributedInfo();
    localStorage.setItem('txList', JSON.stringify(this.transactionsList));
  }
  private getTxLisStorage(): any {
    const txList = localStorage.getItem('txList');
    if (txList) {
      try {
        return JSON.parse(txList);
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  }


  private checkStorageTx(): void {
    const pendingTxs = this.transactionsList.filter((tx) => {
      return tx.state === 1;
    });
    pendingTxs.forEach((tx) => {
      const checker = this.airdropContract.checkTransaction(tx.txHash);
      this.getTxState(checker, tx);
    });
  }

  private generateTransactionList(): void {
    const storageTxList = this.getTxLisStorage();
    if (storageTxList) {
      this.transactionsList = storageTxList;
      this.checkDistributedInfo();
      this.checkStorageTx();
      return;
    }

    const addressesList = this.airdropParams.addresses;
    const addressesPerTx = this.airdropInfoData.maxAddressesLength;
    const txCount = this.airdropInfoData.transactionsCount;

    for (let k = 0; k < txCount; k++) {
      const addressesStartIndex = addressesPerTx * k;
      const txAddressesList = addressesList.slice(addressesStartIndex, addressesStartIndex + addressesPerTx);
      const startIndex = k * addressesPerTx + 1;

      const tokensForTransaction = txAddressesList.reduce((result, oneAddress) => {
        return result.plus(
          new BigNumber(oneAddress.amount)
            .times(Math.pow(10, this.airdropParams.token.decimals))
        );
      }, new BigNumber(0));

      this.transactionsList.push({
        addresses: txAddressesList,
        startAddressIndex: startIndex,
        finishAddressIndex: startIndex + txAddressesList.length - 1,
        state: 0,
        tokens: tokensForTransaction.toString(10)
      });
    }

    this.updateTxLisStorage();
  }


  private async checkTokensBalance(txItem): Promise<any> {

    try {
      const balance = new BigNumber(await this.tokenContract.getBalance());
      const allowance = new BigNumber(await this.tokenContract.getAllowance());
      const error = this.checkTokensErrors(balance, allowance, txItem.tokens);
      if (error) {
        switch (error?.code) {
          case 1:
            this.dialog.open(ModalMessageComponent, {
              width: '372px',
              panelClass: 'custom-dialog-container',
              data: {
                title: 'Insufficient tokens balance',
                text: error.message,
                buttonText: 'Ok'
              }
            });
            break;
          case 2:
            this.dialog.open(ModalMessageComponent, {
              width: '372px',
              panelClass: 'custom-dialog-container',
              data: {
                title: 'Insufficient approved tokens',
                text: error.message,
                buttonText: 'Ok'
              }
            });
            break;
        }
        return;
      }
      return true;

    } catch (e) {

      this.dialog.open(ModalMessageComponent, {
        width: '372px',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Oops, something went wrong',
          text: 'Metamask threw an exception',
          buttonText: 'Retry transaction'
        }
      }).afterClosed().subscribe(() => {
        this.startSending('Retrying');
      });

      return;
    }

  }

  private async sendTokens(txItem): Promise<any> {
    if (!await this.checkTokensBalance(txItem)) {
      console.error('token balance');
      return;
    }

    txItem.state = 1;
    const tx = await this.airdropContract.sendTokensToAddresses(
      this.airdropParams.token,
      txItem.addresses,
      Math.floor(this.airdropInfoData.gasLimitPerTx),
      this.airdropInfoData.selectedGasPrice,
    );
    if(tx === 'error'){
      txItem.state = 0;
      return 'error';
    }
    tx.hash.then((txHash: string) => {
      txItem.txHash = txHash;
      this.updateTxLisStorage();
    }).catch((e) => console.error(e));
    return this.getTxState(tx.checker, txItem);
  }

  private getTxState(promise, txItem): void {
    return promise.then((res) => {
      if (txItem.txHash) {
        txItem.state = 2;
        localStorage.setItem('airdropState', '3');
        this.updateTokenBalance();
      } else {
        txItem.state = 0;
      }
      return txItem.txHash;
    }, (e) => {
      if (txItem.txHash) {
        txItem.txHash = undefined;
      }
      txItem.state = 0;
      return false;
    }).finally(() => {
      this.updateTxLisStorage();
    });
  }

  public selectWallet(): void {
    const availableWallets = this.walletsProvider.getWallets();
    const chooseWalletModal = this.dialog.open(ModalWalletsComponent, {
      data: {
        onSelectWallet: (wallet) => {
          this.walletsProvider.connect(wallet.type, this.chainInfo.chainId);
          chooseWalletModal.close();
        },
        wallets: availableWallets,
      },
    });
  }


  public async approveLeftTransferTokens(): Promise<any> {
    const leftTransferTokens = this.getLeftTokensTransfer();
    let totalAmount;
    this.errApproveInProgress = true;

    switch (this.approveType) {
      case 'limited':
        totalAmount = leftTransferTokens.toString(10);
        break;
      case 'unlimited':
        totalAmount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        break;
    }

    this.tokenContract.sendApprove(totalAmount)
      .then(() => {
        this.tokensBalanceError = false;
        this.getInformationProgress = true;
        this.checkAccountTokensBalance().then((error) => {
            this.getInformationProgress = false;
            if(error){
              console.log(error);
            }
        });
        this.errApproveInProgress = false;
      }).catch(err => console.log(err));
  }

  public async startSending(withMsg?): Promise<any> {

    this.sendingInProgress = true;
    clearInterval(this.gasPricesInterval);

    const currentTxItem = this.transactionsList.find((item) => {
      return !item.state;
    });
    if (!currentTxItem && withMsg) {
      this.completedSending();
      return;
    }
    const tx = await this.sendTokens(currentTxItem);
    if (tx) {
      if(tx === 'error'){
        this.sendingInProgress = false;
        this.dialog.open(ModalMessageComponent, {
          width: '372px',
          panelClass: 'custom-dialog-container',
          data: {
            title: 'Oooops!!!',
            text: "You haven't enought energy/trx for transaction.",
            buttonText: 'Ok'
          }
        });
        return;
      } else {
        this.startSending(true);
      }
    } else {
      this.sendingInProgress = false;
      this.dialog.open(ModalMessageComponent, {
        width: '372px',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Oooops!!!',
          text: 'Token distribution has interrupted.',
          buttonText: 'Ok'
        }
      });
    }
  }

  public async confirmDeflationary(): Promise<void>{
    this.getInformationProgress = true;

    const resultOwner = await this.tokenContract.owner();

    if (this.isExcludedFromFee) {
      await this.iniAirdropInfo();
      this.getInformationProgress = false;
      this.isDeflationaryConfirmed = true;
      return;
    }
    if ((+resultOwner).toString(16) !== (+this.account.address).toString(16)) {
      this.dialog.open(ModalMessageComponent, {
        width: '372px',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Oooops!!!',
          text: 'Please use token owner address to add airdrop contract in excludeFromFee.',
          buttonText: 'Ok'
        }
      });
      this.getInformationProgress = false;
      return;
    }
    const resultExcludeFromFee = await this.tokenContract.excludeFromFee();
    if (resultExcludeFromFee) {
      window.location.reload();
      return;
    } else {
      this.dialog.open(ModalMessageComponent, {
        width: '372px',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Oooops!!!',
          text: 'Token excludeFromFee has interrupted.',
          buttonText: 'Ok'
        }
      });
      this.isDeflationaryConfirmed = false;
    }
  }

  private completedSending(): void {
    this.dialog.open(ModalMessageComponent, {
      width: '372px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Success',
        text: 'Token distribution is completed.',
        buttonText: 'Ok'
      }
    });

    this.sendingInProgress = false;
    clearInterval(this.gasPricesInterval);

    localStorage.setItem('airdropState', '4');
    this.airdropParams.completed = true;
    localStorage.setItem('proceedAirdrop', JSON.stringify(this.airdropParams));
    localStorage.setItem('airdropInfoData', JSON.stringify(this.airdropInfoData));
  }

}
