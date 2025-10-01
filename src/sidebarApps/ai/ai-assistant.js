import AIAssistant from "../../components/ai/ai-assistant";

export default ["robot", "ai-assistant", "AI Assistant", (container) => {
  // Create an instance of the AI assistant
  const aiAssistant = new AIAssistant(container);
  
  // Initialize and open the AI assistant
  aiAssistant.open();
  
  // Keep a reference to the assistant for potential interactions
  container.aiAssistant = aiAssistant;
}];