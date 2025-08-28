window.onload = async function () {
  const _init_wm = async () => {
    res = await fetch("/worker_manager", {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
      },
    });
    // cehck 2xx status
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const managerurl = await res.text();
    FuncNodes("root", {
      workermanager_url: managerurl,
    });
  };

  const ini_wm = async () => {
    while (true) {
      try {
        await _init_wm();
        break;
      } catch (e) {
        console.log(e);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  };

  ini_wm();
};
