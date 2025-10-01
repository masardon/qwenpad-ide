/**
 * Remote Execution Framework for QwenPad IDE
 * Provides infrastructure for executing commands on remote servers and cloud platforms
 */

import toast from '../components/toast';

export default class RemoteExecutionFramework {
  constructor(container) {
    this.container = container;
    this.targets = [];
    this.sessions = [];
    this.history = [];
    
    this._initialize();
  }

  _initialize() {
    // Load connection targets
    this._loadTargets();
    
    // Create the UI elements
    this._createUI();
  }

  _loadTargets() {
    // Load existing targets from local storage
    try {
      const storedTargets = localStorage.getItem('qwenpad-remote-targets');
      if (storedTargets) {
        this.targets = JSON.parse(storedTargets);
      } else {
        // Initialize with default targets
        this.targets = [
          {
            id: 'localhost',
            name: 'Local Machine',
            type: 'direct',
            address: '127.0.0.1',
            port: 22,
            authMethod: 'none',
            lastUsed: new Date().toISOString(),
            tags: ['local']
          },
          {
            id: 'docker-machine',
            name: 'Docker Machine',
            type: 'ssh',
            address: '192.168.99.100',
            port: 2376,
            authMethod: 'tls',
            lastUsed: new Date().toISOString(),
            tags: ['docker']
          }
        ];
        this._saveTargets();
      }
    } catch (error) {
      console.error('Error loading targets:', error);
      this.targets = [];
    }
  }

  _saveTargets() {
    try {
      localStorage.setItem('qwenpad-remote-targets', JSON.stringify(this.targets));
    } catch (error) {
      console.error('Error saving targets:', error);
    }
  }

