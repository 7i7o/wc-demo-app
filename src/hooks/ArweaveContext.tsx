import React, { type ReactNode, useMemo } from 'react';
import { ArweaveContext } from '../hooks/useArweave';
import Arweave from 'arweave';
import { DEFAULT_GATEWAY } from '../utils/arweaveUtils';
import { CU_URL } from '../utils/arweaveUtils';
import { connect } from '@permaweb/aoconnect';

export const ArweaveProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const arweave = useMemo(() => Arweave.init(DEFAULT_GATEWAY), []);
    const ao = useMemo(() => {
        let message, dryrun, result, spawn, createDataItemSigner;
        if (CU_URL) {
            const {
                message: m,
                dryrun: d,
                result: r,
                spawn: s,
                createDataItemSigner: c,
            } = connect({ MODE: 'legacy', CU_URL });
            message = m;
            dryrun = d;
            result = r;
            spawn = s;
            createDataItemSigner = c;
        } else {
            const {
                message: m,
                dryrun: d,
                result: r,
                spawn: s,
                createDataItemSigner: c,
            } = connect({ MODE: 'legacy' });
            message = m;
            dryrun = d;
            result = r;
            spawn = s;
            createDataItemSigner = c;
        }
        return { message, dryrun, result, spawn, createDataItemSigner };
    }, []);

    return (
        <ArweaveContext.Provider
            value={{
                arweave,
                ao,
            }}
        >
            {children}
        </ArweaveContext.Provider>
    );
};
