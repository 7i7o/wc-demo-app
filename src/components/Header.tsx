import UserInfo from './cards/UserInfo';
// import logo from '/logo.svg';
import wclogo from '/WC-logo.svg';

export default function Header() {
    return (
        <div className="fixed left-0 top-0 min-h-[90px] min-w-full flex-col items-center justify-center border-b border-gray-300 bg-gray-50 dark:border-gray-50 dark:bg-gray-900">
            <div className="flex min-h-[90px] items-center justify-between px-3">
                <img
                    className="mr-auto inline-flex h-10"
                    src={wclogo}
                    alt="Wander Connect"
                />
                <UserInfo />
                <div className="ml-auto mr-40">
                    <a
                        className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-normal text-white transition-colors duration-200 hover:bg-blue-700 max-[500px]:hidden"
                        href="https://docs.wander.app"
                        target="_blank"
                    >
                        Start Building →
                    </a>
                </div>
            </div>
        </div>
    );
}
