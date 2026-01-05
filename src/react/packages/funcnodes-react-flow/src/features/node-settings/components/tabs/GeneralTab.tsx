import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { useNodeStore } from "@/nodes";
import { NodeName } from "@/nodes-components";
import { FuncNodesReactFlow } from "@/funcnodes-context";

interface GeneralTabProps {}

export const GeneralTab = ({}: GeneralTabProps) => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const nodestore = useNodeStore();
  const { description, id, node_id, node_name, reset_inputs_on_trigger } =
    nodestore.useShallow((state) => ({
      description: state.description,
      id: state.id,
      node_id: state.node_id,
      node_name: state.node_name,
      reset_inputs_on_trigger: state.reset_inputs_on_trigger,
    }));
  const [tempDescription, setTempDescription] = React.useState(
    description || ""
  );
  React.useEffect(() => setTempDescription(description || ""), [description]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setTempDescription(e.target.value);
  const saveDescription = () => {
    if (tempDescription !== (description || "")) {
      fnrf_zst.on_node_action({
        type: "update",
        from_remote: false,
        id: id,
        node: { description: tempDescription },
      });
    }
  };

  return (
    <div className="nodesettings-section funcnodes-control-group">
      <div className="funcnodes-control-row">
        <label htmlFor={`node-name-${id}`}>Name:</label>
        <NodeName />
      </div>
      <div className="funcnodes-control-row">
        <label>Instance ID:</label>
        <span>{id}</span>
      </div>
      <div className="funcnodes-control-row">
        <label>Node Type ID:</label>
        <span>{node_id}</span>
      </div>
      <div className="funcnodes-control-row">
        <label>Node Type Name:</label>
        <span>{node_name}</span>
      </div>
      <div className="funcnodes-control-row">
        <label htmlFor={`node-desc-${id}`}>Description:</label>
        <textarea
          id={`node-desc-${id}`}
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
          checked={reset_inputs_on_trigger}
          onChange={(e) => {
            fnrf_zst.on_node_action({
              type: "update",
              from_remote: false,
              id: id,
              node: { reset_inputs_on_trigger: e.target.checked },
            });
          }}
          className="styledcheckbox"
        />
      </div>
    </div>
  );
};
