import { useEffect, useState } from 'react';
import {
    createMessage,
    isValidAddress,
    type Tag,
    tag,
} from '../utils/arweaveUtils';
import { dryrun } from '@permaweb/aoconnect';
import { LoaderPinwheel } from 'lucide-react';
import { LetterIcon } from './LetterIcon';

export function AOTokenInfo(props: {
    process: string;
    setDenomination: (n: number | undefined) => void;
    setLoading: (b: boolean) => void;
}) {
    const { process, setDenomination, setLoading: setLoadingParent } = props;
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<Tag[] | undefined>();

    const [name, setName] = useState('');
    const [ticker, setTicker] = useState('');
    const [logo, setLogo] = useState('');
    const [, setTokenDenomination] = useState('');

    useEffect(() => {
        if (!isValidAddress(process)) {
            setLoading(false);
            setLoadingParent(false);
            setTags(undefined);
        }

        const getTokenInfo = async (addr: string) => {
            setLoading(true);
            setLoadingParent(true);
            try {
                const info = await dryrun(
                    createMessage(addr, [tag('Action', 'Info')])
                );
                console.log(info);
                if (!info || !info.Messages || !info.Messages[0].Tags) {
                    setTags(undefined);
                    return;
                }
                console.log(info);
                setTags(info.Messages[0].Tags);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
                setLoadingParent(false);
            }
        };

        getTokenInfo(process);
    }, [process]);

    useEffect(() => {
        setName('');
        setTicker('');
        setLogo('');
        setTokenDenomination('');
        tags?.forEach((t) => {
            switch (t.name) {
                case 'Name':
                    setName(t.value);
                    break;
                case 'Ticker':
                    setTicker(t.value);
                    break;
                case 'Logo':
                    setLogo(t.value);
                    break;
                case 'Denomination':
                    setTokenDenomination(t.value);
                    setDenomination(Number(t.value));
                    break;
                default:
                    break;
            }
        });
    }, [tags]);

    if (loading)
        return <LoaderPinwheel className="ml-2 h-8 w-8 animate-spin" />;

    if (!process || !tags) {
        setDenomination(undefined);
        return;
    }

    return (
        <div className="ml-2 flex items-center justify-start">
            {(logo || name || ticker) && (
                <a
                    target="_blank"
                    href={`https://www.ao.link/#/token/${process}`}
                    className="flex items-center justify-start gap-2"
                >
                    {logo && (
                        <img
                            src={`https://arweave.net/${logo}`}
                            alt="logo"
                            className="inline-flex h-8 w-8 rounded-full"
                        />
                    )}
                    {!logo && ticker && (
                        <LetterIcon
                            letter={ticker.substring(0, 1)}
                            className="w-8 rounded-full bg-white text-slate-500"
                        />
                    )}
                    {name && <span>{name}</span>}
                    {ticker && <span>({ticker})</span>}
                </a>
            )}
        </div>
    );
}
