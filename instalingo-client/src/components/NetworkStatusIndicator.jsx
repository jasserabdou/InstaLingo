import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import './NetworkStatusIndicator.css';

const NetworkStatusIndicator = () => {
  const { isOnline, connectionQuality } = useNetworkStatus();

  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'green';
      case 'good': return 'lightgreen';
      case 'fair': return 'orange';
      case 'poor': return 'orangered';
      case 'unstable': return 'red';
      case 'offline': return 'gray';
      default: return '#ccc';
    }
  };

  const getStatusMessage = () => {
    if (!isOnline) return 'You are offline';
    
    switch (connectionQuality) {
      case 'excellent': return 'Excellent connection';
      case 'good': return 'Good connection';
      case 'fair': return 'Fair connection';
      case 'poor': return 'Poor connection';
      case 'unstable': return 'Unstable connection';
      default: return 'Checking connection...';
    }
  };

  return (
    <div className="network-status-indicator">
      <span 
        className="network-status-dot"
        style={{ backgroundColor: getStatusColor() }}
      />
      <span className="network-status-text">
        {getStatusMessage()}
      </span>
    </div>
  );
};

export default NetworkStatusIndicator;
