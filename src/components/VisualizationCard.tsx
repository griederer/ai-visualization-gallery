import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Visualization } from '../types/visualization';
import DynamicVisualization from './DynamicVisualization';
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
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true); // DynamicVisualization handles its own loading
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

  // DynamicVisualization component handles all rendering now

  // DynamicVisualization component handles loading and rendering

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
      <div 
        className={`visualization-canvas ${isLoaded ? 'loaded' : 'loading'}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <DynamicVisualization 
          componentCode={visualization.componentCode}
          inspirationWord={visualization.inspirationWord}
        />
      </div>
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