export const DEFAULT_GATEWAY = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
};

export const CU_URL = undefined;
// export const CU_URL = 'http://localhost:6363';

export const isValidAddress = (addr: string) =>
    /^[a-zA-Z0-9_-]{43}$/.test(addr);

export type Tag = {
    name: string;
    value: string;
};

export type Message = {
    process: string;
    data?: string;
    tags?: Tag[];
    anchor?: string;
};

export const tag = (k: string, v: string): Tag => {
    return { name: k, value: v };
};

export const createMessage = (process: string, tags?: Tag[]) => {
    return {
        process: process,
        tags: tags ? tags : [],
    };
};

export function convertToBigIntAmount(
    input: number | string,
    denomination: number
) {
    if (isNaN(Number(input)) || Number(input) <= 0) {
        // throw new Error('Input must be a valid number greater than 0');
        console.error('Input must be a valid number greater than 0');
        return 0n;
    }
    const inputStr = input.toString();
    const [integerPart, decimalPart = ''] = inputStr.split('.');
    const decimalPlacesToKeep = Math.min(decimalPart.length, denomination);
    const trimmedDecimal = decimalPart.slice(0, decimalPlacesToKeep);
    const paddedDecimal = trimmedDecimal.padEnd(denomination, '0');
    const fullNumberString = integerPart + paddedDecimal;
    return BigInt(fullNumberString);
}

export function getTokenAmount(input: number | string, denomination: number) {
    const bigIntValue = convertToBigIntAmount(input, denomination);
    return bigIntValue.toString();
}
