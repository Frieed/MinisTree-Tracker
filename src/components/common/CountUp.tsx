import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
    value: number;
    decimals?: number;
    className?: string;
    duration?: number;
    startOnView?: boolean;
}

export const CountUp = ({ value, decimals = 0, className, duration = 1000, startOnView = false }: CountUpProps) => {
    const [displayValue, setDisplayValue] = useState(() => (0).toFixed(decimals));
    const containerRef = useRef<HTMLSpanElement>(null);
    const [hasTriggered, setHasTriggered] = useState(false);
    
    // Keep track of the current animating value, and requestAnimationFrame ID
    const currentValRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    // Setup intersection observer if startOnView is enabled
    useEffect(() => {
        if (!startOnView) {
            setHasTriggered(true);
            return;
        }

        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasTriggered(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [startOnView]);

    useEffect(() => {
        // Only run animation once we have been triggered (entered view or startOnView is false)
        if (!hasTriggered) return;
        const startValue = currentValRef.current;
        const targetValue = value;

        // If current value is already equal to target value, just show it and skip animation
        if (startValue === targetValue) {
            setDisplayValue(targetValue.toFixed(decimals));
            return;
        }

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Premium ease-out quad curve: f(t) = t * (2 - t)
            const easeProgress = progress * (2 - progress);
            const currentVal = startValue + (targetValue - startValue) * easeProgress;
            
            currentValRef.current = currentVal;
            setDisplayValue(currentVal.toFixed(decimals));

            if (progress < 1) {
                animationFrameIdRef.current = requestAnimationFrame(animate);
            } else {
                currentValRef.current = targetValue;
                startTimeRef.current = null;
            }
        };

        startTimeRef.current = null;
        animationFrameIdRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [value, decimals, duration, hasTriggered]);

    return (
        <span 
            ref={containerRef}
            className={className} 
            style={{ fontVariantNumeric: 'tabular-nums' }}
        >
            {displayValue}
        </span>
    );
};
