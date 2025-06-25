import {onRequest} from "firebase-functions/v2/https";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Hello World function
export const helloWorld = onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

// Function to create thumbnail when visualization is created
export const createThumbnail = onDocumentCreated(
  "visualizations/{visualizationId}",
  async (event) => {
    const visualization = event.data?.data();
    if (!visualization) return;

    // TODO: Implement thumbnail generation logic
    console.log("Creating thumbnail for visualization:", event.params.visualizationId);
  }
);

// Function to update stats when visualization is viewed
export const updateVisualizationStats = onRequest(async (request, response) => {
  try {
    const {visualizationId, statType} = request.body;
    
    if (!visualizationId || !statType) {
      response.status(400).send("Missing required parameters");
      return;
    }

    const db = admin.firestore();
    const visualizationRef = db.collection("visualizations").doc(visualizationId);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(visualizationRef);
      if (!doc.exists) {
        throw new Error("Visualization not found");
      }

      const currentStats = doc.data()?.stats || {views: 0, likes: 0, downloads: 0};
      const updatedStats = {
        ...currentStats,
        [statType]: (currentStats[statType] || 0) + 1,
      };

      transaction.update(visualizationRef, {
        stats: updatedStats,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    response.json({success: true});
  } catch (error) {
    console.error("Error updating stats:", error);
    response.status(500).send("Internal server error");
  }
});