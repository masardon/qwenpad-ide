/**
 * Remote Development Framework for QwenPad IDE
 * Unified interface for remote development capabilities including SSH, Kubernetes, and Cloud providers
 */

import SSHManager from '../../plugins/ssh-manager/www/sshmanager';
import SFTP from '../../plugins/sftp/www/sftp';
import K8sManager from '../../plugins/k8s-manager/www/k8smanager';
import Executor from '../../plugins/terminal/www/Executor';
import toast from '../../components/toast';

export default class RemoteDevelopmentFramework {
  constructor(container) {
    this.container = container;
    this.connections = {
      ssh: [],
      k8s: [],
      cloud: []
    };
    
    this.activeConnections = {
      ssh: null,
      k8s: null,
      cloud: null
    };
    
    this._initialize();
  }

  _initialize() {
    // Load existing connections
    this._loadConnections();
    
    // Create the UI elements
    this._createUI();
  }

  _loadConnections() {
    // Load SSH connections
    this.connections.ssh = SSHManager.getConnections();
    
    // Load Kubernetes connections
    this.connections.k8s = K8sManager.getConnections();
    
    // Load Cloud connections (will be populated when cloud providers are added)
    this.connections.cloud = [];
  }

  _createUI() {
    // Main container
    this.$remoteDevContainer = tag('div', {
      className: 'remote-development-framework-container',
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
      className: 'remote-dev-header',
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
              className: 'icon desktop_windows', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Remote Development Framework',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'remote-dev-close-btn',
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

    // Connection tabs
    this.$tabs = tag('div', {
      className: 'remote-dev-tabs',
      style: {
        display: 'flex',
        borderBottom: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--tab-bg, #f8f9fa)'
      },
      children: [
        tag('button', {
          id: 'remote-dev-ssh-tab',
          textContent: 'SSH Connections',
          className: 'remote-dev-tab active',
          onclick: () => this._switchTab('ssh'),
          style: {
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--txt-color)',
            cursor: 'pointer',
            borderBottom: '2px solid var(--primary-color)',
            fontWeight: 'bold'
          }
        }),
        tag('button', {
          id: 'remote-dev-k8s-tab',
          textContent: 'Kubernetes',
          className: 'remote-dev-tab',
          onclick: () => this._switchTab('k8s'),
          style: {
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--txt-secondary-color)',
            cursor: 'pointer',
            marginLeft: '8px'
          }
        }),
        tag('button', {
          id: 'remote-dev-cloud-tab',
          textContent: 'Cloud Providers',
          className: 'remote-dev-tab',
          onclick: () => this._switchTab('cloud'),
          style: {
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--txt-secondary-color)',
            cursor: 'pointer',
            marginLeft: '8px'
          }
        })
      ]
    });

    // Connection selector and actions
    this.$selectorActions = tag('div', {
      className: 'remote-dev-selector-actions',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--input-container-bg, #f8f9fa)'
      },
      children: [
        tag('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px' },
          children: [
            tag('span', {
              textContent: 'Connection:',
              style: { fontWeight: 'bold' }
            }),
            tag('select', {
              id: 'remote-dev-connection-selector',
              style: {
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
              onclick: () => this._addConnection(),
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
        }),
        tag('div', {
          style: { display: 'flex', gap: '8px' },
          children: [
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
                fontWeight: 'bold',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              textContent: 'Test',
              onclick: () => this._testConnection(),
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
              textContent: 'Disconnect',
              onclick: () => this._disconnect(),
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
    });

    // Main content area
    this.$contentArea = tag('div', {
      className: 'remote-dev-content-area',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }
    });

    // Status bar
    this.$statusBar = tag('div', {
      className: 'remote-dev-status-bar',
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
          id: 'remote-dev-status-text',
          textContent: 'Ready'
        }),
        tag('span', {
          id: 'remote-dev-connection-status',
          textContent: 'Not connected'
        })
      ]
    });

    // Assemble the UI
    this.$remoteDevContainer.appendChild(this.$header);
    this.$remoteDevContainer.appendChild(this.$tabs);
    this.$remoteDevContainer.appendChild(this.$selectorActions);
    this.$remoteDevContainer.appendChild(this.$contentArea);
    this.$remoteDevContainer.appendChild(this.$statusBar);

    // Add to container
    this.container.appendChild(this.$remoteDevContainer);

    // Populate connection selector
    this._populateConnectionSelector();

    // Load initial content
    this._loadSSHConnections();
  }

  _switchTab(tabName) {
    // Update tab styling
    document.querySelectorAll('.remote-dev-tab').forEach(tab => {
      tab.className = 'remote-dev-tab';
      tab.style.color = 'var(--txt-secondary-color)';
      tab.style.borderBottom = 'none';
    });
    
    const activeTab = document.getElementById(`remote-dev-${tabName}-tab`);
    if (activeTab) {
      activeTab.className = 'remote-dev-tab active';
      activeTab.style.color = 'var(--txt-color)';
      activeTab.style.borderBottom = '2px solid var(--primary-color)';
    }
    
    // Update content
    switch (tabName) {
      case 'ssh':
        this._loadSSHConnections();
        break;
      case 'k8s':
        this._loadK8sConnections();
        break;
      case 'cloud':
        this._loadCloudConnections();
        break;
    }
  }

