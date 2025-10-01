/**
 * AI Assistant Component for QwenPad IDE
 * Provides an interactive interface for AI-powered coding assistance
 */

import aiUtils from '../../utils/ai/ai-utils';
import qwenCoderAPI from '../../lib/ai/qwen-coder-api';
import toast from '../toast';

class AIAssistant {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.isOpen = false;
    this.chatHistory = [];
    this.currentRequest = null;
    this.currentFileContext = null;
    
    this._initialize();
  }

  _initialize() {
    // Create the UI elements
    this._createUI();
    
    // Check if AI is ready and update UI accordingly
    this._updateUIState();
    
    // Start listening for configuration changes
    this._setupEventListeners();
  }

  _createUI() {
    // Main container
    this.$aiContainer = tag('div', {
      className: 'ai-assistant-container',
      style: {
        display: 'none',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        border: '1px solid var(--bdr-color)',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-color)',
        overflow: 'hidden'
      }
    });

    // Header
    this.$header = tag('div', {
      className: 'ai-assistant-header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--header-bg, #f8f9fa)'
      },
      children: [
        tag('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px' },
          children: [
            tag('span', { 
              className: 'icon robot', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Qwen AI Assistant',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'ai-close-btn',
          innerHTML: '&times;',
          onclick: () => this.close(),
          style: {
            background: 'none',
            border: 'none',
            fontSize: '1.5em',
            cursor: 'pointer',
            color: 'var(--txt-color)',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        })
      ]
    });

    // Status indicator
    this.$status = tag('div', {
      className: 'ai-status',
      textContent: 'Initializing...',
      style: {
        padding: '4px 8px',
        fontSize: '0.8em',
        color: 'var(--txt-secondary-color)',
        backgroundColor: 'var(--status-bg, #e9ecef)',
        borderRadius: '4px',
        margin: '0 16px 8px 16px'
      }
    });

    // Chat container
    this.$chatContainer = tag('div', {
      className: 'ai-chat-container',
      style: {
        flex: 1,
        padding: '0 16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }
    });

    // Input area
    this.$inputContainer = tag('div', {
      className: 'ai-input-container',
      style: {
        padding: '12px 16px',
        borderTop: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--input-container-bg, #f8f9fa)'
      },
      children: [
        tag('div', {
          style: {
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end'
          },
          children: [
            tag('textarea', {
              id: 'ai-prompt-input',
              placeholder: 'Ask for code help, explanations, or generation...',
              rows: 2,
              style: {
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                resize: 'vertical',
                minHeight: '40px',
                maxHeight: '120px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--txt-color)',
                fontFamily: 'inherit',
                fontSize: '1em'
              },
              onkeydown: (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  this._handleSendMessage();
                }
              }
            }),
            tag('div', {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              },
              children: [
                tag('button', {
                  className: 'ai-send-btn',
                  textContent: 'Send',
                  onclick: () => this._handleSendMessage(),
                  style: {
                    padding: '8px 12px',
                    border: '1px solid var(--primary-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }
                }),
                tag('button', {
                  className: 'ai-actions-btn',
                  textContent: '...',
                  onclick: () => this._showQuickActions(),
                  style: {
                    padding: '4px 8px',
                    border: '1px solid var(--bdr-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--btn-txt-color)',
                    cursor: 'pointer',
                    fontSize: '0.8em'
                  }
                })
              ]
            })
          ]
        })
      ]
    });

    // Assemble the UI
    this.$aiContainer.appendChild(this.$header);
    this.$aiContainer.appendChild(this.$status);
    this.$aiContainer.appendChild(this.$chatContainer);
    this.$aiContainer.appendChild(this.$inputContainer);

    // Add to container
    this.container.appendChild(this.$aiContainer);
  }

  _setupEventListeners() {
    // Listen for AI configuration changes
    if (window.settings) {
      window.settings.on('update:ai', () => {
        this._updateUIState();
      });
    }
  }

  _updateUIState() {
    const configStatus = aiUtils.getConfigStatus();
    
    if (configStatus.isReady) {
      this.$status.textContent = 'Ready';
      this.$status.style.color = 'var(--success-color, #2ed573)';
      this._enableInput();
    } else {
      this.$status.textContent = 'Not configured - Please set up AI settings';
      this.$status.style.color = 'var(--error-color, #ff4757)';
      this._disableInput();
    }
  }

  _enableInput() {
    const input = document.getElementById('ai-prompt-input');
    if (input) input.disabled = false;
    const sendBtn = this.$aiContainer.querySelector('.ai-send-btn');
    if (sendBtn) sendBtn.disabled = false;
  }

  _disableInput() {
    const input = document.getElementById('ai-prompt-input');
    if (input) input.disabled = true;
    const sendBtn = this.$aiContainer.querySelector('.ai-send-btn');
    if (sendBtn) sendBtn.disabled = true;
  }

  async open(fileContext = null) {
    this.currentFileContext = fileContext;
    this.$aiContainer.style.display = 'flex';
    this.isOpen = true;
    
    // Add welcome message if chat is empty
    if (this.chatHistory.length === 0) {
      this._addSystemMessage('Hello! I\'m your Qwen AI coding assistant. How can I help you today?');
    }
  }

  close() {
    this.$aiContainer.style.display = 'none';
    this.isOpen = false;
  }

  toggle(fileContext = null) {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(fileContext);
    }
  }

  _addUserMessage(content) {
    const messageEl = this._createMessageElement('user', content);
    this.$chatContainer.appendChild(messageEl);
    this._scrollToBottom();
  }

  _addAssistantMessage(content) {
    const messageEl = this._createMessageElement('assistant', content);
    this.$chatContainer.appendChild(messageEl);
    this._scrollToBottom();
  }

  _addSystemMessage(content) {
    const messageEl = this._createMessageElement('system', content);
    this.$chatContainer.appendChild(messageEl);
    this._scrollToBottom();
  }

  _createMessageElement(role, content) {
    const isUser = role === 'user';
    const isAssistant = role === 'assistant';
    const isSystem = role === 'system';
    
    return tag('div', {
      className: `ai-message ai-message-${role}`,
      style: {
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '8px',
        alignItems: 'flex-start',
        marginBottom: '8px',
        maxWidth: '90%'
      },
      children: [
        tag('div', {
          className: `ai-message-avatar ai-message-avatar-${role}`,
          textContent: isUser ? 'U' : isAssistant ? 'AI' : 'SYS',
          style: {
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7em',
            fontWeight: 'bold',
            backgroundColor: isUser ? 'var(--primary-color)' : isAssistant ? '#6c757d' : '#adb5bd',
            color: 'white',
            flexShrink: 0
          }
        }),
        tag('div', {
          className: `ai-message-content ai-message-content-${role}`,
          style: {
            backgroundColor: isUser ? 'var(--primary-color, #007bff)' : isSystem ? '#e9ecef' : '#f8f9fa',
            color: isUser ? 'white' : 'var(--txt-color)',
            padding: '8px 12px',
            borderRadius: '8px',
            maxWidth: '100%',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          },
          textContent: content
        })
      ]
    });
  }

  _scrollToBottom() {
    this.$chatContainer.scrollTop = this.$chatContainer.scrollHeight;
  }

  async _handleSendMessage() {
    const input = document.getElementById('ai-prompt-input');
    const prompt = input.value.trim();
    
    if (!prompt) return;

    // Disable input during processing
    input.disabled = true;
    const sendBtn = this.$aiContainer.querySelector('.ai-send-btn');
    sendBtn.disabled = true;

    // Add user message to UI
    this._addUserMessage(prompt);
    input.value = '';

    try {
      // Add a temporary "thinking" message
      const thinkingMessage = this._createMessageElement('assistant', 'Thinking...');
      const thinkingEl = this.$chatContainer.appendChild(thinkingMessage);

      // Prepare context based on current file if available
      let context = '';
      if (this.currentFileContext) {
        context = `Current file context:\n${this.currentFileContext.content || ''}\n`;
        if (this.currentFileContext.cursorPosition) {
          context += `\nCursor position: ${this.currentFileContext.cursorPosition}\n`;
        }
        if (this.currentFileContext.language) {
          context += `\nLanguage: ${this.currentFileContext.language}\n`;
        }
      }

      // Call the AI API
      const response = await qwenCoderAPI.generateCode(prompt, {
        context: context,
        language: this.currentFileContext?.language || 'javascript',
        maxTokens: 500,
        temperature: 0.7
      });

      // Remove the "thinking" message
      thinkingEl.remove();

      // Add the AI response
      this._addAssistantMessage(response.code);

      // Add to chat history
      this.chatHistory.push({
        role: 'user',
        content: prompt,
        timestamp: new Date()
      });
      this.chatHistory.push({
        role: 'assistant',
        content: response.code,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error in AI assistant:', error);
      
      // Remove the "thinking" message
      const thinkingEl = this.$chatContainer.querySelector('.ai-message-assistant:last-child');
      if (thinkingEl && thinkingEl.textContent === 'Thinking...') {
        thinkingEl.remove();
      }
      
      // Show error message
      this._addAssistantMessage(`Error: ${error.message}`);
      toast(`AI Assistant error: ${error.message}`, 'error');
    } finally {
      // Re-enable input
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  async _showQuickActions() {
    // Create a dropdown with quick actions
    const actions = [
      { 
        id: 'explain-code', 
        label: 'Explain selected code', 
        icon: 'help'
      },
      { 
        id: 'fix-code', 
        label: 'Fix issues in code', 
        icon: 'build'
      },
      { 
        id: 'generate-doc', 
        label: 'Generate documentation', 
        icon: 'description'
      },
      { 
        id: 'optimize-code', 
        label: 'Optimize code', 
        icon: 'trending_up'
      },
      { 
        id: 'convert-code', 
        label: 'Convert language', 
        icon: 'swap_horiz'
      }
    ];

    // Create dropdown menu
    const $dropdown = tag('div', {
      className: 'ai-quick-actions-dropdown',
      style: {
        position: 'absolute',
        bottom: '60px', // Position above the input
        right: '20px',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--bdr-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '1000',
        minWidth: '200px'
      }
    });

    actions.forEach(action => {
      const $item = tag('div', {
        className: 'ai-quick-action-item',
        style: {
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--bdr-color)',
          color: 'var(--txt-color)'
        },
        onclick: () => {
          this._executeQuickAction(action.id);
          $dropdown.remove();
        },
        children: [
          tag('span', { 
            className: `icon ${action.icon}`,
            style: { fontSize: '1em' }
          }),
          tag('span', { textContent: action.label })
        ]
      });

      if (actions.indexOf(action) === actions.length - 1) {
        $item.style.borderBottom = 'none';
      }

      $dropdown.appendChild($item);
    });

    // Add to document and position
    document.body.appendChild($dropdown);

    // Close dropdown when clicking elsewhere
    const closeDropdown = (e) => {
      if (!$dropdown.contains(e.target)) {
        $dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    setTimeout(() => document.addEventListener('click', closeDropdown), 100);
  }

  async _executeQuickAction(actionId) {
    // Get selected text from the editor if available
    let selectedText = '';
    if (window.editorManager?.editor) {
      selectedText = window.editorManager.editor.getCopyText() || '';
    }

    if (!selectedText && actionId !== 'convert-code') {
      toast('Please select code in the editor first', 'warning');
      return;
    }

    let prompt = '';
    switch (actionId) {
      case 'explain-code':
        prompt = `Explain the following code in detail:\n${selectedText}`;
        break;
      case 'fix-code':
        prompt = `Fix any issues in the following code:\n${selectedText}`;
        break;
      case 'generate-doc':
        prompt = `Generate documentation for the following code:\n${selectedText}`;
        break;
      case 'optimize-code':
        prompt = `Optimize the following code for better performance:\n${selectedText}`;
        break;
      case 'convert-code':
        prompt = 'What programming language would you like to convert to? Please specify the target language.';
        // For convert-code, we'll need more input from the user
        document.getElementById('ai-prompt-input').value = 'Convert this code to: ';
        document.getElementById('ai-prompt-input').focus();
        return;
    }

    if (prompt) {
      // Simulate entering the prompt and sending it
      document.getElementById('ai-prompt-input').value = prompt;
      await this._handleSendMessage();
    }
  }

  // Method to handle editor events and provide context-aware suggestions
  async handleEditorEvent(event, data) {
    // This method can be called by the editor to provide context-aware assistance
    switch (event) {
      case 'cursor-move':
        // Update context based on cursor position
        this.currentFileContext = {
          ...this.currentFileContext,
          cursorPosition: data.position
        };
        break;
      case 'text-change':
        // Update file content in context
        if (this.currentFileContext) {
          this.currentFileContext.content = data.content;
        }
        break;
      case 'file-change':
        // Update file context when switching files
        this.currentFileContext = {
          content: data.content,
          language: data.language,
          filename: data.filename,
          cursorPosition: data.cursorPosition
        };
        break;
    }
  }
}

// Export a function to create AI Assistant instances
export default AIAssistant;