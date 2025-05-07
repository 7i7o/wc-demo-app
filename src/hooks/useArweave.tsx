import Arweave from 'arweave';
import { createContext, useContext } from 'react';
import { connect } from '@permaweb/aoconnect';

export interface ArweaveContextType {
    arweave: Arweave;
    ao?: {
        message: any;
        dryrun: any;
        result: any;
        spawn: any;
        createDataItemSigner: any;
    };
}

interface ArweaveOptions {
    cuUrl?: string;
}

export const ArweaveContext = createContext<ArweaveContextType | undefined>(
    undefined
);

export const useArweave = (options?: ArweaveOptions) => {
    const context = useContext(ArweaveContext);
    if (context === undefined) {
        throw new Error('useArweave must be used within a ArweaveProvider');
    }

    // If options.cuUrl is provided, create a new AO instance with the custom CU_URL
    if (options?.cuUrl && context.ao) {
        const { message, dryrun, result, spawn, createDataItemSigner } =
            connect({
                MODE: 'legacy',
                CU_URL: options.cuUrl,
            });
        return {
            ...context,
            ao: { message, dryrun, result, spawn, createDataItemSigner },
        };
    }

    return context;
};
