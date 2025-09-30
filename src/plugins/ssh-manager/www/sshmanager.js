const sftp = require("../sftp/www/sftp");

// In-memory storage for connections and keys (would use secure storage in production)
const connections = new Map();
const sshKeys = new Map();

const SSHManager = {
  /**
   * Creates and stores a new SSH connection profile
   * @param {object} profile - SSH connection profile
   * @param {string} profile.id - Connection ID
   * @param {string} profile.name - Connection name
   * @param {string} profile.host - SSH host
   * @param {number} profile.port - SSH port
   * @param {string} profile.username - SSH username
   * @param {string} profile.authType - 'password' or 'key'
   * @param {string} [profile.password] - SSH password (if authType is 'password')
   * @param {string} [profile.keyId] - SSH key ID (if authType is 'key')
   * @param {string} [profile.passphrase] - Key passphrase (if applicable)
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async addConnection(profile) {
    try {
      if (!profile.id || !profile.host || !profile.username) {
        throw new Error('Missing required connection parameters');
      }

      if (profile.authType === 'key' && !profile.keyId) {
        throw new Error('Key ID required for key-based authentication');
      }

      // Validate the connection
      await this.testConnection(profile);

      // Store the connection
      connections.set(profile.id, {
        ...profile,
        lastUsed: new Date().toISOString()
      });

      // Save to local storage
      this._saveConnections();

      return true;
    } catch (error) {
      console.error('Error adding SSH connection:', error);
      throw error;
    }
  },

  /**
   * Tests an SSH connection
   * @param {object} profile - SSH connection profile to test
   * @returns {Promise<boolean>} - Returns true if connection is successful
   */
  async testConnection(profile) {
    try {
      return new Promise((resolve, reject) => {
        if (profile.authType === 'password') {
          sftp.connectUsingPassword(
            profile.host,
            profile.port || 22,
            profile.username,
            profile.password,
            () => {
              // Success callback
              sftp.close(() => {}, () => {});
              resolve(true);
            },
            (error) => {
              // Failure callback
              reject(new Error(`Connection failed: ${error}`));
            }
          );
        } else if (profile.authType === 'key') {
          const key = sshKeys.get(profile.keyId);
          if (!key) {
            reject(new Error(`SSH key ${profile.keyId} not found`));
            return;
          }

          // For key-based auth, we'd need the private key file path
          // This is simplified for the example
          sftp.connectUsingKeyFile(
            profile.host,
            profile.port || 22,
            profile.username,
            key.privateKeyPath,
            profile.passphrase || '',
            () => {
              // Success callback
              sftp.close(() => {}, () => {});
              resolve(true);
            },
            (error) => {
              // Failure callback
              reject(new Error(`Connection failed: ${error}`));
            }
          );
        } else {
          reject(new Error(`Unsupported auth type: ${profile.authType}`));
        }
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  },

  /**
   * Connects to a stored SSH connection
   * @param {string} connectionId - Connection ID
   * @returns {Promise<string>} - Returns session ID
   */
  async connect(connectionId) {
    try {
      const profile = connections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      return new Promise((resolve, reject) => {
        if (profile.authType === 'password') {
          sftp.connectUsingPassword(
            profile.host,
            profile.port || 22,
            profile.username,
            profile.password,
            (sessionId) => {
              // Update last used time
              profile.lastUsed = new Date().toISOString();
              connections.set(connectionId, profile);
              this._saveConnections();
              resolve(sessionId);
            },
            (error) => {
              reject(new Error(`Connection failed: ${error}`));
            }
          );
        } else if (profile.authType === 'key') {
          const key = sshKeys.get(profile.keyId);
          if (!key) {
            reject(new Error(`SSH key ${profile.keyId} not found`));
            return;
          }

          sftp.connectUsingKeyFile(
            profile.host,
            profile.port || 22,
            profile.username,
            key.privateKeyPath,
            profile.passphrase || '',
            (sessionId) => {
              // Update last used time
              profile.lastUsed = new Date().toISOString();
              connections.set(connectionId, profile);
              this._saveConnections();
              resolve(sessionId);
            },
            (error) => {
              reject(new Error(`Connection failed: ${error}`));
            }
          );
        }
      });
    } catch (error) {
      console.error('Error connecting:', error);
      throw error;
    }
  },

  /**
   * Lists all stored connections
   * @returns {Array} - Array of connection profiles
   */
  getConnections() {
    return Array.from(connections.values()).map(conn => ({
      id: conn.id,
      name: conn.name,
      host: conn.host,
      port: conn.port || 22,
      username: conn.username,
      authType: conn.authType,
      lastUsed: conn.lastUsed
    }));
  },

  /**
   * Removes a connection
   * @param {string} connectionId - Connection ID to remove
   * @returns {boolean} - Returns true if successful
   */
  removeConnection(connectionId) {
    const result = connections.delete(connectionId);
    this._saveConnections();
    return result;
  },

  /**
   * Generates a new SSH key pair
   * @param {string} keyName - Name for the key
   * @param {string} keyType - Type of key ('rsa', 'ed25519', etc.)
   * @param {number} keyBits - Key length in bits (for RSA)
   * @returns {Promise<object>} - Returns key information
   */
  async generateKey(keyName, keyType = 'ed25519', keyBits = 3072) {
    try {
      // Get data directory for storing keys
      const dataDir = window.DATA_STORAGE;
      const keyPath = `${dataDir}/ssh-keys/${keyName}`;
      
      // Create keys directory if it doesn't exist
      await this._createDirectory(`${dataDir}/ssh-keys`);
      
      // Generate the key using available tools
      let command = '';
      if (keyType === 'ed25519') {
        command = `ssh-keygen -t ed25519 -f "${keyPath}" -N ""`;
      } else if (keyType === 'rsa') {
        command = `ssh-keygen -t rsa -b ${keyBits} -f "${keyPath}" -N ""`;
      } else {
        throw new Error(`Unsupported key type: ${keyType}`);
      }
      
      // Execute the key generation command
      const result = await this._executeCommand(command);
      
      if (!result) {
        throw new Error('Failed to generate SSH key');
      }
      
      // Read the public key
      const publicKey = await this._readFile(`${keyPath}.pub`);
      
      // Store key info
      const keyInfo = {
        id: keyName,
        name: keyName,
        type: keyType,
        publicKey: publicKey,
        privateKeyPath: `${keyPath}`,
        publicKeyPath: `${keyPath}.pub`,
        created: new Date().toISOString()
      };
      
      sshKeys.set(keyName, keyInfo);
      this._saveKeys();
      
      return keyInfo;
    } catch (error) {
      console.error('Error generating SSH key:', error);
      throw error;
    }
  },

  /**
   * Adds an existing SSH key
   * @param {string} keyName - Name for the key
   * @param {string} privateKey - Private key content
   * @param {string} publicKey - Public key content
   * @returns {Promise<object>} - Returns key information
   */
  async addKey(keyName, privateKey, publicKey) {
    try {
      // Get data directory for storing keys
      const dataDir = window.DATA_STORAGE;
      const keyPath = `${dataDir}/ssh-keys/${keyName}`;
      
      // Create keys directory if it doesn't exist
      await this._createDirectory(`${dataDir}/ssh-keys`);
      
      // Write the keys to files
      await this._writeFile(`${keyPath}`, privateKey, 'private');
      await this._writeFile(`${keyPath}.pub`, publicKey, 'public');
      
      // Determine key type from key content
      let keyType = 'unknown';
      if (privateKey.includes('-----BEGIN OPENSSH PRIVATE KEY-----')) {
        keyType = 'ed25519'; // Simplified assumption
      } else if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        keyType = 'rsa';
      }
      
      // Store key info
      const keyInfo = {
        id: keyName,
        name: keyName,
        type: keyType,
        publicKey: publicKey,
        privateKeyPath: `${keyPath}`,
        publicKeyPath: `${keyPath}.pub`,
        created: new Date().toISOString()
      };
      
      sshKeys.set(keyName, keyInfo);
      this._saveKeys();
      
      return keyInfo;
    } catch (error) {
      console.error('Error adding SSH key:', error);
      throw error;
    }
  },

  /**
   * Lists all stored SSH keys
   * @returns {Array} - Array of key information
   */
  getKeys() {
    return Array.from(sshKeys.values()).map(key => ({
      id: key.id,
      name: key.name,
      type: key.type,
      publicKey: key.publicKey,
      created: key.created
    }));
  },

  /**
   * Removes an SSH key
   * @param {string} keyId - Key ID to remove
   * @returns {boolean} - Returns true if successful
   */
  removeKey(keyId) {
    const key = sshKeys.get(keyId);
    if (key) {
      // Remove the key files
      try {
        this._deleteFile(key.privateKeyPath);
        this._deleteFile(key.publicKeyPath);
      } catch (error) {
        console.error('Error deleting key files:', error);
        // Continue with removal even if file deletion fails
      }
      
      const result = sshKeys.delete(keyId);
      this._saveKeys();
      return result;
    }
    return false;
  },

  /**
   * Gets the public key content for a given key
   * @param {string} keyId - Key ID
   * @returns {string|null} - Public key content or null if not found
   */
  getPublicKey(keyId) {
    const key = sshKeys.get(keyId);
    return key ? key.publicKey : null;
  },

  /**
   * Executes a command on the device using the terminal
   * @private
   * @param {string} command - Command to execute
   * @returns {Promise<string>} - Command output
   */
  async _executeCommand(command) {
    // Use the terminal executor to run commands
    if (window.Executor) {
      return await window.Executor.execute(command);
    } else {
      throw new Error('Executor not available');
    }
  },

  /**
   * Creates a directory
   * @private
   * @param {string} path - Directory path to create
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _createDirectory(path) {
    try {
      if (window.system) {
        return new Promise((resolve, reject) => {
          window.system.mkdirs(path, () => resolve(true), reject);
        });
      } else {
        // Fallback to command execution
        await this._executeCommand(`mkdir -p "${path}"`);
        return true;
      }
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  },

  /**
   * Reads a file
   * @private
   * @param {string} path - File path to read
   * @returns {Promise<string>} - File content
   */
  async _readFile(path) {
    try {
      if (window.cordova && window.cordova.file) {
        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(path, (fileEntry) => {
            fileEntry.file((file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result);
              };
              reader.onerror = reject;
              reader.readAsText(file);
            }, reject);
          }, reject);
        });
      } else {
        // Fallback to command execution
        return await this._executeCommand(`cat "${path}"`);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  },

  /**
   * Writes content to a file
   * @private
   * @param {string} path - File path to write
   * @param {string} content - Content to write
   * @param {string} type - File type ('private' or 'public')
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _writeFile(path, content, type = 'private') {
    try {
      // Set appropriate permissions for private keys
      const isPrivate = type === 'private';
      const permissionCommand = isPrivate ? `chmod 600 "${path}"` : `chmod 644 "${path}"`;
      
      if (window.cordova && window.cordova.file) {
        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(window.DATA_STORAGE, (dirEntry) => {
            const fileName = path.substring(path.lastIndexOf('/') + 1);
            const filePath = path.substring(window.DATA_STORAGE.length);
            const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
            
            // Navigate to the correct directory
            let currentEntry = dirEntry;
            const pathParts = parentPath.split('/').filter(part => part.length > 0);
            
            // Create directory structure if needed
            this._createDirectory(path.substring(0, path.lastIndexOf('/')))
              .then(() => {
                // Create or get the file
                currentEntry.getFile(fileName, { create: true }, (fileEntry) => {
                  fileEntry.createWriter((fileWriter) => {
                    fileWriter.onwriteend = () => {
                      // Set file permissions
                      this._executeCommand(permissionCommand)
                        .then(() => resolve(true))
                        .catch(() => resolve(true)); // Continue even if chmod fails
                    };
                    fileWriter.onerror = reject;
                    fileWriter.write(content);
                  }, reject);
                }, reject);
              })
              .catch(reject);
          }, reject);
        });
      } else {
        // Fallback to command execution
        await this._executeCommand(`echo '${content.replace(/'/g, "'\"'\"'")}' > "${path}"`);
        await this._executeCommand(permissionCommand);
        return true;
      }
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  },

  /**
   * Deletes a file
   * @private
   * @param {string} path - File path to delete
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _deleteFile(path) {
    try {
      if (window.cordova && window.cordova.file) {
        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(path, (fileEntry) => {
            fileEntry.remove(() => resolve(true), reject);
          }, reject);
        });
      } else {
        await this._executeCommand(`rm -f "${path}"`);
        return true;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  /**
   * Saves connections to local storage
   * @private
   */
  _saveConnections() {
    const connectionsArray = Array.from(connections.entries()).map(([id, conn]) => ({
      id,
      name: conn.name,
      host: conn.host,
      port: conn.port,
      username: conn.username,
      authType: conn.authType,
      keyId: conn.keyId, // Only store reference to key, not the key itself
      lastUsed: conn.lastUsed
    }));
    
    localStorage.setItem('ssh_connections', JSON.stringify(connectionsArray));
  },

  /**
   * Loads connections from local storage
   * @private
   */
  _loadConnections() {
    try {
      const stored = localStorage.getItem('ssh_connections');
      if (stored) {
        const connectionsArray = JSON.parse(stored);
        connectionsArray.forEach(conn => {
          connections.set(conn.id, conn);
        });
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  },

  /**
   * Saves keys to local storage (public info only)
   * @private
   */
  _saveKeys() {
    const keysArray = Array.from(sshKeys.values()).map(key => ({
      id: key.id,
      name: key.name,
      type: key.type,
      publicKey: key.publicKey,
      privateKeyPath: key.privateKeyPath,
      publicKeyPath: key.publicKeyPath,
      created: key.created
    }));
    
    localStorage.setItem('ssh_keys', JSON.stringify(keysArray));
  },

  /**
   * Loads keys from local storage
   * @private
   */
  _loadKeys() {
    try {
      const stored = localStorage.getItem('ssh_keys');
      if (stored) {
        const keysArray = JSON.parse(stored);
        keysArray.forEach(key => {
          sshKeys.set(key.id, key);
        });
      }
    } catch (error) {
      console.error('Error loading keys:', error);
    }
  },

  /**
   * Initializes the SSH manager
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async init() {
    try {
      this._loadConnections();
      this._loadKeys();
      return true;
    } catch (error) {
      console.error('Error initializing SSH manager:', error);
      throw error;
    }
  }
};

module.exports = SSHManager;