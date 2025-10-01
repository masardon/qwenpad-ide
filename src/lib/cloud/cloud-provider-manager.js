/**
 * Cloud Provider Manager for QwenPad IDE
 * Provides integration with major cloud providers (AWS, GCP, Azure)
 */

import Executor from '../plugins/terminal/www/Executor';
import toast from '../components/toast';

export default class CloudProviderManager {
  constructor() {
    this.providers = new Map();
    this.connections = new Map();
    
    this._initialize();
  }

  _initialize() {
    // Register supported cloud providers
    this._registerProviders();
    
    // Load existing connections
    this._loadConnections();
  }

  _registerProviders() {
    // Register AWS provider
    this.providers.set('aws', {
      id: 'aws',
      name: 'Amazon Web Services',
      description: 'Amazon Web Services cloud computing platform',
      icon: 'cloud',
      color: '#ff9900',
      cli: 'aws',
      authMethods: ['accessKey', 'profile', 'sso'],
      regions: [
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
        'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
        'ap-northeast-2', 'sa-east-1', 'ca-central-1'
      ],
      services: [
        'ec2', 's3', 'rds', 'lambda', 'ecs', 'eks', 'iam',
        'cloudformation', 'cloudfront', 'route53', 'sns', 'sqs'
      ]
    });

    // Register GCP provider
    this.providers.set('gcp', {
      id: 'gcp',
      name: 'Google Cloud Platform',
      description: 'Google Cloud Platform cloud computing services',
      icon: 'cloud',
      color: '#4285f4',
      cli: 'gcloud',
      authMethods: ['serviceAccount', 'adc', 'userAccount'],
      regions: [
        'us-central1', 'us-east1', 'us-east4', 'us-west1', 'us-west2',
        'europe-west1', 'europe-west2', 'europe-west3', 'europe-west4',
        'asia-east1', 'asia-east2', 'asia-northeast1', 'asia-northeast2',
        'asia-southeast1', 'australia-southeast1'
      ],
      services: [
        'compute', 'storage', 'sql', 'functions', 'run', 'gke',
        'iam', 'deployment-manager', 'dns', 'pubsub'
      ]
    });

    // Register Azure provider
    this.providers.set('azure', {
      id: 'azure',
      name: 'Microsoft Azure',
      description: 'Microsoft Azure cloud computing platform',
      icon: 'cloud',
      color: '#0078d4',
      cli: 'az',
      authMethods: ['servicePrincipal', 'userAccount', 'managedIdentity'],
      regions: [
        'eastus', 'eastus2', 'westus', 'westus2', 'centralus',
        'northcentralus', 'southcentralus', 'westcentralus',
        'northeurope', 'westeurope', 'uksouth', 'ukwest',
        'eastasia', 'southeastasia', 'japaneast', 'japanwest',
        'brazilsouth', 'australiaeast', 'australiasoutheast'
      ],
      services: [
        'vm', 'storage', 'sql', 'functions', 'aks', 'acr',
        'keyvault', 'monitor', 'network', 'dns'
      ]
    });
  }

  _loadConnections() {
    try {
      const stored = localStorage.getItem('cloud_connections');
      if (stored) {
        const connectionsArray = JSON.parse(stored);
        connectionsArray.forEach(conn => {
          this.connections.set(conn.id, conn);
        });
      }
    } catch (error) {
      console.error('Error loading cloud connections:', error);
    }
  }

  _saveConnections() {
    try {
      const connectionsArray = Array.from(this.connections.values());
      localStorage.setItem('cloud_connections', JSON.stringify(connectionsArray));
    } catch (error) {
      console.error('Error saving cloud connections:', error);
    }
  }

  /**
   * Gets all registered cloud providers
   * @returns {Array} - Array of provider information
   */
  getProviders() {
    return Array.from(this.providers.values());
  }

