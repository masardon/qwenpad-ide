/**
 * Cloud Provider Manager UI for QwenPad IDE
 * Provides user interface for managing cloud provider connections
 */

import CloudProviderManager from '../../lib/cloud/cloud-provider-manager';
import toast from '../../components/toast';

export default class CloudProviderUI {
  constructor(container) {
    this.container = container;
    this.manager = new CloudProviderManager();
    this.providers = [];
    this.connections = [];
    
    this._initialize();
  }

  _initialize() {
    // Load providers and connections
    this.providers = this.manager.getProviders();
    this.connections = this.manager.getConnections();
    
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$cloudContainer = tag('div', {
      className: 'cloud-provider-manager-container',
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
      className: 'cloud-provider-manager-header',
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
              className: 'icon cloud', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Cloud Provider Manager',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'cloud-close-btn',
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

    // Provider selector
    this.$providerSelector = tag('div', {
      className: 'cloud-provider-selector',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      children: [
        tag('span', {
          textContent: 'Provider:',
          style: { fontWeight: 'bold' }
        }),
        tag('select', {
          id: 'cloud-provider-select',
          style: {
            flex: 1,
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onchange: (e) => this._selectProvider(e.target.value)
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
    });

    // Action buttons
    this.$actions = tag('div', {
      className: 'cloud-actions',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      },
      children: [
        tag('button', {
          textContent: 'Generate Key',
          onclick: () => this._generateKey(),
          style: {
            padding: '6px 12px',
            border: '1px solid var(--primary-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        }),
        tag('button', {
          textContent: 'Import Key',
          onclick: () => this._importKey(),
          style: {
            padding: '6px 12px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer'
          }
        }),
        tag('button', {
          textContent: 'Refresh',
          onclick: () => this._refresh(),
          style: {
            padding: '6px 12px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer'
          }
        }),
        tag('button', {
          textContent: 'Install CLI',
          onclick: () => this._installCLI(),
          style: {
            padding: '6px 12px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer'
          }
        }),
        tag('button', {
          textContent: 'Update CLI',
          onclick: () => this._updateCLI(),
          style: {
            padding: '6px 12px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer'
          }
        })
      ]
    });

    // Connection list
    this.$connectionList = tag('div', {
      className: 'cloud-connection-list',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }
    });

    // Status bar
    this.$statusBar = tag('div', {
      className: 'cloud-status-bar',
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
          id: 'cloud-status-text',
          textContent: 'Ready'
        }),
        tag('span', {
          id: 'cloud-connection-count',
          textContent: `${this.connections.length} connections`
        })
      ]
    });

    // Assemble the UI
    this.$cloudContainer.appendChild(this.$header);
    this.$cloudContainer.appendChild(this.$providerSelector);
    this.$cloudContainer.appendChild(this.$actions);
    this.$cloudContainer.appendChild(this.$connectionList);
    this.$cloudContainer.appendChild(this.$statusBar);

    // Add to container
    this.container.appendChild(this.$cloudContainer);

    // Populate provider selector
    this._populateProviderSelector();

    // Render initial connection list
    this._renderConnectionList();
  }

  _populateProviderSelector() {
    const select = document.getElementById('cloud-provider-select');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="">All Providers</option>';

    // Add providers
    this.providers.forEach(provider => {
      const option = tag('option', {
        value: provider.id,
        textContent: provider.name,
        style: {
          color: provider.color || 'var(--txt-color)'
        }
      });
      select.appendChild(option);
    });
  }

  _selectProvider(providerId) {
    // Filter connections by provider
    if (!providerId) {
      this.filteredConnections = this.connections;
    } else {
      this.filteredConnections = this.connections.filter(conn => conn.provider === providerId);
    }
    
    this._renderConnectionList();
  }

  _renderConnectionList() {
    this.$connectionList.innerHTML = '';

    const connectionsToShow = this.filteredConnections || this.connections;

    if (connectionsToShow.length === 0) {
      this.$connectionList.appendChild(
        tag('div', {
          style: {
            textAlign: 'center',
            padding: '32px',
            color: 'var(--txt-secondary-color)'
          },
          children: [
            tag('div', {
              className: 'icon cloud',
              style: {
                fontSize: '3em',
                marginBottom: '16px',
                color: 'var(--txt-secondary-color)'
              }
            }),
            tag('div', {
              textContent: 'No cloud connections configured',
              style: {
                fontWeight: 'bold',
                marginBottom: '8px'
              }
            }),
            tag('div', {
              textContent: 'Add a connection to get started',
              style: {
                fontSize: '0.9em',
                marginBottom: '16px'
              }
            }),
            tag('button', {
              textContent: '+ Add Connection',
              onclick: () => this._showConnectionForm(),
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

    connectionsToShow.forEach(connection => {
      const $card = this._createConnectionCard(connection);
      $grid.appendChild($card);
    });

    this.$connectionList.appendChild($grid);
  }

  _createConnectionCard(connection) {
    const provider = this.providers.find(p => p.id === connection.provider);
    
    return tag('div', {
      className: 'cloud-connection-card',
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
              className: `icon ${provider?.icon || 'cloud'}`,
              style: {
                fontSize: '1.5em',
                color: provider?.color || 'var(--txt-color)'
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
                  textContent: provider?.name || connection.provider,
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
                      textContent: `Auth: ${connection.authMethod}`,
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
              textContent: 'Test',
              onclick: () => this._testConnection(connection.id),
              style: {
                padding: '4px 8px',
                border: '1px solid var(--primary-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9em'
              }
            }),
            tag('button', {
              textContent: 'Edit',
              onclick: () => this._showConnectionForm(connection),
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
              onclick: () => this._deleteConnection(connection.id),
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

  _showConnectionForm(connection = null) {
    const isEdit = !!connection;
    const title = isEdit ? 'Edit Connection' : 'New Connection';
    
    // Create modal overlay
    const $modal = tag('div', {
      className: 'cloud-connection-modal',
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
      className: 'cloud-connection-dialog',
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
            // Connection name
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
                  id: 'cloud-connection-name',
                  value: connection?.name || '',
                  placeholder: 'My Cloud Connection',
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
            // Provider selection
            tag('div', {
              children: [
                tag('label', {
                  textContent: 'Provider',
                  style: {
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }
                }),
                tag('select', {
                  id: 'cloud-connection-provider',
                  value: connection?.provider || '',
                  style: {
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--bdr-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--txt-color)'
                  },
                  onchange: (e) => this._updateAuthMethodFields(e.target.value),
                  children: this.providers.map(p => 
                    tag('option', {
                      value: p.id,
                      textContent: p.name,
                      style: { color: p.color || 'var(--txt-color)' }
                    })
                  )
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
                tag('select', {
                  id: 'cloud-connection-auth-method',
                  value: connection?.authMethod || '',
                  style: {
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--bdr-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--txt-color)'
                  },
                  children: [
                    tag('option', { value: '', textContent: 'Select authentication method...' }),
                    tag('option', { value: 'accessKey', textContent: 'Access Key' }),
                    tag('option', { value: 'profile', textContent: 'Profile' }),
                    tag('option', { value: 'sso', textContent: 'SSO' }),
                    tag('option', { value: 'serviceAccount', textContent: 'Service Account' }),
                    tag('option', { value: 'adc', textContent: 'Application Default Credentials' }),
                    tag('option', { value: 'userAccount', textContent: 'User Account' }),
                    tag('option', { value: 'servicePrincipal', textContent: 'Service Principal' }),
                    tag('option', { value: 'managedIdentity', textContent: 'Managed Identity' })
                  ]
                })
              ]
            }),
            // Provider-specific authentication fields
            tag('div', {
              id: 'cloud-auth-fields',
              style: { display: 'flex', flexDirection: 'column', gap: '12px' }
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
                    cursor: 'pointer'
                  }
                }),
                tag('button', {
                  textContent: isEdit ? 'Update' : 'Create',
                  onclick: () => this._saveConnection(connection?.id),
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

    // Populate provider-specific fields if editing
    if (isEdit && connection?.provider) {
      this._updateAuthMethodFields(connection.provider);
    }
  }

  _updateAuthMethodFields(providerId) {
    const authFields = document.getElementById('cloud-auth-fields');
    if (!authFields) return;

    // Clear existing fields
    authFields.innerHTML = '';

    // Add provider-specific authentication fields
    switch (providerId) {
      case 'aws':
        this._addAWSAuthFields(authFields);
        break;
      case 'gcp':
        this._addGCPAuthFields(authFields);
        break;
      case 'azure':
        this._addAzureAuthFields(authFields);
        break;
    }
  }

  _addAWSAuthFields(container) {
    // Add AWS-specific authentication fields
    const fields = [
      tag('div', {
        children: [
          tag('label', {
            textContent: 'Access Key ID',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'text',
            id: 'aws-access-key-id',
            placeholder: 'AKIAIOSFODNN7EXAMPLE',
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
            textContent: 'Secret Access Key',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'password',
            id: 'aws-secret-access-key',
            placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
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
            textContent: 'Region',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('select', {
            id: 'aws-region',
            style: {
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--txt-color)'
            },
            children: [
              tag('option', { value: '', textContent: 'Select region...' }),
              tag('option', { value: 'us-east-1', textContent: 'US East (N. Virginia) us-east-1' }),
              tag('option', { value: 'us-east-2', textContent: 'US East (Ohio) us-east-2' }),
              tag('option', { value: 'us-west-1', textContent: 'US West (N. California) us-west-1' }),
              tag('option', { value: 'us-west-2', textContent: 'US West (Oregon) us-west-2' }),
              tag('option', { value: 'eu-west-1', textContent: 'EU (Ireland) eu-west-1' }),
              tag('option', { value: 'eu-west-2', textContent: 'EU (London) eu-west-2' }),
              tag('option', { value: 'eu-central-1', textContent: 'EU (Frankfurt) eu-central-1' }),
              tag('option', { value: 'ap-southeast-1', textContent: 'Asia Pacific (Singapore) ap-southeast-1' }),
              tag('option', { value: 'ap-southeast-2', textContent: 'Asia Pacific (Sydney) ap-southeast-2' }),
              tag('option', { value: 'ap-northeast-1', textContent: 'Asia Pacific (Tokyo) ap-northeast-1' })
            ]
          })
        ]
      })
    ];

    fields.forEach(field => container.appendChild(field));
  }

  _addGCPAuthFields(container) {
    // Add GCP-specific authentication fields
    const fields = [
      tag('div', {
        children: [
          tag('label', {
            textContent: 'Service Account Key File',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'text',
            id: 'gcp-key-file',
            placeholder: '/path/to/service-account-key.json',
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
            textContent: 'Project ID',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'text',
            id: 'gcp-project-id',
            placeholder: 'my-gcp-project-id',
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
    ];

    fields.forEach(field => container.appendChild(field));
  }

  _addAzureAuthFields(container) {
    // Add Azure-specific authentication fields
    const fields = [
      tag('div', {
        children: [
          tag('label', {
            textContent: 'Tenant ID',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'text',
            id: 'azure-tenant-id',
            placeholder: '00000000-0000-0000-0000-000000000000',
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
            textContent: 'Client ID',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'text',
            id: 'azure-client-id',
            placeholder: '00000000-0000-0000-0000-000000000000',
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
            textContent: 'Client Secret',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'password',
            id: 'azure-client-secret',
            placeholder: 'client secret',
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
            textContent: 'Subscription ID',
            style: {
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold'
            }
          }),
          tag('input', {
            type: 'text',
            id: 'azure-subscription-id',
            placeholder: '00000000-0000-0000-0000-000000000000',
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
    ];

    fields.forEach(field => container.appendChild(field));
  }

  async _saveConnection(existingId = null) {
    try {
      const name = document.getElementById('cloud-connection-name').value.trim();
      const provider = document.getElementById('cloud-connection-provider').value;
      const authMethod = document.getElementById('cloud-connection-auth-method').value;

      if (!name || !provider || !authMethod) {
        toast('Please fill in all required fields', 'warning');
        return;
      }

      // Prepare connection profile based on provider and auth method
      const profile = {
        id: existingId || `cloud_${Date.now()}`,
        name,
        provider,
        authMethod,
        lastUsed: new Date().toISOString()
      };

      // Add provider-specific fields
      switch (provider) {
        case 'aws':
          profile.accessKeyId = document.getElementById('aws-access-key-id').value.trim();
          profile.secretAccessKey = document.getElementById('aws-secret-access-key').value.trim();
          profile.region = document.getElementById('aws-region').value;
          break;
        case 'gcp':
          profile.keyFilePath = document.getElementById('gcp-key-file').value.trim();
          profile.projectId = document.getElementById('gcp-project-id').value.trim();
          break;
        case 'azure':
          profile.tenantId = document.getElementById('azure-tenant-id').value.trim();
          profile.clientId = document.getElementById('azure-client-id').value.trim();
          profile.clientSecret = document.getElementById('azure-client-secret').value.trim();
          profile.subscriptionId = document.getElementById('azure-subscription-id').value.trim();
          break;
      }

      // Validate required fields for each provider
      if (provider === 'aws' && (!profile.accessKeyId || !profile.secretAccessKey)) {
        toast('Please fill in AWS credentials', 'warning');
        return;
      }

      if (provider === 'gcp' && (!profile.keyFilePath || !profile.projectId)) {
        toast('Please fill in GCP credentials', 'warning');
        return;
      }

      if (provider === 'azure' && (!profile.tenantId || !profile.clientId || !profile.clientSecret)) {
        toast('Please fill in Azure credentials', 'warning');
        return;
      }

      // Test the connection
      this._updateStatusBar('Testing connection...', 'testing');
      
      await this.manager.testConnection(profile);

      // Add or update the connection
      if (existingId) {
        await this.manager.updateConnection(profile);
        toast('Connection updated successfully!', 'success');
      } else {
        await this.manager.addConnection(profile);
        toast('Connection created successfully!', 'success');
      }

      // Close modal and refresh list
      document.body.removeChild(document.querySelector('.cloud-connection-modal'));
      this._refresh();
    } catch (error) {
      console.error('Error saving connection:', error);
      toast(`Error ${existingId ? 'updating' : 'creating'} connection: ${error.message}`, 'error');
      this._updateStatusBar('Connection save failed', 'error');
    }
  }

  async _generateKey() {
    const providerId = document.getElementById('cloud-provider-select').value;
    if (!providerId) {
      toast('Please select a provider first', 'warning');
      return;
    }

    try {
      const provider = this.providers.find(p => p.id === providerId);
      if (!provider) {
        toast('Provider not found', 'error');
        return;
      }

      this._updateStatusBar(`Generating ${provider.name} key...`, 'generating');

      // Generate key using the provider's key generator
      const keyName = prompt(`Enter ${provider.name} key name:`);
      if (!keyName) return;

      // In a real implementation, this would generate a key specific to the provider
      // For now, we'll just show a success message
      toast(`${provider.name} key generation would happen here`, 'info');
      this._updateStatusBar(`${provider.name} key generated`, 'success');
    } catch (error) {
      console.error('Error generating key:', error);
      toast(`Error generating key: ${error.message}`, 'error');
      this._updateStatusBar('Key generation failed', 'error');
    }
  }

  async _importKey() {
    const providerId = document.getElementById('cloud-provider-select').value;
    if (!providerId) {
      toast('Please select a provider first', 'warning');
      return;
    }

    try {
      const provider = this.providers.find(p => p.id === providerId);
      if (!provider) {
        toast('Provider not found', 'error');
        return;
      }

      this._updateStatusBar(`Importing ${provider.name} key...`, 'importing');

      // Import key using the provider's key importer
      // In a real implementation, this would import a key specific to the provider
      // For now, we'll just show a success message
      toast(`${provider.name} key import would happen here`, 'info');
      this._updateStatusBar(`${provider.name} key imported`, 'success');
    } catch (error) {
      console.error('Error importing key:', error);
      toast(`Error importing key: ${error.message}`, 'error');
      this._updateStatusBar('Key import failed', 'error');
    }
  }

  async _testConnection(connectionId) {
    try {
      const connection = this.connections.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      this._updateStatusBar('Testing connection...', 'testing');
      
      const result = await this.manager.testConnection(connection);
      
      if (result) {
        toast('Connection test successful!', 'success');
        this._updateStatusBar('Connection test successful', 'success');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast(`Connection test failed: ${error.message}`, 'error');
      this._updateStatusBar('Connection test failed', 'error');
    }
  }

  async _deleteConnection(connectionId) {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    try {
      await this.manager.removeConnection(connectionId);
      toast('Connection deleted successfully!', 'success');
      this._refresh();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast(`Error deleting connection: ${error.message}`, 'error');
    }
  }

  async _refresh() {
    try {
      this.connections = this.manager.getConnections();
      this._renderConnectionList();
      this._updateStatusBar('Connections refreshed', 'ready');
      document.getElementById('cloud-connection-count').textContent = `${this.connections.length} connections`;
    } catch (error) {
      console.error('Error refreshing connections:', error);
      toast(`Error refreshing connections: ${error.message}`, 'error');
      this._updateStatusBar('Failed to refresh connections', 'error');
    }
  }

  async _installCLI() {
    const providerId = document.getElementById('cloud-provider-select').value;
    if (!providerId) {
      toast('Please select a provider first', 'warning');
      return;
    }

    try {
      const provider = this.providers.find(p => p.id === providerId);
      if (!provider) {
        toast('Provider not found', 'error');
        return;
      }

      this._updateStatusBar(`Installing ${provider.name} CLI...`, 'installing');

      await this.manager.installCLI(providerId);
      
      toast(`${provider.name} CLI installed successfully!`, 'success');
      this._updateStatusBar(`${provider.name} CLI installed`, 'success');
    } catch (error) {
      console.error('Error installing CLI:', error);
      toast(`Error installing ${provider.name} CLI: ${error.message}`, 'error');
      this._updateStatusBar('CLI installation failed', 'error');
    }
  }

  async _updateCLI() {
    const providerId = document.getElementById('cloud-provider-select').value;
    if (!providerId) {
      toast('Please select a provider first', 'warning');
      return;
    }

    try {
      const provider = this.providers.find(p => p.id === providerId);
      if (!provider) {
        toast('Provider not found', 'error');
        return;
      }

      this._updateStatusBar(`Updating ${provider.name} CLI...`, 'updating');

      await this.manager.updateCLI(providerId);
      
      toast(`${provider.name} CLI updated successfully!`, 'success');
      this._updateStatusBar(`${provider.name} CLI updated`, 'success');
    } catch (error) {
      console.error('Error updating CLI:', error);
      toast(`Error updating ${provider.name} CLI: ${error.message}`, 'error');
      this._updateStatusBar('CLI update failed', 'error');
    }
  }

  _updateStatusBar(text, status) {
    const statusElement = document.getElementById('cloud-status-text');
    if (statusElement) {
      statusElement.textContent = text;
      
      // Update status color based on status type
      switch (status) {
        case 'ready':
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
        case 'testing':
        case 'installing':
        case 'updating':
        case 'generating':
        case 'importing':
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
    this.$cloudContainer.style.display = 'flex';
  }

  close() {
    this.$cloudContainer.style.display = 'none';
  }
}