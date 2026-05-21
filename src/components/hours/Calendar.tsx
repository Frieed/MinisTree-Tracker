import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { CountUp } from '../common/CountUp';

interface CalendarReportItem {
    date: string;
    hours: number | string;
    credit?: number | string | null;
}

interface CalendarDailySchedule {
    date: string;
    hours: number | string;
}

interface CalendarProps {
    currentDate: Date;
    reports: CalendarReportItem[];
    dailySchedules: CalendarDailySchedule[];
    plannedSchedule: Record<string | number, number>;
    onDayClick: (day: Date) => void;
}

export const Calendar = memo(({ currentDate, reports, dailySchedules, plannedSchedule, onDayClick }: CalendarProps) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Pre-build O(1) lookup Maps for the calendar days
    const dailyReportsMap = useMemo(() => {
        const map = new Map<string, { hours: number; credit: number }>();
        reports.forEach(r => {
            const current = map.get(r.date) || { hours: 0, credit: 0 };
            map.set(r.date, {
                hours: current.hours + (Number(r.hours) || 0),
                credit: current.credit + (Number(r.credit) || 0)
            });
        });
        return map;
    }, [reports]);

    const dailySchedulesMap = useMemo(() => {
        return new Map(dailySchedules.map(s => [s.date, s]));
    }, [dailySchedules]);

    return (
        <div className="grid grid-cols-7 divide-x divide-y divide-nature-cream border-l border-t border-nature-cream text-center">
            {calendarDays.map((day, idx) => {
                const year = day.getFullYear() > 2100 ? day.getFullYear() - 543 : day.getFullYear();
                const dateKey = `${year}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                
                const report = dailyReportsMap.get(dateKey) || null;
                const isCurrentMonth = isSameMonth(day, monthStart);

                return (
                    <motion.div
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDayClick(day)}
                        className={`
                            relative h-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                            ${!isCurrentMonth ? 'bg-nature-cream/20 opacity-40' : 'bg-white hover:bg-nature-green/5'}
                            ${isToday(day) ? 'bg-nature-green/5' : ''}
                        `}
                    >
                        <span className={`
                            text-[10px] font-black absolute top-2 left-2
                            ${isToday(day) ? 'text-nature-green underline decoration-2 underline-offset-4' : 'text-nature-brown-light'}
                        `}>
                            {format(day, 'd')}
                        </span>

                        {report && report.hours > 0 && report.credit > 0 && (
                            <span className="text-[10px] font-bold text-rose-500 absolute top-2 right-2 uppercase tracking-tighter shadow-sm bg-white/50 backdrop-blur-[2px] px-1 rounded-md">
                                {report.credit}c
                            </span>
                        )}

                        {report && report.hours > 0 ? (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-5 flex flex-col items-center justify-center translate-y-1">
                                {(() => {
                                    const h = Math.floor(report.hours);
                                    const m = Math.round((report.hours % 1) * 60);
                                    const dailyOverride = dailySchedulesMap.get(dateKey);
                                    const dayIdx = getDay(day);
                                    
                                    let plannedForDay = 0;
                                    if (dailyOverride) {
                                        plannedForDay = Number(dailyOverride.hours) || 0;
                                    } else {
                                        const sundayKeys = [0, 7, "0", "7"];
                                        const lookupKeys = dayIdx === 0 ? sundayKeys : [dayIdx, dayIdx.toString()];
                                        for (const key of lookupKeys) {
                                            if (plannedSchedule[key] !== undefined) {
                                                plannedForDay = Number(plannedSchedule[key]);
                                                break;
                                            }
                                        }
                                    }

                                    let statusColor = 'bg-nature-green';
                                    
                                    if (plannedForDay > 0) {
                                        const ratio = report.hours / plannedForDay;
                                        if (ratio < 0.2) statusColor = 'bg-rose-700';
                                        else if (ratio < 0.4) statusColor = 'bg-rose-500';
                                        else if (ratio < 0.6) statusColor = 'bg-orange-500';
                                        else if (ratio < 0.8) statusColor = 'bg-amber-500';
                                        else if (ratio < 1) statusColor = 'bg-lime-500';
                                    }

                                    return (
                                        <div className={`${statusColor} text-white w-10 h-10 rounded-full shadow-sm flex flex-col items-center justify-center border-2 border-white leading-none`}>
                                            <p className="text-[11px] font-black"><CountUp value={h} />h</p>
                                            {m > 0 && <p className="text-[8px] font-bold uppercase mt-0.5"><CountUp value={m} />m</p>}
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        ) : report && report.credit > 0 ? (
                            <div className="mt-5 bg-rose-500 text-white w-9 h-9 rounded-full shadow-sm flex items-center justify-center border-2 border-white translate-y-1">
                                <span className="text-sm font-black">{report.credit}c</span>
                            </div>
                        ) : !report && isCurrentMonth ? (
                            <>
                                {(() => {
                                    const dayIdx = getDay(day);
                                    const daily = dailySchedulesMap.get(dateKey);
                                    
                                    let planned = 0;
                                    if (daily) {
                                        planned = Number(daily.hours) || 0;
                                    } else {
                                        const sundayKeys = [0, 7, "0", "7"];
                                        const lookupKey = dayIdx === 0 ? sundayKeys : [dayIdx, dayIdx.toString()];
                                        
                                        for (const key of (Array.isArray(lookupKey) ? lookupKey : [lookupKey])) {
                                            if (plannedSchedule[key] !== undefined) {
                                                planned = Number(plannedSchedule[key]);
                                                break;
                                            }
                                        }
                                    }

                                    if (planned > 0) return (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                            <span className={`text-[10px] font-black italic ${daily ? 'text-nature-green' : 'text-nature-brown'}`}>{planned}h</span>
                                        </div>
                                    );
                                    return null;
                                })()}
                                <Plus size={12} className="opacity-0 group-hover:opacity-100 text-nature-cream-light translate-y-3 transition-all" />
                            </>
                        ) : null}
                    </motion.div>
                );
            })}
        </div>
    );
});

Calendar.displayName = 'Calendar';
