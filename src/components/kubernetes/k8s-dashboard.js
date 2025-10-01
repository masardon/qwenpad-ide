/**
 * Kubernetes Dashboard for QwenPad IDE
 * Unified interface for Kubernetes operations
 */

import K8sCommandExecutor from './k8s-command-executor';
import K8sResourceViewer from './k8s-resource-viewer';
import K8sManager from '../../plugins/k8s-manager/www/k8smanager';
import toast from '../components/toast';

export default class K8sDashboard {
  constructor(container) {
    this.container = container;
    this.currentView = 'dashboard'; // dashboard, executor, viewer
    
    this._initialize();
  }

  _initialize() {
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$dashboardContainer = tag('div', {
      className: 'k8s-dashboard-container',
      style: {
        display: 'flex',
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
      className: 'k8s-dashboard-header',
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
              className: 'icon dashboard', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Kubernetes Dashboard',
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

    // Navigation tabs
    this.$tabs = tag('div', {
      className: 'k8s-dashboard-tabs',
      style: {
        display: 'flex',
        borderBottom: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--tab-bg, #f8f9fa)'
      },
      children: [
        tag('button', {
          id: 'k8s-dashboard-tab',
          textContent: 'Dashboard',
          className: 'k8s-tab active',
          onclick: () => this._switchTab('dashboard'),
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
          id: 'k8s-executor-tab',
          textContent: 'Command Executor',
          className: 'k8s-tab',
          onclick: () => this._switchTab('executor'),
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
          id: 'k8s-viewer-tab',
          textContent: 'Resource Viewer',
          className: 'k8s-tab',
          onclick: () => this._switchTab('viewer'),
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

    // Main content area
    this.$contentArea = tag('div', {
      className: 'k8s-dashboard-content',
      style: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }
    });

    // Dashboard view
    this.$dashboardView = tag('div', {
      id: 'k8s-dashboard-view',
      className: 'k8s-view active',
      style: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    });

    // Command executor view
    this.$executorView = tag('div', {
      id: 'k8s-executor-view',
      className: 'k8s-view',
      style: {
        height: '100%',
        display: 'none'
      }
    });

    // Resource viewer view
    this.$viewerView = tag('div', {
      id: 'k8s-viewer-view',
      className: 'k8s-view',
      style: {
        height: '100%',
        display: 'none'
      }
    });

    // Assemble the UI
    this.$contentArea.appendChild(this.$dashboardView);
    this.$contentArea.appendChild(this.$executorView);
    this.$contentArea.appendChild(this.$viewerView);
    
    this.$dashboardContainer.appendChild(this.$header);
    this.$dashboardContainer.appendChild(this.$tabs);
    this.$dashboardContainer.appendChild(this.$contentArea);

    // Add to container
    this.container.appendChild(this.$dashboardContainer);

    // Initialize views
    this._initDashboardView();
    this._initExecutorView();
    this._initViewerView();
    
    // Load initial dashboard data
    this._loadDashboardData();
  }

  _initDashboardView() {
    // Dashboard header
    const $dashboardHeader = tag('div', {
      style: {
        padding: '16px',
        borderBottom: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--header-bg, #f8f9fa)'
      },
      children: [
        tag('h2', {
          textContent: 'Kubernetes Dashboard',
          style: {
            margin: '0 0 16px 0',
            fontSize: '1.5em'
          }
        }),
        tag('div', {
          style: {
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          },
          children: [
            tag('button', {
              textContent: 'Refresh Dashboard',
              onclick: () => this._loadDashboardData(),
              style: {
                padding: '8px 16px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }
            }),
            tag('button', {
              textContent: 'Open Command Executor',
              onclick: () => this._switchTab('executor'),
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
              textContent: 'Open Resource Viewer',
              onclick: () => this._switchTab('viewer'),
              style: {
                padding: '8px 16px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }
            })
          ]
        })
      ]
    });

    // Dashboard content
    const $dashboardContent = tag('div', {
      id: 'k8s-dashboard-content',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }
    });

    this.$dashboardView.appendChild($dashboardHeader);
    this.$dashboardView.appendChild($dashboardContent);
  }

  _initExecutorView() {
    // Create command executor
    this.commandExecutor = new K8sCommandExecutor(this.$executorView);
  }

  _initViewerView() {
    // Create resource viewer
    this.resourceViewer = new K8sResourceViewer(this.$viewerView);
  }

  async _loadDashboardData() {
    const $content = document.getElementById('k8s-dashboard-content');
    if (!$content) return;

    try {
      $content.innerHTML = `
        <div style="text-align: center; padding: 32px;">
          <div class="spinner" style="margin: 0 auto 16px auto; width: 32px; height: 32px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <div>Loading Kubernetes dashboard data...</div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      // Get connections
      const connections = K8sManager.getConnections();
      
      if (connections.length === 0) {
        $content.innerHTML = `
          <div style="text-align: center; padding: 32px; color: var(--txt-secondary-color);">
            <div class="icon router" style="font-size: 3em; margin-bottom: 16px;">&#xE871;</div>
            <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 8px;">No Kubernetes clusters configured</div>
            <div style="margin-bottom: 16px;">Please configure your Kubernetes connections</div>
            <button onclick="window.openK8sManager()" style="
              padding: 8px 16px;
              border: 1px solid var(--primary-color);
              border-radius: 4px;
              background-color: var(--primary-color);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">Configure Clusters</button>
          </div>
        `;
        return;
      }

      // Create dashboard layout
      const $layout = tag('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }
      });

      // Add quick stats cards
      const statsCards = [
        { title: 'Clusters', value: connections.length, icon: 'router', color: '#007bff' },
        { title: 'Pods', value: '0', icon: 'view_module', color: '#28a745' },
        { title: 'Services', value: '0', icon: 'dns', color: '#dc3545' },
        { title: 'Deployments', value: '0', icon: 'apps', color: '#ffc107' }
      ];

      statsCards.forEach(card => {
        const $card = tag('div', {
          style: {
            border: '1px solid var(--bdr-color)',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'var(--bg-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          },
          children: [
            tag('div', {
              style: {
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: `${card.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                fontSize: '1.5em'
              },
              children: [
                tag('span', { className: `icon ${card.icon}` })
              ]
            }),
            tag('div', {
              style: { flex: 1 },
              children: [
                tag('div', {
                  textContent: card.title,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)',
                    marginBottom: '4px'
                  }
                }),
                tag('div', {
                  textContent: card.value,
                  style: {
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    color: card.color
                  }
                })
              ]
            })
          ]
        });
        $layout.appendChild($card);
      });

      // Add connections list
      const $connectionsSection = tag('div', {
        style: {
          marginTop: '24px'
        },
        children: [
          tag('h3', {
            textContent: 'Configured Clusters',
            style: {
              margin: '0 0 16px 0',
              fontSize: '1.2em'
            }
          }),
          tag('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }
          })
        ]
      });

