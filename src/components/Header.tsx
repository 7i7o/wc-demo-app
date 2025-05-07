import UserInfo from './cards/UserInfo';
// import logo from '/logo.svg';
import wclogo from '/WC-logo.svg';

export default function Header() {
    return (
        <div className="fixed left-0 top-0 min-h-20 min-w-full flex-col items-center justify-center border-b border-gray-300 bg-gray-50 dark:border-gray-50 dark:bg-gray-900">
            <div className="flex min-h-20 items-center justify-between px-3">
                <img
                    className="mr-auto inline-flex h-10"
                    src={wclogo}
                    alt="Wander Connect"
                />
                <UserInfo />
                <div>&nbsp;</div>
            </div>
        </div>
    );
}
