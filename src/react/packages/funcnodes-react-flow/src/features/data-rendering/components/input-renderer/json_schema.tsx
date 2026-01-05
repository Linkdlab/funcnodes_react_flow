import * as React from "react";
import { InputRendererProps } from "./types";
import { useIOStore } from "@/nodes";
import { useIOGetFullValue, useSetIOValue } from "@/nodes-io-hooks";
import { CustomDialog } from "@/shared-components";
import {
  JsonSchemaForm,
  SchemaResponse,
} from "@/shared-components/jsonSchemaForm";
import { JSONStructure } from "@/data-structures";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

const make_schema_response = ({
  jsonSchema,
  uiSchema,
  full,
  readonly,
}: {
  jsonSchema: RJSFSchema;
  uiSchema?: UiSchema;
  full?: JSONStructure;
  readonly?: boolean;
}): SchemaResponse => {
  const obj = {
    jsonSchema,
    uiSchema,
    formData: {},
  };

  if (readonly) {
    obj.uiSchema = {
      ...obj.uiSchema,
      "ui:readonly": true,
      "ui:disabled": true,
      "ui:submitButtonOptions": {
        norender: true,
        props: {
          disabled: readonly,
          className: "btn btn-info",
        },
      },
    };
  }

  const full_value = full?.value;
  if (!full_value) {
    return obj;
  }

  if (
    typeof full_value === "object" &&
    full_value !== null &&
    "schema" in full_value &&
    "data" in full_value
  ) {
    obj.jsonSchema = full_value.schema as RJSFSchema;
    obj.formData = full_value.data ?? {};
  } else {
    obj.formData = full_value;
  }
  return obj;
};

export const JsonSchemaInput = ({ inputconverter }: InputRendererProps) => {
  void inputconverter;
  const iostore = useIOStore();
  const { preview, full } = iostore.valuestore();
  const io = iostore.use();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const get_full_value = useIOGetFullValue();
  const set_io_value = useSetIOValue(io);
  const jsonSchema = io.render_options.schema;
  const uiSchema = io.render_options.uiSchema;
  const schemaResponse = React.useMemo(() => {
    if (!jsonSchema) {
      throw new Error("No jsonSchema provided");
    }
    return make_schema_response({
      jsonSchema,
      uiSchema,
      full: full as JSONStructure | undefined,
      readonly: io.connected,
    });
  }, [jsonSchema, uiSchema, full, preview, io.connected]);

  const getter = React.useCallback(
    async () => schemaResponse,
    [schemaResponse]
  );

  const setter = React.useCallback(
    async (formData: any) => {
      set_io_value(formData);
      setDialogOpen(false);
    },
    [set_io_value]
  );

  return (
    <CustomDialog
      title={io.name}
      description={"Edit " + io.name}
      open={dialogOpen}
      setOpen={setDialogOpen}
      trigger={<button className="nodedatainput styledinput">Edit</button>}
      onOpenChange={(open: boolean) => {
        // Only fetch full value if not already available
        if (open && !full) {
          get_full_value?.();
        }
      }}
    >
      <JsonSchemaForm
        getter={getter}
        setter={setter}
        setter_calls_getter={false}
        disabled={io.connected}
        readonly={io.connected}
      />
    </CustomDialog>
  );
};
