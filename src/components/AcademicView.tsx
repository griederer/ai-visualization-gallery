import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Visualization } from '../types/visualization';
import DynamicVisualization from './DynamicVisualization';
import './AcademicView.css';

interface AcademicViewProps {
  visualization: Visualization | null;
}

export const AcademicView: React.FC<AcademicViewProps> = ({ visualization }) => {
  const [showCode, setShowCode] = React.useState(true);

  // Clean the code for display (remove imports/exports for cleaner view)
  const displayCode = React.useMemo(() => {
    if (!visualization) return '';
    let cleaned = visualization.componentCode;
    // Remove import statements for cleaner display
    cleaned = cleaned.replace(/import.*?from.*?;[\n\r]*/g, '');
    // Remove export statements
    cleaned = cleaned.replace(/export\s+default\s+\w+;?[\n\r]*/g, '');
    return cleaned.trim();
  }, [visualization?.componentCode]);

  // Sample philosophical text - in a real app this would come from Claude or be customizable
  const philosophicalText = React.useMemo(() => {
    if (!visualization) return '';
    return `
    ${visualization.philosophicalTheme}

    The code represents more than mere instructions to a machine. 
    It is a manifestation of mathematical harmony, where each line 
    breathes with purpose and meaning.

    In the dance of numbers and geometry, we find reflections 
    of deeper truths about existence, time, and the nature 
    of consciousness itself.

    The visualization emerges not just as pixels on a screen, 
    but as a meditation on the infinite patterns that 
    govern our universe.

    "${visualization.inspirationWord}" becomes a gateway 
    through which we explore the intersection of 
    technology and wisdom.
  `;
  }, [visualization]);

  // Handle empty state
  if (!visualization) {
    return (
      <div className="academic-view">
        <div className="academic-container">
          {/* Left Panel - Empty State */}
          <div className="code-panel">
            <div className="panel-header">
              <span className="panel-number">∅</span>
              <span className="panel-title">The Void</span>
            </div>
            <div className="empty-state">
              <div className="empty-message">
                <p>In the beginning was the void,</p>
                <p>and the void was without form.</p>
                <br />
                <p>Generate your first visualization</p>
                <p>to begin the journey of mathematical poetry.</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Philosophy */}
          <div className="wisdom-panel">
            <div className="panel-header">
              <span className="panel-number">§∞</span>
              <span className="panel-title">The Way</span>
            </div>
            <div className="wisdom-content">
              <div className="wisdom-text">
                <p>The path of code is like water flowing through stone. It finds its way through the simplest channel, yet carves the deepest canyons.</p>
                
                <p>In the space between intention and execution, between thought and manifestation, lies the essence of creative programming.</p>
                
                <p>Each algorithm is a prayer, each function a meditation, each visualization a glimpse into the infinite patterns that govern existence.</p>
                
                <p>Begin with a single word. Let it become mathematics. Let mathematics become art. Let art become wisdom.</p>
              </div>
              
              <div className="metadata">
                <div className="inspiration-word">∅ void</div>
                <div className="generation-date">
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).format(new Date())}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="academic-view">
      <div className="academic-container">
        {/* Left Panel - Code or Visualization */}
        <div className="code-panel">
          <div className="panel-header">
            <span className="panel-number">1</span>
            <span className="panel-title">
              {showCode ? 'The Algorithm' : 'The Manifestation'}
            </span>
            <div className="panel-controls">
              <button 
                className={`toggle-btn ${showCode ? 'active' : ''}`}
                onClick={() => setShowCode(true)}
              >
                Code
              </button>
              <button 
                className={`toggle-btn ${!showCode ? 'active' : ''}`}
                onClick={() => setShowCode(false)}
              >
                Visual
              </button>
            </div>
          </div>
          
          {showCode ? (
            <div className="code-container">
              <SyntaxHighlighter
                language="javascript"
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
                }}
                showLineNumbers={true}
                lineNumberStyle={{
                  color: '#666',
                  paddingRight: '1rem',
                  fontSize: '0.75rem',
                }}
              >
                {displayCode}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="visualization-container-left">
              <DynamicVisualization 
                componentCode={visualization.componentCode}
                inspirationWord={visualization.inspirationWord}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Philosophy */}
        <div className="wisdom-panel">
          <div className="panel-header">
            <span className="panel-number">§1</span>
            <span className="panel-title">Contemplations</span>
          </div>
          <div className="wisdom-content">
            <div className="wisdom-text">
              {philosophicalText.split('\n\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="wisdom-paragraph">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
            
            <div className="metadata">
              <div className="inspiration-word">
                {visualization.inspirationWord}
              </div>
              <div className="generation-date">
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).format(visualization.generatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AcademicView;