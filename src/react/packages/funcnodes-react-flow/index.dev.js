function updateLogVisibility(containerElement, levelFilters, isWindow = false) {
  const prefix = isWindow ? "" : ".popup-content ";
  const logs = containerElement.querySelectorAll(
    `${prefix}.debug, ${prefix}.info, ${prefix}.warn, ${prefix}.error`
  );

  logs.forEach((log) => {
    const level = [...log.classList].find((cls) =>
      ["debug", "info", "warn", "error"].includes(cls)
    );
    if (level) {
      log.style.display = levelFilters[level] ? "block" : "none";
    }
  });
}

function make_logger_window(levelFilters) {
  const windowFeatures =
    "width=600,height=500,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no";
  loggerWindow = window.open("", "FuncNodesLogger", windowFeatures);
  if (!loggerWindow) {
    console.warn(
      "Could not open logger window (popup blocked?). Falling back to in-DOM popup."
    );
    return make_logger_popup();
  }
  loggerWindow.document.title = "🔍 FuncNodes Logger";
  loggerWindow.document.head.innerHTML = `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 10px;
        background: #f8f9fa;
        font-size: 12px;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px;
        margin: -10px -10px 10px -10px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .level-filter {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.2s;
      }
      .level-filter:hover {
        background: rgba(255,255,255,0.3);
      }
      .level-filter.active {
        background: rgba(255,255,255,0.9);
        color: #333;
      }
      .level-filter-debug.active { background: #6c757d; color: white; }
      .level-filter-info.active { background: #0066cc; color: white; }
      .level-filter-warn.active { background: #ff8c00; color: white; }
      .level-filter-error.active { background: #dc3545; color: white; }
      .clear-btn {
        background: rgba(255,255,255,0.8);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 3px;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 10px;
        color: #333;
      }
      .clear-btn:hover {
        background: white;
      }
      .log-entry {
        margin: 2px 0;
        padding: 2px 4px;
        border-radius: 3px;
      }
      .debug { color: #6c757d; background: rgba(108, 117, 125, 0.1); }
      .info { color: #0066cc; background: rgba(0, 102, 204, 0.1); }
      .warn { color: #ff8c00; background: rgba(255, 140, 0, 0.1); }
      .error { color: #dc3545; background: rgba(220, 53, 69, 0.1); font-weight: 600; }
    </style>
  `;

  loggerWindow.document.body.innerHTML = `
    <div class="header">
      <span>🔍 FuncNodes Logger</span>
      <div class="controls">
        <button class="level-filter level-filter-debug active" onclick="toggleLevel('debug')">DEBUG</button>
        <button class="level-filter level-filter-info active" onclick="toggleLevel('info')">INFO</button>
        <button class="level-filter level-filter-warn active" onclick="toggleLevel('warn')">WARN</button>
        <button class="level-filter level-filter-error active" onclick="toggleLevel('error')">ERROR</button>
        <button class="clear-btn" onclick="clearLogs()">Clear</button>
      </div>
    </div>
    <div id="logger_content"></div>
  `;

  // Add clear function to the window
  loggerWindow.clearLogs = function () {
    const content = loggerWindow.document.getElementById("logger_content");
    if (content) content.innerHTML = "";
  };

  // Add level toggle function to the window
  loggerWindow.toggleLevel = function (level) {
    levelFilters[level] = !levelFilters[level];
    const btn = loggerWindow.document.querySelector(".level-filter-" + level);
    if (levelFilters[level]) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
    updateLogVisibility(loggerWindow.document.body, levelFilters, true);
  };

  // Handle window close
  loggerWindow.addEventListener("beforeunload", () => {
    console.log("Logger window closed");
  });

  loggerElement = loggerWindow.document.getElementById("logger_content");

  return loggerElement;
}

