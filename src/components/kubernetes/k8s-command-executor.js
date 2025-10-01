/**
 * Kubernetes Command Executor for QwenPad IDE
 * Provides enhanced kubectl command execution capabilities
 */

import K8sManager from '../../plugins/k8s-manager/www/k8smanager';
import toast from '../components/toast';

export default class K8sCommandExecutor {
  constructor(container) {
    this.container = container;
    this.currentConnection = null;
    this.connections = [];
    this.history = [];
    
    this._initialize();
  }

  _initialize() {
    // Load existing connections
    this.connections = K8sManager.getConnections();
    
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$k8sContainer = tag('div', {
      className: 'k8s-command-executor-container',
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
      className: 'k8s-command-executor-header',
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
              className: 'icon router', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Kubernetes Command Executor',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'k8s-close-btn',
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

    // Connection selector
    this.$connectionSelector = tag('div', {
      className: 'k8s-connection-selector',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      children: [
        tag('span', {
          textContent: 'Cluster:',
          style: { fontWeight: 'bold' }
        }),
        tag('select', {
          id: 'k8s-connection-select',
          style: {
            flex: 1,
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onchange: (e) => this._selectConnection(e.target.value)
        }),
        tag('button', {
          textContent: '+',
          onclick: () => this._manageConnections(),
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
          textContent: 'Connect',
          onclick: () => this._connect(),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--primary-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9em'
          }
        })
      ]
    });

    // Command input
    this.$commandInput = tag('div', {
      className: 'k8s-command-input',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      },
      children: [
        tag('span', {
          textContent: 'kubectl',
          style: {
            fontWeight: 'bold',
            color: 'var(--primary-color)',
            fontFamily: 'monospace'
          }
        }),
        tag('input', {
          id: 'k8s-command',
          type: 'text',
          placeholder: 'Enter kubectl command (e.g., get pods, describe deployment nginx)...',
          style: {
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)',
            fontFamily: 'monospace'
          },
          onkeypress: (e) => {
            if (e.key === 'Enter') {
              this._executeCommand();
            }
          }
        }),
        tag('button', {
          textContent: 'Execute',
          onclick: () => this._executeCommand(),
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

    // Output area
    this.$outputArea = tag('div', {
      className: 'k8s-output-area',
      style: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        whiteSpace: 'pre-wrap',
        backgroundColor: 'var(--terminal-bg, #1e1e1e)',
        color: 'var(--terminal-txt, #d4d4d4)'
      },
      textContent: 'Select a Kubernetes cluster and enter a kubectl command to begin...\n\nExamples:\n  kubectl get pods\n  kubectl get services\n  kubectl get deployments\n  kubectl describe pod <pod-name>\n  kubectl logs <pod-name>\n  kubectl get nodes -o wide'
    });

    // History and shortcuts
    this.$shortcuts = tag('div', {
      className: 'k8s-shortcuts',
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
          textContent: 'Get Pods',
          onclick: () => this._quickCommand('get pods'),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontSize: '0.8em'
          }
        }),
        tag('button', {
          textContent: 'Get Services',
          onclick: () => this._quickCommand('get services'),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontSize: '0.8em'
          }
        }),
        tag('button', {
          textContent: 'Get Deployments',
          onclick: () => this._quickCommand('get deployments'),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontSize: '0.8em'
          }
        }),
        tag('button', {
          textContent: 'Get Nodes',
          onclick: () => this._quickCommand('get nodes'),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontSize: '0.8em'
          }
        }),
        tag('button', {
          textContent: 'Cluster Info',
          onclick: () => this._quickCommand('cluster-info'),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontSize: '0.8em'
          }
        }),
        tag('button', {
          textContent: 'Clear',
          onclick: () => this._clearOutput(),
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
    });

    // Status bar
    this.$statusBar = tag('div', {
      className: 'k8s-status-bar',
      style: {
        padding: '4px 16px',
        borderTop: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--status-bg, #e9ecef)',
        fontSize: '0.8em',
        color: 'var(--txt-secondary-color)',
        display: 'flex',
        justifyContent: 'space-between'
      },
      children: [
        tag('span', {
          id: 'k8s-status-text',
          textContent: 'Ready'
        }),
        tag('span', {
          id: 'k8s-connection-status',
          textContent: 'Not connected'
        })
      ]
    });

