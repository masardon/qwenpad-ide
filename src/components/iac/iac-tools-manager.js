/**
 * IaC Tools Manager for QwenPad IDE
 * Manages Infrastructure as Code tools like Terraform, Ansible, CloudFormation, etc.
 */

import Executor from '../plugins/terminal/www/Executor';
import toast from '../components/toast';

export default class IaCToolsManager {
  constructor(container) {
    this.container = container;
    this.tools = [];
    this.installedTools = [];
    
    this._initialize();
  }

  _initialize() {
    // Define available IaC tools
    this.tools = [
      {
        id: 'terraform',
        name: 'Terraform',
        description: 'Infrastructure as Code tool for provisioning and managing cloud resources',
        url: 'https://www.terraform.io/',
        icon: 'language',
        category: 'iac',
        commands: ['terraform init', 'terraform plan', 'terraform apply', 'terraform destroy'],
        installation: {
          termux: 'pkg install terraform',
          linux: 'curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -',
          mac: 'brew tap hashicorp/tap && brew install hashicorp/tap/terraform',
          windows: 'choco install terraform'
        }
      },
      {
        id: 'ansible',
        name: 'Ansible',
        description: 'Simple, agentless automation for IT orchestration, configuration management, and application deployment',
        url: 'https://www.ansible.com/',
        icon: 'account_tree',
        category: 'configuration',
        commands: ['ansible-playbook', 'ansible', 'ansible-vault', 'ansible-galaxy'],
        installation: {
          termux: 'pkg install ansible',
          linux: 'apt install ansible',
          mac: 'brew install ansible',
          windows: 'pip install ansible'
        }
      },
      {
        id: 'pulumi',
        name: 'Pulumi',
        description: 'Modern infrastructure as code platform that allows you to use familiar languages',
        url: 'https://www.pulumi.com/',
        icon: 'code',
        category: 'iac',
        commands: ['pulumi up', 'pulumi destroy', 'pulumi stack', 'pulumi preview'],
        installation: {
          termux: 'curl -fsSL https://get.pulumi.com | sh',
          linux: 'curl -fsSL https://get.pulumi.com | sh',
          mac: 'brew install pulumi',
          windows: 'choco install pulumi'
        }
      },
      {
        id: 'cloudformation',
        name: 'AWS CloudFormation',
        description: 'Amazon Web Services infrastructure as code service',
        url: 'https://aws.amazon.com/cloudformation/',
        icon: 'cloud',
        category: 'cloud',
        commands: ['aws cloudformation create-stack', 'aws cloudformation update-stack', 'aws cloudformation delete-stack'],
        installation: {
          termux: 'pkg install aws-cli',
          linux: 'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"',
          mac: 'brew install aws-cli',
          windows: 'msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi'
        }
      },
      {
        id: 'azure-cli',
        name: 'Azure CLI',
        description: 'Microsoft Azure command-line interface',
        url: 'https://docs.microsoft.com/cli/azure/',
        icon: 'cloud',
        category: 'cloud',
        commands: ['az group create', 'az deployment group create', 'az group delete'],
        installation: {
          termux: 'pkg install azure-cli',
          linux: 'curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash',
          mac: 'brew install azure-cli',
          windows: 'curl -L https://aka.ms/InstallAzureCliWindows -o AzureCLI.msi'
        }
      },
      {
        id: 'gcloud',
        name: 'Google Cloud CLI',
        description: 'Google Cloud command-line interface',
        url: 'https://cloud.google.com/sdk/gcloud',
        icon: 'cloud',
        category: 'cloud',
        commands: ['gcloud compute instances create', 'gcloud deployments create', 'gcloud compute instances delete'],
        installation: {
          termux: 'pkg install google-cloud-sdk',
          linux: 'curl https://sdk.cloud.google.com | bash',
          mac: 'brew cask install google-cloud-sdk',
          windows: 'msiexec.exe /i https://dl.google.com/dl/cloudsdk/release/GoogleCloudSDKInstaller.exe'
        }
      },
      {
        id: 'helm',
        name: 'Helm',
        description: 'The package manager for Kubernetes',
        url: 'https://helm.sh/',
        icon: 'directions_boat',
        category: 'k8s',
        commands: ['helm install', 'helm upgrade', 'helm uninstall', 'helm list'],
        installation: {
          termux: 'pkg install helm',
          linux: 'curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash',
          mac: 'brew install helm',
          windows: 'choco install kubernetes-helm'
        }
      },
      {
        id: 'packer',
        name: 'Packer',
        description: 'Tool for creating identical machine images for multiple platforms',
        url: 'https://www.packer.io/',
        icon: 'layers',
        category: 'image-building',
        commands: ['packer build', 'packer validate', 'packer inspect'],
        installation: {
          termux: 'pkg install packer',
          linux: 'curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -',
          mac: 'brew tap hashicorp/tap && brew install hashicorp/tap/packer',
          windows: 'choco install packer'
        }
      }
    ];
    
    // Check which tools are installed
    this._checkInstalledTools();
    
    // Create the UI elements
    this._createUI();
  }

