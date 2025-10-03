/**
 * Additional Platform-Specific Tools Manager for QwenPad IDE
 * Manages tools for languages that require special platform-specific setups
 */

import Executor from '../plugins/terminal/www/Executor';
import toast from '../components/toast';

export default class PlatformToolsManager {
  constructor(container) {
    this.container = container;
    this.tools = [];
    this.installedTools = [];
    
    this._initialize();
  }

  _initialize() {
    // Define platform-specific tools for various languages
    this.tools = [
      // Ruby tools
      {
        id: 'ruby',
        name: 'Ruby Development Tools',
        description: 'Ruby interpreter and development tools',
        url: 'https://www.ruby-lang.org/',
        icon: 'diamond',
        category: 'ruby',
        commands: ['ruby', 'gem', 'bundle', 'rake'],
        installation: {
          termux: 'pkg install ruby',
          linux: 'apt install ruby-full',
          mac: 'brew install ruby',
          windows: 'choco install ruby'
        }
      },
      {
        id: 'rails',
        name: 'Ruby on Rails',
        description: 'Web application framework for Ruby',
        url: 'https://rubyonrails.org/',
        icon: 'train',
        category: 'ruby',
        commands: ['rails new', 'rails server', 'rails console'],
        installation: {
          termux: 'gem install rails',
          linux: 'gem install rails',
          mac: 'gem install rails',
          windows: 'gem install rails'
        }
      },
      
      // PHP tools
      {
        id: 'php',
        name: 'PHP Development Tools',
        description: 'PHP interpreter and development tools',
        url: 'https://www.php.net/',
        icon: 'php',
        category: 'php',
        commands: ['php', 'composer', 'phpunit'],
        installation: {
          termux: 'pkg install php',
          linux: 'apt install php-cli composer',
          mac: 'brew install php composer',
          windows: 'choco install php composer'
        }
      },
      {
        id: 'laravel',
        name: 'Laravel Framework',
        description: 'Web application framework for PHP',
        url: 'https://laravel.com/',
        icon: 'local_fire_department',
        category: 'php',
        commands: ['laravel new', 'php artisan serve', 'php artisan'],
        installation: {
          termux: 'composer global require laravel/installer',
          linux: 'composer global require laravel/installer',
          mac: 'composer global require laravel/installer',
          windows: 'composer global require laravel/installer'
        }
      },
      
      // C/C++ tools
      {
        id: 'gcc',
        name: 'GCC Compiler',
        description: 'GNU Compiler Collection for C/C++',
        url: 'https://gcc.gnu.org/',
        icon: 'code',
        category: 'c_cpp',
        commands: ['gcc', 'g++', 'make'],
        installation: {
          termux: 'pkg install gcc g++ make',
          linux: 'apt install build-essential',
          mac: 'xcode-select --install',
          windows: 'choco install mingw'
        }
      },
      {
        id: 'clang',
        name: 'Clang Compiler',
        description: 'LLVM-based C/C++ compiler',
        url: 'https://clang.llvm.org/',
        icon: 'code',
        category: 'c_cpp',
        commands: ['clang', 'clang++'],
        installation: {
          termux: 'pkg install clang',
          linux: 'apt install clang',
          mac: 'xcode-select --install',
          windows: 'choco install llvm'
        }
      },
      {
        id: 'cmake',
        name: 'CMake Build System',
        description: 'Cross-platform build system generator',
        url: 'https://cmake.org/',
        icon: 'construction',
        category: 'c_cpp',
        commands: ['cmake', 'ctest', 'cpack'],
        installation: {
          termux: 'pkg install cmake',
          linux: 'apt install cmake',
          mac: 'brew install cmake',
          windows: 'choco install cmake'
        }
      },
      
      // Swift tools
      {
        id: 'swift',
        name: 'Swift Development Tools',
        description: 'Apple\'s programming language for iOS/macOS development',
        url: 'https://swift.org/',
        icon: 'apple',
        category: 'swift',
        commands: ['swift', 'swiftc'],
        installation: {
          termux: 'pkg install swift',
          linux: 'Download from https://swift.org/download/',
          mac: 'Included with Xcode',
          windows: 'Download from https://swift.org/download/'
        }
      },
      
      // .NET tools
      {
        id: 'dotnet',
        name: '.NET Development Tools',
        description: 'Microsoft\'s development platform for building applications',
        url: 'https://dotnet.microsoft.com/',
        icon: 'microsoft',
        category: 'dotnet',
        commands: ['dotnet new', 'dotnet build', 'dotnet run'],
        installation: {
          termux: 'pkg install dotnet',
          linux: 'curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin',
          mac: 'brew install dotnet',
          windows: 'choco install dotnet'
        }
      },
      
      // Scala tools
      {
        id: 'scala',
        name: 'Scala Development Tools',
        description: 'Programming language that combines OOP and functional programming',
        url: 'https://www.scala-lang.org/',
        icon: 'functions',
        category: 'scala',
        commands: ['scala', 'scalac', 'sbt'],
        installation: {
          termux: 'pkg install scala sbt',
          linux: 'curl -fL https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-pc-linux.gz | gzip -d > cs && chmod +x cs && ./cs setup',
          mac: 'brew install scala sbt',
          windows: 'choco install scala sbt'
        }
      },
      
      // Haskell tools
      {
        id: 'haskell',
        name: 'Haskell Development Tools',
        description: 'Purely functional programming language',
        url: 'https://www.haskell.org/',
        icon: 'functions',
        category: 'haskell',
        commands: ['ghc', 'cabal', 'stack'],
        installation: {
          termux: 'pkg install ghc cabal-install',
          linux: 'curl --proto \'=https\' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh',
          mac: 'brew install ghc cabal-install',
          windows: 'choco install ghc cabal'
        }
      },
      
      // Lua tools
      {
        id: 'lua',
        name: 'Lua Development Tools',
        description: 'Lightweight, embeddable scripting language',
        url: 'https://www.lua.org/',
        icon: 'code',
        category: 'lua',
        commands: ['lua', 'luac'],
        installation: {
          termux: 'pkg install lua',
          linux: 'apt install lua5.4',
          mac: 'brew install lua',
          windows: 'choco install lua'
        }
      },
      
      // Perl tools
      {
        id: 'perl',
        name: 'Perl Development Tools',
        description: 'Highly capable, feature-rich programming language',
        url: 'https://www.perl.org/',
        icon: 'code',
        category: 'perl',
        commands: ['perl', 'cpan'],
        installation: {
          termux: 'pkg install perl',
          linux: 'apt install perl',
          mac: 'brew install perl',
          windows: 'choco install strawberryperl'
        }
      },
      
      // R tools
      {
        id: 'r',
        name: 'R Development Tools',
        description: 'Language and environment for statistical computing and graphics',
        url: 'https://www.r-project.org/',
        icon: 'analytics',
        category: 'r',
        commands: ['R', 'Rscript'],
        installation: {
          termux: 'pkg install r-base',
          linux: 'apt install r-base',
          mac: 'brew install r',
          windows: 'choco install r'
        }
      },
      
      // Julia tools
      {
        id: 'julia',
        name: 'Julia Development Tools',
        description: 'High-level, high-performance dynamic programming language',
        url: 'https://julialang.org/',
        icon: 'functions',
        category: 'julia',
        commands: ['julia'],
        installation: {
          termux: 'pkg install julia',
          linux: 'Download from https://julialang.org/downloads/',
          mac: 'brew install julia',
          windows: 'choco install julia'
        }
      },
      
      // Elixir tools
      {
        id: 'elixir',
        name: 'Elixir Development Tools',
        description: 'Dynamic, functional language for building scalable applications',
        url: 'https://elixir-lang.org/',
        icon: 'bubble_chart',
        category: 'elixir',
        commands: ['elixir', 'mix', 'iex'],
        installation: {
          termux: 'pkg install elixir',
          linux: 'apt install elixir',
          mac: 'brew install elixir',
          windows: 'choco install elixir'
        }
      },
      
      // Erlang tools
      {
        id: 'erlang',
        name: 'Erlang Development Tools',
        description: 'Programming language for building massively scalable systems',
        url: 'https://www.erlang.org/',
        icon: 'bubble_chart',
        category: 'erlang',
        commands: ['erl', 'escript'],
        installation: {
          termux: 'pkg install erlang',
          linux: 'apt install erlang',
          mac: 'brew install erlang',
          windows: 'choco install erlang'
        }
      },
      
      // Clojure tools
      {
        id: 'clojure',
        name: 'Clojure Development Tools',
        description: 'Dynamic, functional language for the JVM',
        url: 'https://clojure.org/',
        icon: 'functions',
        category: 'clojure',
        commands: ['clojure', 'clj', 'lein'],
        installation: {
          termux: 'pkg install clojure leiningen',
          linux: 'curl -O https://download.clojure.org/install/linux-install.sh && chmod +x linux-install.sh && sudo ./linux-install.sh',
          mac: 'brew install clojure leiningen',
          windows: 'choco install clojure leiningen'
        }
      },
      
      // OCaml tools
      {
        id: 'ocaml',
        name: 'OCaml Development Tools',
        description: 'Industrial-strength functional programming language',
        url: 'https://ocaml.org/',
        icon: 'functions',
        category: 'ocaml',
        commands: ['ocaml', 'ocamlc', 'dune'],
        installation: {
          termux: 'pkg install ocaml',
          linux: 'apt install ocaml',
          mac: 'brew install ocaml',
          windows: 'choco install ocaml'
        }
      },
      
      // Crystal tools
      {
        id: 'crystal',
        name: 'Crystal Development Tools',
        description: 'Programming language with Ruby-like syntax and type inference',
        url: 'https://crystal-lang.org/',
        icon: 'diamond',
        category: 'crystal',
        commands: ['crystal', 'shards'],
        installation: {
          termux: 'pkg install crystal shards',
          linux: 'curl -sSL https://crystal-lang.org/install.sh | sudo bash',
          mac: 'brew install crystal',
          windows: 'choco install crystal'
        }
      }
    ];
    
    // Check which tools are installed
    this._checkInstalledTools();
    
    // Create the UI elements
    this._createUI();
  }

