import * as React from "react";
import { JsonView, darkStyles, collapseAllNested } from "react-json-view-lite";
import "./jsonDisplay.scss";

function isEmpty(obj: any) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function isEmptyObject(value: any) {
  if (value == null) {
    // null or undefined
    return false;
  }

  if (typeof value !== "object") {
    // boolean, number, string, function, etc.
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  // consider `Object.create(null)`, commonly used as a safe map
  // before `Map` support, an empty object as well as `{}`
  if (proto !== null && proto !== Object.prototype) {
    return false;
  }

  return isEmpty(value);
}

export interface JSONDisplayProps {
  data: any;
  className?: string;
}

export const JSONDisplay: React.FC<JSONDisplayProps> = ({
  data,
  className = "json-display",
}) => {
  return (
    <div className={className}>
      <JsonView
        data={isEmptyObject(data) ? "" : data}
        style={darkStyles}
        shouldExpandNode={collapseAllNested}
      />
    </div>
  );
};
