/**
 * Remote File Manager for QwenPad IDE
 * Provides UI for managing files over SSH/SFTP
 */

import sftp from '../../plugins/sftp/www/sftp';
import SSHManager from '../../plugins/ssh-manager/www/sshmanager';
import toast from '../components/toast';

export default class RemoteFileManager {
  constructor(container) {
    this.container = container;
    this.currentConnection = null;
    this.currentPath = '/';
    this.connectionProfiles = [];
    this.fileList = [];
    
    this._initialize();
  }

  _initialize() {
    // Load connection profiles
    this.connectionProfiles = SSHManager.getConnections();
    
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$remoteContainer = tag('div', {
      className: 'remote-file-manager-container',
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
      className: 'remote-file-manager-header',
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
              textContent: 'Remote File Manager',
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

    // Connection selector
    this.$connectionSelector = tag('div', {
      className: 'remote-connection-selector',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      children: [
        tag('span', {
          textContent: 'Connection:',
          style: { fontWeight: 'bold' }
        }),
        tag('select', {
          id: 'remote-connection-select',
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
            fontSize: '0.9em'
          }
        })
      ]
    });

    // Path navigation
    this.$pathNavigator = tag('div', {
      className: 'remote-path-navigator',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      children: [
        tag('button', {
          textContent: '←',
          onclick: () => this._goUp(),
          disabled: true,
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
        tag('input', {
          id: 'remote-current-path',
          type: 'text',
          value: '/',
          style: {
            flex: 1,
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onkeypress: (e) => {
            if (e.key === 'Enter') {
              this._navigateToPath(e.target.value);
            }
          }
        }),
        tag('button', {
          textContent: 'Go',
          onclick: () => {
            const path = document.getElementById('remote-current-path').value;
            this._navigateToPath(path);
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
        })
      ]
    });

    // File list
    this.$fileList = tag('div', {
      className: 'remote-file-list',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0'
      }
    });

    // Action buttons
    this.$actions = tag('div', {
      className: 'remote-actions',
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
          textContent: 'Upload',
          onclick: () => this._uploadFile(),
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
          textContent: 'Download',
          onclick: () => this._downloadFile(),
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
          textContent: 'New Folder',
          onclick: () => this._createFolder(),
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
          onclick: () => this._deleteFile(),
          style: {
            padding: '4px 8px',
            border: '1px solid #ff4757',
            borderRadius: '4px',
            backgroundColor: '#ff4757',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9em'
          }
        }),
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
        })
      ]
    });