  _checkInstalledTools() {
    // In a real implementation, we would check if the tools are installed
    // For now, we'll just simulate checking
    this.installedTools = [];
    
    this.tools.forEach(tool => {
      // Simulate checking if tool is installed
      const isInstalled = this._isToolInstalled(tool.id);
      if (isInstalled) {
        this.installedTools.push({
          ...tool,
          installed: true,
          version: this._getToolVersion(tool.id)
        });
      }
    });
  }

  _isToolInstalled(toolId) {
    // In a real implementation, we would check if the tool is available
    // For now, we'll return false for all tools
    return false;
  }

  _getToolVersion(toolId) {
    // In a real implementation, we would get the tool version
    // For now, we'll return a placeholder
    return 'unknown';
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
              className: 'icon language', 
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
              className: 'icon language',
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
              textContent: 'View Available Tools',
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
      const $toolCard = this._createToolCard(tool);
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
      const $toolCard = this._createToolCard(tool);
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

  _createToolCard(tool) {
    const isInstalled = this.installedTools.some(t => t.id === tool.id);
    
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

  _installTool(tool) {
    toast(`Installing ${tool.name}...`, 'info');
    
    // In a real implementation, we would execute the installation command
    // For now, we'll just show the installation instructions
    this._showInstallationInstructions(tool);
  }

  _openTool(tool) {
    toast(`Opening ${tool.name}...`, 'info');
    
    // This would open the tool or show more options
    // For now, we'll just show a message
    toast(`${tool.name} opened`, 'success');
  }

  _showInstallationInstructions(tool) {
    // Create modal with installation instructions
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
              textContent: `Install ${tool.name}`,
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
          textContent: tool.description,
          style: {
            marginBottom: '16px',
            color: 'var(--txt-secondary-color)'
          }
        }),
        tag('div', {
          style: {
            marginBottom: '16px'
          },
          children: [
            tag('h4', {
              textContent: 'Installation Methods',
              style: { margin: '0 0 12px 0' }
            })
          ]
        }),
        tag('div', {
          children: Object.entries(tool.installation).map(([platform, command]) => 
            tag('div', {
              style: { marginBottom: '12px' },
              children: [
                tag('div', {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
                  children: [
                    tag('strong', { textContent: platform.charAt(0).toUpperCase() + platform.slice(1) }),
                    tag('button', {
                      textContent: 'Copy',
                      onclick: () => this._copyToClipboard(command),
                      style: {
                        padding: '2px 8px',
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
                  textContent: command,
                  style: {
                    fontFamily: 'monospace',
                    fontSize: '0.8em',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--txt-color)',
                    padding: '8px',
                    borderRadius: '4px',
                    overflowX: 'auto'
                  }
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

  _copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast('Copied to clipboard!', 'success');
      });
    } else {
      const textArea = tag('textarea', {
        value: text,
        style: {
          position: 'absolute',
          left: '-9999px',
          top: '-9999px'
        }
      });
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast('Copied to clipboard!', 'success');
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
                  style: {
                    margin: 0
                  }
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

  open() {
    this.$iacContainer.style.display = 'flex';
  }

  close() {
    this.$iacContainer.style.display = 'none';
  }
}