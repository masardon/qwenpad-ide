/**
 * Remote Development Framework Sidebar App for QwenPad IDE
 */

import RemoteDevelopmentFramework from '../../components/remote-development/remote-development-framework';

export default ["desktop_windows", "remote-development-framework", "Remote Dev", (container) => {
  // Create remote development framework
  const remoteDevFramework = new RemoteDevelopmentFramework(container);
  
  // Store reference for later use
  container.remoteDevFramework = remoteDevFramework;
  
  // Open by default
  remoteDevFramework.open();
  
  return remoteDevFramework;
}];