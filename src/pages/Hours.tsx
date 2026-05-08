import { useState, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Heart, HeartCrack, Leaf } from 'lucide-react';
import { useServiceYear } from '../context/ServiceYearContext';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { useHoursData } from '../hooks/useHoursData';
import { ActivityLogHeader } from '../components/hours/ActivityLogHeader';
import { Calendar } from '../components/hours/Calendar';
import { LogModal, StudiesModal } from '../components/hours/HoursModals';
import { useUI } from '../context/UIContext';

const Hours = () => {
    const { startDate: serviceYearStartDate, endDate: serviceYearEndDate } = useServiceYear();
    const { setIsModalOpen: setGlobalModalOpen } = useUI();
    const {
        currentDate, setCurrentDate,
        reports, isReported, monthlyStudies, dynamicGoal,
        plannedSchedule, dailySchedules, loading, statusLoading,
        saveReport, deleteReport, toggleReported, saveStudies, refreshData
    } = useHoursData(new Date());

    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStudiesModalOpen, setIsStudiesModalOpen] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [credit, setCredit] = useState(0);
    const [localStudies, setLocalStudies] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLocalStudies(monthlyStudies);
    }, [monthlyStudies]);

    useEffect(() => {
        if (isModalOpen) {
            setGlobalModalOpen(true);
            return () => setGlobalModalOpen(false);
        }
    }, [isModalOpen, setGlobalModalOpen]);

    useEffect(() => {
        if (isStudiesModalOpen) {
            setGlobalModalOpen(true);
            return () => setGlobalModalOpen(false);
        }
    }, [isStudiesModalOpen, setGlobalModalOpen]);

    const handleDayClick = (day: Date) => {
        const year = day.getFullYear() > 2100 ? day.getFullYear() - 543 : day.getFullYear();
        const dateKey = `${year}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        const dayReports = reports.filter(r => r.date === dateKey);
        
        if (dayReports.length > 0) {
            const totalH = dayReports.reduce((acc, r) => acc + r.hours, 0);
            const totalC = dayReports.reduce((acc, r) => acc + (r.credit || 0), 0);
            const h = Math.floor(totalH);
            const m = Math.round((totalH - h) * 60);
            setHours(h);
            setMinutes(m);
            setCredit(totalC);
        } else {
            setHours(0); setMinutes(0); setCredit(0);
        }
        setSelectedDay(day);
        setError(null);
        setIsModalOpen(true);
    };

    const onSaveReport = async () => {
        if (!selectedDay) return;
        const totalInputHours = hours + (minutes / 60);
        
        // Frontend validation for 24h limit
        if (totalInputHours > 24) {
            setError("A day only has 24 hours!");
            return;
        }

        if (totalInputHours <= 0 && credit <= 0) {
            setError("Please enter some time or credit");
            return;
        }

        setError(null);
        const res = await saveReport(selectedDay, totalInputHours, credit);
        if (res && !res.error) {
            setIsModalOpen(false);
        } else if (res?.error) {
            setError(res.error.message);
        }
    };

    const onDeleteReport = async () => {
        if (!selectedDay) return;
        const res = await deleteReport(selectedDay);
        if (res && !res.error) setIsModalOpen(false);
    };

    const totalHours = reports.reduce((acc, curr) => acc + curr.hours, 0);
    const totalCredit = reports.reduce((acc, curr) => acc + (curr.credit || 0), 0);

    return (
        <div className="p-6 space-y-6 pb-24">
            <section className="flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black text-nature-brown-dark tracking-tight flex items-center gap-1.5">
                        Ministry
                        <span className="flex items-center">
                            <span className="text-nature-green">L</span>
                            <div className="w-4 h-4 rounded-full bg-[#DEB887] border-[1.5px] border-[#5D2E0A] flex items-center justify-center relative shadow-sm mx-0.5 translate-y-[3.5px]">
                                <div className="absolute inset-[1.5px] rounded-full border border-[#8B4513]/40" />
                                <div className="absolute inset-[3px] rounded-full border border-[#8B4513]/20" />
                            </div>
                            <span className="text-nature-green">gs</span>
                        </span>
                    </h2>
                    <p className="text-nature-brown font-medium mt-0.5">Your ministry story grows one log at a time.</p>
                </div>
                <div className="bg-nature-green/10 px-3 py-2 rounded-xl flex items-center gap-1.5 text-nature-green-dark shrink-0">
                    <CalendarDays size={14} />
                    <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">{format(currentDate, 'MMM yyyy')}</span>
                </div>
            </section>

            <ActivityLogHeader 
                totalHours={totalHours} 
                dynamicGoal={dynamicGoal} 
                totalCredit={totalCredit} 
                monthlyStudies={monthlyStudies} 
                currentDate={currentDate}
            />

            <section className="bg-white rounded-[2.5rem] shadow-premium border border-nature-cream overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-nature-cream">
                    <button
                        onClick={() => {
                            const prevMonth = subMonths(currentDate, 1);
                            if (prevMonth >= serviceYearStartDate) setCurrentDate(prevMonth);
                        }}
                        disabled={subMonths(startOfMonth(currentDate), 1) < startOfMonth(serviceYearStartDate)}
                        className="p-3 bg-nature-cream hover:bg-nature-green/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors text-nature-brown"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex flex-col items-center gap-1">
                        <h3 className="text-lg font-black text-nature-brown-dark">{format(currentDate, 'MMMM yyyy')}</h3>
                        <button 
                            onClick={refreshData}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-nature-green hover:text-nature-green-dark transition-colors"
                        >
                            <Loader2 size={10} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Syncing...' : 'Force Sync'}
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            const nextMonth = addMonths(currentDate, 1);
                            if (nextMonth <= serviceYearEndDate) setCurrentDate(nextMonth);
                        }}
                        disabled={addMonths(startOfMonth(currentDate), 1) > startOfMonth(serviceYearEndDate)}
                        className="p-3 bg-nature-cream hover:bg-nature-green/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors text-nature-brown"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-7 bg-nature-cream/30 border-b border-nature-cream">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="py-3 text-center text-[10px] font-black text-nature-brown-light uppercase tracking-widest">{day}</div>
                    ))}
                </div>

                <Calendar 
                    currentDate={currentDate} 
                    reports={reports} 
                    dailySchedules={dailySchedules} 
                    plannedSchedule={plannedSchedule} 
                    onDayClick={handleDayClick} 
                />
            </section>

            <section className="pt-2 flex justify-center gap-4 px-4">
                <button 
                    onClick={() => setIsStudiesModalOpen(true)}
                    className="flex-[0.7] h-16 bg-white border-2 border-nature-cream rounded-[2rem] flex items-center justify-center gap-2 hover:bg-nature-cream/20 transition-all shadow-xl"
                    style={{ borderRadius: '1rem 2rem 0 2rem' }}
                >
                    {isReported && monthlyStudies === 0 ? (
                        <HeartCrack size={20} className="text-nature-brown-light fill-nature-brown-light/20" />
                    ) : (
                        <Heart size={20} className="text-nature-green-light fill-[#f0f9ec]" />
                    )}
                    <div className="flex flex-col items-start leading-none">
                        <span className={`text-sm font-black tracking-tight ${monthlyStudies > 0 ? 'text-nature-green-dark' : 'text-nature-brown-light'}`}>{monthlyStudies}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest text-nature-brown">Bible Studies</span>
                    </div>
                </button>

                <button
                    onClick={toggleReported}
                    disabled={statusLoading}
                    className={`flex-1 relative h-16 flex items-center justify-center gap-2 transition-all font-black uppercase tracking-[0.1em] text-[10px] shadow-xl overflow-hidden ${isReported ? 'bg-gradient-to-br from-emerald-400 to-nature-green text-white shadow-nature-green/30' : 'bg-white text-nature-brown border-2 border-nature-cream hover:bg-nature-cream/20'}`}
                    style={{ borderRadius: '2rem 1rem 2rem 0' }}
                >
                    <div className={`absolute -right-1 -bottom-1 w-4 h-4 turn-45 border-r-4 border-b-4 ${isReported ? 'border-nature-green-dark/30' : 'border-nature-cream'}`} style={{ borderRadius: '0 0.5rem 0 0', transform: 'rotate(45deg)' }} />
                    {statusLoading ? <Loader2 className="animate-spin" /> : (
                        <>
                            <Leaf size={18} className={`transition-transform duration-500 origin-bottom-left ${isReported ? 'text-white fill-white/20 scale-110 rotate-12' : 'text-nature-green'}`} />
                            {isReported ? 'Reported' : 'Mark as Reported'}
                        </>
                    )}
                </button>
            </section>

            <LogModal 
                isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(null); }} selectedDay={selectedDay} 
                hours={hours} setHours={(h) => { setHours(h); setError(null); }} 
                minutes={minutes} setMinutes={(m) => { setMinutes(m); setError(null); }} 
                credit={credit} setCredit={(c) => { setCredit(c); setError(null); }} 
                onSave={onSaveReport} onDelete={onDeleteReport} 
                loading={loading} error={error}
                hasExistingReport={!!reports.find(r => {
                    const year = selectedDay ? (selectedDay.getFullYear() > 2100 ? selectedDay.getFullYear() - 543 : selectedDay.getFullYear()) : 0;
                    return selectedDay && r.date === `${year}-${String(selectedDay.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.getDate()).padStart(2, '0')}`
                })} 
            />

            <StudiesModal 
                isOpen={isStudiesModalOpen} onClose={() => setIsStudiesModalOpen(false)} currentDate={currentDate} 
                studies={localStudies} setStudies={setLocalStudies} onSave={() => saveStudies(localStudies).then(() => setIsStudiesModalOpen(false))} 
                loading={statusLoading} 
            />
        </div>
    );
};

export default Hours;
