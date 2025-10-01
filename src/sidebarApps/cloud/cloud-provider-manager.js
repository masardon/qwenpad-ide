/**
 * Cloud Provider Manager Sidebar App for QwenPad IDE
 */

import CloudProviderUI from '../../components/cloud/cloud-provider-ui';

export default ["cloud", "cloud-provider-manager", "Cloud Providers", (container) => {
  // Create cloud provider manager
  const cloudManager = new CloudProviderUI(container);
  
  // Store reference for later use
  container.cloudProviderManager = cloudManager;
  
  // Open by default
  cloudManager.open();
  
  return cloudManager;
}];