  /**
   * Gets a specific provider
   * @param {string} providerId - Provider ID
   * @returns {object|null} - Provider information or null if not found
   */
  getProvider(providerId) {
    return this.providers.get(providerId) || null;
  }

  /**
   * Gets all stored connections
   * @returns {Array} - Array of connection profiles
   */
  getConnections() {
    return Array.from(this.connections.values());
  }

  /**
   * Gets a specific connection
   * @param {string} connectionId - Connection ID
   * @returns {object|null} - Connection profile or null if not found
   */
  getConnection(connectionId) {
    return this.connections.get(connectionId) || null;
  }

  /**
   * Adds a new cloud connection
   * @param {object} profile - Connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async addConnection(profile) {
    try {
      if (!profile.id || !profile.name || !profile.provider) {
        throw new Error('Missing required connection parameters');
      }

      // Validate provider
      const provider = this.providers.get(profile.provider);
      if (!provider) {
        throw new Error(`Unsupported provider: ${profile.provider}`);
      }

      // Test the connection
      await this.testConnection(profile);

      // Store the connection
      this.connections.set(profile.id, {
        ...profile,
        lastUsed: new Date().toISOString()
      });

      // Save to local storage
      this._saveConnections();

      return true;
    } catch (error) {
      console.error('Error adding cloud connection:', error);
      throw error;
    }
  }

  /**
   * Updates an existing cloud connection
   * @param {object} profile - Connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async updateConnection(profile) {
    try {
      if (!profile.id) {
        throw new Error('Connection ID required');
      }

      // Validate provider
      const provider = this.providers.get(profile.provider);
      if (!provider) {
        throw new Error(`Unsupported provider: ${profile.provider}`);
      }

      // Test the connection
      await this.testConnection(profile);

      // Update the connection
      this.connections.set(profile.id, {
        ...profile,
        lastUsed: new Date().toISOString()
      });

      // Save to local storage
      this._saveConnections();

      return true;
    } catch (error) {
      console.error('Error updating cloud connection:', error);
      throw error;
    }
  }

  /**
   * Removes a cloud connection
   * @param {string} connectionId - Connection ID to remove
   * @returns {boolean} - Returns true if successful
   */
  removeConnection(connectionId) {
    try {
      const result = this.connections.delete(connectionId);
      this._saveConnections();
      return result;
    } catch (error) {
      console.error('Error removing cloud connection:', error);
      throw error;
    }
  }

