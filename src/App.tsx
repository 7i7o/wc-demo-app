import { ArweaveProvider } from './hooks/ArweaveContext';
import { WanderProvider } from './hooks/WanderContext';
import Layout from './layout/Layout';

function App() {
    return (
        <ArweaveProvider>
            <WanderProvider
                options={{
                    iframeMode: 'sidebar',
                    // baseURL:
                    //     'https://wander-embed-dev-git-fix-arc-1209-impleme-a19d10-community-labs.vercel.app',
                }}
            >
                <Layout />
            </WanderProvider>
        </ArweaveProvider>
    );
}

export default App;
