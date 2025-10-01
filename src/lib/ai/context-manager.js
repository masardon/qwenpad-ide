/**
 * Context Manager for QwenPad IDE AI
 * Manages project, file, and code context for AI-powered assistance
 */

import fsOperation from '../fileSystem';
import aiUtils from '../utils/ai/ai-utils';

class ContextManager {
  constructor() {
    this.projectContext = {
      structure: [],
      dependencies: {},
      configFiles: {},
      language: null
    };
    
    this.fileContext = {
      currentPath: null,
      currentContent: '',
      language: null,
      cursorPosition: null,
      selection: null
    };
    
    this.editorContext = {
      activeLines: [],
      visibleRange: null,
      history: []
    };
    
    this.contextCache = new Map();
    this.maxCacheSize = 100; // Maximum number of cached contexts
  }

  /**
   * Initialize context manager for a project
   * @param {string} projectPath - Path to the project
   */
  async initialize(projectPath) {
    try {
      console.log(`Initializing context for project: ${projectPath}`);
      
      // Analyze project structure
      await this.analyzeProject(projectPath);
      
      // Set up file watchers for context updates
      this._setupFileWatchers(projectPath);
      
      console.log('Context manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing context manager:', error);
      throw error;
    }
  }

  /**
   * Analyze project structure and extract context
   * @param {string} projectPath - Path to the project
   */
  async analyzeProject(projectPath) {
    try {
      // Get project structure
      this.projectContext.structure = await this._getProjectStructure(projectPath);
      
      // Identify project type and language
      this.projectContext.language = await this._detectProjectLanguage(projectPath);
      
      // Extract dependency information
      this.projectContext.dependencies = await this._getDependencies(projectPath);
      
      // Identify important config files
      this.projectContext.configFiles = await this._getConfigFiles(projectPath);
      
      // Cache the project context
      this._cacheContext('project', projectPath, this.projectContext);
      
      console.log('Project analysis completed');
    } catch (error) {
      console.error('Error analyzing project:', error);
      throw error;
    }
  }

  /**
   * Get project structure recursively
   * @private
   */
  async _getProjectStructure(projectPath, depth = 0, maxDepth = 5) {
    if (depth > maxDepth) return [];

    try {
      const items = await fsOperation(projectPath).lsDir();
      const structure = [];

      for (const item of items) {
        // Skip node_modules, .git, and other large directories
        if (this._shouldSkipDirectory(item.url)) continue;

        if (item.isDirectory) {
          structure.push({
            name: item.name,
            path: item.url,
            type: 'directory',
            children: await this._getProjectStructure(item.url, depth + 1, maxDepth)
          });
        } else {
          structure.push({
            name: item.name,
            path: item.url,
            type: 'file',
            language: this._getFileLanguage(item.name)
          });
        }
      }

      return structure;
    } catch (error) {
      console.error('Error getting project structure:', error);
      return [];
    }
  }

  /**
   * Detect project language/type based on configuration files
   * @private
   */
  async _detectProjectLanguage(projectPath) {
    try {
      const items = await fsOperation(projectPath).lsDir();
      const fileNames = items.map(item => item.name.toLowerCase());

      // Check for specific configuration files to determine project type
      if (fileNames.includes('package.json')) return 'javascript';
      if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) return 'python';
      if (fileNames.includes('go.mod')) return 'go';
      if (fileNames.includes('cargo.toml')) return 'rust';
      if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) return 'java';
      if (fileNames.includes('pubspec.yaml')) return 'dart';
      if (fileNames.includes('build.gradle.kts')) return 'kotlin';
      
      // If no config file, try to infer from file extensions
      const extensions = [...new Set(items.map(item => this._getFileExtension(item.name)))];
      if (extensions.includes('js') || extensions.includes('ts')) return 'javascript';
      if (extensions.includes('py')) return 'python';
      if (extensions.includes('go')) return 'go';
      if (extensions.includes('rs')) return 'rust';
      if (extensions.includes('java')) return 'java';
      if (extensions.includes('kt') || extensions.includes('kts')) return 'kotlin';
      if (extensions.includes('dart')) return 'dart';
      if (extensions.includes('swift')) return 'swift';
      if (extensions.includes('cpp') || extensions.includes('c') || extensions.includes('h')) return 'c++';

