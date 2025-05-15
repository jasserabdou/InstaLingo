import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type, count = 1, width, height, className = '' }) => {
  const createSkeletonItems = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'text':
          items.push(
            <div 
              key={i}
              className={`skeleton-text ${className}`} 
              style={{ width: width || '100%', height: height || '1rem' }}
            />
          );
          break;
        case 'circle':
          items.push(
            <div 
              key={i}
              className={`skeleton-circle ${className}`} 
              style={{ 
                width: width || '50px', 
                height: height || '50px', 
                borderRadius: '50%' 
              }}
            />
          );
          break;
        case 'rectangle':
          items.push(
            <div 
              key={i}
              className={`skeleton-rectangle ${className}`} 
              style={{ width: width || '100%', height: height || '100px' }}
            />
          );
          break;
        case 'card':
          items.push(
            <div key={i} className={`skeleton-card ${className}`}>
              <div className="skeleton-rectangle" style={{ height: '140px' }} />
              <div className="skeleton-text" style={{ marginTop: '12px', width: '70%' }} />
              <div className="skeleton-text" style={{ marginTop: '8px', width: '90%' }} />
              <div className="skeleton-text" style={{ marginTop: '8px', width: '60%' }} />
            </div>
          );
          break;
        default:
          items.push(
            <div 
              key={i}
              className={`skeleton-rectangle ${className}`} 
              style={{ width: width || '100%', height: height || '100px' }}
            />
          );
      }
    }
    return items;
  };

  return <>{createSkeletonItems()}</>;
};

export default SkeletonLoader;
