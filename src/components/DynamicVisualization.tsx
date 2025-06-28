import React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';

interface DynamicVisualizationProps {
  componentCode: string;
  inspirationWord: string;
}

const DynamicVisualization: React.FC<DynamicVisualizationProps> = ({ 
  componentCode, 
  inspirationWord 
}) => {
  // Clean the component code to extract just the component function
  const cleanCode = React.useMemo(() => {
    // Remove import statements since they're not needed in react-live
    let cleaned = componentCode.replace(/import.*?from.*?;/g, '');
    
    // Remove export statements
    cleaned = cleaned.replace(/export\s+default\s+\w+;?/g, '');
    
    // If the code defines a component, we need to render it
    // Look for the component name (assumes it's the main component)
    const componentMatch = cleaned.match(/(?:const|function)\s+(\w+)/);
    const componentName = componentMatch ? componentMatch[1] : 'Component';
    
    // Add a render call at the end if it's not already there
    if (!cleaned.includes('<' + componentName)) {
      cleaned += `\n\nrender(<${componentName} />);`;
    }
    
    return cleaned;
  }, [componentCode]);

  // Scope object for react-live
  const scope = {
    React,
    useRef: React.useRef,
    useEffect: React.useEffect,
    useState: React.useState,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
  };

  return (
    <div style={{ 
      width: 550, 
      height: 550, 
      background: '#F0EEE6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <LiveProvider 
        code={cleanCode} 
        scope={scope}
        noInline={true}
      >
        <LivePreview 
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}
        />
        <LiveError 
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            background: 'rgba(255, 0, 0, 0.1)',
            color: '#d32f2f',
            padding: 8,
            borderRadius: 4,
            fontSize: 12,
            maxHeight: 100,
            overflow: 'auto',
            fontFamily: 'monospace',
            display: 'none' // Hide by default, will show if there's an error
          }}
        />
      </LiveProvider>
    </div>
  );
};

export default DynamicVisualization;