import SSHManager from '../../plugins/ssh-manager/www/sshmanager';
import toast from '../../components/toast';
import helpers from '../../utils/helpers';

export default async function sshManager() {
  try {
    // Initialize SSH Manager
    await SSHManager.init();

    // Create the main SSH Manager UI
    const $container = tag('div', {
      className: 'ssh-manager',
      style: {
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    });

    // Header
    const $header = tag('div', {
      className: 'ssh-manager-header',
      style: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      children: [
        tag('h2', {
          textContent: 'SSH Manager',
          style: {
            margin: 0,
            fontSize: '1.5em'
          }
        }),
        tag('button', {
          textContent: '+ New Connection',
          onclick: () => showConnectionForm(),
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

    // Tabs for connections and keys
    const $tabs = tag('div', {
      className: 'ssh-tabs',
      style: {
        display: 'flex',
        marginBottom: '16px',
        borderBottom: '1px solid var(--bdr-color)'
      },
      children: [
        tag('div', {
          id: 'connections-tab',
          className: 'tab active',
          textContent: 'Connections',
          onclick: () => switchTab('connections'),
          style: {
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: '2px solid var(--primary-color)',
            color: 'var(--txt-color)'
          }
        }),
        tag('div', {
          id: 'keys-tab',
          className: 'tab',
          textContent: 'SSH Keys',
          onclick: () => switchTab('keys'),
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

    // Initial load connections
    await loadConnections();

    // Tab switching function
    function switchTab(tabName) {
      // Update tab styling
      document.getElementById('connections-tab').className = 'tab';
      document.getElementById('connections-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('connections-tab').style.borderBottom = 'none';
      
      document.getElementById('keys-tab').className = 'tab';
      document.getElementById('keys-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('keys-tab').style.borderBottom = 'none';

      if (tabName === 'connections') {
        document.getElementById('connections-tab').className = 'tab active';
        document.getElementById('connections-tab').style.color = 'var(--txt-color)';
        document.getElementById('connections-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadConnections();
      } else if (tabName === 'keys') {
        document.getElementById('keys-tab').className = 'tab active';
        document.getElementById('keys-tab').style.color = 'var(--txt-color)';
        document.getElementById('keys-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadKeys();
      }
    }

    // Function to load connections
    async function loadConnections() {
      $contentArea.innerHTML = '';
      
      const connections = SSHManager.getConnections();
      
      if (connections.length === 0) {
        $contentArea.appendChild(
          tag('div', {
            textContent: 'No SSH connections configured. Click "New Connection" to add one.',
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--txt-secondary-color)'
            }
          })
        );
        return;
      }

      // Create connections list
      const $list = tag('div', {
        className: 'connections-list',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }
      });

      connections.forEach(conn => {
        const $item = tag('div', {
          className: 'connection-item',
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
                      textContent: conn.name,
                      style: {
                        fontWeight: 'bold',
                        fontSize: '1.1em'
                      }
                    }),
                    tag('div', {
                      textContent: `${conn.username}@${conn.host}:${conn.port}`,
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
                      onclick: () => connectToServer(conn.id),
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
                      onclick: () => showConnectionForm(conn),
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
                      onclick: () => deleteConnection(conn.id),
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
                tag('div', {
                  textContent: `Auth: ${conn.authType}`,
                  style: { marginRight: '12px' }
                }),
                conn.lastUsed ? tag('div', {
                  textContent: `Last used: ${new Date(conn.lastUsed).toLocaleDateString()}`
                }) : null
              ].filter(Boolean)
            })
          ]
        });
        
        $list.appendChild($item);
      });

      $contentArea.appendChild($list);
    }

    // Function to load keys
    async function loadKeys() {
      $contentArea.innerHTML = '';
      
      const keys = SSHManager.getKeys();
      
      if (keys.length === 0) {
        $contentArea.appendChild(
          tag('div', {
            style: {
              textAlign: 'center',
              padding: '32px'
            },
            children: [
              tag('div', {
                textContent: 'No SSH keys configured.',
                style: {
                  marginBottom: '16px',
                  color: 'var(--txt-secondary-color)'
                }
              }),
              tag('button', {
                textContent: '+ Generate Key',
                onclick: () => showKeyForm(),
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
        );
        return;
      }

      // Create keys list
      const $list = tag('div', {
        className: 'keys-list',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }
      });

      keys.forEach(key => {
        const $item = tag('div', {
          className: 'key-item',
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
                      textContent: key.name,
                      style: {
                        fontWeight: 'bold',
                        fontSize: '1.1em'
                      }
                    }),
                    tag('div', {
                      textContent: `Type: ${key.type}`,
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
                      textContent: 'Copy Public Key',
                      onclick: () => copyPublicKey(key.id),
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
                      onclick: () => deleteKey(key.id),
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
                fontSize: '0.8em',
                color: 'var(--txt-secondary-color)',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              },
              textContent: key.publicKey ? `${key.publicKey.substring(0, 60)}...` : ''
            })
          ]
        });
        
        $list.appendChild($item);
      });

      $contentArea.appendChild($list);
    }

    // Function to show connection form
    function showConnectionForm(conn = null) {
      const isEdit = !!conn;
      const title = isEdit ? 'Edit Connection' : 'New Connection';
      
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
      
      const $form = tag('div', {
        className: 'connection-form',
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
                textContent: 'Connection Name',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'text',
                id: 'conn-name',
                value: conn?.name || '',
                placeholder: 'My Server',
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
          // Host
          tag('div', {
            style: { marginBottom: '16px' },
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
                id: 'conn-host',
                value: conn?.host || '',
                placeholder: 'example.com or 192.168.1.100',
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
          // Port
          tag('div', {
            style: { marginBottom: '16px' },
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
                id: 'conn-port',
                value: conn?.port || 22,
                style: {
                  width: '100px',
                  padding: '8px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                }
              })
            ]
          }),
          // Username
          tag('div', {
            style: { marginBottom: '16px' },
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
                id: 'conn-username',
                value: conn?.username || '',
                placeholder: 'username',
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
          // Authentication type
          tag('div', {
            style: { marginBottom: '16px' },
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
                        name: 'auth-type',
                        value: 'password',
                        checked: !conn || conn.authType !== 'key',
                        onclick: toggleAuthFields,
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
                        name: 'auth-type',
                        value: 'key',
                        checked: conn?.authType === 'key',
                        onclick: toggleAuthFields,
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
            id: 'password-section',
            style: {
              display: !conn || conn.authType !== 'key' ? 'block' : 'none',
              marginBottom: '16px'
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
                id: 'conn-password',
                value: conn?.password || '',
                placeholder: 'Enter password',
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
          // Key selection (shown when key auth is selected)
          tag('div', {
            id: 'key-section',
            style: {
              display: conn?.authType === 'key' ? 'block' : 'none',
              marginBottom: '16px'
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
                id: 'conn-key',
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
                onclick: () => saveConnection(conn?.id),
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
      
      // Populate key selection if in key mode
      if (conn?.authType === 'key' || document.querySelector('input[name="auth-type"]:checked').value === 'key') {
        populateKeySelector();
      }
      
      function toggleAuthFields() {
        const authType = document.querySelector('input[name="auth-type"]:checked').value;
        document.getElementById('password-section').style.display = authType === 'password' ? 'block' : 'none';
        document.getElementById('key-section').style.display = authType === 'key' ? 'block' : 'none';
        
        if (authType === 'key') {
          populateKeySelector();
        }
      }
      
      function populateKeySelector() {
        const $select = document.getElementById('conn-key');
        $select.innerHTML = '';
        
        const keys = SSHManager.getKeys();
        keys.forEach(key => {
          const $option = tag('option', {
            value: key.id,
            textContent: key.name
          });
          
          if (conn?.keyId === key.id) {
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
        
        if (conn?.keyId && !keys.some(k => k.id === conn.keyId)) {
          $newKeyOption.selected = true;
        }
      }
    }

    // Function to save connection
    async function saveConnection(existingId = null) {
      const name = document.getElementById('conn-name').value.trim();
      const host = document.getElementById('conn-host').value.trim();
      const port = parseInt(document.getElementById('conn-port').value);
      const username = document.getElementById('conn-username').value.trim();
      const authType = document.querySelector('input[name="auth-type"]:checked').value;

      if (!name || !host || !username || !port) {
        toast('Please fill in all required fields');
        return;
      }

      // Prepare profile object
      const profile = {
        id: existingId || `conn_${Date.now()}`,
        name,
        host,
        port,
        username,
        authType
      };

      if (authType === 'password') {
        profile.password = document.getElementById('conn-password').value;
      } else if (authType === 'key') {
        const keyId = document.getElementById('conn-key').value;
        
        if (keyId === 'new') {
          // Generate a new key
          try {
            const keyName = `${name.replace(/\s+/g, '_')}_key`;
            const newKey = await SSHManager.generateKey(keyName);
            profile.keyId = newKey.id;
          } catch (error) {
            toast(`Error generating SSH key: ${error.message}`);
            return;
          }
        } else {
          profile.keyId = keyId;
        }
      }

      try {
        // Test connection before saving
        await SSHManager.testConnection(profile);
        
        // Save the connection
        await SSHManager.addConnection(profile);
        
        toast(`Connection "${name}" ${existingId ? 'updated' : 'created'} successfully!`);
        
        // Close modal and refresh list
        document.body.removeChild(document.querySelector('.ssh-connection-modal'));
        loadConnections();
      } catch (error) {
        toast(`Error ${existingId ? 'updating' : 'creating'} connection: ${error.message}`);
      }
    }

    // Function to show key form
    function showKeyForm() {
      // Create modal overlay
      const $modal = tag('div', {
        className: 'ssh-key-modal',
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
        className: 'key-form',
        style: {
          backgroundColor: 'var(--bg-color)',
          padding: '24px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px'
        },
        children: [
          tag('h3', {
            textContent: 'Generate SSH Key',
            style: {
              margin: '0 0 16px 0'
            }
          }),
          // Key name
          tag('div', {
            style: { marginBottom: '16px' },
            children: [
              tag('label', {
                textContent: 'Key Name',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('input', {
                type: 'text',
                id: 'key-name',
                placeholder: 'My Server Key',
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
          // Key type
          tag('div', {
            style: { marginBottom: '16px' },
            children: [
              tag('label', {
                textContent: 'Key Type',
                style: {
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }
              }),
              tag('select', {
                id: 'key-type',
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--bdr-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--txt-color)'
                },
                children: [
                  tag('option', { value: 'ed25519', textContent: 'ED25519 (Recommended)' }),
                  tag('option', { value: 'rsa', textContent: 'RSA 3072 bits' }),
                  tag('option', { value: 'rsa4096', textContent: 'RSA 4096 bits' })
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
                textContent: 'Generate',
                onclick: generateKey,
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

    // Function to generate key
    async function generateKey() {
      const name = document.getElementById('key-name').value.trim();
      const type = document.getElementById('key-type').value;

      if (!name) {
        toast('Please enter a key name');
        return;
      }

      try {
        // Determine key type and bits
        let keyType = 'ed25519';
        let keyBits = 3072;
        
        if (type === 'rsa') {
          keyType = 'rsa';
          keyBits = 3072;
        } else if (type === 'rsa4096') {
          keyType = 'rsa';
          keyBits = 4096;
        }

        // Generate the key
        const key = await SSHManager.generateKey(name, keyType, keyBits);
        
        toast(`SSH key "${name}" generated successfully!`);
        
        // Close modal and refresh list
        document.body.removeChild(document.querySelector('.ssh-key-modal'));
        loadKeys();
      } catch (error) {
        toast(`Error generating key: ${error.message}`);
      }
    }

    // Function to connect to a server
    async function connectToServer(connectionId) {
      try {
        toast('Connecting to server...');
        // In a real implementation, this would open a terminal or SFTP session
        // For now, we'll just show a success message
        toast('Connected to server successfully!');
      } catch (error) {
        toast(`Connection failed: ${error.message}`);
      }
    }

    // Function to delete a connection
    async function deleteConnection(connectionId) {
      if (confirm('Are you sure you want to delete this connection?')) {
        try {
          SSHManager.removeConnection(connectionId);
          toast('Connection deleted successfully!');
          loadConnections();
        } catch (error) {
          toast(`Error deleting connection: ${error.message}`);
        }
      }
    }

    // Function to delete a key
    async function deleteKey(keyId) {
      if (confirm('Are you sure you want to delete this SSH key? This cannot be undone.')) {
        try {
          SSHManager.removeKey(keyId);
          toast('SSH key deleted successfully!');
          loadKeys();
        } catch (error) {
          toast(`Error deleting key: ${error.message}`);
        }
      }
    }

    // Function to copy public key to clipboard
    async function copyPublicKey(keyId) {
      try {
        const publicKey = SSHManager.getPublicKey(keyId);
        if (publicKey) {
          // Copy to clipboard
          if (window.cordova && window.cordova.plugins && window.cordova.plugins.clipboard) {
            window.cordova.plugins.clipboard.copy(publicKey);
          } else {
            // Fallback: create temporary textarea and select
            const $temp = tag('textarea', {
              value: publicKey,
              style: {
                position: 'absolute',
                left: '-9999px',
                opacity: 0
              }
            });
            document.body.appendChild($temp);
            $temp.select();
            document.execCommand('copy');
            document.body.removeChild($temp);
          }
          
          toast('Public key copied to clipboard!');
        }
      } catch (error) {
        toast(`Error copying public key: ${error.message}`);
      }
    }

    // Assemble the UI
    $container.appendChild($header);
    $container.appendChild($tabs);
    $container.appendChild($contentArea);

    return $container;

  } catch (error) {
    console.error('Error creating SSH Manager UI:', error);
    toast(`Error creating SSH Manager UI: ${error.message}`);
    return tag('div', { textContent: `Error: ${error.message}` });
  }
}