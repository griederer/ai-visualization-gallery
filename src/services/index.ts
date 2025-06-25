// Firebase services and configuration
export { auth, db, storage, functions, analytics, COLLECTIONS, STORAGE_PATHS } from './firebase';

// Firestore service
export { firestoreService, FirestoreService } from './firestoreService';

// Claude API service
export { claudeApi, ClaudeApiService } from './claudeApi';

// Re-export Firebase app as default
export { default as firebaseApp } from './firebase';