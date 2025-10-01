# Enhanced Dependency Management System

## Overview

The enhanced dependency management system in QwenPad IDE provides comprehensive support for managing dependencies across multiple programming languages and frameworks, including specialized development environment tools for mobile and cloud development.

## Core Features

### Universal Dependency Management
- **Multi-Language Support**: Handles dependencies for JavaScript/Node.js, Python, Go, Rust, Java/Kotlin, Dart/Flutter, and more
- **Automatic Detection**: Automatically identifies project types and configures appropriate dependency managers
- **One-Click Operations**: Install, update, and manage dependencies with simple UI interactions
- **Security Scanning**: Identifies vulnerabilities in project dependencies
- **Version Conflict Resolution**: Handles dependency version conflicts intelligently

### Special Development Environment Tools

#### Android Development Tools
- **Android SDK**: Complete Android Software Development Kit
- **Android NDK**: Native Development Kit for C/C++ development
- **Platform Tools**: ADB, Fastboot, and other Android debugging tools
- **Build Tools**: Compilation and packaging tools for Android apps
- **Target Platforms**: API level support for different Android versions

#### Mobile Development Frameworks
- **Flutter SDK**: Google's UI toolkit for building natively compiled applications
- **Jetpack Compose**: Android's modern toolkit for building native UI
- **React Native**: Framework for building native mobile apps using React
- **Xamarin**: Microsoft's cross-platform development framework

#### Cloud Development Tools
- **Terraform**: Infrastructure as Code tool for provisioning cloud resources
- **Ansible**: Automation tool for configuration management and deployment
- **AWS CLI**: Command-line interface for Amazon Web Services
- **Azure CLI**: Command-line interface for Microsoft Azure
- **Google Cloud CLI**: Command-line interface for Google Cloud Platform
- **Kubernetes Tools**: Helm, kubectl, and related Kubernetes utilities

#### Container and Orchestration Tools
- **Docker CLI**: Command-line interface for Docker container management
- **Podman**: Alternative to Docker with rootless containers
- **Kubernetes CLI**: kubectl for Kubernetes cluster management
- **Helm**: Package manager for Kubernetes

#### Programming Language Tools
- **Node.js Tools**: npm, yarn, pnpm, and related ecosystem tools
- **Python Tools**: pip, pipenv, conda, poetry, and virtual environment management
- **Go Tools**: Go modules, gopls language server, and additional utilities
- **Rust Tools**: Cargo package manager, rustup, and development utilities
- **Java/Kotlin Tools**: Maven, Gradle, and build tool integrations
- **Dart/Flutter Tools**: Pub package manager and Flutter CLI tools

## Architecture

The dependency management system follows a modular plugin architecture:

```
+-------------------------+
|  Dependency Manager UI  |  <- User interface for managing dependencies
+-------------------------+
|  Universal Manager      |  <- Orchestrates all dependency operations
+-------------------------+
|  Language Managers      |  <- Specialized managers for each language
+-------------------------+
|  Environment Managers   |  <- Specialized managers for dev environments
+-------------------------+
|  Core System            |  <- Base QwenPad IDE functionality
+-------------------------+
```

### Language-Specific Managers
Each programming language has a dedicated manager that handles:
- Dependency installation and updates
- Package listing and querying
- Version resolution
- Security scanning
- Integration with language-specific tools

### Environment Managers
Specialized managers for development environments:
- **AndroidEnvironmentManager**: Handles Android SDK, NDK, and platform tools
- **IOSEnvironmentManager**: Manages iOS development tools (where possible)
- **GoEnvironmentManager**: Additional Go tools beyond the core language
- **NodeEnvironmentManager**: Node.js ecosystem tools and utilities
- **PythonEnvironmentManager**: Python tools and virtual environment management
- **RustEnvironmentManager**: Rust toolchain and cargo utilities
- **FlutterEnvironmentManager**: Flutter SDK and related tools
- **DockerEnvironmentManager**: Container management tools
- **GitEnvironmentManager**: Git and related version control tools

## Key Components

### 1. Project Detection
Automatically detects project types by scanning for characteristic files:
- `package.json` for Node.js projects
- `requirements.txt`, `pyproject.toml` for Python projects
- `go.mod` for Go projects
- `Cargo.toml` for Rust projects
- `pom.xml`, `build.gradle` for Java/Kotlin projects
- `pubspec.yaml` for Dart/Flutter projects

