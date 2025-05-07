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

export const truncateString = (
    str: string,
    charsToShow: number = 4
): string => {
    if (!str) return '';
    if (str.length <= charsToShow * 2 + 3) return str;

    const start = str.substring(0, charsToShow);
    const end = str.substring(str.length - charsToShow);

    return `${start}...${end}`;
};

export const defaultAODetails = {
    module: 'cNlipBptaF9JeFAf4wUmpi43EojNanIBos3EfNrEOWo',
    sqliteModule: 'u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54',
    scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
    authority: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY',
};

export const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries a given function up to a maximum number of attempts.
 * @param fn - The asynchronous function to retry, which should return a Promise.
 * @param maxAttempts - The maximum number of attempts to make.
 * @param initialDelay - The delay between attempts in milliseconds.
 * @param getDelay - A function that returns the delay for a given attempt.
 * @return A Promise that resolves with the result of the function or rejects after all attempts fail.
 */
export async function retryWithDelay<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelay: number = 3000,
    getDelay: (attempt: number) => number = () => initialDelay
): Promise<T> {
    let attempts = 0;

    const attempt = async (): Promise<T> => {
        try {
            return await fn();
        } catch (error) {
            attempts += 1;
            if (attempts < maxAttempts) {
                const currentDelay = getDelay(attempts);
                // console.log(`Attempt ${attempts} failed, retrying...`)
                return new Promise<T>((resolve) =>
                    setTimeout(() => resolve(attempt()), currentDelay)
                );
            } else {
                throw error;
            }
        }
    };

    return attempt();
}
