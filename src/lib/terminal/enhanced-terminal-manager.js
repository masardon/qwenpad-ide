/**
 * Enhanced Terminal Manager for QwenPad IDE
 * Provides seamless integration with Termux as default terminal when available
 */

import Executor from '../plugins/terminal/www/Executor';
import system from '../plugins/system/www/system';
import toast from '../components/toast';

export default class EnhancedTerminalManager {
  constructor() {
    this.isTermuxAvailable = false;
    this.isTermuxSetup = false;
    this.activeTerminal = null;
    this.terminalMode = 'default'; // 'default', 'termux', 'alpine'
    
    this._initialize();
  }

  async _initialize() {
    // Check if Termux is available
    this.isTermuxAvailable = await this._checkTermuxAvailability();
    
    if (this.isTermuxAvailable) {
      // Check if Termux is properly set up
      this.isTermuxSetup = await this._checkTermuxSetup();
      
      // Set Termux as default terminal if available and set up
      if (this.isTermuxSetup) {
        this.terminalMode = 'termux';
        toast('Termux detected and set as default terminal', 'success');
      }
    }
  }

  /**
   * Checks if Termux is available on the device
   * @private
   * @returns {Promise<boolean>} - True if Termux is available
   */
  async _checkTermuxAvailability() {
    try {
      // Check if Termux package is installed
      await system.exec("pm list packages | grep com.termux");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if Termux is properly set up
   * @private
   * @returns {Promise<boolean>} - True if Termux is set up
   */
  async _checkTermuxSetup() {
    try {
      // Check if basic Termux directories exist
      await system.exec("test -d $HOME/../com.termux/files/home");
      await system.exec("test -d $HOME/../com.termux/files/usr/bin");
      
      // Check if essential packages are installed
      await system.exec("command -v pkg");
      await system.exec("command -v bash");
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sets up Termux for use with QwenPad IDE
   * @returns {Promise<boolean>} - True if setup is successful
   */
  async setupTermux() {
    try {
      if (!this.isTermuxAvailable) {
        throw new Error('Termux is not available on this device');
      }

      // Run Termux setup commands
      const setupCommands = [
        'termux-setup-storage',
        'pkg update -y',
        'pkg install -y git nodejs python rust go',
        'npm install -g typescript @types/node',
        'pip install --upgrade pip'
      ];

      for (const command of setupCommands) {
        try {
          await system.exec(command);
        } catch (error) {
          console.warn(`Setup command failed: ${command}`, error);
          // Continue with other commands
        }
      }

      // Verify setup
      this.isTermuxSetup = await this._checkTermuxSetup();
      
      if (this.isTermuxSetup) {
        this.terminalMode = 'termux';
        toast('Termux setup completed successfully!', 'success');
        return true;
      } else {
        throw new Error('Termux setup verification failed');
      }
    } catch (error) {
      console.error('Error setting up Termux:', error);
      toast(`Termux setup failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Executes a command in the appropriate terminal environment
   * @param {string} command - Command to execute
   * @param {object} options - Execution options
   * @returns {Promise<string>} - Command output
   */
  async execute(command, options = {}) {
    try {
      // Determine which terminal to use
      const mode = options.mode || this.terminalMode;
      
      switch (mode) {
        case 'termux':
          if (this.isTermuxAvailable && this.isTermuxSetup) {
            // Execute in Termux environment
            return await system.exec(command);
          } else {
            // Fall back to default if Termux is not available
            return await Executor.execute(command);
          }
          
        case 'alpine':
          // Execute in Alpine sandbox
          return await Executor.execute(command, true); // alpine mode
          
        case 'default':
        default:
          // Use default executor
          return await Executor.execute(command);
      }
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  /**
   * Switches terminal mode
   * @param {string} mode - Terminal mode ('default', 'termux', 'alpine')
   * @returns {boolean} - True if switch is successful
   */
  switchMode(mode) {
    if (!['default', 'termux', 'alpine'].includes(mode)) {
      throw new Error(`Invalid terminal mode: ${mode}`);
    }

    // Validate mode availability
    if (mode === 'termux' && (!this.isTermuxAvailable || !this.isTermuxSetup)) {
      toast('Termux is not available or not set up properly', 'warning');
      return false;
    }

    this.terminalMode = mode;
    
    const modeNames = {
      'default': 'Default Terminal',
      'termux': 'Termux Terminal',
      'alpine': 'Alpine Sandbox'
    };
    
    toast(`Switched to ${modeNames[mode]}`, 'success');
    return true;
  }

  /**
   * Gets current terminal mode
   * @returns {string} - Current terminal mode
   */
  getCurrentMode() {
    return this.terminalMode;
  }

  /**
   * Gets terminal status information
   * @returns {object} - Terminal status information
   */
  getStatus() {
    return {
      mode: this.terminalMode,
      termuxAvailable: this.isTermuxAvailable,
      termuxSetup: this.isTermuxSetup,
      activeTerminal: this.activeTerminal
    };
  }

  /**
   * Installs a package using the appropriate package manager
   * @param {string} packageName - Package name to install
   * @param {object} options - Installation options
   * @returns {Promise<string>} - Installation output
   */
  async installPackage(packageName, options = {}) {
    try {
      // Determine which package manager to use based on current mode
      let command = '';
      
      switch (this.terminalMode) {
        case 'termux':
          if (this.isTermuxAvailable && this.isTermuxSetup) {
            // Use Termux package manager
            command = `pkg install -y ${packageName}`;
          } else {
            throw new Error('Termux is not available or not set up');
          }
          break;
          
        case 'alpine':
          // Use Alpine package manager
          command = `apk add ${packageName}`;
          break;
          
        case 'default':
        default:
          // Try to detect package manager
          try {
            await this.execute('command -v apt');
            command = `apt install -y ${packageName}`;
          } catch {
            try {
              await this.execute('command -v yum');
              command = `yum install -y ${packageName}`;
            } catch {
              try {
                await this.execute('command -v dnf');
                command = `dnf install -y ${packageName}`;
              } catch {
                throw new Error('No supported package manager found');
              }
            }
          }
      }
      
      return await this.execute(command);
    } catch (error) {
      console.error('Error installing package:', error);
      throw error;
    }
  }

  /**
   * Updates all packages using the appropriate package manager
   * @returns {Promise<string>} - Update output
   */
  async updatePackages() {
    try {
      let command = '';
      
      switch (this.terminalMode) {
        case 'termux':
          if (this.isTermuxAvailable && this.isTermuxSetup) {
            command = 'pkg update -y && pkg upgrade -y';
          } else {
            throw new Error('Termux is not available or not set up');
          }
          break;
          
        case 'alpine':
          command = 'apk update && apk upgrade';
          break;
          
        case 'default':
        default:
          // Try to detect package manager
          try {
            await this.execute('command -v apt');
            command = 'apt update && apt upgrade -y';
          } catch {
            try {
              await this.execute('command -v yum');
              command = 'yum update -y';
            } catch {
              try {
                await this.execute('command -v dnf');
                command = 'dnf update -y';
              } catch {
                throw new Error('No supported package manager found');
              }
            }
          }
      }
      
      return await this.execute(command);
    } catch (error) {
      console.error('Error updating packages:', error);
      throw error;
    }
  }

  /**
   * Searches for packages using the appropriate package manager
   * @param {string} searchTerm - Search term
   * @returns {Promise<string>} - Search output
   */
  async searchPackages(searchTerm) {
    try {
      let command = '';
      
      switch (this.terminalMode) {
        case 'termux':
          if (this.isTermuxAvailable && this.isTermuxSetup) {
            command = `pkg search ${searchTerm}`;
          } else {
            throw new Error('Termux is not available or not set up');
          }
          break;
          
        case 'alpine':
          command = `apk search ${searchTerm}`;
          break;
          
        case 'default':
        default:
          // Try to detect package manager
          try {
            await this.execute('command -v apt');
            command = `apt search ${searchTerm}`;
          } catch {
            try {
              await this.execute('command -v yum');
              command = `yum search ${searchTerm}`;
            } catch {
              try {
                await this.execute('command -v dnf');
                command = `dnf search ${searchTerm}`;
              } catch {
                throw new Error('No supported package manager found');
              }
            }
          }
      }
      
      return await this.execute(command);
    } catch (error) {
      console.error('Error searching packages:', error);
      throw error;
    }
  }

  /**
   * Gets system information
   * @returns {Promise<object>} - System information
   */
  async getSystemInfo() {
    try {
      const info = {};
      
      // Get basic system info
      try {
        info.os = await this.execute('uname -a');
      } catch (e) {
        info.os = 'Unknown';
      }
      
      try {
        info.arch = await this.execute('uname -m');
      } catch (e) {
        info.arch = 'Unknown';
      }
      
      // Get available shells
      try {
        info.shells = await this.execute('cat /etc/shells');
      } catch (e) {
        info.shells = 'Unknown';
      }
      
      // Get environment variables
      try {
        info.env = await this.execute('env');
      } catch (e) {
        info.env = 'Unknown';
      }
      
      // Get disk usage
      try {
        info.diskUsage = await this.execute('df -h');
      } catch (e) {
        info.diskUsage = 'Unknown';
      }
      
      // Get memory usage
      try {
        info.memory = await this.execute('free -h');
      } catch (e) {
        info.memory = 'Unknown';
      }
      
      // Get CPU info
      try {
        info.cpu = await this.execute('lscpu || cat /proc/cpuinfo');
      } catch (e) {
        info.cpu = 'Unknown';
      }
      
      return info;
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    }
  }

  /**
   * Gets available development tools
   * @returns {Promise<Array>} - Array of available tools
   */
  async getAvailableTools() {
    try {
      const tools = [];
      
      // Check for common development tools
      const commonTools = [
        'git', 'node', 'npm', 'python3', 'pip3', 'go', 'rustc', 'cargo',
        'java', 'javac', 'docker', 'kubectl', 'terraform', 'ansible',
        'aws', 'gcloud', 'az', 'helm', 'packer'
      ];
      
      for (const tool of commonTools) {
        try {
          const version = await this.execute(`${tool} --version 2>&1 || ${tool} version 2>&1 || echo "Not installed"`);
          tools.push({
            name: tool,
            version: version.includes('not found') || version.includes('Not installed') ? 'Not installed' : version.trim(),
            installed: !(version.includes('not found') || version.includes('Not installed'))
          });
        } catch (e) {
          tools.push({
            name: tool,
            version: 'Not installed',
            installed: false
          });
        }
      }
      
      return tools;
    } catch (error) {
      console.error('Error getting available tools:', error);
      throw error;
    }
  }

  /**
   * Installs development tools based on project requirements
   * @param {Array} requiredTools - Array of required tools
   * @returns {Promise<Array>} - Array of installation results
   */
  async installDevelopmentTools(requiredTools) {
    try {
      const results = [];
      
      for (const tool of requiredTools) {
        try {
          const result = await this.installPackage(tool);
          results.push({
            tool: tool,
            success: true,
            output: result
          });
        } catch (error) {
          results.push({
            tool: tool,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error installing development tools:', error);
      throw error;
    }
  }

  /**
   * Sets up a development environment
   * @param {string} environmentType - Type of environment to set up
   * @param {object} options - Setup options
   * @returns {Promise<boolean>} - True if setup is successful
   */
  async setupDevelopmentEnvironment(environmentType, options = {}) {
    try {
      let setupCommands = [];
      
      switch (environmentType) {
        case 'android':
          setupCommands = [
            'pkg install -y openjdk-17 git wget unzip',
            'wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmdline-tools.zip',
            'unzip cmdline-tools.zip -d $HOME/android/cmdline-tools',
            'rm cmdline-tools.zip'
          ];
          break;
          
        case 'flutter':
          setupCommands = [
            'pkg install -y git wget unzip',
            'wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.10.0-stable.tar.xz -O flutter.tar.xz',
            'tar xf flutter.tar.xz -C $HOME',
            'rm flutter.tar.xz',
            '$HOME/flutter/bin/flutter precache'
          ];
          break;
          
        case 'nodejs':
          setupCommands = [
            'pkg install -y nodejs npm',
            'npm install -g typescript @types/node nodemon pm2'
          ];
          break;
          
        case 'python':
          setupCommands = [
            'pkg install -y python python-pip',
            'pip install --upgrade pip setuptools wheel',
            'pip install virtualenv pipenv poetry pytest black flake8 mypy jupyter notebook'
          ];
          break;
          
        case 'go':
          setupCommands = [
            'pkg install -y golang',
            'go install golang.org/x/tools/gopls@latest',
            'go install golang.org/x/tools/cmd/goimports@latest'
          ];
          break;
          
        case 'rust':
          setupCommands = [
            'pkg install -y rust',
            'cargo install cargo-edit cargo-outdated cargo-watch'
          ];
          break;
          
        default:
          throw new Error(`Unsupported environment type: ${environmentType}`);
      }
      
      // Execute setup commands
      for (const command of setupCommands) {
        try {
          await this.execute(command);
        } catch (error) {
          console.warn(`Setup command failed: ${command}`, error);
          // Continue with other commands
        }
      }
      
      toast(`Development environment ${environmentType} set up successfully!`, 'success');
      return true;
    } catch (error) {
      console.error('Error setting up development environment:', error);
      toast(`Failed to set up ${environmentType} environment: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Export singleton instance
export default new EnhancedTerminalManager();