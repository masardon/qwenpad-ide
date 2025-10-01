/**
 * AI Settings Page for QwenPad IDE
 * Allows users to configure Qwen Coder integration
 */

import qwenCoderAPI from '../../lib/ai/qwen-coder-api';
import aiUtils from '../../utils/ai/ai-utils';
import toast from '../../components/toast';

export default function aiSettings() {
  const $container = tag('div', {
    className: 'ai-settings',
    style: {
      padding: '16px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  });

  // Header
  const $header = tag('div', {
    className: 'ai-settings-header',
    style: {
      marginBottom: '20px'
    },
    children: [
      tag('h2', {
        textContent: 'AI Settings',
        style: {
          margin: 0,
          fontSize: '1.5em'
        }
      }),
      tag('p', {
        textContent: 'Configure Qwen Coder integration for AI-powered assistance',
        style: {
          margin: '8px 0 0 0',
          color: 'var(--txt-secondary-color)',
          fontSize: '0.9em'
        }
      })
    ]
  });

  // API Configuration section
  const $apiConfig = tag('div', {
    className: 'api-config-section',
    style: {
      marginBottom: '20px',
      padding: '16px',
      border: '1px solid var(--bdr-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-color)'
    },
    children: [
      tag('h3', {
        textContent: 'API Configuration',
        style: {
          margin: '0 0 16px 0',
          fontSize: '1.2em'
        }
      }),
      
      // Mode selection (Cloud vs Local)
      tag('div', {
        style: { marginBottom: '16px' },
        children: [
          tag('label', {
            textContent: 'AI Mode',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold'
            }
          }),
          tag('div', {
            style: {
              display: 'flex',
              gap: '16px'
            },
            children: [
              tag('label', {
                style: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
                children: [
                  tag('input', {
                    type: 'radio',
                    name: 'ai-mode',
                    value: 'cloud',
                    id: 'ai-mode-cloud',
                    checked: true,
                    style: { marginRight: '8px' }
                  }),
                  tag('span', { textContent: 'Cloud API' })
                ]
              }),
              tag('label', {
                style: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
                children: [
                  tag('input', {
                    type: 'radio',
                    name: 'ai-mode',
                    value: 'local',
                    id: 'ai-mode-local',
                    style: { marginRight: '8px' }
                  }),
                  tag('span', { textContent: 'Local API' })
                ]
              })
            ]
          })
        ]
      }),
      
      // Cloud API fields
      tag('div', {
        id: 'cloud-api-fields',
        style: { marginBottom: '16px' },
        children: [
          tag('div', {
            style: { marginBottom: '12px' },
            children: [
              tag('label', {
                textContent: 'API Endpoint',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'url',
                id: 'api-endpoint',
                placeholder: 'https://api.example.com/v1',
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          }),
          tag('div', {
            style: { marginBottom: '12px' },
            children: [
              tag('label', {
                textContent: 'API Key',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'password',
                id: 'api-key',
                placeholder: 'Enter your API key',
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          })
        ]
      }),
      
      // Local API fields
      tag('div', {
        id: 'local-api-fields',
        style: { display: 'none', marginBottom: '16px' },
        children: [
          tag('div', {
            style: { marginBottom: '12px' },
            children: [
              tag('label', {
                textContent: 'Local API Endpoint',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'url',
                id: 'local-api-endpoint',
                placeholder: 'http://localhost:11434',
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          })
        ]
      }),
      
      // Test connection button
      tag('button', {
        id: 'test-connection-btn',
        textContent: 'Test Connection',
        onclick: testConnection,
        style: {
          padding: '8px 16px',
          border: '1px solid var(--primary-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          cursor: 'pointer'
        }
      })
    ]
  });

  // Model Selection section
  const $modelSelection = tag('div', {
    className: 'model-selection-section',
    style: {
      marginBottom: '20px',
      padding: '16px',
      border: '1px solid var(--bdr-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-color)'
    },
    children: [
      tag('h3', {
        textContent: 'Model Selection',
        style: {
          margin: '0 0 16px 0',
          fontSize: '1.2em'
        }
      }),
      tag('div', {
        style: { marginBottom: '12px' },
        children: [
          tag('label', {
            textContent: 'AI Model',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('select', {
            id: 'ai-model',
            style: {
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--txt-color)'
            },
            children: [
              tag('option', { value: 'qwen-coder', textContent: 'Qwen Coder (Default)' }),
              tag('option', { value: 'qwen-turbo', textContent: 'Qwen Turbo' }),
              tag('option', { value: 'qwen-plus', textContent: 'Qwen Plus' })
            ]
          })
        ]
      })
    ]
  });

  // Advanced Settings section
  const $advancedSettings = tag('div', {
    className: 'advanced-settings-section',
    style: {
      marginBottom: '20px',
      padding: '16px',
      border: '1px solid var(--bdr-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-color)'
    },
    children: [
      tag('h3', {
        textContent: 'Advanced Settings',
        style: {
          margin: '0 0 16px 0',
          fontSize: '1.2em'
        }
      }),
      tag('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '12px' },
        children: [
          tag('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              tag('input', {
                type: 'checkbox',
                id: 'enable-code-completion',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-code-completion',
                textContent: 'Enable AI code completion',
                style: { cursor: 'pointer' }
              })
            ]
          }),
          tag('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              tag('input', {
                type: 'checkbox',
                id: 'enable-explanations',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-explanations',
                textContent: 'Enable code explanations',
                style: { cursor: 'pointer' }
              })
            ]
          }),
          tag('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              tag('input', {
                type: 'checkbox',
                id: 'enable-documentation',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-documentation',
                textContent: 'Enable documentation generation',
                style: { cursor: 'pointer' }
              })
            ]
          }),
          tag('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              tag('input', {
                type: 'checkbox',
                id: 'enable-context-aware',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-context-aware',
                textContent: 'Enable context-aware assistance',
                style: { cursor: 'pointer' }
              })
            ]
          })
        ]
      })
    ]
  });

  // Save button
  const $saveButton = tag('div', {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    children: [
      tag('button', {
        id: 'save-settings-btn',
        textContent: 'Save Settings',
        onclick: saveSettings,
        style: {
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          fontSize: '1em',
          fontWeight: 'bold',
          cursor: 'pointer'
        }
      })
    ]
  });

  // Mode selection event
  document.getElementById('ai-mode-cloud').onclick = function() {
    document.getElementById('cloud-api-fields').style.display = 'block';
    document.getElementById('local-api-fields').style.display = 'none';
  };

  document.getElementById('ai-mode-local').onclick = function() {
    document.getElementById('cloud-api-fields').style.display = 'none';
    document.getElementById('local-api-fields').style.display = 'block';
  };

  // Assemble the UI
  $container.appendChild($header);
  $container.appendChild($apiConfig);
  $container.appendChild($modelSelection);
  $container.appendChild($advancedSettings);
  $container.appendChild($saveButton);

  // Load existing settings
  loadSettings();

  return $container;

  // Function to test API connection
  async function testConnection() {
    const testBtn = document.getElementById('test-connection-btn');
    const originalText = testBtn.textContent;
    testBtn.textContent = 'Testing...';
    testBtn.disabled = true;

    try {
      // Get current configuration
      const isCloudMode = document.getElementById('ai-mode-cloud').checked;
      const config = {
        isCloudMode: isCloudMode,
        apiEndpoint: document.getElementById('api-endpoint').value.trim(),
        localEndpoint: document.getElementById('local-api-endpoint').value.trim(),
        apiKey: document.getElementById('api-key').value.trim()
      };

      // Test with temporary instance to avoid changing main settings
      if (isCloudMode && (!config.apiEndpoint || !config.apiKey)) {
        throw new Error('Please fill in both API endpoint and API key for cloud mode');
      }
      
      if (!isCloudMode && !config.localEndpoint) {
        throw new Error('Please fill in the local API endpoint');
      }

      // Initialize and test
      await qwenCoderAPI.init(config);
      await qwenCoderAPI.healthCheck();
      
      toast('Connection successful!', 'success');
    } catch (error) {
      console.error('API connection test failed:', error);
      toast(`Connection failed: ${error.message}`, 'error');
    } finally {
      testBtn.textContent = originalText;
      testBtn.disabled = false;
    }
  }

  // Function to save settings
  async function saveSettings() {
    const saveBtn = document.getElementById('save-settings-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
      // Get configuration from form
      const isCloudMode = document.getElementById('ai-mode-cloud').checked;
      const config = {
        isCloudMode: isCloudMode,
        apiEndpoint: document.getElementById('api-endpoint').value.trim(),
        localEndpoint: document.getElementById('local-api-endpoint').value.trim(),
        apiKey: document.getElementById('api-key').value.trim(),
        model: document.getElementById('ai-model').value
      };

      // Validate configuration
      if (isCloudMode && (!config.apiEndpoint || !config.apiKey)) {
        throw new Error('Please fill in both API endpoint and API key for cloud mode');
      }
      
      if (!isCloudMode && !config.localEndpoint) {
        throw new Error('Please fill in the local API endpoint');
      }

      // Save settings to localStorage
      localStorage.setItem('qwenpad-ai-config', JSON.stringify({
        ...config,
        apiKey: config.apiKey ? '***HIDDEN***' : '' // Don't store actual API key in plain text
      }));

      // Also save to app settings if available
      if (window.settings) {
        const settingsValue = { ...window.settings.value };
        settingsValue.ai = {
          ...config,
          // Store the actual API key separately and securely if possible
          apiKey: config.apiKey
        };
        // Update settings (this would be handled by the settings system)
      }

      // Initialize AI utilities with new configuration
      await aiUtils.init(config);
      qwenCoderAPI.setModel(config.model);

      toast('AI settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast(`Error saving settings: ${error.message}`, 'error');
    } finally {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  }

  // Function to load existing settings
  function loadSettings() {
    try {
      const savedConfig = localStorage.getItem('qwenpad-ai-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Set values in the form
        if (config.isCloudMode) {
          document.getElementById('ai-mode-cloud').checked = true;
          document.getElementById('cloud-api-fields').style.display = 'block';
          document.getElementById('local-api-fields').style.display = 'none';
          document.getElementById('api-endpoint').value = config.apiEndpoint || '';
        } else {
          document.getElementById('ai-mode-local').checked = true;
          document.getElementById('cloud-api-fields').style.display = 'none';
          document.getElementById('local-api-fields').style.display = 'block';
          document.getElementById('local-api-endpoint').value = config.localEndpoint || '';
        }
        
        // Note: We don't load the actual API key for security
        document.getElementById('ai-model').value = config.model || 'qwen-coder';
        
        // Load advanced settings if stored
        document.getElementById('enable-code-completion').checked = config.enableCodeCompletion !== false;
        document.getElementById('enable-explanations').checked = config.enableExplanations !== false;
        document.getElementById('enable-documentation').checked = config.enableDocumentation !== false;
        document.getElementById('enable-context-aware').checked = config.enableContextAware !== false;
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      // Continue with default values if loading fails
    }
  }
}