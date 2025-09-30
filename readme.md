# QwenPad IDE - Advanced Mobile Development Environment

## Overview

QwenPad IDE is a comprehensive mobile development environment that combines code editing, terminal access, Git/SSH management, remote file editing, Kubernetes tools, Infrastructure as Code (IaC) integration, and AI-powered coding assistance. Built on the foundation of Acode, this enhanced version provides developers and cloud engineers with powerful tools to code, deploy, and manage applications from their Android tablets. Additionally, QwenPad IDE provides automated project scaffolding and dependency management for multiple programming languages and frameworks.

## Key Features

### 1. Advanced Code Editing
- Full-featured code editor with syntax highlighting for 100+ languages
- File and folder management with support for external storage
- Multi-tab interface with file preview
- Customizable themes and settings

### 2. Smart Project Scaffolding
- One-click project creation for popular frameworks
- Automated dependency installation and setup
- Support for Flutter, Jetpack Compose, React, Vue, Angular, Node.js, Python, Go, and more
- Custom project templates with best practices

### 3. Advanced Dependency Management
- Universal dependency management for multiple languages (Node.js, Python, Go, Rust, Java, Kotlin, Dart)
- Automatic detection of project types and dependency files
- One-click install and update of project dependencies
- Security scanning and vulnerability checking
- Version conflict resolution

### 3. Termux Integration
- Native integration with Termux for full Linux environment access
- Terminal capabilities within the app using Alpine Linux sandbox
- Access to Linux command line tools and package managers

### 4. AI-Powered Coding (Qwen Coder)
- Qwen AI integration for code suggestions and completions
- Context-aware assistance with project understanding
- Hybrid local and cloud processing for optimal performance
- Natural language to code generation

### 5. Git and Version Control
- Full Git workflow support (clone, commit, push, pull, branch, merge)
- SSH key management for secure remote repository access
- Visual git history and diff tools

### 6. Remote File Management
- Secure file editing over SSH/SFTP connections
- Direct editing of files on cloud servers or clusters
- Remote directory browsing and file operations

### 7. SSH Manager
- Centralized SSH key management
- Connection profiles with auto-login capabilities
- Secure credential storage
- Multiple server connection support

### 8. K8s Manager
- Kubernetes cluster management interface
- Multi-cluster connection profiles
- Resource deployment and monitoring
- Integrated kubectl command execution

### 9. Infrastructure as Code (IaC) Tools
- Terraform/Terragrunt/OpenTofu integration
- Ansible execution capabilities
- Cloud Formation (AWS), GCP CLI, and other cloud provider tools
- Multi-cloud infrastructure management

## Architecture

QwenPad IDE is built using Apache Cordova, leveraging web technologies (HTML, CSS, JavaScript) to create a native Android application. The architecture includes:

- **Core Editor**: Based on the Ace editor with extensive customization
- **Terminal System**: Cordova plugins for executing shell commands in sandboxed environments
- **File System**: Custom file system abstraction supporting local, Termux, and remote storage
- **Plugin System**: Extensible architecture for adding new functionality
- **AI Integration Layer**: API-based connection to Qwen AI models

## Plugins Architecture

The enhanced version includes several new plugins:

- **Git Plugin**: Provides Git operations through the terminal executor
- **SSH Manager**: Handles SSH connections and key management
- **Cloud Connectors**: Plugins for AWS, GCP, Azure integration
- **Kubernetes Manager**: kubectl integration and cluster tools
- **IaC Tools**: Integration with Terraform, Ansible, and other IaC tools
- **Qwen AI Assistant**: AI-powered coding assistance

## Installation

For development:

```bash
# Clone the repository
git clone https://github.com/masardon/qwenpad-ide.git

# Navigate to project directory
cd qwenpad-ide

# Install dependencies
npm install

# Build the project
npm run build

# Add Android platform
npx cordova platform add android

# Run on device
npx cordova run android
```

## Development Roadmap

### Phase 1: Core Infrastructure & Architecture
- [x] Fork and customize ACode base
- [x] Extend terminal integration
- [x] Create plugin architecture

### Phase 2: AI Integration (Qwen Coder)
- [ ] API integration layer
- [ ] AI assistant UI
- [ ] Context management

### Phase 3: Git and Remote Management
- [ ] Git plugin development
- [ ] Remote file management
- [ ] SSH key management

### Phase 4: Cloud & Infrastructure Tools
- [ ] Kubernetes integration
- [ ] IaC tools integration
- [ ] Remote execution framework

### Phase 5: Advanced Features
- [ ] Remote development capabilities
- [ ] Cloud provider integration
- [ ] Kubernetes resource management

### Phase 6: Polish & Testing
- [ ] UI/UX enhancements
- [ ] Performance optimization
- [ ] Security review
- [ ] Testing & QA

## Contributing

We welcome contributions to QwenPad IDE! Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built on the foundation of Acode (https://github.com/Acode-Foundation/Acode)
- Powered by Qwen AI
- Cordova/PhoneGap for cross-platform development
