import { useCallback, useState, useEffect } from "react";

import { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import * as React from "react";

import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { createTheme, ThemeProvider } from "@mui/material";

const Form = withTheme(Theme);

const theme = createTheme({
  cssVariables: { nativeColor: true },
  palette: {
    primary: {
      main: "var(--fn-primary-color)",
      contrastText: "var(--fn-app-background)",
    },
    text: {
      primary: "var(--fn-text-color-neutral)",
      secondary: "var(--fn-text-color-neutral)",
      disabled: "var(--fn-text-color-neutral)",
      primaryChannel: "var(--fn-text-color-neutral-channel)",
      secondaryChannel: "var(--fn-text-color-neutral-channel)",
    },
    common: {
      black: "var(--fn-primary-color)",
      white: "var(--fn-app-background)",
    },
    background: {
      default: "var(--fn-app-background)",
      paper: "var(--fn-app-background)",
      defaultChannel: "var(--fn-app-background-channel)",
      paperChannel: "var(--fn-app-background-channel)",
    },
  },
  shape: {
    borderRadius: "var(--fn-border-radius-s)",
  },
});

export type SchemaResponse = {
  jsonSchema: RJSFSchema;
  uiSchema?: UiSchema;
  formData?: any;
};

interface JsonSchemaFormProps {
  disabled?: boolean;
  readonly?: boolean;
  getter: () => Promise<SchemaResponse>;
  setter: (formData: any) => Promise<any>;
  setter_calls_getter?: boolean;
}
export const JsonSchemaForm = ({
  getter,
  setter,
  setter_calls_getter = false,
  disabled = false,
  readonly = false,
}: JsonSchemaFormProps) => {
  const [schema, setSchema] = useState<any>(null);
  const [uiSchema, setUiSchema] = useState<any>(undefined);
  const [formData, setFormData] = useState<any>(undefined);

  const fetch_schema = useCallback(async () => {
    const schemaResponse = await getter();
    setSchema(schemaResponse.jsonSchema);
    setUiSchema(schemaResponse.uiSchema);
    setFormData(schemaResponse.formData);
  }, [getter]);

  const _inner_setter = useCallback(
    async (formData: any) => {
      await setter(formData);
      if (setter_calls_getter) {
        await fetch_schema();
      }
    },
    [setter, setter_calls_getter, fetch_schema]
  );

  useEffect(() => {
    fetch_schema();
  }, [fetch_schema]);
  if (!schema) return <div>Loading…</div>;
  return (
    <ThemeProvider theme={theme}>
      <Form
        schema={schema}
        uiSchema={uiSchema || undefined}
        formData={formData || undefined}
        validator={validator}
        liveValidate={"onChange"}
        onChange={({ formData }) => setFormData(formData)}
        onSubmit={({ formData }) => _inner_setter(formData)}
        disabled={disabled}
        readonly={readonly}
      />
    </ThemeProvider>
  );
};
