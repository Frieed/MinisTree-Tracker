import { motion } from 'framer-motion';
import { TreePine, CheckCircle2, Heart, HeartCrack, Leaf, Clock, Hourglass, Sprout } from 'lucide-react';

import { useDashboardData } from '../hooks/useDashboardData';
import { useVisits } from '../hooks/useVisits';
import { ServiceChart } from '../components/dashboard/ServiceChart';
import { CountUp } from '../components/common/CountUp';

const Dashboard = () => {
  const {
    isDataLoaded,
    reportsByMonth,
    totalYearlyHours,
    currentMonthName,
    currentMonthHoursLogged,
    dynamicMonthlyGoal,
    progressPercentage,
    totalRemaining,
    hoursDifference,
    reportedMonthsCount,
    avgHours,
    avgStudies,

    months,
    yearlyQuota,
    monthlySummary
  } = useDashboardData();

  const { visits } = useVisits();
  const treesCount = visits.filter(v => v.is_bible_study).length;
  const seedlingsCount = visits.filter(v => !v.is_bible_study).length;
  const totalPlants = visits.length;

  const today = new Date();

  const getProgressColor = (hours: number, goal: number) => {
    if (goal <= 0) return 'text-nature-green-dark';
    const percentage = (hours / goal) * 100;
    if (percentage >= 90) return 'text-[#52b788]';
    if (percentage >= 80) return 'text-lime-500';
    if (percentage >= 70) return 'text-amber-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-rose-500';
  };

  return (
    <div className="px-6 pt-6 pb-2 space-y-8 min-h-screen">
      {/* Welcome Section */}
      <section>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black text-nature-brown-dark leading-tight"
        >
          Keep <span className="text-nature-green">Growing</span>, <br />
          Friend.
        </motion.h2>
        <p className="text-nature-brown font-medium mt-1">{currentMonthName} {today.getFullYear()} Service Report</p>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#0a2a0a] p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/5 max-w-full">
        {/* Exact Gradient Background from Reference */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[#1a4a1a] via-[#0a2a0a] to-[#051505]" />
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-radial-gradient from-[#d9ed92]/20 via-[#4ca64c]/5 to-transparent pointer-events-none" />
        
        {/* Integrated Leaf Asset with Blend Mode - Scaled Down */}
        <div className="absolute right-[-20px] top-[0%] w-[240px] h-[240px] pointer-events-none select-none z-10 opacity-30 mix-blend-lighten">
          <img 
            src="/reference_leaf.png" 
            alt="Reference Leaf" 
            className="w-full h-full object-contain filter brightness-110"
          />
        </div>

        <div className="relative z-20 space-y-2.5">
          {/* Top Section - Ultra Compact */}
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Leaf className="text-[#d9ed92] w-2.5 h-2.5" />
                <p className="text-[#d9ed92]/80 text-[8px] font-black uppercase tracking-widest">Goal for {currentMonthName}</p>
              </div>
              <div className="flex items-baseline gap-2 whitespace-nowrap">
                <h3 className="text-4xl font-black tracking-tighter text-white leading-none">
                  {isDataLoaded ? <CountUp value={currentMonthHoursLogged} decimals={1} /> : '---'}
                </h3>
                <span className="text-lg opacity-60 font-bold italic text-[#d9ed92]/70">/ {dynamicMonthlyGoal} hrs</span>
              </div>
            </motion.div>
            
            <div className="w-10 h-10 bg-white/10 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <TreePine size={20} className="text-[#d9ed92]" />
            </div>
          </div>

          {/* Progress Section - Ultra Compact */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end px-1">
              <div className="space-y-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#d9ed92]/50">Year Progress</p>
                <p className="text-sm font-black text-white leading-none">
                  <CountUp value={totalYearlyHours} /> <span className="text-[9px] opacity-30 font-bold ml-0.5">of {yearlyQuota}</span>
                </p>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white leading-none"><CountUp value={Math.round(progressPercentage)} />%</span>
            </div>
            
            <div className="h-2.5 bg-black/40 rounded-full p-0.5 overflow-hidden backdrop-blur-xl border border-white/5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 2, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-[#52b788] via-[#74c69d] to-[#b5e48c] rounded-full"
              />
            </div>
          </div>

          {/* Bottom Cards Section - Compact & Glassy */}
          <div className="grid grid-cols-2 gap-2.5">
            <motion.div 
              className="group relative bg-white/5 backdrop-blur-2xl rounded-[1.8rem] p-3 border border-white/10 border-l-[3px] border-l-[#d9ed92] shadow-xl overflow-hidden"
            >
              {/* Faint Leaf Watermark */}
              <div className="absolute right-[-10%] bottom-[-10%] w-[80px] h-[80px] opacity-[0.05] pointer-events-none rotate-12">
                <Leaf className="w-full h-full fill-[#d9ed92]" />
              </div>

              <div className="flex items-start gap-2.5 relative z-10">
                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                  <Clock size={14} className="text-[#d9ed92]" />
                </div>
                <div className="flex-1 space-y-0">
                  <p className="text-[8px] uppercase font-black text-[#d9ed92] tracking-widest opacity-70">Remaining</p>
                  <h4 className="text-2xl font-black tracking-tighter text-white leading-none">
                    <CountUp value={totalRemaining} /> <span className="text-[10px] opacity-30 font-bold">hrs</span>
                  </h4>
                  <div className="pt-1.5">
                    <p className="text-[8px] font-bold text-white/40 leading-tight">
                      {totalRemaining <= 0 ? "Ahead of target!" : "Remaining hours"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className={`group relative bg-white/5 backdrop-blur-2xl rounded-[1.8rem] p-3 border border-white/10 border-l-[3px] shadow-xl overflow-hidden ${hoursDifference <= 0 ? 'border-l-emerald-400' : 'border-l-yellow-400'}`}
            >
              {/* Faint Leaf Watermark */}
              <div className="absolute right-[-10%] bottom-[-10%] w-[80px] h-[80px] opacity-[0.05] pointer-events-none -rotate-12">
                <Leaf className={`w-full h-full ${hoursDifference <= 0 ? 'fill-emerald-400' : 'fill-yellow-400'}`} />
              </div>

              <div className="flex items-start gap-2.5 relative z-10">
                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                  {hoursDifference <= 0 ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : (
                    <Hourglass size={14} className="text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 space-y-0">
                  <p className={`text-[8px] uppercase font-black tracking-widest opacity-70 ${hoursDifference <= 0 ? 'text-emerald-400' : 'text-[#d9ed92]'}`}>
                    {hoursDifference <= 0 ? (hoursDifference === 0 ? 'On Track' : 'Ahead') : 'Behind'}
                  </p>
                  <h4 className="text-2xl font-black tracking-tighter text-white leading-none">
                    <CountUp value={Math.abs(hoursDifference)} decimals={1} /> <span className="text-[10px] opacity-30 font-bold">hrs</span>
                  </h4>
                  <div className="pt-1.5">
                    <p className="text-[8px] font-bold text-white/40 leading-tight">
                      {hoursDifference <= 0 ? 'Excellent work!' : 'Keep going!'}
                      <br />
                      <span className="opacity-60">for {reportedMonthsCount} {reportedMonthsCount === 1 ? 'month' : 'months'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reference Glowing Dots */}
        <div className="absolute top-[25%] right-[25%] w-1.5 h-1.5 bg-white rounded-full blur-[2px] opacity-30" />
        <div className="absolute top-[35%] right-[20%] w-1 h-1 bg-white rounded-full blur-[1px] opacity-20" />
      </section>

      {/* Service Year Summary Table */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-lg font-black text-nature-brown-dark tracking-tight">Service <span className="text-nature-green">Summary</span></h4>
          <button className="text-[10px] font-black uppercase tracking-widest text-nature-green hover:underline decoration-2 underline-offset-4">Full Report</button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-soft border border-nature-cream overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-nature-cream/50">
                  <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-nature-brown-light border-b border-nature-cream">Month</th>
                  <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-nature-brown-light border-b border-nature-cream text-center">CRDT</th>
                  <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-nature-brown-light border-b border-nature-cream text-center">SCHED</th>
                  <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-nature-brown-light border-b border-nature-cream text-center">Goal</th>
                  <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-nature-brown-light border-b border-nature-cream text-center">Total</th>
                  <th className="py-2 px-3 text-[9px] font-black uppercase tracking-widest text-nature-brown-light border-b border-nature-cream text-center">BS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-cream">
                {monthlySummary.map((item: any, idx: number) => {
                  const { month, data, isNow, isFuture, isReported, monthGoal, reachedGoal, projectedSchedule } = item;

                  return (
                    <tr key={idx} className={`group hover:bg-nature-cream/30 transition-colors ${isNow ? 'bg-nature-green/5' : ''}`}>
                      <td className="py-2 px-3 text-xs font-bold text-nature-brown-dark flex items-center gap-1.5 h-[36px]">
                        {month.substring(0, 3)}
                        {isNow && <span className="text-[7px] bg-nature-green text-white px-1 py-0.5 rounded-full uppercase tracking-tighter">Now</span>}
                        {isReported && <CheckCircle2 size={12} className="text-nature-green drop-shadow-sm" />}
                      </td>
                      <td className="py-2 px-3 text-xs font-bold text-nature-brown text-center">{!isFuture ? (data?.credit || 0) : '-'}</td>
                      <td className="py-2 px-3 text-xs font-bold text-nature-brown text-center">{projectedSchedule > 0 ? projectedSchedule.toFixed(1) : '-'}</td>
                      <td className="py-2 px-3 text-xs font-bold text-black text-center">{!isFuture || isNow ? monthGoal.toFixed(1) : '-'}</td>
                      <td className={`py-2 px-3 text-xs font-black text-center ${
                        !isFuture 
                          ? getProgressColor(data?.hours || 0, monthGoal)
                          : 'text-nature-green-dark'
                      }`}>
                        {!isFuture ? (data?.hours || 0).toFixed(1) : '-'}
                      </td>
                      <td className="py-2 px-3 text-xs font-bold text-center">
                        {!isFuture ? (
                          <div className="relative mx-auto flex items-center justify-center w-6 h-6">
                            {isReported && (!data?.bible_studies || data.bible_studies === 0) ? (
                              <HeartCrack size={20} className="fill-nature-brown-light/20 text-nature-brown-light drop-shadow-sm transition-transform group-hover:scale-110" />
                            ) : (
                              <>
                                <Heart size={20} className="absolute fill-[#f0f9ec] text-nature-green-light drop-shadow-sm transition-transform group-hover:scale-110" />
                                <span className="relative z-10 text-[9px] font-black text-nature-green-dark">
                                  {(data?.bible_studies || 0)}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-nature-brown-light">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {/* Service Trend Graph */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-lg font-black text-nature-brown-dark tracking-tight">Growth <span className="text-nature-green">Trend</span></h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#6B8E23]" />
                <span className="text-[9px] font-bold text-nature-brown-dark uppercase">Hours</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#D2B48C]" />
                <span className="text-[9px] font-bold text-nature-brown-dark uppercase">Goal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full border-2 border-[#84A98C] border-dashed" />
                <span className="text-[9px] font-bold text-nature-brown-dark uppercase">Sched</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-nature-cream h-48 relative overflow-hidden">
            <ServiceChart 
              reportsByMonth={reportsByMonth} 
              currentMonthName={currentMonthName} 
              months={months} 
              yearlyQuota={yearlyQuota} 
              monthlySummary={monthlySummary}
            />
          </div>
        </section>

        {/* Average Metrics */}
        <section className="flex gap-3 mb-0">
          <div className="flex-1 bg-white rounded-3xl p-4 shadow-premium border border-nature-cream flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
            <p className="text-[8px] uppercase font-black text-nature-brown-light tracking-widest text-center mb-0.5 leading-tight">Average<br />Hours</p>
            <p className="text-3xl font-black text-nature-green-dark"><CountUp value={avgHours} decimals={1} /></p>
          </div>
          <div className="flex-1 bg-white rounded-3xl p-4 shadow-premium border border-nature-cream flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
            <p className="text-[8px] uppercase font-black text-nature-brown-light tracking-widest text-center mb-0.5 leading-tight">Average<br />Studies</p>
            <p className="text-3xl font-black text-rose-500"><CountUp value={avgStudies} decimals={1} /></p>
          </div>
        </section>

        {/* Garden Summary Section */}
        <section className="space-y-4 pt-6">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-lg font-black text-nature-brown-dark tracking-tight">Garden <span className="text-nature-green">Summary</span></h4>
          </div>
          
          <div className="flex gap-3 mb-0">
            <div className="flex-1 bg-white rounded-3xl p-3 shadow-premium border border-nature-cream flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
              <Sprout className="text-[#52b788] mb-1" size={16} />
              <p className="text-[8px] uppercase font-black text-nature-brown-light tracking-widest text-center mb-0.5 leading-tight">Seedlings</p>
              <p className="text-2xl font-black text-[#52b788]"><CountUp value={seedlingsCount} /></p>
            </div>
            
            <div className="flex-1 bg-white rounded-3xl p-3 shadow-premium border border-nature-cream flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
              <TreePine className="text-nature-green-dark mb-1" size={16} />
              <p className="text-[8px] uppercase font-black text-nature-brown-light tracking-widest text-center mb-0.5 leading-tight">Trees</p>
              <p className="text-2xl font-black text-nature-green-dark"><CountUp value={treesCount} /></p>
            </div>

            <div className="flex-1 bg-white rounded-3xl p-3 shadow-premium border border-nature-cream flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
              <Leaf className="text-[#D2B48C] mb-1" size={16} />
              <p className="text-[8px] uppercase font-black text-nature-brown-light tracking-widest text-center mb-0.5 leading-tight">Total</p>
              <p className="text-2xl font-black text-nature-brown-dark"><CountUp value={totalPlants} /></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
