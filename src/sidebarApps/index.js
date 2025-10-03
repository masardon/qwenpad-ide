import Sponsors from "pages/sponsors";
import SidebarApp from "./sidebarApp";

const SIDEBAR_APPS_LAST_SECTION = "sidebarAppsLastSection";

/**@type {HTMLElement} */
let $apps;
/**@type {HTMLElement} */
let $sidebar;
/**@type {string} */
let currentSection = localStorage.getItem(SIDEBAR_APPS_LAST_SECTION);
/**@type {SidebarApp[]} */
const apps = [];

/**
 * @param {string} icon icon of the app
 * @param {string} id id of the app
 * @param {HTMLElement} el element to show in sidebar
 * @param {string} title title of the app
 * @param {(container:HTMLElement)=>void} initFunction
 * @param {boolean} prepend weather to show this app at the top of the sidebar or not
 * @param {(container:HTMLElement)=>void} onSelected
 * @returns {void}
 */
function add(
	icon,
	id,
	title,
	initFunction,
	prepend = false,
	onSelected = () => {},
) {
	currentSection ??= id;

	const active = currentSection === id;
	const app = new SidebarApp(icon, id, title, initFunction, onSelected);

	app.active = active;
	app.install(prepend);
	apps.push(app);
}

/**
 * Removes a sidebar app with the given ID.
 * @param {string} id - The ID of the sidebar app to remove.
 * @returns {void}
 */
function remove(id) {
	const app = apps.find((app) => app.id === id);
	if (!app) return;
	app.remove();
	apps.splice(apps.indexOf(app), 1);
	if (app.active) {
		const firstApp = apps[0];
		firstApp.active = true;
	}
}

/**
 * Initialize sidebar apps
 * @param {HTMLElement} $el
 */
function init($el) {
	$sidebar = $el;
	$apps = $sidebar.get(".app-icons-container");
	$apps.addEventListener("click", onclick);
	SidebarApp.init($el, $apps);
}

/**
 * Loads all sidebar apps.
 */
async function loadApps() {
	// Original apps
	add(...(await import("./files")).default);
	add(...(await import("./searchInFiles")).default);
	add(...(await import("./extensions")).default);
	add(...(await import("./notification")).default);
	
	// QwenPad IDE enhanced features
	try {
		add(...(await import("./qwenpad-features/scaffolding")).default);
		add(...(await import("./qwenpad-features/dependency-manager")).default);
		add(...(await import("./qwenpad-features/ssh-manager")).default);
		add(...(await import("./qwenpad-features/k8s-manager")).default);
		add(...(await import("./ai/ai-assistant")).default);
		add(...(await import("./git/git-manager")).default);
		add(...(await import("./remote/remote-file-manager")).default);
	} catch (e) {
		console.warn("Could not load QwenPad IDE features:", e);
                add(...(await import("./ssh/ssh-key-manager")).default);
                add(...(await import("./iac/iac-tools-manager")).default);
                add(...(await import("./platform/platform-tools-manager")).default);
                add(...(await import("./terminal/enhanced-terminal-manager")).default);
                add(...(await import("./iac/iac-tools-manager")).default);
                add(...(await import("./infrastructure/remote-execution-framework")).default);
                add(...(await import("./iac/iac-tools-manager")).default);
                add(...(await import("./kubernetes/k8s-dashboard")).default);
                add(...(await import("./remote/remote-development-framework")).default);
                add(...(await import("./cloud/cloud-provider-manager")).default);
	}
	
	$apps.append(<span className="icon favorite" onclick={Sponsors} />);
}

/**
 * Gets the container of the app with the given ID.
 * @param {string} id
 * @returns
 */
function get(id) {
	const app = apps.find((app) => app.id === id);
	return app.container;
}

/**
 * Handles click on sidebar apps
 * @param {MouseEvent} e
 */
function onclick(e) {
	const target = e.target;
	const { action, id } = target.dataset;

	if (action !== "sidebar-app") return;

	localStorage.setItem(SIDEBAR_APPS_LAST_SECTION, id);
	const activeApp = apps.find((app) => app.active);
	const app = apps.find((app) => app.id === id);
	activeApp.active = false;
	app.active = true;
}

export default {
	init,
	add,
	get,
	remove,
	loadApps,
};
