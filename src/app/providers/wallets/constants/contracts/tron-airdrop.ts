// tslint:disable-next-line:max-line-length
export const TRON_AIRDROP_ABI = [{constant: false, inputs: [{name: 'newFee', type: 'uint128'}], name: 'setFee', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {constant: false, inputs: [], name: 'renounceOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {constant: false, inputs: [{name: '_token', type: 'address'}, {name: 'contributors', type: 'address[]'}, {name: 'balances', type: 'uint256[]'}, {name: '_total', type: 'uint256'}], name: 'multisendToken', outputs: [], payable: true, stateMutability: 'payable', type: 'function'}, {constant: true, inputs: [], name: 'owner', outputs: [{name: '', type: 'address'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'isOwner', outputs: [{name: '', type: 'bool'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: '_fee', type: 'uint128'}], name: 'init', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {constant: false, inputs: [{name: 'contributors', type: 'address[]'}, {name: 'balances', type: 'uint256[]'}, {name: '_total', type: 'uint256'}], name: 'multisendEth', outputs: [], payable: true, stateMutability: 'payable', type: 'function'}, {constant: false, inputs: [{name: '_from', type: 'address'}, {name: '_value', type: 'uint256'}, {name: '_data', type: 'bytes'}], name: 'tokenFallback', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {constant: true, inputs: [], name: 'fee', outputs: [{name: '', type: 'uint128'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: 'newOwner', type: 'address'}], name: 'transferOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {constant: false, inputs: [{name: '_token', type: 'address'}, {name: '_amount', type: 'uint256'}], name: 'claimTokens', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor'}, {anonymous: false, inputs: [{indexed: false, name: 'token', type: 'address'}, {indexed: false, name: 'amount', type: 'uint256'}], name: 'MultisendedToken', type: 'event'}, {anonymous: false, inputs: [{indexed: false, name: 'amount', type: 'uint256'}], name: 'MultisendedEth', type: 'event'}, {anonymous: false, inputs: [{indexed: false, name: 'token', type: 'address'}, {indexed: false, name: 'ownerPayable', type: 'address'}, {indexed: false, name: 'amount', type: 'uint256'}], name: 'ClaimedTokens', type: 'event'}, {anonymous: false, inputs: [{indexed: true, name: 'previousOwner', type: 'address'}, {indexed: true, name: 'newOwner', type: 'address'}], name: 'OwnershipTransferred', type: 'event'}];
export const TRON_AIRDROP_ADDRESSES = {
  'tron:mainnet': '',
  // 'tron:shasta': 'TTpxhDKEdLZta9yXrq6skziRycUxyDJPQ2', //100% deployer
  // 'tron:shasta': 'TFSCbJrv62YxhdEnSJr7SmtSDcZwnP3fPp' //70% deployer
  'tron:shasta': 'TLX1RQ4yxQfH1HfoeFKm2os9ZNmX8rBtaR' //100% user
};
