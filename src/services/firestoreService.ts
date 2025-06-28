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
  onSnapshot,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  Unsubscribe
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

      // Temporary: Get all documents without complex queries while indexes build
      // Apply pagination only for now
      constraints.push(limit(limitCount));

      const q = query(collection(db, COLLECTIONS.VISUALIZATIONS), ...constraints);
      const querySnapshot = await getDocs(q);

      const visualizations: Visualization[] = [];
      let lastDocument: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const visualization = {
          id: doc.id,
          ...data,
          generatedAt: data.generatedAt?.toDate()
        } as Visualization;
        
        // Filter ready visualizations on client side temporarily
        if (visualization.status === 'ready') {
          visualizations.push(visualization);
        }
        
        lastDocument = doc;
      });

      // Sort on client side temporarily
      if (sort) {
        visualizations.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          
          if (sort.direction === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      } else {
        visualizations.sort((a, b) => 
          b.generatedAt.getTime() - a.generatedAt.getTime()
        );
      }

      return { visualizations, lastDoc: lastDocument };
    } catch (error) {
      console.error('Error getting visualizations:', error);
      throw error;
    }
  }

  // Subscribe to visualizations real-time updates
  subscribeToVisualizations(
    filters: VisualizationFilter | undefined,
    sort: VisualizationSort | undefined,
    limitCount: number,
    onData: (visualizations: Visualization[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [];

    // Temporary: Simple query while indexes build
    constraints.push(limit(limitCount * 2)); // Get more to filter on client

    const q = query(collection(db, COLLECTIONS.VISUALIZATIONS), ...constraints);

    return onSnapshot(
      q,
      (querySnapshot) => {
        const allVisualizations: Visualization[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allVisualizations.push({
            id: doc.id,
            ...data,
            generatedAt: data.generatedAt?.toDate()
          } as Visualization);
        });
        
        // Filter and sort on client side temporarily
        const readyVisualizations = allVisualizations
          .filter(v => v.status === 'ready')
          .sort((a, b) => {
            if (sort) {
              const aValue = a[sort.field];
              const bValue = b[sort.field];
              if (sort.direction === 'desc') {
                return bValue > aValue ? 1 : -1;
              } else {
                return aValue > bValue ? 1 : -1;
              }
            } else {
              return b.generatedAt.getTime() - a.generatedAt.getTime();
            }
          })
          .slice(0, limitCount);
          
        onData(readyVisualizations);
      },
      (error) => {
        console.error('Error in visualization subscription:', error);
        onError(error);
      }
    );
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
          generatedAt: data.generatedAt?.toDate()
        } as Visualization;
      }

      return null;
    } catch (error) {
      console.error('Error getting visualization:', error);
      throw error;
    }
  }

  // Create a new visualization
  async createVisualization(visualization: Omit<Visualization, 'id'>): Promise<string> {
    try {
      // Simplified: Just create the visualization without complex cleanup for now
      // The cleanup will happen later when indexes are ready
      const docRef = await addDoc(collection(db, COLLECTIONS.VISUALIZATIONS), {
        ...visualization,
        generatedAt: serverTimestamp()
      });

      // TODO: Add cleanup logic back when indexes are ready
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
      await updateDoc(docRef, updates);
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
}

// Export singleton instance
export const firestoreService = new FirestoreService();

// Helper function for subscribing to the latest visualization (for hero section)
export const subscribeToLatestVisualization = (
  callback: (visualization: Visualization | null) => void
): () => void => {
  const q = query(
    collection(db, COLLECTIONS.VISUALIZATIONS),
    limit(5) // Get a few and filter on client side
  );

  return onSnapshot(q, (snapshot) => {
    const visualizations = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          generatedAt: data.generatedAt?.toDate() || new Date()
        } as Visualization;
      })
      .filter(vis => vis.status === 'ready') // Only ready visualizations
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    
    callback(visualizations.length > 0 ? visualizations[0] : null);
  });
};