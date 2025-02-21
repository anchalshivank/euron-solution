import { InjectedConnector } from '@web3-react/injected-connector';
import { createConfig, configureChains } from 'wagmi';
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrumSepolia, bsc } from 'wagmi/chains';

import {
    trustWallet,
    injectedWallet,
    argentWallet,
    ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';

const projectId = 'b9dacde9577e9aa82c83cff5a8aee900';

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    [ bsc ],
    [ publicProvider() ]
);

const { wallets } = getDefaultWallets({
    appName: 'Euron',
    projectId,
    chains,
});

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: 'Other',
        wallets: [
            argentWallet({ projectId, chains }),
            trustWallet({ projectId, chains, defaultChain: bsc }),
            ledgerWallet({ projectId, chains, defaultChain: bsc }),
            injectedWallet({ chains }),
        ]
    }
]);

export const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 1337, 31337, 42161, 80001, 11155111] });
