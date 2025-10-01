/**
 * Remote File Manager Sidebar App for QwenPad IDE
 */

import RemoteFileManager from '../../components/remote/remote-file-manager';

export default ["cloud", "remote-file-manager", "Remote Files", (container) => {
  // Create remote file manager
  const remoteManager = new RemoteFileManager(container);
  
  // Store reference for later use
  container.remoteFileManager = remoteManager;
  
  // Open by default
  remoteManager.open();
  
  return remoteManager;
}];