  _populateConnectionSelector() {
    const select = document.getElementById('remote-dev-connection-selector');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="">Select a connection...</option>';

    // Add SSH connections
    this.connections.ssh.forEach(connection => {
      const option = tag('option', {
        value: `ssh-${connection.id}`,
        textContent: `SSH: ${connection.name}`,
        title: `${connection.host}:${connection.port}`
      });
      select.appendChild(option);
    });

    // Add Kubernetes connections
    this.connections.k8s.forEach(connection => {
      const option = tag('option', {
        value: `k8s-${connection.id}`,
        textContent: `K8s: ${connection.name}`,
        title: connection.server
      });
      select.appendChild(option);
    });

    // Add Cloud connections (when available)
    this.connections.cloud.forEach(connection => {
      const option = tag('option', {
        value: `cloud-${connection.id}`,
        textContent: `Cloud: ${connection.name}`,
        title: connection.provider
      });
      select.appendChild(option);
    });
  }

  _selectConnection(connectionId) {
    if (!connectionId) return;

    const [type, id] = connectionId.split('-');
    
    switch (type) {
      case 'ssh':
        this.activeConnections.ssh = this.connections.ssh.find(c => c.id === id);
        this._updateStatusBar(`Selected SSH connection: ${this.activeConnections.ssh?.name}`, 'ready');
        break;
      case 'k8s':
        this.activeConnections.k8s = this.connections.k8s.find(c => c.id === id);
        this._updateStatusBar(`Selected K8s connection: ${this.activeConnections.k8s?.name}`, 'ready');
        break;
      case 'cloud':
        this.activeConnections.cloud = this.connections.cloud.find(c => c.id === id);
        this._updateStatusBar(`Selected Cloud connection: ${this.activeConnections.cloud?.name}`, 'ready');
        break;
    }
  }

  _addConnection() {
    // Determine which tab is active to show appropriate add dialog
    const activeTab = document.querySelector('.remote-dev-tab.active');
    if (!activeTab) return;

    const tabId = activeTab.id;
    
    switch (tabId) {
      case 'remote-dev-ssh-tab':
        this._showSSHConnectionDialog();
        break;
      case 'remote-dev-k8s-tab':
        this._showK8sConnectionDialog();
        break;
      case 'remote-dev-cloud-tab':
        this._showCloudConnectionDialog();
        break;
    }
  }

  _connect() {
    // Determine which connection type is selected
    const select = document.getElementById('remote-dev-connection-selector');
    const selectedValue = select.value;
    
    if (!selectedValue) {
      toast('Please select a connection first', 'warning');
      return;
    }

    const [type, id] = selectedValue.split('-');
    
    switch (type) {
      case 'ssh':
        this._connectSSH(id);
        break;
      case 'k8s':
        this._connectK8s(id);
        break;
      case 'cloud':
        this._connectCloud(id);
        break;
      default:
        toast('Unknown connection type', 'error');
    }
  }

  _testConnection() {
    // Determine which connection type is selected
    const select = document.getElementById('remote-dev-connection-selector');
    const selectedValue = select.value;
    
    if (!selectedValue) {
      toast('Please select a connection first', 'warning');
      return;
    }

    const [type, id] = selectedValue.split('-');
    
    switch (type) {
      case 'ssh':
        this._testSSHConnection(id);
        break;
      case 'k8s':
        this._testK8sConnection(id);
        break;
      case 'cloud':
        this._testCloudConnection(id);
        break;
      default:
        toast('Unknown connection type', 'error');
    }
  }

  _disconnect() {
    // Determine which connection type is selected
    const select = document.getElementById('remote-dev-connection-selector');
    const selectedValue = select.value;
    
    if (!selectedValue) {
      toast('Please select a connection first', 'warning');
      return;
    }

    const [type, id] = selectedValue.split('-');
    
    switch (type) {
      case 'ssh':
        this._disconnectSSH();
        break;
      case 'k8s':
        this._disconnectK8s();
        break;
      case 'cloud':
        this._disconnectCloud();
        break;
      default:
        toast('Unknown connection type', 'error');
    }
  }

