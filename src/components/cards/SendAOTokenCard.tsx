import { useEffect, useState } from 'react';
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

const DEFAULT_AO_TOKEN = '0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc';
export default function SendAOTokenCard() {
    const { connected, wallet } = useWander();
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [modified, setModified] = useState(false);

    const [quantity, setQuantity] = useState('0');
    const [process, setProcess] = useState(DEFAULT_AO_TOKEN);
    const [target, setTarget] = useState('');
    const [denomination, setDenomination] = useState<number | undefined>(0);
    const [txResult, setTxResult] = useState(emptyTxResult);

    const clearFields = () => {
        setProcess(DEFAULT_AO_TOKEN);
        setQuantity('0');
        setTarget('');
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
            (process !== DEFAULT_AO_TOKEN || quantity !== '0' || target !== '')
        )
            setModified(true);
    }, [process, quantity, target]);

    const validateInputs = () => {
        if (!quantity || !target || !process) return '';
        if (!isValidAddress(process)) {
            console.error(`Process ID address is not a valid AO Process ID`);
            return '';
        }
        if (!isValidAddress(target)) {
            console.error(`Target address is not a valid Arweave address`);
            return '';
        }
        if (!denomination) {
            console.error(`Token Info didn't return a valid denomination`);
            return '';
        }
        let sanitizedQuantity = quantity;
        sanitizedQuantity = quantity.replace(/,|\s/g, '');
        if (sanitizedQuantity.startsWith('.')) {
            sanitizedQuantity = '0' + sanitizedQuantity;
        }
        const tokenAmount = getTokenAmount(sanitizedQuantity, denomination);
        if (!tokenAmount || tokenAmount == '0') {
            console.error(`Not a valid amount`);
            return '';
        }
        return tokenAmount;
    };

    const sendAOToken = async () => {
        if (!wallet || !connected || !ao) return;
        let amount = '';
        try {
            amount = validateInputs();
            if (!amount || amount == '0') {
                console.log('Not a valid amount');
                return;
            }
        } catch (err) {
            console.error(err);
            return;
        }
        setLoading(true);
        try {
            const msgId = await ao?.message({
                ...createMessage(process, [
                    tag('Action', 'Transfer'),
                    tag('Quantity', amount),
                    tag('Recipient', target),
                ]),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Mesage Id: ', msgId);
            setTxResult({
                txId: msgId,
                status: `200`,
                statusMsg: `OK`,
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
                Send a token
                {modified && <button onClick={clearFields}>🗑️</button>}
            </div>
            <div className="flex flex-col gap-2">
                {/* <span className="w-28">Message:</span> */}
                <Input
                    type="text"
                    placeholder="AO Token Address"
                    value={process}
                    onChange={(e) => setProcess(e.target.value)}
                    className="w-full"
                    disabled={loading}
                />
                {process && (
                    <AOTokenInfo
                        process={process}
                        setDenomination={setDenomination}
                        setLoading={setLoading}
                    />
                )}
                Amount:
                <Input
                    type="number"
                    placeholder="Amount"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full"
                    disabled={!isValidAddress(process) || loading}
                />
                Recipient:
                <Input
                    type="text"
                    placeholder="Recipient wallet address"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full"
                    disabled={!isValidAddress(process) || loading}
                />
                <Button
                    onClick={sendAOToken}
                    disabled={!quantity || !target || !process || loading}
                >
                    Send
                </Button>
                {txResult.status && (
                    <TxResult txResult={{ ...txResult, aoResult: true }} />
                )}
            </div>
        </Card>
    );
}
