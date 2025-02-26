const T = ({ stateFill, strokeColor }: { stateFill: string, strokeColor: string }) => {
    return (
        <svg viewBox="0 0 600 300">
            <g>
                <circle cx="139.98" cy="79.08" r="48.69" fill={stateFill} />
                <path d="M139.98,32.39c25.74,0,46.69,20.94,46.69,46.69s-20.94,46.69-46.69,46.69-46.69-20.94-46.69-46.69,20.94-46.69,46.69-46.69m0-4c-27.99,0-50.69,22.69-50.69,50.69s22.69,50.69,50.69,50.69,50.69-22.69,50.69-50.69-22.69-50.69-50.69-50.69h0Z" fill={strokeColor} />
            </g>
            <g>
                <circle cx="491.05" cy="220.92" r="48.69" fill={stateFill} />
                <path d="M491.05,174.24c25.74,0,46.69,20.94,46.69,46.69s-20.94,46.69-46.69,46.69-46.69-20.94-46.69-46.69,20.94-46.69,46.69-46.69m0-4c-27.99,0-50.69,22.69-50.69,50.69s22.69,50.69,50.69,50.69,50.69-22.69,50.69-50.69-22.69-50.69-50.69-50.69h0Z" fill={strokeColor} />
            </g>
            <line x1="300" y1="0" x2="300" y2="300" stroke={strokeColor} strokeWidth="4" />
            <text x="139.98" y="160" fontSize="30" textAnchor="middle" fill={strokeColor}>Task</text>
            <text x="491.05" y="150" fontSize="30" textAnchor="middle" fill={strokeColor}>Solution</text>
        </svg>
    );
}

export default T;
