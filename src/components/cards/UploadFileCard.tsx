import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useWander } from '../../hooks/useWander';
import { Button } from '../Button';
import Card from '../Card';
import { useArweave } from '../../hooks/useArweave';
import { emptyTxResult, TxResult } from './TxResult';

export default function UploadFileCard() {
    const { connected, wallet } = useWander();

    const [file, setFile] = useState<File | null>(null);
    const { arweave } = useArweave();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [txResult, setTxResult] = useState(emptyTxResult);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connected) return;

        setFile(null);
        setTxResult(emptyTxResult);
        setLoading(false);
    }, [connected]);

    const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
        setFile(
            !event.target.files
                ? null
                : !event.target.files[0]
                  ? null
                  : event.target.files[0]
        );
    };

    const createTxWithFile = async () => {
        if (!file) return;
        const data = new Uint8Array(await file.arrayBuffer());
        if (data.byteLength > 100_000) {
            window.alert('Please select a file size <100kb to upload');
            return;
        }
        const tx = await arweave.createTransaction({
            data,
        });
        tx.addTag('Content-Type', file.type);
        tx.addTag('File-Name', file.name);
        tx.addTag('App-Name', 'Wander Connect');
        return tx;
    };

    const uploadFile = async () => {
        if (!file || !arweave || !wallet) return;
        setLoading(true);
        const tx = await createTxWithFile();
        if (tx) {
            let signedTx, postResult;
            postResult = await wallet.dispatch(tx);
            setTxResult({
                txId: postResult.id,
                status: `200`,
                statusMsg: `ok`,
            });
            console.log(' | Signed Tx: ', signedTx);
            console.log(' | Post Result: ', postResult);
        }
        setLoading(false);
    };

    if (!connected) return;

    return (
        <Card>
            <p>{'Upload a File to Arweave (<100kb)'}</p>
            <div className="flex flex-col gap-2">
                <input
                    className="mt-2"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChangeFile}
                />
                <Button
                    onClick={() => uploadFile()}
                    disabled={!connected || !wallet || loading}
                >
                    Upload
                </Button>
            </div>
            {txResult.status && <TxResult txResult={txResult} />}
        </Card>
    );
}
