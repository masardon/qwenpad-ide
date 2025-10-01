/**
 * Git Sidebar App for QwenPad IDE
 */

import GitRepositoryManager from '../../components/git/git-repository-manager';

export default ["git-branch", "git-manager", "Git Manager", (container) => {
  // Create Git repository manager
  const gitManager = new GitRepositoryManager(container);
  
  // Store reference for later use
  container.gitManager = gitManager;
  
  // Try to detect if current open project is a Git repository
  if (window.editorManager?.activeFile?.uri) {
    // Get the project root directory
    const projectRoot = window.editorManager.activeFile.uri.split('/').slice(0, -1).join('/');
    GitRepositoryManager.isGitRepository(projectRoot, (isRepo) => {
      if (isRepo) {
        gitManager.open(projectRoot);
      }
    });
  }
  
  return gitManager;
}];