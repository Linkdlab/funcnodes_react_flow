window.onload = async function () {
  const managerurl = "ws://localhost:9380";
  FuncNodes("root", {
    workermanager_url: managerurl,
    load_worker: "demo",
    on_ready: function (obj) {
      window.funcnodes_return = obj;
    },
  });
};