      return 'unknown';
    } catch (error) {
      console.error('Error detecting project language:', error);
      return 'unknown';
    }
  }

  /**
   * Get project dependencies
   * @private
   */
  async _getDependencies(projectPath) {
    try {
      const dependencies = {};
      
      // Check for different dependency files based on project type
      const packageJsonPath = `${projectPath}/package.json`;
      if (await fsOperation(packageJsonPath).exists()) {
        const packageJson = await fsOperation(packageJsonPath).readFile();
        const pkg = JSON.parse(packageJson);
        dependencies.npm = {
          dependencies: pkg.dependencies || {},
          devDependencies: pkg.devDependencies || {}
        };
      }

      const requirementsPath = `${projectPath}/requirements.txt`;
      if (await fsOperation(requirementsPath).exists()) {
        const requirements = await fsOperation(requirementsPath).readFile();
        dependencies.pip = this._parseRequirements(requirements);
      }

      const goModPath = `${projectPath}/go.mod`;
      if (await fsOperation(goModPath).exists()) {
        const goMod = await fsOperation(goModPath).readFile();
        dependencies.go = this._parseGoMod(goMod);
      }

      return dependencies;
    } catch (error) {
      console.error('Error getting dependencies:', error);
      return {};
    }
  }

  /**
   * Get important configuration files
   * @private
   */
  async _getConfigFiles(projectPath) {
    try {
      const configFiles = {};
      const configFileNames = [
        'package.json', 'requirements.txt', 'go.mod', 'Cargo.toml',
        'pom.xml', 'build.gradle', 'pubspec.yaml', '.gitignore',
        'Dockerfile', 'docker-compose.yml', 'README.md', 'LICENSE'
      ];

      for (const fileName of configFileNames) {
        const filePath = `${projectPath}/${fileName}`;
        if (await fsOperation(filePath).exists()) {
          try {
            configFiles[fileName] = await fsOperation(filePath).readFile();
          } catch (e) {
            // Some files might be binary or too large, skip them
            console.warn(`Could not read config file ${fileName}:`, e.message);
          }
        }
      }

      return configFiles;
    } catch (error) {
      console.error('Error getting config files:', error);
      return {};
    }
  }

  /**
   * Update context when a file is opened
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   * @param {Object} options - Additional options
   */
  async updateFileContext(filePath, content, options = {}) {
    try {
      this.fileContext.currentPath = filePath;
      this.fileContext.currentContent = content;
      this.fileContext.language = options.language || this._getFileLanguage(filePath);
      this.fileContext.cursorPosition = options.cursorPosition || null;
      this.fileContext.selection = options.selection || null;

      // Cache the file context
      this._cacheContext('file', filePath, this.fileContext);

      console.log(`Updated context for file: ${filePath}`);
    } catch (error) {
      console.error('Error updating file context:', error);
      throw error;
    }
  }

  /**
   * Update editor context
   * @param {Object} context - Editor context information
   */
  updateEditorContext(context) {
    try {
      // Add to history
      this.editorContext.history.push({ ...context, timestamp: Date.now() });
      
      // Keep only recent history (last 50 entries)
      if (this.editorContext.history.length > 50) {
        this.editorContext.history = this.editorContext.history.slice(-50);
      }

      // Update current context
      this.editorContext.activeLines = context.activeLines || this.editorContext.activeLines;
      this.editorContext.visibleRange = context.visibleRange || this.editorContext.visibleRange;
      
      console.log('Updated editor context');
    } catch (error) {
      console.error('Error updating editor context:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive context for AI operations
   * @param {Object} options - Additional options
   * @returns {Object} Context information for AI
   */
  getAIContext(options = {}) {
    const context = {
      project: { ...this.projectContext },
      file: { ...this.fileContext },
      editor: { ...this.editorContext },
      timestamp: Date.now(),
      aiCapabilities: aiUtils.isAIReady()
    };

    // Add recent history if requested
    if (options.includeHistory) {
      context.editor.history = [...this.editorContext.history];
    }

    // Add specific context based on request type
    if (options.requestType) {
      switch (options.requestType) {
        case 'code-completion':
          return this._getCodeCompletionContext(context);
        case 'code-explanation':
          return this._getCodeExplanationContext(context);
        case 'bug-fix':
          return this._getBugFixContext(context);
        case 'documentation':
          return this._getDocumentationContext(context);
        default:
          return context;
      }
    }

    return context;
  }

  /**
   * Get context specifically tailored for code completion
   * @private
   */
  _getCodeCompletionContext(baseContext) {
    return {
      ...baseContext,
      focus: 'code-completion',
      relevantCode: this._getRelevantCodeForCompletion(baseContext),
      patterns: this._extractCodePatterns(baseContext.file.currentContent)
    };
  }

  /**
   * Get context specifically tailored for code explanation
   * @private
   */
  _getCodeExplanationContext(baseContext) {
    return {
      ...baseContext,
      focus: 'code-explanation',
      codeToExplain: this._getCodeForExplanation(baseContext),
      relatedFiles: this._getRelatedFiles(baseContext)
    };
  }

  /**
   * Get context specifically tailored for bug fixing
   * @private
   */
  _getBugFixContext(baseContext) {
    return {
      ...baseContext,
      focus: 'bug-fix',
      codeToFix: this._getCodeForFixing(baseContext),
      errorContext: this._getErrorContext(baseContext),
      relatedDependencies: this._getRelatedDependencies(baseContext)
    };
  }

  /**
   * Get context specifically tailored for documentation generation
   * @private
   */
  _getDocumentationContext(baseContext) {
    return {
      ...baseContext,
      focus: 'documentation',
      codeToDocument: this._getCodeForDocumentation(baseContext),
      projectStandards: this._getProjectStandards(baseContext)
    };
  }

  /**
   * Get relevant code for completion based on cursor position
   * @private
   */
  _getRelevantCodeForCompletion(context) {
    if (!context.file.currentContent) return '';

    const content = context.file.currentContent;
    const cursorPos = context.file.cursorPosition;

    if (cursorPos === null) {
      // If no cursor position, return the last 50 lines
      const lines = content.split('\n');
      return lines.slice(Math.max(0, lines.length - 50)).join('\n');
    }

    // Get context around cursor position (e.g., 10 lines before and after)
    const lines = content.split('\n');
    const lineNum = cursorPos.row || 0;

    const start = Math.max(0, lineNum - 10);
    const end = Math.min(lines.length, lineNum + 10);

    return lines.slice(start, end).join('\n');
  }

  /**
   * Extract code patterns for better completion
   * @private
   */
  _extractCodePatterns(content) {
    const patterns = {
      imports: [],
      functionCalls: [],
      classDeclarations: [],
      variableDeclarations: [],
      comments: []
    };

    // Very basic pattern extraction - in a real system this would be more sophisticated
    if (content) {
      // Extract import statements
      const importRegex = /(import|from|require|include|using)\s+([^\n;]+)/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        patterns.imports.push(match[0]);
      }

      // Extract function/class declarations
      const funcRegex = /(function|class|def|fn|method)\s+(\w+)/g;
      while ((match = funcRegex.exec(content)) !== null) {
        patterns.functionCalls.push(match[0]);
      }
    }

    return patterns;
  }

  /**
   * Get code that needs explanation
   * @private
   */
  _getCodeForExplanation(context) {
    if (context.file.selection) {
      // If there's a selection, explain that
      return context.file.selection;
    }

    // Otherwise, use current context around cursor
    return this._getRelevantCodeForCompletion(context);
  }

  /**
   * Get related files based on current context
   * @private
   */
  _getRelatedFiles(context) {
    const currentFile = context.file.currentPath;
    if (!currentFile) return [];

    // Find related files (same directory, same name with different extensions, etc.)
    const currentDir = currentFile.substring(0, currentFile.lastIndexOf('/'));
    const fileName = currentFile.substring(currentFile.lastIndexOf('/') + 1);
    const baseName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension

    const related = [];

    // Look through project structure for related files
    for (const item of this._flattenProjectStructure(context.project.structure)) {
      if (item.path.startsWith(currentDir) && item.name.includes(baseName) && item.name !== fileName) {
        related.push(item.path);
      }
    }

    return related.slice(0, 5); // Limit to 5 related files
  }

  /**
   * Get related dependencies for the current file
   * @private
   */
  _getRelatedDependencies(context) {
    // This would analyze the file content to determine which dependencies are used
    const dependencies = [];
    
    if (context.file.currentContent && context.project.dependencies) {
      // Very basic dependency detection - real implementation would be more sophisticated
      if (context.project.dependencies.npm) {
        const content = context.file.currentContent;
        for (const dep of Object.keys(context.project.dependencies.npm.dependencies || {})) {
          if (content.includes(dep)) {
            dependencies.push(dep);
          }
        }
      }
    }

    return dependencies;
  }

  /**
   * Get project-specific coding standards
   * @private
   */
  _getProjectStandards(context) {
    const standards = {
      namingConvention: 'unknown',
      styleGuide: 'unknown',
      testingFramework: 'unknown'
    };

    // Detect based on project type and configuration
    if (context.project.language === 'javascript') {
      if (context.project.configFiles['package.json']) {
        const pkg = JSON.parse(context.project.configFiles['package.json']);
        if (pkg.eslintConfig || context.project.configFiles['.eslintrc.js']) {
          standards.styleGuide = 'eslint';
        }
        if (pkg.jest || context.project.configFiles['jest.config.js']) {
          standards.testingFramework = 'jest';
        }
      }
    }

    return standards;
  }

  /**
   * Set up file watchers to keep context updated
   * @private
   */
  _setupFileWatchers(projectPath) {
    // In a real implementation, this would set up watchers for file changes
    // For now, we'll just log that this would happen
    console.log(`File watchers would be set up for: ${projectPath}`);
  }

  /**
   * Check if a directory should be skipped during project analysis
   * @private
   */
  _shouldSkipDirectory(path) {
    const skipList = ['node_modules', '.git', '.svn', 'dist', 'build', 'target', '.vscode', '.idea', '__pycache__'];
    const dirName = path.split('/').pop();
    return skipList.includes(dirName);
  }

  /**
   * Get file language based on extension
   * @private
   */
  _getFileLanguage(fileName) {
    const ext = this._getFileExtension(fileName).toLowerCase();
    
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'kt': 'kotlin',
      'kts': 'kotlin',
      'dart': 'dart',
      'swift': 'swift',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'cpp',
      'hpp': 'cpp',
      'php': 'php',
      'rb': 'ruby',
      'html': 'html',
      'css': 'css',
      'vue': 'vue',
      'svelte': 'svelte'
    };
    
    return languageMap[ext] || 'text';
  }

  /**
   * Get file extension
   * @private
   */
  _getFileExtension(fileName) {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  /**
   * Parse requirements.txt content
   * @private
   */
  _parseRequirements(content) {
    const requirements = {};
    if (content) {
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split(/[=~<>]+/);
          if (parts.length >= 1) {
            const name = parts[0].trim();
            requirements[name] = parts.length > 1 ? parts[1].trim() : 'latest';
          }
        }
      }
    }
    return requirements;
  }

  /**
   * Parse go.mod content
   * @private
   */
  _parseGoMod(content) {
    const dependencies = {};
    if (content) {
      const lines = content.split('\n');
      let inRequireBlock = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('require')) {
          inRequireBlock = true;
          continue;
        }
        
        if (trimmed === '}' && inRequireBlock) {
          inRequireBlock = false;
          continue;
        }
        
        if (inRequireBlock && trimmed && !trimmed.startsWith('//')) {
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
            dependencies[parts[0]] = parts[1];
          }
        }
      }
    }
    return dependencies;
  }

  /**
   * Flatten project structure for easier searching
   * @private
   */
  _flattenProjectStructure(structure) {
    const result = [];
    
    for (const item of structure) {
      result.push(item);
      if (item.children && Array.isArray(item.children)) {
        result.push(...this._flattenProjectStructure(item.children));
      }
    }
    
    return result;
  }

  /**
   * Cache context to improve performance
   * @private
   */
  _cacheContext(type, key, context) {
    const cacheKey = `${type}:${key}`;
    this.contextCache.set(cacheKey, {
      data: context,
      timestamp: Date.now()
    });

    // Remove oldest entries if cache is too large
    if (this.contextCache.size > this.maxCacheSize) {
      const firstKey = this.contextCache.keys().next().value;
      this.contextCache.delete(firstKey);
    }
  }

  /**
   * Get cached context if available and not expired
   * @private
   */
  _getCachedContext(type, key, maxAge = 5 * 60 * 1000) { // 5 minutes default
    const cacheKey = `${type}:${key}`;
    const cached = this.contextCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.data;
    }
    
    return null;
  }

  /**
   * Clear the context cache
   */
  clearCache() {
    this.contextCache.clear();
  }

  /**
   * Update context when files change
   */
  async handleFileChange(filePath, changeType) {
    switch (changeType) {
      case 'create':
      case 'modify':
        // If it's the currently open file, update its context
        if (filePath === this.fileContext.currentPath) {
          try {
            const content = await fsOperation(filePath).readFile();
            await this.updateFileContext(filePath, content);
          } catch (error) {
            console.error('Error updating context for modified file:', error);
          }
        }
        break;
        
      case 'delete':
        // Clear cache for deleted file
        this.contextCache.delete(`file:${filePath}`);
        // If it was the current file, clear context
        if (filePath === this.fileContext.currentPath) {
          this.fileContext = {
            currentPath: null,
            currentContent: '',
            language: null,
            cursorPosition: null,
            selection: null
          };
        }
        break;
    }
  }

  /**
   * Get summary of current context
   */
  getContextSummary() {
    return {
      project: {
        language: this.projectContext.language,
        hasDependencies: Object.keys(this.projectContext.dependencies).length > 0,
        configFileCount: Object.keys(this.projectContext.configFiles).length
      },
      file: {
        path: this.fileContext.currentPath,
        language: this.fileContext.language,
        hasContent: !!this.fileContext.currentContent
      },
      editor: {
        historyCount: this.editorContext.history.length
      },
      cacheSize: this.contextCache.size
    };
  }
}

// Export a singleton instance
export default new ContextManager();