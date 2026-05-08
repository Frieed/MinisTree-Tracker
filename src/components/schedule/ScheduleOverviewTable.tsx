import { CalendarDays } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface ScheduleOverviewTableProps {
    allSchedules: any[];
    allDailySchedules: any[];
}

export const ScheduleOverviewTable = ({ allSchedules, allDailySchedules }: ScheduleOverviewTableProps) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-premium border border-nature-cream space-y-4">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-nature-green" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light">Service Year Schedule Overview</h4>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-nature-cream">
                <table className="w-full text-left">
                    <thead className="bg-nature-cream/50">
                        <tr>
                            <th className="py-2.5 px-4 text-[8px] font-black uppercase tracking-widest text-nature-brown-light italic">Month</th>
                            <th className="py-2.5 px-4 text-[8px] font-black uppercase tracking-widest text-nature-brown-light italic text-right">Projected</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nature-cream/50">
                        {allSchedules.map((item) => {
                            const mDate = parseISO(item.month);
                            const mStart = startOfMonth(mDate);
                            const mEnd = endOfMonth(mDate);
                            const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });
                            const totalHours = daysInMonth.reduce((acc, day) => {
                                const dStr = format(day, 'yyyy-MM-dd');
                                const daily = allDailySchedules.find(s => s.date === dStr);
                                if (daily) return acc + (Number(daily.hours) || 0);
                                const weekday = getDay(day);
                                return acc + (item.schedule[weekday] || 0);
                            }, 0);

                            return (
                                <tr key={item.id} className="group hover:bg-nature-cream/30 transition-colors">
                                    <td className="py-3 px-4">
                                        <span className="text-xs font-bold text-nature-brown-dark">{format(mDate, 'MMMM')}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="text-xs font-black text-nature-green-dark">{totalHours.toFixed(1)} <span className="text-[8px] opacity-40">hrs</span></span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
