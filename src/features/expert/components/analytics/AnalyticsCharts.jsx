import { motion } from 'motion/react';

export function Sparkline({ data, color = '#8b5cf6', height = 32, width = 80 }) {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <svg width={width} height={height} className="flex-shrink-0">
            <defs>
                <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function DonutChart({ value, size = 80, strokeWidth = 8, color = '#8b5cf6', label }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-base-300"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black text-base-content">{value}%</span>
                {label && <span className="text-[8px] font-bold uppercase text-base-content/40">{label}</span>}
            </div>
        </div>
    );
}

export function BarChartCSS({ data, barColor = 'from-violet-500 to-fuchsia-500', height = 160 }) {
    const max = Math.max(...data.map((item) => item.value));

    return (
        <div className="flex items-end gap-1.5" style={{ height }}>
            {data.map((item, index) => {
                const computedHeight = Math.max(4, (item.value / (max * 1.15)) * (height - 20));
                const isMax = item.value === max;

                return (
                    <div key={`${item.label}-${index}`} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
                        <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-base-content px-2 py-0.5 text-[9px] font-bold text-base-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {item.value.toLocaleString()} {item.suffix || ''}
                        </div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: computedHeight }}
                            transition={{ delay: 0.3 + index * 0.05, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className={`w-full cursor-pointer rounded-lg transition-colors ${
                                isMax
                                    ? `bg-gradient-to-t ${barColor} shadow-md`
                                    : 'bg-violet-500/20 group-hover:bg-violet-500/40'
                            }`}
                        />
                        <span className="text-[9px] font-bold text-base-content/40">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
