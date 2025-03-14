import * as React from "react";
import { FuncNodesContext } from "../funcnodesreactflow";
import { NodeStore } from "../../states/node.t";
import { NodeName } from "./node";
import { pick_best_io_type } from "./io/io";
import { FuncNodesReactFlowZustandInterface } from "../../states/fnrfzst.t";

import { RenderMappingContext } from "../datarenderer/rendermappings";
import { SelectionInput } from "./io/default_input_renderer";
import { INPUTCONVERTER } from "./io/nodeinput";
import { RenderOptions } from "../../states/fnrfzst.t";

import { ExpandingContainer } from "../layout/components";
import { IOStore } from "../../states/nodeio.t";

const NodeSettingsInput = ({ iostore }: { iostore: IOStore }) => {
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
    INPUTCONVERTER[(otypestring && render.inputconverter?.[otypestring]) ?? ""];

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

const NodeSettingsOutput = ({ iostore }: { iostore: IOStore }) => {
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

const CurrentNodeSettings = ({ nodestore }: { nodestore: NodeStore }) => {
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
          <NodeSettingsInput iostore={node.io[ioname]} key={ioname} />
        ))}
      </div>
      <div className="nodesettings_section">
        <div>Outputs</div>
        {node.outputs.map((ioname) => (
          <NodeSettingsOutput iostore={node.io[ioname]} key={ioname} />
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
      maxSize="300px"
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

export default NodeSettings;
