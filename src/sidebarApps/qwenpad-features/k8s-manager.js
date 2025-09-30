import k8sManager from "../../pages/k8s-manager/k8s-manager";

export default ["router", "k8s-manager", "K8s Manager", (container) => {
  // Set up the K8s manager UI inside the container
  k8sManager().then(ui => {
    container.innerHTML = '';
    container.appendChild(ui);
  });
}];