  _createUI() {
    // Main container
    this.$remoteContainer = tag('div', {
      className: 'remote-execution-framework-container',
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
      className: 'remote-execution-header',
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
              className: 'icon cloud_upload', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Remote Execution Framework',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'remote-close-btn',
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

    // Target selector
    this.$targetSelector = tag('div', {
      className: 'remote-target-selector',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      children: [
        tag('span', {
          textContent: 'Target:',
          style: { fontWeight: 'bold' }
        }),
        tag('select', {
          id: 'remote-target-select',
          style: {
            flex: 1,
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onchange: (e) => this._selectTarget(e.target.value)
        }),
        tag('button', {
          textContent: '+',
          onclick: () => this._addTarget(),
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
      className: 'remote-command-input',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end'
      },
      children: [
        tag('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1
          },
          children: [
            tag('label', {
              textContent: 'Command:',
              style: {
                display: 'block',
                fontSize: '0.8em',
                fontWeight: 'bold'
              }
            }),
            tag('textarea', {
              id: 'remote-command',
              placeholder: 'Enter command to execute on remote target...\nExamples:\n  uname -a\n  ps aux | grep nginx\n  df -h\n  free -m\n  lsof -i :80',
              style: {
                width: '100%',
                height: '60px',
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--txt-color)',
                fontFamily: 'monospace',
                fontSize: '0.9em',
                resize: 'vertical'
              },
              onkeypress: (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                  e.preventDefault();
                  this._executeCommand();
                }
              }
            })
          ]
        }),
        tag('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: [
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
            }),
            tag('button', {
              textContent: 'Run Script',
              onclick: () => this._runScript(),
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
    });

    // Output area
    this.$outputArea = tag('div', {
      className: 'remote-output-area',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        whiteSpace: 'pre-wrap',
        backgroundColor: 'var(--terminal-bg, #1e1e1e)',
        color: 'var(--terminal-txt, #d4d4d4)',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      },
      textContent: 'Welcome to Remote Execution Framework\n\nSelect a target and enter a command to begin.\n\nSupported protocols:\n  • SSH (port 22)\n  • Telnet (port 23)\n  • Docker (port 2376)\n  • WinRM (port 5985/5986)\n  • HTTP/HTTPS (REST API)\n\nExamples:\n  $ uname -a\n  $ ps aux | grep nginx\n  $ df -h\n  $ free -m\n  $ docker ps\n  $ kubectl get pods'
    });

    // History panel
    this.$historyPanel = tag('div', {
      className: 'remote-history-panel',
      style: {
        maxHeight: '200px',
        borderTop: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--input-container-bg, #f8f9fa)',
        display: 'none'
      },
      children: [
        tag('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            borderBottom: '1px solid var(--bdr-color)',
            backgroundColor: 'var(--header-bg, #f8f9fa)'
          },
          children: [
            tag('span', {
              textContent: 'Command History',
              style: {
                fontWeight: 'bold',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              innerHTML: '&times;',
              onclick: () => this._toggleHistory(),
              style: {
                background: 'none',
                border: 'none',
                fontSize: '1.2em',
                cursor: 'pointer',
                color: 'var(--txt-color)',
                padding: '0',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            })
          ]
        }),
        tag('div', {
          id: 'remote-history-list',
          style: {
            maxHeight: '170px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '8px 16px'
          }
        })
      ]
    });

    // Action bar
    this.$actionBar = tag('div', {
      className: 'remote-action-bar',
      style: {
        padding: '8px 16px',
        borderTop: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--input-container-bg, #f8f9fa)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      children: [
        tag('div', {
          style: { display: 'flex', gap: '8px' },
          children: [
            tag('button', {
              textContent: 'History',
              onclick: () => this._toggleHistory(),
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
            }),
            tag('button', {
              textContent: 'Download',
              onclick: () => this._downloadOutput(),
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
        }),
        tag('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          },
          children: [
            tag('span', {
              id: 'remote-session-status',
              textContent: 'Not connected',
              style: {
                fontSize: '0.8em',
                color: 'var(--txt-secondary-color)'
              }
            }),
            tag('span', {
              id: 'remote-session-indicator',
              className: 'icon fiber_manual_record',
              style: {
                fontSize: '0.8em',
                color: 'var(--error-color, #ff4757)'
              }
            })
          ]
        })
      ]
    });

    // Assemble the UI
    this.$remoteContainer.appendChild(this.$header);
    this.$remoteContainer.appendChild(this.$targetSelector);
    this.$remoteContainer.appendChild(this.$commandInput);
    this.$remoteContainer.appendChild(this.$outputArea);
    this.$remoteContainer.appendChild(this.$historyPanel);
    this.$remoteContainer.appendChild(this.$actionBar);

    // Add to container
    this.container.appendChild(this.$remoteContainer);

    // Populate target selector
    this._populateTargetSelector();
  }

  _populateTargetSelector() {
    const select = document.getElementById('remote-target-select');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="">Select a target...</option>';

    // Add targets
    this.targets.forEach(target => {
      const option = tag('option', {
        value: target.id,
        textContent: `${target.name} (${target.address})`,
        title: `${target.type}://${target.address}:${target.port}`
      });
      select.appendChild(option);
    });
  }

  _selectTarget(targetId) {
    if (!targetId) return;

    const target = this.targets.find(t => t.id === targetId);
    if (target) {
      this.currentTarget = target;
      this._updateSessionStatus(`Selected target: ${target.name}`, 'ready');
    }
  }

  _addTarget() {
    // Create modal for adding new target
    this._showTargetModal();
  }

  async _connect() {
    if (!this.currentTarget) {
      toast('Please select a target first', 'warning');
      return;
    }

    try {
      this._updateSessionStatus('Connecting...', 'connecting');
      
      // In a real implementation, this would establish the connection
      // For now, we'll just simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this._updateSessionStatus(`Connected to ${this.currentTarget.name}`, 'connected');
      this._appendToOutput(`\nEstablished connection to ${this.currentTarget.name}\n`);
      
      // Update session indicator
      const indicator = document.getElementById('remote-session-indicator');
      if (indicator) {
        indicator.style.color = 'var(--success-color, #2ed573)';
      }
      
      toast('Connection established', 'success');
    } catch (error) {
      console.error('Connection error:', error);
      this._updateSessionStatus('Connection failed', 'error');
      this._appendToOutput(`\nConnection error: ${error.message}\n`);
      toast(`Connection failed: ${error.message}`, 'error');
    }
  }

  async _executeCommand() {
    if (!this.currentTarget) {
      toast('Please select and connect to a target first', 'warning');
      return;
    }

    const commandInput = document.getElementById('remote-command');
    const command = commandInput.value.trim();
    
    if (!command) {
      toast('Please enter a command to execute', 'warning');
      return;
    }

    try {
      this._updateSessionStatus('Executing command...', 'executing');
      
      // Add to history
      this.history.push({
        id: Date.now(),
        command: command,
        target: this.currentTarget.id,
        timestamp: new Date().toISOString()
      });
      
      this._updateHistoryList();
      
      // Add to output area
      this._appendToOutput(`\n$ ${command}\n`);
      
      // In a real implementation, this would execute the command
      // For now, we'll simulate execution
      const result = await this._simulateExecution(command);
      
      // Display result
      this._appendToOutput(result + '\n');
      
      this._updateSessionStatus('Command completed', 'ready');
    } catch (error) {
      console.error('Command execution error:', error);
      this._appendToOutput(`Error: ${error.message}\n`);
      this._updateSessionStatus('Command failed', 'error');
      toast(`Command failed: ${error.message}`, 'error');
    }
  }

  async _simulateExecution(command) {
    // Simulate command execution with different responses based on the command
    return new Promise(resolve => {
      setTimeout(() => {
        switch (command) {
          case 'uname -a':
            resolve('Linux localhost 5.4.0 #1 SMP Thu Jan 1 00:00:00 UTC 1970 aarch64 GNU/Linux');
          case 'ps aux':
            resolve('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  12345  6789 ?        Ss   00:00   0:00 /sbin/init\nroot        10  0.0  0.0   5678  1234 ?        S    00:00   0:00 [kthreadd]');
          case 'df -h':
            resolve('Filesystem      Size  Used Avail Use% Mounted on\n/dev/root        10G  2.5G  7.5G  25% /\n/dev/sda1        50G   10G   40G  20% /home');
          case 'free -m':
            resolve('              total        used        free      shared  buff/cache   available\nMem:           3934         567        2345         123        1022        3012\nSwap:             0           0           0');
          case 'ls -la':
            resolve('total 24\n-rw-r--r-- 1 user user  123 Jan  1 00:00 file1.txt\n-rw-r--r-- 1 user user  456 Jan  1 00:00 file2.sh\ndrwxr-xr-x 2 user user 4096 Jan  1 00:00 directory1');
          case 'docker ps':
            resolve('CONTAINER ID   IMAGE          COMMAND       CREATED        STATUS        PORTS         NAMES\nabc123def456   nginx:latest   "nginx -g ..."   2 hours ago    Up 2 hours    80/tcp        web-server\n789ghi012jkl   mysql:5.7      "docker-entrypoint.s…"   3 days ago    Up 3 days     3306/tcp      db-server');
          case 'kubectl get pods':
            resolve('NAME                              READY   STATUS    RESTARTS   AGE\nweb-server-7d5b8c9c4d-9zxl2   1/1     Running   0          2d\nweb-server-7d5b8c9c4d-n5qj7   1/1     Running   0          2d\ndb-server-5c9d7f8b4b-k2v9m    1/1     Running   0          3d');
          default:
            // Generic response for unknown commands
            resolve(`Command executed successfully: ${command}\n\nThis is a simulated response from the remote execution framework.\nIn a real implementation, this would show the actual output from the remote system.`);
        }
      }, 500 + Math.random() * 1000);
    });
  }

  _runScript() {
    if (!this.currentTarget) {
      toast('Please select and connect to a target first', 'warning');
      return;
    }

    // Create file picker or script selection interface
    this._showScriptSelector();
  }

  _appendToFile(content) {
    // Append content to a file on the target system
    this._appendToOutput(`Appended to file:\n${content}\n`);
  }

  _appendToOutput(text) {
    this.$outputArea.textContent += text;
    this.$outputArea.scrollTop = this.$outputArea.scrollHeight;
  }

  _clearOutput() {
    this.$outputArea.textContent = '';
  }

  _downloadOutput() {
    // Download the output as a text file
    const output = this.$outputArea.textContent;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = tag('a', {
      href: url,
      download: `remote_output_${new Date().toISOString().split('T')[0]}.txt`,
      style: { display: 'none' }
    });
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast('Output downloaded successfully', 'success');
  }

  _toggleHistory() {
    const isVisible = this.$historyPanel.style.display === 'block';
    this.$historyPanel.style.display = isVisible ? 'none' : 'block';
    this._updateHistoryList();
  }

  _updateHistoryList() {
    const historyList = document.getElementById('remote-history-list');
    if (!historyList) return;

    const recentHistory = this.history.slice(-20).reverse(); // Last 20 items
    historyList.innerHTML = '';

    if (recentHistory.length === 0) {
      historyList.appendChild(
        tag('div', {
          textContent: 'No command history yet',
          style: {
            textAlign: 'center',
            padding: '16px',
            color: 'var(--txt-secondary-color)',
            fontStyle: 'italic'
          }
        })
      );
      return;
    }

    recentHistory.forEach(entry => {
      const target = this.targets.find(t => t.id === entry.target);
      const $item = tag('div', {
        className: 'remote-history-item',
        style: {
          padding: '8px 12px',
          border: '1px solid var(--bdr-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--bg-color)',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        },
        onmouseover: function() {
          this.style.backgroundColor = 'var(--hover-bg, #f8f9fa)';
        },
        onmouseout: function() {
          this.style.backgroundColor = 'var(--bg-color)';
        },
        onclick: () => {
          document.getElementById('remote-command').value = entry.command;
          this._toggleHistory();
        },
        children: [
          tag('div', {
            textContent: entry.command,
            style: {
              marginBottom: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          }),
          tag('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8em',
              color: 'var(--txt-secondary-color)'
            },
            children: [
              tag('span', {
                textContent: target ? target.name : 'Unknown'
              }),
              tag('span', {
                textContent: new Date(entry.timestamp).toLocaleTimeString()
              })
            ]
          })
        ]
      });
      
      historyList.appendChild($item);
    });
  }

  _updateSessionStatus(text, status) {
    const statusElement = document.getElementById('remote-session-status');
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
        case 'connecting':
        case 'executing':
          statusElement.style.color = 'var(--warning-color, #ffa502)';
          break;
        case 'ready':
        default:
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
      }
    }
  }

  _showTargetModal() {
    // Create modal for adding new target
    const $modal = tag('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }
    });

    const $dialog = tag('div', {
      style: {
        backgroundColor: 'var(--bg-color)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      },
      children: [
        tag('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
          children: [
            tag('h3', {
              textContent: 'Add New Target',
              style: { margin: 0 }
            }),
            tag('button', {
              innerHTML: '&times;',
              onclick: () => document.body.removeChild($modal),
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
        }),
        tag('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '12px' },
          children: [
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Target Name:',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  id: 'target-name',
                  type: 'text',
                  placeholder: 'e.g., Production Server, Dev Cluster',
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
              children: [
                tag('label', {
                  textContent: 'Address:',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  id: 'target-address',
                  type: 'text',
                  placeholder: 'e.g., 192.168.1.100, hostname.domain.com',
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
              style: { display: 'flex', gap: '12px' },
              children: [
                tag('div', {
                  style: { flex: 1 },
                  children: [
                    tag('label', {
                      textContent: 'Port:',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('input', {
                      id: 'target-port',
                      type: 'number',
                      value: '22',
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
                  style: { flex: 1 },
                  children: [
                    tag('label', {
                      textContent: 'Type:',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('select', {
                      id: 'target-type',
                      style: {
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--bdr-color)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--txt-color)'
                      },
                      children: [
                        tag('option', { value: 'ssh', textContent: 'SSH (22)' }),
                        tag('option', { value: 'telnet', textContent: 'Telnet (23)' }),
                        tag('option', { value: 'docker', textContent: 'Docker (2376)' }),
                        tag('option', { value: 'winrm', textContent: 'WinRM (5985/5986)' }),
                        tag('option', { value: 'http', textContent: 'HTTP (80/443)' }),
                        tag('option', { value: 'k8s', textContent: 'Kubernetes (6443)' })
                      ]
                    })
                  ]
                })
              ]
            }),
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Authentication Method:',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('select', {
                  id: 'target-auth',
                  style: {
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--bdr-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--txt-color)'
                  },
                  children: [
                    tag('option', { value: 'key', textContent: 'SSH Key' }),
                    tag('option', { value: 'password', textContent: 'Password' }),
                    tag('option', { value: 'tls', textContent: 'TLS Certificate' }),
                    tag('option', { value: 'token', textContent: 'Bearer Token' }),
                    tag('option', { value: 'none', textContent: 'None', selected: true })
                  ]
                })
              ]
            }),
            tag('div', {
              style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' },
              children: [
                tag('button', {
                  textContent: 'Cancel',
                  onclick: () => document.body.removeChild($modal),
                  style: {
                    padding: '8px 16px',
                    border: '1px solid var(--bdr-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--btn-txt-color)',
                    cursor: 'pointer'
                  }
                }),
                tag('button', {
                  textContent: 'Add Target',
                  onclick: () => this._saveTarget($modal),
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
            })
          ]
        })
      ]
    });

    $modal.appendChild($dialog);
    document.body.appendChild($modal);
  }

  _saveTarget(modal) {
    const name = document.getElementById('target-name').value.trim();
    const address = document.getElementById('target-address').value.trim();
    const port = document.getElementById('target-port').value;
    const type = document.getElementById('target-type').value;
    const authMethod = document.getElementById('target-auth').value;

    if (!name || !address) {
      toast('Please fill in all required fields', 'warning');
      return;
    }

    const target = {
      id: `target_${Date.now()}`,
      name: name,
      type: type,
      address: address,
      port: parseInt(port) || 22,
      authMethod: authMethod,
      lastUsed: new Date().toISOString(),
      tags: []
    };

    this.targets.push(target);
    this._saveTargets();
    this._populateTargetSelector();
    
    toast(`Target ${name} added successfully!`, 'success');
    
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  _showScriptSelector() {
    // Create modal for script selection
    const $modal = tag('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }
    });

    const $dialog = tag('div', {
      style: {
        backgroundColor: 'var(--bg-color)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      },
      children: [
        tag('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
          children: [
            tag('h3', {
              textContent: 'Run Script',
              style: { margin: 0 }
            }),
            tag('button', {
              innerHTML: '&times;',
              onclick: () => document.body.removeChild($modal),
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
        }),
        tag('div', {
          style: { display: 'flex', gap: '12px', marginBottom: '16px' },
          children: [
            tag('button', {
              textContent: 'Upload Script',
              onclick: () => this._uploadScript($modal),
              style: {
                flex: 1,
                padding: '8px 16px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer'
              }
            }),
            tag('button', {
              textContent: 'Select Existing',
              onclick: () => this._browseScripts($modal),
              style: {
                flex: 1,
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
        }),
        tag('div', {
          children: [
            tag('h4', {
              textContent: 'Recent Scripts',
              style: { margin: '0 0 12px 0' }
            }),
            tag('div', {
              id: 'recent-scripts-list',
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }
            })
          ]
        }),
        tag('div', {
          style: { display: 'flex', justifyContent: 'flex-end', marginTop: '16px' },
          children: [
            tag('button', {
              textContent: 'Close',
              onclick: () => document.body.removeChild($modal),
              style: {
                padding: '8px 16px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer'
              }
            })
          ]
        })
      ]
    });

    $modal.appendChild($dialog);
    document.body.appendChild($modal);

    // Load recent scripts
    this._loadRecentScripts();
  }

  _uploadScript(modal) {
    toast('Please upload scripts through the file explorer', 'info');
    
    // In a real implementation, this would open a file picker
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  _browseScripts(modal) {
    toast('Opening script browser...', 'info');
    
    // In a real implementation, this would show a script browser
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    
    // Show a sample script
    document.getElementById('remote-command').value = '#!/bin/bash\n# Sample deployment script\necho "Starting deployment..."\ndate\necho "Deployment completed!"';
  }

  _loadRecentScripts() {
    const scriptList = document.getElementById('recent-scripts-list');
    if (!scriptList) return;

    // Sample scripts for demonstration
    const recentScripts = [
      { name: 'deploy.sh', description: 'Deployment script', lastUsed: '2023-01-01T10:00:00Z' },
      { name: 'backup.sh', description: 'Database backup script', lastUsed: '2023-01-02T14:00:00Z' },
      { name: 'monitor.sh', description: 'System monitoring script', lastUsed: '2023-01-03T09:00:00Z' }
    ];

    scriptList.innerHTML = '';

    recentScripts.forEach(script => {
      const $scriptItem = tag('div', {
        style: {
          padding: '12px',
          border: '1px solid var(--bdr-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--input-container-bg, #f8f9fa)',
          cursor: 'pointer'
        },
        onmouseover: function() {
          this.style.backgroundColor = 'var(--hover-bg, #f8f9fa)';
        },
        onmouseout: function() {
          this.style.backgroundColor = 'var(--input-container-bg, #f8f9fa)';
        },
        onclick: () => {
          document.getElementById('remote-command').value = `./scripts/${script.name}`;
          if (document.getElementById('remote-script-modal')) {
            document.getElementById('remote-script-modal').remove();
          }
        },
        children: [
          tag('div', {
            textContent: script.name,
            style: { fontWeight: 'bold', marginBottom: '4px' }
          }),
          tag('div', {
            textContent: script.description,
            style: { fontSize: '0.9em', color: 'var(--txt-secondary-color)', marginBottom: '8px' }
          }),
          tag('div', {
            textContent: `Last used: ${new Date(script.lastUsed).toLocaleDateString()}`,
            style: { fontSize: '0.8em', color: 'var(--txt-secondary-color)' }
          })
        ]
      });
      
      scriptList.appendChild($scriptItem);
    });
  }

  open() {
    this.$remoteContainer.style.display = 'flex';
  }

  close() {
    this.$remoteContainer.style.display = 'none';
  }
}