export interface Visualization {
  id: string;
  title: string;
  description: string;
  prompt: string;
  code: string;
  language: 'html' | 'javascript' | 'python' | 'react';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    views: number;
    likes: number;
    downloads: number;
  };
  isPublished: boolean;
  isFeatured: boolean;
}

export interface VisualizationFilter {
  category?: string;
  tags?: string[];
  difficulty?: string;
  language?: string;
  searchTerm?: string;
}

export interface VisualizationSort {
  field: 'createdAt' | 'views' | 'likes' | 'title';
  direction: 'asc' | 'desc';
}