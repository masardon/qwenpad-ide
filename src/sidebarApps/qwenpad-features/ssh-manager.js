import sshManager from "../../pages/ssh-manager/ssh-manager";

export default ["lock", "ssh-manager", "SSH Manager", (container) => {
  // Set up the SSH manager UI inside the container
  sshManager().then(ui => {
    container.innerHTML = '';
    container.appendChild(ui);
  });
}];