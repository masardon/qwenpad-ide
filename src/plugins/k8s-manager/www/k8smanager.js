const Executor = require("../terminal/www/Executor");

// In-memory storage for connections (would use secure storage in production)
const k8sConnections = new Map();

const K8sManager = {
  /**
   * Creates and stores a new Kubernetes cluster connection profile
   * @param {object} profile - K8s connection profile
   * @param {string} profile.id - Connection ID
   * @param {string} profile.name - Connection name
   * @param {string} profile.server - Kubernetes API server URL
   * @param {string} [profile.token] - Authentication token
   * @param {string} [profile.certPath] - Path to certificate file
   * @param {string} [profile.caCertPath] - Path to CA certificate file
   * @param {string} [profile.username] - Username for basic auth
   * @param {string} [profile.password] - Password for basic auth
   * @param {string} [profile.context] - Kubectl context name
   * @param {string} [profile.namespace] - Default namespace
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async addConnection(profile) {
    try {
      if (!profile.id || !profile.name || !profile.server) {
        throw new Error('Missing required connection parameters');
      }

      // Test the connection
      await this.testConnection(profile);

      // Store the connection
      k8sConnections.set(profile.id, {
        ...profile,
        lastUsed: new Date().toISOString()
      });

      // Save to local storage
      this._saveConnections();

      return true;
    } catch (error) {
      console.error('Error adding K8s connection:', error);
      throw error;
    }
  },

  /**
   * Tests a Kubernetes connection
   * @param {object} profile - K8s connection profile to test
   * @returns {Promise<boolean>} - Returns true if connection is successful
   */
  async testConnection(profile) {
    try {
      // Build kubectl command with authentication parameters
      const cmd = await this._buildKubectlCommand(profile, 'cluster-info');
      const result = await Executor.execute(cmd);
      
      // If command executed without error, connection is successful
      if (result && !result.toLowerCase().includes('error')) {
        return true;
      } else {
        throw new Error(`Connection test failed: ${result}`);
      }
    } catch (error) {
      console.error('Error testing K8s connection:', error);
      throw error;
    }
  },

  /**
   * Executes a kubectl command against a stored connection
   * @param {string} connectionId - Connection ID
   * @param {string} command - Kubectl command to execute (e.g. "get pods", "describe service my-service")
   * @param {string} [namespace] - Override default namespace
   * @returns {Promise<string>} - Command output
   */
  async executeCommand(connectionId, command, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      // Get namespace from parameter or profile
      const ns = namespace || profile.namespace;
      let fullCommand = command;

      // Add namespace if specified
      if (ns) {
        // Don't add namespace if the command already contains a namespace flag
        if (!command.includes('--namespace') && !command.includes('-n ')) {
          fullCommand = `${command} --namespace ${ns}`;
        }
      }

      // Build and execute the kubectl command
      const cmd = await this._buildKubectlCommand(profile, fullCommand);
      const result = await Executor.execute(cmd);

      // Update last used time
      profile.lastUsed = new Date().toISOString();
      k8sConnections.set(connectionId, profile);
      this._saveConnections();

      return result;
    } catch (error) {
      console.error('Error executing K8s command:', error);
      throw error;
    }
  },

  /**
   * Gets information about pods in a namespace
   * @param {string} connectionId - Connection ID
   * @param {string} [namespace] - Namespace (defaults to connection's namespace)
   * @returns {Promise<object>} - Pods information
   */
  async getPods(connectionId, namespace) {
    try {
      const output = await this.executeCommand(connectionId, 'get pods -o json', namespace);
      return JSON.parse(output);
    } catch (error) {
      console.error('Error getting pods:', error);
      throw error;
    }
  },

  /**
   * Gets information about services in a namespace
   * @param {string} connectionId - Connection ID
   * @param {string} [namespace] - Namespace (defaults to connection's namespace)
   * @returns {Promise<object>} - Services information
   */
  async getServices(connectionId, namespace) {
    try {
      const output = await this.executeCommand(connectionId, 'get services -o json', namespace);
      return JSON.parse(output);
    } catch (error) {
      console.error('Error getting services:', error);
      throw error;
    }
  },

  /**
   * Gets information about deployments in a namespace
   * @param {string} connectionId - Connection ID
   * @param {string} [namespace] - Namespace (defaults to connection's namespace)
   * @returns {Promise<object>} - Deployments information
   */
  async getDeployments(connectionId, namespace) {
    try {
      const output = await this.executeCommand(connectionId, 'get deployments -o json', namespace);
      return JSON.parse(output);
    } catch (error) {
      console.error('Error getting deployments:', error);
      throw error;
    }
  },

  /**
   * Gets information about all resources in a namespace
   * @param {string} connectionId - Connection ID
   * @param {string} [namespace] - Namespace (defaults to connection's namespace)
   * @returns {Promise<object>} - All resources information
   */
  async getAllResources(connectionId, namespace) {
    try {
      const output = await this.executeCommand(connectionId, 'get all -o json', namespace);
      return JSON.parse(output);
    } catch (error) {
      console.error('Error getting all resources:', error);
      throw error;
    }
  },

  /**
   * Gets cluster information
   * @param {string} connectionId - Connection ID
   * @returns {Promise<object>} - Cluster information
   */
  async getClusterInfo(connectionId) {
    try {
      const output = await this.executeCommand(connectionId, 'cluster-info');
      return output;
    } catch (error) {
      console.error('Error getting cluster info:', error);
      throw error;
    }
  },

  /**
   * Lists all stored connections
   * @returns {Array} - Array of connection profiles
   */
  getConnections() {
    return Array.from(k8sConnections.values()).map(conn => ({
      id: conn.id,
      name: conn.name,
      server: conn.server,
      context: conn.context,
      namespace: conn.namespace,
      lastUsed: conn.lastUsed
    }));
  },

  /**
   * Removes a connection
   * @param {string} connectionId - Connection ID to remove
   * @returns {boolean} - Returns true if successful
   */
  removeConnection(connectionId) {
    const result = k8sConnections.delete(connectionId);
    this._saveConnections();
    return result;
  },

  /**
   * Builds a kubectl command with proper authentication
   * @private
   * @param {object} profile - Connection profile
   * @param {string} subcommand - Kubectl subcommand (e.g. "get pods")
   * @returns {Promise<string>} - Complete kubectl command
   */
  async _buildKubectlCommand(profile, subcommand) {
    // Check if kubectl is available
    try {
      await Executor.execute('kubectl version --client');
    } catch (error) {
      throw new Error('kubectl is not installed or not in PATH');
    }

    // Start building the command
    let cmd = 'kubectl';

    // Add server URL
    cmd += ` --server=${profile.server}`;

    // Add authentication based on profile
    if (profile.token) {
      cmd += ` --token=${profile.token}`;
    } else if (profile.username && profile.password) {
      cmd += ` --username=${profile.username} --password=${profile.password}`;
    }

    // Add certificate paths if provided
    if (profile.certPath) {
      cmd += ` --client-certificate=${profile.certPath}`;
    }
    if (profile.caCertPath) {
      cmd += ` --certificate-authority=${profile.caCertPath}`;
    }

    // Add context if specified
    if (profile.context) {
      cmd += ` --context=${profile.context}`;
    }

    // Add the subcommand
    cmd += ` ${subcommand}`;

    return cmd;
  },

  /**
   * Saves connections to local storage
   * @private
   */
  _saveConnections() {
    // Store connections without sensitive data in localStorage
    const connectionsArray = Array.from(k8sConnections.entries()).map(([id, conn]) => ({
      id,
      name: conn.name,
      server: conn.server,
      context: conn.context,
      namespace: conn.namespace,
      lastUsed: conn.lastUsed
    }));
    
    localStorage.setItem('k8s_connections', JSON.stringify(connectionsArray));
  },

  /**
   * Loads connections from local storage
   * @private
   */
  _loadConnections() {
    try {
      const stored = localStorage.getItem('k8s_connections');
      if (stored) {
        const connectionsArray = JSON.parse(stored);
        // Note: We don't restore sensitive data here
        connectionsArray.forEach(conn => {
          // Retrieve sensitive data from another secure storage if needed
          const existing = k8sConnections.get(conn.id);
          k8sConnections.set(conn.id, {
            ...conn,
            token: existing?.token || null, // Keep any existing sensitive data
            password: existing?.password || null,
            certPath: existing?.certPath || conn.certPath,
            caCertPath: existing?.caCertPath || conn.caCertPath
          });
        });
      }
    } catch (error) {
      console.error('Error loading K8s connections:', error);
    }
  },

  /**
   * Initializes the K8s manager
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async init() {
    try {
      this._loadConnections();
      
      // Check if kubectl is available
      try {
        await Executor.execute('kubectl version --client');
        return true;
      } catch (error) {
        throw new Error('kubectl is not installed. Please install kubectl to use K8s Manager.');
      }
    } catch (error) {
      console.error('Error initializing K8s manager:', error);
      throw error;
    }
  }
};

module.exports = K8sManager;