import React from 'react';
import { Gallery } from './components/Gallery';
import { AdminPanel } from './components/AdminPanel';
import { Visualization } from './types/visualization';
import './App.css';

function App() {
  // Handle new visualization generation
  const handleVisualizationGenerated = (visualization: Visualization) => {
    console.log('New visualization generated:', visualization);
    // The Gallery component will automatically update through real-time listeners
  };

  return (
    <div className="App">
      {/* Main Gallery */}
      <Gallery className="main-gallery" />
      
      {/* Admin Panel for Manual Generation */}
      <AdminPanel 
        onVisualizationGenerated={handleVisualizationGenerated}
      />
    </div>
  );
}

export default App;
