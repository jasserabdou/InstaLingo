import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VirtualList.css';

const VirtualList = ({
  items = [],
  itemHeight = 50,
  renderItem,
  windowHeight = 400,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 200,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const totalHeight = items.length * itemHeight;
  
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + windowHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1);
  
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setScrollTop(scrollTop);
    
    // Check if we've reached the end (with threshold)
    if (scrollHeight - scrollTop - clientHeight < endReachedThreshold && onEndReached) {
      onEndReached();
    }
  }, [endReachedThreshold, onEndReached]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);
  
  return (
    <div 
      ref={containerRef}
      className={`virtual-list-container ${className}`} 
      style={{ height: `${windowHeight}px`, overflowY: 'auto' }}
    >
      <div 
        className="virtual-list-innerHeight" 
        style={{ height: `${totalHeight}px`, position: 'relative' }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = visibleStartIndex + index;
          const top = actualIndex * itemHeight;
          
          return (
            <div
              key={item.id || actualIndex}
              className="virtual-list-item"
              style={{
                position: 'absolute',
                top: `${top}px`,
                height: `${itemHeight}px`,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualList;
