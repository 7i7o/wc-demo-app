import { type InputHTMLAttributes } from 'react';

export function Input(
    props: React.PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>
) {
    const { children } = props;
    return (
        <input
            {...props}
            className={`${props.className} rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-950`}
        >
            {children}
        </input>
    );
}
