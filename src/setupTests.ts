// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase for tests
jest.mock('./services/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  functions: {},
  analytics: null,
  app: {}
}));

// Mock Firebase services
jest.mock('./services/firestoreService', () => ({
  firestoreService: {
    getVisualizations: jest.fn().mockResolvedValue([]),
    getVisualization: jest.fn().mockResolvedValue(null),
    createVisualization: jest.fn().mockResolvedValue('test-id'),
    updateVisualization: jest.fn().mockResolvedValue(undefined),
    deleteVisualization: jest.fn().mockResolvedValue(undefined),
    subscribeToVisualizations: jest.fn().mockImplementation((filter, onData, onError) => {
      // Simulate immediate call with empty data
      setTimeout(() => onData([]), 0);
      return () => {}; // Return unsubscribe function
    })
  }
}));

// Mock Claude API
jest.mock('./services/claudeApi', () => ({
  claudeApi: {
    generateVisualization: jest.fn().mockResolvedValue({
      description: 'Test description',
      componentCode: 'console.log("test");',
      philosophicalTheme: 'Test theme'
    }),
    improveVisualization: jest.fn().mockResolvedValue({
      description: 'Improved description',
      componentCode: 'console.log("improved");',
      philosophicalTheme: 'Improved theme'
    }),
    explainVisualization: jest.fn().mockResolvedValue('Test explanation')
  }
}));

// Mock Canvas API for tests
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn().mockReturnValue({ width: 0 }),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
});
