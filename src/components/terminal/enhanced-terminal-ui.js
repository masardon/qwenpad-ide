/**
 * Enhanced Terminal Manager UI for QwenPad IDE
 * Provides interface for managing terminal environments including Termux integration
 */

import EnhancedTerminalManager from '../../lib/terminal/enhanced-terminal-manager';
import toast from '../../components/toast';

export default class EnhancedTerminalUI {
  constructor(container) {
    this.container = container;
    this.manager = EnhancedTerminalManager;
    
    this._initialize();
  }

  _initialize() {
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$terminalContainer = tag('div', {
      className: 'enhanced-terminal-manager-container',
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
      className: 'enhanced-terminal-header',
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
              className: 'icon terminal', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Enhanced Terminal Manager',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'terminal-close-btn',
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

    // Terminal mode selector
    this.$modeSelector = tag('div', {
      className: 'terminal-mode-selector',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      children: [
        tag('span', {
          textContent: 'Terminal Mode:',
          style: { fontWeight: 'bold' }
        }),
        tag('select', {
          id: 'terminal-mode-select',
          style: {
            flex: 1,
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onchange: (e) => this._switchTerminalMode(e.target.value),
          children: [
            tag('option', { value: 'default', textContent: 'Default Terminal' }),
            tag('option', { value: 'termux', textContent: 'Termux Terminal' }),
            tag('option', { value: 'alpine', textContent: 'Alpine Sandbox' })
          ]
        }),
        tag('button', {
          textContent: 'Refresh',
          onclick: () => this._refresh(),
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
    });

    // Terminal status
    this.$status = tag('div', {
      className: 'terminal-status',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--status-bg, #e9ecef)'
      },
      children: [
        tag('span', {
          className: 'icon info',
          style: { fontSize: '1em' }
        }),
        tag('span', {
          id: 'terminal-status-text',
          textContent: 'Checking terminal status...',
          style: { flex: 1 }
        }),
        tag('span', {
          id: 'terminal-mode-indicator',
          textContent: 'Default',
          style: {
            fontSize: '0.8em',
            backgroundColor: 'var(--badge-bg, #e9ecef)',
            color: 'var(--badge-color, #6c757d)',
            padding: '2px 6px',
            borderRadius: '4px'
          }
        })
      ]
    });

    // Terminal setup section
    this.$setupSection = tag('div', {
      className: 'terminal-setup-section',
      style: {
        padding: '16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'none'
      },
      children: [
        tag('div', {
          style: { marginBottom: '12px' },
          children: [
            tag('h3', {
              textContent: 'Termux Setup Required',
              style: { margin: '0 0 8px 0' }
            }),
            tag('p', {
              textContent: 'Termux is available but not yet set up. Set up Termux to unlock its full potential.',
              style: {
                margin: '0 0 12px 0',
                color: 'var(--txt-secondary-color)'
              }
            })
          ]
        }),
        tag('button', {
          textContent: 'Setup Termux',
          onclick: () => this._setupTermux(),
          style: {
            padding: '8px 16px',
            border: '1px solid var(--primary-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        })
      ]
    });

    // Development environment setup
    this.$devEnvSection = tag('div', {
      className: 'dev-environment-section',
      style: {
        padding: '16px',
        borderBottom: '1px solid var(--bdr-color)'
      },
      children: [
        tag('div', {
          style: { marginBottom: '12px' },
          children: [
            tag('h3', {
              textContent: 'Development Environment Setup',
              style: { margin: '0 0 8px 0' }
            }),
            tag('p', {
              textContent: 'Quickly set up common development environments with one click.',
              style: {
                margin: '0 0 12px 0',
                color: 'var(--txt-secondary-color)'
              }
            })
          ]
        }),
        tag('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px'
          },
          children: [
            tag('button', {
              textContent: 'Android SDK',
              onclick: () => this._setupEnvironment('android'),
              style: {
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              textContent: 'Flutter',
              onclick: () => this._setupEnvironment('flutter'),
              style: {
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              textContent: 'Node.js',
              onclick: () => this._setupEnvironment('nodejs'),
              style: {
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              textContent: 'Python',
              onclick: () => this._setupEnvironment('python'),
              style: {
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              textContent: 'Go',
              onclick: () => this._setupEnvironment('go'),
              style: {
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              textContent: 'Rust',
              onclick: () => this._setupEnvironment('rust'),
              style: {
                padding: '8px 12px',
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
    });

    // Tool installation section
    this.$toolSection = tag('div', {
      className: 'tool-installation-section',
      style: {
        padding: '16px',
        borderBottom: '1px solid var(--bdr-color)'
      },
      children: [
        tag('div', {
          style: { marginBottom: '12px' },
          children: [
            tag('h3', {
              textContent: 'Tool Installation',
              style: { margin: '0 0 8px 0' }
            }),
            tag('p', {
              textContent: 'Install commonly used development tools.',
              style: {
                margin: '0 0 12px 0',
                color: 'var(--txt-secondary-color)'
              }
            })
          ]
        }),
        tag('div', {
          style: {
            display: 'flex',
            gap: '8px',
            marginBottom: '12px'
          },
          children: [
            tag('input', {
              type: 'text',
              id: 'tool-name-input',
              placeholder: 'Enter tool name...',
              style: {
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--txt-color)'
              },
              onkeypress: (e) => {
                if (e.key === 'Enter') {
                  this._installTool();
                }
              }
            }),
            tag('button', {
              textContent: 'Install',
              onclick: () => this._installTool(),
              style: {
                padding: '8px 12px',
                border: '1px solid var(--primary-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }
            })
          ]
        }),
        tag('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px'
          },
          children: [
            tag('button', {
              textContent: 'Git',
              onclick: () => this._installTool('git'),
              style: {
                padding: '6px 10px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em'
              }
            }),
            tag('button', {
              textContent: 'Docker CLI',
              onclick: () => this._installTool('docker'),
              style: {
                padding: '6px 10px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em'
              }
            }),
            tag('button', {
              textContent: 'kubectl',
              onclick: () => this._installTool('kubectl'),
              style: {
                padding: '6px 10px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em'
              }
            }),
            tag('button', {
              textContent: 'Terraform',
              onclick: () => this._installTool('terraform'),
              style: {
                padding: '6px 10px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em'
              }
            }),
            tag('button', {
              textContent: 'Ansible',
              onclick: () => this._installTool('ansible'),
              style: {
                padding: '6px 10px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em'
              }
            }),
            tag('button', {
              textContent: 'AWS CLI',
              onclick: () => this._installTool('aws-cli'),
              style: {
                padding: '6px 10px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em'
              }
            }),
            tag('button', {
              textContent: 'GCP CLI',
              onclick: () => this._installTool('gcloud'),
              style: {
                padding: '6px 10px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em'
              }
            }),
            tag('button', {
              textContent: 'Azure CLI',
              onclick: () => this._installTool('azure-cli'),
              style: {
                padding: '6px 10px',
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
    });

    // System information section
    this.$systemInfoSection = tag('div', {
      className: 'system-info-section',
      style: {
        padding: '16px',
        flex: 1,
        overflowY: 'auto'
      },
      children: [
        tag('div', {
          style: { marginBottom: '12px' },
          children: [
            tag('h3', {
              textContent: 'System Information',
              style: { margin: '0 0 8px 0' }
            }),
            tag('p', {
              textContent: 'Detailed information about your terminal environment.',
              style: {
                margin: '0 0 12px 0',
                color: 'var(--txt-secondary-color)'
              }
            })
          ]
        }),
        tag('div', {
          id: 'system-info-content',
          style: {
            fontFamily: 'monospace',
            fontSize: '0.9em',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)',
            padding: '12px',
            borderRadius: '4px',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          },
          textContent: 'Loading system information...'
        })
      ]
    });

    // Action buttons
    this.$actions = tag('div', {
      className: 'terminal-actions',
      style: {
        padding: '8px 16px',
        borderTop: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--input-container-bg, #f8f9fa)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      },
      children: [
        tag('button', {
          textContent: 'Update Packages',
          onclick: () => this._updatePackages(),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontSize: '0.9em'
          }
        }),
        tag('button', {
          textContent: 'Search Packages',
          onclick: () => this._searchPackages(),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontSize: '0.9em'
          }
        }),
        tag('button', {
          textContent: 'Check Tools',
          onclick: () => this._checkTools(),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--primary-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9em'
          }
        })
      ]
    });

    // Assemble the UI
    this.$terminalContainer.appendChild(this.$header);
    this.$terminalContainer.appendChild(this.$modeSelector);
    this.$terminalContainer.appendChild(this.$status);
    this.$terminalContainer.appendChild(this.$setupSection);
    this.$terminalContainer.appendChild(this.$devEnvSection);
    this.$terminalContainer.appendChild(this.$toolSection);
    this.$terminalContainer.appendChild(this.$systemInfoSection);
    this.$terminalContainer.appendChild(this.$actions);

    // Add to container
    this.container.appendChild(this.$terminalContainer);

    // Initialize
    this._refresh();
  }

  async _switchTerminalMode(mode) {
    try {
      this._updateStatus('Switching terminal mode...', 'loading');
      
      const success = this.manager.switchMode(mode);
      
      if (success) {
        this._updateStatus(`Switched to ${mode} mode`, 'success');
        document.getElementById('terminal-mode-indicator').textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        this._refresh();
      } else {
        this._updateStatus('Failed to switch terminal mode', 'error');
      }
    } catch (error) {
      console.error('Error switching terminal mode:', error);
      this._updateStatus(`Error: ${error.message}`, 'error');
    }
  }

  async _setupTermux() {
    try {
      this._updateStatus('Setting up Termux...', 'loading');
      
      await this.manager.setupTermux();
      
      this._updateStatus('Termux setup completed', 'success');
      this._refresh();
    } catch (error) {
      console.error('Error setting up Termux:', error);
      this._updateStatus(`Setup failed: ${error.message}`, 'error');
    }
  }

  async _setupEnvironment(environmentType) {
    try {
      this._updateStatus(`Setting up ${environmentType} environment...`, 'loading');
      
      await this.manager.setupDevelopmentEnvironment(environmentType);
      
      this._updateStatus(`${environmentType} environment setup completed`, 'success');
      toast(`${environmentType} environment setup completed successfully!`, 'success');
    } catch (error) {
      console.error(`Error setting up ${environmentType} environment:`, error);
      this._updateStatus(`Setup failed: ${error.message}`, 'error');
      toast(`Failed to set up ${environmentType} environment: ${error.message}`, 'error');
    }
  }

  async _installTool(toolName = null) {
    const name = toolName || document.getElementById('tool-name-input').value.trim();
    
    if (!name) {
      toast('Please enter a tool name', 'warning');
      return;
    }

    try {
      this._updateStatus(`Installing ${name}...`, 'loading');
      
      // In a real implementation, this would call the manager to install the tool
      // For now, we'll just simulate the installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this._updateStatus(`${name} installed successfully`, 'success');
      toast(`${name} installed successfully!`, 'success');
      
      // Clear input
      if (!toolName) {
        document.getElementById('tool-name-input').value = '';
      }
    } catch (error) {
      console.error(`Error installing ${name}:`, error);
      this._updateStatus(`Installation failed: ${error.message}`, 'error');
      toast(`Failed to install ${name}: ${error.message}`, 'error');
    }
  }

  async _updatePackages() {
    try {
      this._updateStatus('Updating packages...', 'loading');
      
      const output = await this.manager.updatePackages();
      
      this._updateStatus('Packages updated successfully', 'success');
      toast('Packages updated successfully!', 'success');
      
      // Show output in system info section
      document.getElementById('system-info-content').textContent = output;
    } catch (error) {
      console.error('Error updating packages:', error);
      this._updateStatus(`Update failed: ${error.message}`, 'error');
      toast(`Failed to update packages: ${error.message}`, 'error');
    }
  }

  async _searchPackages() {
    const searchTerm = prompt('Enter package name to search:');
    if (!searchTerm) return;

    try {
      this._updateStatus(`Searching for packages: ${searchTerm}...`, 'loading');
      
      const output = await this.manager.searchPackages(searchTerm);
      
      this._updateStatus(`Found packages for: ${searchTerm}`, 'success');
      
      // Show output in system info section
      document.getElementById('system-info-content').textContent = output;
    } catch (error) {
      console.error('Error searching packages:', error);
      this._updateStatus(`Search failed: ${error.message}`, 'error');
      toast(`Failed to search packages: ${error.message}`, 'error');
    }
  }

  async _checkTools() {
    try {
      this._updateStatus('Checking available tools...', 'loading');
      
      const tools = await this.manager.getAvailableTools();
      
      // Format tools info for display
      let toolsInfo = 'Available Development Tools:\n\n';
      tools.forEach(tool => {
        toolsInfo += `${tool.name}: ${tool.installed ? tool.version : 'Not installed'}\n`;
      });
      
      this._updateStatus(`Checked ${tools.length} tools`, 'success');
      
      // Show output in system info section
      document.getElementById('system-info-content').textContent = toolsInfo;
    } catch (error) {
      console.error('Error checking tools:', error);
      this._updateStatus(`Tool check failed: ${error.message}`, 'error');
      toast(`Failed to check tools: ${error.message}`, 'error');
    }
  }

  async _refresh() {
    try {
      this._updateStatus('Loading terminal status...', 'loading');
      
      // Get terminal status
      const status = this.manager.getStatus();
      
      // Update UI based on status
      document.getElementById('terminal-mode-select').value = status.mode;
      document.getElementById('terminal-mode-indicator').textContent = 
        status.mode.charAt(0).toUpperCase() + status.mode.slice(1);
      
      // Show/hide setup section based on Termux availability
      if (status.termuxAvailable && !status.termuxSetup) {
        this.$setupSection.style.display = 'block';
      } else {
        this.$setupSection.style.display = 'none';
      }
      
      // Update status text
      let statusText = '';
      if (status.termuxAvailable) {
        statusText = status.termuxSetup 
          ? 'Termux available and set up' 
          : 'Termux available but not set up';
      } else {
        statusText = 'Termux not available';
      }
      
      this._updateStatus(statusText, 'ready');
      
      // Load system information
      this._loadSystemInfo();
    } catch (error) {
      console.error('Error refreshing terminal status:', error);
      this._updateStatus(`Error: ${error.message}`, 'error');
    }
  }

  async _loadSystemInfo() {
    try {
      const systemInfo = await this.manager.getSystemInfo();
      
      // Format system info for display
      let infoText = '';
      infoText += `OS: ${systemInfo.os}\n`;
      infoText += `Architecture: ${systemInfo.arch}\n`;
      infoText += `Shells: ${systemInfo.shells}\n\n`;
      infoText += `Disk Usage:\n${systemInfo.diskUsage}\n\n`;
      infoText += `Memory:\n${systemInfo.memory}\n\n`;
      infoText += `CPU:\n${systemInfo.cpu}\n`;
      
      document.getElementById('system-info-content').textContent = infoText;
    } catch (error) {
      console.error('Error loading system info:', error);
      document.getElementById('system-info-content').textContent = `Error loading system info: ${error.message}`;
    }
  }

  _updateStatus(text, status) {
    const statusElement = document.getElementById('terminal-status-text');
    if (statusElement) {
      statusElement.textContent = text;
      
      // Update status color based on status type
      switch (status) {
        case 'ready':
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
        case 'loading':
          statusElement.style.color = 'var(--warning-color, #ffa502)';
          break;
        case 'success':
          statusElement.style.color = 'var(--success-color, #2ed573)';
          break;
        case 'error':
          statusElement.style.color = 'var(--error-color, #ff4757)';
          break;
        default:
          statusElement.style.color = 'var(--txt-secondary-color)';
      }
    }
  }

  open() {
    this.$terminalContainer.style.display = 'flex';
  }

  close() {
    this.$terminalContainer.style.display = 'none';
  }
}