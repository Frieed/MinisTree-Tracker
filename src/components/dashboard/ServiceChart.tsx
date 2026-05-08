import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ServiceChartProps {
  reportsByMonth: any;
  currentMonthName: string;
  months: string[];
  yearlyQuota: number;
  monthlySummary?: any[];
}

export const ServiceChart = memo(({ reportsByMonth, currentMonthName, months, yearlyQuota, monthlySummary }: ServiceChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    const activeMonths = months.filter((m: string) => months.indexOf(m) <= months.indexOf(currentMonthName));

    let accumulated = 0;
    const goalsData = activeMonths.map((m: string, idx: number) => {
      const goalCalc = (yearlyQuota - accumulated) / (12 - idx);
      const activeGoal = isNaN(goalCalc) || !isFinite(goalCalc) ? 0 : goalCalc;
      accumulated += (reportsByMonth[m]?.hours || 0);
      return activeGoal;
    });

    const data = activeMonths.map((m: string) => reportsByMonth[m]?.hours || 0);
    const schedData = activeMonths.map((m: string) => {
      const summaryItem = monthlySummary?.find(s => s.month === m);
      return summaryItem?.projectedSchedule || 0;
    });
    const labels = activeMonths.map((m: string) => m[0]);

    const maxVal = 70;
    const width = 300;
    const height = 100;
    const padding = 20;

    const points = data.map((val, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * (width - padding * 2) + padding : padding;
      const y = height - (val / maxVal) * (height - padding) - padding / 2;
      return `${x},${y}`;
    }).join(' ');

    const goalPoints = goalsData.map((val: number, i: number) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * (width - padding * 2) + padding : padding;
      const y = height - (val / maxVal) * (height - padding) - padding / 2;
      return `${x},${y}`;
    }).join(' ');

    const schedPoints = schedData.map((val: number, i: number) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * (width - padding * 2) + padding : padding;
      const y = height - (val / maxVal) * (height - padding) - padding / 2;
      return `${x},${y}`;
    }).join(' ');

    return { points, goalPoints, schedPoints, labels, data, activeMonths, width, height, padding, maxVal };
  }, [reportsByMonth, currentMonthName, months, yearlyQuota, monthlySummary]);

  const { points, goalPoints, schedPoints, labels, data, activeMonths, width, height, padding, maxVal } = chartData;

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <svg viewBox={`0 0 ${width} ${height}`} className="flex-1 w-full overflow-visible">
        {[0, 25, 50, 75].map(v => {
          const y = height - ((v / maxVal * 100) / 100 * (height - padding)) - padding / 2;
          return <line key={v} x1="0" y1={y} x2={width} y2={y} stroke="#FAF5EE" strokeWidth="1" />
        })}

        <motion.polyline
          points={goalPoints}
          fill="none"
          stroke="#D2B48C"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {monthlySummary && (
          <motion.polyline
            points={schedPoints}
            fill="none"
            stroke="#84A98C"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
            initial={{ pathLength: 0 }}
            animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        )}

        <path
          d={`M ${padding},${height} ${points} L ${width - padding},${height} Z`}
          fill="url(#gradient-area)"
          className="opacity-20"
        />

        <motion.polyline
          fill="none"
          stroke="#6B8E23"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          initial={{ pathLength: 0 }}
          animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {data.map((val, i) => {
          const x = data.length > 1 ? (i / (data.length - 1)) * (width - padding * 2) + padding : padding;
          const y = height - (val / maxVal) * (height - padding) - padding / 2;
          const isActive = activeIndex === i;
          
          return (
            <g key={i} onClick={() => setActiveIndex(isActive ? null : i)} className="cursor-pointer">
              {/* Invisible larger circle for easier clicking */}
              <circle cx={x} cy={y} r="15" fill="transparent" />
              
              <motion.circle
                cx={x} cy={y} r={isActive ? "6" : "4"}
                fill="#6B8E23"
                initial={{ scale: 0 }}
                animate={isVisible ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: i * 0.1 + 1 }}
                className="transition-all duration-300"
              />
              
              {(i === data.length - 1 && activeIndex === null) && (
                <text x={x} y={y - 8} fontSize="8" fontWeight="900" textAnchor="middle" fill="#6B8E23" className="pointer-events-none">
                  {val}
                </text>
              )}

              {/* Tooltip for active point */}
              {isActive && (
                <g className="pointer-events-none transition-opacity duration-300">
                  <rect 
                    x={x - 25} 
                    y={y - 28} 
                    width="50" 
                    height="20" 
                    rx="4" 
                    fill="#fff" 
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    filter="drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))"
                  />
                  <text x={x} y={y - 19} fontSize="5" fontWeight="800" textAnchor="middle" fill="#9ca3af" className="uppercase tracking-wider">
                    {activeMonths[i]}
                  </text>
                  <text x={x} y={y - 11} fontSize="7" fontWeight="900" textAnchor="middle" fill="#6B8E23">
                    {val} hrs
                  </text>
                </g>
              )}
            </g>
          );
        })}

        <defs>
          <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B8E23" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-between px-2 mt-2">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] font-black text-nature-brown-light">{l}</span>
        ))}
      </div>
    </div>
  );
});

ServiceChart.displayName = 'ServiceChart';