    // Assemble the UI
    this.$k8sContainer.appendChild(this.$header);
    this.$k8sContainer.appendChild(this.$connectionSelector);
    this.$k8sContainer.appendChild(this.$commandInput);
    this.$k8sContainer.appendChild(this.$outputArea);
    this.$k8sContainer.appendChild(this.$shortcuts);
    this.$k8sContainer.appendChild(this.$statusBar);

    // Add to container
    this.container.appendChild(this.$k8sContainer);

    // Populate connection selector
    this._populateConnectionSelector();
  }

  _populateConnectionSelector() {
    const select = document.getElementById('k8s-connection-select');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="">Select a cluster...</option>';

    // Add connections
    this.connections.forEach(connection => {
      const option = tag('option', {
        value: connection.id,
        textContent: connection.name
      });
      select.appendChild(option);
    });
  }

  _selectConnection(connectionId) {
    if (!connectionId) return;

    const connection = this.connections.find(c => c.id === connectionId);
    if (connection) {
      this.currentConnection = connection;
      this._updateStatusBar(`Selected: ${connection.name}`, 'ready');
      document.getElementById('k8s-connection-status').textContent = `Connected to ${connection.name}`;
    }
  }

  _manageConnections() {
    // This would open the K8s manager to manage connections
    toast('Please use K8s Manager to manage cluster connections', 'info');
  }

  async _connect() {
    if (!this.currentConnection) {
      toast('Please select a cluster first', 'warning');
      return;
    }

    try {
      this._updateStatusBar('Testing connection...', 'connecting');
      
      const isConnected = await K8sManager.testConnection(this.currentConnection);
      
      if (isConnected) {
        this._updateStatusBar(`Connected to ${this.currentConnection.name}`, 'connected');
        document.getElementById('k8s-connection-status').textContent = `Connected to ${this.currentConnection.name}`;
        toast('Connection successful!', 'success');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      this._updateStatusBar('Connection failed', 'error');
      document.getElementById('k8s-connection-status').textContent = 'Connection failed';
      toast(`Connection failed: ${error.message}`, 'error');
    }
  }

  async _executeCommand() {
    if (!this.currentConnection) {
      toast('Please select and connect to a cluster first', 'warning');
      return;
    }

    const commandInput = document.getElementById('k8s-command');
    const command = commandInput.value.trim();
    
    if (!command) {
      toast('Please enter a kubectl command', 'warning');
      return;
    }

    try {
      this._updateStatusBar('Executing command...', 'executing');
      
      // Add to history
      this.history.push({
        command: command,
        timestamp: new Date().toISOString()
      });
      
      // Update UI
      this._appendToOutput(`$ kubectl ${command}\n`);

      // Execute the command
      const result = await K8sManager.executeCommand(
        this.currentConnection.id, 
        command,
        this.currentConnection.namespace || 'default'
      );
      
      // Display result
      this._appendToOutput(result + '\n');
      this._updateStatusBar('Command executed successfully', 'success');
      
      // Clear input
      commandInput.value = '';
    } catch (error) {
      console.error('Command execution error:', error);
      this._appendToOutput(`Error: ${error.message}\n`);
      this._updateStatusBar('Command execution failed', 'error');
      toast(`Command failed: ${error.message}`, 'error');
    }
  }

  _quickCommand(command) {
    const commandInput = document.getElementById('k8s-command');
    commandInput.value = command;
    commandInput.focus();
  }

  _appendToOutput(text) {
    const outputArea = this.$outputArea;
    outputArea.textContent += text;
    outputArea.scrollTop = outputArea.scrollHeight;
  }

  _clearOutput() {
    this.$outputArea.textContent = '';
  }

  _updateStatusBar(text, status) {
    const statusElement = document.getElementById('k8s-status-text');
    if (statusElement) {
      statusElement.textContent = text;
      
      // Update status color based on status type
      switch (status) {
        case 'connected':
          statusElement.style.color = 'var(--success-color, #2ed573)';
          break;
        case 'error':
          statusElement.style.color = 'var(--error-color, #ff4757)';
          break;
        case 'executing':
          statusElement.style.color = 'var(--warning-color, #ffa502)';
          break;
        case 'success':
          statusElement.style.color = 'var(--success-color, #2ed573)';
          break;
        default:
          statusElement.style.color = 'var(--txt-secondary-color)';
      }
    }
  }

  open() {
    this.$k8sContainer.style.display = 'flex';
  }

  close() {
    this.$k8sContainer.style.display = 'none';
  }

  // Static method to check if K8s executor is available
  static isAvailable() {
    return typeof K8sManager !== 'undefined';
  }
}