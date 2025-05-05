import { AuthState, WanderEmbedded } from '@wanderapp/embed-sdk';
import { createContext, useContext } from 'react';

export interface WanderContextType {
    wander: WanderEmbedded | null;
    authenticated: boolean;
    walletInitialized: boolean;
    connected: boolean;
    permissions: string[];
    wallet?: typeof window.arweaveWallet;
    connect: () => void;
    disconnect: () => void;
    connectAuthState: AuthState | null;
}

export const WanderContext = createContext<WanderContextType | undefined>(
    undefined
);

export const useWander = () => {
    const context = useContext(WanderContext);
    if (context === undefined) {
        throw new Error('useWander must be used within a WanderProvider');
    }

    return context;
};
