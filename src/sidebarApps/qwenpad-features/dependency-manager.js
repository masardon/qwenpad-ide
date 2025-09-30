import dependencyManagerUI from "../../pages/dependency-manager/dependency-manager";

export default ["build", "dependency-manager", "Dependencies", (container) => {
  // Set up the dependency manager UI inside the container
  dependencyManagerUI().then(ui => {
    container.innerHTML = '';
    container.appendChild(ui);
  });
}];