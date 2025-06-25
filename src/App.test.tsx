import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './App';

test('renders main app components', async () => {
  await act(async () => {
    render(<App />);
  });
  
  // Check that the app renders without crashing
  const appElement = document.querySelector('.App');
  expect(appElement).toBeInTheDocument();
});

test('renders admin panel toggle', async () => {
  await act(async () => {
    render(<App />);
  });
  
  const adminToggle = screen.getByLabelText(/toggle admin panel/i);
  expect(adminToggle).toBeInTheDocument();
});

test('shows empty state when no visualizations', async () => {
  await act(async () => {
    render(<App />);
  });
  
  const emptyText = screen.getByText(/no visualizations yet/i);
  expect(emptyText).toBeInTheDocument();
});
