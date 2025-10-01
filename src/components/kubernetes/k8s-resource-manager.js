/**
 * Enhanced Kubernetes Resource Manager UI for QwenPad IDE
 * Provides advanced UI for managing Kubernetes resources
 */

import K8sManager from '../../plugins/k8s-manager/www/k8smanager';
import toast from '../components/toast';

export default class K8sResourceManager {
  constructor(container) {
    this.container = container;
    this.manager = new K8sManager();
    this.connections = [];
    this.currentConnection = null;
    this.currentNamespace = 'default';
    this.currentResourceType = 'pods';
    this.resources = [];
    
    this._initialize();
  }

  _initialize() {
    // Load connections
    this.connections = this.manager.getConnections();
    
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$k8sContainer = tag('div', {
      className: 'k8s-resource-manager-container',
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
      className: 'k8s-resource-manager-header',
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
              className: 'icon kubernetes', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Kubernetes Resource Manager',
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
            fontWeight: 'bold',
            fontSize: '0.9em'
          }
        })
      ]
    });

    // Namespace and resource selector
    this.$resourceSelector = tag('div', {
      className: 'k8s-resource-selector',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      },
      children: [
        tag('span', {
          textContent: 'Namespace:',
          style: { fontWeight: 'bold' }
        }),
        tag('select', {
          id: 'k8s-namespace-select',
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onchange: (e) => this._selectNamespace(e.target.value)
        }),
        tag('span', {
          textContent: 'Resource:',
          style: { fontWeight: 'bold', marginLeft: '16px' }
        }),
        tag('select', {
          id: 'k8s-resource-type-select',
          style: {
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onchange: (e) => this._selectResourceType(e.target.value),
          children: [
            tag('option', { value: 'pods', textContent: 'Pods' }),
            tag('option', { value: 'services', textContent: 'Services' }),
            tag('option', { value: 'deployments', textContent: 'Deployments' }),
            tag('option', { value: 'statefulsets', textContent: 'StatefulSets' }),
            tag('option', { value: 'daemonsets', textContent: 'DaemonSets' }),
            tag('option', { value: 'jobs', textContent: 'Jobs' }),
            tag('option', { value: 'cronjobs', textContent: 'CronJobs' }),
            tag('option', { value: 'configmaps', textContent: 'ConfigMaps' }),
            tag('option', { value: 'secrets', textContent: 'Secrets' }),
            tag('option', { value: 'pv', textContent: 'PersistentVolumes' }),
            tag('option', { value: 'pvc', textContent: 'PersistentVolumeClaims' }),
            tag('option', { value: 'nodes', textContent: 'Nodes' }),
            tag('option', { value: 'namespaces', textContent: 'Namespaces' }),
            tag('option', { value: 'events', textContent: 'Events' }),
            tag('option', { value: 'ingresses', textContent: 'Ingresses' }),
            tag('option', { value: 'servicesaccounts', textContent: 'ServiceAccounts' })
          ]
        })
      ]
    });

    // Action buttons
    this.$actions = tag('div', {
      className: 'k8s-actions',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      },
      children: [
        tag('button', {
          textContent: 'Refresh',
          onclick: () => this._refreshResources(),
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
          textContent: 'Create',
          onclick: () => this._createResource(),
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
          textContent: 'Scale',
          onclick: () => this._scaleResource(),
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
          textContent: 'Describe',
          onclick: () => this._describeResource(),
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
          textContent: 'Logs',
          onclick: () => this._viewLogs(),
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
          textContent: 'Exec',
          onclick: () => this._execInResource(),
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
          onclick: () => this._deleteResource(),
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
    });

    // Resource list
    this.$resourceList = tag('div', {
      className: 'k8s-resource-list',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }
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
          id: 'k8s-resource-count',
          textContent: '0 resources'
        })
      ]
    });

    // Assemble the UI
    this.$k8sContainer.appendChild(this.$header);
    this.$k8sContainer.appendChild(this.$connectionSelector);
    this.$k8sContainer.appendChild(this.$resourceSelector);
    this.$k8sContainer.appendChild(this.$actions);
    this.$k8sContainer.appendChild(this.$resourceList);
    this.$k8sContainer.appendChild(this.$statusBar);

    // Add to container
    this.container.appendChild(this.$k8sContainer);

    // Populate selectors
    this._populateConnectionSelector();
    this._populateNamespaceSelector();

    // Render initial resource list
    this._renderResourceList();
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

  _populateNamespaceSelector() {
    const select = document.getElementById('k8s-namespace-select');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="default">default</option>';

    // Common namespaces
    const commonNamespaces = ['kube-system', 'kube-public', 'kube-node-lease', 'all'];
    commonNamespaces.forEach(ns => {
      const option = tag('option', {
        value: ns,
        textContent: ns
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
    }
  }

  _selectNamespace(namespace) {
    this.currentNamespace = namespace;
    this._refreshResources();
  }

  _selectResourceType(resourceType) {
    this.currentResourceType = resourceType;
    this._refreshResources();
  }

  async _connect() {
    if (!this.currentConnection) {
      toast('Please select a cluster first', 'warning');
      return;
    }

    try {
      this._updateStatusBar('Connecting to cluster...', 'connecting');
      
      // Test the connection
      await this.manager.testConnection(this.currentConnection);
      
      // Get namespaces
      await this._refreshNamespaces();
      
      this._updateStatusBar(`Connected to ${this.currentConnection.name}`, 'connected');
      toast('Connection established successfully!', 'success');
      
      // Refresh resources
      this._refreshResources();
    } catch (error) {
      console.error('Connection error:', error);
      this._updateStatusBar('Connection failed', 'error');
      toast(`Connection failed: ${error.message}`, 'error');
    }
  }

  async _refreshNamespaces() {
    if (!this.currentConnection) return;

    try {
      const namespaces = await this.manager.getNamespaces(this.currentConnection.id);
      
      const select = document.getElementById('k8s-namespace-select');
      if (select) {
        // Clear existing options (except default)
        select.innerHTML = '<option value="default">default</option>';
        
        // Add namespaces
        namespaces.forEach(ns => {
          if (ns.name !== 'default') {
            const option = tag('option', {
              value: ns.name,
              textContent: ns.name
            });
            select.appendChild(option);
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing namespaces:', error);
      // Continue with default namespace
    }
  }

  async _refreshResources() {
    if (!this.currentConnection) {
      this._updateStatusBar('Please select and connect to a cluster first', 'warning');
      return;
    }

    try {
      this._updateStatusBar('Loading resources...', 'loading');
      this._renderLoadingState();

      let resources = [];
      
      switch (this.currentResourceType) {
        case 'pods':
          resources = await this.manager.getPods(this.currentConnection.id, this.currentNamespace);
          break;
        case 'services':
          resources = await this.manager.getServices(this.currentConnection.id, this.currentNamespace);
          break;
        case 'deployments':
          resources = await this.manager.getDeployments(this.currentConnection.id, this.currentNamespace);
          break;
        case 'statefulsets':
          resources = await this.manager.getStatefulSets(this.currentConnection.id, this.currentNamespace);
          break;
        case 'daemonsets':
          resources = await this.manager.getDaemonSets(this.currentConnection.id, this.currentNamespace);
          break;
        case 'jobs':
          resources = await this.manager.getJobs(this.currentConnection.id, this.currentNamespace);
          break;
        case 'cronjobs':
          resources = await this.manager.getCronJobs(this.currentConnection.id, this.currentNamespace);
          break;
        case 'configmaps':
          resources = await this.manager.getConfigMaps(this.currentConnection.id, this.currentNamespace);
          break;
        case 'secrets':
          resources = await this.manager.getSecrets(this.currentConnection.id, this.currentNamespace);
          break;
        case 'pv':
          resources = await this.manager.getPersistentVolumes(this.currentConnection.id);
          break;
        case 'pvc':
          resources = await this.manager.getPersistentVolumeClaims(this.currentConnection.id, this.currentNamespace);
          break;
        case 'nodes':
          resources = await this.manager.getNodes(this.currentConnection.id);
          break;
        case 'namespaces':
          resources = await this.manager.getNamespaces(this.currentConnection.id);
          break;
        case 'events':
          resources = await this.manager.getClusterEvents(this.currentConnection.id);
          break;
        case 'ingresses':
          resources = await this.manager.getIngresses(this.currentConnection.id, this.currentNamespace);
          break;
        case 'servicesaccounts':
          resources = await this.manager.getServiceAccounts(this.currentConnection.id, this.currentNamespace);
          break;
        default:
          resources = await this.manager.getAllResources(this.currentConnection.id, this.currentNamespace);
      }

      this.resources = resources.items || resources;
      this._renderResourceList();
      this._updateStatusBar(`Loaded ${this.resources.length} ${this.currentResourceType}`, 'success');
      document.getElementById('k8s-resource-count').textContent = `${this.resources.length} resources`;
    } catch (error) {
      console.error('Error loading resources:', error);
      this._updateStatusBar(`Failed to load resources: ${error.message}`, 'error');
      this._renderErrorState(error.message);
    }
  }

  _renderLoadingState() {
    this.$resourceList.innerHTML = `
      <div style="text-align: center; padding: 32px; color: var(--txt-secondary-color);">
        <div class="spinner" style="margin: 0 auto 16px auto; width: 32px; height: 32px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div>Loading ${this.currentResourceType}...</div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  _renderErrorState(errorMessage) {
    this.$resourceList.innerHTML = `
      <div style="text-align: center; padding: 32px; color: var(--error-color, #ff4757);">
        <div class="icon error" style="font-size: 3em; margin-bottom: 16px;">&#xE000;</div>
        <div style="font-weight: bold; margin-bottom: 8px;">Failed to load resources</div>
        <div style="font-size: 0.9em;">${errorMessage}</div>
      </div>
    `;
  }

  _renderResourceList() {
    this.$resourceList.innerHTML = '';

    if (!this.resources || this.resources.length === 0) {
      this.$resourceList.appendChild(
        tag('div', {
          style: {
            textAlign: 'center',
            padding: '32px',
            color: 'var(--txt-secondary-color)'
          },
          children: [
            tag('div', {
              className: 'icon kubernetes',
              style: {
                fontSize: '3em',
                marginBottom: '16px',
                color: 'var(--txt-secondary-color)'
              }
            }),
            tag('div', {
              textContent: `No ${this.currentResourceType} found`,
              style: {
                fontWeight: 'bold',
                marginBottom: '8px'
              }
            }),
            tag('div', {
              textContent: `Try selecting a different namespace or resource type`,
              style: {
                fontSize: '0.9em'
              }
            })
          ]
        })
      );
      return;
    }

    // Determine columns based on resource type
    const columns = this._getResourceColumns(this.currentResourceType);
    
    // Create table
    const $table = tag('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9em'
      }
    });

    // Table header
    const $thead = tag('thead', {
      style: {
        backgroundColor: 'var(--header-bg, #f8f9fa)',
        position: 'sticky',
        top: 0
      }
    });
    
    const $headerRow = tag('tr');
    columns.forEach(column => {
      const $th = tag('th', {
        textContent: column.title,
        style: {
          padding: '8px 12px',
          borderBottom: '2px solid var(--bdr-color)',
          textAlign: 'left',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }
      });
      
      if (column.width) {
        $th.style.width = column.width;
      }
      
      $headerRow.appendChild($th);
    });
    
    $thead.appendChild($headerRow);
    $table.appendChild($thead);

    // Table body
    const $tbody = tag('tbody');
    
    this.resources.forEach(resource => {
      const $row = tag('tr', {
        style: {
          borderBottom: '1px solid var(--bdr-color)',
          cursor: 'pointer'
        },
        onmouseover: function() {
          this.style.backgroundColor = 'var(--hover-bg, #f8f9fa)';
        },
        onmouseout: function() {
          this.style.backgroundColor = '';
        },
        onclick: () => this._showResourceDetails(resource)
      });
      
      columns.forEach(column => {
        const value = this._getResourceValue(resource, column.field);
        const $td = tag('td', {
          textContent: value,
          style: {
            padding: '8px 12px',
            verticalAlign: 'top'
          }
        });
        
        if (column.truncate) {
          $td.style.whiteSpace = 'nowrap';
          $td.style.overflow = 'hidden';
          $td.style.textOverflow = 'ellipsis';
          $td.title = value;
        }
        
        if (column.align) {
          $td.style.textAlign = column.align;
        }
        
        $row.appendChild($td);
      });
      
      $tbody.appendChild($row);
    });
    
    $table.appendChild($tbody);
    this.$resourceList.appendChild($table);
  }

  _getResourceColumns(resourceType) {
    switch (resourceType) {
      case 'pods':
        return [
          { title: 'Name', field: 'metadata.name', truncate: true },
          { title: 'Namespace', field: 'metadata.namespace', width: '120px' },
          { title: 'Status', field: 'status.phase', width: '100px' },
          { title: 'Restarts', field: 'status.containerStatuses.0.restartCount', width: '80px', align: 'center' },
          { title: 'Age', field: 'metadata.creationTimestamp', width: '100px' },
          { title: 'Node', field: 'spec.nodeName', truncate: true, width: '150px' }
        ];
      case 'services':
        return [
          { title: 'Name', field: 'metadata.name', truncate: true },
          { title: 'Namespace', field: 'metadata.namespace', width: '120px' },
          { title: 'Type', field: 'spec.type', width: '100px' },
          { title: 'Cluster IP', field: 'spec.clusterIP', width: '120px' },
          { title: 'Ports', field: 'spec.ports', width: '150px' },
          { title: 'Age', field: 'metadata.creationTimestamp', width: '100px' }
        ];
      case 'deployments':
        return [
          { title: 'Name', field: 'metadata.name', truncate: true },
          { title: 'Namespace', field: 'metadata.namespace', width: '120px' },
          { title: 'Ready', field: 'status.readyReplicas', width: '80px', align: 'center' },
          { title: 'Up-to-date', field: 'status.updatedReplicas', width: '100px', align: 'center' },
          { title: 'Available', field: 'status.availableReplicas', width: '100px', align: 'center' },
          { title: 'Age', field: 'metadata.creationTimestamp', width: '100px' }
        ];
      case 'nodes':
        return [
          { title: 'Name', field: 'metadata.name', truncate: true },
          { title: 'Status', field: 'status.conditions', width: '100px' },
          { title: 'Roles', field: 'metadata.labels', width: '120px' },
          { title: 'Age', field: 'metadata.creationTimestamp', width: '100px' },
          { title: 'Version', field: 'status.nodeInfo.kubeletVersion', width: '150px' },
          { title: 'OS/Arch', field: 'status.nodeInfo.osImage', width: '150px' }
        ];
      case 'namespaces':
        return [
          { title: 'Name', field: 'metadata.name', truncate: true },
          { title: 'Status', field: 'status.phase', width: '100px' },
          { title: 'Age', field: 'metadata.creationTimestamp', width: '100px' }
        ];
      case 'events':
        return [
          { title: 'Type', field: 'type', width: '80px' },
          { title: 'Reason', field: 'reason', width: '120px' },
          { title: 'Object', field: 'involvedObject.name', truncate: true, width: '150px' },
          { title: 'Message', field: 'message', truncate: true },
          { title: 'Age', field: 'firstTimestamp', width: '100px' }
        ];
      default:
        return [
          { title: 'Name', field: 'metadata.name', truncate: true },
          { title: 'Namespace', field: 'metadata.namespace', width: '150px' },
          { title: 'Age', field: 'metadata.creationTimestamp', width: '150px' }
        ];
    }
  }

  _getResourceValue(resource, fieldPath) {
    if (!resource || !fieldPath) return '-';
    
    // Handle nested field paths
    const parts = fieldPath.split('.');
    let value = resource;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else if (Array.isArray(value) && part === '0') {
        value = value[0];
      } else if (Array.isArray(value) && part in value[0]) {
        // Handle array access patterns
        value = value.map(item => item[part]).join(', ');
        break;
      } else {
        value = undefined;
        break;
      }
    }
    
    // Handle special formatting
    if (fieldPath === 'metadata.creationTimestamp' && value) {
      return this._formatAge(value);
    } else if (fieldPath === 'spec.ports' && Array.isArray(value)) {
      return value.map(port => `${port.port}/${port.protocol}`).join(', ');
    } else if (fieldPath === 'status.conditions' && Array.isArray(value)) {
      const readyCondition = value.find(cond => cond.type === 'Ready');
      return readyCondition && readyCondition.status === 'True' ? 'Ready' : 'NotReady';
    } else if (fieldPath === 'metadata.labels' && value) {
      // Extract roles from labels
      const roleLabels = Object.keys(value).filter(key => 
        key.startsWith('node-role.kubernetes.io/') || 
        key.startsWith('kubernetes.io/role=')
      );
      return roleLabels.map(label => label.split('/')[1] || label.split('=')[1] || 'node').join(', ');
    } else if (fieldPath === 'status.readyReplicas' && value !== undefined) {
      const total = resource.status.replicas || 0;
      return `${value}/${total}`;
    }
    
    return value !== undefined ? String(value) : '-';
  }

  _formatAge(timestamp) {
    if (!timestamp) return '-';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`;
    } else {
      return '<1m';
    }
  }

  _showResourceDetails(resource) {
    // This would show detailed information about the selected resource
    // For now, we'll just show a toast with the resource name
    toast(`Selected: ${resource.metadata.name}`, 'info');
    
    // In a real implementation, this would open a detailed view
    // with YAML/JSON representation and additional actions
  }

  _createResource() {
    if (!this.currentConnection) {
      toast('Please select and connect to a cluster first', 'warning');
      return;
    }

    // Show resource creation dialog
    this._showResourceCreationDialog();
  }

  _scaleResource() {
    if (!this.currentConnection) {
      toast('Please select and connect to a cluster first', 'warning');
      return;
    }

    // Show resource scaling dialog
    this._showResourceScalingDialog();
  }

  _describeResource() {
    if (!this.currentConnection) {
      toast('Please select and connect to a cluster first', 'warning');
      return;
    }

    // Show resource description dialog
    this._showResourceDescriptionDialog();
  }

  _viewLogs() {
    if (!this.currentConnection) {
      toast('Please select and connect to a cluster first', 'warning');
      return;
    }

    // Show resource logs dialog
    this._showResourceLogsDialog();
  }

  _execInResource() {
    if (!this.currentConnection) {
      toast('Please select and connect to a cluster first', 'warning');
      return;
    }

    // Show resource exec dialog
    this._showResourceExecDialog();
  }

  _deleteResource() {
    if (!this.currentConnection) {
      toast('Please select and connect to a cluster first', 'warning');
      return;
    }

    // Show resource deletion dialog
    this._showResourceDeletionDialog();
  }

  _showResourceCreationDialog() {
    toast('Resource creation would open here', 'info');
    // In a real implementation, this would show a form for creating resources
  }

  _showResourceScalingDialog() {
    toast('Resource scaling would open here', 'info');
    // In a real implementation, this would show a form for scaling deployments
  }

  _showResourceDescriptionDialog() {
    toast('Resource description would open here', 'info');
    // In a real implementation, this would show detailed resource information
  }

  _showResourceLogsDialog() {
    toast('Resource logs would open here', 'info');
    // In a real implementation, this would show logs for selected pods
  }

  _showResourceExecDialog() {
    toast('Resource exec would open here', 'info');
    // In a real implementation, this would allow executing commands in pods
  }

  _showResourceDeletionDialog() {
    toast('Resource deletion would open here', 'info');
    // In a real implementation, this would show confirmation for deletion
  }

  _updateStatusBar(text, status) {
    const statusElement = document.getElementById('k8s-status-text');
    if (statusElement) {
      statusElement.textContent = text;
      
      // Update status color based on status type
      switch (status) {
        case 'ready':
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
        case 'connecting':
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
        case 'warning':
          statusElement.style.color = 'var(--warning-color, #ffa502)';
          break;
        default:
          statusElement.style.color = 'var(--txt-secondary-color)';
      }
    }
  }

  _addConnection() {
    // This would open the SSH manager to add a new connection
    // For now, we'll just show a toast
    toast('Please use SSH Manager to add new connections', 'info');
  }

  open() {
    this.$k8sContainer.style.display = 'flex';
  }

  close() {
    this.$k8sContainer.style.display = 'none';
  }
}