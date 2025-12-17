function getParam(name) {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  } catch (e) {
    return null;
  }
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

async function fetch_wm() {
  res = await fetch("/worker_manager", {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.text();
}

async function fetch_worker() {
  res = await fetch("/worker", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return await res.json();
}
async function get_fn_options() {
  options = {};
  const worker_url = getParam("worker_url");
  let worker_manager_url = getParam("worker_manager_url");

  options.useWorkerManager = worker_url == null;
  if (options.useWorkerManager) {
    if (worker_manager_url == null) {
      try {
        worker_manager_url = await fetch_wm();
        options.workermanager_url = worker_manager_url;
      } catch (e) {
        try {
          const worker = await fetch_worker();
          options.worker_url = `ws${worker.ssl ? "s" : ""}://${worker.host}:${
            worker.port
          }`;
          options.useWorkerManager = false;
        } catch (e) {
          throw new Error("Failed to fetch worker or worker manager");
        }
      }
    }
  } else {
    options.worker_url = worker_url;
  }
  return options;
}
window.onload = async function () {
  const _init_fn = async () => {
    const options = await get_fn_options();
    FuncNodes("root", options);
  };

  const ini_fn = async () => {
    while (true) {
      try {
        await _init_fn();
        break;
      } catch (e) {
        console.log(e);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  };

  ini_fn();
};