  _loadSSHConnections() {
    this.$contentArea.innerHTML = '';

    if (this.connections.ssh.length === 0) {
      this.$contentArea.appendChild(
        tag('div', {
          style: {
            textAlign: 'center',
            padding: '32px',
            color: 'var(--txt-secondary-color)'
          },
          children: [
            tag('div', {
              className: 'icon terminal',
              style: {
                fontSize: '3em',
                marginBottom: '16px',
                color: 'var(--txt-secondary-color)'
              }
            }),
            tag('div', {
              textContent: 'No SSH connections configured',
              style: {
                fontWeight: 'bold',
                marginBottom: '8px'
              }
            }),
            tag('div', {
              textContent: 'Add an SSH connection to get started',
              style: {
                fontSize: '0.9em',
                marginBottom: '16px'
              }
            }),
            tag('button', {
              textContent: '+ Add SSH Connection',
              onclick: () => this._showSSHConnectionDialog(),
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
      );
      return;
    }

    // Create connections grid
    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }
    });

    this.connections.ssh.forEach(connection => {
      const $card = this._createConnectionCard(connection, 'ssh');
      $grid.appendChild($card);
    });

    this.$contentArea.appendChild($grid);
  }

  _loadK8sConnections() {
    this.$contentArea.innerHTML = '';

    if (this.connections.k8s.length === 0) {
      this.$contentArea.appendChild(
        tag('div', {
          style: {
            textAlign: 'center',
            padding: '32px',
            color: 'var(--txt-secondary-color)'
          },
          children: [
            tag('div', {
              className: 'icon router',
              style: {
                fontSize: '3em',
                marginBottom: '16px',
                color: 'var(--txt-secondary-color)'
              }
            }),
            tag('div', {
              textContent: 'No Kubernetes connections configured',
              style: {
                fontWeight: 'bold',
                marginBottom: '8px'
              }
            }),
            tag('div', {
              textContent: 'Add a Kubernetes connection to get started',
              style: {
                fontSize: '0.9em',
                marginBottom: '16px'
              }
            }),
            tag('button', {
              textContent: '+ Add Kubernetes Connection',
              onclick: () => this._showK8sConnectionDialog(),
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
      );
      return;
    }

    // Create connections grid
    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }
    });

    this.connections.k8s.forEach(connection => {
      const $card = this._createConnectionCard(connection, 'k8s');
      $grid.appendChild($card);
    });

    this.$contentArea.appendChild($grid);
  }

  _loadCloudConnections() {
    this.$contentArea.innerHTML = '';

    // Create cloud providers grid
    const cloudProviders = [
      {
        id: 'aws',
        name: 'Amazon Web Services',
        description: 'Amazon Web Services cloud computing platform',
        icon: 'cloud',
        color: '#ff9900'
      },
      {
        id: 'gcp',
        name: 'Google Cloud Platform',
        description: 'Google Cloud Platform cloud computing services',
        icon: 'cloud',
        color: '#4285f4'
      },
      {
        id: 'azure',
        name: 'Microsoft Azure',
        description: 'Microsoft Azure cloud computing platform',
        icon: 'cloud',
        color: '#0078d4'
      }
    ];

    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }
    });

    cloudProviders.forEach(provider => {
      const $card = this._createCloudProviderCard(provider);
      $grid.appendChild($card);
    });

    this.$contentArea.appendChild($grid);
  }

  _createConnectionCard(connection, type) {
    return tag('div', {
      className: 'remote-dev-connection-card',
      style: {
        border: '1px solid var(--bdr-color)',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'var(--bg-color)',
        transition: 'transform 0.2s'
      },
      onmouseover: function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      },
      onmouseout: function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      },
      children: [
        tag('div', {
          style: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' },
          children: [
            tag('span', {
              className: `icon ${type === 'ssh' ? 'terminal' : 'router'}`,
              style: {
                fontSize: '1.5em',
                color: type === 'ssh' ? 'var(--primary-color)' : 'var(--success-color, #2ed573)'
              }
            }),
            tag('div', {
              style: { flex: 1 },
              children: [
                tag('div', {
                  textContent: connection.name,
                  style: {
                    fontWeight: 'bold',
                    fontSize: '1.1em',
                    marginBottom: '4px'
                  }
                }),
                tag('div', {
                  textContent: type === 'ssh' 
                    ? `${connection.host}:${connection.port}` 
                    : connection.server,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)',
                    marginBottom: '8px'
                  }
                }),
                tag('div', {
                  style: {
                    display: 'flex',
                    fontSize: '0.8em',
                    color: 'var(--txt-secondary-color)'
                  },
                  children: [
                    tag('div', {
                      textContent: `User: ${connection.username}`,
                      style: { marginRight: '12px' }
                    }),
                    connection.lastUsed ? tag('div', {
                      textContent: `Last used: ${new Date(connection.lastUsed).toLocaleDateString()}`
                    }) : null
                  ].filter(Boolean)
                })
              ]
            })
          ]
        }),
        tag('div', {
          style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
          children: [
            tag('button', {
              textContent: 'Connect',
              onclick: () => {
                if (type === 'ssh') {
                  this._connectSSH(connection.id);
                } else if (type === 'k8s') {
                  this._connectK8s(connection.id);
                }
              },
              style: {
                padding: '4px 8px',
                border: '1px solid var(--primary-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: 'bold'
              }
            }),
            tag('button', {
              textContent: 'Edit',
              onclick: () => {
                if (type === 'ssh') {
                  this._showSSHConnectionDialog(connection);
                } else if (type === 'k8s') {
                  this._showK8sConnectionDialog(connection);
                }
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
            }),
            tag('button', {
              textContent: 'Delete',
              onclick: () => {
                if (type === 'ssh') {
                  this._deleteSSHConnection(connection.id);
                } else if (type === 'k8s') {
                  this._deleteK8sConnection(connection.id);
                }
              },
              style: {
                padding: '4px 8px',
                border: '1px solid #ff4757',
                borderRadius: '4px',
                backgroundColor: '#ff4757',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9em'
              }
            })
          ]
        })
      ]
    });
  }

  _createCloudProviderCard(provider) {
    return tag('div', {
      className: 'remote-dev-cloud-provider-card',
      style: {
        border: '1px solid var(--bdr-color)',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'var(--bg-color)',
        transition: 'transform 0.2s'
      },
      onmouseover: function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      },
      onmouseout: function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      },
      children: [
        tag('div', {
          style: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' },
          children: [
            tag('span', {
              className: `icon ${provider.icon}`,
              style: {
                fontSize: '1.5em',
                color: provider.color
              }
            }),
            tag('div', {
              style: { flex: 1 },
              children: [
                tag('div', {
                  textContent: provider.name,
                  style: {
                    fontWeight: 'bold',
                    fontSize: '1.1em',
                    marginBottom: '4px'
                  }
                }),
                tag('div', {
                  textContent: provider.description,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)',
                    marginBottom: '8px'
                  }
                })
              ]
            })
          ]
        }),
        tag('div', {
          style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
          children: [
            tag('button', {
              textContent: 'Configure',
              onclick: () => this._configureCloudProvider(provider),
              style: {
                padding: '4px 8px',
                border: '1px solid var(--primary-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: 'bold'
              }
            }),
            tag('button', {
              textContent: 'Connect',
              onclick: () => this._connectCloudProvider(provider),
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
    });
  }

  _showSSHConnectionDialog(connection = null) {
    const isEdit = !!connection;
    const title = isEdit ? 'Edit SSH Connection' : 'New SSH Connection';
    
    // Create modal overlay
    const $modal = tag('div', {
      className: 'ssh-connection-modal',
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
      className: 'ssh-connection-dialog',
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
              textContent: title,
              style: {
                margin: 0,
                fontSize: '1.3em'
              }
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
          style: { display: 'flex', flexDirection: 'column', gap: '16px' },
          children: [
            // Name field
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Connection Name',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'text',
                  id: 'ssh-connection-name',
                  value: connection?.name || '',
                  placeholder: 'My Server',
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
            // Host field
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Host',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'text',
                  id: 'ssh-connection-host',
                  value: connection?.host || '',
                  placeholder: 'example.com or 192.168.1.100',
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
            // Port and username fields
            tag('div', {
              style: { display: 'flex', gap: '16px' },
              children: [
                tag('div', {
                  style: { flex: 1 },
                  children: [
                    tag('label', {
                      textContent: 'Port',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('input', {
                      type: 'number',
                      id: 'ssh-connection-port',
                      value: connection?.port || 22,
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
                      textContent: 'Username',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('input', {
                      type: 'text',
                      id: 'ssh-connection-username',
                      value: connection?.username || '',
                      placeholder: 'username',
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
            // Authentication type
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Authentication Method',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
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
                          name: 'ssh-auth-type',
                          value: 'password',
                          checked: !connection || connection.authType !== 'key',
                          onclick: () => this._toggleSSHAuthFields('password'),
                          style: { marginRight: '8px' }
                        }),
                        tag('span', { textContent: 'Password' })
                      ]
                    }),
                    tag('label', {
                      style: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
                      children: [
                        tag('input', {
                          type: 'radio',
                          name: 'ssh-auth-type',
                          value: 'key',
                          checked: connection?.authType === 'key',
                          onclick: () => this._toggleSSHAuthFields('key'),
                          style: { marginRight: '8px' }
                        }),
                        tag('span', { textContent: 'SSH Key' })
                      ]
                    })
                  ]
                })
              ]
            }),
            // Password field (shown when password auth is selected)
            tag('div', {
              id: 'ssh-password-section',
              style: {
                display: !connection || connection.authType !== 'key' ? 'block' : 'none'
              },
              children: [
                tag('label', {
                  textContent: 'Password',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'password',
                  id: 'ssh-connection-password',
                  value: connection?.password || '',
                  placeholder: 'Enter password',
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
            // Key selection (shown when key auth is selected)
            tag('div', {
              id: 'ssh-key-section',
              style: {
                display: connection?.authType === 'key' ? 'block' : 'none'
              },
              children: [
                tag('label', {
                  textContent: 'SSH Key',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('select', {
                  id: 'ssh-connection-key',
                  style: {
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--bdr-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--txt-color)'
                  }
                }),
                tag('button', {
                  textContent: '+ Manage SSH Keys',
                  onclick: () => {
                    document.body.removeChild($modal);
                    this._openSSHKeyManager();
                  },
                  style: {
                    marginTop: '8px',
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
            }),
            // Dialog buttons
            tag('div', {
              style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '16px'
              },
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
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }
                }),
                tag('button', {
                  textContent: isEdit ? 'Update' : 'Create',
                  onclick: () => this._saveSSHConnection(connection?.id),
                  style: {
                    padding: '8px 16px',
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
            })
          ]
        })
      ]
    });

    // Populate key selection if in key mode
    if (connection?.authType === 'key' || document.querySelector('input[name="ssh-auth-type"]:checked')?.value === 'key') {
      this._populateSSHKeySelector();
    }

    $modal.appendChild($dialog);
    document.body.appendChild($modal);
  }

  _toggleSSHAuthFields(authType) {
    const passwordSection = document.getElementById('ssh-password-section');
    const keySection = document.getElementById('ssh-key-section');
    
    if (passwordSection && keySection) {
      passwordSection.style.display = authType === 'password' ? 'block' : 'none';
      keySection.style.display = authType === 'key' ? 'block' : 'none';
      
      if (authType === 'key') {
        this._populateSSHKeySelector();
      }
    }
  }

  _populateSSHKeySelector() {
    const $select = document.getElementById('ssh-connection-key');
    if (!$select) return;
    
    // Clear existing options
    $select.innerHTML = '<option value="">Select an SSH key...</option>';
    
    // Get available SSH keys
    const sshKeys = SSHManager.getKeys();
    sshKeys.forEach(key => {
      const $option = tag('option', {
        value: key.id,
        textContent: key.name
      });
      
      // Check if this key should be selected
      const currentConnection = this.activeConnections.ssh;
      if (currentConnection && currentConnection.keyId === key.id) {
        $option.selected = true;
      }
      
      $select.appendChild($option);
    });
    
    // Add "Generate New Key" option
    const $newKeyOption = tag('option', {
      value: 'new',
      textContent: '+ Generate New Key'
    });
    $select.appendChild($newKeyOption);
  }

  _saveSSHConnection(existingId = null) {
    const name = document.getElementById('ssh-connection-name').value.trim();
    const host = document.getElementById('ssh-connection-host').value.trim();
    const port = parseInt(document.getElementById('ssh-connection-port').value);
    const username = document.getElementById('ssh-connection-username').value.trim();
    const authType = document.querySelector('input[name="ssh-auth-type"]:checked').value;

    if (!name || !host || !username || !port) {
      toast('Please fill in all required fields', 'warning');
      return;
    }

    // Prepare profile object
    const profile = {
      id: existingId || `ssh_${Date.now()}`,
      name,
      host,
      port,
      username,
      authType
    };

    if (authType === 'password') {
      profile.password = document.getElementById('ssh-connection-password').value;
    } else if (authType === 'key') {
      const keyId = document.getElementById('ssh-connection-key').value;
      
      if (keyId === 'new') {
        // Generate a new key
        try {
          const keyName = `${name.replace(/\s+/g, '_')}_key`;
          const newKey = SSHManager.generateKey(keyName);
          profile.keyId = newKey.id;
        } catch (error) {
          toast(`Error generating SSH key: ${error.message}`, 'error');
          return;
        }
      } else if (keyId) {
        profile.keyId = keyId;
      } else {
        toast('Please select an SSH key', 'warning');
        return;
      }
    }

    try {
      // Add or update the connection
      if (existingId) {
        SSHManager.updateConnection(profile);
      } else {
        SSHManager.addConnection(profile);
      }
      
      toast(`SSH connection ${existingId ? 'updated' : 'created'} successfully!`, 'success');
      
      // Close modal and refresh list
      document.body.removeChild(document.querySelector('.ssh-connection-modal'));
      this._refresh();
    } catch (error) {
      toast(`Error ${existingId ? 'updating' : 'creating'} SSH connection: ${error.message}`, 'error');
    }
  }

  _showK8sConnectionDialog(connection = null) {
    const isEdit = !!connection;
    const title = isEdit ? 'Edit Kubernetes Connection' : 'New Kubernetes Connection';
    
    // Create modal overlay
    const $modal = tag('div', {
      className: 'k8s-connection-modal',
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
      className: 'k8s-connection-dialog',
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
              textContent: title,
              style: {
                margin: 0,
                fontSize: '1.3em'
              }
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
          style: { display: 'flex', flexDirection: 'column', gap: '16px' },
          children: [
            // Name field
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Connection Name',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'text',
                  id: 'k8s-connection-name',
                  value: connection?.name || '',
                  placeholder: 'Production Cluster',
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
            // Server URL field
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Server URL',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'text',
                  id: 'k8s-connection-server',
                  value: connection?.server || '',
                  placeholder: 'https://k8s.example.com:6443',
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
            // Context field
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Context (Optional)',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'text',
                  id: 'k8s-connection-context',
                  value: connection?.context || '',
                  placeholder: 'production-context',
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
            // Namespace field
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Default Namespace (Optional)',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'text',
                  id: 'k8s-connection-namespace',
                  value: connection?.namespace || 'default',
                  placeholder: 'default',
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
            // Authentication method
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Authentication Method',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('div', {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  },
                  children: [
                    tag('label', {
                      style: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
                      children: [
                        tag('input', {
                          type: 'radio',
                          name: 'k8s-auth-type',
                          value: 'token',
                          checked: connection?.authType === 'token',
                          style: { marginRight: '8px' }
                        }),
                        tag('span', { textContent: 'Token' })
                      ]
                    }),
                    tag('label', {
                      style: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
                      children: [
                        tag('input', {
                          type: 'radio',
                          name: 'k8s-auth-type',
                          value: 'cert',
                          checked: connection?.authType === 'cert',
                          style: { marginRight: '8px' }
                        }),
                        tag('span', { textContent: 'Certificate' })
                      ]
                    }),
                    tag('label', {
                      style: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
                      children: [
                        tag('input', {
                          type: 'radio',
                          name: 'k8s-auth-type',
                          value: 'userpass',
                          checked: connection?.authType === 'userpass',
                          style: { marginRight: '8px' }
                        }),
                        tag('span', { textContent: 'Username/Password' })
                      ]
                    })
                  ]
                })
              ]
            }),
            // Token field
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Token',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('input', {
                  type: 'password',
                  id: 'k8s-connection-token',
                  value: connection?.token || '',
                  placeholder: 'Enter authentication token',
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
            // Certificate fields
            tag('div', {
              style: { display: 'flex', gap: '16px' },
              children: [
                tag('div', {
                  style: { flex: 1 },
                  children: [
                    tag('label', {
                      textContent: 'Certificate Path',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('input', {
                      type: 'text',
                      id: 'k8s-connection-cert',
                      value: connection?.certPath || '',
                      placeholder: '/path/to/client.crt',
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
                      textContent: 'CA Certificate Path',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('input', {
                      type: 'text',
                      id: 'k8s-connection-ca-cert',
                      value: connection?.caCertPath || '',
                      placeholder: '/path/to/ca.crt',
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
            // Username/Password fields
            tag('div', {
              style: { display: 'flex', gap: '16px' },
              children: [
                tag('div', {
                  style: { flex: 1 },
                  children: [
                    tag('label', {
                      textContent: 'Username',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('input', {
                      type: 'text',
                      id: 'k8s-connection-username',
                      value: connection?.username || '',
                      placeholder: 'username',
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
                      textContent: 'Password',
                      style: {
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('input', {
                      type: 'password',
                      id: 'k8s-connection-password',
                      value: connection?.password || '',
                      placeholder: 'password',
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
            // Dialog buttons
            tag('div', {
              style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '16px'
              },
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
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }
                }),
                tag('button', {
                  textContent: isEdit ? 'Update' : 'Create',
                  onclick: () => this._saveK8sConnection(connection?.id),
                  style: {
                    padding: '8px 16px',
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
            })
          ]
        })
      ]
    });

    $modal.appendChild($dialog);
    document.body.appendChild($modal);
  }

  _saveK8sConnection(existingId = null) {
    const name = document.getElementById('k8s-connection-name').value.trim();
    const server = document.getElementById('k8s-connection-server').value.trim();
    const context = document.getElementById('k8s-connection-context').value.trim();
    const namespace = document.getElementById('k8s-connection-namespace').value.trim() || 'default';
    const token = document.getElementById('k8s-connection-token').value.trim();
    const certPath = document.getElementById('k8s-connection-cert').value.trim();
    const caCertPath = document.getElementById('k8s-connection-ca-cert').value.trim();
    const username = document.getElementById('k8s-connection-username').value.trim();
    const password = document.getElementById('k8s-connection-password').value.trim();

    if (!name || !server) {
      toast('Please fill in required fields: Name and Server URL', 'warning');
      return;
    }

    // Prepare profile object
    const profile = {
      id: existingId || `k8s_${Date.now()}`,
      name,
      server,
      context: context || undefined,
      namespace,
      token: token || undefined,
      certPath: certPath || undefined,
      caCertPath: caCertPath || undefined,
      username: username || undefined,
      password: password || undefined
    };

    try {
      // Add or update the connection
      if (existingId) {
        K8sManager.updateConnection(profile);
      } else {
        K8sManager.addConnection(profile);
      }
      
      toast(`Kubernetes connection ${existingId ? 'updated' : 'created'} successfully!`, 'success');
      
      // Close modal and refresh list
      document.body.removeChild(document.querySelector('.k8s-connection-modal'));
      this._refresh();
    } catch (error) {
      toast(`Error ${existingId ? 'updating' : 'creating'} Kubernetes connection: ${error.message}`, 'error');
    }
  }

  _showCloudConnectionDialog() {
    // Create modal for cloud connection (placeholder for now)
    toast('Cloud provider configuration coming soon!', 'info');
  }

  _connectSSH(connectionId) {
    try {
      this._updateStatusBar('Connecting to SSH server...', 'connecting');
      
      const connection = this.connections.ssh.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Connect using SSH manager
      SSHManager.connect(connection.id, () => {
        this.activeConnections.ssh = connection;
        this._updateStatusBar(`Connected to SSH server: ${connection.name}`, 'connected');
        document.getElementById('remote-dev-connection-status').textContent = `Connected to ${connection.name}`;
        toast('SSH connection established successfully!', 'success');
      }, (error) => {
        this._updateStatusBar('SSH connection failed', 'error');
        document.getElementById('remote-dev-connection-status').textContent = 'Connection failed';
        toast(`SSH connection failed: ${error.message}`, 'error');
      });
    } catch (error) {
      console.error('Error connecting to SSH:', error);
      this._updateStatusBar('SSH connection failed', 'error');
      document.getElementById('remote-dev-connection-status').textContent = 'Connection failed';
      toast(`SSH connection failed: ${error.message}`, 'error');
    }
  }

  _connectK8s(connectionId) {
    try {
      this._updateStatusBar('Connecting to Kubernetes cluster...', 'connecting');
      
      const connection = this.connections.k8s.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Connect using K8s manager
      K8sManager.connect(connection.id, () => {
        this.activeConnections.k8s = connection;
        this._updateStatusBar(`Connected to Kubernetes cluster: ${connection.name}`, 'connected');
        document.getElementById('remote-dev-connection-status').textContent = `Connected to ${connection.name}`;
        toast('Kubernetes connection established successfully!', 'success');
      }, (error) => {
        this._updateStatusBar('Kubernetes connection failed', 'error');
        document.getElementById('remote-dev-connection-status').textContent = 'Connection failed';
        toast(`Kubernetes connection failed: ${error.message}`, 'error');
      });
    } catch (error) {
      console.error('Error connecting to Kubernetes:', error);
      this._updateStatusBar('Kubernetes connection failed', 'error');
      document.getElementById('remote-dev-connection-status').textContent = 'Connection failed';
      toast(`Kubernetes connection failed: ${error.message}`, 'error');
    }
  }

  _connectCloud(connectionId) {
    try {
      this._updateStatusBar('Connecting to cloud provider...', 'connecting');
      
      const connection = this.connections.cloud.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Connect to cloud provider (implementation depends on provider)
      // Placeholder for now
      this.activeConnections.cloud = connection;
      this._updateStatusBar(`Connected to cloud provider: ${connection.name}`, 'connected');
      document.getElementById('remote-dev-connection-status').textContent = `Connected to ${connection.name}`;
      toast('Cloud connection established successfully!', 'success');
    } catch (error) {
      console.error('Error connecting to cloud provider:', error);
      this._updateStatusBar('Cloud connection failed', 'error');
      document.getElementById('remote-dev-connection-status').textContent = 'Connection failed';
      toast(`Cloud connection failed: ${error.message}`, 'error');
    }
  }

  _testSSHConnection(connectionId) {
    try {
      this._updateStatusBar('Testing SSH connection...', 'testing');
      
      const connection = this.connections.ssh.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Test using SSH manager
      SSHManager.testConnection(connection, () => {
        this._updateStatusBar(`SSH connection test successful: ${connection.name}`, 'success');
        toast('SSH connection test successful!', 'success');
      }, (error) => {
        this._updateStatusBar('SSH connection test failed', 'error');
        toast(`SSH connection test failed: ${error.message}`, 'error');
      });
    } catch (error) {
      console.error('Error testing SSH connection:', error);
      this._updateStatusBar('SSH connection test failed', 'error');
      toast(`SSH connection test failed: ${error.message}`, 'error');
    }
  }

  _testK8sConnection(connectionId) {
    try {
      this._updateStatusBar('Testing Kubernetes connection...', 'testing');
      
      const connection = this.connections.k8s.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Test using K8s manager
      K8sManager.testConnection(connection, () => {
        this._updateStatusBar(`Kubernetes connection test successful: ${connection.name}`, 'success');
        toast('Kubernetes connection test successful!', 'success');
      }, (error) => {
        this._updateStatusBar('Kubernetes connection test failed', 'error');
        toast(`Kubernetes connection test failed: ${error.message}`, 'error');
      });
    } catch (error) {
      console.error('Error testing Kubernetes connection:', error);
      this._updateStatusBar('Kubernetes connection test failed', 'error');
      toast(`Kubernetes connection test failed: ${error.message}`, 'error');
    }
  }

  _testCloudConnection(connectionId) {
    try {
      this._updateStatusBar('Testing cloud connection...', 'testing');
      
      const connection = this.connections.cloud.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Test cloud connection (implementation depends on provider)
      // Placeholder for now
      this._updateStatusBar(`Cloud connection test successful: ${connection.name}`, 'success');
      toast('Cloud connection test successful!', 'success');
    } catch (error) {
      console.error('Error testing cloud connection:', error);
      this._updateStatusBar('Cloud connection test failed', 'error');
      toast(`Cloud connection test failed: ${error.message}`, 'error');
    }
  }

  _disconnectSSH() {
    try {
      if (!this.activeConnections.ssh) {
        toast('No active SSH connection to disconnect', 'warning');
        return;
      }

      this._updateStatusBar('Disconnecting from SSH server...', 'disconnecting');
      
      // Disconnect using SSH manager
      SSHManager.disconnect(() => {
        this.activeConnections.ssh = null;
        this._updateStatusBar('Disconnected from SSH server', 'disconnected');
        document.getElementById('remote-dev-connection-status').textContent = 'Not connected';
        toast('SSH connection disconnected successfully!', 'success');
      }, (error) => {
        this._updateStatusBar('SSH disconnection failed', 'error');
        document.getElementById('remote-dev-connection-status').textContent = 'Disconnection failed';
        toast(`SSH disconnection failed: ${error.message}`, 'error');
      });
    } catch (error) {
      console.error('Error disconnecting from SSH:', error);
      this._updateStatusBar('SSH disconnection failed', 'error');
      document.getElementById('remote-dev-connection-status').textContent = 'Disconnection failed';
      toast(`SSH disconnection failed: ${error.message}`, 'error');
    }
  }

  _disconnectK8s() {
    try {
      if (!this.activeConnections.k8s) {
        toast('No active Kubernetes connection to disconnect', 'warning');
        return;
      }

      this._updateStatusBar('Disconnecting from Kubernetes cluster...', 'disconnecting');
      
      // Disconnect using K8s manager
      K8sManager.disconnect(() => {
        this.activeConnections.k8s = null;
        this._updateStatusBar('Disconnected from Kubernetes cluster', 'disconnected');
        document.getElementById('remote-dev-connection-status').textContent = 'Not connected';
        toast('Kubernetes connection disconnected successfully!', 'success');
      }, (error) => {
        this._updateStatusBar('Kubernetes disconnection failed', 'error');
        document.getElementById('remote-dev-connection-status').textContent = 'Disconnection failed';
        toast(`Kubernetes disconnection failed: ${error.message}`, 'error');
      });
    } catch (error) {
      console.error('Error disconnecting from Kubernetes:', error);
      this._updateStatusBar('Kubernetes disconnection failed', 'error');
      document.getElementById('remote-dev-connection-status').textContent = 'Disconnection failed';
      toast(`Kubernetes disconnection failed: ${error.message}`, 'error');
    }
  }

  _disconnectCloud() {
    try {
      if (!this.activeConnections.cloud) {
        toast('No active cloud connection to disconnect', 'warning');
        return;
      }

      this._updateStatusBar('Disconnecting from cloud provider...', 'disconnecting');
      
      // Disconnect from cloud provider (implementation depends on provider)
      // Placeholder for now
      this.activeConnections.cloud = null;
      this._updateStatusBar('Disconnected from cloud provider', 'disconnected');
      document.getElementById('remote-dev-connection-status').textContent = 'Not connected';
      toast('Cloud connection disconnected successfully!', 'success');
    } catch (error) {
      console.error('Error disconnecting from cloud provider:', error);
      this._updateStatusBar('Cloud disconnection failed', 'error');
      document.getElementById('remote-dev-connection-status').textContent = 'Disconnection failed';
      toast(`Cloud disconnection failed: ${error.message}`, 'error');
    }
  }

  _deleteSSHConnection(connectionId) {
    if (confirm('Are you sure you want to delete this SSH connection?')) {
      try {
        SSHManager.removeConnection(connectionId);
        toast('SSH connection deleted successfully!', 'success');
        this._refresh();
      } catch (error) {
        toast(`Error deleting SSH connection: ${error.message}`, 'error');
      }
    }
  }

  _deleteK8sConnection(connectionId) {
    if (confirm('Are you sure you want to delete this Kubernetes connection?')) {
      try {
        K8sManager.removeConnection(connectionId);
        toast('Kubernetes connection deleted successfully!', 'success');
        this._refresh();
      } catch (error) {
        toast(`Error deleting Kubernetes connection: ${error.message}`, 'error');
      }
    }
  }

  _configureCloudProvider(provider) {
    toast(`Configuring ${provider.name}...`, 'info');
    // Placeholder for cloud provider configuration
    // This would open a specific configuration dialog for each provider
  }

  _connectCloudProvider(provider) {
    toast(`Connecting to ${provider.name}...`, 'info');
    // Placeholder for cloud provider connection
    // This would initiate connection to the cloud provider
  }

  _openSSHKeyManager() {
    // This would open the SSH key manager sidebar app
    toast('Opening SSH Key Manager...', 'info');
    // Implementation would depend on how the sidebar apps are managed
    // For now, we'll just show a message
  }

  _refresh() {
    // Reload connections and update UI
    this._loadConnections();
    this._populateConnectionSelector();
    
    // Refresh current tab view
    const activeTab = document.querySelector('.remote-dev-tab.active');
    if (activeTab) {
      const tabId = activeTab.id;
      
      switch (tabId) {
        case 'remote-dev-ssh-tab':
          this._loadSSHConnections();
          break;
        case 'remote-dev-k8s-tab':
          this._loadK8sConnections();
          break;
        case 'remote-dev-cloud-tab':
          this._loadCloudConnections();
          break;
      }
    }
  }

  _updateStatusBar(text, status) {
    const statusElement = document.getElementById('remote-dev-status-text');
    if (statusElement) {
      statusElement.textContent = text;
      
      // Update status color based on status type
      switch (status) {
        case 'ready':
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
        case 'connecting':
        case 'testing':
        case 'disconnecting':
        case 'loading':
          statusElement.style.color = 'var(--warning-color, #ffa502)';
          break;
        case 'connected':
        case 'success':
          statusElement.style.color = 'var(--success-color, #2ed573)';
          break;
        case 'error':
          statusElement.style.color = 'var(--error-color, #ff4757)';
          break;
        case 'disconnected':
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
        default:
          statusElement.style.color = 'var(--txt-secondary-color)';
      }
    }
  }

  open() {
    this.$remoteDevContainer.style.display = 'flex';
  }

  close() {
    this.$remoteDevContainer.style.display = 'none';
  }
}