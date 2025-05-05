import { useEffect, useRef, useState } from 'react';
// import { useTheme } from '../hooks/useTheme';

export interface LetterIconProps {
    letter: string;
    className?: string;
}

export function LetterIcon({ letter, className = '' }: LetterIconProps) {
    const iconRef = useRef<SVGSVGElement | null>(null);
    const [color, setColor] = useState('');
    // const { theme } = useTheme();
    const theme = 'light';

    useEffect(() => {
        if (iconRef.current) {
            const computedStyle = getComputedStyle(iconRef.current);
            const inheritedColor = computedStyle.getPropertyValue('color');
            setColor(inheritedColor);
            // console.log(color);
        }
    }, [theme]);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            ref={iconRef}
            className={className}
        >
            <circle
                cx="50%"
                cy="50%"
                r="30"
                fill={color ? color : theme === 'light' ? 'white' : 'black'}
                opacity="0.5"
            />
            <text
                font-size="20"
                x="12"
                y="19"
                text-anchor="middle"
                font-family="sans-serif"
                color=""
            >
                {letter}
            </text>
        </svg>
    );
}
