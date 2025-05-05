export interface TxResultProps {
    txId: string;
    status: string;
    statusMsg: string;
    aoResult?: boolean;
    variant?: 'mini' | 'default';
}

export const emptyTxResult: TxResultProps = {
    txId: '',
    status: '',
    statusMsg: '',
};

export function TxResult(props: { txResult: TxResultProps }) {
    const {
        txId,
        status,
        statusMsg,
        aoResult = false,
        variant = 'default',
    } = props.txResult;
    return (
        <div className="flex items-center">
            {status !== '200' && (
                <p>
                    Result: ❌ Error uploading file to Arweave: {status} -{' '}
                    {statusMsg}
                </p>
            )}
            {status === '200' && !aoResult ? (
                variant === 'mini' ? (
                    <p>
                        {'✅ View in '}
                        <a
                            target="_blank"
                            className="font-bold text-blue-500 hover:underline"
                            href={`https://arweave.net/${txId}`}
                        >
                            Arweave
                        </a>
                        {' or '}
                        <a
                            target="_blank"
                            className="font-bold text-blue-500 hover:underline"
                            href={`https://viewblock.io/arweave/tx/${txId}`}
                        >
                            Viewblock
                        </a>
                    </p>
                ) : (
                    <p>
                        {'✅ View your '}
                        <a
                            target="_blank"
                            className="font-bold text-blue-500 hover:underline"
                            href={`https://arweave.net/${txId}`}
                        >
                            uploaded file
                        </a>
                        {' in Arweave or your tx in '}
                        <a
                            target="_blank"
                            className="font-bold text-blue-500 hover:underline"
                            href={`https://viewblock.io/arweave/tx/${txId}`}
                        >
                            Viewblock
                        </a>
                        &nbsp;(it may take a few minutes for it to be picked up
                        by the explorer)
                    </p>
                )
            ) : (
                <p>
                    {'✅ View your tx in '}
                    <a
                        target="_blank"
                        className="font-bold hover:underline"
                        href={`https://www.ao.link/#/message/${txId}`}
                    >
                        AO Link
                    </a>
                </p>
            )}
        </div>
    );
}
