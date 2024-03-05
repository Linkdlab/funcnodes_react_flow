import Plot from "react-plotly.js";
import { BaseRenderOptions } from ".";

interface PlotlyRenderOptions extends BaseRenderOptions {
  plottype?: "line" | "scatter" | "imshow";
  layout?: any;
  colorscale?: string;
}
const AnyPlot = ({
  value,
  renderoptions,
}: {
  value: any;
  renderoptions?: PlotlyRenderOptions;
}) => {
  if (renderoptions === undefined) {
    renderoptions = {};
  }
  if (value === undefined) {
    return <></>;
  }

  renderoptions.plottype = renderoptions.plottype || "line";

  const data: Plotly.Data[] = [];
  const layout: Partial<Plotly.Layout> = renderoptions.layout || {};

  // tight layout
  layout.margin = { t: 50, r: 50, l: 50, b: 50 };

  if (renderoptions.plottype === "imshow") {
    // check if value is a 2D array
    if (!Array.isArray(value) || !Array.isArray(value[0])) {
      console.error("imshow plottype requires a 2D array");
      return <></>;
    }
    // if is 3data, aassume rgb
    if (Array.isArray(value[0][0])) {
      //check image colorchannel
      if (renderoptions?.colorscale === "bgr") {
        value = value.map((row: any) =>
          row.map((pixel: any) => [pixel[2], pixel[1], pixel[0]])
        );
      }
      data.push({
        z: value,
        type: "image",
        colorscale: "rgb",
      });
      // disable axis
      layout.xaxis = { visible: false };
      layout.yaxis = { visible: false };
      layout.margin = { t: 0, r: 0, l: 0, b: 0 };
    } else {
      data.push({
        z: value,
        type: "heatmap",
        colorscale: renderoptions?.colorscale || "Viridis",
      });
    }
  }

  // auto resize
  layout.autosize = true;

  return (
    <div
      style={{ minWidth: 300, maxHeight: 300, maxWidth: 300, minHeight: 300 }}
    >
      <Plot
        data={data}
        layout={layout}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export {};
export default AnyPlot;
export type { PlotlyRenderOptions };
