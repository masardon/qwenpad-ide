/**
 * Remote Execution Framework Sidebar App for QwenPad IDE
 */

import RemoteExecutionFramework from '../../components/remote-execution/remote-execution-framework';

export default ["cloud_upload", "remote-execution-framework", "Remote Execution", (container) => {
  // Create remote execution framework
  const remoteFramework = new RemoteExecutionFramework(container);
  
  // Store reference for later use
  container.remoteFramework = remoteFramework;
  
  // Open by default
  remoteFramework.open();
  
  return remoteFramework;
}];