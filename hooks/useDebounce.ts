'use client';

import {useCallback, useEffect, useRef} from "react";

// Debounced callback that only runs once after `delay` ms have passed
// since the *last* call, using the latest version of `callback`.
export function useDebounce(callback: () => void | Promise<void>, delay: number) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestCallbackRef = useRef(callback);

    // Always keep the latest callback in a ref so we don't recreate
    // the debounced function on every render.
    useEffect(() => {
        latestCallbackRef.current = callback;
    }, [callback]);

    return useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current as unknown as number);
        }

        timeoutRef.current = setTimeout(() => {
            void latestCallbackRef.current();
        }, delay);
    }, [delay]);
}
