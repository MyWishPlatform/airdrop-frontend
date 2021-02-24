import { Component, OnInit } from '@angular/core';
import {InterfaceAccount, WalletsProvider} from '../../providers/wallets/wallets';
import {WALLETS_NETWORKS} from '../../providers/wallets/constants/networks';
import {ModalWalletsComponent} from '../modal-wallets/modal-wallets';
import {MatDialog} from '@angular/material/dialog';
import {BlockchainsProvider} from '../../providers/blockchains/blockchains';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public currentAccount: InterfaceAccount|false;
  public networks = WALLETS_NETWORKS;

  private chainInfo;

  constructor(
    private walletsProvider: WalletsProvider,
    private dialog: MatDialog,
    private blockchainsProvider: BlockchainsProvider
  ) {
    this.walletsProvider.subscribe((account: InterfaceAccount) => {
      // console.log(account);
      this.currentAccount = account || false;
    });
  }

  ngOnInit(): void {
    this.blockchainsProvider.subscribe((state) => {
      this.chainInfo = state.chainParams;
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



}
