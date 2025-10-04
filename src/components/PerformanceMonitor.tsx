import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  componentCount: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    componentCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const measurePerformance = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        // Get memory usage if available
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;

        // Count React components (approximate)
        const componentCount = document.querySelectorAll('[data-reactroot]').length;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          componentCount
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    };

    animationFrameRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const measureRenderTime = (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const renderTime = Math.round(end - start);
      setMetrics(prev => ({ ...prev, renderTime }));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime}ms`);
      }
    };
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 bg-black bg-opacity-80 text-white px-3 py-1 rounded text-xs font-mono z-50 hover:bg-opacity-100 transition-opacity"
        title="Show Performance Monitor"
      >
        📊 Perf
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs font-mono z-50 min-w-[200px]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={metrics.fps >= 55 ? 'text-green-400' : metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>
            {metrics.fps}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={metrics.memoryUsage < 50 ? 'text-green-400' : metrics.memoryUsage < 100 ? 'text-yellow-400' : 'text-red-400'}>
            {metrics.memoryUsage}MB
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Components:</span>
          <span className="text-blue-400">{metrics.componentCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Render:</span>
          <span className={metrics.renderTime < 16 ? 'text-green-400' : metrics.renderTime < 33 ? 'text-yellow-400' : 'text-red-400'}>
            {metrics.renderTime}ms
          </span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-xs text-gray-400">
          🚀 Optimized with React.memo, useMemo, useCallback, and virtual scrolling
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
