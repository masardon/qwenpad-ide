/**
 * SSH Key Manager Sidebar App for QwenPad IDE
 */

import SSHKeyManager from '../../components/ssh/ssh-key-manager';

export default ["vpn_key", "ssh-key-manager", "SSH Keys", (container) => {
  // Create SSH key manager
  const keyManager = new SSHKeyManager(container);
  
  // Store reference for later use
  container.sshKeyManager = keyManager;
  
  // Open by default
  keyManager.open();
  
  return keyManager;
}];