function make_logger_popup(levelFilters) {
  // Create in-DOM popup (original implementation)
  const logger_popup = document.createElement("div");
  logger_popup.id = "logger_popup";

  // Create popup header with title and controls
  const popup_header = document.createElement("div");
  popup_header.className = "popup-header";
  popup_header.innerHTML = `
    <span class="popup-title">🔍 FuncNodes Logger</span>
    <div class="popup-controls">
      <button id="clear-logger" title="Clear logs">🗑</button>
      <button id="toggle-logger" title="Minimize/Maximize">−</button>
      <button id="close-logger" title="Close">×</button>
    </div>
  `;

  // Create level filter controls
  const filter_controls = document.createElement("div");
  filter_controls.className = "filter-controls";
  filter_controls.innerHTML = `
    <button class="level-filter level-filter-debug active" data-level="debug">DEBUG</button>
    <button class="level-filter level-filter-info active" data-level="info">INFO</button>
    <button class="level-filter level-filter-warn active" data-level="warn">WARN</button>
    <button class="level-filter level-filter-error active" data-level="error">ERROR</button>
  `;

  // Create popup content area
  const popup_content = document.createElement("div");
  popup_content.className = "popup-content";
  popup_content.id = "logger_content";

  // Assemble popup
  logger_popup.appendChild(popup_header);
  logger_popup.appendChild(filter_controls);
  logger_popup.appendChild(popup_content);
  document.body.appendChild(logger_popup);

  // Style the popup to look like a true popup window
  const popupStyles = `
    #logger_popup {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 450px;
      height: 350px;
      background: #ffffff;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      resize: both;
      overflow: hidden;
      min-width: 300px;
      min-height: 200px;
    }

    .popup-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 12px;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 7px 7px 0 0;
      user-select: none;
    }

    .popup-title {
      font-weight: 600;
      font-size: 13px;
    }

    .popup-controls button {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 3px;
      cursor: pointer;
      margin-left: 4px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popup-controls button:hover {
      background: rgba(255,255,255,0.3);
    }

    .filter-controls {
      background: #e9ecef;
      padding: 6px 8px;
      display: flex;
      gap: 4px;
      border-bottom: 1px solid #ddd;
    }

    .level-filter {
      background: #6c757d;
      color: white;
      border: none;
      padding: 2px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 10px;
      transition: all 0.2s;
    }

    .level-filter:hover {
      opacity: 0.8;
    }

    .level-filter-debug.active { background: #6c757d; }
    .level-filter-info.active { background: #0066cc; }
    .level-filter-warn.active { background: #ff8c00; }
    .level-filter-error.active { background: #dc3545; }

    .level-filter:not(.active) {
      background: #dee2e6;
      color: #6c757d;
    }

    .popup-content {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
      background: #f8f9fa;
      border-radius: 0 0 7px 7px;
    }

    .popup-content .debug { color: #6c757d; margin: 2px 0; }
    .popup-content .info { color: #0066cc; margin: 2px 0; }
    .popup-content .warn { color: #ff8c00; margin: 2px 0; }
    .popup-content .error { color: #dc3545; margin: 2px 0; font-weight: 600; }

    #logger_popup.minimized {
      height: 70px;
    }

    #logger_popup.minimized .popup-content,
    #logger_popup.minimized .filter-controls {
      display: none;
    }

    #logger_popup.hidden {
      display: none;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement("style");
  styleSheet.textContent = popupStyles;
  document.head.appendChild(styleSheet);

  // Make popup draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  popup_header.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return; // Don't drag when clicking buttons

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === popup_header || e.target.className === "popup-title") {
      isDragging = true;
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      logger_popup.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Popup controls functionality
  let isMinimized = false;

  document.getElementById("toggle-logger").addEventListener("click", () => {
    isMinimized = !isMinimized;
    const toggleBtn = document.getElementById("toggle-logger");

    if (isMinimized) {
      logger_popup.classList.add("minimized");
      toggleBtn.textContent = "+";
      toggleBtn.title = "Maximize";
    } else {
      logger_popup.classList.remove("minimized");
      toggleBtn.textContent = "−";
      toggleBtn.title = "Minimize";
    }
  });

  document.getElementById("close-logger").addEventListener("click", () => {
    logger_popup.classList.add("hidden");
  });

  document.getElementById("clear-logger").addEventListener("click", () => {
    popup_content.innerHTML = "";
  });

  // Level filter functionality
  filter_controls.addEventListener("click", (e) => {
    if (e.target.classList.contains("level-filter")) {
      const level = e.target.dataset.level;
      levelFilters[level] = !levelFilters[level];

      if (levelFilters[level]) {
        e.target.classList.add("active");
      } else {
        e.target.classList.remove("active");
      }

      updateLogVisibility(logger_popup, levelFilters);
    }
  });

  // Add keyboard shortcut to toggle logger (Ctrl+L or Cmd+L)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "l") {
      e.preventDefault();
      logger_popup.classList.toggle("hidden");
    }
  });

  loggerElement = popup_content;
  return loggerElement;
}

function make_logger(type, levelFilters) {
  if (type === "window") {
    return make_logger_window(levelFilters);
  } else if (type === "popup") {
    return make_logger_popup(levelFilters);
  }
}

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}
function parseBool(param, defaultValue) {
  if (param === null) {
    return defaultValue;
  }
  if (param === "") {
    return true;
  }
  const val = String(param).toLowerCase();
  return val === "true" || val === "1" || val === "yes";
}

window.onload = async function () {
  // Configuration: set to 'window' for separate browser window, 'popup' for in-DOM popup
  const LOGGER_TYPE = "window"; // Change to 'popup' for in-DOM version

  let levelFilters = { debug: true, info: true, warn: true, error: true };
  // const loggerElement = make_logger(LOGGER_TYPE, levelFilters);
  window.FN_WORKER_URL = getParam("worker_url") || window.FN_WORKER_URL;
  window.FN_WORKER_PORT = getParam("worker_port") || window.FN_WORKER_PORT;
  window._FUNCNODES_DEV = parseBool(getParam("dev"), true);
  let debug = getParam("debug");
  if (debug === null) {
    debug = true;
  } else if (debug === "") {
    debug = true;
  } else {
    debug = debug === "true" || debug === "1" || debug === "yes";
  }

  if (window.FN_WORKER_URL) {
    FuncNodes("root", {
      worker_url: window.FN_WORKER_URL,
      debug: debug,
      useWorkerManager: false,
      on_ready: function (obj) {
        window.funcnodes_return = obj;
      },
    });
  } else {
    const port = window.FN_WORKER_PORT || 9380;
    const managerurl = `ws://localhost:${port}`;
    FuncNodes("root", {
      workermanager_url: managerurl,
      load_worker: "demo",
      debug: debug,
      on_ready: function (obj) {
        window.funcnodes_return = obj;
      },
      // logger: new window.FuncNodes.utils.logger.DivLogger(
      //   loggerElement,
      //   "FuncNodes",
      //   "DEBUG"
      // ),
    });
  }
};
