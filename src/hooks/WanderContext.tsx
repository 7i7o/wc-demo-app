import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { WanderContext } from './useWander';
import { type BalanceInfo, WanderEmbedded } from '@wanderapp/embed-sdk';

const THEME = 'light';
// const IFRAME_MODE = 'modal';
const BASE_URL = 'https://embed-dev.wander.app';
const BASE_SERVER_URL = 'https://embed-api-dev.wander.app';

export type WanderOptions = {
    theme?: 'light' | 'dark' | 'system';
    iframeMode?: 'modal' | 'popup' | 'sidebar' | 'half';
    baseURL?: string;
    baseServerURL?: string;
};

type WanderProviderProps = {
    children: ReactNode;
    options?: WanderOptions;
};

export const WanderProvider = ({ children, options }: WanderProviderProps) => {
    const [wander, setWander] = useState<WanderEmbedded | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [wallet, setWallet] = useState<
        typeof window.arweaveWallet | undefined
    >(undefined);
    const [walletInitialized, setWalletInitialized] = useState(false);
    const [connected, setConnected] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);

    const handleOnAuth = useCallback((..._args: any) => {
        setWallet(window.arweaveWallet);
        setAuthenticated(true);
    }, []);

    useEffect(() => {
        const handleArweaveWalletLoaded = (event: CustomEvent) => {
            console.log('Arweave Wallet Loaded event received:', event.detail);
            setPermissions(event.detail.permissions);
            setWalletInitialized(true);
            if (event.detail.permissions?.length) setConnected(true);
            console.log('[WC] Permissions: ', event.detail.permissions);
        };

        // Add the event listener to the window (or the specific dispatcher)
        window.addEventListener(
            'arweaveWalletLoaded',
            handleArweaveWalletLoaded
        );

        const wanderInstance = new WanderEmbedded({
            clientId: 'ALPHA',
            // iframe: {
            //     routeLayout: {
            //         auth: options?.iframeMode || IFRAME_MODE,
            //         default: options?.iframeMode || IFRAME_MODE,
            //         settings: options?.iframeMode || IFRAME_MODE,
            //         'auth-request': options?.iframeMode || IFRAME_MODE,
            //         account: options?.iframeMode || IFRAME_MODE,
            //     },
            // },
            button: {
                position: 'top-right',
                theme: options?.theme || THEME,
            },
            baseURL: options?.baseURL || BASE_URL,
            baseServerURL: options?.baseServerURL || BASE_SERVER_URL,
            onAuth: handleOnAuth,
            //   (userDetails) => {
            //     console.log("[WC] onAuth received", JSON.stringify(userDetails));
            //     setAuthenticated(true);
            //   },
            onBalance: (balanceInfo: BalanceInfo) => {
                console.log(
                    `[WC] onBalance received: ${balanceInfo.currency} ${balanceInfo.amount} - ${balanceInfo.formattedBalance}`
                );
                setWalletInitialized(true);
                window.arweaveWallet
                    .getPermissions()
                    .then((perm) => setConnected(perm?.length ? true : false));
            },
        });
        wanderInstance.open();
        setWander(wanderInstance);
        return () => {
            // remove Wander Connect instance
            wanderInstance.destroy();
            // Clean up the event listener when the component unmounts
            window.removeEventListener(
                'arweaveWalletLoaded',
                handleArweaveWalletLoaded
            );
        };
    }, []);

    function disconnect() {
        window.arweaveWallet.disconnect().finally(() => setConnected(false));
    }

    function connect() {
        window.arweaveWallet
            .connect([
                'ACCESS_ADDRESS',
                'ACCESS_PUBLIC_KEY',
                'ACCESS_ALL_ADDRESSES',
                'SIGN_TRANSACTION',
                'ENCRYPT',
                'DECRYPT',
                'SIGNATURE',
                'DISPATCH',
                // 'ACCESS_TOKENS',
            ])
            .then(() => setConnected(true))
            .catch(() => setConnected(false));
    }

    return (
        <WanderContext.Provider
            value={{
                wander,
                authenticated,
                walletInitialized,
                connected,
                permissions,
                wallet,
                connect,
                disconnect,
            }}
        >
            {children}
        </WanderContext.Provider>
    );
};
