import Header from '../components/Header';
import OpenCard from '../components/cards/OpenCard';
import ConnectCard from '../components/cards/ConnectCard';
import SignMessageCard from '../components/cards/SignMessageCard';
import UploadFileCard from '../components/cards/UploadFileCard';
import SendAOTokenCard from '../components/cards/SendAOTokenCard';
// import CreateAOTokenCard from '../components/cards/CreateAOTokenCard';

export default function Layout() {
    //   const encryptAndDecrypt = async () => {
    //     if (!window.arweaveWallet) {
    //       alert("Can't find `window.arweaveWallet`");
    //       return;
    //     }

    //     const enc = new TextEncoder();
    //     const message = enc.encode("This message was encrypted and decrypted!");
    //     const encrypted = await window.arweaveWallet.encrypt(message, {
    //       name: "RSA-OAEP",
    //     });
    //     const decrypted = await window.arweaveWallet.decrypt(encrypted, {
    //       name: "RSA-OAEP",
    //     });
    //     alert(new TextDecoder().decode(decrypted));
    //   };

    const bgImgStyle = {
        backgroundImage: 'url("/background-big.svg")',
        // backgroundSize: "cover",
        backgroundRepeat: 'repeat',
    };

    return (
        <div className="flex min-h-screen w-full flex-col" style={bgImgStyle}>
            <Header />
            {/* <div className="mt-20 flex flex-col flex-wrap space-y-4 p-4 sm:space-y-8 sm:p-8"> */}
            <div className="mt-20 flex max-h-screen flex-col flex-wrap gap-4 overflow-hidden p-4 sm:gap-6 sm:p-8">
                <OpenCard />
                <ConnectCard />
                <SignMessageCard />
                <UploadFileCard />
                <SendAOTokenCard />
                {/* <CreateAOTokenCard /> */}
            </div>
        </div>
    );
}
