import React, { useState, useEffect } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import VirtualList from './VirtualList';
import SkeletonLoader from './SkeletonLoader';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import { debounce } from '../utils/debounceThrottle';
import { optimisticUpdate } from '../utils/optimisticUpdate';

const RealTimeExample = () => {
  const {
    data: messages,
    isLoading,
    error,
    isConnected,
    sendData
  } = useRealTimeData('chat-messages', []);
  
  const [messageInput, setMessageInput] = useState('');
  
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Generate a temporary ID for the message (for optimistic updates)
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageInput,
      sender: 'current-user',
      timestamp: new Date().toISOString(),
      pending: true
    };
    
    // Send the message with optimistic update
    sendData({
      action: 'add',
      item: tempMessage
    });
    
    // Clear the input
    setMessageInput('');
  };
  
  const debouncedInputChange = debounce((value) => {
    // Notify other users that the current user is typing
    sendData({
      action: 'typing',
      value: value.length > 0
    });
  }, 300);
  
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    debouncedInputChange(e.target.value);
  };
  
  const renderMessage = (message) => (
    <div className={`message ${message.pending ? 'message-pending' : ''}`}>
      <div className="message-header">
        <span className="message-sender">{message.sender}</span>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="message-body">{message.text}</div>
      {message.pending && (
        <div className="message-pending-indicator">Sending...</div>
      )}
    </div>
  );
  
  return (
    <div className="real-time-example">
      <div className="connection-status">
        {isConnected ? (
          <span className="connected">Connected</span>
        ) : (
          <span className="disconnected">Disconnected</span>
        )}
      </div>
      
      <div className="messages-container">
        {isLoading ? (
          <SkeletonLoader type="card" count={5} className="message-skeleton" />
        ) : error ? (
          <div className="error-message">
            Error loading messages: {error.message}
          </div>
        ) : messages && messages.length > 0 ? (
          <VirtualList
            items={messages}
            itemHeight={80}
            windowHeight={400}
            renderItem={renderMessage}
            onEndReached={() => {
              console.log('Load more messages');
              // Implement loading more historical messages
            }}
          />
        ) : (
          <div className="no-messages">No messages yet</div>
        )}
      </div>
      
      <div className="message-input-container">
        <input
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={!isConnected}
          className="message-input"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!isConnected || !messageInput.trim()}
          className="send-button"
        >
          Send
        </button>
      </div>
      
      <NetworkStatusIndicator />
    </div>
  );
};

export default RealTimeExample;
