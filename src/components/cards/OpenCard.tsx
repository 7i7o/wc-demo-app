import { useWander } from '../../hooks/useWander';
import { Button } from '../Button';
import Card from '../Card';

export default function OpenCard() {
    const { wander } = useWander();

    return (
        <Card>
            <p>Open Wallet Connect</p>
            <div className="flex flex-col gap-2">
                <Button onClick={() => wander?.open()}>Open</Button>
                {/* {authenticated && (
                    <Button onClick={() => window.alert('Not implemented')}>
                        Logout completely
                    </Button>
                )} */}
            </div>
        </Card>
    );
}
