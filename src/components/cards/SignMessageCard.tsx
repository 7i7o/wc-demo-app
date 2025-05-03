import { useEffect, useState } from 'react';
import { useWander } from '../../hooks/useWander';
import { Button } from '../Button';
import Card from '../Card';
import { Input } from '../Input';

const PLACEHOLDER_MSG = 'Example message to sign';
export default function SignMessageCard() {
    const { connected, wallet } = useWander();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(PLACEHOLDER_MSG);
    const [signedMsg, setSignedMsg] = useState('');
    const [verifiedMsg, setVerifiedMsg] = useState<boolean | undefined>();
    const [modified, setModified] = useState(false);

    const clearFields = () => {
        setVerifiedMsg(undefined);
        setSignedMsg('');
        setMessage(PLACEHOLDER_MSG);
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
            (message !== PLACEHOLDER_MSG ||
                signedMsg ||
                verifiedMsg !== undefined)
        )
            setModified(true);
    }, [message, signedMsg, verifiedMsg]);

    const signMessage = async () => {
        if (!wallet) {
            window.alert('Wander Connect is not loaded yet');
            return;
        }

        setLoading(true);
        try {
            const data = new TextEncoder().encode(message);

            const signedMessage = await (wallet as any)?.signMessage(data);

            const b64SignedMessageResult = btoa(
                String.fromCharCode(...signedMessage)
            );
            setSignedMsg(b64SignedMessageResult);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    function b64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const byteNumbers = new Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            byteNumbers[i] = binaryString.charCodeAt(i);
        }

        return new Uint8Array(byteNumbers);
    }

    const verify = async () => {
        if (!signedMsg || !wallet) return;
        setLoading(true);
        try {
            const data = new TextEncoder().encode(message);
            const signature = b64ToUint8Array(signedMsg);
            setVerifiedMsg(
                await (wallet as any).verifyMessage(data, signature)
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!connected) return <></>;

    return (
        <Card>
            <div className="flex w-full justify-between items-start">
                Sign a Message
                {modified && (
                    <button
                        onClick={clearFields}
                    >
                        🗑️
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-2">
                {/* <span className="w-28">Message:</span> */}
                <Input
                    type="text"
                    placeholder="Enter your message to sign!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full"
                />
                <Button onClick={() => signMessage()} disabled={!connected}>
                    Sign Message
                </Button>
                {signedMsg && (
                    <>
                        <span className="w-28">Signature:</span>
                        <Input
                            type="text"
                            placeholder="Enter your encrypted message!"
                            value={signedMsg}
                            onChange={(e) => setSignedMsg(e.target.value)}
                            className="w-full"
                        />
                        <Button
                            variant="outline"
                            onClick={verify}
                            disabled={!message || !signedMsg || loading}
                        >
                            Verify Signature
                        </Button>
                        {!signedMsg
                            ? ''
                            : `Verification result:
                            ${
                                verifiedMsg === undefined
                                    ? '❔'
                                    : verifiedMsg
                                      ? '✅'
                                      : '❌'
                            }`}
                    </>
                )}
            </div>
        </Card>
    );
}
