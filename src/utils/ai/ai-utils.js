/**
 * AI Utilities for QwenPad IDE
 * Provides helper functions for AI interactions
 */

import qwenCoderAPI from '../lib/ai/qwen-coder-api';
import toast from '../components/toast';

class AIUtils {
  constructor() {
    this.isInitialized = false;
    this.config = null;
  }

  /**
   * Initialize AI utilities
   */
  async init(config) {
    try {
      await qwenCoderAPI.init(config);
      this.config = config;
      this.isInitialized = true;
      console.log('AI utilities initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AI utilities:', error);
      toast(`AI initialization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if AI is properly configured
   */
  isAIReady() {
    if (!this.isInitialized) return false;
    
    const status = qwenCoderAPI.getConfigStatus();
    return status.isInitialized && (status.hasApiKey || !status.isCloudMode);
  }

  /**
   * Get AI suggestions for code completion
   */
  async getCodeCompletions(codeContext, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    try {
      const completions = await qwenCoderAPI.codeCompletion(codeContext, options);
      return completions;
    } catch (error) {
      console.error('Error getting code completions:', error);
      throw error;
    }
  }

  /**
   * Get AI explanation for selected code
   */
  async explainCode(code, language, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    try {
      const explanation = await qwenCoderAPI.explainCode(code, {
        ...options,
        language
      });
      return explanation;
    } catch (error) {
      console.error('Error explaining code:', error);
      throw error;
    }
  }

  /**
   * Ask AI to fix code issues
   */
  async fixCodeIssues(code, issues, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    try {
      const fixedCode = await qwenCoderAPI.fixCode(code, issues, options);
      return fixedCode;
    } catch (error) {
      console.error('Error fixing code:', error);
      throw error;
    }
  }

  /**
   * Generate documentation for code
   */
  async generateDoc(code, language, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    try {
      const documentation = await qwenCoderAPI.generateDocumentation(code, {
        ...options,
        language
      });
      return documentation;
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw error;
    }
  }

  /**
   * Generate code based on natural language description
   */
  async generateCodeFromDescription(description, language, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    try {
      const generated = await qwenCoderAPI.generateCode(description, {
        ...options,
        language
      });
      return generated;
    } catch (error) {
      console.error('Error generating code from description:', error);
      throw error;
    }
  }

  /**
   * Get available AI models
   */
  async getAvailableModels() {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    try {
      return await qwenCoderAPI.getAvailableModels();
    } catch (error) {
      console.error('Error getting available models:', error);
      throw error;
    }
  }

  /**
   * Format code using AI
   */
  async formatCode(code, language, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    const prompt = `Format and improve the following ${language} code following best practices and style guides. 
    Keep the functionality exactly the same but improve readability and structure: ${code}`;

    try {
      const formatted = await qwenCoderAPI.generateCode(prompt, {
        ...options,
        language,
        maxTokens: options.maxTokens || 500
      });
      return formatted;
    } catch (error) {
      console.error('Error formatting code:', error);
      throw error;
    }
  }

  /**
   * Optimize code performance
   */
  async optimizeCode(code, language, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    const prompt = `Optimize the following ${language} code for better performance. 
    Keep the functionality exactly the same but improve efficiency: ${code}`;

    try {
      const optimized = await qwenCoderAPI.generateCode(prompt, {
        ...options,
        language,
        maxTokens: options.maxTokens || 500
      });
      return optimized;
    } catch (error) {
      console.error('Error optimizing code:', error);
      throw error;
    }
  }

  /**
   * Convert code from one language to another
   */
  async convertCode(code, fromLanguage, toLanguage, options = {}) {
    if (!this.isAIReady()) {
      throw new Error('AI is not ready. Please configure AI settings first.');
    }

    const prompt = `Convert the following ${fromLanguage} code to ${toLanguage}. 
    Maintain the same functionality and logic: ${code}`;

    try {
      const converted = await qwenCoderAPI.generateCode(prompt, {
        ...options,
        language: toLanguage,
        maxTokens: options.maxTokens || 1000
      });
      return converted;
    } catch (error) {
      console.error('Error converting code:', error);
      throw error;
    }
  }

  /**
   * Get AI configuration status
   */
  getConfigStatus() {
    if (!this.isInitialized) {
      return { isInitialized: false, isReady: false };
    }
    
    const apiStatus = qwenCoderAPI.getConfigStatus();
    return {
      isInitialized: true,
      isReady: this.isAIReady(),
      ...apiStatus
    };
  }
}

// Export singleton instance
export default new AIUtils();