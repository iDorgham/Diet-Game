// Advanced animation component following Level 303 requirements
// Framer Motion with smooth progress animations and micro-interactions

import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import '../../styles/components.css';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  maxValue: number;
  currentValue: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  maxValue,
  currentValue,
  color = '#4F46E5', // indigo-600
  backgroundColor = '#E5E7EB', // gray-200
  height = 12,
  showLabel = true,
  showPercentage = true,
  animated = true,
  delay = 0,
  duration = 1.5,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();
  const progressValue = useMotionValue(0);
  const width = useTransform(progressValue, [0, 100], ['0%', '100%']);
  
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  useEffect(() => {
    if (isInView && animated) {
      setIsVisible(true);
      controls.start({
        width: `${progress}%`,
        transition: {
          duration,
          delay,
          ease: [0.4, 0.0, 0.2, 1], // Custom easing
        },
      });
      
      // Animate the motion value for smooth transitions
      progressValue.set(progress);
    } else if (!animated) {
      progressValue.set(progress);
    }
  }, [isInView, progress, animated, controls, progressValue, duration, delay]);
  
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getHeightClass = (height: number) => {
    if (height <= 8) return 'progress-bar-height-8';
    if (height <= 12) return 'progress-bar-height-12';
    if (height <= 14) return 'progress-bar-height-14';
    if (height <= 16) return 'progress-bar-height-16';
    return 'progress-bar-height-20';
  };

  const getBackgroundClass = (bgColor: string) => {
    // Map common colors to CSS classes
    if (bgColor === '#E5E7EB' || bgColor === '#E5E7EB') return 'progress-bar-bg-gray';
    if (bgColor === '#DBEAFE') return 'progress-bar-bg-blue';
    if (bgColor === '#D1FAE5') return 'progress-bar-bg-green';
    if (bgColor === '#EDE9FE') return 'progress-bar-bg-purple';
    if (bgColor === '#FEF3C7') return 'progress-bar-bg-yellow';
    return 'progress-bar-bg-gray'; // default fallback
  };
  
  return (
    <div ref={ref} className={`w-full ${className}`}>
      {/* Label and Values */}
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Progress
            </span>
            {showPercentage && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ delay: delay + 0.2 }}
                className="text-xs text-gray-500"
              >
                {Math.round(progress)}%
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ 
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : 10
              }}
              transition={{ delay: delay + 0.3 }}
              className="text-sm font-semibold text-gray-900"
            >
              {formatValue(currentValue)}
            </motion.span>
            <span className="text-sm text-gray-500">/ {formatValue(maxValue)}</span>
          </div>
        </div>
      )}
      
      {/* Progress Bar Container */}
      <div
        className={`progress-bar-container ${getHeightClass(height)} ${getBackgroundClass(backgroundColor)}`}
      >
        {/* Background Glow Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 0.1 : 0 }}
          transition={{ delay: delay + 0.1 }}
          className="progress-bar-background-glow"
          style={{
            background: `linear-gradient(90deg, ${color}20, ${color}40, ${color}20)`,
          }}
        />
        
        {/* Main Progress Bar */}
        <motion.div
          animate={controls}
          className="progress-bar-main"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        >
          {/* Shimmer Effect */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: isVisible ? '100%' : '-100%' }}
            transition={{
              duration: 2,
              delay: delay + 0.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="progress-bar-shimmer"
          />
          
          {/* Progress Text Overlay */}
          {showPercentage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8
              }}
              transition={{ delay: delay + 0.4 }}
              className="progress-bar-text-overlay"
            >
              <span className="progress-bar-text">
                {Math.round(progress)}%
              </span>
            </motion.div>
          )}
        </motion.div>
        
        {/* Completion Celebration */}
        {progress >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.8, type: 'spring', stiffness: 200 }}
            className="progress-bar-completion"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 0.6,
                repeat: 2,
                delay: delay + 1
              }}
              className="progress-bar-completion-icon"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Indicator Dots */}
      <div className="flex justify-between mt-2">
        {[0, 25, 50, 75, 100].map((milestone) => (
          <motion.div
            key={milestone}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isVisible ? 1 : 0,
              opacity: isVisible ? 1 : 0
            }}
            transition={{ 
              delay: delay + 0.2 + (milestone / 100) * 0.5,
              type: 'spring',
              stiffness: 200
            }}
            className={`w-2 h-2 rounded-full ${
              progress >= milestone ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Specialized XP Progress Bar
export const XPProgressBar: React.FC<{
  currentXP: number;
  level: number;
  animated?: boolean;
  delay?: number;
}> = ({ currentXP, level, animated = true, delay = 0 }) => {
  const xpForNextLevel = level * 100;
  const progress = (currentXP / xpForNextLevel) * 100;
  
  return (
    <AnimatedProgressBar
      progress={progress}
      maxValue={xpForNextLevel}
      currentValue={currentXP}
      color="#7C3AED" // purple-600
      height={16}
      showLabel={true}
      showPercentage={true}
      animated={animated}
      delay={delay}
      duration={2}
      className="mb-4"
    />
  );
};

// Specialized Score Progress Bar
export const ScoreProgressBar: React.FC<{
  score: number;
  animated?: boolean;
  delay?: number;
}> = ({ score, animated = true, delay = 0 }) => {
  const nextStarThreshold = Math.ceil(score / 1000) * 1000;
  const progress = (score / nextStarThreshold) * 100;
  
  return (
    <AnimatedProgressBar
      progress={progress}
      maxValue={nextStarThreshold}
      currentValue={score}
      color="#F59E0B" // amber-500
      height={14}
      showLabel={true}
      showPercentage={false}
      animated={animated}
      delay={delay}
      duration={1.8}
    />
  );
};

export default AnimatedProgressBar;
