import { useState, useEffect } from "react";

/**
 * A hook for debouncing a value
 * @param {any} value - The value to be debounced
 * @param {number} delay - The delay in milliseconds
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes or unmount
    return () => {
      clearTimeout(timer);
    };
    // Only re-call effect if value or delay changes
  }, [value, delay]);

  return debouncedValue;
}
