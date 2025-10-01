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
  },

  /**
   * Gets namespaces in the cluster
   * @param {string} connectionId - Connection ID
   * @returns {Promise<Array>} - Array of namespaces
   */
  async getNamespaces(connectionId) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      const command = await this._buildKubectlCommand(profile, 'get namespaces -o json');
      const result = await Executor.execute(command);
      
      const namespaces = JSON.parse(result);
      return namespaces.items.map(ns => ({
        name: ns.metadata.name,
        status: ns.status.phase,
        created: ns.metadata.creationTimestamp
      }));
    } catch (error) {
      console.error('Error getting namespaces:', error);
      throw error;
    }
  },

  /**
   * Creates a namespace
   * @param {string} connectionId - Connection ID
   * @param {string} namespace - Namespace name
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async createNamespace(connectionId, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      const command = await this._buildKubectlCommand(profile, `create namespace ${namespace}`);
      const result = await Executor.execute(command);
      
      return result.includes('created');
    } catch (error) {
      console.error('Error creating namespace:', error);
      throw error;
    }
  },

  /**
   * Deletes a namespace
   * @param {string} connectionId - Connection ID
   * @param {string} namespace - Namespace name
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async deleteNamespace(connectionId, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      const command = await this._buildKubectlCommand(profile, `delete namespace ${namespace}`);
      const result = await Executor.execute(command);
      
      return result.includes('deleted');
    } catch (error) {
      console.error('Error deleting namespace:', error);
      throw error;
    }
  },

  /**
   * Gets nodes in the cluster
   * @param {string} connectionId - Connection ID
   * @returns {Promise<Array>} - Array of nodes
   */
  async getNodes(connectionId) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      const command = await this._buildKubectlCommand(profile, 'get nodes -o json');
      const result = await Executor.execute(command);
      
      const nodes = JSON.parse(result);
      return nodes.items.map(node => ({
        name: node.metadata.name,
        status: node.status.conditions.find(c => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady',
        roles: node.metadata.labels['kubernetes.io/role'] || 'node',
        version: node.status.nodeInfo.kubeletVersion,
        os: node.status.nodeInfo.osImage,
        arch: node.status.nodeInfo.architecture,
        created: node.metadata.creationTimestamp
      }));
    } catch (error) {
      console.error('Error getting nodes:', error);
      throw error;
    }
  },

  /**
   * Describes a resource
   * @param {string} connectionId - Connection ID
   * @param {string} resourceType - Resource type (pod, service, deployment, etc.)
   * @param {string} resourceName - Resource name
   * @param {string} [namespace] - Namespace
   * @returns {Promise<object>} - Resource description
   */
  async describeResource(connectionId, resourceType, resourceName, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let command = `describe ${resourceType} ${resourceName}`;
      if (namespace) {
        command += ` -n ${namespace}`;
      }

      const fullCommand = await this._buildKubectlCommand(profile, command);
      const result = await Executor.execute(fullCommand);
      
      return {
        name: resourceName,
        type: resourceType,
        namespace: namespace || 'default',
        description: result
      };
    } catch (error) {
      console.error('Error describing resource:', error);
      throw error;
    }
  },

  /**
   * Gets logs for a pod
   * @param {string} connectionId - Connection ID
   * @param {string} podName - Pod name
   * @param {string} [namespace] - Namespace
   * @param {object} [options] - Log options
   * @returns {Promise<string>} - Pod logs
   */
  async getPodLogs(connectionId, podName, namespace, options = {}) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let command = `logs ${podName}`;
      if (namespace) {
        command += ` -n ${namespace}`;
      }
      
      if (options.container) {
        command += ` -c ${options.container}`;
      }
      
      if (options.previous) {
        command += ' --previous';
      }
      
      if (options.tail) {
        command += ` --tail=${options.tail}`;
      }
      
      if (options.follow) {
        command += ' -f';
      }

      const fullCommand = await this._buildKubectlCommand(profile, command);
      const result = await Executor.execute(fullCommand);
      
      return result;
    } catch (error) {
      console.error('Error getting pod logs:', error);
      throw error;
    }
  },

  /**
   * Executes a command in a pod
   * @param {string} connectionId - Connection ID
   * @param {string} podName - Pod name
   * @param {string} command - Command to execute
   * @param {string} [namespace] - Namespace
   * @param {string} [container] - Container name
   * @returns {Promise<string>} - Command output
   */
  async execInPod(connectionId, podName, command, namespace, container) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let execCommand = `exec ${podName} -- ${command}`;
      if (namespace) {
        execCommand += ` -n ${namespace}`;
      }
      
      if (container) {
        execCommand += ` -c ${container}`;
      }

      const fullCommand = await this._buildKubectlCommand(profile, execCommand);
      const result = await Executor.execute(fullCommand);
      
      return result;
    } catch (error) {
      console.error('Error executing command in pod:', error);
      throw error;
    }
  },

  /**
   * Applies a configuration from a file
   * @param {string} connectionId - Connection ID
   * @param {string} filePath - Path to configuration file
   * @param {string} [namespace] - Namespace
   * @returns {Promise<string>} - Apply result
   */
  async applyConfig(connectionId, filePath, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let command = `apply -f ${filePath}`;
      if (namespace) {
        command += ` -n ${namespace}`;
      }

      const fullCommand = await this._buildKubectlCommand(profile, command);
      const result = await Executor.execute(fullCommand);
      
      return result;
    } catch (error) {
      console.error('Error applying configuration:', error);
      throw error;
    }
  },

  /**
   * Deletes a resource
   * @param {string} connectionId - Connection ID
   * @param {string} resourceType - Resource type
   * @param {string} resourceName - Resource name
   * @param {string} [namespace] - Namespace
   * @returns {Promise<string>} - Delete result
   */
  async deleteResource(connectionId, resourceType, resourceName, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let command = `delete ${resourceType} ${resourceName}`;
      if (namespace) {
        command += ` -n ${namespace}`;
      }

      const fullCommand = await this._buildKubectlCommand(profile, command);
      const result = await Executor.execute(fullCommand);
      
      return result;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  /**
   * Scales a deployment
   * @param {string} connectionId - Connection ID
   * @param {string} deploymentName - Deployment name
   * @param {number} replicas - Number of replicas
   * @param {string} [namespace] - Namespace
   * @returns {Promise<string>} - Scale result
   */
  async scaleDeployment(connectionId, deploymentName, replicas, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let command = `scale deployment ${deploymentName} --replicas=${replicas}`;
      if (namespace) {
        command += ` -n ${namespace}`;
      }

      const fullCommand = await this._buildKubectlCommand(profile, command);
      const result = await Executor.execute(fullCommand);
      
      return result;
    } catch (error) {
      console.error('Error scaling deployment:', error);
      throw error;
    }
  },

  /**
   * Gets resource events
   * @param {string} connectionId - Connection ID
   * @param {string} resourceType - Resource type
   * @param {string} resourceName - Resource name
   * @param {string} [namespace] - Namespace
   * @returns {Promise<Array>} - Array of events
   */
  async getResourceEvents(connectionId, resourceType, resourceName, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let command = `get events --field-selector involvedObject.name=${resourceName},involvedObject.kind=${resourceType}`;
      if (namespace) {
        command += ` -n ${namespace}`;
      }
      command += ' -o json';

      const fullCommand = await this._buildKubectlCommand(profile, command);
      const result = await Executor.execute(fullCommand);
      
      const events = JSON.parse(result);
      return events.items.map(event => ({
        name: event.metadata.name,
        type: event.type,
        reason: event.reason,
        message: event.message,
        source: event.source.component,
        count: event.count,
        firstTimestamp: event.firstTimestamp,
        lastTimestamp: event.lastTimestamp
      }));
    } catch (error) {
      console.error('Error getting resource events:', error);
      throw error;
    }
  },

  /**
   * Gets cluster events
   * @param {string} connectionId - Connection ID
   * @returns {Promise<Array>} - Array of cluster events
   */
  async getClusterEvents(connectionId) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      const command = await this._buildKubectlCommand(profile, 'get events -o json');
      const result = await Executor.execute(command);
      
      const events = JSON.parse(result);
      return events.items.map(event => ({
        name: event.metadata.name,
        type: event.type,
        reason: event.reason,
        message: event.message,
        source: event.source.component,
        involvedObject: event.involvedObject.kind + '/' + event.involvedObject.name,
        count: event.count,
        firstTimestamp: event.firstTimestamp,
        lastTimestamp: event.lastTimestamp
      }));
    } catch (error) {
      console.error('Error getting cluster events:', error);
      throw error;
    }
  },

  /**
   * Gets resource metrics
   * @param {string} connectionId - Connection ID
   * @param {string} resourceType - Resource type
   * @param {string} [resourceName] - Resource name
   * @param {string} [namespace] - Namespace
   * @returns {Promise<object>} - Resource metrics
   */
  async getResourceMetrics(connectionId, resourceType, resourceName, namespace) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      let command = `top ${resourceType}`;
      if (resourceName) {
        command += ` ${resourceName}`;
      }
      if (namespace) {
        command += ` -n ${namespace}`;
      }
      command += ' -o json';

      const fullCommand = await this._buildKubectlCommand(profile, command);
      const result = await Executor.execute(fullCommand);
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Error getting resource metrics:', error);
      throw error;
    }
  },

  /**
   * Gets cluster-wide resource usage
   * @param {string} connectionId - Connection ID
   * @returns {Promise<object>} - Cluster resource usage
   */
  async getClusterUsage(connectionId) {
    try {
      const profile = k8sConnections.get(connectionId);
      if (!profile) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      // Get node metrics
      const nodeMetricsCommand = await this._buildKubectlCommand(profile, 'top nodes -o json');
      const nodeMetricsResult = await Executor.execute(nodeMetricsCommand);
      const nodeMetrics = JSON.parse(nodeMetricsResult);

      // Get pod metrics
      const podMetricsCommand = await this._buildKubectlCommand(profile, 'top pods -o json');
      const podMetricsResult = await Executor.execute(podMetricsCommand);
      const podMetrics = JSON.parse(podMetricsResult);

      return {
        nodes: nodeMetrics.items.map(node => ({
          name: node.metadata.name,
          cpu: node.usage.cpu,
          memory: node.usage.memory
        })),
        pods: podMetrics.items.map(pod => ({
          name: pod.metadata.name,
          namespace: pod.metadata.namespace,
          cpu: pod.containers.reduce((sum, container) => sum + container.usage.cpu, 0),
          memory: pod.containers.reduce((sum, container) => sum + container.usage.memory, 0)
        }))
      };
    } catch (error) {
      console.error('Error getting cluster usage:', error);
      throw error;
    }
  }
};

module.exports = K8sManager;