  /**
   * Tests a cloud connection
   * @param {object} profile - Connection profile to test
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async testConnection(profile) {
    try {
      // Validate provider
      const provider = this.providers.get(profile.provider);
      if (!provider) {
        throw new Error(`Unsupported provider: ${profile.provider}`);
      }

      // Check if CLI is available
      const isAvailable = await this._isCLIInstalled(provider.cli);
      if (!isAvailable) {
        throw new Error(`${provider.name} CLI (${provider.cli}) is not installed`);
      }

      // Test authentication based on auth method
      switch (profile.authMethod) {
        case 'accessKey':
          return await this._testAWSAccessKey(profile);
        case 'profile':
          return await this._testAWSProfile(profile);
        case 'sso':
          return await this._testAWSSSO(profile);
        case 'serviceAccount':
          return await this._testGCPServiceAccount(profile);
        case 'adc':
          return await this._testGCPADC(profile);
        case 'userAccount':
          return await this._testGCPUserAccount(profile);
        case 'servicePrincipal':
          return await this._testAzureServicePrincipal(profile);
        case 'managedIdentity':
          return await this._testAzureManagedIdentity(profile);
        default:
          throw new Error(`Unsupported authentication method: ${profile.authMethod}`);
      }
    } catch (error) {
      console.error('Error testing cloud connection:', error);
      throw error;
    }
  }

  /**
   * Checks if a CLI is installed
   * @private
   * @param {string} cli - CLI command to check
   * @returns {Promise<boolean>} - Returns true if CLI is installed
   */
  async _isCLIInstalled(cli) {
    try {
      await Executor.execute(`command -v ${cli}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Tests AWS connection with access key
   * @private
   * @param {object} profile - AWS connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testAWSAccessKey(profile) {
    try {
      // Set environment variables for access key authentication
      const envVars = `AWS_ACCESS_KEY_ID=${profile.accessKeyId} AWS_SECRET_ACCESS_KEY=${profile.secretAccessKey}`;
      
      // Test with sts get-caller-identity
      const result = await Executor.execute(`${envVars} aws sts get-caller-identity --output json`);
      
      // Parse result to verify it's valid JSON
      const identity = JSON.parse(result);
      if (identity.Account && identity.UserId) {
        return true;
      }
      
      throw new Error('Invalid AWS credentials');
    } catch (error) {
      console.error('Error testing AWS access key:', error);
      throw error;
    }
  }

  /**
   * Tests AWS connection with profile
   * @private
   * @param {object} profile - AWS connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testAWSProfile(profile) {
    try {
      // Test with sts get-caller-identity using profile
      const result = await Executor.execute(`aws sts get-caller-identity --profile ${profile.profileName} --output json`);
      
      // Parse result to verify it's valid JSON
      const identity = JSON.parse(result);
      if (identity.Account && identity.UserId) {
        return true;
      }
      
      throw new Error('Invalid AWS profile');
    } catch (error) {
      console.error('Error testing AWS profile:', error);
      throw error;
    }
  }

  /**
   * Tests AWS connection with SSO
   * @private
   * @param {object} profile - AWS connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testAWSSSO(profile) {
    try {
      // Test with sso login using profile
      const result = await Executor.execute(`aws sso login --profile ${profile.profileName}`);
      
      if (result && !result.toLowerCase().includes('error')) {
        return true;
      }
      
      throw new Error('AWS SSO login failed');
    } catch (error) {
      console.error('Error testing AWS SSO:', error);
      throw error;
    }
  }

  /**
   * Tests GCP connection with service account
   * @private
   * @param {object} profile - GCP connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testGCPServiceAccount(profile) {
    try {
      // Activate service account
      const activateResult = await Executor.execute(`gcloud auth activate-service-account --key-file=${profile.keyFilePath}`);
      
      if (activateResult && !activateResult.toLowerCase().includes('error')) {
        // Test with basic gcloud command
        const testResult = await Executor.execute(`gcloud config list --format=json`);
        const config = JSON.parse(testResult);
        if (config.core && config.core.project) {
          return true;
        }
      }
      
      throw new Error('Invalid GCP service account');
    } catch (error) {
      console.error('Error testing GCP service account:', error);
      throw error;
    }
  }

  /**
   * Tests GCP connection with Application Default Credentials
   * @private
   * @param {object} profile - GCP connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testGCPADC(profile) {
    try {
      // Test with basic gcloud command
      const result = await Executor.execute(`gcloud config list --format=json`);
      const config = JSON.parse(result);
      if (config.core && config.core.project) {
        return true;
      }
      
      throw new Error('Invalid GCP ADC');
    } catch (error) {
      console.error('Error testing GCP ADC:', error);
      throw error;
    }
  }

  /**
   * Tests GCP connection with user account
   * @private
   * @param {object} profile - GCP connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testGCPUserAccount(profile) {
    try {
      // Test with basic gcloud command
      const result = await Executor.execute(`gcloud auth list --format=json`);
      const accounts = JSON.parse(result);
      
      if (Array.isArray(accounts) && accounts.length > 0) {
        // Check if the specified account is active
        const activeAccount = accounts.find(account => account.status === 'ACTIVE');
        if (activeAccount && activeAccount.account === profile.accountEmail) {
          return true;
        }
      }
      
      throw new Error('Invalid GCP user account');
    } catch (error) {
      console.error('Error testing GCP user account:', error);
      throw error;
    }
  }

  /**
   * Tests Azure connection with service principal
   * @private
   * @param {object} profile - Azure connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testAzureServicePrincipal(profile) {
    try {
      // Login with service principal
      const loginResult = await Executor.execute(
        `az login --service-principal -u ${profile.clientId} -p ${profile.clientSecret} --tenant ${profile.tenantId}`
      );
      
      if (loginResult && !loginResult.toLowerCase().includes('error')) {
        // Test with basic az command
        const testResult = await Executor.execute(`az account show --output json`);
        const account = JSON.parse(testResult);
        if (account.id && account.name) {
          return true;
        }
      }
      
      throw new Error('Invalid Azure service principal');
    } catch (error) {
      console.error('Error testing Azure service principal:', error);
      throw error;
    }
  }

  /**
   * Tests Azure connection with managed identity
   * @private
   * @param {object} profile - Azure connection profile
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async _testAzureManagedIdentity(profile) {
    try {
      // Test with basic az command using managed identity
      const result = await Executor.execute(`az login --identity`);
      
      if (result && !result.toLowerCase().includes('error')) {
        // Test with account show
        const testResult = await Executor.execute(`az account show --output json`);
        const account = JSON.parse(testResult);
        if (account.id && account.name) {
          return true;
        }
      }
      
      throw new Error('Invalid Azure managed identity');
    } catch (error) {
      console.error('Error testing Azure managed identity:', error);
      throw error;
    }
  }

  /**
   * Executes a cloud command
   * @param {string} connectionId - Connection ID
   * @param {string} command - Command to execute
   * @param {object} options - Command options
   * @returns {Promise<string>} - Command output
   */
  async executeCommand(connectionId, command, options = {}) {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      const provider = this.providers.get(connection.provider);
      if (!provider) {
        throw new Error(`Provider ${connection.provider} not supported`);
      }

      // Set up authentication environment
      let envVars = '';
      let authCommand = '';
      
      switch (connection.authMethod) {
        case 'accessKey':
          envVars = `AWS_ACCESS_KEY_ID=${connection.accessKeyId} AWS_SECRET_ACCESS_KEY=${connection.secretAccessKey}`;
          break;
        case 'profile':
          authCommand = `--profile ${connection.profileName}`;
          break;
        case 'serviceAccount':
          // Activate service account before command
          await Executor.execute(`gcloud auth activate-service-account --key-file=${connection.keyFilePath}`);
          break;
        case 'servicePrincipal':
          // Login with service principal before command
          await Executor.execute(
            `az login --service-principal -u ${connection.clientId} -p ${connection.clientSecret} --tenant ${connection.tenantId}`
          );
          break;
        case 'managedIdentity':
          // Login with managed identity before command
          await Executor.execute(`az login --identity`);
          break;
        // Add more auth methods as needed
      }

      // Build full command
      let fullCommand = `${envVars} ${provider.cli} ${authCommand} ${command}`;
      
      // Execute command
      const result = await Executor.execute(fullCommand);
      return result;
    } catch (error) {
      console.error('Error executing cloud command:', error);
      throw error;
    }
  }

  /**
   * Gets cloud provider regions
   * @param {string} providerId - Provider ID
   * @returns {Array} - Array of regions
   */
  getRegions(providerId) {
    const provider = this.providers.get(providerId);
    return provider ? [...provider.regions] : [];
  }

  /**
   * Gets cloud provider services
   * @param {string} providerId - Provider ID
   * @returns {Array} - Array of services
   */
  getServices(providerId) {
    const provider = this.providers.get(providerId);
    return provider ? [...provider.services] : [];
  }

  /**
   * Installs cloud provider CLI
   * @param {string} providerId - Provider ID
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async installCLI(providerId) {
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not supported`);
      }

      // Determine installation method based on environment
      let installCommand = '';
      
      // Check if we're in Termux
      const isInTermux = await this._isInTermux();
      
      if (isInTermux) {
        // Termux installation commands
        switch (providerId) {
          case 'aws':
            installCommand = 'pkg install aws-cli';
            break;
          case 'gcp':
            installCommand = 'pkg install google-cloud-sdk';
            break;
          case 'azure':
            installCommand = 'pkg install azure-cli';
            break;
          default:
            throw new Error(`CLI installation not supported for ${providerId} in Termux`);
        }
      } else {
        // Other environments (would need to be adapted for actual implementation)
        switch (providerId) {
          case 'aws':
            installCommand = 'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"';
            break;
          case 'gcp':
            installCommand = 'curl https://sdk.cloud.google.com | bash';
            break;
          case 'azure':
            installCommand = 'curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash';
            break;
          default:
            throw new Error(`CLI installation not supported for ${providerId}`);
        }
      }

      // Execute installation
      const result = await Executor.execute(installCommand);
      
      if (result && !result.toLowerCase().includes('error')) {
        toast(`${provider.name} CLI installed successfully!`, 'success');
        return true;
      }
      
      throw new Error(`Failed to install ${provider.name} CLI`);
    } catch (error) {
      console.error('Error installing CLI:', error);
      toast(`Failed to install CLI: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Checks if running in Termux environment
   * @private
   * @returns {Promise<boolean>} - Returns true if in Termux
   */
  async _isInTermux() {
    try {
      await Executor.execute('test -d /data/data/com.termux');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Updates cloud provider CLI
   * @param {string} providerId - Provider ID
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async updateCLI(providerId) {
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not supported`);
      }

