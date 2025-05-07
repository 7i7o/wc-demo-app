import { useWander } from '../../hooks/useWander';
import { Button } from '../Button';
import Card from '../Card';

export default function ConnectCard() {
    const { walletInitialized, connected, connect, disconnect, wander } =
        useWander();

    return (
        <Card>
            <p>Wallet Connect SDK Calls</p>
            <div className="flex flex-col gap-2">
                <Button onClick={() => wander?.open()}>Open</Button>
                {walletInitialized && !connected ? (
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => connect()}>Connect</Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => disconnect()}>Disconnect</Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
