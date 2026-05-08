import L from 'leaflet';

export const WateringCan = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        className={className}
    >
        <g transform="translate(12,12) rotate(-15) translate(-12,-12)">
            <path 
                d="M15 7.5A4.5 4.5 0 0 1 20.5 12" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
            />
            <rect 
                x="8" y="7" width="10" height="9" rx="2" 
                fill="currentColor" 
                opacity="0.3"
            />
            <rect 
                x="8" y="7" width="10" height="9" rx="2" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
            />
            <path 
                d="M8 13.5l-4-0.5c-1 0-1 1-1 2s0 2 1 2l4-1" 
                fill="currentColor"
            />
            <g transform="translate(-1, 15)">
                <path d="M-1 1c-1.5 2-2 5-2 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
                <path d="M1 2c-1 2-1 5-1 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
                <path d="M3 0c-1 2-1 5-1 7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 4" opacity="0.6" />
            </g>
        </g>
    </svg>
);

export const seedlingIcon = L.divIcon({
    html: `<div class="w-12 h-12 flex items-center justify-center filter drop-shadow-xl transition-all hover:scale-110 active:scale-95 text-3xl">
        🌱
       </div>`,
    className: 'bg-transparent border-0',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});

export const maturePlantIcon = L.divIcon({
    html: `<div class="w-14 h-14 flex items-center justify-center filter drop-shadow-xl transition-all hover:scale-110 active:scale-95 text-4xl">
        🌳
       </div>`,
    className: 'bg-transparent border-0',
    iconSize: [56, 56],
    iconAnchor: [28, 28]
});

export const dropletIcon = L.divIcon({
    html: `<div class="w-20 h-20 relative flex items-center justify-center overflow-visible">
        <style>
            @keyframes dropletGlow {
                0% { transform: scale(0.65); opacity: 0.8; }
                100% { transform: scale(1.3); opacity: 0; }
            }
            .droplet-pulse {
                animation: dropletGlow 2s ease-out infinite;
            }
        </style>
        <svg viewBox="0 0 100 100" width="80" height="80" class="absolute droplet-pulse">
            <path d="M50 5 C 65 30, 80 45, 80 65 A 30 30 0 1 1 20 65 C 20 45, 35 30, 50 5 Z" style="fill: #00B0FF;" opacity="0.4" />
        </svg>
        
        <svg viewBox="0 0 100 100" width="44" height="44" class="relative z-10 drop-shadow-xl">
          <path d="M50 5 C 65 30, 80 45, 80 65 A 30 30 0 1 1 20 65 C 20 45, 35 30, 50 5 Z" style="fill: #00B0FF;" />
          <path d="M50 20 C 60 35, 70 50, 70 65" stroke="white" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.4" />
          <circle cx="35" cy="60" r="5" fill="white" opacity="0.3" />
        </svg>
       </div>`,
    className: 'bg-transparent border-0',
    iconSize: [80, 80],
    iconAnchor: [40, 68]
});
