import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';

class TransferSolanaService{
    private walletAddress;
    private connection;
    private wallet;
    private tokenAddress
    constructor(walletAddress: string, tokenAddress){
        this.walletAddress = walletAddress;
        this.connection = new web3.Connection(web3.clusterApiUrl('devnet'));
        this.tokenAddress= tokenAddress;
        this.wallet = (window as any).solana;
    }

    private async sendToMultipleAddresses(addresses: string[], amounts): Promise<any>{
        if(addresses.length !== amounts.length) return false;
        const transaction = new web3.Transaction();
        addresses.forEach(async (item, index) => {
            transaction.add(await this.transferToOneAddress(item, amounts[index]));
        });
        

    }


    public async transferToOneAddress(toAddress, amount): Promise<any>{
        if (!toAddress || !amount) return;
        const toPublicKey = new web3.PublicKey(toAddress);
        const fromPublicKey = new web3.PublicKey(this.walletAddress);
        const mint = new web3.PublicKey(this.tokenAddress);
        const fromTokenAccount = await splToken.getAssociatedTokenAddress(
            mint,
            fromPublicKey
        );
        const toTokenAccount = await splToken.getAssociatedTokenAddress(
            mint,
            toPublicKey
        );
        console.log(this.wallet);
        console.log(amount);
        const transaction = splToken.createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromPublicKey,
            amount * 10^9,
            [],
            splToken.TOKEN_PROGRAM_ID
        );
        const transactionSend = new web3.Transaction().add(transaction);
        try{
            const blochHash = await this.connection.getLatestBlockhash('finalized');
            transactionSend.recentBlockhash = blochHash.blockhash;
            transactionSend.feePayer = fromTokenAccount;
            const { signature } = await this.wallet.signAndSendTransaction(transactionSend);
            console.log(signature);
            return signature;
        } catch(err){
            console.log(err);
        }
        

    } catch (error) {
        console.log(error);
    }
}

export default TransferSolanaService;