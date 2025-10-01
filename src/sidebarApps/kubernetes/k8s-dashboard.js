/**
 * Kubernetes Dashboard Sidebar App for QwenPad IDE
 */

import K8sDashboard from '../../components/kubernetes/k8s-dashboard';

export default ["router", "k8s-dashboard", "Kubernetes", (container) => {
  // Create Kubernetes dashboard
  const k8sDashboard = new K8sDashboard(container);
  
  // Store reference for later use
  container.k8sDashboard = k8sDashboard;
  
  // Open by default
  k8sDashboard.open();
  
  return k8sDashboard;
}];