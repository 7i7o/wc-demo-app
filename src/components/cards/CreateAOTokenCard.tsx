import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useWander } from '../../hooks/useWander';
import { Button } from '../Button';
import Card from '../Card';
import { Input } from '../Input';
import { useArweave } from '../../hooks/useArweave';
import {
    createMessage,
    getTokenAmount,
    isValidAddress,
    tag,
} from '../../utils/arweaveUtils';
import { emptyTxResult, TxResult } from './TxResult';
import { AOTokenInfo } from '../AOTokenInfo';
import { createDataItemSigner } from '@permaweb/aoconnect';
import Transaction from 'arweave/node/lib/transaction';

const DEFAULT_NAME = 'WC Test Token';
const DEFAULT_TICKER = 'WCTT';
const DEFAULT_LOGO = 'W3i_rxUIaEBH-HmPN_FGvaEL17D0lXsK4tVkMDDefyE';
const DEFAULT_DENOMINATION = 12;
const DEFAULT_TOTAL_SUPPLY = 21_000_000;

const acceptedFileTypes = [];

export default function CreateAOTokenCard() {
    const { connected, wallet } = useWander();
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [modified, setModified] = useState(false);

    const [tokenName, setTokenName] = useState(DEFAULT_NAME);
    const [tokenTicker, setTokenTicker] = useState(DEFAULT_TICKER);
    const [tokenDenomination, setTokenDenomination] =
        useState<number>(DEFAULT_DENOMINATION);
    const [totalSupply, setTotalSupply] =
        useState<number>(DEFAULT_TOTAL_SUPPLY);
    const [tokenLogoTxId, setTokenLogoTxId] = useState(DEFAULT_LOGO);

    const { arweave } = useArweave();
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [txResult, setTxResult] = useState(emptyTxResult);

    const clearFields = () => {
        setTokenName(DEFAULT_NAME);
        setTokenTicker(DEFAULT_TICKER);
        setTokenLogoTxId(DEFAULT_LOGO);
        setTokenDenomination(DEFAULT_DENOMINATION);
        setTotalSupply(DEFAULT_TOTAL_SUPPLY);

        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setTxResult(emptyTxResult);
        setLoading(false);
        setModified(false);
    };

    useEffect(() => {
        if (connected) return;

        clearFields();
    }, [connected]);

    useEffect(() => {
        if (
            !modified &&
            (tokenName !== DEFAULT_NAME ||
                tokenTicker !== DEFAULT_TICKER ||
                tokenLogoTxId !== DEFAULT_LOGO ||
                tokenDenomination !== DEFAULT_DENOMINATION ||
                totalSupply !== DEFAULT_TOTAL_SUPPLY)
        )
            setModified(true);
    }, [tokenName, tokenTicker, tokenLogoTxId, tokenDenomination, totalSupply]);

    const validateInputs = () => {
        if (!tokenName || !tokenTicker || !totalSupply) return false;
        if (tokenDenomination < 0) {
            console.error(`Token Denomination should be > 0`);
            return false;
        }
        if (totalSupply < 1 || totalSupply > 1_000_000_000) {
            console.error(`Total Supply should be > 1 and < 1,000,000,000`);
            return false;
        }
        return false;
    };

    const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
        setFile(
            !event.target.files
                ? null
                : !event.target.files[0]
                  ? null
                  : event.target.files[0]
        );
    };

    const changeLogo = async () => {
        if (!file || !wallet) return;
        const data = new Uint8Array(await file.arrayBuffer());
        if (data.byteLength > 100_000) {
            window.alert('Please select a file size <100kb to upload');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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

    const uploadFile = async (tx: Transaction) => {
        setLoading(true);
        if (tx && wallet) {
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

    useEffect(() => {
        changeLogo().then((tx) => {
            if (tx) uploadFile(tx);
        });
    }, [file]);

    useEffect(() => {
        if (
            txResult.txId &&
            txResult.status == '200' &&
            txResult.statusMsg == 'ok'
        ) {
            setTokenLogoTxId(txResult.txId);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [txResult]);

    const createAOToken = async () => {
        if (!wallet || !connected || !ao) return;
        // try uploading the logo

        let amount = '';
        if (!validateInputs()) return;
        setLoading(true);
        alert(
            `Trying to deploy token: ${tokenName} (${tokenTicker}) ${file} ${tokenDenomination} ${totalSupply}`
        );
        // try {
        //     const msgId = await ao?.message({
        //         ...createMessage(process, [
        //             tag('Action', 'Transfer'),
        //             tag('Quantity', amount),
        //             tag('Recipient', target),
        //         ]),
        //         signer: createDataItemSigner(window.arweaveWallet),
        //     });
        //     console.log(' | Sent Mesage Id: ', msgId);
        //     setTxResult({
        //         txId: msgId,
        //         status: `200`,
        //         statusMsg: `OK`,
        //     });
        // } catch (err) {
        //     console.error(err);
        // } finally {
        //     setLoading(false);
        // }
    };

    if (!connected) return <></>;

    return (
        <Card>
            <div className="flex w-full items-start justify-between">
                Create your token
                {modified && <button onClick={clearFields}>🗑️</button>}
            </div>
            <div className="flex flex-col gap-2">
                {/* <span className="w-28">Message:</span> */}
                Name:
                <Input
                    type="text"
                    placeholder="WC Test Token"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full"
                    disabled={loading}
                />
                <div className="grid grid-cols-2 items-center justify-start gap-x-4">
                    <div>Logo:</div>
                    <div>Ticker:</div>
                    <div>
                        <img
                            className="w-12"
                            alt="Token Logo"
                            src={`https://arweave.net/${tokenLogoTxId}`}
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            placeholder="WCTT"
                            value={tokenTicker}
                            onChange={(e) => setTokenTicker(e.target.value)}
                            className="w-full"
                            disabled={loading}
                        />
                    </div>
                </div>
                <details>
                    <summary className="mb-1">Change Logo</summary>
                    <input
                        // className="mt-2"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleChangeFile}
                        accept="image/png, image/gif, image/jpeg, image/svg+xml"
                    />
                    {txResult.status && (
                        <TxResult txResult={{ ...txResult, variant: 'mini' }} />
                    )}
                </details>
                <details>
                    <summary className="mb-1">Advanced Config</summary>
                    Denomination:
                    <Input
                        type="number"
                        placeholder="Denomination (decimals for your token)"
                        value={tokenDenomination}
                        onChange={(e) =>
                            setTokenDenomination(Number(e.target.value))
                        }
                        className="w-full"
                        disabled={loading}
                    />
                    Total Supply to Mint:
                    <Input
                        type="number"
                        placeholder="Amount of tokens to mint"
                        value={totalSupply}
                        onChange={(e) => setTotalSupply(Number(e.target.value))}
                        className="w-full"
                        disabled={loading}
                    />
                </details>
                <Button
                    onClick={createAOToken}
                    disabled={
                        !tokenName || !tokenTicker || !totalSupply || loading
                    }
                >
                    Create
                </Button>
            </div>
        </Card>
    );
}
