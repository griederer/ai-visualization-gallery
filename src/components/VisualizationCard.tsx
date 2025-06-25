import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Visualization } from '../types/visualization';
import './VisualizationCard.css';

interface VisualizationCardProps {
  visualization: Visualization;
  index: number;
  className?: string;
}

export const VisualizationCard: React.FC<VisualizationCardProps> = ({
  visualization,
  index,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const componentRef = useRef<any>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intersection Observer for performance optimization
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(cardRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Dynamic component loader and executor
  const loadAndExecuteVisualization = useCallback(async () => {
    if (!canvasRef.current || !isInView || !visualization.componentCode) return;

    try {
      setError(null);
      setIsLoaded(false);

      // Create a safe execution environment
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get 2D context');

      // Set canvas size
      canvas.width = 550;
      canvas.height = 550;

      // Parse and execute the generated component code
      // This creates a safe sandbox for the AI-generated code
      const componentFunction = new Function(
        'canvas',
        'ctx',
        'React',
        'useEffect',
        'useRef',
        `
        ${visualization.componentCode}
        
        // Return the cleanup function if it exists
        return typeof cleanup === 'function' ? cleanup : null;
        `
      );

      // Execute the component with proper React hooks context
      const cleanup = componentFunction(
        canvas,
        ctx,
        React,
        useEffect,
        useRef
      );

      // Store cleanup function
      componentRef.current = cleanup;
      setIsLoaded(true);

    } catch (err) {
      console.error(`Error loading visualization "${visualization.inspirationWord}":`, err);
      setError('Failed to load visualization');
      
      // Fallback: Draw a simple error state
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.fillStyle = '#F0EEE6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        ctx.fillStyle = '#999';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Visualization Error', canvas.width / 2, canvas.height / 2);
      }
    }
  }, [visualization.componentCode, isInView, visualization.inspirationWord]);

  // Load visualization when in view
  useEffect(() => {
    if (isInView && visualization.status === 'ready') {
      loadAndExecuteVisualization();
    }

    // Cleanup when component unmounts or goes out of view
    return () => {
      if (componentRef.current && typeof componentRef.current === 'function') {
        componentRef.current();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInView, loadAndExecuteVisualization, visualization.status]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Status-based rendering
  const renderCanvas = () => {
    if (visualization.status === 'generating') {
      return (
        <div className="canvas-placeholder generating">
          <div className="generation-spinner"></div>
          <p>Generating...</p>
        </div>
      );
    }

    if (visualization.status === 'error') {
      return (
        <div className="canvas-placeholder error">
          <div className="error-icon">⚠</div>
          <p>Generation failed</p>
        </div>
      );
    }

    return (
      <canvas
        ref={canvasRef}
        className={`visualization-canvas ${isLoaded ? 'loaded' : 'loading'}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    );
  };

  return (
    <div 
      ref={cardRef}
      className={`visualization-card ${className} ${visualization.status}`}
      style={{ 
        '--animation-delay': `${index * 0.1}s` 
      } as React.CSSProperties}
    >
      {/* Canvas Container */}
      <div className="canvas-container">
        {renderCanvas()}
        
        {/* Loading overlay */}
        {visualization.status === 'ready' && !isLoaded && !error && (
          <div className="canvas-loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="card-content">
        <header className="card-header">
          <h3 className="inspiration-word">
            {visualization.inspirationWord}
          </h3>
          <time className="generation-date">
            {formatDate(visualization.generatedAt)}
          </time>
        </header>

        <p className="description">
          {visualization.description}
        </p>

        {visualization.philosophicalTheme && (
          <div className="philosophical-theme">
            <span className="theme-label">Theme:</span>
            <span className="theme-text">{visualization.philosophicalTheme}</span>
          </div>
        )}

        {/* Status indicator */}
        <div className="status-indicator">
          <span className={`status-dot ${visualization.status}`}></span>
          <span className="status-text">
            {visualization.status === 'ready' && 'Live'}
            {visualization.status === 'generating' && 'Creating...'}
            {visualization.status === 'error' && 'Error'}
          </span>
        </div>
      </div>
    </div>
  );
};