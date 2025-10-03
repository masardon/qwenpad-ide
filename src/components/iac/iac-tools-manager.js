/**
 * Infrastructure as Code (IaC) Tools Manager UI for QwenPad IDE
 * Provides interface for managing IaC tools like Terraform, Ansible, CloudFormation, etc.
 */

import IaCToolsManager from '../../plugins/iac-tools-manager/www/iactoolsmanager';
import toast from '../components/toast';

export default class IaCToolsUI {
  constructor(container) {
    this.container = container;
    this.manager = new IaCToolsManager();
    this.tools = [];
    this.installedTools = [];
    
    this._initialize();
  }

  _initialize() {
    // Load available and installed tools
    this.tools = this.manager.getTools();
    this.installedTools = this.manager.getInstalledTools();
    
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$iacContainer = tag('div', {
      className: 'iac-tools-manager-container',
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
      className: 'iac-tools-manager-header',
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
              className: 'icon construction', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Infrastructure as Code (IaC) Tools',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'iac-close-btn',
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

    // Tabs
    this.$tabs = tag('div', {
      className: 'iac-tools-tabs',
      style: {
        display: 'flex',
        borderBottom: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--tab-bg, #f8f9fa)'
      },
      children: [
        tag('button', {
          id: 'iac-installed-tab',
          textContent: 'Installed Tools',
          className: 'iac-tab active',
          onclick: () => this._switchTab('installed'),
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
          id: 'iac-available-tab',
          textContent: 'Available Tools',
          className: 'iac-tab',
          onclick: () => this._switchTab('available'),
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
          id: 'iac-templates-tab',
          textContent: 'Templates',
          className: 'iac-tab',
          onclick: () => this._switchTab('templates'),
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
      className: 'iac-content-area',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }
    });

    // Action buttons
    this.$actions = tag('div', {
      className: 'iac-actions',
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
        }),
        tag('button', {
          textContent: 'Install All',
          onclick: () => this._installAll(),
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
          textContent: 'Update All',
          onclick: () => this._updateAll(),
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

    // Status bar
    this.$statusBar = tag('div', {
      className: 'iac-status-bar',
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
          id: 'iac-status-text',
          textContent: `Available: ${this.tools.length} tools | Installed: ${this.installedTools.length} tools`
        }),
        tag('span', {
          textContent: 'Ready'
        })
      ]
    });

    // Assemble the UI
    this.$iacContainer.appendChild(this.$header);
    this.$iacContainer.appendChild(this.$tabs);
    this.$iacContainer.appendChild(this.$contentArea);
    this.$iacContainer.appendChild(this.$actions);
    this.$iacContainer.appendChild(this.$statusBar);

    // Add to container
    this.container.appendChild(this.$iacContainer);

    // Render initial tool list
    this._renderInstalledTools();
  }

  _switchTab(tabName) {
    // Update tab styling
    document.querySelectorAll('.iac-tab').forEach(tab => {
      tab.className = 'iac-tab';
      tab.style.color = 'var(--txt-secondary-color)';
      tab.style.borderBottom = 'none';
    });
    
    const activeTab = document.getElementById(`iac-${tabName}-tab`);
    if (activeTab) {
      activeTab.className = 'iac-tab active';
      activeTab.style.color = 'var(--txt-color)';
      activeTab.style.borderBottom = '2px solid var(--primary-color)';
    }
    
    // Update content
    switch (tabName) {
      case 'installed':
        this._renderInstalledTools();
        break;
      case 'available':
        this._renderAvailableTools();
        break;
      case 'templates':
        this._renderTemplates();
        break;
    }
  }

  _renderInstalledTools() {
    this.$contentArea.innerHTML = '';

    if (this.installedTools.length === 0) {
      this.$contentArea.appendChild(
        tag('div', {
          style: {
            textAlign: 'center',
            padding: '32px',
            color: 'var(--txt-secondary-color)'
          },
          children: [
            tag('div', {
              className: 'icon construction',
              style: {
                fontSize: '3em',
                marginBottom: '16px',
                color: 'var(--txt-secondary-color)'
              }
            }),
            tag('div', {
              textContent: 'No IaC tools installed yet',
              style: {
                fontWeight: 'bold',
                marginBottom: '8px'
              }
            }),
            tag('div', {
              textContent: 'Install tools from the Available Tools tab',
              style: {
                fontSize: '0.9em',
                marginBottom: '16px'
              }
            }),
            tag('button', {
              textContent: '+ Install Tools',
              onclick: () => this._switchTab('available'),
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

    // Create tools grid
    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }
    });

    this.installedTools.forEach(tool => {
      const $toolCard = this._createToolCard(tool, true);
      $grid.appendChild($toolCard);
    });

    this.$contentArea.appendChild($grid);
  }

  _renderAvailableTools() {
    this.$contentArea.innerHTML = '';

    // Create tools grid
    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }
    });

    this.tools.forEach(tool => {
      const isInstalled = this.installedTools.some(t => t.id === tool.id);
      const $toolCard = this._createToolCard(tool, isInstalled);
      $grid.appendChild($toolCard);
    });

    this.$contentArea.appendChild($grid);
  }

  _renderTemplates() {
    this.$contentArea.innerHTML = '';

    // Template categories
    const templateCategories = [
      {
        id: 'terraform',
        name: 'Terraform Templates',
        description: 'Pre-built Terraform modules for common infrastructure patterns',
        icon: 'language',
        templates: [
          { name: 'AWS VPC Module', description: 'Complete VPC setup with public and private subnets' },
          { name: 'EC2 Instance', description: 'Single EC2 instance with security group' },
          { name: 'S3 Bucket', description: 'Secure S3 bucket with versioning' },
          { name: 'RDS Database', description: 'Managed PostgreSQL database instance' }
        ]
      },
      {
        id: 'ansible',
        name: 'Ansible Playbooks',
        description: 'Reusable Ansible playbooks for common configuration tasks',
        icon: 'account_tree',
        templates: [
          { name: 'Web Server Setup', description: 'Apache/Nginx web server installation and configuration' },
          { name: 'Docker Installation', description: 'Install and configure Docker engine' },
          { name: 'User Management', description: 'Manage system users and groups' },
          { name: 'Firewall Configuration', description: 'Configure UFW firewall rules' }
        ]
      },
      {
        id: 'k8s',
        name: 'Kubernetes Manifests',
        description: 'Common Kubernetes manifests for deployments, services, and more',
        icon: 'directions_boat',
        templates: [
          { name: 'Nginx Deployment', description: 'Basic Nginx web server deployment' },
          { name: 'MySQL Database', description: 'MySQL database with persistent volume' },
          { name: 'Redis Cache', description: 'High-performance Redis cache' },
          { name: 'Monitoring Stack', description: 'Prometheus and Grafana monitoring stack' }
        ]
      },
      {
        id: 'cloudformation',
        name: 'CloudFormation Templates',
        description: 'AWS CloudFormation templates for common resources',
        icon: 'cloud',
        templates: [
          { name: 'VPC Stack', description: 'Complete VPC with subnets and routing' },
          { name: 'EC2 Auto Scaling', description: 'Auto-scaling group with load balancer' },
          { name: 'S3 Static Website', description: 'Static website hosting with CloudFront CDN' },
          { name: 'Lambda Function', description: 'Serverless function with API Gateway' }
        ]
      }
    ];

    // Create categories grid
    const $categoriesGrid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }
    });

    templateCategories.forEach(category => {
      const $categoryCard = tag('div', {
        style: {
          border: '1px solid var(--bdr-color)',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'var(--bg-color)',
          cursor: 'pointer',
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
        onclick: () => this._showCategoryTemplates(category),
        children: [
          tag('div', {
            style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
            children: [
              tag('span', {
                className: `icon ${category.icon}`,
                style: {
                  fontSize: '1.5em',
                  color: 'var(--primary-color)'
                }
              }),
              tag('div', {
                children: [
                  tag('div', {
                    textContent: category.name,
                    style: {
                      fontWeight: 'bold',
                      fontSize: '1.1em',
                      marginBottom: '4px'
                    }
                  }),
                  tag('div', {
                    textContent: category.description,
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
            textContent: `${category.templates.length} templates`,
            style: {
              fontSize: '0.8em',
              color: 'var(--txt-secondary-color)',
              textAlign: 'right'
            }
          })
        ]
      });
      
      $categoriesGrid.appendChild($categoryCard);
    });

    this.$contentArea.appendChild(
      tag('div', {
        children: [
          tag('h3', {
            textContent: 'Template Categories',
            style: {
              margin: '0 0 16px 0',
              fontSize: '1.3em'
            }
          }),
          $categoriesGrid
        ]
      })
    );
  }

  _createToolCard(tool, isInstalled) {
    return tag('div', {
      className: 'iac-tool-card',
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
              className: `icon ${tool.icon}`,
              style: {
                fontSize: '1.5em',
                color: 'var(--primary-color)'
              }
            }),
            tag('div', {
              style: { flex: 1 },
              children: [
                tag('div', {
                  textContent: tool.name,
                  style: {
                    fontWeight: 'bold',
                    fontSize: '1.1em',
                    marginBottom: '4px'
                  }
                }),
                tag('div', {
                  textContent: tool.description,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)',
                    marginBottom: '8px'
                  }
                }),
                tag('span', {
                  textContent: tool.category,
                  style: {
                    fontSize: '0.7em',
                    backgroundColor: 'var(--badge-bg, #e9ecef)',
                    color: 'var(--badge-color, #6c757d)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }
                })
              ]
            })
          ]
        }),
        tag('div', {
          style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
          children: [
            isInstalled ? tag('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8em',
                color: 'var(--success-color, #2ed573)'
              },
              children: [
                tag('span', { className: 'icon check_circle' }),
                tag('span', { textContent: 'Installed' })
              ]
            }) : null,
            tag('button', {
              textContent: isInstalled ? 'Open' : 'Install',
              onclick: isInstalled ? () => this._openTool(tool) : () => this._installTool(tool),
              style: {
                padding: '4px 8px',
                border: `1px solid ${isInstalled ? 'var(--primary-color)' : 'var(--bdr-color)'}`,
                borderRadius: '4px',
                backgroundColor: isInstalled ? 'var(--primary-color)' : 'var(--btn-bg)',
                color: isInstalled ? 'white' : 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em',
                fontWeight: 'bold'
              }
            })
          ].filter(Boolean)
        })
      ]
    });
  }

  async _installTool(tool) {
    try {
      this._updateStatusBar(`Installing ${tool.name}...`, 'installing');
      
      // Install the tool using the manager
      await this.manager.installTool(tool.id);
      
      toast(`${tool.name} installed successfully!`, 'success');
      
      // Refresh the tool list
      this._refresh();
    } catch (error) {
      console.error('Error installing tool:', error);
      toast(`Error installing ${tool.name}: ${error.message}`, 'error');
      this._updateStatusBar(`Failed to install ${tool.name}`, 'error');
    }
  }

  async _openTool(tool) {
    toast(`Opening ${tool.name}...`, 'info');
    
    // This would open the tool or show more options
    // For now, just show a message
    toast(`${tool.name} opened`, 'success');
  }

  async _installAll() {
    try {
      this._updateStatusBar('Installing all tools...', 'installing');
      
      // Install all available tools
      await this.manager.installAllTools();
      
      toast('All tools installed successfully!', 'success');
      
      // Refresh the tool list
      this._refresh();
    } catch (error) {
      console.error('Error installing all tools:', error);
      toast(`Error installing tools: ${error.message}`, 'error');
      this._updateStatusBar('Failed to install tools', 'error');
    }
  }

  async _updateAll() {
    try {
      this._updateStatusBar('Updating all tools...', 'updating');
      
      // Update all installed tools
      await this.manager.updateAllTools();
      
      toast('All tools updated successfully!', 'success');
      
      // Refresh the tool list
      this._refresh();
    } catch (error) {
      console.error('Error updating all tools:', error);
      toast(`Error updating tools: ${error.message}`, 'error');
      this._updateStatusBar('Failed to update tools', 'error');
    }
  }

  async _refresh() {
    try {
      this._updateStatusBar('Refreshing tools...', 'loading');
      
      // Refresh available and installed tools
      this.tools = this.manager.getTools();
      this.installedTools = this.manager.getInstalledTools();
      
      // Update status bar
      document.getElementById('iac-status-text').textContent = 
        `Available: ${this.tools.length} tools | Installed: ${this.installedTools.length} tools`;
      
      this._updateStatusBar('Tools refreshed', 'success');
      
      // Re-render current tab
      const activeTab = document.querySelector('.iac-tab.active');
      if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'iac-installed-tab') {
          this._renderInstalledTools();
        } else if (tabId === 'iac-available-tab') {
          this._renderAvailableTools();
        } else if (tabId === 'iac-templates-tab') {
          this._renderTemplates();
        }
      }
    } catch (error) {
      console.error('Error refreshing tools:', error);
      toast('Error refreshing tools', 'error');
      this._updateStatusBar('Failed to refresh tools', 'error');
    }
  }

  _showCategoryTemplates(category) {
    // Create modal with templates
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
            tag('div', {
              children: [
                tag('h3', {
                  textContent: category.name,
                  style: { margin: 0 }
                }),
                tag('div', {
                  textContent: category.description,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)'
                  }
                })
              ]
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
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px'
          },
          children: category.templates.map(template => 
            tag('div', {
              style: {
                border: '1px solid var(--bdr-color)',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: 'var(--input-container-bg, #f8f9fa)'
              },
              children: [
                tag('div', {
                  textContent: template.name,
                  style: {
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }
                }),
                tag('div', {
                  textContent: template.description,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)',
                    marginBottom: '8px'
                  }
                }),
                tag('div', {
                  style: { display: 'flex', gap: '8px' },
                  children: [
                    tag('button', {
                      textContent: 'Create',
                      onclick: () => this._createTemplate(template, category),
                      style: {
                        padding: '4px 8px',
                        border: '1px solid var(--primary-color)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }
                    }),
                    tag('button', {
                      textContent: 'Preview',
                      onclick: () => this._previewTemplate(template, category),
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
          )
        }),
        tag('button', {
          textContent: 'Close',
          onclick: () => document.body.removeChild($modal),
          style: {
            padding: '8px 16px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '16px'
          }
        })
      ]
    });

    $modal.appendChild($dialog);
    document.body.appendChild($modal);
  }

  _createTemplate(template, category) {
    toast(`Creating ${template.name} template...`, 'info');
    // This would create a new template file
    // For now, just show a message
    toast(`Template ${template.name} created`, 'success');
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
  }

  _previewTemplate(template, category) {
    toast(`Previewing ${template.name}...`, 'info');
    // This would show a preview of the template
    // For now, just show a message
    toast(`Preview of ${template.name}`, 'info');
  }

  _updateStatusBar(text, status) {
    const statusElement = document.getElementById('iac-status-text');
    if (statusElement) {
      statusElement.textContent = text;
      
      // Update status color based on status type
      switch (status) {
        case 'ready':
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
        case 'installing':
        case 'updating':
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
    this.$iacContainer.style.display = 'flex';
  }

  close() {
    this.$iacContainer.style.display = 'none';
  }
}