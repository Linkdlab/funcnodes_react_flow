import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
  collapseAllNested,
} from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
const JSONDataDisplay = ({ data }: { data: any }) => {
  return (
    <JsonView
      data={data}
      style={darkStyles}
      shouldExpandNode={collapseAllNested}
    />
  );
};

export default JSONDataDisplay;
