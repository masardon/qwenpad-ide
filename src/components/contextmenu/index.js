import "./style.scss";
import actionStack from "lib/actionStack";

// Enhanced context menu styling
const CONTEXT_MENU_STYLES = `
  .enhanced-context-menu {
    position: fixed;
    background: var(--context-menu-bg, #ffffff);
    border: 1px solid var(--bdr-color);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 10000;
    min-width: 200px;
    max-width: 300px;
    animation: contextMenuSlideIn 0.2s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  @media (prefers-color-scheme: dark) {
    .enhanced-context-menu {
      background: var(--context-menu-bg-dark, #2d2d2d);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
  }
  
  .enhanced-context-menu .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s ease;
    font-size: 0.9em;
  }
  
  .enhanced-context-menu .menu-item:hover {
    background-color: var(--hover-bg, #f8f9fa);
  }
  
  .enhanced-context-menu .menu-item.disabled {
    color: var(--txt-disabled, #6c757d);
    cursor: not-allowed;
  }
  
  .enhanced-context-menu .menu-item.disabled:hover {
    background-color: transparent;
  }
  
  .enhanced-context-menu .menu-separator {
    height: 1px;
    background-color: var(--bdr-color);
    margin: 4px 0;
  }
  
  .enhanced-context-menu .menu-header {
    padding: 8px 16px;
    font-weight: bold;
    font-size: 0.8em;
    color: var(--txt-secondary-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  @keyframes contextMenuSlideIn {
    from { 
      opacity: 0; 
      transform: scale(0.95);
    }
    to { 
      opacity: 1; 
      transform: scale(1);
    }
  }
  
  .enhanced-context-menu.hide {
    animation: contextMenuFadeOut 0.2s ease forwards;
  }
  
  @keyframes contextMenuFadeOut {
    from { 
      opacity: 1; 
      transform: scale(1);
    }
    to { 
      opacity: 0; 
      transform: scale(0.95);
    }
  }
`;

// Inject enhanced context menu styles
if (!document.getElementById('enhanced-context-menu-styles')) {
  const styleElement = tag('style', {
    id: 'enhanced-context-menu-styles',
    textContent: CONTEXT_MENU_STYLES
  });
  document.head.appendChild(styleElement);
}

/**
 * @typedef {object} ContextMenuObj
 * @extends HTMLElement
 * @property {function():void} hide hides the menu
 * @property {function():void} show shows the page
 * @property {function():void} destroy destroys the menu
 */

/**
 * @typedef {object} ContextMenuOptions
 * @property {number} left
 * @property {number} top
 * @property {number} bottom
 * @property {number} right
 * @property {string} transformOrigin
 * @property {HTMLElement} toggler
 * @property {function} onshow
 * @property {function} onhide
 * @property {Array<[string, string]>} items Array of [text, action] pairs
 * @property {(this:HTMLElement, event:MouseEvent)=>void} onclick Called when an item is clicked
 * @property {(item:string) => void} onselect Called when an item is selected
 * @property {(this:HTMLElement) => string} innerHTML Called when the menu is shown
 */

/**
 * Create a context menu
 * @param {string|ContextMenuOptions} content Context menu content or options
 * @param {ContextMenuOptions} [options] Options
 * @returns {ContextMenuObj}
 */
export default function Contextmenu(content, options) {
	if (!options && typeof content === "object") {
		options = content;
		content = null;
	} else if (!options) {
		options = {};
	}

	const $el = tag("ul", {
		className: "context-menu scroll enhanced-context-menu",
		innerHTML: content || "",
		onclick(e) {
			if (options.onclick) options.onclick.call(this, e);
			if (options.onselect) {
				const $target = e.target;
				const { action } = $target.dataset;
				if (!action) return;
				hide();
				options.onselect.call(this, action);
			}
		},
		style: {
			top: options.top || "auto",
			left: options.left || "auto",
			right: options.right || "auto",
			bottom: options.bottom || "auto",
			transformOrigin: options.transformOrigin,
		},
	});
	const $mask = tag("span", {
		className: "mask",
		ontouchstart: hide,
		onmousedown: hide,
	});

	if (Array.isArray(options.items)) {
		options.items.forEach(([text, action]) => {
			$el.append(<li data-action={action}>{text}</li>);
		});
	}

	if (!options.innerHTML) addTabindex();

	function show() {
		actionStack.push({
			id: "main-menu",
			action: hide,
		});
		$el.onshow();
		$el.classList.remove("hide");

		if (options.innerHTML) {
			$el.innerHTML = options.innerHTML.call($el);
			addTabindex();
		}

		if (options.toggler) {
			const client = options.toggler.getBoundingClientRect();
			if (!options.top && !options.bottom) {
				$el.style.top = client.top + "px";
			}
			if (!options.left && !options.right) {
				$el.style.right = innerWidth - client.right + "px";
			}
		}

		app.append($el, $mask);

		const $firstChild = $el.firstChild;
		if ($firstChild && $firstChild.focus) $firstChild.focus();
	}

	function hide() {
		actionStack.remove("main-menu");
		$el.onhide();
		$el.classList.add("hide");
		setTimeout(() => {
			$mask.remove();
			$el.remove();
		}, 100);
	}

	function toggle() {
		if ($el.parentElement) return hide();
		show();
	}

	function addTabindex() {
		/**@type {Array<HTMLLIElement>} */
		const children = [...$el.children];
		for (let $el of children) $el.tabIndex = "0";
	}

	function destroy() {
		$el.remove();
		$mask.remove();
		options.toggler?.removeEventListener("click", toggle);
	}

	if (options.toggler) {
		options.toggler.addEventListener("click", toggle);
	}

	$el.hide = hide;
	$el.show = show;
	$el.destroy = destroy;
	$el.onshow = options.onshow || (() => {});
	$el.onhide = options.onhide || (() => {});

	return $el;
}
