export interface TxResultProps {
    txId: string;
    status: string;
    statusMsg: string;
    aoResult?: boolean;
}

export const emptyTxResult: TxResultProps = {
    txId: '',
    status: '',
    statusMsg: '',
};

export function TxResult(props: { txResult: TxResultProps }) {
    const { txId, status, statusMsg, aoResult = false } = props.txResult;
    return (
        <div className="flex items-center">
            {status !== '200' && (
                <p>
                    Result: ❌ Error uploading file to Arweave: {status} -{' '}
                    {statusMsg}
                </p>
            )}
            {status === '200' && (
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
                    {aoResult ? (
                        <a
                            target="_blank"
                            className="font-bold hover:underline"
                            href={`https://www.ao.link/#/message/${txId}`}
                        >
                            AO Link
                        </a>
                    ) : (
                        <a
                            target="_blank"
                            className="font-bold text-blue-500 hover:underline"
                            href={`https://viewblock.io/arweave/tx/${txId}`}
                        >
                            Viewblock
                        </a>
                    )}
                    &nbsp;(it may take a few minutes for it to be picked up by
                    the explorer)
                </p>
            )}
        </div>
    );
}
