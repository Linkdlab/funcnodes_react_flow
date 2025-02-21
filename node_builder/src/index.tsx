import * as React from "react";
import { create, StoreApi, UseBoundStore } from "zustand";

declare global {
  interface Window {
    loadPyodide?: () => Promise<any>;
    ace?: any;
  }
}

import ReactDOM from "react-dom/client";
import {
  FuncNodesContext,
  FuncNodesReactFlowZustand,
  PartialNodeType,
  assert_full_node,
  ReactFlowLayer,
  deep_update,
  RenderMappingProvider,
} from "@linkdlab/funcnodes_react_flow";
import "reactflow/dist/style.css";
import "@linkdlab/funcnodes_react_flow/dist/style.css";

const NodeRenderer = ({
  state,
}: {
  state: UseBoundStore<StoreApi<NodeBuilderOptions>>;
}) => {
  const node = state((s) => s.ser_node);

  const fullnode = node && assert_full_node(node);
  const fnrf_zst = FuncNodesReactFlowZustand({
    useWorkerManager: false,
  });

  if (fullnode)
    fnrf_zst.on_node_action({
      type: "add",
      node: fullnode,
      id: fullnode.id,
      from_remote: true,
    });

  const plugins = fnrf_zst.plugins();
  return (
    <RenderMappingProvider plugins={plugins} fnrf_zst={fnrf_zst}>
      <FuncNodesContext.Provider value={fnrf_zst}>
        <div className="funcnodesreactflowcontainer">
          <div className="funcnodesreactflowbody">
            <ReactFlowLayer
              minimap={false}
              static={true}
              minZoom={1}
              maxZoom={4}
            ></ReactFlowLayer>
          </div>
        </div>
      </FuncNodesContext.Provider>
    </RenderMappingProvider>
  );
};

const scriptLoaders: Record<string, Promise<void>> = {}; // Global script tracker

const _insert_script = (src?: string, code?: string): Promise<void> => {
  if (src) {
    // If script is already loading, return its Promise
    if (scriptLoaders[src] !== undefined) {
      return scriptLoaders[src];
    }

    scriptLoaders[src] = new Promise<void>((resolve, reject) => {
      // Check if script is already in the document
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log(`Script ${src} already loaded`);
        return resolve(); // Resolve immediately
      }

      // Create and append script
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        console.log(`Script ${src} loaded`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };
      document.body.appendChild(script);
    });

    return scriptLoaders[src]; // Store and return the Promise
  } else if (code) {
    return new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.innerHTML = code;
      document.body.appendChild(script);
      resolve();
    });
  }

  return Promise.resolve();
};

const PyEditor = ({
  state,
}: {
  state: UseBoundStore<StoreApi<NodeBuilderOptions>>;
}) => {
  const [initiated, setInitiated] = React.useState(false);
  const pyodide = state((s) => s.pyiodide);
  const pycode = state((s) => s.python_code);
  const ref = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // first we need to check if pyodide is already loaded or not

    const _run = async () => {
      if (!pyodide) return;
      await pyodide.loadPackage("micropip");
      const micropip = pyodide.pyimport("micropip");
      await micropip.install("funcnodes_core");
      pyodide.runPython(`
        import funcnodes_core
        import sys
        sys.modules['funcnodes'] = funcnodes_core
        `);
      setInitiated(true);
      if (pycode) {
        _exec(pycode);
      }
    };

    const _check = async () => {
      if (pyodide) {
        // if already loaded, we can directly use it
        await _run();
      } else {
        console.log("loading pyodide");
        if (!window.loadPyodide) {
          await _insert_script(
            "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
          );
        }
        console.log("pyodide script loaded");
        if (!window.loadPyodide) {
          throw new Error("Pyodide not loaded");
        }
        const _p = await window.loadPyodide();
        if (!_p) {
          throw new Error("Pyodide not loaded");
        }
        console.log("pyodide loaded");
        state.setState({ pyiodide: _p });
      }
    };
    _check();
  }, [pyodide]);

  React.useEffect(() => {
    const _run = async () => {
      if (!window.ace) {
        console.log("loading ace");
        await _insert_script(
          "https://cdnjs.cloudflare.com/ajax/libs/ace/1.37.0/ace.min.js"
        );

        if (!window.ace) {
          throw new Error("Ace editor not loaded");
        }
      }

      if (ref.current && !editorRef.current) {
        // Initialize once
        const editor = window.ace.edit(ref.current);
        editorRef.current = editor;

        // Set Ace Editor Configurations
        editor.setTheme("ace/theme/monokai"); // Choose a theme
        editor.session.setMode("ace/mode/python"); // Set Python mode
        editor.setValue(pycode || "", 1); // Load initial code
        editor.setOptions({
          fontSize: "14px",
          showPrintMargin: false,
          wrap: true,
        });

        // Handle change event
        editor.session.on("change", () => {
          const newCode = editor.getValue();
          state.setState({ python_code: newCode });
          _exec(newCode);
        });

        // Listen for changes without triggering re-render
        editor.session.on("change", () => {
          const newCode = editor.getValue();
          state.setState({ python_code: newCode }); // Update state but don't re-render component
          _exec(newCode);
        });
      }
    };
    _run();
  }, []); // No dependencies to ensure it only runs once after mount

  const _exec = async (text: string) => {
    const code = `
import sys
import inspect
import funcnodes as fn
import json
fn.node.ALLOW_REGISTERED_NODES_OVERRIDE = True

${text}

nodeclass = None
for name, obj in inspect.getmembers(sys.modules[__name__]):
    if inspect.isclass(obj):
        if issubclass(obj, fn.Node):
            nodeclass = obj


try:
    global serialized
    node = nodeclass()
    serialized = node.full_serialize(with_io_values=True)  # fn.JSONEncoder.apply_custom_encoding(node, preview=False)
except Exception as e:
    raise e
del node
del nodeclass
    `;

    const _p = state.getState().pyiodide;

    if (!_p) return;

    try {
      await _p.runPythonAsync(code);
      const serialized = _p.globals.toJs({
        dict_converter: Object.fromEntries,
      }).serialized;
      if (serialized !== state.getState().ser_node) {
        state.setState({ ser_node: serialized });
      }
      setError(null);
      return serialized;
    } catch (e: any) {
      setError(e.toString());
    }
  };

  if (!initiated) {
    console.log("loading pyodide");
    if (editorRef.current) {
      // @ts-ignore
      editorRef.current.setOption("readOnly", true);
    }
  } else {
    if (editorRef.current) {
      // @ts-ignore
      editorRef.current.setOption("readOnly", false);
    }
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div ref={ref} style={{ flexGrow: 1 }}></div>
      <code style={{ maxHeight: "20%", overflow: "auto" }}>{error}</code>
    </div>
  );
};

