interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  id: string;
  model: string;
  role: 'assistant';
  stop_reason: string;
  stop_sequence: null;
  type: 'message';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeApiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_CLAUDE_API_KEY || '';
    this.apiUrl = process.env.REACT_APP_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    
    if (!this.apiKey) {
      console.warn('Claude API key not found. Please set REACT_APP_CLAUDE_API_KEY in your environment variables.');
    }
  }

  async generateVisualization(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Create a data visualization based on this prompt: "${prompt}". 
        
        Please respond with complete, executable code that includes:
        1. HTML structure if needed
        2. CSS styling
        3. JavaScript/D3.js/Chart.js code for the visualization
        4. Sample data if not provided
        
        Make sure the code is production-ready and includes proper error handling.
        
        Format your response as valid code that can be directly executed.`
      }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data: ClaudeResponse = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  async improveVisualization(existingCode: string, improvementPrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Please improve this existing visualization code based on the following request: "${improvementPrompt}"
        
        Existing code:
        ${existingCode}
        
        Please provide the complete improved code, maintaining the same structure but implementing the requested improvements.`
      }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data: ClaudeResponse = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  async explainVisualization(code: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Please explain this data visualization code in simple terms:
        
        ${code}
        
        Include:
        1. What type of visualization this is
        2. What data it displays
        3. Key features and interactions
        4. How to customize it
        
        Keep the explanation beginner-friendly but comprehensive.`
      }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data: ClaudeResponse = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
}

export const claudeApi = new ClaudeApiService();