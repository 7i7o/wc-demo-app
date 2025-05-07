import { useWander } from '../../hooks/useWander';
import { truncateString } from '../../utils/arweaveUtils';

export default function UserInfo() {
    const { connectAuthState } = useWander();

    if (!connectAuthState) return <></>;

    return (
        <div className="absolute left-1/2 my-1.5 flex min-h-14 max-w-fit -translate-x-1/2 flex-row items-center justify-start rounded-lg border bg-white px-2 py-1.5 shadow-md">
            {connectAuthState.authStatus === 'authenticated' &&
            connectAuthState.userDetails ? (
                connectAuthState.userDetails?.picture && (
                    <img
                        className="mr-2 h-14 w-14 rounded-lg"
                        src={connectAuthState.userDetails?.picture}
                        alt="avatar"
                    />
                )
            ) : (
                <div className="mr-2 h-14">&nbsp;</div>
            )}

            <div className="flex max-w-fit flex-col items-start justify-center text-[0.625rem] font-light text-gray-900 dark:text-white">
                <div>
                    Status: {connectAuthState.authStatus} (
                    {connectAuthState.authType})
                </div>
                {connectAuthState.authStatus === 'authenticated' &&
                    connectAuthState.userDetails?.id && (
                        <div>
                            Id:&nbsp;
                            <span title={connectAuthState.userDetails.id}>
                                {truncateString(
                                    connectAuthState.userDetails.id,
                                    8
                                )}
                            </span>
                        </div>
                    )}
                {connectAuthState.authStatus === 'authenticated' &&
                    connectAuthState.userDetails?.email && (
                        <div>Email: {connectAuthState.userDetails?.email}</div>
                    )}
                {connectAuthState.authStatus === 'authenticated' &&
                    connectAuthState.userDetails?.fullName && (
                        <div>
                            Name: {connectAuthState.userDetails?.fullName}
                        </div>
                    )}
            </div>
        </div>
    );
}