  _checkInstalledTools() {
    // In a real implementation, we would check if the tools are installed
    // For now, we'll just simulate checking
    this.installedTools = [];
    
    this.tools.forEach(tool => {
      // Simulate checking if tool is installed
      const isInstalled = this._isToolInstalled(tool.id);
      if (isInstalled) {
        this.installedTools.push({
          ...tool,
          installed: true,
          version: this._getToolVersion(tool.id)
        });
      }
    });
  }

  _isToolInstalled(toolId) {
    // In a real implementation, we would check if the tool is available
    // For now, we'll return false for all tools
    return false;
  }

  _getToolVersion(toolId) {
    // In a real implementation, we would get the tool version
    // For now, we'll return a placeholder
    return 'unknown';
  }

  _createUI() {
    // Main container
    this.$platformContainer = tag('div', {
      className: 'platform-tools-manager-container',
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
      className: 'platform-tools-manager-header',
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
              className: 'icon construction', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Platform-Specific Tools',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'platform-close-btn',
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

    // Tabs
    this.$tabs = tag('div', {
      className: 'platform-tools-tabs',
      style: {
        display: 'flex',
        borderBottom: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--tab-bg, #f8f9fa)'
      },
      children: [
        tag('button', {
          id: 'platform-installed-tab',
          textContent: 'Installed Tools',
          className: 'platform-tab active',
          onclick: () => this._switchTab('installed'),
          style: {
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--txt-color)',
            cursor: 'pointer',
            borderBottom: '2px solid var(--primary-color)',
            fontWeight: 'bold'
          }
        }),
        tag('button', {
          id: 'platform-available-tab',
          textContent: 'Available Tools',
          className: 'platform-tab',
          onclick: () => this._switchTab('available'),
          style: {
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--txt-secondary-color)',
            cursor: 'pointer',
            marginLeft: '8px'
          }
        }),
        tag('button', {
          id: 'platform-languages-tab',
          textContent: 'By Language',
          className: 'platform-tab',
          onclick: () => this._switchTab('languages'),
          style: {
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--txt-secondary-color)',
            cursor: 'pointer',
            marginLeft: '8px'
          }
        })
      ]
    });