      // Check if CLI is installed
      const isInstalled = await this._isCLIInstalled(provider.cli);
      if (!isInstalled) {
        throw new Error(`${provider.name} CLI is not installed`);
      }

      // Determine update method based on environment
      let updateCommand = '';
      
      // Check if we're in Termux
      const isInTermux = await this._isInTermux();
      
      if (isInTermux) {
        // Termux update commands
        switch (providerId) {
          case 'aws':
            updateCommand = 'pkg update aws-cli';
            break;
          case 'gcp':
            updateCommand = 'pkg update google-cloud-sdk';
            break;
          case 'azure':
            updateCommand = 'pkg update azure-cli';
            break;
          default:
            throw new Error(`CLI update not supported for ${providerId} in Termux`);
        }
      } else {
        // Other environments (would need to be adapted for actual implementation)
        switch (providerId) {
          case 'aws':
            updateCommand = 'aws --version'; // Just check version for now
            break;
          case 'gcp':
            updateCommand = 'gcloud components update';
            break;
          case 'azure':
            updateCommand = 'az upgrade';
            break;
          default:
            throw new Error(`CLI update not supported for ${providerId}`);
        }
      }

      // Execute update
      const result = await Executor.execute(updateCommand);
      
      if (result && !result.toLowerCase().includes('error')) {
        toast(`${provider.name} CLI updated successfully!`, 'success');
        return true;
      }
      
