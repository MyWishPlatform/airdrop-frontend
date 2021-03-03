import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BlockchainsProvider} from '../../providers/blockchains/blockchains';
import {CsvParserService} from '../../services/csv-parser.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscriber} from 'rxjs';
import {WalletsProvider} from '../../providers/wallets/wallets';

export interface TokenInterface {
  symbol?: string;
  address?: string;
  decimals: number;
}

export interface AirdropParamsInterface {
  completed?: boolean;
  totalAmount?: string;
  changed?: boolean;
  fileName?: string | any[];
  addresses?: any[];
  blockchain?: string;
  testnet?: boolean;
  token?: TokenInterface;
}

@Component({
  selector: 'app-prepare',
  templateUrl: './prepare.component.html',
  styleUrls: ['./prepare.component.scss']
})
export class PrepareComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('airdropForm') private airdropForm;
  public airdropParams: AirdropParamsInterface;

  public csvData: {
    error?: string;
    data?: any[];
    changed?: boolean;
  } = {};

  public testNets = {
    ethereum: 'Kovan Test Network',
    binance: 'Test Network',
    tron: 'Shasta Test Network'
  };

  public selectChainState: any;
  private subscribers = new Subscriber();
  // private walletSubscriber;

  constructor(
    private blockchainsProvider: BlockchainsProvider,
    private csvParserService: CsvParserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private walletsProvider: WalletsProvider
  ) {
    this.airdropParams = {};

    if (this.activatedRoute.snapshot.data.editMode) {
      this.iniEditAirdropParams();
    } else {
      localStorage.removeItem('airdropState');
    }
    // this.walletSubscriber = this.walletsProvider.subscribe((account) => {
    //   if (this.selectChainState) {
    //     this.walletsProvider.validateWallet(this.selectChainState.chainId);
    //   }
    // });
  }

  private iniEditAirdropParams(): void {
    const airdropParamsStorage = localStorage.getItem('proceedAirdrop');
    const airdropParams = airdropParamsStorage ? JSON.parse(airdropParamsStorage) : false;


    if (!airdropParams) { return; }

    this.airdropParams.blockchain = airdropParams.blockchain;
    this.blockchainsProvider.setChain(airdropParams.blockchain);
    this.airdropParams.testnet = airdropParams.testnet;
    this.blockchainsProvider.setTestnet(airdropParams.testnet);

    this.airdropParams.token = airdropParams.token;
    this.airdropParams.fileName = airdropParams.fileName;
    this.csvData = {
      data: airdropParams.addresses,
      changed: airdropParams.changed
    };
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscribers.unsubscribe();
    // this.walletSubscriber.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const formControls = this.airdropForm.controls;
      this.subscribers.add(formControls.blockchain.valueChanges.subscribe((value) => {
        this.blockchainsProvider.setChain(value);
      }));

      this.subscribers.add(formControls.testnet.valueChanges.subscribe((value) => {
        this.blockchainsProvider.setTestnet(value);
      }));

      const tokenAddressControl = this.airdropForm.controls.token;
      tokenAddressControl.setAsyncValidators(this.blockchainsProvider.tokenFieldValidator);

      this.subscribers.add(this.blockchainsProvider.subscribe((state) => {
        this.selectChainState = state.chainParams;
        tokenAddressControl.setValue(tokenAddressControl.value);
        this.walletsProvider.setNetwork(state.state.chain, state.state.isTestnet);
      }));
    });
  }

  public parseCsvFile(input): void {
    const file = input.files[0];
    if (!file) {
      this.csvData = {};
      return;
    }

    this.airdropParams.fileName = file.name;
    file.text().then((csvText) => {
      this.csvParserService.parseCsv(csvText, (result) => {
        this.csvData = {
          error: result.error,
          data: result.data ? result.data.map((oneTableItem, index) => {
            const address = oneTableItem[0].replace([/^\s+/, /\s+$/], '');
            const amount = oneTableItem[1].replace([/^\s+/, /\s+$/], '').replace(/\.$/, '');
            const line = index + 1;
            return {address, amount, line};
          }) : result
        };
      });
    });
  }

  public proceedAirdrop(): void {
    const formValues = {...this.airdropForm.value};
    formValues.fileName = this.airdropParams.fileName;
    formValues.addresses = this.csvData.data;
    formValues.changed = this.csvData.changed;
    formValues.testnet = !!formValues.testnet;

    localStorage.setItem('proceedAirdrop', JSON.stringify(formValues));
    localStorage.setItem('airdropState', '1');
    this.router.navigate(['addresses']);
  }
}
