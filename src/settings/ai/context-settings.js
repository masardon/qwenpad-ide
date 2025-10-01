/**
 * Context Manager Settings Page for QwenPad IDE
 * Allows users to configure context-aware AI assistance
 */

import contextManager from '../../lib/ai/context-manager';
import toast from '../../components/toast';

export default function contextSettings() {
  const $container = tag('div', {
    className: 'context-settings',
    style: {
      padding: '16px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  });

  // Header
  const $header = tag('div', {
    className: 'context-settings-header',
    style: {
      marginBottom: '20px'
    },
    children: [
      tag('h2', {
        textContent: 'Context Management',
        style: {
          margin: 0,
          fontSize: '1.5em'
        }
      }),
      tag('p', {
        textContent: 'Configure how AI understands your project and coding context',
        style: {
          margin: '8px 0 0 0',
          color: 'var(--txt-secondary-color)',
          fontSize: '0.9em'
        }
      })
    ]
  });

  // Context Awareness section
  const $contextAwareness = tag('div', {
    className: 'context-awareness-section',
    style: {
      marginBottom: '20px',
      padding: '16px',
      border: '1px solid var(--bdr-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-color)'
    },
    children: [
      tag('h3', {
        textContent: 'Context Awareness',
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
                id: 'enable-project-context',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-project-context',
                textContent: 'Enable project structure analysis',
                style: { cursor: 'pointer' }
              })
            ]
          }),
          tag('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              tag('input', {
                type: 'checkbox',
                id: 'enable-dependency-context',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-dependency-context',
                textContent: 'Include dependency information',
                style: { cursor: 'pointer' }
              })
            ]
          }),
          tag('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              tag('input', {
                type: 'checkbox',
                id: 'enable-file-context',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-file-context',
                textContent: 'Include current file context',
                style: { cursor: 'pointer' }
              })
            ]
          }),
          tag('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              tag('input', {
                type: 'checkbox',
                id: 'enable-editor-context',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-editor-context',
                textContent: 'Include editor context (cursor position, selection)',
                style: { cursor: 'pointer' }
              })
            ]
          })
        ]
      })
    ]
  });

  // Context Depth section
  const $contextDepth = tag('div', {
    className: 'context-depth-section',
    style: {
      marginBottom: '20px',
      padding: '16px',
      border: '1px solid var(--bdr-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-color)'
    },
    children: [
      tag('h3', {
        textContent: 'Context Depth',
        style: {
          margin: '0 0 16px 0',
          fontSize: '1.2em'
        }
      }),
      tag('div', {
        style: { marginBottom: '12px' },
        children: [
          tag('label', {
            textContent: 'Project structure depth',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('select', {
            id: 'project-depth',
            style: {
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--txt-color)'
            },
            children: [
              tag('option', { value: '1', textContent: '1 level deep' }),
              tag('option', { value: '2', textContent: '2 levels deep' }),
              tag('option', { value: '3', textContent: '3 levels deep (recommended)', selected: true }),
              tag('option', { value: '4', textContent: '4 levels deep' }),
              tag('option', { value: '5', textContent: '5 levels deep' })
            ]
          })
        ]
      }),
      tag('div', {
        style: { marginBottom: '12px' },
        children: [
          tag('label', {
            textContent: 'File context size',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('select', {
            id: 'file-context-size',
            style: {
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--txt-color)'
            },
            children: [
              tag('option', { value: '50', textContent: '50 lines around cursor' }),
              tag('option', { value: '100', textContent: '100 lines around cursor (recommended)', selected: true }),
              tag('option', { value: '200', textContent: '200 lines around cursor' }),
              tag('option', { value: '500', textContent: '500 lines around cursor' })
            ]
          })
        ]
      })
    ]
  });

  // Excluded Directories section
  const $excludedDirectories = tag('div', {
    className: 'excluded-directories-section',
    style: {
      marginBottom: '20px',
      padding: '16px',
      border: '1px solid var(--bdr-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-color)'
    },
    children: [
      tag('h3', {
        textContent: 'Excluded Directories',
        style: {
          margin: '0 0 16px 0',
          fontSize: '1.2em'
        }
      }),
      tag('div', {
        style: { marginBottom: '12px' },
        children: [
          tag('label', {
            textContent: 'Directories to exclude from context analysis',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('textarea', {
            id: 'excluded-dirs',
            placeholder: 'node_modules\n.git\nbuild\ndist\ntarget',
            style: {
              width: '100%',
              height: '80px',
              padding: '8px 12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--txt-color)',
              fontFamily: 'inherit',
              fontSize: '1em'
            }
          })
        ]
      })
    ]
  });

  // Cache Settings section
  const $cacheSettings = tag('div', {
    className: 'cache-settings-section',
    style: {
      marginBottom: '20px',
      padding: '16px',
      border: '1px solid var(--bdr-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-color)'
    },
    children: [
      tag('h3', {
        textContent: 'Performance & Cache',
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
                id: 'enable-context-cache',
                checked: true,
                style: { marginRight: '8px' }
              }),
              tag('label', {
                htmlFor: 'enable-context-cache',
                textContent: 'Enable context caching',
                style: { cursor: 'pointer' }
              })
            ]
          }),
          tag('div', {
            style: { marginBottom: '12px' },
            children: [
              tag('label', {
                textContent: 'Cache expiration time',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('select', {
                id: 'cache-expiration',
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                },
                children: [
                  tag('option', { value: '300000', textContent: '5 minutes' }),
                  tag('option', { value: '600000', textContent: '10 minutes (recommended)', selected: true }),
                  tag('option', { value: '1800000', textContent: '30 minutes' }),
                  tag('option', { value: '3600000', textContent: '1 hour' })
                ]
              })
            ]
          }),
          tag('div', {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            children: [
              tag('span', {
                textContent: `Current cache size: ${contextManager.getContextSummary().cacheSize} items`
              }),
              tag('button', {
                textContent: 'Clear Cache',
                onclick: () => {
                  contextManager.clearCache();
                  toast('Context cache cleared successfully!', 'success');
                  // Update cache size display
                  document.querySelector('.cache-settings-section span').textContent = 
                    `Current cache size: 0 items`;
                },
                style: {
                  padding: '4px 8px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-txt-color)',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }
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
        id: 'save-context-settings-btn',
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

  // Assemble the UI
  $container.appendChild($header);
  $container.appendChild($contextAwareness);
  $container.appendChild($contextDepth);
  $container.appendChild($excludedDirectories);
  $container.appendChild($cacheSettings);
  $container.appendChild($saveButton);

  // Load existing settings
  loadSettings();

  return $container;

  // Function to save settings
  async function saveSettings() {
    const saveBtn = document.getElementById('save-context-settings-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
      // Get configuration from form
      const config = {
        enableProjectContext: document.getElementById('enable-project-context').checked,
        enableDependencyContext: document.getElementById('enable-dependency-context').checked,
        enableFileContext: document.getElementById('enable-file-context').checked,
        enableEditorContext: document.getElementById('enable-editor-context').checked,
        projectDepth: parseInt(document.getElementById('project-depth').value),
        fileContextSize: parseInt(document.getElementById('file-context-size').value),
        excludedDirs: document.getElementById('excluded-dirs').value.split('\n').filter(dir => dir.trim()),
        enableContextCache: document.getElementById('enable-context-cache').checked,
        cacheExpiration: parseInt(document.getElementById('cache-expiration').value)
      };

      // Save settings to localStorage
      localStorage.setItem('qwenpad-context-config', JSON.stringify(config));

      // Apply settings to context manager
      // In a real implementation, we would update the context manager with these settings

      toast('Context settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving context settings:', error);
      toast(`Error saving settings: ${error.message}`, 'error');
    } finally {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  }

  // Function to load existing settings
  function loadSettings() {
    try {
      const savedConfig = localStorage.getItem('qwenpad-context-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Set values in the form
        document.getElementById('enable-project-context').checked = config.enableProjectContext !== false;
        document.getElementById('enable-dependency-context').checked = config.enableDependencyContext !== false;
        document.getElementById('enable-file-context').checked = config.enableFileContext !== false;
        document.getElementById('enable-editor-context').checked = config.enableEditorContext !== false;
        document.getElementById('project-depth').value = config.projectDepth || '3';
        document.getElementById('file-context-size').value = config.fileContextSize || '100';
        document.getElementById('excluded-dirs').value = (config.excludedDirs || []).join('\n');
        document.getElementById('enable-context-cache').checked = config.enableContextCache !== false;
        document.getElementById('cache-expiration').value = config.cacheExpiration || '600000';
      }
    } catch (error) {
      console.error('Error loading context settings:', error);
      // Continue with default values if loading fails
    }
  }
}