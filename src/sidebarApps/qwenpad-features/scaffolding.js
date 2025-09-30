import scaffoldingWizard from "../../pages/scaffolding/scaffolding";

export default ["code", "scaffolding-wizard", "Project Scaffolding", (container) => {
  // Set up the scaffolding wizard UI inside the container
  scaffoldingWizard().then(ui => {
    container.innerHTML = '';
    container.appendChild(ui);
  });
}];