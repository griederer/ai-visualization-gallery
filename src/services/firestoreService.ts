import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import { Visualization, VisualizationFilter, VisualizationSort } from '../types/visualization';

export class FirestoreService {
  // Get all visualizations with filtering and sorting
  async getVisualizations(
    filters?: VisualizationFilter,
    sort?: VisualizationSort,
    limitCount = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{ visualizations: Visualization[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Only show published visualizations by default
      constraints.push(where('isPublished', '==', true));

      // Apply filters
      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters?.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags));
      }

      if (filters?.difficulty) {
        constraints.push(where('difficulty', '==', filters.difficulty));
      }

      if (filters?.language) {
        constraints.push(where('language', '==', filters.language));
      }

      // Apply sorting
      if (sort) {
        constraints.push(orderBy(sort.field, sort.direction));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // Apply pagination
      constraints.push(limit(limitCount));
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, COLLECTIONS.VISUALIZATIONS), ...constraints);
      const querySnapshot = await getDocs(q);

      const visualizations: Visualization[] = [];
      let lastDocument: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visualizations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Visualization);
        lastDocument = doc;
      });

      return { visualizations, lastDoc: lastDocument };
    } catch (error) {
      console.error('Error getting visualizations:', error);
      throw error;
    }
  }

  // Get a single visualization by ID
  async getVisualization(id: string): Promise<Visualization | null> {
    try {
      const docRef = doc(db, COLLECTIONS.VISUALIZATIONS, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Visualization;
      }

      return null;
    } catch (error) {
      console.error('Error getting visualization:', error);
      throw error;
    }
  }

  // Create a new visualization
  async createVisualization(visualization: Omit<Visualization, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.VISUALIZATIONS), {
        ...visualization,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating visualization:', error);
      throw error;
    }
  }

  // Update an existing visualization
  async updateVisualization(id: string, updates: Partial<Visualization>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VISUALIZATIONS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating visualization:', error);
      throw error;
    }
  }

  // Delete a visualization
  async deleteVisualization(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VISUALIZATIONS, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting visualization:', error);
      throw error;
    }
  }

  // Increment view count
  async incrementViews(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VISUALIZATIONS, id);
      await updateDoc(docRef, {
        'stats.views': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  // Increment like count
  async incrementLikes(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VISUALIZATIONS, id);
      await updateDoc(docRef, {
        'stats.likes': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing likes:', error);
      throw error;
    }
  }

  // Increment download count
  async incrementDownloads(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VISUALIZATIONS, id);
      await updateDoc(docRef, {
        'stats.downloads': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing downloads:', error);
      throw error;
    }
  }

  // Search visualizations by title or description
  async searchVisualizations(searchTerm: string, limitCount = 20): Promise<Visualization[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified version - consider using Algolia or similar for production
      const constraints: QueryConstraint[] = [
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ];

      const q = query(collection(db, COLLECTIONS.VISUALIZATIONS), ...constraints);
      const querySnapshot = await getDocs(q);

      const visualizations: Visualization[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const visualization = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Visualization;

        // Client-side filtering for search term
        if (
          visualization.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visualization.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visualization.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          visualizations.push(visualization);
        }
      });

      return visualizations;
    } catch (error) {
      console.error('Error searching visualizations:', error);
      throw error;
    }
  }

  // Get featured visualizations
  async getFeaturedVisualizations(limitCount = 6): Promise<Visualization[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.VISUALIZATIONS),
        where('isPublished', '==', true),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const visualizations: Visualization[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visualizations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Visualization);
      });

      return visualizations;
    } catch (error) {
      console.error('Error getting featured visualizations:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();