/**
 * Git Context Menu Integration for QwenPad IDE
 * Adds Git options to file context menus
 */

import GitUtils from '../utils/git/git-utils';
import Contextmenu from '../components/contextmenu';

export default class GitContextMenu {
  static init() {
    // Hook into file context menu creation
    if (window.Contextmenu) {
      // Save original file menu function
      const originalFileMenu = window.Contextmenu.fileMenu;
      
      // Override with Git-enhanced version
      window.Contextmenu.fileMenu = function (file, options) {
        // Get original menu
        const menu = originalFileMenu.call(this, file, options);
        
        // Check if file is in a Git repository
        if (file && file.uri) {
          GitUtils.isRepository(file.uri).then(isRepo => {
            if (isRepo) {
              // Add Git options to menu
              menu.push({
                id: 'git-separator',
                type: 'separator'
              });
              
              menu.push({
                id: 'git-add',
                text: 'Git Add',
                icon: 'add',
                action: () => GitUtils.addFiles(file.uri, file.name || '.')
              });
              
              menu.push({
                id: 'git-status',
                text: 'Git Status',
                icon: 'info',
                action: () => GitUtils.getStatus(file.uri)
              });
              
              menu.push({
                id: 'git-commit',
                text: 'Git Commit',
                icon: 'commit',
                action: () => {
                  const message = prompt('Enter commit message:');
                  if (message) {
                    GitUtils.addFiles(file.uri, file.name || '.').then(() => {
                      GitUtils.commitChanges(file.uri, message);
                    });
                  }
                }
              });
            }
          }).catch(() => {
            // Ignore errors - just don't show Git options
          });
        }
        
        return menu;
      };
    }
  }
}