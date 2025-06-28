import React, { useState, useEffect } from 'react';
import { Visualization } from '../types/visualization';
import { VisualizationCard } from './VisualizationCard';
import { firestoreService } from '../services';
import './Gallery.css';

interface GalleryProps {
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ className = '' }) => {
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch visualizations on component mount
    const loadVisualizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the 5 most recent visualizations
        const result = await firestoreService.getVisualizations(
          {}, // filters
          { field: 'generatedAt', direction: 'desc' }, // sort
          5 // limit
        );
        
        setVisualizations(result.visualizations);
      } catch (err) {
        console.error('Error loading visualizations:', err);
        setError('Failed to load visualizations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadVisualizations();
    
    // Set up real-time listener for updates
    const unsubscribe = firestoreService.subscribeToVisualizations(
      {},
      { field: 'generatedAt', direction: 'desc' },
      5,
      (data) => {
        setVisualizations(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error in real-time listener:', err);
        setError('Connection lost. Please refresh the page.');
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`gallery-container ${className}`}>
        <div className="gallery-loading">
          <div className="loading-spinner"></div>
          <p>Loading visualizations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`gallery-container ${className}`}>
        <div className="gallery-error">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!visualizations || visualizations.length === 0) {
    return (
      <div className={`gallery-container ${className}`}>
        <div className="gallery-empty">
          <h3>No visualizations yet</h3>
          <p>The gallery is waiting for its first AI-generated artwork...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`gallery-container ${className}`}>
      <header className="gallery-header">
        <h1>AI Visualization Gallery</h1>
        <p>Mathematical poetry born from artificial imagination</p>
      </header>
      
      <div className="gallery-grid">
        {visualizations.map((visualization, index) => (
          <VisualizationCard
            key={visualization.id}
            visualization={visualization}
            index={index}
            className="gallery-card"
          />
        ))}
      </div>
      
      <footer className="gallery-footer">
        <p>
          Each visualization is a unique interpretation of a single word, 
          translated into mathematical movement by artificial intelligence.
        </p>
      </footer>
    </div>
  );
};