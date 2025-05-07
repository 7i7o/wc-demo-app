import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useWander } from '../../hooks/useWander';
import { Button } from '../Button';
import Card from '../Card';
import { Input } from '../Input';
import { useArweave } from '../../hooks/useArweave';
import { emptyTxResult, TxResult } from './TxResult';
import Transaction from 'arweave/node/lib/transaction';
import {
    createMessage,
    defaultAODetails,
    getTokenAmount,
    retryWithDelay,
    tag,
    wait,
} from '../../utils/arweaveUtils';
import { APP_NAME } from '../../hooks/WanderContext';
import contractSrc from '../../lua/token.lua?raw';
import preContractSrc from '../../lua/pre-token.lua?raw';
import postContractSrc from '../../lua/post-token.lua?raw';

// import {
//     createMessage,
//     getTokenAmount,
//     isValidAddress,
//     tag,
// } from '../../utils/arweaveUtils';
// import { AOTokenInfo } from '../AOTokenInfo';
// import { createDataItemSigner } from '@permaweb/aoconnect';

const DEFAULT_NAME = 'WC Test Token';
const DEFAULT_TICKER = 'WCTT';
// const DEFAULT_LOGO = 'W3i_rxUIaEBH-HmPN_FGvaEL17D0lXsK4tVkMDDefyE';
const DEFAULT_LOGO = '_t6kBLj-1kapdStxIODsllvvFmuLflVqNEA-jkgcQ4k';
const DEFAULT_DENOMINATION = 12;
const DEFAULT_TOTAL_SUPPLY = 21_000_000;

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
    const [aoTxResult, setAoTxResult] = useState(emptyTxResult);

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
        console.log(tokenName, tokenTicker, tokenDenomination, totalSupply);
        if (!tokenName || !tokenTicker || !totalSupply) return false;
        if (tokenDenomination < 0) {
            console.error(`Token Denomination should be > 0`);
            return false;
        }
        if (totalSupply < 1 || totalSupply > 1_000_000_000) {
            console.error(`Total Supply should be > 1 and < 1,000,000,000`);
            return false;
        }
        return true;
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

    const calculateTotalSupply = () => {
        let sanitizedQuantity = '';
        sanitizedQuantity = `${totalSupply}`.replace(/,|\s/g, '');
        if (sanitizedQuantity.startsWith('.')) {
            sanitizedQuantity = '0' + sanitizedQuantity;
        }
        const tokenAmount = getTokenAmount(
            sanitizedQuantity,
            tokenDenomination
        );
        if (!tokenAmount || tokenAmount == '0') {
            console.error(`Not a valid total supply`);
            return '';
        }
        return tokenAmount;
    };

    const createAOToken = async () => {
        if (!wallet || !connected || !ao) return;
        if (!validateInputs()) return;
        const trueSupply = calculateTotalSupply();
        setLoading(true);
        window.alert(
            `Trying to deploy token: ${tokenName} (${tokenTicker}) ${tokenLogoTxId} ${tokenDenomination} ${totalSupply}`
        );

        try {
            const tags = [
                tag('App-Name', APP_NAME),
                tag('Name', tokenName),
                tag('Authority', defaultAODetails.authority),
                // tag('On-Boot', 'Data'),
            ];

            const processId = await retryWithDelay(
                () =>
                    ao.spawn({
                        module: defaultAODetails.module,
                        scheduler: defaultAODetails.scheduler,
                        signer: ao.createDataItemSigner(wallet),
                        tags,
                        data: '1984',
                    }),
                5,
                3000
            );

            if (!processId) throw 'Something went wrong, please try again';

            console.log(' | Spawned Process Id: ', processId);

            console.log('Waiting 3s to run eval with the contract source');
            await wait(3000);

            const pre = preContractSrc
                .replace('__TOKEN_NAME__', tokenName)
                .replace('__TOKEN_TICKER__', tokenTicker)
                .replace('__TOKEN_LOGO__', tokenLogoTxId)
                .replace('__TOKEN_DENOMINATION__', `${tokenDenomination}`)
                .replace('__TOTAL_SUPPLY__', trueSupply)
                .replace('__TOTAL_SUPPLY__', trueSupply);
            const finalContractSrc = [pre, contractSrc, postContractSrc]
                .filter(Boolean)
                .join('\n\n')
                .trim();
            console.log(finalContractSrc);

            const evalMsgId = await retryWithDelay(
                async () =>
                    ao.message({
                        process: processId!,
                        tags: [tag('Action', 'Eval')],
                        data: finalContractSrc,
                        signer: ao.createDataItemSigner(wallet),
                    }),
                5,
                3000
            );
            console.log(' | Sent Eval Mesage Id: ', evalMsgId);

            console.log('Waiting 3s to run rugpull');
            await wait(3000);

            const msgId = await retryWithDelay(
                async () =>
                    ao.message({
                        process: processId!,
                        tags: [tag('Action', 'Rugpull')],
                        signer: ao.createDataItemSigner(wallet),
                    }),
                5,
                3000
            );

            console.log(' | Sent Rugpull Mesage Id: ', msgId);

            setAoTxResult({
                status: `200`,
                statusMsg: `ok`,
                txId: processId as string,
                aoResult: true,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                    onClick={() => createAOToken()}
                    disabled={
                        !tokenName || !tokenTicker || !totalSupply || loading
                    }
                >
                    Create
                </Button>
                {aoTxResult.status && <TxResult txResult={{ ...aoTxResult }} />}
            </div>
        </Card>
    );
}
