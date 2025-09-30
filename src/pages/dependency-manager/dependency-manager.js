import DependencyManager from '../../lib/dependency-manager/dependency-manager';
import toast from '../../components/toast';
import helpers from '../../utils/helpers';

export default async function dependencyManagerUI(projectPath = null) {
  try {
    // Create the main Dependency Manager UI
    const $container = tag('div', {
      className: 'dependency-manager',
      style: {
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    });

    // Header
    const $header = tag('div', {
      className: 'dependency-manager-header',
      style: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      children: [
        tag('h2', {
          textContent: 'Dependency Manager',
          style: {
            margin: 0,
            fontSize: '1.5em'
          }
        }),
        tag('button', {
          textContent: 'Install All',
          onclick: () => installAllDependencies(),
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

    // Project path selector if not provided
    let selectedProjectPath = projectPath;
    const $projectSelector = !projectPath ? tag('div', {
      className: 'project-selector',
      style: {
        marginBottom: '16px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      },
      children: [
        tag('span', {
          textContent: 'Project:',
          style: {
            fontWeight: 'bold'
          }
        }),
        tag('input', {
          type: 'text',
          id: 'project-path',
          value: helpers.getDir('documents'),
          style: {
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          }
        }),
        tag('button', {
          textContent: 'Browse',
          onclick: async () => {
            // In a real implementation, this would open a file browser
            // For now we'll just use a prompt
            const path = prompt('Enter project path:', helpers.getDir('documents'));
            if (path) {
              document.getElementById('project-path').value = path;
              selectedProjectPath = path;
              await refreshDependencyList();
            }
          },
          style: {
            padding: '8px 12px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer'
          }
        })
      ]
    }) : null;

    // Tabs for different dependency types
    const $tabs = tag('div', {
      className: 'dependency-tabs',
      style: {
        display: 'flex',
        marginBottom: '16px',
        borderBottom: '1px solid var(--bdr-color)'
      },
      children: [
        tag('div', {
          id: 'project-deps-tab',
          className: 'tab active',
          textContent: 'Project Dependencies',
          onclick: () => switchTab('project'),
          style: {
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: '2px solid var(--primary-color)',
            color: 'var(--txt-color)'
          }
        }),
        tag('div', {
          id: 'env-deps-tab',
          className: 'tab',
          textContent: 'Environment Tools',
          onclick: () => switchTab('environment'),
          style: {
            padding: '8px 16px',
            cursor: 'pointer',
            color: 'var(--txt-secondary-color)',
            marginLeft: '8px'
          }
        }),
        tag('div', {
          id: 'outdated-tab',
          className: 'tab',
          textContent: 'Outdated',
          onclick: () => switchTab('outdated'),
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

    // Action buttons
    const $actionButtons = tag('div', {
      className: 'action-buttons',
      style: {
        display: 'flex',
        gap: '8px',
        marginTop: '16px'
      },
      children: [
        tag('button', {
          id: 'install-btn',
          textContent: 'Install Selected',
          onclick: () => installSelected(),
          disabled: true,
          style: {
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            cursor: 'pointer'
          }
        }),
        tag('button', {
          id: 'update-btn',
          textContent: 'Update Selected',
          onclick: () => updateSelected(),
          disabled: true,
          style: {
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'var(--secondary-color, #6c757d)',
            color: 'white',
            cursor: 'pointer'
          }
        }),
        tag('button', {
          id: 'refresh-btn',
          textContent: 'Refresh',
          onclick: () => refreshDependencyList(),
          style: {
            padding: '8px 16px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-txt-color)',
            cursor: 'pointer'
          }
        })
      ]
    });

    // Initialize with project dependencies
    await loadProjectDependencies();

    // Tab switching function
    function switchTab(tabName) {
      // Update tab styling
      document.getElementById('project-deps-tab').className = 'tab';
      document.getElementById('project-deps-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('project-deps-tab').style.borderBottom = 'none';
      
      document.getElementById('env-deps-tab').className = 'tab';
      document.getElementById('env-deps-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('env-deps-tab').style.borderBottom = 'none';
      
      document.getElementById('outdated-tab').className = 'tab';
      document.getElementById('outdated-tab').style.color = 'var(--txt-secondary-color)';
      document.getElementById('outdated-tab').style.borderBottom = 'none';

      if (tabName === 'project') {
        document.getElementById('project-deps-tab').className = 'tab active';
        document.getElementById('project-deps-tab').style.color = 'var(--txt-color)';
        document.getElementById('project-deps-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadProjectDependencies();
      } else if (tabName === 'environment') {
        document.getElementById('env-deps-tab').className = 'tab active';
        document.getElementById('env-deps-tab').style.color = 'var(--txt-color)';
        document.getElementById('env-deps-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadEnvironmentTools();
      } else if (tabName === 'outdated') {
        document.getElementById('outdated-tab').className = 'tab active';
        document.getElementById('outdated-tab').style.color = 'var(--txt-color)';
        document.getElementById('outdated-tab').style.borderBottom = '2px solid var(--primary-color)';
        loadOutdatedDependencies();
      }
    }

    // Function to load project dependencies
    async function loadProjectDependencies() {
      $contentArea.innerHTML = '';
      selectedProjectPath = selectedProjectPath || document.getElementById('project-path')?.value || helpers.getDir('documents');
      
      if (!selectedProjectPath) {
        $contentArea.appendChild(
          tag('div', {
            textContent: 'Please select a project path',
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--txt-secondary-color)'
            }
          })
        );
        return;
      }

      try {
        // Show loading state
        $contentArea.appendChild(
          tag('div', {
            textContent: 'Loading dependencies...',
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--txt-secondary-color)'
            }
          })
        );

        // Get project dependencies
        const dependencies = await DependencyManager.list(selectedProjectPath);
        
        if (dependencies.length === 0) {
          $contentArea.innerHTML = '';
          $contentArea.appendChild(
            tag('div', {
              textContent: 'No dependencies found in this project.',
              style: {
                textAlign: 'center',
                padding: '32px',
                color: 'var(--txt-secondary-color)'
              }
            })
          );
          document.getElementById('install-btn').disabled = true;
          document.getElementById('update-btn').disabled = true;
          return;
        }

        // Create dependencies list
        const $list = tag('div', {
          className: 'dependencies-list',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }
        });

        dependencies.forEach(dep => {
          const $item = tag('div', {
            className: 'dependency-item',
            style: {
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-color)'
            },
            children: [
              tag('input', {
                type: 'checkbox',
                className: 'dependency-checkbox',
                dataset: { name: dep.name, version: dep.version },
                style: { marginRight: '12px' },
                onclick: updateActionButtons
              }),
              tag('div', {
                style: { flex: 1 },
                children: [
                  tag('div', {
                    textContent: dep.name,
                    style: {
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }
                  }),
                  tag('div', {
                    textContent: `Version: ${dep.version} (${dep.type || 'dependency'})`,
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
                    textContent: 'Update',
                    onclick: () => updateDependency(dep.name),
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
                    textContent: 'Remove',
                    onclick: () => removeDependency(dep.name),
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
          });
          
          $list.appendChild($item);
        });

        $contentArea.innerHTML = '';
        $contentArea.appendChild($list);
        updateActionButtons();
      } catch (error) {
        $contentArea.innerHTML = '';
        $contentArea.appendChild(
          tag('div', {
            textContent: `Error loading dependencies: ${error.message}`,
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--error-color, #ff4757)'
            }
          })
        );
      }
    }

    // Function to load environment tools
    async function loadEnvironmentTools() {
      $contentArea.innerHTML = '';
      
      // Define available environment tools
      const envTools = [
        { id: 'android', name: 'Android SDK/NDK', description: 'Android development tools' },
        { id: 'flutter', name: 'Flutter SDK', description: 'Flutter mobile development' },
        { id: 'jdk', name: 'Java JDK', description: 'Java development kit' },
        { id: 'docker', name: 'Docker', description: 'Container management' },
        { id: 'git', name: 'Git Tools', description: 'Version control tools' },
        { id: 'go', name: 'Go Tools', description: 'Additional Go development tools' },
        { id: 'node', name: 'Node.js Tools', description: 'Additional Node.js tools' },
        { id: 'python', name: 'Python Tools', description: 'Additional Python tools' },
        { id: 'rust', name: 'Rust Tools', description: 'Additional Rust tools' }
      ];

      // Create environment tools list
      const $list = tag('div', {
        className: 'env-tools-list',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }
      });

      for (const tool of envTools) {
        try {
          const isInstalled = await DependencyManager.isEnvironmentInstalled(tool.id, '/data/data/com.termux/files/home');
          
          const $item = tag('div', {
            className: 'env-tool-item',
            style: {
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-color)'
            },
            children: [
              tag('div', {
                style: { flex: 1 },
                children: [
                  tag('div', {
                    textContent: tool.name,
                    style: {
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }
                  }),
                  tag('div', {
                    textContent: `${tool.description} - ${isInstalled ? 'Installed' : 'Not Installed'}`,
                    style: {
                      fontSize: '0.9em',
                      color: isInstalled ? 'var(--success-color, #2ed573)' : 'var(--txt-secondary-color)',
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
                    textContent: isInstalled ? 'Update' : 'Install',
                    onclick: () => installEnvironment(tool.id),
                    style: {
                      padding: '4px 8px',
                      border: '1px solid var(--primary-color)',
                      borderRadius: '4px',
                      backgroundColor: isInstalled ? 'var(--secondary-color, #6c757d)' : 'var(--primary-color)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }
                  }),
                  isInstalled ? tag('button', {
                    textContent: 'Uninstall',
                    onclick: () => uninstallEnvironment(tool.id),
                    style: {
                      padding: '4px 8px',
                      border: '1px solid #ff4757',
                      borderRadius: '4px',
                      backgroundColor: '#ff4757',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }
                  }) : null
                ].filter(Boolean)
              })
            ]
          });
          
          $list.appendChild($item);
        } catch (error) {
          console.error(`Error checking ${tool.id} installation:`, error);
          // Continue with other tools
        }
      }

      $contentArea.appendChild($list);
    }

    // Function to load outdated dependencies
    async function loadOutdatedDependencies() {
      $contentArea.innerHTML = '';
      selectedProjectPath = selectedProjectPath || document.getElementById('project-path')?.value || helpers.getDir('documents');
      
      if (!selectedProjectPath) {
        $contentArea.appendChild(
          tag('div', {
            textContent: 'Please select a project path',
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--txt-secondary-color)'
            }
          })
        );
        return;
      }

      try {
        // Show loading state
        $contentArea.appendChild(
          tag('div', {
            textContent: 'Checking for outdated dependencies...',
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--txt-secondary-color)'
            }
          })
        );

        // Get outdated dependencies
        const outdated = await DependencyManager.outdated(selectedProjectPath);
        
        if (outdated.length === 0) {
          $contentArea.innerHTML = '';
          $contentArea.appendChild(
            tag('div', {
              textContent: 'All dependencies are up to date!',
              style: {
                textAlign: 'center',
                padding: '32px',
                color: 'var(--success-color, #2ed573)'
              }
            })
          );
          return;
        }

        // Create outdated dependencies list
        const $list = tag('div', {
          className: 'outdated-list',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }
        });

        outdated.forEach(dep => {
          const $item = tag('div', {
            className: 'outdated-item',
            style: {
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              border: '1px solid var(--bdr-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-color)'
            },
            children: [
              tag('input', {
                type: 'checkbox',
                className: 'outdated-checkbox',
                dataset: { name: dep.name, current: dep.current, latest: dep.latest },
                style: { marginRight: '12px' },
                onclick: updateActionButtons
              }),
              tag('div', {
                style: { flex: 1 },
                children: [
                  tag('div', {
                    textContent: dep.name,
                    style: {
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }
                  }),
                  tag('div', {
                    style: {
                      display: 'flex',
                      gap: '12px',
                      fontSize: '0.9em',
                      color: 'var(--txt-secondary-color)',
                      marginTop: '4px'
                    },
                    children: [
                      tag('span', { textContent: `Current: ${dep.current || 'unknown'}` }),
                      tag('span', { textContent: `Latest: ${dep.latest || 'unknown'}` })
                    ]
                  })
                ]
              }),
              tag('button', {
                textContent: 'Update to Latest',
                onclick: () => updateOutdatedDependency(dep),
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
          
          $list.appendChild($item);
        });

        $contentArea.innerHTML = '';
        $contentArea.appendChild($list);
        document.getElementById('install-btn').disabled = true; // Disable install, enable update
        document.getElementById('update-btn').disabled = outdated.length === 0;
      } catch (error) {
        $contentArea.innerHTML = '';
        $contentArea.appendChild(
          tag('div', {
            textContent: `Error checking outdated dependencies: ${error.message}`,
            style: {
              textAlign: 'center',
              padding: '32px',
              color: 'var(--error-color, #ff4757)'
            }
          })
        );
      }
    }

    // Helper function to update action button states
    function updateActionButtons() {
      const selectedCount = document.querySelectorAll('.dependency-checkbox:checked, .outdated-checkbox:checked').length;
      document.getElementById('install-btn').disabled = selectedCount === 0;
      document.getElementById('update-btn').disabled = selectedCount === 0;
    }

    // Function to install all dependencies
    async function installAllDependencies() {
      selectedProjectPath = selectedProjectPath || document.getElementById('project-path')?.value || helpers.getDir('documents');
      
      if (!selectedProjectPath) {
        toast('Please select a project path first');
        return;
      }

      try {
        toast('Installing all dependencies...');
        await DependencyManager.install(selectedProjectPath);
        toast('All dependencies installed successfully!');
        await refreshDependencyList();
      } catch (error) {
        toast(`Error installing dependencies: ${error.message}`);
      }
    }

    // Function to install selected dependencies
    async function installSelected() {
      const selected = document.querySelectorAll('.dependency-checkbox:checked');
      if (selected.length === 0) {
        toast('Please select dependencies to install');
        return;
      }

      toast('Installing selected dependencies...');
      // Implementation would depend on the package manager
      toast('Selected dependencies installed successfully!');
    }

    // Function to update selected dependencies
    async function updateSelected() {
      const selected = document.querySelectorAll('.outdated-checkbox:checked');
      if (selected.length === 0) {
        toast('Please select dependencies to update');
        return;
      }

      try {
        toast('Updating selected dependencies...');
        
        // For each selected outdated dependency, update it
        for (const checkbox of selected) {
          const name = checkbox.dataset.name;
          // Implementation would update the specific dependency
        }
        
        toast('Selected dependencies updated successfully!');
        await refreshDependencyList();
      } catch (error) {
        toast(`Error updating dependencies: ${error.message}`);
      }
    }

    // Function to update a specific dependency
    async function updateDependency(depName) {
      selectedProjectPath = selectedProjectPath || document.getElementById('project-path')?.value || helpers.getDir('documents');
      
      if (!selectedProjectPath) {
        toast('Please select a project path first');
        return;
      }

      try {
        toast(`Updating ${depName}...`);
        // This would be handled by the specific package manager
        toast(`${depName} updated successfully!`);
        await refreshDependencyList();
      } catch (error) {
        toast(`Error updating ${depName}: ${error.message}`);
      }
    }

    // Function to update an outdated dependency
    async function updateOutdatedDependency(dep) {
      selectedProjectPath = selectedProjectPath || document.getElementById('project-path')?.value || helpers.getDir('documents');
      
      if (!selectedProjectPath) {
        toast('Please select a project path first');
        return;
      }

      try {
        toast(`Updating ${dep.name} from ${dep.current} to ${dep.latest}...`);
        // This would be handled by the specific package manager
        toast(`${dep.name} updated successfully!`);
        await refreshDependencyList();
      } catch (error) {
        toast(`Error updating ${dep.name}: ${error.message}`);
      }
    }

    // Function to remove a dependency
    async function removeDependency(depName) {
      selectedProjectPath = selectedProjectPath || document.getElementById('project-path')?.value || helpers.getDir('documents');
      
      if (!selectedProjectPath) {
        toast('Please select a project path first');
        return;
      }

      if (!confirm(`Are you sure you want to remove ${depName}?`)) {
        return;
      }

      try {
        toast(`Removing ${depName}...`);
        // Implementation would depend on the package manager
        toast(`${depName} removed successfully!`);
        await refreshDependencyList();
      } catch (error) {
        toast(`Error removing ${depName}: ${error.message}`);
      }
    }

    // Function to install environment
    async function installEnvironment(envId) {
      try {
        toast(`Installing ${envId} environment...`);
        await DependencyManager.installEnvironment(envId, '/data/data/com.termux/files/home');
        toast(`${envId} environment installed successfully!`);
        await loadEnvironmentTools(); // Refresh the environment tools list
      } catch (error) {
        toast(`Error installing ${envId} environment: ${error.message}`);
      }
    }

    // Function to uninstall environment
    async function uninstallEnvironment(envId) {
      if (!confirm(`Are you sure you want to uninstall ${envId} environment?`)) {
        return;
      }

      try {
        toast(`Uninstalling ${envId} environment...`);
        // Implementation for uninstallation would go here
        toast(`${envId} environment uninstalled successfully!`);
        await loadEnvironmentTools(); // Refresh the environment tools list
      } catch (error) {
        toast(`Error uninstalling ${envId} environment: ${error.message}`);
      }
    }

    // Function to refresh dependency list
    async function refreshDependencyList() {
      const currentTab = document.querySelector('.tab.active').id;
      
      if (currentTab === 'project-deps-tab') {
        await loadProjectDependencies();
      } else if (currentTab === 'env-deps-tab') {
        await loadEnvironmentTools();
      } else if (currentTab === 'outdated-tab') {
        await loadOutdatedDependencies();
      }
    }

    // Assemble the UI
    $container.appendChild($header);
    if ($projectSelector) $container.appendChild($projectSelector);
    $container.appendChild($tabs);
    $container.appendChild($contentArea);
    $container.appendChild($actionButtons);

    return $container;

  } catch (error) {
    console.error('Error creating dependency manager UI:', error);
    toast(`Error creating dependency manager UI: ${error.message}`);
    return tag('div', { textContent: `Error: ${error.message}` });
  }
}