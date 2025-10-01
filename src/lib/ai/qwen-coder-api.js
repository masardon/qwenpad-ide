/**
 * Qwen Coder API Integration Layer
 * Provides interface to Qwen AI models for code assistance
 */

import ajax from '@deadlyjack/ajax';
import toast from '../components/toast';

class QwenCoderAPI {
  constructor() {
    this.apiKey = null;
    this.apiEndpoint = null;
    this.model = 'qwen-coder'; // Default model
    this.isCloudMode = true; // Whether to use cloud or local API
    this.localEndpoint = null; // Local API endpoint if running locally
  }

  /**
   * Initialize the Qwen Coder API with configuration
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - API key for cloud service
   * @param {string} config.apiEndpoint - Cloud API endpoint
   * @param {string} config.localEndpoint - Local API endpoint
   * @param {boolean} config.isCloudMode - Whether to use cloud mode
   */
  async init(config) {
    this.apiKey = config.apiKey || this.apiKey;
    this.apiEndpoint = config.apiEndpoint || this.apiEndpoint;
    this.localEndpoint = config.localEndpoint || this.localEndpoint;
    this.isCloudMode = config.isCloudMode !== undefined ? config.isCloudMode : this.isCloudMode;
    
    // Validate configuration
    if (this.isCloudMode && !this.apiEndpoint) {
      throw new Error('API endpoint is required for cloud mode');
    }
    
    // Test the connection
    try {
      await this.healthCheck();
      console.log('Qwen Coder API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Qwen Coder API:', error);
      throw error;
    }
  }

  /**
   * Check if the API is available
   */
  async healthCheck() {
    const endpoint = this.isCloudMode ? this.apiEndpoint : this.localEndpoint;
    if (!endpoint) {
      throw new Error('No endpoint configured');
    }

    // Make a simple request to check if the API is responsive
    try {
      const response = await fetch(`${endpoint}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.isCloudMode && this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`API health check failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Qwen Coder API health check passed:', data);
      return true;
    } catch (error) {
      console.error('Qwen Coder API health check failed:', error);
      throw error;
    }
  }

  /**
   * Generate code based on prompt and context
   * @param {string} prompt - The prompt to generate code for
   * @param {Object} options - Additional options
   * @param {string} options.language - Programming language
   * @param {string} options.context - Code context
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Creativity parameter (0-1)
   * @param {string} options.fileContent - Current file content
   * @param {number} options.cursorPosition - Cursor position in file
   * @param {string} options.projectContext - Project context information
   */
  async generateCode(prompt, options = {}) {
    const endpoint = this.isCloudMode ? this.apiEndpoint : this.localEndpoint;
    if (!endpoint) {
      throw new Error('No endpoint configured');
    }

    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are an expert coding assistant. Generate code based on the user's request. 
          Be precise, efficient, and follow best practices for the specified programming language. 
          Consider the current context and provide relevant code snippets.`
        },
        {
          role: 'user',
          content: this._buildPrompt(prompt, options)
        }
      ],
      stream: false, // For now, we'll use non-streaming
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 500,
      // Additional parameters specific to coding
      language: options.language,
      context: options.context,
      file_content: options.fileContent,
      cursor_position: options.cursorPosition,
      project_context: options.projectContext
    };

    try {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.isCloudMode && this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return this._extractCodeFromResponse(data, options);
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  }

  /**
   * Provide code completion based on current context
   * @param {string} codeContext - Current code context
   * @param {Object} options - Additional options
   */
  async codeCompletion(codeContext, options = {}) {
    const prompt = `Complete the following code based on the context provided. 
    Only return the completion, nothing else. Context: ${codeContext}`;

    return await this.generateCode(prompt, {
      ...options,
      context: codeContext,
      maxTokens: options.maxTokens || 100
    });
  }

  /**
   * Explain code functionality
   * @param {string} code - Code to explain
   * @param {Object} options - Additional options
   */
  async explainCode(code, options = {}) {
    const prompt = `Explain the following code in detail. 
    Describe what it does, how it works, and any potential improvements: ${code}`;

    return await this.generateCode(prompt, {
      ...options,
      context: code,
      maxTokens: options.maxTokens || 300
    });
  }

  /**
   * Fix code issues or bugs
   * @param {string} code - Code with issues
   * @param {string} issues - Description of issues
   * @param {Object} options - Additional options
   */
  async fixCode(code, issues, options = {}) {
    const prompt = `Fix the following code issues: ${issues}. 
    Here is the current code: ${code}. 
    Provide the corrected version.`;

    return await this.generateCode(prompt, {
      ...options,
      context: `${code}\nIssues: ${issues}`,
      maxTokens: options.maxTokens || 500
    });
  }

  /**
   * Generate code documentation
   * @param {string} code - Code to document
   * @param {Object} options - Additional options
   */
  async generateDocumentation(code, options = {}) {
    const prompt = `Generate documentation for the following code. 
    Include comments, docstrings, or documentation based on the language: ${code}`;

    return await this.generateCode(prompt, {
      ...options,
      context: code,
      language: options.language,
      maxTokens: options.maxTokens || 400
    });
  }

  /**
   * Build a comprehensive prompt combining context and user input
   * @private
   */
  _buildPrompt(userPrompt, options) {
    let fullPrompt = userPrompt;

    // Add language context
    if (options.language) {
      fullPrompt = `Programming language: ${options.language}\n\n${fullPrompt}`;
    }

    // Add file content context
    if (options.fileContent) {
      fullPrompt = `Current file context:\n${options.fileContent}\n\n${fullPrompt}`;
    }

    // Add project context
    if (options.projectContext) {
      fullPrompt = `Project context: ${options.projectContext}\n\n${fullPrompt}`;
    }

    // Add cursor position context
    if (options.cursorPosition !== undefined) {
      fullPrompt = `Cursor position: ${options.cursorPosition}\n\n${fullPrompt}`;
    }

    return fullPrompt;
  }

  /**
   * Extract code from API response
   * @private
   */
  _extractCodeFromResponse(response, options) {
    // Handle different response formats
    if (response.choices && response.choices.length > 0) {
      let content = response.choices[0].message?.content || '';
      
      // Remove common code block markers if present
      content = content.replace(/```[a-zA-Z]*\n?/g, '');
      content = content.replace(/```\s*$/, '');
      
      return {
        code: content.trim(),
        model: response.model,
        usage: response.usage,
        finish_reason: response.choices[0].finish_reason
      };
    }
    
    throw new Error('Invalid response format from API');
  }

  /**
   * Get available models
   */
  async getAvailableModels() {
    const endpoint = this.isCloudMode ? this.apiEndpoint : this.localEndpoint;
    if (!endpoint) {
      throw new Error('No endpoint configured');
    }

    try {
      const response = await fetch(`${endpoint}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.isCloudMode && this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get models: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting available models:', error);
      throw error;
    }
  }

  /**
   * Set the active model
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Get current configuration status
   */
  getConfigStatus() {
    return {
      isInitialized: !!(this.apiEndpoint || this.localEndpoint),
      isCloudMode: this.isCloudMode,
      hasApiKey: !!this.apiKey,
      endpoint: this.isCloudMode ? this.apiEndpoint : this.localEndpoint
    };
  }
}

// Export a singleton instance
export default new QwenCoderAPI();