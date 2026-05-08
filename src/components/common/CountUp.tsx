import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface CountUpProps {
    value: number;
    decimals?: number;
    className?: string;
}

export const CountUp = ({ value, decimals = 0, className }: CountUpProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 15 });
    const display = useTransform(spring, (v) => v.toFixed(decimals));

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [value, spring, isInView]);

    return <motion.span ref={ref} className={className}>{display}</motion.span>;
};
