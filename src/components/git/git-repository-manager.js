/**
 * Git Repository Manager for QwenPad IDE
 * Provides UI for managing Git repositories
 */

import Git from '../../plugins/git/www/git';
import toast from '../toast';

export default class GitRepositoryManager {
  constructor(container) {
    this.container = container;
    this.currentRepoPath = null;
    this.currentBranch = null;
    this.branches = [];
    this.remotes = [];
    this.status = null;
    
    this._initialize();
  }

  _initialize() {
    // Create the UI elements
    this._createUI();
  }

  _createUI() {
    // Main container
    this.$gitContainer = tag('div', {
      className: 'git-manager-container',
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
      className: 'git-manager-header',
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
              className: 'icon git-branch', 
              style: { fontSize: '1.2em' } 
            }),
            tag('span', {
              textContent: 'Git Repository',
              style: { fontWeight: 'bold', fontSize: '1.1em' }
            })
          ]
        }),
        tag('button', {
          className: 'git-close-btn',
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

    // Repository info
    this.$repoInfo = tag('div', {
      className: 'git-repo-info',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        fontSize: '0.9em',
        color: 'var(--txt-secondary-color)',
        backgroundColor: 'var(--status-bg, #e9ecef)'
      },
      textContent: 'No repository selected'
    });

    // Branch selector
    this.$branchSelector = tag('div', {
      className: 'git-branch-selector',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      children: [
        tag('span', {
          textContent: 'Branch:',
          style: { fontWeight: 'bold' }
        }),
        tag('select', {
          id: 'git-branch-select',
          style: {
            flex: 1,
            padding: '4px 8px',
            border: '1px solid var(--bdr-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--txt-color)'
          },
          onchange: (e) => this._switchBranch(e.target.value)
        }),
        tag('button', {
          textContent: '+',
          onclick: () => this._createBranch(),
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

    // Action buttons
    this.$actions = tag('div', {
      className: 'git-actions',
      style: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--bdr-color)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      },
      children: [
        tag('button', {
          textContent: 'Pull',
          onclick: () => this._pull(),
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
          textContent: 'Push',
          onclick: () => this._push(),
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
          textContent: 'Commit',
          onclick: () => this._commit(),
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
          textContent: 'Fetch',
          onclick: () => this._fetch(),
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
          textContent: 'Status',
          onclick: () => this._getStatus(),
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

    // Status area
    this.$statusArea = tag('div', {
      className: 'git-status-area',
      style: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        whiteSpace: 'pre-wrap'
      },
      textContent: 'Select a Git repository to view status...'
    });

    // Commit area
    this.$commitArea = tag('div', {
      className: 'git-commit-area',
      style: {
        padding: '12px 16px',
        borderTop: '1px solid var(--bdr-color)',
        backgroundColor: 'var(--input-container-bg, #f8f9fa)',
        display: 'none'
      },
      children: [
        tag('div', {
          style: { marginBottom: '8px' },
          children: [
            tag('label', {
              textContent: 'Commit Message:',
              style: {
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'bold'
              }
            }),
            tag('textarea', {
              id: 'git-commit-message',
              placeholder: 'Enter commit message...',
              style: {
                width: '100%',
                height: '60px',
                padding: '8px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--txt-color)',
                fontFamily: 'inherit',
                fontSize: '0.9em'
              }
            })
          ]
        }),
        tag('div', {
          style: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          },
          children: [
            tag('button', {
              textContent: 'Cancel',
              onclick: () => this._hideCommitArea(),
              style: {
                padding: '6px 12px',
                border: '1px solid var(--bdr-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-txt-color)',
                cursor: 'pointer'
              }
            }),
            tag('button', {
              textContent: 'Commit',
              onclick: () => this._performCommit(),
              style: {
                padding: '6px 12px',
                border: '1px solid var(--primary-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer'
              }
            })
          ]
        })
      ]
    });

    // Assemble the UI
    this.$gitContainer.appendChild(this.$header);
    this.$gitContainer.appendChild(this.$repoInfo);
    this.$gitContainer.appendChild(this.$branchSelector);
    this.$gitContainer.appendChild(this.$actions);
    this.$gitContainer.appendChild(this.$statusArea);
    this.$gitContainer.appendChild(this.$commitArea);

    // Add to container
    this.container.appendChild(this.$gitContainer);
  }

  async open(repoPath) {
    this.currentRepoPath = repoPath;
    this.$gitContainer.style.display = 'flex';
    
    // Update repository info
    this.$repoInfo.textContent = `Repository: ${repoPath}`;
    
    // Initialize repository data
    await this._refreshRepositoryData();
  }

  close() {
    this.$gitContainer.style.display = 'none';
    this.currentRepoPath = null;
  }

  async _refreshRepositoryData() {
    if (!this.currentRepoPath) return;
    
    try {
      // Get current branch
      Git.getCurrentBranch(this.currentRepoPath, (branch) => {
        this.currentBranch = branch;
        this._updateBranchSelector();
      }, (error) => {
        console.error('Error getting current branch:', error);
        toast('Failed to get current branch', 'error');
      });
      
      // Get all branches
      Git.getBranches(this.currentRepoPath, (branches) => {
        this.branches = branches.split('\n').filter(b => b.trim()).map(b => b.replace('*', '').trim());
        this._updateBranchSelector();
      }, (error) => {
        console.error('Error getting branches:', error);
        toast('Failed to get branches', 'error');
      });
      
      // Get remotes
      Git.getRemotes(this.currentRepoPath, (remotes) => {
        this.remotes = remotes.split('\n').filter(r => r.trim());
      }, (error) => {
        console.error('Error getting remotes:', error);
      });
      
      // Get initial status
      this._getStatus();
    } catch (error) {
      console.error('Error refreshing repository data:', error);
      toast('Failed to refresh repository data', 'error');
    }
  }

  _updateBranchSelector() {
    const select = document.getElementById('git-branch-select');
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add branches
    this.branches.forEach(branch => {
      const option = tag('option', {
        value: branch,
        textContent: branch
      });
      
      if (branch === this.currentBranch) {
        option.selected = true;
      }
      
      select.appendChild(option);
    });
  }

  _switchBranch(branchName) {
    if (!this.currentRepoPath || !branchName) return;
    
    Git.switchBranch(this.currentRepoPath, branchName, () => {
      this.currentBranch = branchName;
      toast(`Switched to branch ${branchName}`, 'success');
      this._getStatus();
    }, (error) => {
      console.error('Error switching branch:', error);
      toast(`Failed to switch to branch ${branchName}`, 'error');
    });
  }

  _createBranch() {
    if (!this.currentRepoPath) return;
    
    const branchName = prompt('Enter new branch name:');
    if (!branchName) return;
    
    Git.createBranch(this.currentRepoPath, branchName, () => {
      toast(`Branch ${branchName} created successfully`, 'success');
      this._refreshRepositoryData();
    }, (error) => {
      console.error('Error creating branch:', error);
      toast(`Failed to create branch ${branchName}`, 'error');
    });
  }

  _pull() {
    if (!this.currentRepoPath) return;
    
    const remote = this.remotes.length > 0 ? this.remotes[0].split(/\s+/)[0] : 'origin';
    const branch = this.currentBranch || 'main';
    
    toast('Pulling changes...', 'info');
    
    Git.pull(this.currentRepoPath, remote, branch, {}, () => {
      toast('Pull completed successfully', 'success');
      this._getStatus();
    }, (error) => {
      console.error('Error pulling:', error);
      toast(`Failed to pull: ${error}`, 'error');
    });
  }

  _push() {
    if (!this.currentRepoPath) return;
    
    const remote = this.remotes.length > 0 ? this.remotes[0].split(/\s+/)[0] : 'origin';
    const branch = this.currentBranch || 'main';
    
    toast('Pushing changes...', 'info');
    
    Git.push(this.currentRepoPath, remote, branch, {}, () => {
      toast('Push completed successfully', 'success');
    }, (error) => {
      console.error('Error pushing:', error);
      toast(`Failed to push: ${error}`, 'error');
    });
  }

  _commit() {
    this.$commitArea.style.display = 'block';
    document.getElementById('git-commit-message').focus();
  }

  _hideCommitArea() {
    this.$commitArea.style.display = 'none';
    document.getElementById('git-commit-message').value = '';
  }

  _performCommit() {
    if (!this.currentRepoPath) return;
    
    const message = document.getElementById('git-commit-message').value.trim();
    if (!message) {
      toast('Please enter a commit message', 'warning');
      return;
    }
    
    // First add all changes
    Git.add(this.currentRepoPath, '.', () => {
      // Then commit
      Git.commit(this.currentRepoPath, message, {}, () => {
        toast('Changes committed successfully', 'success');
        this._hideCommitArea();
        this._getStatus();
      }, (error) => {
        console.error('Error committing:', error);
        toast(`Failed to commit: ${error}`, 'error');
      });
    }, (error) => {
      console.error('Error adding files:', error);
      toast(`Failed to add files: ${error}`, 'error');
    });
  }

  _fetch() {
    if (!this.currentRepoPath) return;
    
    const remote = this.remotes.length > 0 ? this.remotes[0].split(/\s+/)[0] : 'origin';
    
    toast('Fetching changes...', 'info');
    
    Git.fetch(this.currentRepoPath, remote, {}, () => {
      toast('Fetch completed successfully', 'success');
      this._refreshRepositoryData();
    }, (error) => {
      console.error('Error fetching:', error);
      toast(`Failed to fetch: ${error}`, 'error');
    });
  }

  _getStatus() {
    if (!this.currentRepoPath) return;
    
    this.$statusArea.textContent = 'Loading status...';
    
    Git.status(this.currentRepoPath, (result) => {
      if (result && result.status) {
        this.$statusArea.textContent = result.status || 'Working directory clean';
      } else {
        this.$statusArea.textContent = 'Working directory clean';
      }
    }, (error) => {
      console.error('Error getting status:', error);
      this.$statusArea.textContent = `Error: ${error}`;
      toast('Failed to get repository status', 'error');
    });
  }

  // Static method to check if a directory is a Git repository
  static isGitRepository(path, callback) {
    Git.isRepository(path, (result) => {
      callback(result === 'true');
    }, () => {
      callback(false);
    });
  }
}