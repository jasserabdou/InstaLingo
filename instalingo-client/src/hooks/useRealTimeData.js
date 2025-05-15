import { useState, useEffect, useCallback } from 'react';
import websocketService from '../services/websocketService';

export function useRealTimeData(eventType, initialData = null) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle incoming real-time data
  const handleDataUpdate = useCallback((newData) => {
    setData(prevData => {
      // Handle array data
      if (Array.isArray(prevData) && Array.isArray(newData)) {
        return [...newData];
      }
      // Handle object data
      if (typeof prevData === 'object' && typeof newData === 'object') {
        return { ...prevData, ...newData };
      }
      // Handle primitive data
      return newData;
    });
    setIsLoading(false);
  }, []);

  // Send data through WebSocket
  const sendData = useCallback((payload) => {
    // Optimistic update
    if (Array.isArray(data)) {
      if (payload.action === 'add') {
        setData(prevData => [...prevData, { ...payload.item, pending: true }]);
      } else if (payload.action === 'update') {
        setData(prevData => prevData.map(item => 
          item.id === payload.item.id ? { ...item, ...payload.item, pending: true } : item
        ));
      } else if (payload.action === 'delete') {
        setData(prevData => prevData.map(item => 
          item.id === payload.id ? { ...item, pending: true, deleting: true } : item
        ));
      }
    }
    
    return websocketService.send(eventType, payload);
  }, [eventType, data]);

  // Handle connection changes
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const handleError = useCallback((err) => {
    setError(err);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Connect to WebSocket if not already connected
    if (!websocketService.socket || websocketService.socket.readyState !== WebSocket.OPEN) {
      websocketService.connect();
    }

    // Subscribe to events
    websocketService.on(eventType, handleDataUpdate);
    websocketService.on('connect', handleConnect);
    websocketService.on('disconnect', handleDisconnect);
    websocketService.on('error', handleError);

    // Check initial connection state
    setIsConnected(websocketService.socket && websocketService.socket.readyState === WebSocket.OPEN);
    
    return () => {
      // Clean up event listeners
      websocketService.off(eventType, handleDataUpdate);
      websocketService.off('connect', handleConnect);
      websocketService.off('disconnect', handleDisconnect);
      websocketService.off('error', handleError);
    };
  }, [eventType, handleDataUpdate, handleConnect, handleDisconnect, handleError]);

  return {
    data,
    isLoading,
    error,
    isConnected,
    sendData,
  };
}
