import logo from '/logo.svg';

export default function Header() {
    return (
        <div className="fixed left-0 top-0 min-h-4 min-w-full flex-col justify-start border-b border-gray-300 bg-gray-50 py-5 dark:border-gray-50 dark:bg-gray-900">
            <h1 className="flex items-center pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                <img
                    className="mr-2 inline-flex w-12"
                    src={logo}
                    alt="Wander Connect"
                />
                Demo App
            </h1>
        </div>
    );
}
