/**
 * Git plugin for QwenPad IDE
 * Provides Git operations through Cordova bridge
 */

const exec = require('cordova/exec');

const Git = {
  /**
   * Initialize a Git repository
   * @param {string} path - Path to initialize repository
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  init: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'init', [path]);
  },

  /**
   * Clone a Git repository
   * @param {string} url - Repository URL
   * @param {string} path - Local path to clone to
   * @param {object} options - Clone options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  clone: function(url, path, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'clone', [url, path, options || {}]);
  },

  /**
   * Add files to staging area
   * @param {string} path - Repository path
   * @param {string|array} files - Files to add
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  add: function(path, files, successCallback, errorCallback) {
    const filesArray = Array.isArray(files) ? files : [files];
    exec(successCallback, errorCallback, 'Git', 'add', [path, filesArray]);
  },

  /**
   * Commit changes
   * @param {string} path - Repository path
   * @param {string} message - Commit message
   * @param {object} options - Commit options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  commit: function(path, message, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'commit', [path, message, options || {}]);
  },

  /**
   * Push changes to remote
   * @param {string} path - Repository path
   * @param {string} remote - Remote name
   * @param {string} branch - Branch name
   * @param {object} options - Push options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  push: function(path, remote, branch, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'push', [path, remote, branch, options || {}]);
  },

  /**
   * Pull changes from remote
   * @param {string} path - Repository path
   * @param {string} remote - Remote name
   * @param {string} branch - Branch name
   * @param {object} options - Pull options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  pull: function(path, remote, branch, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'pull', [path, remote, branch, options || {}]);
  },

  /**
   * Fetch changes from remote
   * @param {string} path - Repository path
   * @param {string} remote - Remote name
   * @param {object} options - Fetch options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  fetch: function(path, remote, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'fetch', [path, remote, options || {}]);
  },

  /**
   * Create a new branch
   * @param {string} path - Repository path
   * @param {string} branchName - New branch name
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  createBranch: function(path, branchName, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'createBranch', [path, branchName]);
  },

  /**
   * Switch to a branch
   * @param {string} path - Repository path
   * @param {string} branchName - Branch name
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  switchBranch: function(path, branchName, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'switchBranch', [path, branchName]);
  },

  /**
   * Merge branches
   * @param {string} path - Repository path
   * @param {string} branchName - Branch to merge
   * @param {object} options - Merge options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  merge: function(path, branchName, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'merge', [path, branchName, options || {}]);
  },

  /**
   * Get repository status
   * @param {string} path - Repository path
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  status: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'status', [path]);
  },

  /**
   * Get commit history
   * @param {string} path - Repository path
   * @param {object} options - Log options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  log: function(path, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'log', [path, options || {}]);
  },

  /**
   * Get current branch
   * @param {string} path - Repository path
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  getCurrentBranch: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'getCurrentBranch', [path]);
  },

  /**
   * Get list of branches
   * @param {string} path - Repository path
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  getBranches: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'getBranches', [path]);
  },

  /**
   * Get list of remotes
   * @param {string} path - Repository path
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  getRemotes: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'getRemotes', [path]);
  },

  /**
   * Add a remote
   * @param {string} path - Repository path
   * @param {string} name - Remote name
   * @param {string} url - Remote URL
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  addRemote: function(path, name, url, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'addRemote', [path, name, url]);
  },

  /**
   * Remove a remote
   * @param {string} path - Repository path
   * @param {string} name - Remote name
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  removeRemote: function(path, name, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'removeRemote', [path, name]);
  },

  /**
   * Get diff between commits or working directory
   * @param {string} path - Repository path
   * @param {object} options - Diff options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  diff: function(path, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'diff', [path, options || {}]);
  },

  /**
   * Reset current HEAD to specified state
   * @param {string} path - Repository path
   * @param {string} mode - Reset mode (soft, mixed, hard)
   * @param {string} commit - Commit to reset to
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  reset: function(path, mode, commit, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'reset', [path, mode, commit]);
  },

  /**
   * Revert commits
   * @param {string} path - Repository path
   * @param {string|array} commits - Commits to revert
   * @param {object} options - Revert options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  revert: function(path, commits, options, successCallback, errorCallback) {
    const commitsArray = Array.isArray(commits) ? commits : [commits];
    exec(successCallback, errorCallback, 'Git', 'revert', [path, commitsArray, options || {}]);
  },

  /**
   * Stash changes
   * @param {string} path - Repository path
   * @param {object} options - Stash options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  stash: function(path, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'stash', [path, options || {}]);
  },

  /**
   * Apply stashed changes
   * @param {string} path - Repository path
   * @param {string} stashRef - Stash reference
   * @param {object} options - Apply options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  stashApply: function(path, stashRef, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'stashApply', [path, stashRef, options || {}]);
  },

  /**
   * Get list of stashes
   * @param {string} path - Repository path
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  stashList: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'stashList', [path]);
  },

  /**
   * Remove files from repository
   * @param {string} path - Repository path
   * @param {string|array} files - Files to remove
   * @param {object} options - Remove options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  remove: function(path, files, options, successCallback, errorCallback) {
    const filesArray = Array.isArray(files) ? files : [files];
    exec(successCallback, errorCallback, 'Git', 'remove', [path, filesArray, options || {}]);
  },

  /**
   * Tag a commit
   * @param {string} path - Repository path
   * @param {string} tagName - Tag name
   * @param {string} message - Tag message
   * @param {object} options - Tag options
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  tag: function(path, tagName, message, options, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'tag', [path, tagName, message, options || {}]);
  },

  /**
   * Get list of tags
   * @param {string} path - Repository path
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  getTags: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'getTags', [path]);
  },

  /**
   * Check if a path is a Git repository
   * @param {string} path - Path to check
   * @param {function} successCallback - Success callback
   * @param {function} errorCallback - Error callback
   */
  isRepository: function(path, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Git', 'isRepository', [path]);
  }
};

module.exports = Git;