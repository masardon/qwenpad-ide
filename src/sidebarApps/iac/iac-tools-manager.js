/**
 * Infrastructure as Code (IaC) Tools Sidebar App for QwenPad IDE
 */

import IaCToolsManager from '../../components/iac/iac-tools-manager';

export default ["language", "iac-tools-manager", "IaC Tools", (container) => {
  // Create IaC tools manager
  const iacManager = new IaCToolsManager(container);
  
  // Store reference for later use
  container.iacToolsManager = iacManager;
  
  // Open by default
  iacManager.open();
  
  return iacManager;
}];