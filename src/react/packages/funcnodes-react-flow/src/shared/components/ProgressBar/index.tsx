import * as React from "react";
import { useEffect, useRef } from "react";
import { fitTextToContainer } from "@/utils/layout";
import "./progressBar.scss";
import { DeepPartial } from "@/object-helpers";

/**
 * Interface representing the state of a tqdm progress bar.
 *
 * Notes on each field:
 * - `n`: Current iteration count.
 * - `total`: Total number of iterations if known, `null` otherwise.
 * - `elapsed`: Time elapsed in seconds since the start of iteration.
 * - `ncols`: Number of columns for the progress bar. If `null`, not dynamically determined.
 * - `nrows`: Number of rows. Usually `null` as `tqdm` typically focuses on columns.
 * - `prefix`: Description string provided to `tqdm` via `desc`.
 * - `ascii`: Whether to use ASCII characters for the bar or a custom set of ASCII characters.
 *            Can be `true`, `false`, or a string specifying the characters.
 * - `unit`: Iteration unit (e.g., 'it', 'steps', 'items').
 * - `unit_scale`: If `true`, `tqdm` scales the iteration values.
 *                If a number, `tqdm` uses it as a scaling factor.
 * - `rate`: Current rate of iteration (iterations/second). `null` if rate cannot be computed.
 * - `bar_format`: Custom format string for the bar. If `null`, the default format is used.
 * - `postfix`: Additional data appended to the bar. Could be a string or an object passed via `set_postfix()`.
 * - `unit_divisor`: Divisor used when scaling units (e.g., 1000 or 1024).
 * - `initial`: Initial counter value if specified, else `null`.
 * - `colour`: Colour for the progress bar if supported, else `null`.
 */
export interface TqdmState {
  n: number;
  total?: number;
  elapsed: number;
  ncols?: number;
  nrows?: number;
  prefix?: string;
  ascii: boolean | string;
  unit: string;
  unit_scale: boolean | number;
  rate?: number;
  bar_format?: string;
  postfix?: string | Record<string, unknown>;
  unit_divisor: number;
  initial?: number;
  colour?: string;
}

export interface ProgressBarProps {
  state: DeepPartial<TqdmState>; // Progress bar state
  className?: string; // Custom className, defaults to "reacttqdm"
}

function formatMeter(
  options: DeepPartial<TqdmState> = {
    n: 0,
    elapsed: 0,
    ascii: false,
    unit: "it",
    unit_scale: false,
    unit_divisor: 1000,
  }
): string {
  let total = options.total ?? null;

  const {
    n = 0,
    unit_scale = false,
    elapsed = 0,
    // ascii,
    unit = "it",
    unit_divisor = 1000,
    // ncols = undefined,
    prefix = "",
    rate = undefined,
    // bar_format = undefined,
    postfix = null,
    initial = 0,
    // colour = undefined,
  } = options;

  if (total !== null && n >= total + 0.5) {
    total = null;
  }

  let scaledN = n;
  let scaledTotal = total;
  let scaledRate = rate;

  if (unit_scale && unit_scale !== true && unit_scale !== 1) {
    if (total !== null) {
      scaledTotal = total * unit_scale;
    }
    scaledN = n * unit_scale;
    if (rate !== undefined) {
      scaledRate = rate * unit_scale;
    }
  }

  const elapsedStr = formatInterval(elapsed);

  if (scaledRate === undefined && elapsed > 0) {
    scaledRate = (scaledN - initial) / elapsed;
  }

  const invRate = scaledRate ? 1 / scaledRate : undefined;

  const [rateval, ratescale] = scaledRate
    ? formatSize(scaledRate, unit_divisor)
    : [undefined, ""];
  const [invrateval, invratescale] = invRate
    ? formatSize(invRate, 1000)
    : [undefined, ""];

  const rateNoInvFmt = (rateval ? rateval : "?") + `${ratescale}${unit}/s`;
  const rateInvFmt = invrateval ? `${invrateval}${invratescale}s/` + unit : "?";
  const rateFmt = invRate && invRate > 1 ? rateInvFmt : rateNoInvFmt;

  const nFmt = unit_scale
    ? formatSize(scaledN, unit_divisor).join("")
    : scaledN.toString();
  const totalFmt =
    unit_scale && scaledTotal !== null
      ? formatSize(scaledTotal, unit_divisor).join("")
      : scaledTotal?.toString() ?? "?";

  const remaining =
    scaledRate && scaledTotal !== null
      ? (scaledTotal - scaledN) / scaledRate
      : 0;
  const remainingStr = scaledRate ? formatInterval(remaining) : "?";

  const lBar = prefix ? `${prefix}: ` : "";

  if (total !== null) {
    const percentage = (scaledN / total) * 100;
    const rBar = ` ${nFmt}/${totalFmt} [${elapsedStr} < ${remainingStr}, ${rateFmt}${
      postfix ?? ""
    }]`;

    // const progressBar = createProgressBar(scaledN / total, ncols);
    return `${lBar}${percentage.toFixed(0)}%${rBar}`;
  }

  return `${lBar}${nFmt}${unit} [${elapsedStr}, ${rateFmt}${postfix ?? ""}]`;
}

function formatInterval(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatSize(value: number, divisor: number): [string, string] {
  const units = ["", "K", "M", "G", "T"];
  let unitIndex = 0;
  while (value >= divisor && unitIndex < units.length - 1) {
    value /= divisor;
    unitIndex++;
  }
  return [value.toFixed(2), units[unitIndex]];
}

export const ProgressBar: React.FC<
  ProgressBarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ state, className = "reacttqdm", ...rest }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textcontainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !textcontainerRef.current) return;
      fitTextToContainer(containerRef.current, textcontainerRef.current, {
        maxFontSize: 12,
        decrementFactor: 0.9,
      });
    };

    handleResize(); // Initial calculation
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [state]);

  const progressPercentage = state.total
    ? ((state.n ?? 0) / state.total) * 100
    : 0;

  return (
    <div ref={containerRef} className={className} {...rest}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Progress bar */}
        <div
          className={className + "-bar"}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%", // Adjust height if needed
            overflow: "hidden",
          }}
        >
          <div
            className={className + "-progress"}
            style={{
              width: `${progressPercentage}%`,
              height: "100%",
            }}
          ></div>
        </div>
        <div className={className + "-text"} ref={textcontainerRef}>
          {formatMeter(state)}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