// const JSonEditor = ({
//   state,
// }: {
//   state: UseBoundStore<StoreApi<NodeBuilderOptions>>;
// }) => {
//   const data = state((s) => s.ser_node);
//   const usepyed = state((s) => s.show_python_editor);
//   const has_pyed = state((s) => s.python_code);
//   const use_pyed = usepyed || (has_pyed !== undefined && has_pyed !== null);

//   const change = (e: any) => {
//     if (use_pyed) return;
//     try {
//       const parsed = JSON.parse(e.target.value);
//       state.setState({ ser_node: parsed });
//     } catch (e) {}
//   };
//   return (
//     <textarea onChange={change} disabled={use_pyed}>
//       {JSON.stringify(data, null, 2)}
//     </textarea>
//   );
// };

const InnerNodeBuilder = ({
  state,
}: {
  state: UseBoundStore<StoreApi<NodeBuilderOptions>>;
}) => {
  // const [activeTab, setActiveTab] = React.useState<
  //   "pyeditor" | "jsoneditor" | "renderer"
  // >("pyeditor");

  // const show_python_editor = state((s) => s.show_python_editor);
  // const show_ser_node_editor = state((s) => s.show_ser_node_editor);
  const nodeview = state((s) => s.nodeview);
  const editorview = state((s) => s.editorview);
  const [hideEditor, setHideEditor] = React.useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ height: nodeview.height, width: nodeview.width }}>
        <NodeRenderer state={state} />
      </div>
      <div style={{ display: "table" }}>
        <div
          style={{
            height: nodeview.height,
            width: "10px",
            cursor: "ew-resize",
            backgroundColor: "gray",
            color: "white",
            textAlign: "center",
            display: "table-cell",
            verticalAlign: "middle",
          }}
          onClick={() => {
            setHideEditor(!hideEditor);
          }}
        >
          {hideEditor ? ">" : "<"}
        </div>
      </div>
      <div
        style={{
          height: nodeview.height,
          width: hideEditor ? "0" : editorview.width,
          transition: "width 0.5s",
        }}
      >
        <PyEditor state={state} />
      </div>
    </div>
  );
};

interface NodeBuilderOptions {
  ser_node?: PartialNodeType;
  python_code?: string;
  show_python_editor: boolean;
  show_ser_node_editor: boolean;
  pyiodide?: any;
  nodeview: {
    height: string;
    width: string;
  };
  editorview: {
    width: string;
  };
}
const NodeBuilder = (element: HTMLElement, options?: NodeBuilderOptions) => {
  const default_options: NodeBuilderOptions = {
    ser_node: undefined,
    python_code: undefined,
    show_python_editor: true,
    show_ser_node_editor: false,
    nodeview: {
      height: "300px",
      width: "250px",
    },
    editorview: {
      width: "300px",
    },
  };
  const { new_obj } = deep_update(options || default_options, default_options);

  if (!new_obj.ser_node && !new_obj.python_code) {
    if (new_obj.show_python_editor) {
      new_obj.python_code = `@fn.NodeDecorator(node_id="testnode")
def test(a:int)->int:
  pass
  `;
    }
  }

  console.log(new_obj);

  const zustand = create<NodeBuilderOptions>(() => ({
    ...new_obj,
  }));

  ReactDOM.createRoot(element).render(
    <React.StrictMode>
      <InnerNodeBuilder state={zustand} />
    </React.StrictMode>
  );
};

// @ts-ignore
window.NodeBuilder = NodeBuilder;

export default NodeBuilder;