### 2. Dependency Installation
Provides one-click installation of all project dependencies:
```javascript
// Example usage
const projectPath = '/path/to/my/project';
await DependencyManager.install(projectPath);
```

### 3. Dependency Updates
Keeps dependencies up-to-date with security patches:
```javascript
// Example usage
const projectPath = '/path/to/my/project';
await DependencyManager.update(projectPath);
```

### 4. Security Scanning
Identifies known vulnerabilities in project dependencies:
```javascript
// Example usage
const projectPath = '/path/to/my/project';
const vulnerabilities = await DependencyManager.scanSecurity(projectPath);
```

### 5. Environment Setup
Installs and configures complete development environments:
```javascript
// Example usage
const installPath = '/data/data/com.termux/files/home/android-sdk';
await DependencyManager.installEnvironment('android', installPath, {
  components: ['sdk', 'ndk', 'platform-tools', 'build-tools'],
  apiLevels: ['android-30', 'android-31', 'android-33']
});
```

## UI Components

### 1. Dependency Explorer
Visual tree view of project dependencies with:
- Dependency hierarchies
- Version information
- Security status indicators
- Outdated package warnings

### 2. Installation Wizard
Step-by-step guide for setting up development environments:
- Android SDK/NDK installation
- Flutter setup
- Cloud CLI configuration
- Language toolchains

### 3. Security Dashboard
Centralized view of security vulnerabilities:
- Vulnerability severity levels
- Affected packages
- Remediation recommendations
- Historical tracking

### 4. Update Manager
Unified interface for keeping everything up-to-date:
- Project dependencies
- Development tools
- Environment components
- Security patches

## API Reference

### Core Methods

#### `DependencyManager.install(projectPath)`
Installs all dependencies for a project.

#### `DependencyManager.update(projectPath)`
Updates all dependencies to their latest compatible versions.

#### `DependencyManager.list(projectPath)`
Lists all dependencies for a project.

#### `DependencyManager.outdated(projectPath)`
Checks for outdated dependencies.

#### `DependencyManager.scanSecurity(projectPath)`
Scans for security vulnerabilities.

#### `DependencyManager.installEnvironment(envType, installPath, options)`
Installs a complete development environment.

#### `DependencyManager.updateEnvironment(envType, installPath)`
Updates a development environment.

#### `DependencyManager.isEnvironmentInstalled(envType, installPath)`
Checks if an environment is installed.

## Best Practices

### 1. Project Structure
Organize projects with standard configuration files:
```
my-project/
├── package.json        # Node.js dependencies
├── requirements.txt    # Python dependencies
├── go.mod             # Go modules
├── Cargo.toml         # Rust dependencies
├── pubspec.yaml       # Flutter/Dart dependencies
└── README.md          # Project documentation
```

### 2. Environment Isolation
Use virtual environments and containers where appropriate:
- Python virtual environments
- Node.js workspaces
- Docker containers for consistent environments
- Kubernetes namespaces for isolation

### 3. Security Management
Regularly update dependencies and scan for vulnerabilities:
- Weekly dependency updates
- Monthly security audits
- Automated vulnerability scanning
- Patch management policies

### 4. Version Control
Keep dependency files in version control:
- Lock files (package-lock.json, yarn.lock, etc.)
- Environment configuration files
- CI/CD pipeline definitions
- Security policy files

## Performance Considerations

- **Caching**: Cache package metadata to reduce network requests
- **Parallel Processing**: Install dependencies in parallel when possible
- **Delta Updates**: Only download changed packages
- **Lazy Loading**: Load dependency information on-demand
- **Memory Management**: Efficiently manage large dependency trees

## Troubleshooting

### Common Issues

1. **Installation Failures**
   - Check internet connectivity
   - Verify sufficient disk space
   - Ensure proper permissions
   - Check for conflicting installations

2. **Version Conflicts**
   - Use dependency resolution tools
   - Pin critical dependencies
   - Resolve conflicts manually when needed
   - Consider using dependency managers with better conflict resolution

3. **Security Warnings**
   - Update vulnerable packages immediately
   - Review security advisories
   - Apply security patches
   - Consider alternative packages for critical vulnerabilities

### Debugging Tips

1. **Verbose Logging**: Enable detailed logging for troubleshooting
2. **Network Diagnostics**: Check connectivity to package repositories
3. **Disk Space Monitoring**: Ensure adequate space for installations
4. **Permission Verification**: Confirm proper file system permissions