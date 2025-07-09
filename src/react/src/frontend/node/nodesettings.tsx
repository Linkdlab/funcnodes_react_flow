import * as React from "react";
import { FuncNodesContext } from "../funcnodesreactflow";
import { NodeName } from "./node";
import { pick_best_io_type } from "./io/io";
import { FuncNodesReactFlowZustandInterface } from "../../states/fnrfzst.t";

import { RenderMappingContext } from "../datarenderer/rendermappings";

import { INPUTCONVERTER } from "./io/nodeinput";
import { RenderOptions } from "../../states/fnrfzst.t";

import { ExpandingContainer } from "../layout/components";
import { latest } from "../../types/versioned/versions.t";
import { SelectionInput } from "../datarenderer/default_input_renderer";
import CustomDialog from "../dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { deep_compare_objects } from "../../utils";

const NodeSettingsInput = ({ iostore }: { iostore: latest.IOStore }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    React.useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();
  const io = iostore.use();

  const [typestring, otypestring] = pick_best_io_type(
    io.render_options.type,
    render.typemap || {}
  );
  const { Inputrenderer } = React.useContext(RenderMappingContext);
  const Input = typestring
    ? io.value_options?.options
      ? SelectionInput
      : Inputrenderer[typestring]
    : undefined;

  const inputconverterf: [(v: any) => any, (v: any) => any] =
    INPUTCONVERTER[
      (otypestring && render.inputconverter?.[otypestring]) ?? ""
    ] || INPUTCONVERTER[""]!;

  return (
    <div className="nodesettings_component">
      <div>{io.name}</div>
      {Input && <Input iostore={iostore} inputconverter={inputconverterf} />}
      <div>
        <label>
          hidden:
          <input
            className="styledcheckbox"
            type="checkbox"
            disabled={io.connected}
            onChange={(e) => {
              io.set_hidden?.(e.target.checked);
            }}
            checked={io.hidden}
          ></input>
        </label>
      </div>
    </div>
  );
};

const NodeSettingsOutput = ({ iostore }: { iostore: latest.IOStore }) => {
  const io = iostore.use();
  return (
    <div className="nodesettings_component">
      <div>{io.name}</div>
      <div>
        <label>
          hidden:
          <input
            className="styledcheckbox"
            type="checkbox"
            disabled={io.connected}
            onChange={(e) => {
              io.set_hidden?.(e.target.checked);
            }}
            checked={io.hidden}
          ></input>
        </label>
      </div>
    </div>
  );
};

const CurrentNodeSettings = ({
  nodestore,
}: {
  nodestore: latest.NodeStore;
}) => {
  const node = nodestore.use();

  return (
    <div className="nodesettings_content">
      <div className="nodesettings_section">
        <div className="nodesettings_component">
          <div>Name</div>
          <div>
            <NodeName node_data={node} />
          </div>
        </div>
      </div>
      <div className="nodesettings_section">
        <div>Inputs</div>
        {node.inputs.map((ioname) => (
          <NodeSettingsInput iostore={node.io[ioname]!} key={ioname} />
        ))}
      </div>
      <div className="nodesettings_section">
        <div>Outputs</div>
        {node.outputs.map((ioname) => (
          <NodeSettingsOutput iostore={node.io[ioname]!} key={ioname} />
        ))}
      </div>
    </div>
  );
};

const CurrentNodeSettingsWrapper = () => {
  const fnrf_zst = React.useContext(FuncNodesContext);
  const selected_nodes = fnrf_zst.local_state((state) => state.selected_nodes);
  if (selected_nodes.length === 0) {
    return <div>Node Settings</div>;
  }
  if (selected_nodes.length > 1) {
    return <div>Multiple Nodes Selected</div>;
  }
  const nodestore = fnrf_zst.nodespace.get_node(selected_nodes[0]);
  if (!nodestore) {
    return <div>Node not found</div>;
  }

  return <CurrentNodeSettings nodestore={nodestore}></CurrentNodeSettings>;
};

