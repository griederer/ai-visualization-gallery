import {onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Firebase Admin
admin.initializeApp();

// Note: Anthropic client will be initialized inside the function when secrets are available

// Generate visualization with Claude API - V4 with direct key
export const generateVisualizationV4 = onCall(async (request) => {
  try {
    console.log("Function started with data:", JSON.stringify(request.data));
    console.log("Using environment variable");
    
    const {inspirationWord} = request.data;
    
    if (!inspirationWord) {
      console.error("Missing inspiration word");
      throw new Error("Missing inspiration word");
    }

    const claudeApiKey = process.env.CLAUDE_API_KEY;
    console.log("Claude API key exists:", !!claudeApiKey);
    console.log("Claude API key length:", claudeApiKey?.length || 0);
    
    if (!claudeApiKey) {
      console.error("Claude API key not configured");
      throw new Error("Claude API key not configured");
    }

    // Initialize Anthropic client with the secret
    const anthropic = new Anthropic({
      apiKey: claudeApiKey,
    });

    // Generate visualization with Claude
    const prompt = `Create a React Canvas visualization inspired by the word "${inspirationWord}".

Requirements:
- Follow the same structure as wireframe mathematical visualizations
- Include philosophical code comments throughout
- Use wireframe aesthetic (no fills, only strokes)
- Mathematical movement patterns (Perlin noise, spirals, etc.)
- Canvas size: 550x550px
- Cream background (#F0EEE6)
- Self-contained component with useRef and useEffect
- 60fps animation using requestAnimationFrame

The code should be a complete React component function that can be executed directly.

Also provide:
- A 2-3 sentence artistic description of your creative vision
- The central philosophical theme you explored

Return the response as JSON with fields:
- componentCode: The complete React component code
- description: Your artistic description
- philosophicalTheme: The philosophical concept`;

    console.log("Calling Claude API...");
    let message;
    try {
      message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });
      console.log("Claude API response received");
    } catch (claudeError) {
      console.error("Claude API error:", claudeError);
      throw new Error(`Claude API failed: ${claudeError instanceof Error ? claudeError.message : "Unknown error"}`);
    }

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    console.log("Claude response text:", responseText.substring(0, 500) + "...");
    
    // Try to extract JSON from the response
    let generatedContent;
    try {
      // Extract componentCode from template literal (handle multiline)
      const componentCodeMatch = responseText.match(/"componentCode":\s*`([\s\S]*?)`/);
      const descriptionMatch = responseText.match(/"description":\s*"([^"]*?)"/);
      const themeMatch = responseText.match(/"philosophicalTheme":\s*"([^"]*?)"/s);
      
      if (componentCodeMatch && descriptionMatch && themeMatch) {
        console.log("Successfully extracted all components from response");
        generatedContent = {
          componentCode: componentCodeMatch[1].trim(),
          description: descriptionMatch[1],
          philosophicalTheme: themeMatch[1]
        };
      } else {
        throw new Error("Could not extract all required components");
      }
    } catch (parseError) {
      // Fallback: parse the response manually
      console.log("Template literal parsing failed, using fallback parsing");
      console.log("Parse error:", parseError);
      
      // More robust extraction for code blocks
      const codeMatch = responseText.match(/```(?:jsx|javascript|js)?\s*([\s\S]*?)```/);
      const componentCode = codeMatch ? codeMatch[1].trim() : 
        extractSection(responseText, "componentCode") || 
        "// Generated code here";
      
      console.log("Extracted component code length:", componentCode.length);
      console.log("Component code preview:", componentCode.substring(0, 200) + "...");
      
      generatedContent = {
        componentCode,
        description: extractSection(responseText, "description") || `A mathematical visualization inspired by ${inspirationWord}`,
        philosophicalTheme: extractSection(responseText, "philosophicalTheme") || "Mathematical harmony"
      };
    }

    // Validate the generated code
    if (!generatedContent.componentCode || generatedContent.componentCode.length < 50) {
      console.error("Validation failed - code too short:", generatedContent.componentCode?.length || 0);
      console.error("Full response for debugging:", responseText);
      throw new Error(`Generated code appears to be incomplete (${generatedContent.componentCode?.length || 0} characters)`);
    }

    console.log("Function completed successfully");
    return {
      success: true,
      data: {
        componentCode: generatedContent.componentCode,
        description: generatedContent.description,
        philosophicalTheme: generatedContent.philosophicalTheme
      }
    };

  } catch (error) {
    console.error("Error generating visualization:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
});

// Helper function to extract sections from text response
function extractSection(text: string, sectionName: string): string | null {
  const patterns = [
    new RegExp(`"${sectionName}":\\s*"([^"]*)"`, "i"),
    new RegExp(`${sectionName}:\\s*"([^"]*)"`, "i"),
    new RegExp(`${sectionName}:\\s*([^\\n}]+)`, "i")
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

// Function to create thumbnail when visualization is created
// TODO: Uncomment after Firestore is enabled
/*
export const createThumbnail = onDocumentCreated(
  "visualizations/{visualizationId}",
  async (event) => {
    const visualization = event.data?.data();
    if (!visualization) return;

    console.log("Creating thumbnail for visualization:", event.params.visualizationId);
    
    // TODO: In the future, we could generate a static thumbnail
    // For now, we just log the creation
    const db = admin.firestore();
    await db.collection("visualizations").doc(event.params.visualizationId).update({
      thumbnailCreated: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
);
*/

// Simple test function
export const testFunction = onCall(async (request) => {
  return {
    success: true,
    message: "Test function working!",
    data: request.data
  };
});