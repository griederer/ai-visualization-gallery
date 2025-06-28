export interface Visualization {
  id: string;
  inspirationWord: string;
  description: string;
  componentCode: string;
  philosophicalTheme: string;
  generatedAt: Date;
  status: 'generating' | 'ready' | 'error';
}

export interface VisualizationFilter {
  category?: string;
  tags?: string[];
  difficulty?: string;
  language?: string;
  searchTerm?: string;
}

export interface VisualizationSort {
  field: 'generatedAt' | 'inspirationWord';
  direction: 'asc' | 'desc';
}

export interface VisualizationGenerationResult {
  componentCode: string;
  description: string;
  philosophicalTheme: string;
}