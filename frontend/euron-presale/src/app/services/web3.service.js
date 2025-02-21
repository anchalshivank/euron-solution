import axios from "axios";
import { ethers, providers } from "ethers";
import { getWalletClient } from '@wagmi/core';
import { mainnet, arbitrumSepolia, bsc } from '@wagmi/core/chains';
    
export const getContract = async (address, abi, signer = null) => {
    
    //const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/e_gVHvuJXGCpnl9kuKQBI0-Hpy8y0bCQ');    // Ethereum mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org');  // bsc mainnet

    //const provider = new ethers.providers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');                             // sepolia test net
    //const provider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/ENOw1bLQi5mcRwdyVnlfXdX81Ij3A-12');  // polygon mainnet
    //const provider = new ethers.providers.JsonRpcProvider('https://arb-sepolia.g.alchemy.com/v2/UzzXbAMrNSnia2fpRP7lvfxk49dhW6u8');    // arbitrum-sepolia

    const finalSigner = signer !== null ?  signer : provider;
    const contract = new ethers.Contract(address, abi, finalSigner);
    return contract;
}

export function walletClientToSigner(walletClient) {
    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    }
    const provider = new providers.Web3Provider(transport, network);
    const signer = provider.getSigner(account.address);
    return signer;
}

export async function getEtherSigner() {
    const walletClient = await getWalletClient({
        //chainId: arbitrumSepolia.id,
        chainId: bsc.id,
        //chainId: sepolia.id,
    });
    if (!walletClient) {
        return null;
    }
    return walletClientToSigner(walletClient);
}

export const toBigNum = (value, decimal = 18) => {
    return ethers.utils.parseUnits(String(value), decimal);
}

export const fromBigNum = (value, decimal = 18) => {
    let result = parseFloat(ethers.utils.formatUnits(value, decimal));
    return result;
}