    // Main content area
    this.$contentArea = tag('div', {
      className: 'platform-content-area',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }
    });

    // Action buttons
    this.$actions = tag('div', {
      className: 'platform-actions',
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
        }),
        tag('button', {
          textContent: 'Install All',
          onclick: () => this._installAll(),
          style: {
            padding: '4px 8px',
            border: '1px solid var(--primary-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9em'
          }
        }),
        tag('button', {
          textContent: 'Update All',
          onclick: () => this._updateAll(),
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
      className: 'platform-status-bar',
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
          id: 'platform-status-text',
          textContent: `Available: ${this.tools.length} tools | Installed: ${this.installedTools.length} tools`
        }),
        tag('span', {
          textContent: 'Ready'
        })
      ]
    });

    // Assemble the UI
    this.$platformContainer.appendChild(this.$header);
    this.$platformContainer.appendChild(this.$tabs);
    this.$platformContainer.appendChild(this.$contentArea);
    this.$platformContainer.appendChild(this.$actions);
    this.$platformContainer.appendChild(this.$statusBar);

    // Add to container
    this.container.appendChild(this.$platformContainer);

    // Render initial tool list
    this._renderInstalledTools();
  }

  _switchTab(tabName) {
    // Update tab styling
    document.querySelectorAll('.platform-tab').forEach(tab => {
      tab.className = 'platform-tab';
      tab.style.color = 'var(--txt-secondary-color)';
      tab.style.borderBottom = 'none';
    });
    
    const activeTab = document.getElementById(`platform-${tabName}-tab`);
    if (activeTab) {
      activeTab.className = 'platform-tab active';
      activeTab.style.color = 'var(--txt-color)';
      activeTab.style.borderBottom = '2px solid var(--primary-color)';
    }
    
    // Update content
    switch (tabName) {
      case 'installed':
        this._renderInstalledTools();
        break;
      case 'available':
        this._renderAvailableTools();
        break;
      case 'languages':
        this._renderLanguages();
        break;
    }
  }

  _renderInstalledTools() {
    this.$contentArea.innerHTML = '';

    if (this.installedTools.length === 0) {
      this.$contentArea.appendChild(
        tag('div', {
          style: {
            textAlign: 'center',
            padding: '32px',
            color: 'var(--txt-secondary-color)'
          },
          children: [
            tag('div', {
              className: 'icon construction',
              style: {
                fontSize: '3em',
                marginBottom: '16px',
                color: 'var(--txt-secondary-color)'
              }
            }),
            tag('div', {
              textContent: 'No platform-specific tools installed yet',
              style: {
                fontWeight: 'bold',
                marginBottom: '8px'
              }
            }),
            tag('div', {
              textContent: 'Install tools from the Available Tools tab',
              style: {
                fontSize: '0.9em',
                marginBottom: '16px'
              }
            }),
            tag('button', {
              textContent: '+ Install Tools',
              onclick: () => this._switchTab('available'),
              style: {
                padding: '8px 16px',
                border: '1px solid var(--primary-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }
            })
          ]
        })
      );
      return;
    }

    // Create tools grid
    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }
    });

    this.installedTools.forEach(tool => {
      const $toolCard = this._createToolCard(tool, true);
      $grid.appendChild($toolCard);
    });

    this.$contentArea.appendChild($grid);
  }

  _renderAvailableTools() {
    this.$contentArea.innerHTML = '';

    // Create tools grid
    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }
    });

    this.tools.forEach(tool => {
      const isInstalled = this.installedTools.some(t => t.id === tool.id);
      const $toolCard = this._createToolCard(tool, isInstalled);
      $grid.appendChild($toolCard);
    });

    this.$contentArea.appendChild($grid);
  }

  _renderLanguages() {
    this.$contentArea.innerHTML = '';

    // Group tools by language
    const toolsByLanguage = {};
    this.tools.forEach(tool => {
      if (!toolsByLanguage[tool.category]) {
        toolsByLanguage[tool.category] = [];
      }
      toolsByLanguage[tool.category].push(tool);
    });

    // Create language grid
    const $grid = tag('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px'
      }
    });

    Object.entries(toolsByLanguage).forEach(([language, tools]) => {
      const $languageCard = tag('div', {
        style: {
          border: '1px solid var(--bdr-color)',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'var(--bg-color)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        },
        onmouseover: function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        },
        onmouseout: function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
        },
        onclick: () => this._showLanguageTools(language, tools),
        children: [
          tag('div', {
            style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
            children: [
              tag('span', {
                className: `icon ${this._getLanguageIcon(language)}`,
                style: {
                  fontSize: '1.5em',
                  color: 'var(--primary-color)'
                }
              }),
              tag('div', {
                children: [
                  tag('div', {
                    textContent: language.toUpperCase(),
                    style: {
                      fontWeight: 'bold',
                      fontSize: '1.1em',
                      marginBottom: '4px'
                    }
                  }),
                  tag('div', {
                    textContent: `${tools.length} tools`,
                    style: {
                      fontSize: '0.9em',
                      color: 'var(--txt-secondary-color)'
                    }
                  })
                ]
              })
            ]
          })
        ]
      });
      
      $grid.appendChild($languageCard);
    });

    this.$contentArea.appendChild(
      tag('div', {
        children: [
          tag('h3', {
            textContent: 'Languages',
            style: {
              margin: '0 0 16px 0',
              fontSize: '1.3em'
            }
          }),
          $grid
        ]
      })
    );
  }

  _createToolCard(tool, isInstalled) {
    return tag('div', {
      className: 'platform-tool-card',
      style: {
        border: '1px solid var(--bdr-color)',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'var(--bg-color)',
        transition: 'transform 0.2s'
      },
      onmouseover: function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      },
      onmouseout: function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      },
      children: [
        tag('div', {
          style: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' },
          children: [
            tag('span', {
              className: `icon ${tool.icon}`,
              style: {
                fontSize: '1.5em',
                color: 'var(--primary-color)'
              }
            }),
            tag('div', {
              style: { flex: 1 },
              children: [
                tag('div', {
                  textContent: tool.name,
                  style: {
                    fontWeight: 'bold',
                    fontSize: '1.1em',
                    marginBottom: '4px'
                  }
                }),
                tag('div', {
                  textContent: tool.description,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)',
                    marginBottom: '8px'
                  }
                }),
                tag('span', {
                  textContent: tool.category,
                  style: {
                    fontSize: '0.7em',
                    backgroundColor: 'var(--badge-bg, #e9ecef)',
                    color: 'var(--badge-color, #6c757d)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }
                })
              ]
            })
          ]
        }),
        tag('div', {
          style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
          children: [
            isInstalled ? tag('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8em',
                color: 'var(--success-color, #2ed573)'
              },
              children: [
                tag('span', { className: 'icon check_circle' }),
                tag('span', { textContent: 'Installed' })
              ]
            }) : null,
            tag('button', {
              textContent: isInstalled ? 'Open' : 'Install',
              onclick: isInstalled ? () => this._openTool(tool) : () => this._installTool(tool),
              style: {
                padding: '4px 8px',
                border: `1px solid ${isInstalled ? 'var(--primary-color)' : 'var(--bdr-color)'}`,
                borderRadius: '4px',
                backgroundColor: isInstalled ? 'var(--primary-color)' : 'var(--btn-bg)',
                color: isInstalled ? 'white' : 'var(--btn-txt-color)',
                cursor: 'pointer',
                fontSize: '0.8em',
                fontWeight: 'bold'
              }
            })
          ].filter(Boolean)
        })
      ]
    });
  }

  async _installTool(tool) {
    try {
      this._updateStatusBar(`Installing ${tool.name}...`, 'installing');
      
      // In a real implementation, this would install the tool
      // For now, we'll just show the installation instructions
      this._showInstallationInstructions(tool);
      
      this._updateStatusBar(`${tool.name} installation would begin`, 'success');
    } catch (error) {
      console.error('Error installing tool:', error);
      this._updateStatusBar(`Failed to install ${tool.name}`, 'error');
      toast(`Error installing ${tool.name}: ${error.message}`, 'error');
    }
  }

  async _openTool(tool) {
    try {
      this._updateStatusBar(`Opening ${tool.name}...`, 'loading');
      
      // In a real implementation, this would open the tool or show more options
      // For now, we'll just show a message
      toast(`${tool.name} opened`, 'success');
      
      this._updateStatusBar(`${tool.name} opened`, 'success');
    } catch (error) {
      console.error('Error opening tool:', error);
      this._updateStatusBar(`Failed to open ${tool.name}`, 'error');
      toast(`Error opening ${tool.name}: ${error.message}`, 'error');
    }
  }

  _showInstallationInstructions(tool) {
    // Create modal with installation instructions
    const $modal = tag('div', {
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

    const $dialog = tag('div', {
      style: {
        backgroundColor: 'var(--bg-color)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      },
      children: [
        tag('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
          children: [
            tag('h3', {
              textContent: `Install ${tool.name}`,
              style: { margin: 0 }
            }),
            tag('button', {
              innerHTML: '&times;',
              onclick: () => document.body.removeChild($modal),
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
        }),
        tag('div', {
          textContent: tool.description,
          style: {
            marginBottom: '16px',
            color: 'var(--txt-secondary-color)'
          }
        }),
        tag('div', {
          style: {
            marginBottom: '16px'
          },
          children: [
            tag('h4', {
              textContent: 'Installation Methods',
              style: { margin: '0 0 12px 0' }
            })
          ]
        }),
        tag('div', {
          children: Object.entries(tool.installation).map(([platform, command]) => 
            tag('div', {
              style: { marginBottom: '12px' },
              children: [
                tag('div', {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
                  children: [
                    tag('strong', { textContent: platform.charAt(0).toUpperCase() + platform.slice(1) }),
                    tag('button', {
                      textContent: 'Copy',
                      onclick: () => this._copyToClipboard(command),
                      style: {
                        padding: '2px 8px',
                        border: '1px solid var(--bdr-color)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--btn-bg)',
                        color: 'var(--btn-txt-color)',
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }
                    })
                  ]
                }),
                tag('div', {
                  textContent: command,
                  style: {
                    fontFamily: 'monospace',
                    fontSize: '0.8em',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--txt-color)',
                    padding: '8px',
                    borderRadius: '4px',
                    overflowX: 'auto'
                  }
                })
              ]
            })
          )
        }),
        tag('button', {
          textContent: 'Close',
          onclick: () => document.body.removeChild($modal),
          style: {
            padding: '8px 16px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '16px'
          }
        })
      ]
    });

    $modal.appendChild($dialog);
    document.body.appendChild($modal);
  }

  _copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast('Copied to clipboard!', 'success');
      });
    } else {
      const textArea = tag('textarea', {
        value: text,
        style: {
          position: 'absolute',
          left: '-9999px',
          top: '-9999px'
        }
      });
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast('Copied to clipboard!', 'success');
    }
  }

  _showLanguageTools(language, tools) {
    // Create modal with tools for this language
    const $modal = tag('div', {
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

    const $dialog = tag('div', {
      style: {
        backgroundColor: 'var(--bg-color)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      },
      children: [
        tag('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
          children: [
            tag('div', {
              children: [
                tag('h3', {
                  textContent: language.toUpperCase(),
                  style: { margin: 0 }
                }),
                tag('div', {
                  textContent: `${tools.length} tools available`,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)'
                  }
                })
              ]
            }),
            tag('button', {
              innerHTML: '&times;',
              onclick: () => document.body.removeChild($modal),
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
        }),
        tag('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px'
          },
          children: tools.map(tool => 
            tag('div', {
              style: {
                border: '1px solid var(--bdr-color)',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: 'var(--input-container-bg, #f8f9fa)'
              },
              children: [
                tag('div', {
                  textContent: tool.name,
                  style: {
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }
                }),
                tag('div', {
                  textContent: tool.description,
                  style: {
                    fontSize: '0.9em',
                    color: 'var(--txt-secondary-color)',
                    marginBottom: '8px'
                  }
                }),
                tag('div', {
                  style: { display: 'flex', gap: '8px' },
                  children: [
                    tag('button', {
                      textContent: 'Install',
                      onclick: () => {
                        document.body.removeChild($modal);
                        this._installTool(tool);
                      },
                      style: {
                        padding: '4px 8px',
                        border: '1px solid var(--primary-color)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        fontWeight: 'bold'
                      }
                    }),
                    tag('button', {
                      textContent: 'Details',
                      onclick: () => this._showToolDetails(tool),
                      style: {
                        padding: '4px 8px',
                        border: '1px solid var(--bdr-color)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--btn-bg)',
                        color: 'var(--btn-txt-color)',
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }
                    })
                  ]
                })
              ]
            })
          )
        }),
        tag('button', {
          textContent: 'Close',
          onclick: () => document.body.removeChild($modal),
          style: {
            padding: '8px 16px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '16px'
          }
        })
      ]
    });

    $modal.appendChild($dialog);
    document.body.appendChild($modal);
  }

  _showToolDetails(tool) {
    toast(`Showing details for ${tool.name}`, 'info');
    // This would show detailed information about the tool
  }

  _getLanguageIcon(language) {
    const iconMap = {
      'ruby': 'diamond',
      'php': 'php',
      'c_cpp': 'code',
      'swift': 'apple',
      'dotnet': 'microsoft',
      'scala': 'functions',
      'haskell': 'functions',
      'lua': 'code',
      'perl': 'code',
      'r': 'analytics',
      'julia': 'functions',
      'elixir': 'bubble_chart',
      'erlang': 'bubble_chart',
      'clojure': 'functions',
      'ocaml': 'functions',
      'crystal': 'diamond'
    };
    
    return iconMap[language] || 'code';
  }

  async _installAll() {
    try {
      this._updateStatusBar('Installing all tools...', 'installing');
      
      // Install all available tools
      for (const tool of this.tools) {
        try {
          await this._installTool(tool);
        } catch (error) {
          console.warn(`Failed to install ${tool.name}:`, error);
          // Continue with other tools
        }
      }
      
      toast('All tools installation initiated!', 'success');
      this._updateStatusBar('All tools installation initiated', 'success');
    } catch (error) {
      console.error('Error installing all tools:', error);
      toast(`Error installing tools: ${error.message}`, 'error');
      this._updateStatusBar('Failed to install tools', 'error');
    }
  }

  async _updateAll() {
    try {
      this._updateStatusBar('Updating all tools...', 'updating');
      
      // Update all installed tools
      for (const tool of this.installedTools) {
        try {
          await this._updateTool(tool);
        } catch (error) {
          console.warn(`Failed to update ${tool.name}:`, error);
          // Continue with other tools
        }
      }
      
      toast('All tools updated successfully!', 'success');
      this._updateStatusBar('All tools updated', 'success');
    } catch (error) {
      console.error('Error updating all tools:', error);
      toast(`Error updating tools: ${error.message}`, 'error');
      this._updateStatusBar('Failed to update tools', 'error');
    }
  }

  async _updateTool(tool) {
    try {
      this._updateStatusBar(`Updating ${tool.name}...`, 'updating');
      
      // In a real implementation, this would update the tool
      // For now, we'll just show a message
      toast(`${tool.name} updated`, 'success');
      
      this._updateStatusBar(`${tool.name} updated`, 'success');
    } catch (error) {
      console.error('Error updating tool:', error);
      toast(`Error updating ${tool.name}: ${error.message}`, 'error');
      this._updateStatusBar(`Failed to update ${tool.name}`, 'error');
    }
  }

  async _refresh() {
    try {
      this._updateStatusBar('Refreshing tools...', 'loading');
      
      // Refresh available and installed tools
      this._checkInstalledTools();
      
      // Update UI elements
      document.getElementById('platform-status-text').textContent = 
        `Available: ${this.tools.length} tools | Installed: ${this.installedTools.length} tools`;
      
      // Re-render current tab
      const activeTab = document.querySelector('.platform-tab.active');
      if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'platform-installed-tab') {
          this._renderInstalledTools();
        } else if (tabId === 'platform-available-tab') {
          this._renderAvailableTools();
        } else if (tabId === 'platform-languages-tab') {
          this._renderLanguages();
        }
      }
      
      this._updateStatusBar('Tools refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing tools:', error);
      toast('Error refreshing tools', 'error');
      this._updateStatusBar('Failed to refresh tools', 'error');
    }
  }

  _updateStatusBar(text, status) {
    const statusElement = document.getElementById('platform-status-text');
    if (statusElement) {
      statusElement.textContent = text;
      
      // Update status color based on status type
      switch (status) {
        case 'ready':
          statusElement.style.color = 'var(--txt-secondary-color)';
          break;
        case 'installing':
        case 'updating':
        case 'loading':
          statusElement.style.color = 'var(--warning-color, #ffa502)';
          break;
        case 'success':
          statusElement.style.color = 'var(--success-color, #2ed573)';
          break;
        case 'error':
          statusElement.style.color = 'var(--error-color, #ff4757)';
          break;
        default:
          statusElement.style.color = 'var(--txt-secondary-color)';
      }
    }
  }

  open() {
    this.$platformContainer.style.display = 'flex';
  }

  close() {
    this.$platformContainer.style.display = 'none';
  }
}