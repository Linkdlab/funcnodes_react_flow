import * as React from "react";

interface ErrorDivProps {
  error: Error;
}

export const ErrorDiv: React.FC<ErrorDivProps> = ({ error }) => {
  return (
    <div className="error-div">
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
};
