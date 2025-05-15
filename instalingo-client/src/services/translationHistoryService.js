import websocketService from './websocketService';

class TranslationHistoryService {
  constructor() {
    this.historyEventType = 'translation-history';
    this.setupWebSocketListeners();
  }

  setupWebSocketListeners() {
    // Listen for history updates from server
    websocketService.on(this.historyEventType, (data) => {
      if (this.onHistoryUpdateCallback) {
        this.onHistoryUpdateCallback(data);
      }
    });
  }

  onHistoryUpdate(callback) {
    this.onHistoryUpdateCallback = callback;
  }

  async getTranslationHistory(userId, limit = 50, offset = 0) {
    try {
      // API call to get history
      const response = await fetch(`/api/translations/history?userId=${userId}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch translation history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching translation history:', error);
      throw error;
    }
  }

  saveTranslation(translation) {
    // Send the translation to be saved via WebSocket for real-time updates
    websocketService.send(this.historyEventType, {
      action: 'add',
      item: {
        ...translation,
        timestamp: new Date().toISOString()
      }
    });

    // Also save via API for persistence
    return fetch('/api/translations/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(translation),
    });
  }

  deleteTranslationHistory(id) {
    // Send delete action via WebSocket for real-time updates
    websocketService.send(this.historyEventType, {
      action: 'delete',
      id
    });

    // Also delete via API
    return fetch(`/api/translations/history/${id}`, {
      method: 'DELETE',
    });
  }

  clearAllHistory(userId) {
    // Send clear action via WebSocket
    websocketService.send(this.historyEventType, {
      action: 'clear',
      userId
    });

    // Also clear via API
    return fetch(`/api/translations/history/user/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const translationHistoryService = new TranslationHistoryService();
export default translationHistoryService;
