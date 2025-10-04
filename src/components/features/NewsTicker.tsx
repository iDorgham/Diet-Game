// NewsTicker component for displaying scrolling news and updates
// Part of HIGH Priority Feature Components implementation

import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  timestamp?: Date;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  type?: 'news' | 'update' | 'achievement' | 'tip';
}

export interface NewsTickerProps {
  items: NewsItem[];
  speed?: number; // pixels per second
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  showControls?: boolean;
  maxItems?: number;
  autoPlay?: boolean;
  interval?: number; // milliseconds between item changes
  variant?: 'scrolling' | 'fading' | 'sliding';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onItemClick?: (item: NewsItem) => void;
}

const sizeVariants = {
  sm: {
    height: 'h-8',
    text: 'text-sm',
    padding: 'px-3 py-1'
  },
  md: {
    height: 'h-10',
    text: 'text-base',
    padding: 'px-4 py-2'
  },
  lg: {
    height: 'h-12',
    text: 'text-lg',
    padding: 'px-6 py-3'
  }
};

const typeVariants = {
  news: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  update: {
    icon: Clock,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  achievement: {
    icon: TrendingUp,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  tip: {
    icon: ChevronRight,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  }
};

export const NewsTicker = forwardRef<HTMLDivElement, NewsTickerProps>(
  (
    {
      items,
      speed = 50,
      direction = 'left',
      pauseOnHover = true,
      showControls = false,
      maxItems = 5,
      autoPlay = true,
      interval = 5000,
      variant = 'scrolling',
      size = 'md',
      className,
      onItemClick
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const tickerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout>();

    const sizeConfig = sizeVariants[size];
    const displayItems = items.slice(0, maxItems);

    // Auto-advance for fading and sliding variants
    useEffect(() => {
      if (variant !== 'scrolling' && isPlaying && !isPaused && displayItems.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % displayItems.length);
        }, interval);

        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }
    }, [variant, isPlaying, isPaused, displayItems.length, interval]);

    const handlePlayPause = () => {
      setIsPlaying(!isPlaying);
    };

    const handlePrevious = () => {
      setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    };

    const handleItemClick = (item: NewsItem) => {
      onItemClick?.(item);
      if (item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
    };

    const formatTimestamp = (timestamp: Date) => {
      const now = new Date();
      const diff = now.getTime() - timestamp.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    };

    if (displayItems.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center text-gray-500',
            sizeConfig.height,
            sizeConfig.text,
            className
          )}
        >
          No news items available
        </div>
      );
    }

    if (variant === 'scrolling') {
      return (
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden bg-gray-50 border border-gray-200 rounded-lg',
            sizeConfig.height,
            className
          )}
          onMouseEnter={() => pauseOnHover && setIsPaused(true)}
          onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
          <motion.div
            ref={tickerRef}
            className="flex items-center space-x-8 whitespace-nowrap"
            animate={{
              x: isPaused ? 0 : direction === 'left' ? '-100%' : '100%'
            }}
            transition={{
              duration: displayItems.length * 2,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop'
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...displayItems, ...displayItems].map((item, index) => {
              const typeConfig = typeVariants[item.type || 'news'];
              const Icon = typeConfig.icon;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-4 py-1 rounded transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <Icon className={cn('w-4 h-4', typeConfig.color)} />
                  <span className={cn('font-medium', sizeConfig.text)}>
                    {item.title}
                  </span>
                  {item.timestamp && (
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  )}
                  {item.url && (
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Controls */}
          {showControls && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                onClick={handlePlayPause}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (variant === 'fading') {
      return (
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden bg-gray-50 border border-gray-200 rounded-lg',
            sizeConfig.height,
            className
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center px-4"
            >
              {(() => {
                const item = displayItems[currentIndex];
                const typeConfig = typeVariants[item.type || 'news'];
                const Icon = typeConfig.icon;

                return (
                  <div
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-4 py-2 rounded transition-colors w-full justify-center"
                    onClick={() => handleItemClick(item)}
                  >
                    <Icon className={cn('w-4 h-4', typeConfig.color)} />
                    <span className={cn('font-medium', sizeConfig.text)}>
                      {item.title}
                    </span>
                    {item.timestamp && (
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    )}
                    {item.url && (
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          {showControls && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                onClick={handlePrevious}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Previous item"
              >
                ←
              </button>
              <button
                onClick={handlePlayPause}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Next item"
              >
                →
              </button>
            </div>
          )}

          {/* Progress indicator */}
          {displayItems.length > 1 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {displayItems.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-1 h-1 rounded-full transition-colors',
                    index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (variant === 'sliding') {
      return (
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden bg-gray-50 border border-gray-200 rounded-lg',
            sizeConfig.height,
            className
          )}
        >
          <motion.div
            className="flex items-center"
            animate={{
              x: `-${currentIndex * 100}%`
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {displayItems.map((item, index) => {
              const typeConfig = typeVariants[item.type || 'news'];
              const Icon = typeConfig.icon;

              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-full flex items-center justify-center px-4"
                >
                  <div
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-4 py-2 rounded transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <Icon className={cn('w-4 h-4', typeConfig.color)} />
                    <span className={cn('font-medium', sizeConfig.text)}>
                      {item.title}
                    </span>
                    {item.timestamp && (
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    )}
                    {item.url && (
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Controls */}
          {showControls && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                onClick={handlePrevious}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Previous item"
              >
                ←
              </button>
              <button
                onClick={handlePlayPause}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Next item"
              >
                →
              </button>
            </div>
          )}

          {/* Progress indicator */}
          {displayItems.length > 1 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {displayItems.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-1 h-1 rounded-full transition-colors',
                    index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  }
);

NewsTicker.displayName = 'NewsTicker';

// Specialized News Ticker Components
export interface BreakingNewsTickerProps {
  items: NewsItem[];
  className?: string;
}

export const BreakingNewsTicker = forwardRef<HTMLDivElement, BreakingNewsTickerProps>(
  ({ items, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg',
          className
        )}
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-bold text-sm">BREAKING</span>
          </div>
          <NewsTicker
            items={items}
            variant="scrolling"
            speed={30}
            size="sm"
            className="flex-1"
          />
        </div>
      </div>
    );
  }
);

BreakingNewsTicker.displayName = 'BreakingNewsTicker';

export interface CompactNewsTickerProps {
  items: NewsItem[];
  maxItems?: number;
  className?: string;
}

export const CompactNewsTicker = forwardRef<HTMLDivElement, CompactNewsTickerProps>(
  ({ items, maxItems = 3, className }, ref) => {
    return (
      <NewsTicker
        ref={ref}
        items={items}
        variant="fading"
        size="sm"
        maxItems={maxItems}
        interval={4000}
        showControls={false}
        className={className}
      />
    );
  }
);

CompactNewsTicker.displayName = 'CompactNewsTicker';

export default NewsTicker;
