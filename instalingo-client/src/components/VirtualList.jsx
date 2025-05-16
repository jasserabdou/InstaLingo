import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./VirtualList.css";

const VirtualList = ({
  items = [],
  itemHeight = 50,
  renderItem,
  windowHeight = 400,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 200,
  className = "",
  itemKey = (item) => item.id || JSON.stringify(item),
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const lastScrollHeight = useRef(0);
  const endReachedCalled = useRef(false);
  const resizeObserver = useRef(null);

  // Calculate total height based on number of items and item height
  const totalHeight = useMemo(
    () => items.length * itemHeight,
    [items.length, itemHeight]
  );

  // Calculate which items to render based on scroll position
  const { visibleItems, visibleStartIndex, visibleEndIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.floor((scrollTop + windowHeight) / itemHeight) + overscan
    );

    return {
      visibleStartIndex: start,
      visibleEndIndex: end,
      visibleItems: items.slice(start, end + 1),
    };
  }, [items, scrollTop, windowHeight, itemHeight, overscan]);

  // Handle scrolling with throttling to improve performance
  const handleScroll = useCallback(
    (e) => {
      requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        setScrollTop(scrollTop);

        // Call onEndReached only once when approaching the end
        const isNearBottom =
          scrollHeight - scrollTop - clientHeight < endReachedThreshold;

        if (isNearBottom && onEndReached && !endReachedCalled.current) {
          endReachedCalled.current = true;
          onEndReached();
        } else if (!isNearBottom) {
          endReachedCalled.current = false;
        }

        // Store last scroll height for scroll restoration after item count changes
        lastScrollHeight.current = scrollHeight;
      });
    },
    [endReachedThreshold, onEndReached]
  );

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  // Preserve scroll position when items are added/removed
  useEffect(() => {
    const container = containerRef.current;
    if (container && container.scrollHeight !== lastScrollHeight.current) {
      // Only adjust if total height changed without user scrolling
      if (
        container.scrollTop + container.clientHeight >=
        lastScrollHeight.current
      ) {
        // If user was at the bottom, keep them at the bottom
        container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    }
  }, [items.length]);

  // Set up resize observer to handle window/container resizing
  useEffect(() => {
    const container = containerRef.current;
    if (container && window.ResizeObserver) {
      resizeObserver.current = new ResizeObserver(() => {
        // Re-render visible items when container is resized
        handleScroll({ target: container });
      });

      resizeObserver.current.observe(container);

      return () => {
        if (resizeObserver.current) {
          resizeObserver.current.disconnect();
        }
      };
    }
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{ height: `${windowHeight}px`, overflowY: "auto" }}
      aria-label="Virtual scrolling list"
      role="list"
    >
      <div
        className="virtual-list-innerHeight"
        style={{ height: `${totalHeight}px`, position: "relative" }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = visibleStartIndex + index;
          const top = actualIndex * itemHeight;
          const key =
            typeof itemKey === "function" ? itemKey(item) : item[itemKey];

          return (
            <div
              key={key}
              className="virtual-list-item"
              style={{
                position: "absolute",
                top: `${top}px`,
                height: `${itemHeight}px`,
                left: 0,
                right: 0,
              }}
              role="listitem"
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>

      {/* Empty space indication when no items */}
      {items.length === 0 && (
        <div className="virtual-list-empty" role="status">
          No items to display
        </div>
      )}
    </div>
  );
};

export default React.memo(VirtualList);
