const RE = ({ stateFill, strokeColor }: { stateFill: string, strokeColor: string }) => {
    return (
        <svg viewBox="0 0 600 300">
            <g>
                <text x="139.98" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" fill={stateFill} >a</text>
            </g>
            <g>
                <text x="300" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" fill={stateFill} >b</text>
            </g>
            <g>
                <text x="460" y="150" fontSize="70" fontWeight="bold" textAnchor="middle" fill={stateFill} >*</text>
            </g>
            <line x1="180" y1="135" x2="260" y2="135" stroke="black" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="330" y1="135" x2="400" y2="135" stroke="black" strokeWidth="2" markerEnd="url(#arrow)" />
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="black" />
                </marker>
            </defs>
        </svg>
    );
}

export default RE;
