import K8sManager from '../../plugins/k8s-manager/www/k8smanager';
import toast from '../../components/toast';
import helpers from '../../utils/helpers';

export default async function k8sManager() {
  try {
    // Initialize K8s Manager
    await K8sManager.init();

    // Create the main K8s Manager UI
    const $container = tag('div', {
      className: 'k8s-manager',
      style: {
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    });

    // Header
    const $header = tag('div', {
      className: 'k8s-manager-header',
      style: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      children: [
        tag('h2', {
          textContent: 'Kubernetes Manager',
          style: {
            margin: 0,
            fontSize: '1.5em'
          }
        }),
        tag('button', {
          textContent: '+ New Cluster',
          onclick: () => showClusterForm(),
          style: {
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer'
          }
        })
      ]
    });

    // Tabs for different K8s resources
    const $tabs = tag('div', {
      className: 'k8s-tabs',
      style: {
        display: 'flex',
        marginBottom: '16px',
        borderBottom: '1px solid var(--bdr-color)'
      },
      children: [
        tag('div', {
          id: 'clusters-tab',
          className: 'tab active',
          textContent: 'Clusters',
          onclick: () => switchTab('clusters'),
          style: {
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: '2px solid var(--primary-color)',
            color: 'var(--txt-color)'
          }
        }),
        tag('div', {
          id: 'resources-tab',
          className: 'tab',
          textContent: 'Resources',
          onclick: () => switchTab('resources'),
          style: {
            padding: '8px 16px',
            cursor: 'pointer',
            color: 'var(--txt-secondary-color)',
            marginLeft: '8px'
          }
        }),
        tag('div', {
          id: 'workloads-tab',
          className: 'tab',
          textContent: 'Workloads',
          onclick: () => switchTab('workloads'),
          style: {
            padding: '8px 16px',
            cursor: 'pointer',
            color: 'var(--txt-secondary-color)',
            marginLeft: '8px'
          }
        })
      ]
    });

    // Content area
    const $contentArea = tag('div', {
      className: 'content-area',
      style: {
        flex: 1,
        overflowY: 'auto'
      }
    });

    // Initial load clusters
    await loadClusters();

    // Tab switching function
    function switchTab(tabName) {
      // Update tab styling
      document.getElementById('clusters-tab').className = 'tab';
      document.getElementById('clusters-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('clusters-tab').style.borderBottom = 'none';
      
      document.getElementById('resources-tab').className = 'tab';
      document.getElementById('resources-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('resources-tab').style.borderBottom = 'none';
      
      document.getElementById('workloads-tab').className = 'tab';
      document.getElementById('workloads-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('workloads-tab').style.borderBottom = 'none';

      if (tabName === 'clusters') {
        document.getElementById('clusters-tab').className = 'tab active';
        document.getElementById('clusters-tab').style.color = 'var(--txt-color)';
        document.getElementById('clusters-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadClusters();
      } else if (tabName === 'resources') {
        document.getElementById('resources-tab').className = 'tab active';
        document.getElementById('resources-tab').style.color = 'var(--txt-color)';
        document.getElementById('resources-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadResources();
      } else if (tabName === 'workloads') {
        document.getElementById('workloads-tab').className = 'tab active';
        document.getElementById('workloads-tab').style.color = 'var(--txt-color)';
        document.getElementById('workloads-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadWorkloads();
      }
    }

    // Function to load clusters
    async function loadClusters() {
      $contentArea.innerHTML = '';
      
      const clusters = K8sManager.getConnections();
      
      if (clusters.length === 0) {
        $contentArea.appendChild(
          tag('div', {
            textContent: 'No Kubernetes clusters configured. Click "New Cluster" to add one.',
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--txt-secondary-color)'
            }
          })
        );
        return;
      }

      // Create clusters list
      const $list = tag('div', {
        className: 'clusters-list',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }
      });

      clusters.forEach(cluster => {
        const $item = tag('div', {
          className: 'cluster-item',
          style: {
            border: '1px solid var(--bdr-color)',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: 'var(--bg-color)'
          },
          children: [
            tag('div', {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              },
              children: [
                tag('div', {
                  style: { flex: 1 },
                  children: [
                    tag('div', {
                      textContent: cluster.name,
                      style: {
                        fontWeight: 'bold',
                        fontSize: '1.1em'
                      }
                    }),
                    tag('div', {
                      textContent: cluster.server,
                      style: {
                        fontSize: '0.9em',
                        color: 'var(--txt-secondary-color)',
                        marginTop: '4px'
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
                      onclick: () => connectToCluster(cluster.id),
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
                      onclick: () => showClusterForm(cluster),
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
                      onclick: () => deleteCluster(cluster.id),
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
            }),
            tag('div', {
              style: {
                display: 'flex',
                fontSize: '0.8em',
                color: 'var(--txt-secondary-color)'
              },
              children: [
                cluster.context ? tag('div', {
                  textContent: `Context: ${cluster.context}`,
                  style: { marginRight: '12px' }
                }) : null,
                cluster.namespace ? tag('div', {
                  textContent: `Namespace: ${cluster.namespace}`,
                  style: { marginRight: '12px' }
                }) : null,
                cluster.lastUsed ? tag('div', {
                  textContent: `Last used: ${new Date(cluster.lastUsed).toLocaleDateString()}`
                }) : null
              ].filter(Boolean)
            })
          ]
        });
        
        $list.appendChild($item);
      });

      $contentArea.appendChild($list);
    }

    // Function to load resources
    async function loadResources() {
      $contentArea.innerHTML = '';
      
      const clusters = K8sManager.getConnections();
      if (clusters.length === 0) {
        $contentArea.appendChild(
          tag('div', {
            textContent: 'No Kubernetes clusters configured.',
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--txt-secondary-color)'
            }
          })
        );
        return;
      }

      // For now, just show a message - in a real implementation, we would show
      // resources from the active cluster
      $contentArea.appendChild(
        tag('div', {
          style: { padding: '20px' },
          children: [
            tag('h3', {
              textContent: 'Kubernetes Resources',
              style: {
                marginBottom: '16px'
              }
            }),
            tag('p', {
              textContent: 'Select a cluster to view its resources.',
              style: {
                color: 'var(--txt-secondary-color)',
                marginBottom: '16px'
              }
            }),
            tag('div', {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              },
              children: [
                createResourceCard('pods', 'Pods', 'container'),
                createResourceCard('services', 'Services', 'router'),
                createResourceCard('deployments', 'Deployments', 'layers'),
                createResourceCard('configmaps', 'ConfigMaps', 'description'),
                createResourceCard('secrets', 'Secrets', 'lock'),
                createResourceCard('persistentvolumes', 'Persistent Volumes', 'storage')
              ]
            })
          ]
        })
      );
    }

    // Function to load workloads
    async function loadWorkloads() {
      $contentArea.innerHTML = '';
      
      $contentArea.appendChild(
        tag('div', {
          style: { padding: '20px' },
          children: [
            tag('h3', {
              textContent: 'Kubernetes Workloads',
              style: {
                marginBottom: '16px'
              }
            }),
            tag('p', {
              textContent: 'Manage your Kubernetes workloads directly from QwenPad IDE.',
              style: {
                color: 'var(--txt-secondary-color)',
                marginBottom: '16px'
              }
            }),
            tag('div', {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              },
              children: [
                createWorkloadCard('deployments', 'Deployments', 'layers'),
                createWorkloadCard('statefulsets', 'StatefulSets', 'storage'),
                createWorkloadCard('daemonsets', 'DaemonSets', 'widgets'),
                createWorkloadCard('jobs', 'Jobs', 'build'),
                createWorkloadCard('cronjobs', 'CronJobs', 'schedule')
              ]
            })
          ]
        })
      );
    }

    // Helper function to create resource cards
    function createResourceCard(type, title, icon) {
      return tag('div', {
        className: 'resource-card',
        style: {
          border: '1px solid var(--bdr-color)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-color)',
          transition: 'transform 0.2s ease'
        },
        onclick: () => {
          // In a real implementation, this would navigate to resource details
          toast(`Viewing ${title} would go here`);
        },
        children: [
          tag('div', {
            className: 'resource-icon',
            textContent: `_${icon}`, // Icon placeholder
            style: {
              fontSize: '2em',
              marginBottom: '8px'
            }
          }),
          tag('div', {
            className: 'resource-title',
            textContent: title,
            style: {
              fontWeight: 'bold'
            }
          }),
          tag('div', {
            className: 'resource-type',
            textContent: type,
            style: {
              fontSize: '0.8em',
              color: 'var(--txt-secondary-color)',
              marginTop: '4px'
            }
          })
        ]
      });
    }

    // Helper function to create workload cards
    function createWorkloadCard(type, title, icon) {
      return tag('div', {
        className: 'workload-card',
        style: {
          border: '1px solid var(--bdr-color)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-color)',
          transition: 'transform 0.2s ease'
        },
        onclick: () => {
          // In a real implementation, this would navigate to workload details
          toast(`Managing ${title} would go here`);
        },
        children: [
          tag('div', {
            className: 'workload-icon',
            textContent: `_${icon}`, // Icon placeholder
            style: {
              fontSize: '2em',
              marginBottom: '8px'
            }
          }),
          tag('div', {
            className: 'workload-title',
            textContent: title,
            style: {
              fontWeight: 'bold'
            }
          }),
          tag('div', {
            className: 'workload-type',
            textContent: type,
            style: {
              fontSize: '0.8em',
              color: 'var(--txt-secondary-color)',
              marginTop: '4px'
            }
          })
        ]
      });
    }

    // Function to show cluster form
    function showClusterForm(cluster = null) {
      const isEdit = !!cluster;
      const title = isEdit ? 'Edit Cluster' : 'New Cluster';
      
      // Create modal overlay
      const $modal = tag('div', {
        className: 'k8s-cluster-modal',
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
      
      const $form = tag('div', {
        className: 'cluster-form',
        style: {
          backgroundColor: 'var(--bg-color)',
          padding: '24px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto'
        },
        children: [
          tag('h3', {
            textContent: title,
            style: {
              margin: '0 0 16px 0'
            }
          }),
          // Name
          tag('div', {
            style: { marginBottom: '16px' },
            children: [
              tag('label', {
                textContent: 'Cluster Name',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'text',
                id: 'cluster-name',
                value: cluster?.name || '',
                placeholder: 'My Kubernetes Cluster',
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          }),
          // Server URL
          tag('div', {
            style: { marginBottom: '16px' },
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
                id: 'cluster-server',
                value: cluster?.server || '',
                placeholder: 'https://k8s.example.com:6443',
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          }),
          // Context
          tag('div', {
            style: { marginBottom: '16px' },
            children: [
              tag('label', {
                textContent: 'Context',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'text',
                id: 'cluster-context',
                value: cluster?.context || '',
                placeholder: 'my-context',
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          }),
          // Default Namespace
          tag('div', {
            style: { marginBottom: '16px' },
            children: [
              tag('label', {
                textContent: 'Default Namespace',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'text',
                id: 'cluster-namespace',
                value: cluster?.namespace || 'default',
                placeholder: 'default',
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          }),
          // Authentication section
          tag('div', {
            style: { marginBottom: '16px' },
            children: [
              tag('h4', {
                textContent: 'Authentication',
                style: {
                  marginBottom: '8px'
                }
              }),
              // Token
              tag('div', {
                style: { marginBottom: '8px' },
                children: [
                  tag('label', {
                    textContent: 'Authentication Token',
                    style: {
                      display: 'block',
                      marginBottom: '4px',
                      fontWeight: 'bold'
                    }
                  }),
                  tag('input', {
                    type: 'password',
                    id: 'cluster-token',
                    value: cluster?.token || '',
                    placeholder: 'Enter authentication token',
                    style: {
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--bdr-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--txt-color)'
                    }
                  })
                ]
              }),
              // Username/Password (for basic auth)
              tag('div', {
                style: { display: 'flex', gap: '8px', marginBottom: '8px' },
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
                        id: 'cluster-username',
                        value: cluster?.username || '',
                        placeholder: 'Username',
                        style: {
                          width: '100%',
                          padding: '8px',
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
                        id: 'cluster-password',
                        value: cluster?.password || '',
                        placeholder: 'Password',
                        style: {
                          width: '100%',
                          padding: '8px',
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
              // Certificate paths
              tag('div', {
                style: { display: 'flex', gap: '8px' },
                children: [
                  tag('div', {
                    style: { flex: 1 },
                    children: [
                      tag('label', {
                        textContent: 'Client Cert Path',
                        style: {
                          display: 'block',
                          marginBottom: '4px',
                          fontWeight: 'bold'
                        }
                      }),
                      tag('input', {
                        type: 'text',
                        id: 'cluster-cert',
                        value: cluster?.certPath || '',
                        placeholder: '/path/to/client.crt',
                        style: {
                          width: '100%',
                          padding: '8px',
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
                        textContent: 'CA Cert Path',
                        style: {
                          display: 'block',
                          marginBottom: '4px',
                          fontWeight: 'bold'
                        }
                      }),
                      tag('input', {
                        type: 'text',
                        id: 'cluster-ca-cert',
                        value: cluster?.caCertPath || '',
                        placeholder: '/path/to/ca.crt',
                        style: {
                          width: '100%',
                          padding: '8px',
                          border: '1px solid var(--bdr-color)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--txt-color)'
                        }
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          // Form buttons
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
                onclick: () => saveCluster(cluster?.id),
                style: {
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer'
                }
              })
            ]
          })
        ]
      });
      
      $modal.appendChild($form);
      document.body.appendChild($modal);
    }

    // Function to save cluster
    async function saveCluster(existingId = null) {
      const name = document.getElementById('cluster-name').value.trim();
      const server = document.getElementById('cluster-server').value.trim();
      const context = document.getElementById('cluster-context').value.trim();
      const namespace = document.getElementById('cluster-namespace').value.trim() || 'default';
      const token = document.getElementById('cluster-token').value.trim();
      const username = document.getElementById('cluster-username').value.trim();
      const password = document.getElementById('cluster-password').value.trim();
      const certPath = document.getElementById('cluster-cert').value.trim();
      const caCertPath = document.getElementById('cluster-ca-cert').value.trim();

      if (!name || !server) {
        toast('Please fill in the required fields: Name and Server URL');
        return;
      }

      // Prepare profile object
      const profile = {
        id: existingId || `cluster_${Date.now()}`,
        name,
        server,
        context: context || undefined,
        namespace,
        token: token || undefined,
        username: username || undefined,
        password: password || undefined,
        certPath: certPath || undefined,
        caCertPath: caCertPath || undefined
      };

      try {
        // Test connection before saving
        await K8sManager.testConnection(profile);
        
        // Save the cluster
        await K8sManager.addConnection(profile);
        
        toast(`Cluster "${name}" ${existingId ? 'updated' : 'created'} successfully!`);
        
        // Close modal and refresh list
        document.body.removeChild(document.querySelector('.k8s-cluster-modal'));
        loadClusters();
      } catch (error) {
        toast(`Error ${existingId ? 'updating' : 'creating'} cluster: ${error.message}`);
      }
    }

    // Function to connect to a cluster
    async function connectToCluster(clusterId) {
      try {
        toast('Testing connection to cluster...');
        // Test the connection
        await K8sManager.testConnection(k8sConnections.get(clusterId));
        toast('Connected to cluster successfully!');
        
        // In a real implementation, this might switch to a resources view
        // For now, we'll just show a success message
      } catch (error) {
        toast(`Connection failed: ${error.message}`);
      }
    }

    // Function to delete a cluster
    async function deleteCluster(clusterId) {
      if (confirm('Are you sure you want to delete this cluster connection?')) {
        try {
          K8sManager.removeConnection(clusterId);
          toast('Cluster connection deleted successfully!');
          loadClusters();
        } catch (error) {
          toast(`Error deleting cluster: ${error.message}`);
        }
      }
    }

    // Assemble the UI
    $container.appendChild($header);
    $container.appendChild($tabs);
    $container.appendChild($contentArea);

    return $container;

  } catch (error) {
    console.error('Error creating K8s Manager UI:', error);
    toast(`Error creating K8s Manager UI: ${error.message}`);
    return tag('div', { textContent: `Error: ${error.message}` });
  }
}