      throw new Error(`Failed to update ${provider.name} CLI`);
    } catch (error) {
      console.error('Error updating CLI:', error);
      toast(`Failed to update CLI: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Gets CLI version
   * @param {string} providerId - Provider ID
   * @returns {Promise<string>} - CLI version
   */
  async getCLIVersion(providerId) {
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not supported`);
      }

      // Check if CLI is installed
      const isInstalled = await this._isCLIInstalled(provider.cli);
      if (!isInstalled) {
        return 'Not installed';
      }

      // Get version
      let versionCommand = '';
      
      switch (providerId) {
        case 'aws':
          versionCommand = 'aws --version';
          break;
        case 'gcp':
          versionCommand = 'gcloud version';
          break;
        case 'azure':
          versionCommand = 'az version';
          break;
        default:
          return 'Unknown';
      }

      const result = await Executor.execute(versionCommand);
      return result.trim();
    } catch (error) {
      console.error('Error getting CLI version:', error);
      return 'Unknown';
    }
  }

  /**
   * Configures cloud provider
   * @param {string} providerId - Provider ID
   * @param {object} config - Configuration options
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async configureProvider(providerId, config) {
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not supported`);
      }

      // Check if CLI is installed
      const isInstalled = await this._isCLIInstalled(provider.cli);
      if (!isInstalled) {
        throw new Error(`${provider.name} CLI is not installed`);
      }

      // Apply configuration based on provider
      let configCommands = [];
      
      switch (providerId) {
        case 'aws':
          if (config.region) {
            configCommands.push(`aws configure set region ${config.region}`);
          }
          if (config.output) {
            configCommands.push(`aws configure set output ${config.output}`);
          }
          break;
        case 'gcp':
          if (config.project) {
            configCommands.push(`gcloud config set project ${config.project}`);
          }
          if (config.region) {
            configCommands.push(`gcloud config set compute/region ${config.region}`);
          }
          if (config.zone) {
            configCommands.push(`gcloud config set compute/zone ${config.zone}`);
          }
          break;
        case 'azure':
          if (config.subscription) {
            configCommands.push(`az account set --subscription ${config.subscription}`);
          }
          break;
      }

      // Execute configuration commands
      for (const cmd of configCommands) {
        await Executor.execute(cmd);
      }

      toast(`${provider.name} configured successfully!`, 'success');
      return true;
    } catch (error) {
      console.error('Error configuring provider:', error);
      toast(`Failed to configure provider: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Lists available regions for a provider
   * @param {string} providerId - Provider ID
   * @returns {Promise<Array>} - Array of regions
   */
  async listRegions(providerId) {
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not supported`);
      }

      // Check if CLI is installed
      const isInstalled = await this._isCLIInstalled(provider.cli);
      if (!isInstalled) {
        throw new Error(`${provider.name} CLI is not installed`);
      }

      // List regions based on provider
      let listCommand = '';
      
      switch (providerId) {
        case 'aws':
          listCommand = 'aws ec2 describe-regions --output json';
          break;
        case 'gcp':
          listCommand = 'gcloud compute regions list --format=json';
          break;
        case 'azure':
          listCommand = 'az account list-locations --output json';
          break;
        default:
          return provider.regions || [];
      }

      const result = await Executor.execute(listCommand);
      const regions = JSON.parse(result);
      
      // Process regions based on provider format
      switch (providerId) {
        case 'aws':
          return regions.Regions.map(region => region.RegionName);
        case 'gcp':
          return regions.map(region => region.name);
        case 'azure':
          return regions.map(location => location.name);
        default:
          return regions;
      }
    } catch (error) {
      console.error('Error listing regions:', error);
      // Return default regions if command fails
      const provider = this.providers.get(providerId);
      return provider ? [...provider.regions] : [];
    }
  }

  /**
   * Lists available services for a provider
   * @param {string} providerId - Provider ID
   * @returns {Promise<Array>} - Array of services
   */
  async listServices(providerId) {
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not supported`);
      }

      // Check if CLI is installed
      const isInstalled = await this._isCLIInstalled(provider.cli);
      if (!isInstalled) {
        throw new Error(`${provider.name} CLI is not installed`);
      }

      // List services based on provider
      let listCommand = '';
      
      switch (providerId) {
        case 'aws':
          listCommand = 'aws help';
          break;
        case 'gcp':
          listCommand = 'gcloud help';
          break;
        case 'azure':
          listCommand = 'az help';
          break;
        default:
          return provider.services || [];
      }

      const result = await Executor.execute(listCommand);
      
      // Parse services from help output (simplified for this example)
      // In a real implementation, this would parse the actual help output
      return provider.services || [];
    } catch (error) {
      console.error('Error listing services:', error);
      // Return default services if command fails
      const provider = this.providers.get(providerId);
      return provider ? [...provider.services] : [];
    }
  }
}