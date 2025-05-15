/**
 * Creates an optimistic update to the data while waiting for server response
 * 
 * @param {Function} updateFn - The function that will update the state
 * @param {Function} actionFn - The function that will perform the actual API call
 * @param {Object} rollbackData - The data to restore in case of failure
 */
export const optimisticUpdate = async (updateFn, actionFn, rollbackData) => {
  // Keep a copy of the original data for rollback
  try {
    // Apply the optimistic update
    updateFn();
    
    // Perform the actual action/API call
    const result = await actionFn();
    
    return result;
  } catch (error) {
    // Rollback to the previous state if the action fails
    if (rollbackData !== undefined) {
      updateFn(rollbackData);
    }
    throw error;
  }
};

/**
 * Utility to create a temporary ID for optimistic updates
 */
export const createTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
