const TE = ({ stateFill, strokeColor }: { stateFill: string, strokeColor: string }) => {
    return (
        <svg viewBox="0 0 600 300">
            <g>
                <text x="50" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" stroke="black" strokeWidth="3">a</text>
                <text x="150" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" stroke="black" strokeWidth="3">b</text>
                <text x="250" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" fill="black" stroke="black" strokeWidth="3">*</text>
            </g>
            <line x1="300" y1="0" x2="300" y2="300" stroke={strokeColor} strokeWidth="2" />
            <g transform="translate(375, 0)">
                <text x="50" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" fill={stateFill} strokeWidth="3">a</text>
                <text x="150" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" fill={stateFill} strokeWidth="3">b</text>
                <text x="250" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" fill={stateFill} strokeWidth="3">*</text>
            </g>
        </svg>
    );
}

export default TE;
