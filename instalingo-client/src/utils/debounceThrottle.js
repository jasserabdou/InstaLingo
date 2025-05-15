/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - Whether to execute at the beginning of the timeout instead of the end
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 * 
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to wait between invocations
 * @returns {Function} - The throttled function
 */
export function throttle(func, wait) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCall >= wait) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}
