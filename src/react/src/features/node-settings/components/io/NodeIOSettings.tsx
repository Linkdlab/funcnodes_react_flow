import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import {
  pick_best_io_type,
  RenderMappingContext,
  INPUTCONVERTER,
  latest,
  SelectionInput,
} from "@/barrel_imports";

interface NodeIOSettingsProps {
  iostore: latest.IOStore;
}

export const NodeIOSettings = ({ iostore }: NodeIOSettingsProps) => {
  const fnrf_zst = useFuncNodesContext();
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

  const { Inputrenderer } = React.useContext(RenderMappingContext);

  const Input = _typestring
    ? io.value_options?.options
      ? SelectionInput
      : Inputrenderer[_typestring]
    : undefined;

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
