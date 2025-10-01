/**
 * Git Utilities for QwenPad IDE
 * Provides helper functions for common Git operations
 */

import Git from '../../plugins/git/www/git';
import toast from '../../components/toast';

class GitUtils {
  /**
   * Initialize a new Git repository
   * @param {string} path - Path to initialize repository
   * @returns {Promise} - Promise that resolves when repository is initialized
   */
  static initRepository(path) {
    return new Promise((resolve, reject) => {
      Git.init(path, (result) => {
        toast('Repository initialized successfully', 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to initialize repository: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Clone a Git repository
   * @param {string} url - Repository URL
   * @param {string} path - Local path to clone to
   * @param {object} options - Clone options
   * @returns {Promise} - Promise that resolves when repository is cloned
   */
  static cloneRepository(url, path, options = {}) {
    return new Promise((resolve, reject) => {
      toast('Cloning repository...', 'info');
      
      Git.clone(url, path, options, (result) => {
        toast('Repository cloned successfully', 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to clone repository: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Add files to staging area
   * @param {string} path - Repository path
   * @param {string|array} files - Files to add
   * @returns {Promise} - Promise that resolves when files are added
   */
  static addFiles(path, files) {
    return new Promise((resolve, reject) => {
      Git.add(path, files, (result) => {
        resolve(result);
      }, (error) => {
        toast(`Failed to add files: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Commit changes
   * @param {string} path - Repository path
   * @param {string} message - Commit message
   * @param {object} options - Commit options
   * @returns {Promise} - Promise that resolves when changes are committed
   */
  static commitChanges(path, message, options = {}) {
    return new Promise((resolve, reject) => {
      if (!message || message.trim() === '') {
        reject(new Error('Commit message is required'));
        return;
      }

      Git.commit(path, message, options, (result) => {
        toast('Changes committed successfully', 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to commit changes: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Push changes to remote
   * @param {string} path - Repository path
   * @param {string} remote - Remote name
   * @param {string} branch - Branch name
   * @param {object} options - Push options
   * @returns {Promise} - Promise that resolves when changes are pushed
   */
  static pushChanges(path, remote = 'origin', branch = 'main', options = {}) {
    return new Promise((resolve, reject) => {
      toast('Pushing changes...', 'info');
      
      Git.push(path, remote, branch, options, (result) => {
        toast('Changes pushed successfully', 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to push changes: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Pull changes from remote
   * @param {string} path - Repository path
   * @param {string} remote - Remote name
   * @param {string} branch - Branch name
   * @param {object} options - Pull options
   * @returns {Promise} - Promise that resolves when changes are pulled
   */
  static pullChanges(path, remote = 'origin', branch = 'main', options = {}) {
    return new Promise((resolve, reject) => {
      toast('Pulling changes...', 'info');
      
      Git.pull(path, remote, branch, options, (result) => {
        toast('Changes pulled successfully', 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to pull changes: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Fetch changes from remote
   * @param {string} path - Repository path
   * @param {string} remote - Remote name
   * @param {object} options - Fetch options
   * @returns {Promise} - Promise that resolves when fetch is complete
   */
  static fetchChanges(path, remote = 'origin', options = {}) {
    return new Promise((resolve, reject) => {
      toast('Fetching changes...', 'info');
      
      Git.fetch(path, remote, options, (result) => {
        toast('Fetch completed successfully', 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to fetch changes: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get repository status
   * @param {string} path - Repository path
   * @returns {Promise} - Promise that resolves with status information
   */
  static getStatus(path) {
    return new Promise((resolve, reject) => {
      Git.status(path, (result) => {
        resolve(result);
      }, (error) => {
        toast(`Failed to get status: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get commit history
   * @param {string} path - Repository path
   * @param {object} options - Log options
   * @returns {Promise} - Promise that resolves with commit history
   */
  static getLog(path, options = {}) {
    return new Promise((resolve, reject) => {
      Git.log(path, options, (result) => {
        resolve(result);
      }, (error) => {
        toast(`Failed to get log: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get current branch
   * @param {string} path - Repository path
   * @returns {Promise} - Promise that resolves with current branch name
   */
  static getCurrentBranch(path) {
    return new Promise((resolve, reject) => {
      Git.getCurrentBranch(path, (result) => {
        resolve(result);
      }, (error) => {
        toast(`Failed to get current branch: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get list of branches
   * @param {string} path - Repository path
   * @returns {Promise} - Promise that resolves with list of branches
   */
  static getBranches(path) {
    return new Promise((resolve, reject) => {
      Git.getBranches(path, (result) => {
        const branches = result.split('\n').filter(b => b.trim()).map(b => b.replace('*', '').trim());
        resolve(branches);
      }, (error) => {
        toast(`Failed to get branches: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Create a new branch
   * @param {string} path - Repository path
   * @param {string} branchName - New branch name
   * @returns {Promise} - Promise that resolves when branch is created
   */
  static createBranch(path, branchName) {
    return new Promise((resolve, reject) => {
      if (!branchName || branchName.trim() === '') {
        reject(new Error('Branch name is required'));
        return;
      }

      Git.createBranch(path, branchName, (result) => {
        toast(`Branch ${branchName} created successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to create branch: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Switch to a branch
   * @param {string} path - Repository path
   * @param {string} branchName - Branch name
   * @returns {Promise} - Promise that resolves when branch is switched
   */
  static switchBranch(path, branchName) {
    return new Promise((resolve, reject) => {
      if (!branchName || branchName.trim() === '') {
        reject(new Error('Branch name is required'));
        return;
      }

      Git.switchBranch(path, branchName, (result) => {
        toast(`Switched to branch ${branchName}`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to switch branch: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Merge branches
   * @param {string} path - Repository path
   * @param {string} branchName - Branch to merge
   * @param {object} options - Merge options
   * @returns {Promise} - Promise that resolves when merge is complete
   */
  static mergeBranch(path, branchName, options = {}) {
    return new Promise((resolve, reject) => {
      if (!branchName || branchName.trim() === '') {
        reject(new Error('Branch name is required'));
        return;
      }

      Git.merge(path, branchName, options, (result) => {
        toast(`Branch ${branchName} merged successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to merge branch: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get list of remotes
   * @param {string} path - Repository path
   * @returns {Promise} - Promise that resolves with list of remotes
   */
  static getRemotes(path) {
    return new Promise((resolve, reject) => {
      Git.getRemotes(path, (result) => {
        const remotes = result.split('\n').filter(r => r.trim());
        resolve(remotes);
      }, (error) => {
        toast(`Failed to get remotes: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Add a remote
   * @param {string} path - Repository path
   * @param {string} name - Remote name
   * @param {string} url - Remote URL
   * @returns {Promise} - Promise that resolves when remote is added
   */
  static addRemote(path, name, url) {
    return new Promise((resolve, reject) => {
      if (!name || !url) {
        reject(new Error('Remote name and URL are required'));
        return;
      }

      Git.addRemote(path, name, url, (result) => {
        toast(`Remote ${name} added successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to add remote: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Remove a remote
   * @param {string} path - Repository path
   * @param {string} name - Remote name
   * @returns {Promise} - Promise that resolves when remote is removed
   */
  static removeRemote(path, name) {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('Remote name is required'));
        return;
      }

      Git.removeRemote(path, name, (result) => {
        toast(`Remote ${name} removed successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to remove remote: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get diff between commits or working directory
   * @param {string} path - Repository path
   * @param {object} options - Diff options
   * @returns {Promise} - Promise that resolves with diff information
   */
  static getDiff(path, options = {}) {
    return new Promise((resolve, reject) => {
      Git.diff(path, options, (result) => {
        resolve(result);
      }, (error) => {
        toast(`Failed to get diff: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Reset current HEAD to specified state
   * @param {string} path - Repository path
   * @param {string} mode - Reset mode (soft, mixed, hard)
   * @param {string} commit - Commit to reset to
   * @returns {Promise} - Promise that resolves when reset is complete
   */
  static reset(path, mode = 'mixed', commit = 'HEAD') {
    return new Promise((resolve, reject) => {
      Git.reset(path, mode, commit, (result) => {
        toast(`Reset completed successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to reset: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Revert commits
   * @param {string} path - Repository path
   * @param {string|array} commits - Commits to revert
   * @param {object} options - Revert options
   * @returns {Promise} - Promise that resolves when revert is complete
   */
  static revert(path, commits, options = {}) {
    return new Promise((resolve, reject) => {
      if (!commits || (Array.isArray(commits) && commits.length === 0)) {
        reject(new Error('Commits to revert are required'));
        return;
      }

      Git.revert(path, commits, options, (result) => {
        toast(`Revert completed successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to revert: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Stash changes
   * @param {string} path - Repository path
   * @param {object} options - Stash options
   * @returns {Promise} - Promise that resolves when stash is complete
   */
  static stash(path, options = {}) {
    return new Promise((resolve, reject) => {
      Git.stash(path, options, (result) => {
        toast(`Changes stashed successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to stash changes: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Apply stashed changes
   * @param {string} path - Repository path
   * @param {string} stashRef - Stash reference
   * @param {object} options - Apply options
   * @returns {Promise} - Promise that resolves when apply is complete
   */
  static stashApply(path, stashRef, options = {}) {
    return new Promise((resolve, reject) => {
      Git.stashApply(path, stashRef, options, (result) => {
        toast(`Stashed changes applied successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to apply stashed changes: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get list of stashes
   * @param {string} path - Repository path
   * @returns {Promise} - Promise that resolves with list of stashes
   */
  static getStashList(path) {
    return new Promise((resolve, reject) => {
      Git.stashList(path, (result) => {
        const stashes = result.split('\n').filter(s => s.trim());
        resolve(stashes);
      }, (error) => {
        toast(`Failed to get stash list: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Remove files from repository
   * @param {string} path - Repository path
   * @param {string|array} files - Files to remove
   * @param {object} options - Remove options
   * @returns {Promise} - Promise that resolves when files are removed
   */
  static removeFiles(path, files, options = {}) {
    return new Promise((resolve, reject) => {
      if (!files || (Array.isArray(files) && files.length === 0)) {
        reject(new Error('Files to remove are required'));
        return;
      }

      Git.remove(path, files, options, (result) => {
        toast(`Files removed successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to remove files: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Tag a commit
   * @param {string} path - Repository path
   * @param {string} tagName - Tag name
   * @param {string} message - Tag message
   * @param {object} options - Tag options
   * @returns {Promise} - Promise that resolves when tag is created
   */
  static createTag(path, tagName, message = '', options = {}) {
    return new Promise((resolve, reject) => {
      if (!tagName || tagName.trim() === '') {
        reject(new Error('Tag name is required'));
        return;
      }

      Git.tag(path, tagName, message, options, (result) => {
        toast(`Tag ${tagName} created successfully`, 'success');
        resolve(result);
      }, (error) => {
        toast(`Failed to create tag: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Get list of tags
   * @param {string} path - Repository path
   * @returns {Promise} - Promise that resolves with list of tags
   */
  static getTags(path) {
    return new Promise((resolve, reject) => {
      Git.getTags(path, (result) => {
        const tags = result.split('\n').filter(t => t.trim());
        resolve(tags);
      }, (error) => {
        toast(`Failed to get tags: ${error}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Check if a path is a Git repository
   * @param {string} path - Path to check
   * @returns {Promise} - Promise that resolves with boolean indicating if path is a repository
   */
  static isRepository(path) {
    return new Promise((resolve, reject) => {
      Git.isRepository(path, (result) => {
        resolve(result === 'true');
      }, (error) => {
        // If there's an error, assume it's not a repository
        resolve(false);
      });
    });
  }
}

export default GitUtils;