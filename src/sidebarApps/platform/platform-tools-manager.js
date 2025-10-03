/**
 * Platform Tools Manager Sidebar App for QwenPad IDE
 */

import PlatformToolsManager from '../../components/platform/platform-tools-manager';

export default ["construction", "platform-tools-manager", "Platform Tools", (container) => {
  // Create platform tools manager
  const platformManager = new PlatformToolsManager(container);
  
  // Store reference for later use
  container.platformToolsManager = platformManager;
  
  // Open by default
  platformManager.open();
  
  return platformManager;
}];