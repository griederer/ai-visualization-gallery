import React, { useState, useEffect } from 'react';
import { Gallery } from './components/Gallery';
import { AdminPanel } from './components/AdminPanel';
import { AcademicView } from './components/AcademicView';
import { Visualization } from './types/visualization';
import { subscribeToLatestVisualization } from './services/firestoreService';
import './App.css';

function App() {
  const [featuredVisualization, setFeaturedVisualization] = useState<Visualization | null>(null);

  // Subscribe to the latest visualization for the hero section
  useEffect(() => {
    const unsubscribe = subscribeToLatestVisualization((visualization) => {
      if (visualization) {
        setFeaturedVisualization(visualization);
      }
    });

    return unsubscribe;
  }, []);

  // Handle new visualization generation
  const handleVisualizationGenerated = (visualization: Visualization) => {
    console.log('New visualization generated:', visualization);
    // The new visualization will automatically become the featured one
    setFeaturedVisualization(visualization);
  };

  return (
    <div className="App">
      {/* Hero Section - Academic View */}
      <section className="hero-section">
        <AcademicView visualization={featuredVisualization} />
      </section>
      
      {/* Admin Panel for Manual Generation */}
      <AdminPanel 
        onVisualizationGenerated={handleVisualizationGenerated}
      />
      
      {/* Gallery of All Visualizations */}
      <section className="gallery-section">
        <div className="section-header">
          <h2>All Visualizations</h2>
          <p>Explore the complete collection of mathematical meditations</p>
        </div>
        <Gallery className="main-gallery" />
      </section>
    </div>
  );
}

export default App;
