/**
 * Enhanced Terminal Manager Sidebar App for QwenPad IDE
 */

import EnhancedTerminalUI from '../../components/terminal/enhanced-terminal-ui';

export default ["terminal", "enhanced-terminal-manager", "Enhanced Terminal", (container) => {
  // Create enhanced terminal manager
  const terminalManager = new EnhancedTerminalUI(container);
  
  // Store reference for later use
  container.enhancedTerminalManager = terminalManager;
  
  // Open by default
  terminalManager.open();
  
  return terminalManager;
}];