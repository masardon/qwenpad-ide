import Scaffolding from '../../plugins/scaffolding/www/scaffolding';
import toast from '../../components/toast';
import helpers from '../../utils/helpers';

export default async function scaffoldingWizard() {
  try {
    // Create the main scaffolding UI
    const $container = tag('div', {
      className: 'scaffolding-wizard',
      style: {
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    });

    // Header
    const $header = tag('div', {
      className: 'scaffolding-header',
      style: {
        marginBottom: '20px'
      },
      child: tag('h2', {
        textContent: 'Create New Project',
        style: {
          margin: 0,
          fontSize: '1.5em'
        }
      })
    });

    // Project type selection
    const $typeSelection = tag('div', {
      className: 'project-type-selection',
      style: {
        marginBottom: '20px'
      }
    });

    // Get available templates
    const templates = Scaffolding.getAvailableTemplates();
    
    // Create template grid
    const $templateGrid = tag('div', {
      className: 'template-grid',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }
    });

    // Add template cards
    templates.forEach(template => {
      const $card = tag('div', {
        className: 'template-card',
        style: {
          border: '1px solid var(--bdr-color)',
          borderRadius: '8px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: 'var(--bg-color)',
          textAlign: 'center'
        },
        onclick: () => {
          // Highlight selected card and store selection
          document.querySelectorAll('.template-card').forEach(card => {
            card.style.border = '1px solid var(--bdr-color)';
            card.style.boxShadow = 'none';
          });
          $card.style.border = '2px solid var(--primary-color)';
          $card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          
          selectedTemplate = template;
          updateFormVisibility();
        },
        child: [
          tag('div', {
            className: 'template-icon',
            textContent: getTemplateIcon(template.icon),
            style: {
              fontSize: '2em',
              marginBottom: '8px'
            }
          }),
          tag('div', {
            className: 'template-name',
            textContent: template.name,
            style: {
              fontWeight: 'bold',
              marginBottom: '4px'
            }
          }),
          tag('div', {
            className: 'template-desc',
            textContent: template.description,
            style: {
              fontSize: '0.9em',
              color: 'var(--txt-secondary-color)'
            }
          })
        ]
      });
      
      $templateGrid.appendChild($card);
    });

    let selectedTemplate = null;

    // Project details form (initially hidden)
    const $projectForm = tag('div', {
      className: 'project-form',
      style: {
        display: 'none',
        flexDirection: 'column',
        gap: '16px'
      },
      children: [
        // Project name input
        tag('div', {
          className: 'form-group',
          children: [
            tag('label', {
              textContent: 'Project Name',
              style: {
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'bold'
              }
            }),
            tag('input', {
              type: 'text',
              id: 'project-name',
              placeholder: 'Enter project name',
              style: {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--txt-color)'
              }
            })
          ]
        }),
        
        // Project location input
        tag('div', {
          className: 'form-group',
          children: [
            tag('label', {
              textContent: 'Project Location',
              style: {
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'bold'
              }
            }),
            tag('div', {
              style: {
                display: 'flex',
                gap: '8px'
              },
              children: [
                tag('input', {
                  type: 'text',
                  id: 'project-location',
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
                    // For now, we'll just show a toast
                    toast('Browse functionality would open file picker');
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
            })
          ]
        }),
        
        // Additional options for different project types
        tag('div', {
          id: 'additional-options',
          className: 'form-group',
          style: {
            display: 'none'
          },
          children: [
            tag('label', {
              textContent: 'Additional Options',
              style: {
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'bold'
              }
            }),
            tag('div', {
              id: 'options-container',
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }
            })
          ]
        }),
        
        // Create project button
        tag('button', {
          id: 'create-project-btn',
          textContent: 'Create Project',
          disabled: true,
          onclick: createProject,
          style: {
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer'
          }
        })
      ]
    });

    // Function to update form visibility based on selection
    function updateFormVisibility() {
      if (selectedTemplate) {
        $projectForm.style.display = 'flex';
        document.getElementById('create-project-btn').disabled = false;
        
        // Show additional options based on project type
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        switch(selectedTemplate.id) {
          case 'flutter':
            optionsContainer.appendChild(createCheckbox('include-tests', 'Include tests', true));
            optionsContainer.appendChild(createCheckbox('include-integration-tests', 'Include integration tests', true));
            break;
          case 'react':
            optionsContainer.appendChild(createCheckbox('with-typescript', 'Use TypeScript', false));
            optionsContainer.appendChild(createCheckbox('with-router', 'Include React Router', false));
            break;
          case 'nodejs':
            optionsContainer.appendChild(createCheckbox('with-express', 'Include Express', false));
            optionsContainer.appendChild(createCheckbox('with-typescript', 'Use TypeScript', false));
            break;
          case 'python':
            optionsContainer.appendChild(createCheckbox('include-main', 'Include main.py', true));
            break;
          default:
            document.getElementById('additional-options').style.display = 'none';
            return;
        }
        
        document.getElementById('additional-options').style.display = 'block';
      } else {
        $projectForm.style.display = 'none';
        document.getElementById('create-project-btn').disabled = true;
      }
    }

    // Helper function to create checkboxes
    function createCheckbox(id, label, checked) {
      const $container = tag('label', {
        style: {
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }
      });
      
      const $checkbox = tag('input', {
        type: 'checkbox',
        id: id,
        checked: checked,
        style: {
          marginRight: '8px'
        }
      });
      
      $container.appendChild($checkbox);
      $container.appendChild(tag('span', { textContent: label }));
      
      return $container;
    }

    // Function to create the project
    async function createProject() {
      const projectName = document.getElementById('project-name').value.trim();
      const projectLocation = document.getElementById('project-location').value.trim();
      
      if (!projectName) {
        toast('Please enter a project name');
        return;
      }
      
      if (!projectLocation) {
        toast('Please enter a project location');
        return;
      }
      
      if (!selectedTemplate) {
        toast('Please select a project template');
        return;
      }

      try {
        // Show loading state
        const createBtn = document.getElementById('create-project-btn');
        const originalText = createBtn.textContent;
        createBtn.textContent = 'Creating Project...';
        createBtn.disabled = true;
        
        // Collect options based on project type
        const options = {};
        
        switch(selectedTemplate.id) {
          case 'flutter':
            options.includeTests = document.getElementById('include-tests')?.checked;
            options.includeIntegrationTests = document.getElementById('include-integration-tests')?.checked;
            break;
          case 'react':
            options.useTypeScript = document.getElementById('with-typescript')?.checked;
            options.includeRouter = document.getElementById('with-router')?.checked;
            break;
          case 'nodejs':
            options.includeExpress = document.getElementById('with-express')?.checked;
            options.useTypeScript = document.getElementById('with-typescript')?.checked;
            break;
          case 'python':
            options.includeMain = document.getElementById('include-main')?.checked;
            break;
        }

        // Create the project using the scaffolding system
        await Scaffolding.createProject(
          selectedTemplate.id,
          projectName,
          projectLocation,
          options
        );
        
        toast(`Project '${projectName}' created successfully!`);
        
        // Reset form
        document.getElementById('project-name').value = '';
        selectedTemplate = null;
        
        // Reset UI
        document.querySelectorAll('.template-card').forEach(card => {
          card.style.border = '1px solid var(--bdr-color)';
          card.style.boxShadow = 'none';
        });
        
        $projectForm.style.display = 'none';
        createBtn.textContent = originalText;
        createBtn.disabled = false;
        
      } catch (error) {
        console.error('Error creating project:', error);
        toast(`Error creating project: ${error.message}`);
        
        // Reset button state
        const createBtn = document.getElementById('create-project-btn');
        createBtn.textContent = 'Create Project';
        createBtn.disabled = false;
      }
    }

    // Assemble the UI
    $container.appendChild($header);
    $container.appendChild($typeSelection);
    $typeSelection.appendChild($templateGrid);
    $container.appendChild($projectForm);

    return $container;

  } catch (error) {
    console.error('Error creating scaffolding UI:', error);
    toast(`Error creating scaffolding UI: ${error.message}`);
    return tag('div', { textContent: `Error: ${error.message}` });
  }
}

// Helper function to get template icons
function getTemplateIcon(iconType) {
  switch(iconType) {
    case 'flutter': return '_flutter';
    case 'android': return '_android';
    case 'react': return '_react';
    case 'vue': return '_vue';
    case 'angular': return '_angular';
    case 'node': return '_node';
    case 'python': return '_python';
    case 'go': return '_go';
    case 'tailwind': return '_tailwind';
    case 'typescript': return '_typescript';
    default: return '_code';
  }
}