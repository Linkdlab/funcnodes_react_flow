import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { FuncNodesReactFlowZustandInterface, latest } from "@/barrel_imports";
import { NodeName } from "@/nodes";

interface GeneralTabProps {
  node_data: latest.NodeType;
}

export const GeneralTab = ({ node_data }: GeneralTabProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
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