const NodeSettings = () => {
  const fnrf_zst = React.useContext(FuncNodesContext);
  const expanded = fnrf_zst.local_settings(
    (state) => state.view_settings.expand_node_props
  );

  const update_view_settings = fnrf_zst.local_settings(
    (state) => state.update_view_settings
  );

  const set_expand_node_props = (expand: boolean) => {
    update_view_settings({ expand_node_props: expand });
  };

  return (
    <ExpandingContainer
      direction="left"
      expanded={expanded === undefined ? false : expanded}
      containerClassName={`pos-right pos-top bg1 h-12`}
      className="nodesettings_content"
      onExpandChange={set_expand_node_props}
    >
      <CurrentNodeSettingsWrapper></CurrentNodeSettingsWrapper>
    </ExpandingContainer>
  );
};
interface NodeIOSettingsProps {
  iostore: latest.IOStore;
}
const NodeIOSettings = ({ iostore }: NodeIOSettingsProps) => {
  const fnrf_zst = React.useContext(FuncNodesContext);
  const io = iostore.use();
  const renderOpts = fnrf_zst.render_options();

  // For editing name
  const [tempName, setTempName] = React.useState(io.name);
  React.useEffect(() => setTempName(io.name), [io.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTempName(e.target.value);
  const saveName = () => {
    if (tempName !== io.name) {
      fnrf_zst.worker?.update_io_options({
        nid: io.node,
        ioid: io.id,
        options: { name: tempName },
      });
    }
  };

  // For editing default value (inputs only)
  const [_typestring, otypestring] = pick_best_io_type(
    io.type,
    renderOpts.typemap || {}
  );
  const inputconverterf =
    INPUTCONVERTER[
      (otypestring && renderOpts.inputconverter?.[otypestring]) ?? ""
    ] || INPUTCONVERTER[""]!;

  const [tempDefaultDisplayValue, setTempDefaultDisplayValue] = React.useState(
    () => inputconverterf[1](io.default)
  );

  const { Inputrenderer } = React.useContext(RenderMappingContext);

  const Input = _typestring
    ? io.value_options?.options
      ? SelectionInput
      : Inputrenderer[_typestring]
    : undefined;

  React.useEffect(() => {
    setTempDefaultDisplayValue(inputconverterf[1](io.default));
  }, [io.default, inputconverterf]);

  return (
    <div className="nodesettings-io-entry funcnodes-control-group">
      <div className="funcnodes-control-row">
        <label htmlFor={`io-name-${io.id}`}>Name:</label>
        <input
          id={`io-name-${io.id}`}
          type="text"
          value={tempName}
          onChange={handleNameChange}
          onBlur={saveName}
          className="styledinput"
        />
      </div>
      <div className="funcnodes-control-row">
        <label>ID:</label>
        <span>{io.id}</span>
      </div>
      <div className="funcnodes-control-row">
        <label>Value:</label>
        {Input && <Input iostore={iostore} inputconverter={inputconverterf} />}
      </div>
      <div className="funcnodes-control-row">
        <label>Type:</label>
        <pre>{JSON.stringify(io.type, null, 2)}</pre>
      </div>
      <div className="funcnodes-control-row">
        <label htmlFor={`io-hidden-${io.id}`}>Hidden:</label>
        <input
          id={`io-hidden-${io.id}`}
          type="checkbox"
          checked={io.hidden}
          onChange={(e) => io.set_hidden(e.target.checked)}
          className="styledcheckbox"
          disabled={io.connected && io.is_input}
        />
      </div>
      <div className="funcnodes-control-row">
        <label>Value Options:</label>
        <pre>{JSON.stringify(io.value_options, null, 2)}</pre>
      </div>
      <div className="funcnodes-control-row">
        <label>Render Options:</label>
        <pre className="code-display">
          {JSON.stringify(io.render_options, null, 2)}
        </pre>
      </div>
      {io.is_input && (
        <>
          <div className="funcnodes-control-row">
            <label>Does Trigger:</label>
            <span>{String(io.does_trigger)}</span>
          </div>
          <div className="funcnodes-control-row">
            <label>Required:</label>
            <span>{String(io.required)}</span>
          </div>
        </>
      )}
      <div className="funcnodes-control-row">
        <label>Emit Value Set:</label>
        <span>{String(io.emit_value_set)}</span>
      </div>
      <hr />
    </div>
  );
};

const NodeSettingsGeneralTab = ({
  node_data,
}: {
  node_data: latest.NodeType;
}) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    React.useContext(FuncNodesContext);
  const [tempDescription, setTempDescription] = React.useState(
    node_data.description || ""
  );
  React.useEffect(
    () => setTempDescription(node_data.description || ""),
    [node_data.description]
  );

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setTempDescription(e.target.value);
  const saveDescription = () => {
    if (tempDescription !== (node_data.description || "")) {
      fnrf_zst.on_node_action({
        type: "update",
        from_remote: false,
        id: node_data.id,
        node: { description: tempDescription },
      });
    }
  };

  // const handleCollapsedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   fnrf_zst.on_node_action({
  //     type: "update",
  //     from_remote: false,
  //     id: node_data.id,
  //     node: { properties: { "frontend:collapsed": e.target.checked } },
  //   });
  // };

  return (
    <div className="nodesettings-section funcnodes-control-group">
      <div className="funcnodes-control-row">
        <label htmlFor={`node-name-${node_data.id}`}>Name:</label>
        <NodeName node_data={node_data} />
      </div>
      <div className="funcnodes-control-row">
        <label>Instance ID:</label>
        <span>{node_data.id}</span>
      </div>
      <div className="funcnodes-control-row">
        <label>Node Type ID:</label>
        <span>{node_data.node_id}</span>
      </div>
      <div className="funcnodes-control-row">
        <label>Node Type Name:</label>
        <span>{node_data.node_name}</span>
      </div>
      <div className="funcnodes-control-row">
        <label htmlFor={`node-desc-${node_data.id}`}>Description:</label>
        <textarea
          id={`node-desc-${node_data.id}`}
          value={tempDescription}
          onChange={handleDescriptionChange}
          onBlur={saveDescription}
          className="styledinput"
          rows={3}
        />
      </div>
      <div className="funcnodes-control-row">
        <label>Reset Inputs on Trigger:</label>
        <input
          type="checkbox"
          checked={node_data.reset_inputs_on_trigger}
          onChange={(e) => {
            fnrf_zst.on_node_action({
              type: "update",
              from_remote: false,
              id: node_data.id,
              node: { reset_inputs_on_trigger: e.target.checked },
            });
          }}
          className="styledcheckbox"
        />
      </div>
    </div>
  );
};

const NodeSettingsInputTab = ({
  node_data,
  splitnodesettingsPath = [],
}: {
  node_data: latest.NodeType;
  splitnodesettingsPath: string[];
}) => {
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || node_data.inputs[0]}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node inputs"
      >
        {node_data.inputs.map((inputID) => (
          <Tabs.Trigger
            key={inputID}
            value={inputID}
            className="nodesettings-tabs-trigger"
          >
            {inputID}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {node_data.inputs.map((inputID) => (
        <Tabs.Content
          key={inputID}
          value={inputID}
          className="nodesettings-tabs-content nodesettings-io-list"
        >
          {node_data.io[inputID] && (
            <NodeIOSettings iostore={node_data.io[inputID]!} />
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

const NodeSettingsOutputTab = ({
  node_data,
  splitnodesettingsPath = [],
}: {
  node_data: latest.NodeType;
  splitnodesettingsPath: string[];
}) => {
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || node_data.outputs[0]}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node outputs"
      >
        {node_data.outputs.map((outputID) => (
          <Tabs.Trigger
            key={outputID}
            value={outputID}
            className="nodesettings-tabs-trigger"
          >
            {outputID}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {node_data.outputs.map((outputID) => (
        <Tabs.Content
          key={outputID}
          value={outputID}
          className="nodesettings-tabs-content nodesettings-io-list"
        >
          {node_data.io[outputID] && (
            <NodeIOSettings iostore={node_data.io[outputID]!} />
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

const NodeSettingsWindow = ({
  node_data,
  nodeSettingsPath,
}: {
  node_data: latest.NodeType;
  nodeSettingsPath: string;
}) => {
  const splitnodesettingsPath = nodeSettingsPath.split("/") || ["general"];
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || "general"}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node settings"
      >
        <Tabs.Trigger value="general" className="nodesettings-tabs-trigger">
          General
        </Tabs.Trigger>
        <Tabs.Trigger value="inputs" className="nodesettings-tabs-trigger">
          Inputs
        </Tabs.Trigger>
        <Tabs.Trigger value="outputs" className="nodesettings-tabs-trigger">
          Outputs
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="general" className="nodesettings-tabs-content">
        <NodeSettingsGeneralTab node_data={node_data}></NodeSettingsGeneralTab>
      </Tabs.Content>

      <Tabs.Content
        value="inputs"
        className="nodesettings-tabs-content nodesettings-io-list"
      >
        <NodeSettingsInputTab
          node_data={node_data}
          splitnodesettingsPath={
            // all but first element
            splitnodesettingsPath.slice(1)
          }
        />
      </Tabs.Content>

      <Tabs.Content
        value="outputs"
        className="nodesettings-tabs-content nodesettings-io-list"
      >
        <NodeSettingsOutputTab
          node_data={node_data}
          splitnodesettingsPath={
            // all but first element
            splitnodesettingsPath.slice(1)
          }
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};
const NodeSettingsOverlay = ({
  node_data,
  isOpen,
  onOpenChange,
  nodeSettingsPath,
}: {
  node_data: latest.NodeType;
  nodeSettingsPath: string;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return (
    <CustomDialog
      title={`Node Settings: ${node_data.id}`}
      open={isOpen}
      onOpenChange={onOpenChange}
      dialogClassName="nodesettings-dialog"
    >
      <NodeSettingsWindow
        node_data={node_data}
        nodeSettingsPath={nodeSettingsPath}
      />
    </CustomDialog>
  );
};

export default NodeSettings;
export { NodeSettingsOverlay };
