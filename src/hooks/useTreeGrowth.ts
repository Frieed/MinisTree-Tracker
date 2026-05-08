import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useServiceYear } from '../context/ServiceYearContext';
import { TREE_STAGES } from '../constants/treeStages';

export const useTreeGrowth = () => {
    const { user } = useAuth();
    const { startDate, endDate, serviceYear } = useServiceYear();
    const cacheKey = `minisTree_totalHours_cache_${user?.id}_${serviceYear}`;

    const [totalHours, setTotalHours] = useState(() => {
        const cached = localStorage.getItem(cacheKey);
        return cached ? parseFloat(cached) : 0;
    });

    const [loading, setLoading] = useState(() => !localStorage.getItem(cacheKey));
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchTotalHours = async () => {
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('hours')
                    .eq('user_id', user.id)
                    .gte('date', format(startDate, 'yyyy-MM-dd'))
                    .lte('date', format(endDate, 'yyyy-MM-dd'));

                if (!error && data) {
                    const total = data.reduce((acc, curr) => acc + curr.hours, 0);
                    setTotalHours(total);
                    localStorage.setItem(cacheKey, total.toString());

                    const currentStageIdx = TREE_STAGES.findLastIndex(s => total >= s.minHours);
                    const storageKey = `minisTree_highestStage_${user.id}`;
                    const savedHighestStage = localStorage.getItem(storageKey);
                    const highestSeen = savedHighestStage ? parseInt(savedHighestStage, 10) : 0;

                    if (currentStageIdx > highestSeen) {
                        setShowLevelUp(true);
                        localStorage.setItem(storageKey, currentStageIdx.toString());
                        localStorage.setItem(`minisTree_unseenEvolution_${user.id}`, 'true');
                    } else if (savedHighestStage === null) {
                        localStorage.setItem(storageKey, currentStageIdx.toString());
                    }
                }
            } catch (err) {
                console.error('Error in fetchTotalHours:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTotalHours();
    }, [user, startDate, endDate, cacheKey]);

    const stageIndex = TREE_STAGES.findLastIndex(s => totalHours >= s.minHours);
    const currentStage = TREE_STAGES[stageIndex] || TREE_STAGES[0];
    const nextStage = TREE_STAGES[stageIndex + 1];

    const progressToNext = nextStage
        ? ((totalHours - currentStage.minHours) / (nextStage.minHours - currentStage.minHours)) * 100
        : 100;

    const hoursToNext = nextStage ? nextStage.minHours - totalHours : 0;

    return {
        totalHours,
        loading,
        showLevelUp,
        setShowLevelUp,
        stageIndex,
        currentStage,
        nextStage,
        progressToNext,
        hoursToNext,
        stages: TREE_STAGES
    };
};
