import * as React from "react";
import { InputRendererProps } from "./types";
import * as Slider from "@radix-ui/react-slider";
import { useIOStore } from "@/nodes";
import { useSetIOValue } from "@/nodes-io-hooks";

function relativeRound(value: number) {
  if (value === 0) return 0;
  const absValue = Math.abs(value);
  // Do not round extremely small numbers.
  if (absValue < 1e-12) return value;
  return Number(value.toPrecision(12));
}

export const NumberInput = ({
  inputconverter,
  parser = (n: string) => parseFloat(n),
}: InputRendererProps & {
  parser: (n: string) => number;
}) => {
  const iostore = useIOStore();
  const { preview } = iostore.valuestore();
  const io = iostore.use();
  const set_io_value = useSetIOValue(io);
  const [tempvalue, setTempValue] = React.useState(
    inputconverter[1](preview?.value)
  );

  React.useEffect(() => {
    setTempValue(inputconverter[1](preview?.value));
  }, [preview]);

  const set_new_value = React.useCallback(
    (new_value: number | string) => {
      new_value = parser(
        parseFloat(new_value.toString()).toString() // parse float first for e notation
      );

      if (isNaN(new_value)) {
        new_value = "<NoValue>";
        setTempValue("");
      } else {
        if (
          io.value_options?.min !== undefined &&
          new_value < io.value_options.min
        )
          new_value = io.value_options.min;
        if (
          io.value_options?.max !== undefined &&
          new_value > io.value_options.max
        )
          new_value = io.value_options.max;
        new_value = relativeRound(new_value);
        setTempValue(new_value.toString());
      }
      try {
        new_value = inputconverter[0](new_value);
      } catch (e) {}

      if (new_value === preview?.value) return; // no change

      set_io_value(new_value);
    },
    [io, inputconverter, set_io_value]
  );

  const on_change = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      set_new_value(e.target.value);
    },
    [set_new_value]
  );
  let v = io.connected ? inputconverter[1](preview?.value) : tempvalue;
  if (v === undefined) v = io.value_options?.min;
  if (v === undefined) v = io.value_options?.max;
  if (v === undefined) v = "";
  if (v === null) v = "";

  let add_input: React.ReactNode = null;
  let step = 1;
  if (io.value_options?.step !== undefined) {
    step = io.value_options.step;
  } else if (
    io.value_options?.max !== undefined &&
    io.value_options?.min !== undefined
  ) {
    step = (io.value_options?.max - io.value_options?.min) / 1000;
  }

  if (
    io.value_options?.max !== undefined &&
    io.value_options?.min !== undefined &&
    !io.connected
  ) {
    add_input = (
      <div style={{ minWidth: "6.25rem" }} className="SliderContainer">
        <Slider.Root
          className="SliderRoot"
          value={[v === undefined ? io.value_options?.min : v]}
          min={io.value_options?.min}
          max={io.value_options?.max}
          step={step}
          disabled={io.connected}
          onValueCommit={(value) => {
            if (isNaN(value[0])) return;
            set_new_value(value[0]);
          }}
          onValueChange={(value) => {
            if (isNaN(value[0])) return;
            setTempValue(value[0].toString());
          }}
          onKeyDown={(event) => {
            // Optionally, you can restrict this to arrow keys only:
            if (
              ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
                event.key
              )
            ) {
              event.stopPropagation();
            }
          }}
        >
          <Slider.Track className="SliderTrack">
            <Slider.Range className="SliderRange" />
          </Slider.Track>
          {/* <ToolTip.TooltipProvider>
              <ToolTip.Root open>
                <ToolTip.Trigger asChild> */}
          <Slider.Thumb className="SliderThumb" />
          {/* </ToolTip.Trigger>
                <ToolTip.Content className="SliderTooltipContent">
                  {v}
                </ToolTip.Content>
              </ToolTip.Root>
            </ToolTip.TooltipProvider> */}
        </Slider.Root>
      </div>
    );
  }
  return (
    <>
      {add_input}
      <input
        type="text"
        className="nodedatainput styledinput numberinput"
        value={v}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={on_change}
        step={step}
        onKeyDown={(e) => {
          // on key up add step to value
          if (e.ctrlKey || e.metaKey) {
            return;
          }
          if (e.key === "ArrowUp") {
            if (e.shiftKey) step *= 10;

            let new_value = (parseFloat(v) || 0) + step;
            // setTempValue(new_value.toString());
            set_new_value(new_value);
            return;
          }

          // on key down subtract step to value
          if (e.key === "ArrowDown") {
            if (e.shiftKey) step *= 10;
            let new_value = (parseFloat(v) || 0) - step;
            // setTempValue(new_value.toString());
            set_new_value(new_value);
            return;
          }

          //accept only numbers
          if (
            !/^[0-9.eE+-]$/.test(e.key) &&
            !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(
              e.key
            )
          ) {
            e.preventDefault();
          }
        }}
        disabled={io.connected}
        min={io.value_options?.min}
        max={io.value_options?.max}
      />
    </>
  );
};

export const FloatInput = ({ inputconverter }: InputRendererProps) => {
  return NumberInput({ inputconverter, parser: parseFloat });
};

export const IntegerInput = ({ inputconverter }: InputRendererProps) => {
  return NumberInput({ inputconverter, parser: parseInt });
};
