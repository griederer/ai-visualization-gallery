import React, { useState, useEffect } from 'react';
import { Visualization } from '../types/visualization';
import { claudeApi, firestoreService } from '../services';
import './AdminPanel.css';

interface AdminPanelProps {
  className?: string;
  onVisualizationGenerated?: (visualization: Visualization) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  className = '',
  onVisualizationGenerated
}) => {
  const [inspirationWord, setInspirationWord] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [oldestVisualization, setOldestVisualization] = useState<Visualization | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Load oldest visualization to show what will be replaced
  useEffect(() => {
    const loadOldestVisualization = async () => {
      try {
        const visualizations = await firestoreService.getVisualizations({
          limit: 5,
          sortBy: 'generatedAt',
          sortOrder: 'asc'
        });
        
        if (visualizations && visualizations.length >= 5) {
          setOldestVisualization(visualizations[0]);
        }
      } catch (err) {
        console.error('Error loading oldest visualization:', err);
      }
    };

    loadOldestVisualization();
  }, []);

  // Toggle admin panel visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Generate new visualization
  const handleGenerate = async () => {
    if (!inspirationWord.trim()) {
      setError('Please enter an inspiration word');
      return;
    }

    if (isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);
      setGenerationStatus('Preparing generation...');

      // Step 1: Create placeholder visualization
      setGenerationStatus('Creating placeholder...');
      const placeholderVisualization: Omit<Visualization, 'id'> = {
        inspirationWord: inspirationWord.trim(),
        generatedAt: new Date(),
        description: '',
        componentCode: '',
        philosophicalTheme: '',
        status: 'generating'
      };

      const newVisualizationId = await firestoreService.createVisualization(placeholderVisualization);
      
      // Step 2: Generate code with Claude API
      setGenerationStatus('Generating visualization with AI...');
      const generatedCode = await claudeApi.generateVisualization(inspirationWord.trim());
      
      // Step 3: Update visualization with generated content
      setGenerationStatus('Finalizing visualization...');
      const updatedVisualization: Partial<Visualization> = {
        description: generatedCode.description,
        componentCode: generatedCode.componentCode,
        philosophicalTheme: generatedCode.philosophicalTheme,
        status: 'ready'
      };

      await firestoreService.updateVisualization(newVisualizationId, updatedVisualization);

      // Step 4: Remove oldest visualization if we have more than 5
      const currentVisualizations = await firestoreService.getVisualizations({
        limit: 10,
        sortBy: 'generatedAt',
        sortOrder: 'asc'
      });

      if (currentVisualizations.length > 5) {
        const visualizationsToDelete = currentVisualizations.slice(0, currentVisualizations.length - 5);
        for (const viz of visualizationsToDelete) {
          await firestoreService.deleteVisualization(viz.id);
        }
      }

      // Success!
      setGenerationStatus('Generation complete!');
      setInspirationWord('');
      
      if (onVisualizationGenerated) {
        const finalVisualization = await firestoreService.getVisualization(newVisualizationId);
        if (finalVisualization) {
          onVisualizationGenerated(finalVisualization);
        }
      }

      // Auto-hide status after success
      setTimeout(() => {
        setGenerationStatus('');
      }, 3000);

    } catch (err) {
      console.error('Error generating visualization:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate visualization');
      setGenerationStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleGenerate();
    }
  };

  // Clear error when typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInspirationWord(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className={`admin-panel ${className} ${isVisible ? 'visible' : 'hidden'}`}>
      {/* Toggle Button */}
      <button
        className="admin-toggle"
        onClick={toggleVisibility}
        aria-label="Toggle admin panel"
      >
        {isVisible ? '✕' : '⚙️'}
      </button>

      {/* Admin Panel Content */}
      <div className="admin-content">
        <header className="admin-header">
          <h3>Generate New Visualization</h3>
          <p>Enter a word to inspire AI-generated mathematical art</p>
        </header>

        {/* Input Section */}
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="inspiration-input" className="input-label">
              Inspiration Word
            </label>
            <input
              id="inspiration-input"
              type="text"
              value={inspirationWord}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="e.g., serenity, chaos, growth..."
              disabled={isGenerating}
              className={`inspiration-input ${error ? 'error' : ''}`}
              maxLength={50}
            />
            {error && (
              <span className="error-message">{error}</span>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inspirationWord.trim()}
            className="generate-button"
          >
            {isGenerating ? (
              <>
                <div className="button-spinner"></div>
                Generating...
              </>
            ) : (
              'Generate New'
            )}
          </button>
        </div>

        {/* Status Section */}
        {(generationStatus || isGenerating) && (
          <div className="status-section">
            <div className="status-message">
              {generationStatus}
            </div>
            {isGenerating && (
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            )}
          </div>
        )}

        {/* Replacement Preview */}
        {oldestVisualization && !isGenerating && (
          <div className="replacement-preview">
            <h4>Will Replace:</h4>
            <div className="preview-card">
              <span className="preview-word">
                "{oldestVisualization.inspirationWord}"
              </span>
              <span className="preview-date">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }).format(oldestVisualization.generatedAt)}
              </span>
            </div>
            <p className="replacement-note">
              The gallery maintains exactly 5 visualizations. 
              The oldest will be replaced when generating new ones.
            </p>
          </div>
        )}

        {/* Quick Inspiration */}
        <div className="quick-inspiration">
          <h4>Need Inspiration?</h4>
          <div className="inspiration-suggestions">
            {['harmony', 'emergence', 'flow', 'resonance', 'bloom'].map((word) => (
              <button
                key={word}
                onClick={() => setInspirationWord(word)}
                disabled={isGenerating}
                className="suggestion-chip"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};