      connections.forEach(connection => {
        const $connectionItem = tag('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-color)'
          },
          children: [
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
                  textContent: connection.server,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)'
                  }
                })
              ]
            }),
            tag('div', {
              style: {
                display: 'flex',
                gap: '8px'
              },
              children: [
                tag('button', {
                  textContent: 'Connect',
                  onclick: () => this._connectToCluster(connection),
                  style: {
                    padding: '6px 12px',
                    border: '1px solid var(--primary-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }
                }),
                tag('button', {
                  textContent: 'View',
                  onclick: () => this._viewCluster(connection),
                  style: {
                    padding: '6px 12px',
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
        
        $connectionsSection.lastChild.appendChild($connectionItem);
      });

      // Assemble dashboard content
      $content.innerHTML = '';
      $content.appendChild($layout);
      $content.appendChild($connectionsSection);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      $content.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--error-color, #ff4757);">
          <div class="icon error" style="font-size: 3em; margin-bottom: 16px;">&#xE000;</div>
          <div style="font-weight: bold; margin-bottom: 8px;">Failed to load dashboard</div>
          <div style="font-size: 0.9em;">${error.message}</div>
        </div>
      `;
    }
  }

  _switchTab(viewName) {
    // Update tab styling
    document.querySelectorAll('.k8s-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.style.color = 'var(--txt-secondary-color)';
      tab.style.borderBottom = 'none';
    });
    
    // Update active tab
    const activeTab = document.getElementById(`k8s-${viewName}-tab`);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.style.color = 'var(--txt-color)';
      activeTab.style.borderBottom = '2px solid var(--primary-color)';
    }
    
    // Update view visibility
    document.querySelectorAll('.k8s-view').forEach(view => {
      view.style.display = 'none';
    });
    
    const activeView = document.getElementById(`k8s-${viewName}-view`);
    if (activeView) {
      activeView.style.display = 'flex';
    }
    
    this.currentView = viewName;
    
    // Initialize views on first access
    if (viewName === 'executor' && !this.commandExecutorInitialized) {
      this.commandExecutor.open();
      this.commandExecutorInitialized = true;
    } else if (viewName === 'viewer' && !this.resourceViewerInitialized) {
      this.resourceViewer.open();
      this.resourceViewerInitialized = true;
    }
  }

  _connectToCluster(connection) {
    // This would establish a connection to the cluster
    toast(`Connecting to ${connection.name}...`, 'info');
    
    // For now, just switch to the executor view
    this._switchTab('executor');
    
    // If we have a command executor, select this connection
    if (this.commandExecutor) {
      const select = document.getElementById('k8s-connection-select');
      if (select) {
        select.value = connection.id;
        this.commandExecutor._selectConnection(connection.id);
      }
    }
  }

  _viewCluster(connection) {
    // This would show the cluster in the resource viewer
    toast(`Viewing resources for ${connection.name}...`, 'info');
    
    // Switch to the viewer view
    this._switchTab('viewer');
    
    // If we have a resource viewer, select this connection
    if (this.resourceViewer) {
      const select = document.getElementById('k8s-connection-select');
      if (select) {
        select.value = connection.id;
        this.resourceViewer._selectConnection(connection.id);
      }
    }
  }

  open() {
    this.$dashboardContainer.style.display = 'flex';
  }

  close() {
    this.$dashboardContainer.style.display = 'none';
  }
}