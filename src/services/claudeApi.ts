import { VisualizationGenerationResult } from '../types/visualization';
import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

// Firebase Functions for Claude API integration
const generateVisualizationFunction = httpsCallable(functions, 'generateVisualizationV4');
const testFunction = httpsCallable(functions, 'testFunction');

// Test function to verify Firebase Functions connectivity
export const testFirebaseConnection = async (): Promise<any> => {
  try {
    console.log('Testing Firebase Functions connection...');
    const result = await testFunction({ test: 'hello' });
    console.log('Test result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Test function error:', error);
    throw error;
  }
};

// Generate visualization component code with Claude API via Firebase Functions
export const generateVisualization = async (inspirationWord: string): Promise<VisualizationGenerationResult> => {
  try {
    // First test the connection
    console.log('Testing connection before generation...');
    await testFirebaseConnection();
    
    console.log('Calling generateVisualization function...');
    const result = await generateVisualizationFunction({ inspirationWord });
    console.log('Generation result:', result.data);
    const data = result.data as any;

    if (!data.success) {
      throw new Error(data.error || 'Generation failed');
    }

    return {
      componentCode: data.data.componentCode,
      description: data.data.description,
      philosophicalTheme: data.data.philosophicalTheme
    };

  } catch (error) {
    console.error('Error generating visualization:', error);
    throw new Error(`Failed to generate visualization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Legacy methods for backward compatibility (not used in this app)
export const improveVisualization = async (existingCode: string, improvementPrompt: string): Promise<VisualizationGenerationResult> => {
  // This could be implemented as another Firebase Function if needed
  throw new Error('Improvement feature not implemented yet');
};

export const explainVisualization = async (code: string): Promise<string> => {
  // This could be implemented as another Firebase Function if needed
  throw new Error('Explanation feature not implemented yet');
};

// Export a claudeApi object for compatibility
export const claudeApi = {
  generateVisualization,
  improveVisualization,
  explainVisualization
};