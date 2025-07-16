window.onload = async function () {
  const port = window.FN_WORKER_PORT || 9380;
  const managerurl = `ws://localhost:${port}`;
  FuncNodes("root", {
    workermanager_url: managerurl,
    load_worker: "demo",
    on_ready: function (obj) {
      window.funcnodes_return = obj;
    },
  });
};
