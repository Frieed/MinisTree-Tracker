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
    const unseenKey = `minisTree_unseenEvolution_${user?.id}`;
    const [showLevelUp, setShowLevelUp] = useState(() => localStorage.getItem(unseenKey) === 'true');

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
                    const lastKnownStage = savedHighestStage ? parseInt(savedHighestStage, 10) : 0;

                    // Trigger Modal if we just climbed to a NEW higher stage
                    if (currentStageIdx > lastKnownStage) {
                        setShowLevelUp(true);
                        localStorage.setItem(unseenKey, 'true');
                    } 
                    // Quietly update the record if we went DOWN (so we can level up again later)
                    else if (currentStageIdx < lastKnownStage) {
                        localStorage.setItem(storageKey, currentStageIdx.toString());
                    }
                    // Handle first-time initialization
                    else if (savedHighestStage === null) {
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
    }, [user, startDate, endDate, cacheKey, unseenKey]);

    const dismissLevelUp = () => {
        setShowLevelUp(false);
        const stageIndex = TREE_STAGES.findLastIndex(s => totalHours >= s.minHours);
        const storageKey = `minisTree_highestStage_${user?.id}`;
        const unseenKey = `minisTree_unseenEvolution_${user?.id}`;
        localStorage.setItem(storageKey, stageIndex.toString());
        localStorage.setItem(unseenKey, 'false');
    };

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
        dismissLevelUp,
        stageIndex,
        currentStage,
        nextStage,
        progressToNext,
        hoursToNext,
        stages: TREE_STAGES
    };
};
