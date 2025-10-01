import "./style.scss";

/**@type {Array<HTMLElement>} */
const toastQueue = [];

// Enhanced toast types with colors
const TOAST_TYPES = {
  info: { bgColor: '#17a2b8', color: 'white', icon: 'info' },
  success: { bgColor: '#28a745', color: 'white', icon: 'check_circle' },
  warning: { bgColor: '#ffc107', color: 'black', icon: 'warning' },
  error: { bgColor: '#dc3545', color: 'white', icon: 'error' },
  default: { bgColor: '#343a40', color: 'white', icon: 'notifications' }
};

/**
 * Show a toast message
 * @param {string|HTMLElement} message
 * @param {number|false|"info"|"success"|"warning"|"error"} durationOrType
 * @param {string} bgColor
 * @param {string} color
 */
export default function toast(message, durationOrType = 0, bgColor, color) {
  // Handle different parameter combinations
  let duration = 0;
  let type = 'default';
  
  if (typeof durationOrType === 'string') {
    type = durationOrType;
    duration = 3000; // Default duration for typed toasts
  } else if (typeof durationOrType === 'number') {
    duration = durationOrType;
  } else if (durationOrType === false) {
    duration = false;
  }

  // Get type-specific styling
  const typeStyle = TOAST_TYPES[type] || TOAST_TYPES.default;
  const finalBgColor = bgColor || typeStyle.bgColor;
  const finalColor = color || typeStyle.color;
  const icon = typeStyle.icon;

  const $oldToast = tag.get("#toast");
  const $toast = (
    <div
      id="toast"
      attr-clickable={typeof duration !== "number"}
      style={{ backgroundColor: finalBgColor, color: finalColor }}
      className={`toast toast-${type}`}
    >
      <span className={`icon ${icon}`} style={{ marginRight: '8px' }}></span>
      <span className="message">{message}</span>
      {duration === false
        ? <button
            className="icon clearclose"
            onclick={() => $toast.hide()}
          ></button>
        : ""}
    </div>
  );

  // Add enhanced styling and animations
  $toast.style.cssText += `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    min-width: 250px;
    max-width: 400px;
    display: flex;
    align-items: center;
    animation: slideIn 0.3s ease, fadeOut 0.5s ease ${duration === false ? '' : (duration > 0 ? `${duration}ms` : '3000ms')} forwards;
  `;

  // Add keyframe animations if not already present
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; transform: translateY(-20px); }
      }
      
      #toast.hide {
        animation: fadeOut 0.3s ease forwards;
      }
      
      #toast:hover {
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);
  }

  Object.defineProperties($toast, {
    hide: {
      value() {
        this.classList.add("hide");
        setTimeout(() => {
          this.remove();
          const $toast = toastQueue.splice(0, 1)[0];
          if ($toast) $toast.show();
        }, 500);
      },
    },
    show: {
      value() {
        app.append(this);

        if (typeof duration === "number" && duration !== false) {
          setTimeout(() => {
            this.hide();
          }, duration || 3000);
        }
      },
    },
  });

  if (!$oldToast) {
    $toast.show();
  } else {
    toastQueue.push($toast);
  }
}

toast.hide = () => {
  const $toast = tag.get("#toast");
  if ($toast) $toast.hide();
};