    // Status bar
    this.$statusBar = tag('div', {
      className: 'remote-status-bar',
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
          id: 'remote-status-text',
          textContent: 'Not connected'
        }),
        tag('span', {
          id: 'remote-file-count',
          textContent: '0 items'
        })
      ]
    });

    // Assemble the UI
    this.$remoteContainer.appendChild(this.$header);
    this.$remoteContainer.appendChild(this.$connectionSelector);
    this.$remoteContainer.appendChild(this.$pathNavigator);
    this.$remoteContainer.appendChild(this.$fileList);
    this.$remoteContainer.appendChild(this.$actions);
    this.$remoteContainer.appendChild(this.$statusBar);

    // Add to container
    this.container.appendChild(this.$remoteContainer);

    // Populate connection selector
    this._populateConnectionSelector();
  }

  _populateConnectionSelector() {
    const select = document.getElementById('remote-connection-select');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '<option value="">Select a connection...</option>';

    // Add connections
    this.connectionProfiles.forEach(profile => {
      const option = tag('option', {
        value: profile.id,
        textContent: profile.name
      });
      select.appendChild(option);
    });
  }

  _selectConnection(connectionId) {
    if (!connectionId) return;

    const profile = this.connectionProfiles.find(p => p.id === connectionId);
    if (profile) {
      this.currentConnection = profile;
      this._updateStatusBar(`Selected: ${profile.name}`, 'ready');
    }
  }

  _addConnection() {
    // This would open the SSH manager to add a new connection
    // For now, we'll just show a toast
    toast('Please use SSH Manager to add new connections', 'info');
  }

  async _connect() {
    if (!this.currentConnection) {
      toast('Please select a connection first', 'warning');
      return;
    }

    try {
      this._updateStatusBar('Connecting...', 'connecting');

      // Connect using the SSH manager
      if (this.currentConnection.authType === 'password') {
        await new Promise((resolve, reject) => {
          sftp.connectUsingPassword(
            this.currentConnection.host,
            this.currentConnection.port || 22,
            this.currentConnection.username,
            this.currentConnection.password,
            () => {
              this._updateStatusBar(`Connected to ${this.currentConnection.name}`, 'connected');
              resolve();
            },
            (error) => {
              this._updateStatusBar('Connection failed', 'error');
              reject(error);
            }
          );
        });
      } else if (this.currentConnection.authType === 'key') {
        // Get the key from SSH manager
        const keyInfo = SSHManager.getSSHKey(this.currentConnection.keyId);
        if (!keyInfo) {
          throw new Error('SSH key not found');
        }

        await new Promise((resolve, reject) => {
          sftp.connectUsingKeyFile(
            this.currentConnection.host,
            this.currentConnection.port || 22,
            this.currentConnection.username,
            keyInfo.privateKeyPath,
            this.currentConnection.passphrase || '',
            () => {
              this._updateStatusBar(`Connected to ${this.currentConnection.name}`, 'connected');
              resolve();
            },
            (error) => {
              this._updateStatusBar('Connection failed', 'error');
              reject(error);
            }
          );
        });
      }

      // Navigate to home directory
      await this._navigateToPath('/');
    } catch (error) {
      console.error('Connection error:', error);
      toast(`Connection failed: ${error.message}`, 'error');
      this._updateStatusBar('Connection failed', 'error');
    }
  }

  async _navigateToPath(path) {
    if (!path) return;

    try {
      this._updateStatusBar('Loading directory...', 'loading');
      
      // Change directory
      await new Promise((resolve, reject) => {
        sftp.pwd((currentPath) => {
          if (path !== currentPath) {
            // TODO: Implement cd command in SFTP plugin
            // For now, we'll just update the path field
            document.getElementById('remote-current-path').value = path;
            this.currentPath = path;
          }
          resolve();
        }, reject);
      });

      // List directory contents
      await this._listDirectory(path);
    } catch (error) {
      console.error('Navigation error:', error);
      toast(`Failed to navigate to ${path}: ${error.message}`, 'error');
      this._updateStatusBar('Navigation failed', 'error');
    }
  }

  async _listDirectory(path) {
    try {
      const files = await new Promise((resolve, reject) => {
        sftp.lsDir(path, (fileList) => {
          resolve(fileList);
        }, reject);
      });

      this.fileList = files;
      this._renderFileList(files);
      this._updateStatusBar(`Loaded ${files.length} items`, 'loaded');
      document.getElementById('remote-file-count').textContent = `${files.length} items`;
    } catch (error) {
      console.error('Directory listing error:', error);
      toast(`Failed to list directory: ${error.message}`, 'error');
      this._updateStatusBar('Directory listing failed', 'error');
    }
  }

  _renderFileList(files) {
    this.$fileList.innerHTML = '';

    if (!files || files.length === 0) {
      this.$fileList.appendChild(
        tag('div', {
          textContent: 'No files found',
          style: {
            textAlign: 'center',
            padding: '32px',
            color: 'var(--txt-secondary-color)'
          }
        })
      );
      return;
    }

    // Sort files: directories first, then alphabetically
    const sortedFiles = [...files].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    sortedFiles.forEach(file => {
      const $fileItem = tag('div', {
        className: 'remote-file-item',
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid var(--bdr-color)',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        },
        onmouseover: function() {
          this.style.backgroundColor = 'var(--hover-bg, #f8f9fa)';
        },
        onmouseout: function() {
          this.style.backgroundColor = '';
        },
        onclick: () => this._handleFileClick(file),
        children: [
          tag('span', {
            className: file.isDirectory ? 'icon folder' : this._getFileIcon(file.name),
            style: {
              fontSize: '1.2em',
              marginRight: '8px',
              color: file.isDirectory ? 'var(--folder-color, #ffc107)' : 'var(--file-color, #6c757d)'
            }
          }),
          tag('span', {
            textContent: file.name,
            style: {
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          }),
          tag('span', {
            textContent: file.isDirectory ? '' : this._formatFileSize(file.size),
            style: {
              fontSize: '0.9em',
              color: 'var(--txt-secondary-color)',
              marginLeft: '8px'
            }
          }),
          tag('span', {
            textContent: this._formatDate(file.lastModified),
            style: {
              fontSize: '0.9em',
              color: 'var(--txt-secondary-color)',
              marginLeft: '8px'
            }
          })
        ]
      });

      this.$fileList.appendChild($fileItem);
    });
  }

  _getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    const iconMap = {
      'js': 'icon javascript',
      'ts': 'icon typescript',
      'py': 'icon python',
      'java': 'icon java',
      'kt': 'icon kotlin',
      'go': 'icon go',
      'rs': 'icon rust',
      'cpp': 'icon cpp',
      'c': 'icon c',
      'h': 'icon c',
      'hpp': 'icon cpp',
      'cs': 'icon csharp',
      'php': 'icon php',
      'rb': 'icon ruby',
      'swift': 'icon swift',
      'dart': 'icon dart',
      'html': 'icon html',
      'css': 'icon css',
      'scss': 'icon scss',
      'sass': 'icon sass',
      'md': 'icon markdown',
      'json': 'icon json',
      'xml': 'icon xml',
      'yaml': 'icon yaml',
      'yml': 'icon yaml',
      'sql': 'icon database',
      'sh': 'icon terminal',
      'bash': 'icon terminal',
      'txt': 'icon text',
      'pdf': 'icon picture_as_pdf',
      'jpg': 'icon image',
      'jpeg': 'icon image',
      'png': 'icon image',
      'gif': 'icon image',
      'svg': 'icon image',
      'zip': 'icon archive',
      'tar': 'icon archive',
      'gz': 'icon archive',
      'rar': 'icon archive'
    };
    
    return iconMap[ext] || 'icon insert_drive_file';
  }

  _formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  _formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }

  _handleFileClick(file) {
    if (file.isDirectory) {
      // Navigate into directory
      const newPath = this.currentPath === '/' ? `/${file.name}` : `${this.currentPath}/${file.name}`;
      this._navigateToPath(newPath);
    } else {
      // Handle file selection (could open in editor, download, etc.)
      toast(`Selected file: ${file.name}`, 'info');
    }
  }

  _goUp() {
    if (this.currentPath === '/') return;
    
    const parentPath = this.currentPath.split('/').slice(0, -1).join('/') || '/';
    this._navigateToPath(parentPath);
  }

  _uploadFile() {
    toast('Upload functionality would be implemented here', 'info');
    // This would open a file picker and upload selected files
  }

  _downloadFile() {
    toast('Download functionality would be implemented here', 'info');
    // This would download selected files to local storage
  }

  _createFolder() {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const fullPath = this.currentPath === '/' ? `/${folderName}` : `${this.currentPath}/${folderName}`;
      
      sftp.mkdir(fullPath, () => {
        toast(`Folder ${folderName} created successfully`, 'success');
        this._refresh();
      }, (error) => {
        console.error('Folder creation error:', error);
        toast(`Failed to create folder: ${error.message}`, 'error');
      });
    } catch (error) {
      console.error('Folder creation error:', error);
      toast(`Failed to create folder: ${error.message}`, 'error');
    }
  }

  _deleteFile() {
    const selectedFiles = this._getSelectedFiles();
    if (selectedFiles.length === 0) {
      toast('Please select files to delete', 'warning');
      return;
    }

    const confirmMsg = selectedFiles.length === 1 
      ? `Are you sure you want to delete ${selectedFiles[0].name}?`
      : `Are you sure you want to delete ${selectedFiles.length} items?`;

    if (!confirm(confirmMsg)) return;

    try {
      let successCount = 0;
      let errorCount = 0;

      selectedFiles.forEach(file => {
        const fullPath = this.currentPath === '/' ? `/${file.name}` : `${this.currentPath}/${file.name}`;
        
        sftp.rm(fullPath, false, false, () => {
          successCount++;
          if (successCount + errorCount === selectedFiles.length) {
            if (errorCount === 0) {
              toast(`${successCount} items deleted successfully`, 'success');
            } else {
              toast(`${successCount} items deleted, ${errorCount} failed`, 'warning');
            }
            this._refresh();
          }
        }, (error) => {
          errorCount++;
          console.error(`Failed to delete ${file.name}:`, error);
          if (successCount + errorCount === selectedFiles.length) {
            if (errorCount === 0) {
              toast(`${successCount} items deleted successfully`, 'success');
            } else {
              toast(`${successCount} items deleted, ${errorCount} failed`, 'warning');
            }
            this._refresh();
          }
        });
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast(`Failed to delete items: ${error.message}`, 'error');
    }
  }

  _getSelectedFiles() {
    // In a real implementation, this would return selected files
    // For now, we'll return an empty array
    return [];
  }

  _refresh() {
    if (this.currentPath) {
      this._navigateToPath(this.currentPath);
    }
  }

  _updateStatusBar(text, status) {
    const statusElement = document.getElementById('remote-status-text');
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
        case 'loading':
          statusElement.style.color = 'var(--warning-color, #ffa502)';
          break;
        default:
          statusElement.style.color = 'var(--txt-secondary-color)';
      }
    }
  }

  open() {
    this.$remoteContainer.style.display = 'flex';
  }

  close() {
    this.$remoteContainer.style.display = 'none';
    
    // Close SFTP connection
    sftp.close(() => {
      this._updateStatusBar('Disconnected', 'disconnected');
    }, () => {
      // Ignore errors on close
    });
  }

  // Static method to check if SFTP is available
  static isAvailable() {
    return typeof sftp !== 'undefined';
  }
}