/// <reference types="vite/client" />
/// <reference types="arconnect" />

declare module '*.lua' {
    const content: string;
    export default content;
}
